'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { FootPose } from '../types/product';
import { CoordinateMapper } from './CoordinateMapper';

interface ShoeRendererProps {
  modelUrl: string;
  colorHex: string;
  footPose: FootPose;
  cameraAspect: number;
  videoAspect?: number;
}

export default function ShoeRenderer({
  modelUrl,
  colorHex,
  footPose,
  cameraAspect,
  videoAspect = 0.75,
}: ShoeRendererProps) {
  // Preload and cache GLB model
  const { scene } = useGLTF(modelUrl);
  const groupRef = useRef<THREE.Group>(null);

  // Measure the 3D model's bounding box length (Z-axis) to handle auto-scaling
  const modelLength = useMemo(() => {
    if (!scene) return 1;
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    console.log(`[browser] GLB Model Bounding Box size - W:${size.x.toFixed(3)}, H:${size.y.toFixed(3)}, L:${size.z.toFixed(3)}`);
    return size.z || 0.3; // Default to 30cm if Z length is 0
  }, [scene]);

  // Traverse materials and dynamically apply colors/materials on variant switch
  useEffect(() => {
    if (!scene) return;

    scene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          // Standardize material cloning to avoid mutating the global cached glTF asset
          // so variant switching is clean across instances.
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (!(mat as any)._isCloned) {
            mesh.material = mat.clone();
            (mesh.material as any)._isCloned = true;
          }

          const activeMat = mesh.material as THREE.MeshStandardMaterial;
          const matName = (activeMat.name || '').toLowerCase();

          // Target specific parts of the shoe model (e.g. Khronos MaterialsVariantsShoe)
          // Materials: "Upper", "Laces", "Sole", "Inner"
          if (
            matName.includes('upper') ||
            matName.includes('leather') ||
            matName.includes('fabric') ||
            matName.includes('body') ||
            matName.includes('main')
          ) {
            activeMat.color.set(colorHex);
            activeMat.roughness = 0.55;
            activeMat.metalness = 0.1;
          } else if (matName.includes('laces') || matName.includes('lace')) {
            activeMat.color.set(colorHex);
          } else if (matName.includes('sole') || matName.includes('rubber')) {
            if (colorHex === '#111827') {
              activeMat.color.set('#222222');
            } else {
              activeMat.color.set('#eeeeee');
            }
          }
        }
      }
    });
  }, [scene, colorHex]);

  useFrame(() => {
    if (!groupRef.current) return;

    if (!footPose.detected) {
      // Smoothly scale down / hide if foot is not detected
      groupRef.current.scale.setScalar(
        THREE.MathUtils.lerp(groupRef.current.scale.x, 0, 0.2)
      );
      return;
    }

    // 1. Map normalized foot coordinates to 3D Three.js space
    const threePos = CoordinateMapper.mapToThreeSpace(
      footPose.position.x,
      footPose.position.y,
      footPose.position.z,
      4.5, // camera distance
      50,  // fov
      cameraAspect,
      videoAspect
    );

    // 2. Smoothly interpolate position (Lerp for 30+ FPS stabilization)
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      threePos.x,
      0.3
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      threePos.y - 0.15, // slightly adjust vertical offset for shoe placement relative to ankle
      0.3
    );
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      threePos.z,
      0.3
    );

    // 3. Auto-scale dynamically based on the measured model size
    // We map the tracking scale ratio (0 to 1) to actual Three.js viewport sizes
    const fovRad = (50 * Math.PI) / 180;
    const viewportHeight = 2 * Math.tan(fovRad / 2) * 4.5; // ~4.2 units
    
    // Target shoe length is footPose.scale * viewportHeight (represented as a 3D unit length)
    const targetLength3D = footPose.scale * viewportHeight * 0.95; // scaling factor adjustment
    const targetScaleFactor = targetLength3D / modelLength;

    const currentScale = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScaleFactor, 0.25);
    groupRef.current.scale.set(newScale, newScale, newScale);

    // 4. Smoothly interpolate rotation
    // Yaw (foot rotation) is mapped to Y-axis rotation in 3D
    // Pitch (tilt) is mapped to X-axis rotation
    // Align shoe model (which defaults to facing right along +X) with foot pointing angle
    const targetRotationY = -footPose.rotation.z;
    const targetRotationX = footPose.rotation.x * 0.5;
    const targetRotationZ = 0; // minimal roll

    // Interpolate rotation angles smoothly
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotationY,
      0.25
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotationX,
      0.25
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      targetRotationZ,
      0.25
    );
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

// Preload the default GLB model to speed up first load
useGLTF.preload('/models/sneaker-default.glb');
