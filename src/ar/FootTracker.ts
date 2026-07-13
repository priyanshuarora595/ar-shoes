import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { FootPose } from '../types/product';

export class FootTracker {
  private landmarker: PoseLandmarker | null = null;
  private isInitializing: boolean = false;
  
  // Offscreen canvas to inject mock torso
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;
  private readonly splitY = 240; // Split height of 640x480 canvas

  // Debug callback for UI updates
  public onDebugUpdate?: (
    canvas: HTMLCanvasElement,
    rawLandmarks: any,
    confidence: number
  ) => void;

  /**
   * Initializes the MediaPipe Pose Landmarker.
   */
  async initialize(
    onReady: () => void,
    onError: (err: any) => void
  ): Promise<void> {
    if (this.landmarker) {
      onReady();
      return;
    }

    if (this.isInitializing) return;
    this.isInitializing = true;

    try {
      console.log('[browser] FootTracker.initialize: Fetching vision tasks resolver from jsdelivr CDN...');
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
      );
      console.log('[browser] FootTracker.initialize: Resolved resolver. Downloading PoseLandmarker task model...');

      // Upgrade to 'pose_landmarker_full.task' for higher accuracy on partial inputs
      this.landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.2,
        minPosePresenceConfidence: 0.2,
        minTrackingConfidence: 0.2,
      });
      console.log('[browser] FootTracker.initialize: PoseLandmarker created successfully.');

      // Initialize offscreen canvas (640x480 matches ideal stream sizes)
      if (typeof window !== 'undefined') {
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = 640;
        this.offscreenCanvas.height = 480;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
      }

      this.isInitializing = false;
      onReady();
    } catch (err) {
      this.isInitializing = false;
      console.error('Failed to initialize MediaPipe Pose Landmarker:', err);
      onError(err);
    }
  }

  /**
   * Process a single video frame and return the estimated foot pose.
   */
  processVideoFrame(
    videoElement: HTMLVideoElement,
    timestamp: number
  ): FootPose | null {
    if (!this.landmarker || !this.offscreenCanvas || !this.offscreenCtx) return null;

    // Guard: Wait until the camera element actually has valid dimensions
    if (!videoElement.videoWidth || !videoElement.videoHeight) {
      return null;
    }

    try {
      const width = videoElement.videoWidth;
      const height = videoElement.videoHeight;

      // Dynamically resize offscreen canvas to match video stream size and aspect ratio
      if (this.offscreenCanvas.width !== width || this.offscreenCanvas.height !== height) {
        this.offscreenCanvas.width = width;
        this.offscreenCanvas.height = height;
      }

      // Draw the entire live camera stream onto the offscreen canvas
      this.offscreenCtx.drawImage(
        videoElement,
        0,
        0,
        width,
        height
      );

      // 3. Detect pose on the full canvas
      const results = this.landmarker.detectForVideo(this.offscreenCanvas, timestamp);
      
      let rawLandmarks: any = null;
      let confidence = 0;
      let isLeft = true;

      if (results && results.landmarks && results.landmarks.length > 0) {
        rawLandmarks = results.landmarks[0];
        
        // Calculate confidence (average visibility) for left vs right foot
        const getLandmarkVisibility = (lm: any) => {
          if (!lm) return 0;
          return typeof lm.visibility === 'number' ? lm.visibility : 1.0;
        };

        const leftConfidence =
          (getLandmarkVisibility(rawLandmarks[27]) +
            getLandmarkVisibility(rawLandmarks[29]) +
            getLandmarkVisibility(rawLandmarks[31])) /
          3;

        const rightConfidence =
          (getLandmarkVisibility(rawLandmarks[28]) +
            getLandmarkVisibility(rawLandmarks[30]) +
            getLandmarkVisibility(rawLandmarks[32])) /
          3;

        isLeft = leftConfidence > rightConfidence;
        confidence = isLeft ? leftConfidence : rightConfidence;
      }

      // Call debug callback with raw canvas and landmarks (even if confidence is low)
      if (this.onDebugUpdate) {
        if (Math.random() < 0.01) {
          console.log('[browser] FootTracker: calling onDebugUpdate. Landmarks defined:', !!rawLandmarks);
        }
        this.onDebugUpdate(this.offscreenCanvas, rawLandmarks, confidence);
      }

      // Sensitive threshold for detection filter
      const minConfidence = 0.15;
      if (confidence < minConfidence || !rawLandmarks) {
        return {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: 1,
          detected: false,
        };
      }
      
      // Use raw landmarks directly since there is no vertical split offset
      const leftAnkle = rawLandmarks[27];
      const leftHeel = rawLandmarks[29];
      const leftToe = rawLandmarks[31];

      const rightAnkle = rawLandmarks[28];
      const rightHeel = rawLandmarks[30];
      const rightToe = rawLandmarks[32];

      // Selected foot landmarks
      const ankle = isLeft ? leftAnkle : rightAnkle;
      const heel = isLeft ? leftHeel : rightHeel;
      const toe = isLeft ? leftToe : rightToe;

      if (!ankle || !heel || !toe) {
        return {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: 1,
          detected: false,
        };
      }

      // 1. Position: Midpoint between ankle/heel and toe
      const posX = (heel.x + toe.x) / 2;
      const posY = (heel.y + toe.y) / 2;
      const posZ = (heel.z + toe.z) / 2;

      // 2. Scale: 2D Screen-space distance from heel to toe
      const dx = toe.x - heel.x;
      const dy = toe.y - heel.y;
      const dz = toe.z - heel.z;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Adjust scale multiplier (now using standard distance since there is no height squash)
      const scaleMultiplier = distance * 2.8;

      // 3. Rotation: Calculate Yaw (rotation in screen XY plane)
      const yaw = Math.atan2(dy, dx);

      // Calculate Pitch (up/down rotation based on relative depth Z)
      const horizontalDist = Math.sqrt(dx * dx + dy * dy);
      const pitch = Math.atan2(dz, horizontalDist);

      return {
        position: { x: posX, y: posY, z: posZ },
        rotation: { x: pitch, y: 0, z: yaw },
        scale: scaleMultiplier,
        detected: true,
      };
    } catch (err: any) {
      console.error('[browser] FootTracker: Error in processVideoFrame:', err.message || err);
      return null;
    }
  }

  destroy(): void {
    if (this.landmarker) {
      this.landmarker.close();
      this.landmarker = null;
    }
  }
}
