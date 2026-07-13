export class CameraManager {
  private stream: MediaStream | null = null;

  /**
   * Starts the camera stream and attaches it to the provided video element.
   * Prioritizes the back camera on mobile devices.
   */
  async startCamera(
    videoElement: HTMLVideoElement,
    facingMode: 'user' | 'environment' = 'environment'
  ): Promise<MediaStream> {
    this.stopCamera();

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: facingMode,
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30 },
      },
      audio: false,
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = this.stream;
      
      // Force video play
      await new Promise<void>((resolve, reject) => {
        videoElement.onloadedmetadata = () => {
          videoElement.play()
            .then(() => resolve())
            .catch(reject);
        };
      });

      return this.stream;
    } catch (err) {
      // Fallback if rear camera is not available (e.g. on desktops)
      if (facingMode === 'environment') {
        console.warn('Rear camera not available, falling back to front camera...');
        return this.startCamera(videoElement, 'user');
      }
      throw err;
    }
  }

  /**
   * Stops the current camera stream.
   */
  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop();
      });
      this.stream = null;
    }
  }
}
