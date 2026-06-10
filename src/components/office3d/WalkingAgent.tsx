'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Agent3D, AgentActivity } from './OfficeScene';

interface WalkingAgentProps {
  agent: Agent3D;
  targetPosition: [number, number, number];
  activity: AgentActivity;
}

const ACTIVITY_LABELS: Record<AgentActivity, string> = {
  desk: 'يعمل',
  coffee: 'استراحة قهوة ☕',
  bathroom: 'استراحة',
  walking: 'يتجول',
};

export default function WalkingAgent({ agent, targetPosition, activity }: WalkingAgentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const currentPos = useRef(new THREE.Vector3(targetPosition[0], targetPosition[1], targetPosition[2]));

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Smoothly move to target
    const target = new THREE.Vector3(targetPosition[0], targetPosition[1], targetPosition[2]);
    currentPos.current.lerp(target, 0.02);
    groupRef.current.position.copy(currentPos.current);

    if (activity === 'walking') {
      // Walking bob animation
      groupRef.current.position.y = targetPosition[1] + Math.abs(Math.sin(t * 4)) * 0.05;
      // Subtle side-to-side sway
      if (bodyRef.current) {
        bodyRef.current.rotation.z = Math.sin(t * 3) * 0.08;
      }
    } else if (activity === 'coffee') {
      // Drinking animation — head tilts back
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(t * 0.8) * 0.15 - 0.1;
      }
      // Subtle idle bob
      groupRef.current.position.y = targetPosition[1] + Math.sin(t * 1.5) * 0.015;
    } else if (activity === 'bathroom') {
      // Waiting animation
      groupRef.current.position.y = targetPosition[1] + Math.sin(t * 2) * 0.01;
      if (bodyRef.current) {
        bodyRef.current.rotation.y = Math.sin(t * 0.5) * 0.2;
      }
    }
  });

  return (
    <group ref={groupRef} position={targetPosition}>
      {/* Head */}
      <mesh ref={headRef} position={[0, 0.25, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={agent.color}
          roughness={0.3}
          metalness={0.4}
          emissive={agent.color}
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.2, 8, 16]} />
        <meshStandardMaterial
          color={agent.color}
          roughness={0.4}
          metalness={0.3}
          emissive={agent.color}
          emissiveIntensity={0.15}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Left leg animation for walking */}
      {activity === 'walking' && (
        <>
          <mesh position={[-0.05, -0.2, 0]}>
            <capsuleGeometry args={[0.035, 0.12, 4, 8]} />
            <meshStandardMaterial color={agent.color} roughness={0.5} transparent opacity={0.7} />
          </mesh>
          <mesh position={[0.05, -0.2, 0]}>
            <capsuleGeometry args={[0.035, 0.12, 4, 8]} />
            <meshStandardMaterial color={agent.color} roughness={0.5} transparent opacity={0.7} />
          </mesh>
        </>
      )}

      {/* Coffee cup for coffee activity */}
      {activity === 'coffee' && (
        <group position={[0.2, 0.1, 0.1]}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.035, 0.08, 8]} />
            <meshStandardMaterial color="#F5F5DC" roughness={0.8} />
          </mesh>
          {/* Steam */}
          <mesh position={[0, 0.06, 0]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="white" transparent opacity={0.3} />
          </mesh>
        </group>
      )}

      {/* Glow */}
      <pointLight
        color={agent.color}
        intensity={0.4}
        distance={2}
        position={[0, 0.1, 0]}
      />

      {/* Activity label */}
      <Html
        position={[0, 0.55, 0]}
        center
        distanceFactor={8}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={{
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          padding: '3px 10px',
          borderRadius: '16px',
          border: `1px solid ${agent.color}33`,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          direction: 'rtl',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#f1f5f9', fontFamily: 'Cairo, sans-serif' }}>
            {agent.name}
          </div>
          <div style={{ fontSize: '8px', color: '#94a3b8', fontFamily: 'Cairo, sans-serif' }}>
            {ACTIVITY_LABELS[activity]}
          </div>
        </div>
      </Html>
    </group>
  );
}
