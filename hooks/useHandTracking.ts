import { useRef, useCallback, useEffect } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { Landmark } from '@mediapipe/tasks-vision';
import type { HandData, GestureType, Config, SingleHandResult } from '../types';

let handLandmarker: HandLandmarker | null = null;
let lastVideoTime = -1;

export const useHandTracking = (
  onHandData: (data: HandData) => void,
  setStatus: (status: string) => void,
  config: Config
) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameId = useRef<number | undefined>(undefined);

  const createHandLandmarker = useCallback(async () => {
    try {
      setStatus('Loading models...');
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm"
      );
      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });
      setStatus('Models loaded. Starting camera...');
    } catch (error) {
      console.error("Error creating HandLandmarker:", error);
      setStatus('Error loading models.');
    }
  }, [setStatus]);

  const predictWebcam = useCallback(() => {
    if (!handLandmarker || !videoRef.current || !videoRef.current.srcObject) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const video = videoRef.current;
    if (video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;
      const results = handLandmarker.detectForVideo(video, performance.now());

      if (results.landmarks && results.landmarks.length > 0) {
        setStatus('Hand Detected');
        
        const newHandData: HandData = results.landmarks.map((landmarks) => {
          const thumbTip = landmarks[4];
          const indexTip = landmarks[8];
          const middleTip = landmarks[12];
          const ringTip = landmarks[16];
          const pinkyTip = landmarks[20];
          const wrist = landmarks[0];
          const middlePip = landmarks[9];

          const pinchDistance = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y, thumbTip.z - indexTip.z);
          
          const palmCenter = {
              x: (wrist.x + middlePip.x) / 2,
              y: (wrist.y + middlePip.y) / 2,
              z: (wrist.z + middlePip.z) / 2,
          };

          const fingertips = [indexTip, middleTip, ringTip, pinkyTip];
          const avgDistToPalm = fingertips.reduce((sum, tip) => {
              return sum + Math.hypot(tip.x - palmCenter.x, tip.y - palmCenter.y, tip.z - palmCenter.z);
          }, 0) / fingertips.length;

          let gesture: GestureType = 'none';

          if (pinchDistance < config.pinchSensitivity) {
              gesture = 'pinch';
          } else if (avgDistToPalm < 0.13) {
              gesture = 'fist';
          } else if (avgDistToPalm > 0.25) {
              gesture = 'open_palm';
          } else {
              gesture = 'release';
          }
          
          return {
            landmarks,
            gesture,
            pinchMidPoint: gesture === 'pinch' ? {
                x: (thumbTip.x + indexTip.x) / 2,
                y: (thumbTip.y + indexTip.y) / 2,
                z: (thumbTip.z + indexTip.z) / 2,
            } : null,
            indexFingerTip: indexTip,
            handCenter: palmCenter
          };
        });

        onHandData(newHandData);

      } else {
        setStatus('No Hand Detected');
        onHandData([]);
      }
    }
    animationFrameId.current = requestAnimationFrame(predictWebcam);
  }, [onHandData, setStatus, config]);

    useEffect(() => {
        // If a loop is running and the function updates (e.g. config changes), 
        // restart the loop with the new function to avoid stale closures.
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = requestAnimationFrame(predictWebcam);
        }
    }, [predictWebcam]);


  const startHandTracking = useCallback(async () => {
    if (!handLandmarker) {
      await createHandLandmarker();
    }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadeddata", () => {
             setStatus('Camera ready. Detecting hands...');
             predictWebcam();
          });
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
        setStatus('Webcam access denied.');
      }
    }
  }, [createHandLandmarker, predictWebcam, setStatus]);

  const stopHandTracking = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);
  
  useEffect(() => {
      return () => {
          stopHandTracking();
      }
  }, [stopHandTracking]);

  return { videoRef, startHandTracking, stopHandTracking };
};