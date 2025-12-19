import React from 'react';
import type { HandData, SingleHandResult } from '../types';

interface CursorProps {
  handData: HandData;
  isVisible: boolean;
}

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index Finger
  [5, 9], [9, 10], [10, 11], [11, 12], // Middle Finger
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring Finger
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
];

const HandSkeleton: React.FC<{ hand: SingleHandResult }> = ({ hand }) => {
  if (!hand?.landmarks) return null;

  const { landmarks } = hand;
  const width = window.innerWidth;
  const height = window.innerHeight;

  return (
    <g>
      {HAND_CONNECTIONS.map(([startIdx, endIdx], i) => {
        const start = landmarks[startIdx];
        const end = landmarks[endIdx];
        if (!start || !end) return null;
        return (
          <line
            key={`line-${i}`}
            x1={(1 - start.x) * width}
            y1={start.y * height}
            x2={(1 - end.x) * width}
            y2={end.y * height}
            stroke="url(#line-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
      {landmarks.map((landmark, i) => (
        <circle
          key={`circle-${i}`}
          cx={(1 - landmark.x) * width}
          cy={landmark.y * height}
          r="5"
          fill="#00ffea"
        />
      ))}
    </g>
  );
};


export const Cursor: React.FC<CursorProps> = ({ handData, isVisible }) => {
  if (!isVisible || handData.length === 0) return null;

  return (
    <svg className="fixed top-0 left-0 w-full h-full pointer-events-none z-50" style={{ filter: 'drop-shadow(0 0 5px #00ffea)'}}>
       <defs>
        <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#833ab4', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#00ffea', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      {handData.map((hand, index) => (
        <HandSkeleton key={index} hand={hand} />
      ))}
    </svg>
  );
};