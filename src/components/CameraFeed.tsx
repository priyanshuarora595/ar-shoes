'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { CameraManager } from '../ar/CameraManager';
import { FootTracker } from '../ar/FootTracker';
import { FootPose } from '../types/product';

interface CameraFeedProps {
  onFootPoseDetected: (pose: FootPose) => void;
  onTrackerLoadingChange?: (loading: boolean) => void;
  onDebugUpdate?: (
    canvas: HTMLCanvasElement,
    rawLandmarks: any,
    confidence: number
  ) => void;
  onDebugDiagnosticsChange?: (diagnostics: {
    videoWidth: number;
    videoHeight: number;
    readyState: number;
    trackerState: string;
    cameraState: string;
    frameCount: number;
  }) => void;
}

export default function CameraFeed({
  onFootPoseDetected,
  onTrackerLoadingChange,
  onDebugUpdate,
  onDebugDiagnosticsChange,
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraManagerRef = useRef<CameraManager | null>(null);
  const footTrackerRef = useRef<FootTracker | null>(null);
  const frameIdRef = useRef<number | null>(null);
  
  const frameCountRef = useRef(0);

  const [cameraState, setCameraState] = useState<'loading' | 'active' | 'error' | 'denied'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [trackerState, setTrackerState] = useState<'loading' | 'ready' | 'error'>('loading');

  // Refs to bypass async closures inside requestAnimationFrame
  const trackerStateRef = useRef(trackerState);
  const cameraStateRef = useRef(cameraState);

  const updateTrackerState = (state: 'loading' | 'ready' | 'error') => {
    trackerStateRef.current = state;
    setTrackerState(state);
  };

  const updateCameraState = (state: 'loading' | 'active' | 'error' | 'denied') => {
    cameraStateRef.current = state;
    setCameraState(state);
  };

  useEffect(() => {
    cameraManagerRef.current = new CameraManager();
    footTrackerRef.current = new FootTracker();

    console.log('[browser] CameraFeed useEffect: registering onDebugUpdate, type is:', typeof onDebugUpdate);

    if (onDebugUpdate) {
      footTrackerRef.current.onDebugUpdate = onDebugUpdate;
    }

    // 1. Initialize Tracker
    if (onTrackerLoadingChange) onTrackerLoadingChange(true);
    
    footTrackerRef.current.initialize(
      () => {
        updateTrackerState('ready');
        if (onTrackerLoadingChange) onTrackerLoadingChange(false);
        // Start camera stream once tracker is ready
        initCamera();
      },
      (err) => {
        updateTrackerState('error');
        if (onTrackerLoadingChange) onTrackerLoadingChange(false);
        setErrorMessage('Failed to initialize Foot Tracking model. Please reload.');
      }
    );

    return () => {
      // Cleanup camera and frame loops
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (cameraManagerRef.current) cameraManagerRef.current.stopCamera();
      if (footTrackerRef.current) footTrackerRef.current.destroy();
    };
  }, []);

  const initCamera = async () => {
    if (!videoRef.current || !cameraManagerRef.current) return;

    updateCameraState('loading');
    try {
      await cameraManagerRef.current.startCamera(videoRef.current, 'environment');
      updateCameraState('active');
      startTrackingLoop();
    } catch (err: any) {
      console.error('Camera Access Error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        updateCameraState('denied');
        setErrorMessage('Camera access was denied. Please enable camera permissions in your browser settings.');
      } else {
        updateCameraState('error');
        setErrorMessage('Camera unavailable or unsupported. Please check device connections.');
      }
    }
  };

  const startTrackingLoop = () => {
    const loop = () => {
      frameCountRef.current += 1;

      if (onDebugDiagnosticsChange && videoRef.current) {
        onDebugDiagnosticsChange({
          videoWidth: videoRef.current.videoWidth || 0,
          videoHeight: videoRef.current.videoHeight || 0,
          readyState: videoRef.current.readyState || 0,
          trackerState: trackerStateRef.current,
          cameraState: cameraStateRef.current,
          frameCount: frameCountRef.current,
        });
      }

      if (
        videoRef.current &&
        videoRef.current.readyState >= 2 &&
        videoRef.current.videoWidth > 0 &&
        footTrackerRef.current &&
        trackerStateRef.current === 'ready' &&
        cameraStateRef.current === 'active'
      ) {
        const timestamp = performance.now();
        const pose = footTrackerRef.current.processVideoFrame(
          videoRef.current,
          timestamp
        );
        if (pose) {
          onFootPoseDetected(pose);
        }
      } else {
        // Log diagnostics to terminal once every ~200 frames if it fails to process
        if (Math.random() < 0.005 && videoRef.current) {
          console.log('[browser] CameraFeed loop skipped. Diagnostics:', {
            video: !!videoRef.current,
            readyState: videoRef.current.readyState,
            videoWidth: videoRef.current.videoWidth,
            tracker: !!footTrackerRef.current,
            trackerState: trackerStateRef.current,
            cameraState: cameraStateRef.current
          });
        }
      }
      frameIdRef.current = requestAnimationFrame(loop);
    };

    frameIdRef.current = requestAnimationFrame(loop);
  };

  const handleRetry = () => {
    setErrorMessage(null);
    initCamera();
  };

  // Render Overlay states (loading, error, permission request)
  if (cameraState === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-zinc-950/90 text-center rounded-3xl border border-zinc-800 backdrop-blur-lg max-w-md mx-auto shadow-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/40 text-red-500 border border-red-800/30 mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="font-outfit text-xl font-semibold text-white mb-2">Camera Access Required</h3>
        <p className="text-sm text-zinc-400 leading-relaxed mb-6">
          We need access to your device camera to virtually project the 3D shoe models on your feet.
        </p>
        <button
          onClick={handleRetry}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] active:scale-95"
        >
          <Camera className="h-4 w-4" />
          Grant Permission
        </button>
      </div>
    );
  }

  if (cameraState === 'error' || trackerState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-zinc-950/90 text-center rounded-3xl border border-zinc-800 backdrop-blur-lg max-w-md mx-auto shadow-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-400 border border-zinc-800 mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="font-outfit text-xl font-semibold text-white mb-2">AR Initialization Failed</h3>
        <p className="text-sm text-zinc-400 leading-relaxed mb-6">{errorMessage}</p>
        <button
          onClick={handleRetry}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-800 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-700 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* Video Element */}
      <video
        ref={videoRef}
        playsInline
        muted
        className={`h-full w-full object-cover transition-opacity duration-700 ${
          cameraState === 'active' ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Loading Overlay */}
      {cameraState === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute h-16 w-16 animate-ping rounded-full bg-orange-600/20" />
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
          <p className="mt-6 text-sm font-semibold tracking-wider text-orange-500 uppercase flex items-center gap-1.5 animate-pulse">
            <Sparkles className="h-4 w-4" />
            Loading AR Engine
          </p>
          <p className="mt-2 text-xs text-zinc-500">Preparing cameras and tracking resolution...</p>
        </div>
      )}
    </div>
  );
}
