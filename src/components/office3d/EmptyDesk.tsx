'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface EmptyDeskProps {
  position: [number, number, number];
  onClick?: () => void;
}

export default function EmptyDesk({ position, onClick }: EmptyDeskProps) {
  const groupRef = useRef<THREE.Group>(null);
  const plusRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (plusRef.current) {
      const t = clock.getElapsedTime();
      plusRef.current.position.y = 1.0 + Math.sin(t * 2) * 0.08;
      plusRef.current.rotation.y = t * 0.5;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Ghost Desk */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.8, 0.08, 1]} />
        <meshStandardMaterial
          color="#12141d"
          transparent
          opacity={hovered ? 0.6 : 0.3}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>

      {/* Ghost Legs */}
      {[[-0.75, 0.2, -0.4], [0.75, 0.2, -0.4], [-0.75, 0.2, 0.4], [0.75, 0.2, 0.4]].map(
        (legPos, i) => (
          <mesh key={i} position={legPos as [number, number, number]}>
            <cylinderGeometry args={[0.03, 0.03, 0.4]} />
            <meshStandardMaterial
              color="#12141d"
              transparent
              opacity={0.2}
            />
          </mesh>
        )
      )}

      {/* Floating Plus Hologram */}
      <mesh ref={plusRef} position={[0, 1.0, 0]}>
        <octahedronGeometry args={[0.15]} />
        <meshStandardMaterial
          color="#6366F1"
          emissive="#6366F1"
          emissiveIntensity={hovered ? 0.8 : 0.4}
          transparent
          opacity={hovered ? 0.9 : 0.5}
          wireframe
        />
      </mesh>

      {/* Plus glow */}
      <pointLight
        color="#6366F1"
        intensity={hovered ? 0.5 : 0.2}
        distance={2}
        position={[0, 1.0, 0]}
      />

      {/* Label */}
      <Html
        position={[0, 1.4, 0]}
        center
        distanceFactor={8}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div
          style={{
            fontSize: '10px',
            color: hovered ? '#818cf8' : '#475569',
            fontFamily: 'Cairo, sans-serif',
            whiteSpace: 'nowrap',
            transition: 'color 0.2s',
          }}
        >
          وظّف موظف
        </div>
      </Html>

      {/* Floor highlight on hover */}
      {hovered && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <circleGeometry args={[1, 32]} />
          <meshBasicMaterial
            color="#6366F1"
            transparent
            opacity={0.05}
          />
        </mesh>
      )}
    </group>
  );
}
