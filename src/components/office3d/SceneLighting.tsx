'use client';

export default function SceneLighting() {
  return (
    <>
      {/* Ambient fill */}
      <ambientLight intensity={0.15} color="#94a3b8" />

      {/* Main overhead light */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.4}
        color="#e2e8f0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Cool rim light */}
      <directionalLight
        position={[-5, 3, -5]}
        intensity={0.15}
        color="#6366F1"
      />

      {/* Warm accent light */}
      <pointLight
        position={[0, 4, 0]}
        intensity={0.2}
        color="#818CF8"
        distance={15}
      />

      {/* Floor spotlight */}
      <spotLight
        position={[0, 8, 0]}
        angle={0.5}
        penumbra={0.8}
        intensity={0.3}
        color="#f1f5f9"
        castShadow
      />

      {/* Fog for depth */}
      <fog attach="fog" args={['#08090D', 10, 25]} />
    </>
  );
}
