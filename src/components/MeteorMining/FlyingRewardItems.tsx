import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

interface JewelPieceData {
  id: number;
  progress: number;
  delay: number;
  curveAxis: THREE.Vector3;
  curveScale: number;
  rotation: THREE.Euler;
  startTime: number;
}

interface FlyingJewelPiecesSystemProps {
  startPosition: [number, number, number];
  userRef: React.RefObject<THREE.Group>;
  totalAnimationDuration: number;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  maxInstances?: number;
  jewelPieceCount?: number;
  isTriggered: boolean;
}

const FlyingJewelPiecesSystem: React.FC<FlyingJewelPiecesSystemProps> = ({
  startPosition,
  userRef,
  totalAnimationDuration,
  geometry,
  material,
  isTriggered,
  maxInstances = 1000,
  jewelPieceCount = 20
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [activeJewelPieces, setActiveJewelPieces] = useState<JewelPieceData[]>([]);
  const clockRef = useRef(new THREE.Clock());

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const dummyVectorRef = useRef(new THREE.Vector3());
  const startPos = useMemo(() => new THREE.Vector3(...startPosition), [startPosition]);
  const zeroVectorRef = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (isTriggered) {
      triggerAnimation();
    }
  }, [isTriggered]);

  const triggerAnimation = () => {
    if (activeJewelPieces.length >= maxInstances) return;
    
    const currentTime = clockRef.current.getElapsedTime();
    const newJewelPieces: JewelPieceData[] = Array(jewelPieceCount).fill(null).map((_, index) => {
      return {
        id: activeJewelPieces.length + index,
        progress: 0,
        delay: (index / jewelPieceCount) * totalAnimationDuration * 0.2,
        curveAxis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
        curveScale: 2 + Math.random() * 3,
        rotation: new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ),
        startTime: currentTime,
      };
    });

    setActiveJewelPieces(prevJewelPieces => [...prevJewelPieces, ...newJewelPieces]);
  };

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...startPosition);
    }
  }, [startPosition]);

  useFrame(() => {
    if (!meshRef.current || !userRef.current) return;

    const currentTime = clockRef.current.getElapsedTime();
    const userPosition = userRef.current.position;

    const newActiveJewelPieces = activeJewelPieces.filter(jewelPiece => {
      const jewelPieceAnimationTime = currentTime - jewelPiece.startTime - jewelPiece.delay;
      return jewelPieceAnimationTime < totalAnimationDuration;
    });

    newActiveJewelPieces.forEach((jewelPiece, i) => {
      const jewelPieceAnimationTime = currentTime - jewelPiece.startTime - jewelPiece.delay;
      if (jewelPieceAnimationTime < 0) return;

      jewelPiece.progress = Math.min(jewelPieceAnimationTime / totalAnimationDuration, 1);

      // linear
      const t = jewelPiece.progress;
      
      dummy.position.lerpVectors(zeroVectorRef.current, userPosition.clone().sub(startPos), t);
      
      const curveOffset = dummyVectorRef.current.copy(jewelPiece.curveAxis)
        .multiplyScalar(Math.sin(t * Math.PI) * jewelPiece.curveScale);
      dummy.position.add(curveOffset);
      
      const scale = 1 - t * 0.8;
      dummy.scale.set(scale, scale, scale);
      
      dummy.rotation.copy(jewelPiece.rotation);
      
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.count = newActiveJewelPieces.length;
    setActiveJewelPieces(newActiveJewelPieces);
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, maxInstances]} />
  );
};

export default FlyingJewelPiecesSystem;