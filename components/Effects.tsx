import React from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';
import type { Config } from '../types';

interface EffectsProps {
  config: Config;
}
export const Effects: React.FC<EffectsProps> = ({ config }) => {
  return (
    <EffectComposer>
      <Bloom
        intensity={config.bloomStrength}
        luminanceThreshold={config.bloomThreshold}
        luminanceSmoothing={config.bloomRadius}
        kernelSize={KernelSize.LARGE}
      />
    </EffectComposer>
  );
};
