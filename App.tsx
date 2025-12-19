import React, { useState, useEffect, useCallback } from 'react';
import GUI from 'lil-gui';
import { Scene } from './components/Scene';
import { Loader } from './components/Loader';
import { HUD } from './components/HUD';
import { Cursor } from './components/Cursor';
import { useHandTracking } from './hooks/useHandTracking';
import type { HandData, Config } from './types';
import { INITIAL_CONFIG } from './constants';

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);
  const [handData, setHandData] = useState<HandData>([]);
  const [status, setStatus] = useState('Initializing...');
  const [config, setConfig] = useState<Config>(INITIAL_CONFIG);

  const { videoRef, startHandTracking, stopHandTracking } = useHandTracking(setHandData, setStatus, config);

  const handleStart = useCallback(() => {
    setIsStarted(true);
    startHandTracking();
  }, [startHandTracking]);

  // Effect for GUI management
  useEffect(() => {
    const gui = new GUI();
    const nebulaFolder = gui.addFolder('Nebula');
    nebulaFolder.add(config, 'particleCount', 1000, 10000, 100).name('Particle Count').onChange(v => setConfig(c => ({...c, particleCount: v})));
    nebulaFolder.add(config, 'cardSize', 0.1, 2, 0.05).name('Card Size').onChange(v => setConfig(c => ({...c, cardSize: v})));
    nebulaFolder.add(config, 'rotationSpeed', 0, 0.5, 0.01).name('Rotation Speed').onChange(v => setConfig(c => ({...c, rotationSpeed: v})));
    nebulaFolder.add(config, 'floatSpeed', 0, 0.5, 0.01).name('Float Speed').onChange(v => setConfig(c => ({...c, floatSpeed: v})));
    
    const effectsFolder = gui.addFolder('Visual Effects');
    effectsFolder.add(config, 'bloomStrength', 0, 5, 0.1).name('Bloom Strength').onChange(v => setConfig(c => ({...c, bloomStrength: v})));
    effectsFolder.add(config, 'bloomRadius', 0, 2, 0.05).name('Bloom Radius').onChange(v => setConfig(c => ({...c, bloomRadius: v})));
    effectsFolder.add(config, 'bloomThreshold', 0, 1, 0.01).name('Bloom Threshold').onChange(v => setConfig(c => ({...c, bloomThreshold: v})));

    const interactionFolder = gui.addFolder('Interaction');
    interactionFolder.add(config, 'readScale', 1, 10, 0.1).name('Read Scale').onChange(v => setConfig(c => ({...c, readScale: v})));
    interactionFolder.add(config, 'pinchSensitivity', 0.01, 0.2, 0.005).name('Pinch Sensitivity').onChange(v => setConfig(c => ({...c, pinchSensitivity: v})));

    if (isImmersive) {
      gui.hide();
    } else {
      gui.show();
    }
    
    return () => {
      gui.destroy();
    };
  }, [isImmersive, config]);

  // Effect for global event listeners and cleanup
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'c') {
        setIsImmersive(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function runs only on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopHandTracking();
    };
  }, [stopHandTracking]); // stopHandTracking is stable, so this effect runs once.

  return (
    <div className="w-screen h-screen bg-space-blue font-sans overflow-hidden">
      {!isStarted ? (
        <Loader onStart={handleStart} />
      ) : (
        <>
          <HUD isVisible={!isImmersive} status={status} />
          <Scene handData={handData} config={config} />
          <Cursor handData={handData} isVisible={!isImmersive && handData.length > 0} />
          <video ref={videoRef} className={`absolute bottom-4 right-4 w-48 h-36 rounded-lg shadow-2xl shadow-neon-cyan/20 transition-opacity duration-500 ${isImmersive ? 'opacity-0' : 'opacity-70'}`} style={{ transform: 'scaleX(-1)' }} playsInline autoPlay muted />
        </>
      )}
    </div>
  );
};

export default App;