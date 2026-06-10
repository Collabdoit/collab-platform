'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface CoffeeMachineProps {
  position: [number, number, number];
}

export default function CoffeeMachine({ position }: CoffeeMachineProps) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.intensity = 0.3 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Counter / Table */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1, 0.06, 0.6]} />
        <meshStandardMaterial color="#1a1d2e" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Table legs */}
      {[[-0.4, 0.2, -0.25], [0.4, 0.2, -0.25], [-0.4, 0.2, 0.25], [0.4, 0.2, 0.25]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4]} />
          <meshStandardMaterial color="#12141d" metalness={0.8} />
        </mesh>
      ))}

      {/* Coffee Machine Body */}
      <mesh position={[0, 0.65, -0.05]} castShadow>
        <boxGeometry args={[0.35, 0.5, 0.3]} />
        <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Nozzle */}
      <mesh position={[0, 0.48, 0.1]}>
        <cylinderGeometry args={[0.02, 0.015, 0.08]} />
        <meshStandardMaterial color="#475569" metalness={0.7} />
      </mesh>
      {/* Indicator light */}
      <mesh position={[0.1, 0.8, 0.16]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial
          color="#10B981"
          emissive="#10B981"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Cup on counter */}
      <mesh position={[-0.25, 0.48, 0.1]}>
        <cylinderGeometry args={[0.04, 0.035, 0.08, 8]} />
        <meshStandardMaterial color="#F5F5DC" roughness={0.8} />
      </mesh>

      {/* Warm glow */}
      <pointLight
        ref={lightRef}
        color="#F59E0B"
        intensity={0.3}
        distance={3}
        position={[0, 0.7, 0.2]}
      />

      {/* Label */}
      <Html
        position={[0, 1.1, 0]}
        center
        distanceFactor={10}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={{
          background: 'rgba(0,0,0,0.6)',
          padding: '2px 8px',
          borderRadius: '10px',
          fontSize: '9px',
          color: '#F59E0B',
          fontFamily: 'Cairo, sans-serif',
          whiteSpace: 'nowrap',
          direction: 'rtl',
        }}>
          ☕ ركن القهوة
        </div>
      </Html>
    </group>
  );
}
