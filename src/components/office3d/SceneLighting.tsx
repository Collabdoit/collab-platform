'use client';

export default function SceneLighting() {
  return (
    <>
      {/* Ambient fill — boosted to compensate for no Environment HDR */}
      <ambientLight intensity={0.35} color="#cbd5e1" />

      {/* Main overhead light */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.5}
        color="#e2e8f0"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-far={25}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Cool rim light */}
      <directionalLight
        position={[-5, 3, -5]}
        intensity={0.2}
        color="#6366F1"
      />

      {/* Warm accent light */}
      <pointLight
        position={[0, 4, 0]}
        intensity={0.3}
        color="#818CF8"
        distance={15}
      />

      {/* Fog for depth */}
      <fog attach="fog" args={['#08090D', 12, 28]} />
    </>
  );
}
