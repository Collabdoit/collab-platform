'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function OfficeFloor() {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame(() => {
    // Subtle grid shimmer (optional)
  });

  return (
    <group>
      {/* Main Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0.5]} receiveShadow>
        <planeGeometry args={[20, 14]} />
        <meshStandardMaterial
          color="#0a0b10"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Grid Lines */}
      <gridHelper
        ref={gridRef}
        args={[20, 20, '#1a1d2e', '#12141d']}
        position={[0, 0.001, 0.5]}
      />

      {/* Floor Glow (center) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0.5]}>
        <circleGeometry args={[4, 32]} />
        <meshBasicMaterial
          color="#6366F1"
          transparent
          opacity={0.03}
        />
      </mesh>
    </group>
  );
}
