import React from 'react';

interface LoaderProps {
  onStart: () => void;
}

export const Loader: React.FC<LoaderProps> = ({ onStart }) => {
  return (
    <div 
      className="w-screen h-screen flex flex-col justify-center items-center cursor-pointer bg-space-blue"
      onClick={onStart}
    >
      <h1 className="text-6xl md:text-8xl font-black tracking-widest text-white animate-pulse" style={{textShadow: '0 0 15px #00ffea, 0 0 25px #00ffea'}}>
        SOUL FREE
      </h1>
      <p className="mt-8 text-xl text-neon-cyan animate-pulse">Click anywhere to begin the experience</p>
    </div>
  );
};
