import { staticResourcePaths } from "@client/config/staticResourcePaths";
import { CameraControlsStore } from "@client/contexts/CameraControlsContext";
import { HUDStore } from "@client/contexts/HUDContext";
import { TransformLite } from "@client/utils/commonTypes";
import { Detailed, Text, useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { BoxGeometry, Euler, Group, Material, Mesh, MeshBasicMaterial, MeshStandardMaterial, Quaternion, Vector3 } from "three";
import { CharacterRef } from "../Character";
import MyBillboard from "../shared/MyBillboard";
import StoreEntryExitTriggerArea from "../StoreEntryExitTriggerArea";
import LeaderboardMachineAdaptiveScreen from "./LeaderboardMachineAdaptiveScreen";
import { MeteorManagerStore, RewardMachineMode } from "./MeteorManager";
import { GLTFResult } from "./RedeemMachine";
import { trackEvent } from "@client/utils/api";
import { getUserID } from "@client/utils/helperFunctions";

type TLeaderboardMachineProps = {
  characterRef: React.MutableRefObject<CharacterRef | null>
  material: MeshStandardMaterial
  screenMaterial: MeshBasicMaterial
}

const LeaderboardMachine = (props: TLeaderboardMachineProps) => {
  const leaderboardMachineMode = MeteorManagerStore((state) => state.leaderboardMachineMode);
  const { camera } = useThree();
  const [isTopTagVisible, _] = useState(true);
  const topTagRef = useRef<typeof Text>(null)
  const [textMaterial, __] = useState<Material>(new MeshBasicMaterial({ color: 'white' }))
  const group = useRef<Group>(null);
  const topTagTransform: TransformLite = {
    position: [
      -46.15689743443937,
      9.550299465253617,
      -115.53986764694726
    ],
    rotation: [0, 0, 0],
    scale: [1.4306802850117986, 1.4306802850117986, 1.4306802850117986]
  }
  const machineTransform: TransformLite = {
    position: [
      -46.15689743443937,
      1.2921093433469197,
      -115.53986764694726
    ],
    rotation: [
      -1.5320252998290148e-16,
      -0.6475245999242165,
      3.823072612656354e-17,
    ],
    scale: [
      2.213914378946807,
      2.213914378946807,
      2.213914378946807
    ]
  }
  const triggerAreaTransform: TransformLite = {
    position: [
      -47.874310056039995,
      1.8857760068007194,
      -116.39197438983072
    ],
    rotation: [0, -0.6619749875183057, 0],
    scale: [1,1,1]
  }
  const { nodes: highLodNodes } = useGLTF(staticResourcePaths.leaderboardMachineHighLOD) as GLTFResult;
  const { nodes: lowLodNodes } = useGLTF(staticResourcePaths.leaderboardMachineLowLOD) as GLTFResult;
  const highLODNodeName = 'highLODLeaderboard';
  const lowLODNodeName = 'lowLODLeaderboard';
  const originalCameraPosition = useRef(new Vector3());
  const originalCameraRotation = useRef(new Quaternion());
  const targetPosition = new Vector3(
    -51.857260794394264,
    4.768154712453978,
    -113.85538005779779
  );
  const targetRotation = new Euler(
    -0.02010795134723905,
    -0.6505929724178758,
    0.012179588099470293,
  );
  const geometry = useMemo(() => {
    return new BoxGeometry(20.692511884919051, 0.01, 20.692511884919051)
  }, [])
  const { scene } = useGLTF(staticResourcePaths.redeemMachineScreen)
  const screenScene = useMemo(() => {
    // traverse scene and set material
    const _scene = scene.clone()
    _scene.traverse((child) => {
      if (child instanceof Mesh) {
        if (child.name == "screenBorder")
          child.material = props.material
        else if (child.name == "screenSurface")
          child.material = props.screenMaterial
      }
    });
    return _scene;
  }, [scene, props.material]);
  const [needToCloseLeaderboardMachine, setNeedToCloseLeaderboardMachine] =
    useState(false)
  useEffect(() => {
    if (
      leaderboardMachineMode == RewardMachineMode.OUTSIDE &&
      needToCloseLeaderboardMachine
    ) {
      trackEvent(
        'Leaderboard_Machine',
        {
          action: 'Close',
        },
        getUserID(),
      )
      CameraControlsStore.getState().orbitControlsRef.current!.enabled = true
    } else if (
      leaderboardMachineMode == RewardMachineMode.TRAVELLING_OUTSIDE_TO_INSIDE
    ) {
      originalCameraPosition.current.copy(camera.position)
      originalCameraRotation.current.copy(camera.quaternion)

      CameraControlsStore.getState().orbitControlsRef.current!.enabled = false
    } else if (leaderboardMachineMode == RewardMachineMode.INSIDE) {
      trackEvent(
        'Leaderboard_Machine',
        {
          action: 'Open',
        },
        getUserID(),
      )
      setNeedToCloseLeaderboardMachine(true)
      HUDStore.setState({ isLeaderboardMachineScreenUIVisible: true })
    } else if (
      leaderboardMachineMode == RewardMachineMode.TRAVELLING_INSIDE_TO_OUTSIDE
    ) {
      // pass
    }
  }, [leaderboardMachineMode, camera])

  // const isDebugMode = genericStore((state) => state.isDebugMode);

  return <>
    {/* machine model LODs */}

    {
      <group ref={group} {...machineTransform}>
        <Detailed distances={[0, 50]} objects={null}>
          {highLodNodes[highLODNodeName] && (
            <mesh
              geometry={highLodNodes[highLODNodeName].geometry}
              material={props.material}
            />
          )}
          {lowLodNodes[lowLODNodeName] && (
            <mesh
              geometry={lowLodNodes[lowLODNodeName].geometry}
              material={props.material}
            />
          )}
        </Detailed>
      </group>
    }

    {/* Top tag */}
    {
      isTopTagVisible &&
      <>
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
          LEADERBOARD
        </Text>
      </>
    }

    {/* Trigger area */}
    <StoreEntryExitTriggerArea
      keyId="leaderboardMachineTriggerArea"
      characterRef={props.characterRef}
      geometry={geometry}
      transform={{
        position: triggerAreaTransform.position,
        rotation: triggerAreaTransform.rotation,
        scale: triggerAreaTransform.scale
      }}
      onInside={() => {
        HUDStore.setState({ isLeaderboardMachinePromptShown: true });
      }}
      onOutside={() => {
        HUDStore.setState({ isLeaderboardMachinePromptShown: false });
      }}
    />


    <LeaderboardMachineAdaptiveScreen
      targetCameraPosition={targetPosition}
      targetCameraRotation={targetRotation}
      planeDistance={4.037319409}
      fov={60}
      model={screenScene}
    />
  </>
}

export default LeaderboardMachine;
