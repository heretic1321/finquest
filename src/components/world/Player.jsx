import { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import Ecctrl from 'ecctrl';
import CharacterModel from './CharacterModel';
import useControlMode from '../../hooks/useControlMode';

export default function Player() {
  const ecctrlRef = useRef();
  const controlMode = useControlMode((s) => s.mode);

  // Respawn if player falls off the island
  useFrame(() => {
    const rb = ecctrlRef.current?.group;
    if (rb) {
      const position = rb.translation();
      if (position.y < -5) {
        rb.setTranslation({ x: 0, y: 5, z: 0 }, true);
        rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
      }
    }
  });

  return (
    <Ecctrl
      ref={ecctrlRef}
      capsuleHalfHeight={0.35}
      capsuleRadius={0.3}
      floatHeight={0}
      camInitDis={-7}
      camMaxDis={-10}
      camMinDis={-3}
      camInitDir={{ x: 0.3, y: 0 }}
      maxVelLimit={5}
      sprintMult={2}
      jumpVel={4}
      position={[0, 3, 5]}
      animated={true}
      mode={controlMode === 'pointToMove' ? 'PointToMove' : null}
    >
      <Suspense fallback={null}>
        <CharacterModel
          modelUrl="/models/characters/Female.glb"
          scale={0.72}
          position={[0, -0.65, 0]}
          rotation={[0, Math.PI, 0]}
        />
      </Suspense>
    </Ecctrl>
  );
}
