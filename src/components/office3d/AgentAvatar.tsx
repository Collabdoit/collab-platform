'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AgentAvatarProps {
  position: [number, number, number];
  color: string;
  status: 'IDLE' | 'WORKING' | 'BLOCKED';
}

export default function AgentAvatar({ position, color, status }: AgentAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Idle: gentle bob
    if (status === 'IDLE') {
      groupRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.02;
    }

    // Working: lean forward typing animation
    if (status === 'WORKING' && bodyRef.current) {
      bodyRef.current.rotation.x = Math.sin(t * 3) * 0.05 - 0.1;
    }

    // Blocked: subtle shake
    if (status === 'BLOCKED') {
      groupRef.current.position.x = position[0] + Math.sin(t * 8) * 0.01;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Head */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.4}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.2, 8, 16]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.3}
          emissive={color}
          emissiveIntensity={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Subtle glow */}
      <pointLight
        color={color}
        intensity={0.3}
        distance={1.5}
        position={[0, 0.1, 0]}
      />
    </group>
  );
}
