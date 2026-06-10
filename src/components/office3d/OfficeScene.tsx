'use client';

import { Suspense, useCallback, useMemo, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import OfficeFloor from './OfficeFloor';
import AgentDesk from './AgentDesk';
import EmptyDesk from './EmptyDesk';
import MeetingRoom from './MeetingRoom';
import AmbientParticles from './AmbientParticles';
import SceneLighting from './SceneLighting';
import WalkingAgent from './WalkingAgent';
import CoffeeMachine from './CoffeeMachine';
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

export type AgentActivity = 'desk' | 'coffee' | 'bathroom' | 'walking';

interface AgentState {
  agent: Agent3D;
  activity: AgentActivity;
  nextChange: number; // timestamp when activity changes
}

interface OfficeSceneProps {
  agents: Agent3D[];
  maxDesks?: number;
  onAgentClick?: (agentId: string) => void;
  onEmptyDeskClick?: () => void;
  onMeetingClick?: () => void;
}

// Desk positions
const DESK_POSITIONS: [number, number, number][] = [
  [-4, 0, -1.5],
  [-1, 0, -1.5],
  [2, 0, -1.5],
  [-4, 0, 1.5],
  [-1, 0, 1.5],
  [2, 0, 1.5],
];

// Coffee machine position
const COFFEE_POS: [number, number, number] = [-6, 0, 0];
// Bathroom area
const BATHROOM_POS: [number, number, number] = [-6, 0, 3];
// Meeting room
const MEETING_POS: [number, number, number] = [6, 0, 0];

// Random walk waypoints
const WALK_PATHS: [number, number, number][][] = [
  [[-2, 0, 0], [0, 0, 0], [2, 0, 0], [0, 0, 2]],
  [[1, 0, 0], [3, 0, 1], [1, 0, 2], [-1, 0, 1]],
  [[-3, 0, 1], [-1, 0, 0], [1, 0, 1], [-1, 0, 2]],
];

function getRandomActivity(): AgentActivity {
  const r = Math.random();
  if (r < 0.6) return 'desk';
  if (r < 0.78) return 'coffee';
  if (r < 0.9) return 'walking';
  return 'bathroom';
}

function getActivityDuration(activity: AgentActivity): number {
  switch (activity) {
    case 'desk': return 15000 + Math.random() * 25000;
    case 'coffee': return 8000 + Math.random() * 7000;
    case 'bathroom': return 6000 + Math.random() * 5000;
    case 'walking': return 10000 + Math.random() * 8000;
  }
}

function Scene({ agents, maxDesks = 6, onAgentClick, onEmptyDeskClick, onMeetingClick }: OfficeSceneProps) {
  const [agentStates, setAgentStates] = useState<AgentState[]>([]);

  // Initialize agent states — keep stable mapping by agent id
  useEffect(() => {
    setAgentStates(prev => {
      // Preserve existing states for agents that are still present
      const existingMap = new Map(prev.map(s => [s.agent.id, s]));
      return agents.map((agent, i) => {
        const existing = existingMap.get(agent.id);
        if (existing) {
          return { ...existing, agent }; // update agent data, keep activity
        }
        return {
          agent,
          activity: 'desk' as AgentActivity, // Start at desk
          nextChange: Date.now() + 5000 + Math.random() * 15000,
        };
      });
    });
  }, [agents]);

  // Periodic activity changes
  useEffect(() => {
    if (agents.length === 0) return;
    const interval = setInterval(() => {
      setAgentStates(prev => prev.map(state => {
        if (Date.now() >= state.nextChange) {
          const newActivity = getRandomActivity();
          return {
            ...state,
            activity: newActivity,
            nextChange: Date.now() + getActivityDuration(newActivity),
          };
        }
        return state;
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [agents.length]);

  const handleDeskClick = useCallback((agentId: string) => {
    onAgentClick?.(agentId);
  }, [onAgentClick]);

  // Build a lookup: agentId -> activity
  const activityMap = useMemo(() => {
    const map = new Map<string, AgentActivity>();
    agentStates.forEach(s => map.set(s.agent.id, s.activity));
    return map;
  }, [agentStates]);

  // Agents doing non-desk activities
  const coffeeAgents = agentStates.filter(s => s.activity === 'coffee');
  const bathroomAgents = agentStates.filter(s => s.activity === 'bathroom');
  const walkingAgents = agentStates.filter(s => s.activity === 'walking');

  return (
    <>
      <SceneLighting />
      <OfficeFloor />
      
      {/* Desks — each hired agent has a DEDICATED desk by index */}
      {DESK_POSITIONS.map((position, index) => {
        // Agent assigned to this desk position (stable by index)
        const assignedAgent = index < agents.length ? agents[index] : null;
        
        if (assignedAgent) {
          const activity = activityMap.get(assignedAgent.id) || 'desk';
          const isAtDesk = activity === 'desk';
          
          return (
            <Float
              key={`desk-${assignedAgent.id}`}
              speed={1.5}
              rotationIntensity={0}
              floatIntensity={0.3}
              floatingRange={[-0.05, 0.05]}
            >
              <AgentDesk
                position={position}
                agent={assignedAgent}
                onClick={() => handleDeskClick(assignedAgent.id)}
                isAway={!isAtDesk}
              />
            </Float>
          );
        }
        
        // Empty desk for remaining positions (hire slots)
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

      {/* Coffee Machine Area */}
      <CoffeeMachine position={COFFEE_POS} />
      {coffeeAgents.map((state, i) => (
        <WalkingAgent
          key={`coffee-${state.agent.id}`}
          agent={state.agent}
          targetPosition={[COFFEE_POS[0] + 0.8 + i * 0.6, 0.8, COFFEE_POS[2] + 0.3]}
          activity="coffee"
        />
      ))}

      {/* Bathroom Area Indicator */}
      <group position={BATHROOM_POS}>
        {/* Door */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[0.6, 1.2, 0.08]} />
          <meshStandardMaterial color="#1a1d2e" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* Sign */}
        <mesh position={[0, 1.3, 0.05]}>
          <boxGeometry args={[0.3, 0.15, 0.02]} />
          <meshStandardMaterial color="#334155" emissive="#475569" emissiveIntensity={0.3} />
        </mesh>
      </group>
      {bathroomAgents.map((state) => (
        <WalkingAgent
          key={`bath-${state.agent.id}`}
          agent={state.agent}
          targetPosition={[BATHROOM_POS[0] + 0.8, 0.8, BATHROOM_POS[2]]}
          activity="bathroom"
        />
      ))}

      {/* Walking Agents */}
      {walkingAgents.map((state, i) => (
        <WalkingAgent
          key={`walk-${state.agent.id}`}
          agent={state.agent}
          targetPosition={WALK_PATHS[i % WALK_PATHS.length][Math.floor(Date.now() / 3000) % 4]}
          activity="walking"
        />
      ))}

      {/* Meeting Room */}
      <Float speed={0.8} rotationIntensity={0} floatIntensity={0.15} floatingRange={[-0.02, 0.02]}>
        <MeetingRoom position={MEETING_POS} onClick={onMeetingClick} />
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
        target={[0, 0, 0]}
      />
    </>
  );
}

export default function OfficeScene(props: OfficeSceneProps) {
  return (
    <div className={styles.sceneContainer}>
      <div className={styles.badge3d}>
        <span className={styles.badge3dDot}></span>
        مكتبك المباشر
        {props.agents.length > 0 && (
          <span style={{ marginInlineStart: '8px', fontSize: '0.7rem', color: '#64748B' }}>
            {props.agents.length} موظف
          </span>
        )}
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
