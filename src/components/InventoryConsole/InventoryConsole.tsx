import { useEffect, useMemo, useRef, useState } from 'react'
// import { TransformControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Euler, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, Quaternion, Vector3 } from 'three'

import JewelleryShowcaseTriggerArea from '@client/components/JewelleryShowcaseTriggerArea'
import { damp, damp3, dampE } from 'maath/easing'
import { CharacterRef } from '@client/components/Character'
import InventoryConsoleButtonHandler from '@client/components/InventoryConsole/InventoryConsoleButtonHandler'
import { TInventoryConsoleConfig } from '@client/config/InventoryConsoleConfig'
import { CameraControlsStore } from '@client/contexts/CameraControlsContext'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { InventoryConsoleHUDStore } from '@client/contexts/InventoryConsoleHUDContext'
import { cleanupResources } from '@client/utils/helperFunctions'
import { useShallow } from 'zustand/react/shallow'
import { AuthAPIStore } from '@client/contexts/AuthContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { SoundsStore } from '../Sounds'
import { useGLTF, useTexture } from '@react-three/drei'
import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { usePMREMWithCubeMap } from '@client/hooks/usePMREM'
import InventoryConsoleAdaptiveScreen from './InventoryConsoleAdaptiveScreen'
import { ConsoleConfigs } from '@client/config/MapConfig'

type TInventoryConsoleProps = {
  characterRef: React.MutableRefObject<CharacterRef | null>
  config: TInventoryConsoleConfig
  name: string
}

function InventoryConsole({
  characterRef,
  config,
  name,
}: // name
TInventoryConsoleProps) {
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)
  const isDebugMode = genericStore((state) => state.isDebugMode)
  const _inventoryConsoleBody = useGLTF(staticResourcePaths.leaderboardMachineHighLOD)
  const isGuest = AuthAPIStore((state) => state.isGuest)
  const {
    setShowNotLoggedInModal,
    isOpenShowcasePromptClicked,
    setIsOpenShowcasePromptClicked,
    isInventoryConsolePromptShown,
    setIsInventoryConsolePromptShown,
    setExitingInventoryConsole
  } = HUDStore(useShallow((state) => ({
    setShowNotLoggedInModal: state.setShowNotLoggedInModal,
    isOpenShowcasePromptClicked: state.isOpenShowcasePromptClicked,
    setIsOpenShowcasePromptClicked: state.setIsOpenShowcasePromptClicked,
    isInventoryConsolePromptShown: state.isInventoryConsolePromptShown,
    setIsInventoryConsolePromptShown: state.setIsInventoryConsolePromptShown,
    setExitingInventoryConsole: state.setExitingInventoryConsole,
  })))
  
  const [baseColorTexture, metallicRoughnessTexture] = useTexture([
    staticResourcePaths.redeemMachineAlbedoTransparency,
    staticResourcePaths.redeemMachineMetallicRoughness,
  ], (textures) => {
    if (textures instanceof Array) {
      textures.forEach((texture) => {
        texture.flipY = false;
        texture.encoding = texture.encoding === 3000 ? 3001 : texture.encoding;
      });
    }
  });
  const mainSkyTexture = usePMREMWithCubeMap(staticResourcePaths.mainSkyTexture);
  const material = useMemo(() => {
    return new MeshStandardMaterial({
      map: baseColorTexture,
      transparent: true,
      metalnessMap: metallicRoughnessTexture,
      roughnessMap: metallicRoughnessTexture,
      envMap: mainSkyTexture,
      toneMapped: false,
    });
  }, [baseColorTexture, metallicRoughnessTexture, mainSkyTexture]);
  const [screenMaterial, _] = useState(new MeshBasicMaterial({ color: "#202A37", transparent: true, opacity: 0.9 }))
  const { scene } = useGLTF(staticResourcePaths.redeemMachineScreen)
  const screenScene = useMemo(() => {
    // traverse scene and set material
    const _scene = scene.clone()
    _scene.traverse((child) => {
      if (child instanceof Mesh) {
        if (child.name == "screenBorder")
          child.material = material
        else if (child.name == "screenSurface")
          child.material = screenMaterial
      }
    });
    return _scene;
  }, [scene, material ]);
  const [inventoryConsoleBody, setInventoryConsoleBody] =
    useState<THREE.Group>()
  const initialCameraPositionRef = useRef(new Vector3())
  const initialCameraRotationRef = useRef(new Euler())
  const [transitionProgress, setTransitionProgress] = useState(0)
  const transitionDuration = 1
  useEffect(() => {
    if (_inventoryConsoleBody) {
      const clonedBody = _inventoryConsoleBody.scene.clone()
      // Apply material to all meshes in the group
      clonedBody.traverse((child) => {
        if (child instanceof Mesh) {
          child.material = material
        }
      })
      setInventoryConsoleBody(clonedBody)
    }
  }, [_inventoryConsoleBody, material])

  useEffect(() => {
    return () => {
      inventoryConsoleBody?.traverse((child) => {
        cleanupResources(child)
      })
    }
  }, [inventoryConsoleBody])

  /// TRANSFORM CONTROLS MODULE -- UNCOMMENT WHEN NEEDED ///
  // const [showTransformControls, setShowTransformControls] = useState(false)
  // const transformControlsTarget = useRef<THREE.Object3D | null>(null)
  // const [transformControlsMode, setTransformControlsMode] = useState<
  //   'translate' | 'rotate' | 'scale'
  // >('scale')

  // useControls(
  //   'Inventory Console ' + name,
  //   () => ({
  //     showTransformControls: {
  //       value: showTransformControls,
  //       onChange: (value) => {
  //         setShowTransformControls(value)
  //         transformControlsTarget.current = showCaseRef.current
  //       },
  //     },
  //     transformControlsMode: {
  //       value: 'translate',
  //       options: ['translate', 'rotate', 'scale'],
  //       onChange: (value: 'translate' | 'rotate' | 'scale') => {
  //         setTransformControlsMode(value)
  //       },
  //     },
  //   }),
  //   {
  //     collapsed: true,
  //     render: () => {
  //       return isDebugMode || false
  //     },
  //   })

  const {
    currentConsoleID,
    setCurrentConsoleID,
    isPresentationModeStartingUp,
    setIsPresentationModeStartingUp,
    isPresentationModeShuttingDown,
    setIsPresentationModeShuttingDown,
    isTransitionToPresentationModeComplete,
    setIsTransitionToPresentationModeComplete,
    isTransitionFromPresentationModeComplete,
    setIsTransitionFromPresentationModeComplete,
    setIsPresentationMode,
    setCurrentCollectionID,
  } = InventoryConsoleHUDStore(
    useShallow((state) => ({
      currentConsoleID: state.currentConsoleID,
      setCurrentConsoleID: state.setCurrentConsoleID,
      isPresentationModeStartingUp: state.isPresentationModeStartingUp,
      setIsPresentationModeStartingUp: state.setIsPresentationModeStartingUp,
      isPresentationModeShuttingDown: state.isPresentationModeShuttingDown,
      setIsPresentationModeShuttingDown: state.setIsPresentationModeShuttingDown,
      isTransitionToPresentationModeComplete:
        state.isTransitionToPresentationModeComplete,
      setIsTransitionToPresentationModeComplete:
        state.setIsTransitionToPresentationModeComplete,
      isTransitionFromPresentationModeComplete:
        state.isTransitionFromPresentationModeComplete,
      setIsTransitionFromPresentationModeComplete:
        state.setIsTransitionFromPresentationModeComplete,
      setIsPresentationMode: state.setIsPresentationMode,
      setCurrentCollectionID: state.setCurrentCollectionID,
    }),
  ))
  const insideStoreName = genericStore((state) => state.insideStore)
  const showCaseRef = useRef<THREE.Group>(null)
  const viewRef = useRef<THREE.Mesh>(null)
  const mobileViewRef = useRef<THREE.Mesh>(null)

  const [cameraStartingPosition, setCameraStartingPosition] =
    useState<Vector3 | null>(null)
  const [cameraStartingRotation, setCameraStartingRotation] =
    useState<Euler | null>(null)
  const [cameraStartingFov, setCameraStartingFov] = useState<number | null>(
    null,
  )

  const { camera } = useThree()
  const cameraOrbitControlsRef = CameraControlsStore((state) => state.orbitControlsRef)

  const moveCamera = (
    camera: THREE.PerspectiveCamera,
    properties: {
      fov?: number
      position?: THREE.Vector3
      rotation?: THREE.Euler
      target?: THREE.Group | null
    },
    delta: number,
    smoothTime = 0.2,
  ) => {
    let isPositionDamping = false
    let isRotationDamping = false
    let isFovDamping = false

    if (properties.target) {
      const pos = properties.target.position.clone().add(new Vector3(-1,2,1))
      camera.lookAt(pos)
    }
    if (properties.position) {
      isPositionDamping = damp3(
        camera.position,
        properties.position,
        smoothTime,
        delta,
      )
    }

    if (properties.rotation) {
      isRotationDamping = dampE(
        camera.rotation,
        properties.rotation,
        smoothTime,
        delta,
      )
    }

    if (properties.fov) {
      isFovDamping = damp(camera, 'fov', properties.fov, smoothTime, delta)
      camera.updateProjectionMatrix()
    }

    return isPositionDamping || isRotationDamping || isFovDamping
  }

  let isDamping = false

  const updateCameraPresentationModeShuttingDown = (
    camera: PerspectiveCamera,
    delta: number,
  ) => {
    if (
      !cameraStartingPosition ||
      !cameraStartingRotation ||
      !cameraStartingFov
    )
      return
    isDamping = moveCamera(
      camera,
      {
        fov: cameraStartingFov,
        position: cameraStartingPosition,
        rotation: cameraStartingRotation,
      },
      delta,
    )
    if (isDamping === false) {
      setIsPresentationModeShuttingDown(false)
      setIsTransitionFromPresentationModeComplete(true)
      setIsInventoryConsolePromptShown(true)
    }
  }
  useEffect(() => {
    if (isOpenShowcasePromptClicked && isInventoryConsolePromptShown) {
      StartPresentationMode()
    }
  }, [isOpenShowcasePromptClicked])

  const StartPresentationMode = () => {
    SoundsStore.getState().playClickSoundOnce()
    if (isGuest) {
      setShowNotLoggedInModal(true)
      return
    }
    if (currentConsoleID !== config.id) return
    setIsInventoryConsolePromptShown(false)
    setIsPresentationModeStartingUp(true)
    setIsTransitionFromPresentationModeComplete(false)
    setIsOpenShowcasePromptClicked(false)
  }

  function onPlayerEnterCollision() {
    setCurrentConsoleID(config.id)
    setCurrentCollectionID(config.CollectionID)
    setIsInventoryConsolePromptShown(true)
  }

  function onPlayerExitCollision() {
    setCurrentConsoleID(-1)
    setCurrentCollectionID(-1)
    setIsInventoryConsolePromptShown(false)
  }

  useEffect(() => {
    if (isPresentationModeStartingUp) {
      setCameraStartingPosition(camera.position.clone())
      setCameraStartingRotation(camera.rotation.clone())
      if (camera instanceof PerspectiveCamera) {
        setCameraStartingFov(camera.fov)
      }
    }
  }, [isPresentationModeStartingUp])

  useEffect(() => {
    if (isPresentationModeStartingUp) {
      setExitingInventoryConsole(false)
      initialCameraPositionRef.current.copy(camera.position)
      initialCameraRotationRef.current.copy(camera.rotation)
      setTransitionProgress(0)
    }
    if (isPresentationModeShuttingDown) {
      setTransitionProgress(0)
    }
  }, [isPresentationModeStartingUp,isPresentationModeShuttingDown])
  useFrame((_state, delta) => {
    if (!genericStore.getState().isTabFocused) return
    if (currentConsoleID === config.id && camera instanceof PerspectiveCamera) {
      if (isPresentationModeStartingUp) {
        const _orbitControlsRef = cameraOrbitControlsRef.current
        if (_orbitControlsRef !== null)
          _orbitControlsRef.enabled = false
        const newProgress = Math.min(transitionProgress + delta / transitionDuration, 1)
        setTransitionProgress(newProgress)
        if(showCaseRef.current && insideStoreName){
          const startPos = initialCameraPositionRef.current
          
          // Get showcase position and calculate camera target position
          const showcasePos = showCaseRef.current.getWorldPosition(new Vector3())
          const offsetConfig = isTouchDevice? ConsoleConfigs[insideStoreName].touchDevice : ConsoleConfigs[insideStoreName].position
          const offset = new Vector3(offsetConfig.x, offsetConfig.y, offsetConfig.z)
          const endPos = showcasePos.clone().add(offset)
          const startRot = initialCameraRotationRef.current
         
          const endRot = new Euler(ConsoleConfigs[insideStoreName].rotation.x, ConsoleConfigs[insideStoreName].rotation.y, ConsoleConfigs[insideStoreName].rotation.z);
          
          // Interpolate position and rotation
          camera.position.lerpVectors(startPos, endPos, newProgress)
          const startQuaternion = new Quaternion().setFromEuler(startRot)
          const endQuaternion = new Quaternion().setFromEuler(endRot)
          const slerpedQuaternion = startQuaternion.slerp(endQuaternion, newProgress)
          camera.setRotationFromQuaternion(slerpedQuaternion)


          if (newProgress === 1) {
            setIsPresentationModeStartingUp(false)
            setIsTransitionToPresentationModeComplete(true)
          }
        }
      } else if (isTransitionToPresentationModeComplete) {
        setIsPresentationMode(true)
      } else if (isPresentationModeShuttingDown) {
        updateCameraPresentationModeShuttingDown(camera, delta)
      } else if (isTransitionFromPresentationModeComplete) {
        setIsPresentationMode(false)
        
        const _orbitControlsRef = cameraOrbitControlsRef.current
        if (_orbitControlsRef !== null)
          _orbitControlsRef.enabled = true
      }
    }
  })
  return (
    <>
      {/* {isDebugMode && showTransformControls && transformControlsTarget.current && (
          <TransformControls
            object={transformControlsTarget.current}
            mode={transformControlsMode}
            onMouseDown={() => {
              CameraControlsStore.getState().orbitControlsRef.current!.enabled = false
            }}
            onMouseUp={() => {
              CameraControlsStore.getState().orbitControlsRef.current!.enabled = true
              if (transformControlsMode === 'translate') {
                console.log(transformControlsTarget.current?.position.toArray())
              } else if (transformControlsMode === 'rotate') {
                console.log(transformControlsTarget.current?.rotation.toArray())
              } else if (transformControlsMode === 'scale') {
                console.log(transformControlsTarget.current?.scale.toArray())
              }
            }}
          />
      )} */}
      {/* <MyTransformControls objectRef={showCaseRef} /> */}
      <group
        position={config.transform.position}
        rotation={config.transform.rotation}
        scale={[
          config.transform.scale[0] * 2,
          config.transform.scale[1] * 2,
          config.transform.scale[2] * 2,
        ]}
        ref={showCaseRef}
        key={config.name}
      >

        <JewelleryShowcaseTriggerArea
          _id={name}
          target={
            characterRef.current?.roundedBoxRef.current
              ? characterRef.current?.roundedBoxRef.current
              : null
          }
          name={'IConsole_' + name}
          radiusX={4}
          radiusY={4}
          // position= {triggerArea.position}
          position={[-.4, .1, 1]}
          // setPosition={() => {}}
          onInside={onPlayerEnterCollision}
          onOutside={onPlayerExitCollision}
        />
        <InventoryConsoleAdaptiveScreen
          targetCameraPosition={[-1,2,1]}
          targetCameraRotation={[0,0,0]}
          planeDistance={1}
          fov={60}
          model={screenScene}
        />

        {inventoryConsoleBody && <primitive object={inventoryConsoleBody} />}

        <InventoryConsoleButtonHandler />

        {(
          <>
            <mesh position={[0, 4, 6]} scale={[0.2, 0.2, 0.2]} ref={viewRef}>
              <sphereGeometry />
              <meshBasicMaterial color={'red'} visible={isDebugMode} />
            </mesh>
            <mesh
              position={[0, 4, 3]}
              scale={[0.2, 0.2, 0.2]}
              ref={mobileViewRef}
            >
              <sphereGeometry />
              <meshBasicMaterial color={'green'} visible={isDebugMode}/>
            </mesh>
          </>
        )}
      </group>
    </>
  )
}

export default InventoryConsole
