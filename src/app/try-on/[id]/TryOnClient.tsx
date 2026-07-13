'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Orbit, Smartphone } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Product } from '../../../types/product';
import CameraFeed from '../../../components/CameraFeed';

const ARCanvas = dynamic(() => import('../../../components/ARCanvas'), {
  ssr: false,
});

import { FootPose } from '../../../types/product';

interface TryOnClientProps {
  product: Product;
  initialVariantId: string | null;
}

export default function TryOnClient({ product, initialVariantId }: TryOnClientProps) {
  // Find initial variant or fallback to first
  const initialVariant = useMemo(() => {
    return (
      product.variants.find((v) => v.id === initialVariantId) ||
      product.variants[0]
    );
  }, [product, initialVariantId]);

  const [selectedVariant, setSelectedVariant] = useState(initialVariant);
  const [footPose, setFootPose] = useState<FootPose>({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1,
    detected: false,
  });
  const [trackerLoading, setTrackerLoading] = useState(true);

  // Debug states
  const [debugMode, setDebugMode] = useState(false);
  const [debugConfidence, setDebugConfidence] = useState(0);
  const debugCanvasRef = useRef<HTMLCanvasElement>(null);

  // Diagnostics state
  const [debugDiagnostics, setDebugDiagnostics] = useState({
    videoWidth: 0,
    videoHeight: 0,
    readyState: 0,
    trackerState: 'loading',
    cameraState: 'loading',
    frameCount: 0,
  });

  // Use a ref to prevent closure capture issues in async callbacks
  const debugModeRef = useRef(debugMode);
  debugModeRef.current = debugMode;

  // Draws raw tracking frames and skeleton overlay in real-time when Debug Mode is ON
  const handleDebugUpdate = (
    canvas: HTMLCanvasElement,
    rawLandmarks: any,
    confidence: number
  ) => {
    setDebugConfidence(confidence);
    
    // Diagnostic logging to terminal
    if (Math.random() < 0.01) {
      console.log(`[browser] handleDebugUpdate: debugMode=${debugModeRef.current}, canvasRef=${!!debugCanvasRef.current}, rawLandmarks=${!!rawLandmarks}, confidence=${confidence.toFixed(3)}`);
    }

    if (!debugModeRef.current || !debugCanvasRef.current) return;

    const ctx = debugCanvasRef.current.getContext('2d');
    if (!ctx) {
      console.warn('[browser] handleDebugUpdate: failed to get 2D context from debug canvas');
      return;
    }

    // Draw the tracking frame (canvas is 640x480)
    ctx.drawImage(canvas, 0, 0, 320, 240);

    // Draw Pose Landmarker skeleton overlay if detected
    if (rawLandmarks) {
      const drawPoint = (index: number, color: string) => {
        const lm = rawLandmarks[index];
        if (!lm) return;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(lm.x * 320, lm.y * 240, 5, 0, Math.PI * 2);
        ctx.fill();
      };

      const drawLink = (idx1: number, idx2: number, color: string) => {
        const lm1 = rawLandmarks[idx1];
        const lm2 = rawLandmarks[idx2];
        if (!lm1 || !lm2) return;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(lm1.x * 320, lm1.y * 240);
        ctx.lineTo(lm2.x * 320, lm2.y * 240);
        ctx.stroke();
      };

      // Draw Left Foot (cyan/teal)
      drawLink(27, 29, '#22d3ee');
      drawLink(29, 31, '#22d3ee');
      drawPoint(27, '#06b6d4'); // Left Ankle
      drawPoint(29, '#0891b2'); // Left Heel
      drawPoint(31, '#0e7490'); // Left Toe (Foot Index)

      // Draw Right Foot (pink/magenta)
      drawLink(28, 30, '#f472b6');
      drawLink(30, 32, '#f472b6');
      drawPoint(28, '#db2777'); // Right Ankle
      drawPoint(30, '#be185d'); // Right Heel
      drawPoint(32, '#9d174d'); // Right Toe (Foot Index)
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black select-none">
      
      {/* 1. Camera Feed Backdrop */}
      <div className="absolute inset-0 z-10 h-full w-full">
        <CameraFeed
          onFootPoseDetected={setFootPose}
          onTrackerLoadingChange={setTrackerLoading}
          onDebugUpdate={handleDebugUpdate}
          onDebugDiagnosticsChange={setDebugDiagnostics}
        />
      </div>

      {/* 2. Three.js R3F Canvas Overlay */}
      {!trackerLoading && (
        <ARCanvas
          modelUrl={selectedVariant.modelUrl}
          colorHex={selectedVariant.colorHex || '#FFF'}
          footPose={footPose}
          videoWidth={debugDiagnostics.videoWidth}
          videoHeight={debugDiagnostics.videoHeight}
        />
      )}

      {/* 3. Floating User Interface Controls */}
      <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-6">
        
        {/* Top Control Bar */}
        <div className="w-full flex items-start justify-between pointer-events-auto">
          {/* Back Button */}
          <Link
            href={`/products/${product.id}`}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-950/60 text-white backdrop-blur-md transition-all hover:bg-zinc-900 active:scale-95 shadow-lg"
            title="Exit AR Try-On"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          {/* Right Header Panel */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            {/* Debug Mode Button */}
            <button
              onClick={() => setDebugMode(!debugMode)}
              className={`flex h-10 px-3.5 items-center gap-1.5 rounded-full border text-xs font-semibold backdrop-blur-md shadow-lg transition-all active:scale-95 ${
                debugMode
                  ? 'bg-red-600/80 border-red-500 text-white'
                  : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              {debugMode ? 'Debug: ON' : 'Debug Mode'}
            </button>

            {/* Real-time Tracking Status Indicator */}
            <div className="flex h-10 items-center gap-2 rounded-full border border-zinc-800/85 bg-zinc-950/70 px-4 py-2 text-xs font-semibold backdrop-blur-md shadow-lg">
              {footPose.detected ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span className="text-zinc-200">Foot Tracked</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                  </span>
                  <span className="text-zinc-300">Scanning for Foot...</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Guidance Center Display (Visible only when scanning & not in debug) */}
        {!footPose.detected && !trackerLoading && !debugMode && (
          <div className="self-center flex flex-col items-center bg-zinc-950/40 border border-zinc-800/20 rounded-2xl px-6 py-4 backdrop-blur-sm max-w-xs text-center transform translate-y-[-10%] transition-opacity duration-300">
            <Smartphone className="h-6 w-6 text-orange-400 animate-bounce mb-2" />
            <p className="text-xs text-zinc-300 font-medium leading-relaxed">
              Point camera at your feet. Take a step back so your full foot is visible in the frame.
            </p>
          </div>
        )}

        {/* Debug panel overlay */}
        {debugMode && (
          <div className="absolute top-20 right-6 z-40 bg-zinc-950/95 border border-zinc-800 p-4 rounded-2xl shadow-2xl pointer-events-auto w-80 backdrop-blur-md flex flex-col gap-3 font-mono text-[9px] text-zinc-300">
            <span className="text-xs font-bold font-outfit text-white uppercase tracking-wider">AR Debug Console</span>
            
            <canvas
              ref={debugCanvasRef}
              width={320}
              height={240}
              className="w-full h-auto bg-black rounded-lg border border-zinc-800"
            />
            
            <div className="flex flex-col gap-1 border-t border-zinc-900 pt-2">
              <div className="flex justify-between">
                <span>Frame Tick:</span>
                <span className="font-bold text-orange-400">{debugDiagnostics.frameCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Camera Stream Size:</span>
                <span>{debugDiagnostics.videoWidth}x{debugDiagnostics.videoHeight}</span>
              </div>
              <div className="flex justify-between">
                <span>HTML5 readyState:</span>
                <span className={debugDiagnostics.readyState >= 2 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                  {debugDiagnostics.readyState} ({debugDiagnostics.readyState >= 2 ? 'READY' : 'WAITING'})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Camera state:</span>
                <span className="capitalize">{debugDiagnostics.cameraState}</span>
              </div>
              <div className="flex justify-between">
                <span>Tracker state:</span>
                <span className="capitalize">{debugDiagnostics.trackerState}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-900 mt-1 pt-1">
                <span>Pose Detected:</span>
                <span className={footPose.detected ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                  {footPose.detected ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Confidence Rating:</span>
                <span>{(debugConfidence * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Confidence Threshold:</span>
                <span>15.0%</span>
              </div>
              <div className="flex justify-between">
                <span>Shoe Scale factor:</span>
                <span>{footPose.scale.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span>Yaw Angle:</span>
                <span>{((footPose.rotation.z * 180) / Math.PI).toFixed(1)}°</span>
              </div>
              <div className="flex justify-between">
                <span>3D Coordinates:</span>
                <span>X:{footPose.position.x.toFixed(2)}, Y:{footPose.position.y.toFixed(2)}, Z:{footPose.position.z.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Panel: Variant Switcher Card */}
        <div className="w-full max-w-md mx-auto pointer-events-auto bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-md shadow-2xl flex items-center justify-between gap-4">
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
              {product.brand}
            </span>
            <h4 className="font-outfit text-sm font-semibold text-white truncate">
              {product.name}
            </h4>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Active: <span className="text-zinc-200 font-medium capitalize">{selectedVariant.color}</span>
            </p>
          </div>

          {/* Small Swatch Switcher */}
          <div className="flex items-center gap-2">
            {product.variants.map((variant) => {
              const isSelected = variant.id === selectedVariant.id;
              return (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`h-8 w-8 rounded-full border transition-all duration-200 ${
                    isSelected
                      ? 'border-orange-500 scale-110 shadow-[0_0_8px_rgba(249,115,22,0.3)]'
                      : 'border-zinc-800 hover:scale-105'
                  }`}
                  style={{ backgroundColor: variant.colorHex || '#555' }}
                  title={variant.color}
                />
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
