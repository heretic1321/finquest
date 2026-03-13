import { staticResourcePaths } from '@client/config/staticResourcePaths';
import { CameraControlsStore } from '@client/contexts/CameraControlsContext';
import { HUDStore } from '@client/contexts/HUDContext';
import { TransformLite } from '@client/utils/commonTypes';
import { Detailed, Text, useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { BoxGeometry, Euler, Group, MeshStandardMaterial, Quaternion, Vector3 } from 'three';
import { GLTF } from 'three-stdlib';
import { CharacterRef } from '../Character';
import MyBillboard from '../shared/MyBillboard';
import StoreEntryExitTriggerArea from '../StoreEntryExitTriggerArea';
import { MeteorManagerStore, RewardMachineMode } from './MeteorManager';
import RedeemMachineAdaptiveScreen from './RedeemMachineAdaptiveScreen';
import { trackEvent } from '@client/utils/api';
import { MeteorResource } from '@client/utils/meteorAPI';
import { getUserID } from '@client/utils/helperFunctions';

export type GLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.Mesh;
  };
};

type RedeemMachineProps = {
  transform?: {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
  };
  characterRef: React.MutableRefObject<CharacterRef | null>
  material: MeshStandardMaterial
  screenMaterial: THREE.MeshBasicMaterial
};

export function RedeemMachine(props: RedeemMachineProps) {
  const [isTopTagVisible, _] = useState(true);
  const topTagRef = useRef<typeof Text>(null)
  const rewardMachineMode = MeteorManagerStore((state) => state.rewardMachineMode);
  const { camera } = useThree();
  const originalCameraPosition = useRef(new Vector3());
  const originalCameraRotation = useRef(new Quaternion());
  const targetPosition = new Vector3(
    -76.32999871786727,
    6.2393324944584005,
    -120.39012112669708
  );
  const targetRotation = new Euler(
    -0.008000867794376799,
    -0.014728352153520743,
    -0.00011783785196072265
  );
  const [textMaterial, __] = useState<THREE.Material>(new THREE.MeshBasicMaterial({ color: 'white' }))
  const topTagTransform: TransformLite = {
    position: [
      -73.95450638327692,
      9.550299465253618,
      -124.4662961996
    ],
    rotation: [0, 0, 0],
    scale: [1.4306802850117986, 1.4306802850117986, 1.4306802850117986]
  }

  const geometry = useMemo(() => {
    return new BoxGeometry(19.71725229296133, 0.01, 19.71725229296133)
  }, [])

  const group = useRef<Group>(null);
  const highLOD = useGLTF(staticResourcePaths.redeemMachineHighLOD) as GLTFResult;
  const lowLOD = useGLTF(staticResourcePaths.redeemMachineLowLOD) as GLTFResult;
  const { scene } = useGLTF(staticResourcePaths.redeemMachineScreen)
  const screenScene = useMemo(() => {
    // traverse scene and set material
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.name == "screenBorder")
          child.material = props.material
        else if (child.name == "screenSurface")
          child.material = props.screenMaterial
      }
    });
    return scene;

  }, [scene, props.material]);

  const [needToCloseRewardMachine, setNeedToCloseRewardMachine] =
    useState(false)
  useEffect(() => {
    let resourceBeforeAction: MeteorResource = {
      gold: MeteorManagerStore.getState().rewardsData.gold,
      silver: MeteorManagerStore.getState().rewardsData.silver,
      diamond: MeteorManagerStore.getState().rewardsData.diamond,
    }
    if (
      rewardMachineMode == RewardMachineMode.OUTSIDE &&
      needToCloseRewardMachine
    ) {
      trackEvent(
        'Reward_Redeem_Machine',
        {
          action: 'Close_Redeem_Machine',
          current_resources: resourceBeforeAction,
        },
        getUserID(),
      )
      CameraControlsStore.getState().orbitControlsRef.current!.enabled = true
    } else if (
      rewardMachineMode == RewardMachineMode.TRAVELLING_OUTSIDE_TO_INSIDE
    ) {
      originalCameraPosition.current.copy(camera.position)
      originalCameraRotation.current.copy(camera.quaternion)

      CameraControlsStore.getState().orbitControlsRef.current!.enabled = false
    } else if (rewardMachineMode == RewardMachineMode.INSIDE) {
      trackEvent(
        'Reward_Redeem_Machine',
        {
          action: 'Open_Redeem_Machine',
          current_resources: resourceBeforeAction,
        },
        getUserID(),
      )
      setNeedToCloseRewardMachine(true)
      HUDStore.setState({ isRedeemMachineScreenUIVisible: true })
    } else if (
      rewardMachineMode == RewardMachineMode.TRAVELLING_INSIDE_TO_OUTSIDE
    ) {
      // pass
    }
  }, [rewardMachineMode, camera])


  const highLODNodeName = 'highLOD';
  const lowLODNodeName = 'lowLOD';


  return (
    <>
      <group ref={group} {...props.transform}>
        <Detailed distances={[0, 50]} objects={null}>
          {highLOD.nodes[highLODNodeName] && (
            <mesh
              geometry={highLOD.nodes[highLODNodeName].geometry}
              material={props.material}
            />
          )}
          {lowLOD.nodes[lowLODNodeName] && (
            <mesh
              geometry={lowLOD.nodes[lowLODNodeName].geometry}
              material={props.material}
            />
          )}
        </Detailed>
      </group>

      {/* Top tag */}
      {
        isTopTagVisible &&
        <>
          {/* <MyTransformControls objectRef={topTagRef} /> */}
          <MyBillboard objectRef={topTagRef} />
          <Text
            material={textMaterial}
            anchorX="center"
            anchorY="middle"
            ref={topTagRef}
            position={topTagTransform.position}
            rotation={topTagTransform.rotation}
            scale={topTagTransform.scale}
            font={staticResourcePaths.rajdhaniFont}
            outlineWidth={0.1}
          >
            REWARD REDEEM MACHINE
          </Text>
        </>
      }

      <StoreEntryExitTriggerArea
        keyId="rewardRedeemMachineTriggerArea"
        characterRef={props.characterRef}
        geometry={geometry}
        transform={{
          position: [
            -72.63324429620634,
            2.046557297772745,
            -123.23880665218404
          ],
          rotation: props.transform?.rotation || [0, 0, 0],
          scale: [
            1,1,1
          ]
        }}
        onInside={() => {
          HUDStore.setState({ isRewardRedeemMachinePromptShown: true });
        }}
        onOutside={() => {
          HUDStore.setState({ isRewardRedeemMachinePromptShown: false });
        }}
        transformControlsEnabled={false}
      />
      <RedeemMachineAdaptiveScreen
        targetCameraPosition={targetPosition}
        targetCameraRotation={targetRotation}
        planeDistance={3.1012355948}
        fov={60}
        model={screenScene}
      />
    </>
  );
}