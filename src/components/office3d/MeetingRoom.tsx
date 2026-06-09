'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface MeetingRoomProps {
  position: [number, number, number];
  onClick?: () => void;
}

export default function MeetingRoom({ position, onClick }: MeetingRoomProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.08 + Math.sin(state.clock.elapsedTime * 2) * 0.04;
    }
    if (groupRef.current && hovered) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.03;
    }
  });

  const chairColors = ['#8B5CF6', '#F59E0B', '#10B981', '#EC4899', '#06B6D4', '#EF4444'];

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onPointerEnter={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerLeave={() => { setHovered(false); document.body.style.cursor = 'default'; }}
    >
      {/* Table */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.2, 0.08, 24]} />
        <meshStandardMaterial
          color={hovered ? '#2D3152' : '#1E2035'}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* Table leg */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.4, 12]} />
        <meshStandardMaterial color="#161822" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Table glow ring */}
      <mesh ref={glowRef} position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.25, 24]} />
        <meshBasicMaterial color="#6366F1" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Chairs — simplified: box seats + colored dots, NO pointLights */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const cx = Math.cos(rad) * 1.7;
        const cz = Math.sin(rad) * 1.7;
        return (
          <group key={i} position={[cx, 0, cz]} rotation={[0, -rad + Math.PI, 0]}>
            {/* Chair seat */}
            <mesh position={[0, 0.35, 0]}>
              <boxGeometry args={[0.35, 0.06, 0.35]} />
              <meshStandardMaterial color="#1a1d2e" roughness={0.5} metalness={0.4} />
            </mesh>
            {/* Chair back */}
            <mesh position={[0, 0.55, -0.15]}>
              <boxGeometry args={[0.35, 0.3, 0.04]} />
              <meshStandardMaterial color="#1a1d2e" roughness={0.5} metalness={0.4} />
            </mesh>
            {/* Status dot */}
            <mesh position={[0, 0.72, -0.15]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color={chairColors[i]} />
            </mesh>
          </group>
        );
      })}

      {/* Holographic display */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshBasicMaterial color="#6366F1" transparent opacity={hovered ? 0.6 : 0.3} />
      </mesh>

      {/* Hologram ring */}
      <mesh position={[0, 1.1, 0]} rotation={[Math.PI / 6, 0, 0]}>
        <torusGeometry args={[0.3, 0.01, 6, 24]} />
        <meshBasicMaterial color="#818CF8" transparent opacity={0.4} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 1.6, 0]}
        fontSize={0.2}
        color={hovered ? '#818CF8' : '#6366F1'}
        anchorX="center"
        anchorY="middle"
        fillOpacity={hovered ? 1 : 0.8}
      >
        غرفة الاجتماعات
      </Text>

      {/* Floor glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[2, 24]} />
        <meshBasicMaterial color="#6366F1" transparent opacity={hovered ? 0.06 : 0.03} />
      </mesh>
    </group>
  );
}
