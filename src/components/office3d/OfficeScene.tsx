'use client';

import { Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import OfficeFloor from './OfficeFloor';
import AgentDesk from './AgentDesk';
import EmptyDesk from './EmptyDesk';
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
}

// Desk positions in a 2-row grid
const DESK_POSITIONS: [number, number, number][] = [
  [-3, 0, -1],
  [0, 0, -1],
  [3, 0, -1],
  [-3, 0, 2],
  [0, 0, 2],
  [3, 0, 2],
];

function Scene({ agents, maxDesks = 6, onAgentClick, onEmptyDeskClick }: OfficeSceneProps) {
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

      <AmbientParticles count={40} />
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={6}
        maxDistance={18}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 3}
        autoRotate
        autoRotateSpeed={0.3}
        target={[0, 0, 0.5]}
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
            position: [8, 6, 8],
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
