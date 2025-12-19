import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Effects } from './Effects';
import { Particles } from './Particles';
import { Cards } from './Cards';
import type { HandData, Config } from '../types';

interface SceneProps {
  handData: HandData;
  config: Config;
}

export const Scene: React.FC<SceneProps> = ({ handData, config }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 18], fov: 75 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color('#02020a'));
      }}
    >
      <fog attach="fog" args={['#02020a', 15, 35]} />
      <ambientLight intensity={1.5} />
      <pointLight position={[0, 0, 15]} intensity={50} color="#00ffea" />
      
      <Suspense fallback={null}>
        <Cards handData={handData} config={config} />
        <Particles count={config.particleCount} />
        <Effects config={config} />
      </Suspense>
    </Canvas>
  );
};