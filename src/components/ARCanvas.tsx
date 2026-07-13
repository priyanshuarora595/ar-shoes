'use client';

import React from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import ShoeRenderer from '../ar/ShoeRenderer';
import { FootPose } from '../types/product';

interface ARCanvasProps {
  modelUrl: string;
  colorHex: string;
  footPose: FootPose;
  videoWidth?: number;
  videoHeight?: number;
}

interface ARSceneWrapperProps {
  modelUrl: string;
  colorHex: string;
  footPose: FootPose;
  videoAspect: number;
}

// Inner wrapper component to access R3F context (like useThree)
function ARSceneWrapper({
  modelUrl,
  colorHex,
  footPose,
  videoAspect,
}: ARSceneWrapperProps) {
  const { size } = useThree();
  const aspect = size.width / size.height;

  return (
    <>
      {/* Studio Lighting System */}
      <ambientLight intensity={1.8} />
      <directionalLight
        position={[2, 8, 5]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.001}
      />
      <pointLight position={[-3, 5, -2]} intensity={1.0} />

      {/* Dynamic 3D Shoe Model */}
      <ShoeRenderer
        modelUrl={modelUrl}
        colorHex={colorHex}
        footPose={footPose}
        cameraAspect={aspect}
        videoAspect={videoAspect}
      />

      {/* Soft Contact Shadows below the shoe */}
      <ContactShadows
        opacity={0.6}
        scale={8}
        blur={2.4}
        far={5}
        position={[0, -0.6, -4.5]}
      />
    </>
  );
}

export default function ARCanvas({
  modelUrl,
  colorHex,
  footPose,
  videoWidth = 480,
  videoHeight = 640,
}: ARCanvasProps) {
  const videoAspect = videoWidth / videoHeight || 0.75;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <Canvas
        shadows
        camera={{ fov: 50, near: 0.1, far: 20, position: [0, 0, 0] }}
        className="h-full w-full"
      >
        <ARSceneWrapper
          modelUrl={modelUrl}
          colorHex={colorHex}
          footPose={footPose}
          videoAspect={videoAspect}
        />
      </Canvas>
    </div>
  );
}
