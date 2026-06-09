'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AmbientParticlesProps {
  count?: number;
}

export default function AmbientParticles({ count = 40 }: AmbientParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;     // x
      pos[i * 3 + 1] = Math.random() * 5 + 0.5;     // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;  // z
    }
    return pos;
  }, [count]);

  const speeds = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 0.002,
      y: (Math.random() - 0.5) * 0.001,
      z: (Math.random() - 0.5) * 0.002,
    }));
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      posArray[i * 3] += speeds[i].x;
      posArray[i * 3 + 1] += speeds[i].y;
      posArray[i * 3 + 2] += speeds[i].z;

      // Wrap around bounds
      if (Math.abs(posArray[i * 3]) > 8) speeds[i].x *= -1;
      if (posArray[i * 3 + 1] > 5.5 || posArray[i * 3 + 1] < 0.5) speeds[i].y *= -1;
      if (Math.abs(posArray[i * 3 + 2]) > 6) speeds[i].z *= -1;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#6366F1"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
