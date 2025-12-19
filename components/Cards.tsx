import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { ALL_CARD_TEXTS, CARD_GRADIENTS, NUM_CARDS, SPHERE_RADIUS } from '../constants';
import { createCardTexture } from '../lib/textureUtils';
import type { HandData, Config } from '../types';

interface CardData {
  id: number;
  text: string;
  texture: THREE.CanvasTexture;
  initialPos: THREE.Vector3;
  scatterPos: THREE.Vector3;
}

const Card: React.FC<{ 
    data: CardData; 
    config: Config; 
    isSelected: boolean; 
    isAnySelected: boolean;
    targetPos: THREE.Vector3;
    damping: number;
}> = ({ data, config, isSelected, isAnySelected, targetPos, damping }) => {
  const ref = useRef<THREE.Mesh>(null!);
  const { camera } = useThree();

  useEffect(() => {
    if (ref.current) {
      // Orient the card to face outwards from the sphere's center (0,0,0)
      const center = new THREE.Vector3(0, 0, 0);
      ref.current.lookAt(center);
      // A plane's front face is its +Z. lookAt points the -Z axis towards the target.
      // So we rotate 180 degrees on Y to make the front face point outwards.
      ref.current.rotateY(Math.PI);
    }
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    
    if (isSelected) {
      // --- POSITION ---
      // 1. Define target position in world space (in front of the camera).
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const worldTargetPos = camera.position.clone().add(forward.multiplyScalar(6));
      
      // 2. Convert world position to the parent group's local space.
      let localTargetPos = worldTargetPos;
      if (ref.current.parent) {
        localTargetPos = ref.current.parent.worldToLocal(worldTargetPos.clone());
      }
      ref.current.position.lerp(localTargetPos, damping);

      // --- ROTATION ---
      // 1. Define target rotation in world space (flat, facing camera).
      const targetWorldQuaternion = new THREE.Quaternion(); // Identity quaternion (no rotation).

      // 2. Convert world rotation to local rotation.
      // Q_local = Q_parent_inverse * Q_world
      let targetLocalQuaternion = targetWorldQuaternion;
      if (ref.current.parent) {
        const parentWorldQuaternion = new THREE.Quaternion();
        ref.current.parent.getWorldQuaternion(parentWorldQuaternion);
        targetLocalQuaternion = parentWorldQuaternion.invert().multiply(targetWorldQuaternion);
      }
      ref.current.quaternion.slerp(targetLocalQuaternion, damping);

    } else {
      // For non-selected cards, move to the position determined by the parent.
      ref.current.position.lerp(targetPos, damping);
      // No rotation is applied here, so they maintain their initial outward-facing orientation relative to the parent.
    }

    const scale = isSelected ? config.readScale : isAnySelected ? 0 : config.cardSize;
    ref.current.scale.lerp(new THREE.Vector3(scale, scale, scale), damping);
  });

  return (
    <mesh ref={ref} position={data.initialPos}>
      <planeGeometry args={[2, 1]} />
      <meshStandardMaterial map={data.texture} side={THREE.DoubleSide} transparent opacity={0.9} />
    </mesh>
  );
};

const getFibonacciSpherePoint = (i: number, n: number, radius: number): THREE.Vector3 => {
    const phi = Math.acos(1 - 2 * (i + 0.5) / n);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const x = radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
};


export const Cards: React.FC<{ handData: HandData; config: Config; }> = ({ handData, config }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [isScattered, setIsScattered] = useState(false);
  const [damping, setDamping] = useState(0.1);
  const { camera } = useThree();
  const targetRotationY = useRef(0);


  const cardData = useMemo<CardData[]>(() => {
    const initialCards = Array.from({ length: NUM_CARDS }, (_, i) => {
      const text = ALL_CARD_TEXTS[i % ALL_CARD_TEXTS.length];
      const gradient = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
      const texture = createCardTexture(text, gradient);
      const scatterPos = new THREE.Vector3(
        (Math.random() - 0.5) * SPHERE_RADIUS * 3,
        (Math.random() - 0.5) * SPHERE_RADIUS * 3,
        (Math.random() - 0.5) * SPHERE_RADIUS * 3
      );
      return { id: i, text, texture, initialPos: new THREE.Vector3(), scatterPos };
    });

    for (let i = initialCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [initialCards[i], initialCards[j]] = [initialCards[j], initialCards[i]];
    }

    return initialCards.map((card, i) => ({
        ...card,
        initialPos: getFibonacciSpherePoint(i, NUM_CARDS, SPHERE_RADIUS)
    }));
  }, []);

  useEffect(() => {
    const isFist = handData?.some(h => h.gesture === 'fist');
    const isOpenPalm = handData?.some(h => h.gesture === 'open_palm');

    setDamping(isFist ? 0.2 : 0.1);

    if (isFist) {
      setIsScattered(false);
      setSelectedCardId(null);
    } else if (isOpenPalm) {
      setIsScattered(true);
      setSelectedCardId(null);
    }
  }, [handData]);

  useFrame((state) => {
    const { clock } = state;
    const fistHand = handData?.find(h => h.gesture === 'fist');

    if (groupRef.current) {
        if (selectedCardId === null) {
            // Only animate the group when no card is selected
            if (fistHand?.handCenter) {
                targetRotationY.current = (fistHand.handCenter.x - 0.5) * -Math.PI * 2;
                groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY.current, 0.1);
            } else {
                const baseRotation = clock.getElapsedTime() * config.rotationSpeed * 0.1;
                targetRotationY.current = THREE.MathUtils.lerp(targetRotationY.current, baseRotation, 0.02);
                groupRef.current.rotation.y = targetRotationY.current;
            }
            groupRef.current.position.y = Math.sin(clock.getElapsedTime() * config.floatSpeed) * 0.5;
        } else {
            // If a card is selected, smoothly bring group animations to a stop.
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY.current, 0.1);
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.1);
        }
    }
    
    camera.position.lerp(new THREE.Vector3(0, 0, 18), 0.1);
    camera.lookAt(groupRef.current?.position || new THREE.Vector3(0,0,0));

    const pinchingHand = handData?.find(h => h.gesture === 'pinch');
    const isAnyHandPinching = !!pinchingHand;

    if (pinchingHand && pinchingHand.pinchMidPoint && selectedCardId === null) {
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2(
        (pinchingHand.pinchMidPoint.x) * 2 - 1,
        -(pinchingHand.pinchMidPoint.y) * 2 + 1
      );
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(groupRef.current.children);
      if (intersects.length > 0) {
        const obj = intersects[0].object as THREE.Mesh;
        const cardIndex = cardData.findIndex(d => d.texture.id === (obj.material as any).map.id);
        if(cardIndex !== -1) setSelectedCardId(cardIndex);
      }
    } else if (selectedCardId !== null && !isAnyHandPinching) {
      setSelectedCardId(null);
    }
  });

  const getTargetPosition = (data: CardData) => {
    // When a card is selected, its position is calculated inside the Card component itself.
    // This function only provides the target for non-selected cards.
    return isScattered ? data.scatterPos : data.initialPos;
  };
  
  return (
    <group ref={groupRef}>
      {cardData.map((data) => (
        <Card
          key={data.id}
          data={data}
          config={config}
          isSelected={selectedCardId === data.id}
          isAnySelected={selectedCardId !== null}
          targetPos={getTargetPosition(data)}
          damping={damping}
        />
      ))}
    </group>
  );
};