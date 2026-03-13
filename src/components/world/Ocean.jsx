import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';

export default function Ocean() {
  const meshRef = useRef();

  const {
    waterColor,
    opacity,
    waveSpeed,
    waveHeight,
    yOffset,
  } = useControls('Ocean', {
    waterColor: { value: '#1a6ea0' },
    opacity: { value: 0.85, min: 0, max: 1, step: 0.01 },
    waveSpeed: { value: 0.5, min: 0, max: 5, step: 0.05 },
    waveHeight: { value: 0.1, min: 0, max: 2, step: 0.01 },
    yOffset: { value: -0.3, min: -5, max: 5, step: 0.1 },
  });

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = Math.sin(t * waveSpeed) * waveHeight + yOffset;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, yOffset, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial
        color={waterColor}
        transparent
        opacity={opacity}
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  );
}
