import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createParticleTexture } from '../lib/textureUtils';

interface ParticlesProps {
  count: number;
}

export const Particles: React.FC<ParticlesProps> = ({ count }) => {
  // FIX: The ref was incorrectly typed as THREE.Points. The component uses an <instancedMesh>,
  // so the ref should be typed as THREE.InstancedMesh to access properties like `setMatrixAt` and `instanceMatrix`.
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const particleTexture = useMemo(() => createParticleTexture(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const time = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.005 + Math.random() / 200;
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 50;
      temp.push({ time, factor, speed, x, y, z });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    particles.forEach((particle, i) => {
      let { factor, speed, x, y, z } = particle;
      const t = (particle.time += speed);
      dummy.position.set(
        x + Math.cos(t) + Math.sin(t * 1) / 10,
        y + Math.sin(t) + Math.cos(t * 2) / 10,
        z + Math.cos(t) + Math.sin(t * 3) / 10
      );
      dummy.scale.setScalar(1);
      dummy.rotation.y = Math.sin(t * 0.5);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshBasicMaterial 
        map={particleTexture}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent={true}
        opacity={0.7}
      />
    </instancedMesh>
  );
};