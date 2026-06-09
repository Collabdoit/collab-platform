'use client';

import { Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import OfficeFloor from './OfficeFloor';
import AgentDesk from './AgentDesk';
import EmptyDesk from './EmptyDesk';
import MeetingRoom from './MeetingRoom';
import AmbientParticles from './AmbientParticles';
import SceneLighting from './SceneLighting';
import styles from './OfficeScene.module.css';

export interface Agent3D {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  status: 'IDLE' | 'WORKING' | 'BLOCKED';
  currentTask?: string;
}

interface OfficeSceneProps {
  agents: Agent3D[];
  maxDesks?: number;
  onAgentClick?: (agentId: string) => void;
  onEmptyDeskClick?: () => void;
  onMeetingClick?: () => void;
}

// Desk positions — shifted slightly to make room for meeting area
const DESK_POSITIONS: [number, number, number][] = [
  [-4, 0, -1.5],
  [-1, 0, -1.5],
  [2, 0, -1.5],
  [-4, 0, 1.5],
  [-1, 0, 1.5],
  [2, 0, 1.5],
];

// Meeting room position — right side of the office
const MEETING_POSITION: [number, number, number] = [6, 0, 0];

function Scene({ agents, maxDesks = 6, onAgentClick, onEmptyDeskClick, onMeetingClick }: OfficeSceneProps) {
  const handleDeskClick = useCallback((agentId: string) => {
    onAgentClick?.(agentId);
  }, [onAgentClick]);

  return (
    <>
      <SceneLighting />
      <OfficeFloor />
      
      {/* Agent Desks */}
      {DESK_POSITIONS.map((position, index) => {
        const agent = agents[index];
        
        if (agent) {
          return (
            <Float
              key={agent.id}
              speed={1.5}
              rotationIntensity={0}
              floatIntensity={0.3}
              floatingRange={[-0.05, 0.05]}
            >
              <AgentDesk
                position={position}
                agent={agent}
                onClick={() => handleDeskClick(agent.id)}
              />
            </Float>
          );
        }
        
        if (index < maxDesks) {
          return (
            <EmptyDesk
              key={`empty-${index}`}
              position={position}
              onClick={onEmptyDeskClick}
            />
          );
        }
        
        return null;
      })}

      {/* Meeting Room */}
      <Float speed={0.8} rotationIntensity={0} floatIntensity={0.15} floatingRange={[-0.02, 0.02]}>
        <MeetingRoom position={MEETING_POSITION} onClick={onMeetingClick} />
      </Float>

      <AmbientParticles count={40} />
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={6}
        maxDistance={20}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 3}
        autoRotate
        autoRotateSpeed={0.3}
        target={[1, 0, 0]}
      />
      
      <Environment preset="night" />
    </>
  );
}

export default function OfficeScene(props: OfficeSceneProps) {
  return (
    <div className={styles.sceneContainer}>
      <div className={styles.badge3d}>
        <span className={styles.badge3dDot}></span>
        مكتبك المباشر
      </div>
      
      <Suspense
        fallback={
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <span className={styles.loadingText}>جاري تحميل المكتب...</span>
          </div>
        }
      >
        <Canvas
          className={styles.canvas}
          camera={{
            position: [10, 7, 10],
            fov: 45,
            near: 0.1,
            far: 100,
          }}
          dpr={[1, 2]}
        >
          <Scene {...props} />
        </Canvas>
      </Suspense>
    </div>
  );
}
