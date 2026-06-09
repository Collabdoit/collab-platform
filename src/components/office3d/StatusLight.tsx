'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StatusLightProps {
  position: [number, number, number];
  status: 'IDLE' | 'WORKING' | 'BLOCKED';
}

const STATUS_COLORS: Record<string, string> = {
  IDLE: '#10B981',
  WORKING: '#F59E0B',
  BLOCKED: '#F43F5E',
};

export default function StatusLight({ position, status }: StatusLightProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const color = STATUS_COLORS[status];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (meshRef.current) {
      // Idle: gentle pulse
      if (status === 'IDLE') {
        const scale = 1 + Math.sin(t * 2) * 0.15;
        meshRef.current.scale.setScalar(scale);
      }
      // Working: fast pulse
      if (status === 'WORKING') {
        const scale = 1 + Math.sin(t * 4) * 0.2;
        meshRef.current.scale.setScalar(scale);
      }
      // Blocked: blink
      if (status === 'BLOCKED') {
        const opacity = 0.5 + Math.sin(t * 6) * 0.5;
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = opacity;
      }
    }

    if (lightRef.current) {
      if (status === 'WORKING') {
        lightRef.current.intensity = 0.3 + Math.sin(t * 4) * 0.15;
      }
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        color={color}
        intensity={0.3}
        distance={1.5}
      />
    </group>
  );
}
