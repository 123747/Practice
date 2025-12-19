import type { Landmark } from '@mediapipe/tasks-vision';

export type GestureType = 'none' | 'pinch' | 'release' | 'open_palm' | 'fist';

export interface SingleHandResult {
  landmarks: Landmark[];
  gesture: GestureType;
  pinchMidPoint: { x: number; y: number; z: number } | null;
  indexFingerTip: { x: number; y: number; z: number } | null;
  handCenter: { x: number; y: number; z: number } | null;
}

export type HandData = SingleHandResult[];

export interface Config {
  particleCount: number;
  cardSize: number;
  rotationSpeed: number;
  floatSpeed: number;
  bloomStrength: number;
  bloomRadius: number;
  bloomThreshold: number;
  readScale: number;
  pinchSensitivity: number;
}