'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Agent3D } from './OfficeScene';
import AgentAvatar from './AgentAvatar';
import StatusLight from './StatusLight';

interface AgentDeskProps {
  position: [number, number, number];
  agent: Agent3D;
  onClick?: () => void;
  isAway?: boolean;
}

export default function AgentDesk({ position, agent, onClick, isAway = false }: AgentDeskProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (groupRef.current) {
      const targetY = hovered ? 0.08 : 0;
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetY,
        0.1
      );
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
      {/* Desk Surface */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.08, 1]} />
        <meshStandardMaterial
          color="#1a1d2e"
          roughness={0.4}
          metalness={0.6}
          emissive={hovered ? agent.color : '#000000'}
          emissiveIntensity={hovered ? 0.15 : 0}
        />
      </mesh>

      {/* Desk Legs */}
      {[[-0.75, 0.2, -0.4], [0.75, 0.2, -0.4], [-0.75, 0.2, 0.4], [0.75, 0.2, 0.4]].map(
        (legPos, i) => (
          <mesh key={i} position={legPos as [number, number, number]}>
            <cylinderGeometry args={[0.03, 0.03, 0.4]} />
            <meshStandardMaterial color="#12141d" metalness={0.8} roughness={0.3} />
          </mesh>
        )
      )}

      {/* Monitor */}
      <group position={[0, 0.75, -0.2]}>
        {/* Screen */}
        <mesh>
          <boxGeometry args={[0.7, 0.45, 0.03]} />
          <meshStandardMaterial
            color="#0F1117"
            emissive={isAway ? '#334155' : (agent.status === 'WORKING' ? '#22d3ee' : agent.color)}
            emissiveIntensity={isAway ? 0.05 : (agent.status === 'WORKING' ? 0.4 : 0.15)}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        {/* Screen content glow */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[0.6, 0.35]} />
          <meshBasicMaterial
            color={isAway ? '#334155' : (agent.status === 'WORKING' ? '#22d3ee' : agent.color)}
            transparent
            opacity={isAway ? 0.03 : (agent.status === 'WORKING' ? 0.3 : 0.1)}
          />
        </mesh>
        {/* Stand */}
        <mesh position={[0, -0.3, 0.05]}>
          <cylinderGeometry args={[0.02, 0.04, 0.15]} />
          <meshStandardMaterial color="#1a1d2e" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Agent Avatar — only shown when at desk */}
      {!isAway && (
        <AgentAvatar
          position={[0, 0.8, 0.5]}
          color={agent.color}
          status={agent.status}
        />
      )}

      {/* Empty chair hint when away */}
      {isAway && (
        <mesh position={[0, 0.35, 0.5]}>
          <boxGeometry args={[0.35, 0.05, 0.35]} />
          <meshStandardMaterial
            color="#1a1d2e"
            transparent
            opacity={0.4}
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>
      )}

      {/* Status Light */}
      <StatusLight
        position={[0.8, 0.5, -0.35]}
        status={isAway ? 'IDLE' : agent.status}
      />

      {/* Floating Label (HTML overlay) */}
      <Html
        position={[0, 1.6, 0]}
        center
        distanceFactor={8}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            padding: '4px 12px',
            borderRadius: '20px',
            border: `1px solid ${isAway ? '#33415533' : `${agent.color}33`}`,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            direction: 'rtl',
            opacity: isAway ? 0.7 : 1,
          }}
        >
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: isAway ? '#94a3b8' : '#f1f5f9',
              fontFamily: 'Cairo, sans-serif',
            }}
          >
            {agent.name}
          </div>
          <div
            style={{
              fontSize: '9px',
              color: isAway ? '#475569' : '#94a3b8',
              fontFamily: 'Cairo, sans-serif',
            }}
          >
            {isAway ? '☕ بعيد' : agent.role}
          </div>
        </div>
      </Html>

      {/* Hover glow on floor */}
      {hovered && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <circleGeometry args={[1.2, 32]} />
          <meshBasicMaterial
            color={agent.color}
            transparent
            opacity={0.08}
          />
        </mesh>
      )}
    </group>
  );
}

