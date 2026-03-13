import { staticResourcePaths } from '@client/config/staticResourcePaths';
import { AvatarStore } from '@client/contexts/AvatarAppearanceContext';
import { genericStore } from '@client/contexts/GlobalStateContext';
import React, { useEffect, useState } from 'react';
import { BoxGeometry } from 'three';
import { mergeBufferGeometries } from 'three-stdlib';
import { CharacterRef } from './Character';
import StoreEntryExitTriggerArea from './StoreEntryExitTriggerArea';

type DanceFloorProps = {
  characterRef: React.MutableRefObject<CharacterRef | null>;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
};

const DanceFloor: React.FC<DanceFloorProps> = ({ characterRef, position, rotation = [0, 0, 0], scale = [10, 1, 10] }) => {
  const [isInDanceArea, setIsInDanceArea] = useState(false);

  const selectRandomDanceIndex = () => {
    const randomIndex = Math.floor(Math.random() * staticResourcePaths.danceAnims.length);
    return randomIndex;
  };

  const startDancing = () => {
    const randomDanceIndex = selectRandomDanceIndex();
    AvatarStore.getState().setAvatarAnimationState('dance');
    AvatarStore.setState({ currentDanceAnimationIndex: randomDanceIndex })
    genericStore.setState({ isOnDanceFloor: true })
  };

  const stopDancing = () => {
    genericStore.setState({ isOnDanceFloor: false })
    AvatarStore.getState().setAvatarAnimationState('idle');
    AvatarStore.setState({ currentDanceAnimationIndex: null })
  };

  useEffect(() => {
    if (isInDanceArea) {
      startDancing();
    } else {
      stopDancing();
    }
  }, [isInDanceArea]);

  const createTwoPlaneGeometry = (width: number, height: number, depth: number) => {
    const thickness = 0.1; // Thickness of each plane
    const separation = height; // Vertical separation between planes

    const bottomPlane = new BoxGeometry(width, thickness, depth);
    const topPlane = new BoxGeometry(width, thickness, depth);

    // Move the top plane up
    topPlane.translate(0, separation, 0);

    // Merge the geometries
    const mergedGeometry = mergeBufferGeometries([bottomPlane, topPlane]);

    return mergedGeometry;
  };

  const geometry = createTwoPlaneGeometry(scale[0], 3, scale[2]); // Height of 2 units between planes

  return (
    <>
      {geometry && (
        <StoreEntryExitTriggerArea
          keyId="danceFloorTriggerArea"
          characterRef={characterRef}
          geometry={geometry}
          transform={{
            position: position,
            rotation: rotation,
            scale: [1, 1, 1]
          }}
          onInside={() => {
            setIsInDanceArea(true)
          }}
          onOutside={() => {
            setIsInDanceArea(false)
          }}
        />
      )}
    </>
  );
};

export default DanceFloor;
