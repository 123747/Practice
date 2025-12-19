import React from 'react';

interface HUDProps {
  isVisible: boolean;
  status: string;
}

export const HUD: React.FC<HUDProps> = ({ isVisible, status }) => {
  return (
    <div className={`fixed top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-10 pointer-events-none transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-white" style={{textShadow: '0 0 5px #00ffea, 0 0 10px #00ffea'}}>
        SOUL FREE
      </h1>
      <div className="flex items-center space-x-3 bg-black bg-opacity-30 backdrop-blur-sm px-4 py-2 rounded-full">
        <span className={`w-3 h-3 rounded-full ${status === 'Hand Detected' ? 'bg-green-400' : 'bg-red-500'} animate-pulse`}></span>
        <p className="text-sm md:text-base text-neon-cyan">{status}</p>
      </div>
    </div>
  );
};
