import { CameraControlsStore } from '@client/contexts/CameraControlsContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { useGLTF, useTexture } from '@react-three/drei'
// import { useControls } from 'leva'

import { useEffect, useMemo, useRef } from 'react'

import { useState } from 'react'
import {
  BoxGeometry,
  Euler,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Quaternion,
  Vector3,
} from 'three'
import { Mesh } from 'three'
import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { CharacterRef, PlayerConfigStore } from '../Character'
import DigiGoldAdaptiveScreen from './DigiGoldAdaptiveScreen'
import { useShallow } from 'zustand/react/shallow'
import { useFrame, useThree } from '@react-three/fiber'
import { damp, damp3, dampE } from 'maath/easing'
import { DigiGoldHUDStore } from '@client/contexts/DigiGoldHUDContext'
import { SoundsStore } from '../Sounds'
import StoreEntryExitTriggerArea from '../StoreEntryExitTriggerArea'
import {
  DigiGoldMachineConfigs,
  DigiGoldMachineConfig,
} from '@client/config/MapConfig'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'

type DigiGoldMachineProps = {
  characterRef: React.MutableRefObject<CharacterRef | null>
  config: DigiGoldMachineConfig
  id: string
}
function DigiGoldMachine({ characterRef, config, id }: DigiGoldMachineProps) {
  const digiGoldMachineRef = useRef<THREE.Group>(null)
  const {
    isDigiGoldMachinePromptShown,
    setIsDigiGoldMachinePromptShown,
    isDigiGoldPresentationMode,
    setIsDigiGoldPresentationMode,
    isDigiGoldVisible,
    setIsDigiGoldVisible,
    isDigiGoldMachinePromptClicked,
    setIsDigiGoldMachinePromptClicked,
    isDigiGoldPresentationModeShuttingDown,
    setIsDigiGoldPresentationModeShuttingDown,
    isDigiGoldTransitionFromPresentationModeComplete,
    setIsDigiGoldTransitionFromPresentationModeComplete,
    isDigiGoldTransitionToPresentationModeComplete,
    setIsDigiGoldTransitionToPresentationModeComplete,
    isDigiGoldPresentationModeStartingUp,
    setIsDigiGoldPresentationModeStartingUp,
    setExitingDigiGoldMachine,
    setCurrentMachineID,
    currentMachineID,
  } = DigiGoldHUDStore(
    useShallow((state) => ({
      isDigiGoldMachinePromptShown: state.isDigiGoldMachinePromptShown,
      setIsDigiGoldMachinePromptShown: state.setIsDigiGoldMachinePromptShown,
      isDigiGoldPresentationMode: state.isDigiGoldPresentationMode,
      setIsDigiGoldPresentationMode: state.setIsDigiGoldPresentationMode,
      isDigiGoldVisible: state.isDigiGoldVisible,
      setIsDigiGoldVisible: state.setIsDigiGoldVisible,
      isDigiGoldMachinePromptClicked: state.isDigiGoldMachinePromptClicked,
      setIsDigiGoldMachinePromptClicked:
        state.setIsDigiGoldMachinePromptClicked,
      isDigiGoldPresentationModeShuttingDown:
        state.isDigiGoldPresentationModeShuttingDown,
      setIsDigiGoldPresentationModeShuttingDown:
        state.setIsDigiGoldPresentationModeShuttingDown,
      isDigiGoldTransitionFromPresentationModeComplete:
        state.isDigiGoldTransitionFromPresentationModeComplete,
      setIsDigiGoldTransitionFromPresentationModeComplete:
        state.setIsDigiGoldTransitionFromPresentationModeComplete,
      isDigiGoldTransitionToPresentationModeComplete:
        state.isDigiGoldTransitionToPresentationModeComplete,
      setIsDigiGoldTransitionToPresentationModeComplete:
        state.setIsDigiGoldTransitionToPresentationModeComplete,
      isDigiGoldPresentationModeStartingUp:
        state.isDigiGoldPresentationModeStartingUp,
      setIsDigiGoldPresentationModeStartingUp:
        state.setIsDigiGoldPresentationModeStartingUp,
      setExitingDigiGoldMachine: state.setExitingDigiGoldMachine,
      setCurrentMachineID: state.setCurrentMachineID,
      currentMachineID: state.currentMachineID,
    })),
  )
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)
  const endPosVectorRef = useRef<Vector3>(new Vector3())
  const endRotVectorRef = useRef<Euler>(new Euler())
  const dummyStartingCameraRotationRef = useRef<Quaternion>(new Quaternion())
  const dummyEndingCameraRotationRef = useRef<Quaternion>(new Quaternion())

  ///--- DIGIGOLD MACHINE TEXTURES ---///
  const [baseColorTexture, metallicRoughnessTexture] = useTexture(
    [
      staticResourcePaths.redeemMachineAlbedoTransparency,
      staticResourcePaths.redeemMachineMetallicRoughness,
    ],
    (textures) => {
      if (textures instanceof Array) {
        textures.forEach((texture) => {
          texture.flipY = false
          texture.encoding = texture.encoding === 3000 ? 3001 : texture.encoding
        })
      }
    },
  )
  const material = useMemo(() => {
    return new MeshStandardMaterial({
      map: baseColorTexture,
      transparent: true,
      metalnessMap: metallicRoughnessTexture,
      roughnessMap: metallicRoughnessTexture,
      toneMapped: false,
    })
  }, [baseColorTexture, metallicRoughnessTexture])
  const [screenMaterial, _] = useState(
    new MeshBasicMaterial({
      color: '#202A37',
      transparent: true,
      opacity: 0.9,
    }),
  )
  const { scene } = useGLTF(staticResourcePaths.redeemMachineScreen)
  const screenScene = useMemo(() => {
    // traverse scene and set material
    const _scene = scene.clone()
    _scene.traverse((child) => {
      if (child instanceof Mesh) {
        if (child.name == 'screenBorder') child.material = material
        else if (child.name == 'screenSurface') child.material = screenMaterial
      }
    })
    return _scene
  }, [scene, material])
  const digiGoldMachineTriggerAreaGeometry = useMemo(() => {
    return new BoxGeometry(1, 0.01, 1)
  }, [])
  function onPlayerEnterCollision() {
    setCurrentMachineID(id)
    setIsDigiGoldMachinePromptShown(true)
  }

  function onPlayerExitCollision() {
    setCurrentMachineID('')
    setIsDigiGoldMachinePromptShown(false)
  }

  const [cameraStartingPosition, setCameraStartingPosition] =
    useState<Vector3 | null>(null)
  const [cameraStartingRotation, setCameraStartingRotation] =
    useState<Euler | null>(null)
  const [cameraStartingFov, setCameraStartingFov] = useState<number | null>(
    null,
  )
  const { camera } = useThree()
  const cameraOrbitControlsRef = CameraControlsStore(
    (state) => state.orbitControlsRef,
  )
  const initialCameraPositionRef = useRef(new Vector3())
  const initialCameraRotationRef = useRef(new Euler())
  const transitionProgressRef = useRef(0)
  const transitionDuration = 1
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
      const pos = properties.target.position.clone().add(new Vector3(-1, 2, 1))
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

  const updateCameraDigiGoldPresentationModeShuttingDown = (
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
      setIsDigiGoldPresentationModeShuttingDown(false)
      setIsDigiGoldTransitionFromPresentationModeComplete(true)
      setIsDigiGoldMachinePromptShown(true)
    }
  }
  const StartPresentationMode = () => {
    SoundsStore.getState().playClickSoundOnce()

    if (currentMachineID !== id) return
    setIsDigiGoldMachinePromptShown(false)
    setIsDigiGoldPresentationModeStartingUp(true)
    setIsDigiGoldTransitionFromPresentationModeComplete(false)
    setIsDigiGoldMachinePromptClicked(false)
  }
  useEffect(() => {
    if (isDigiGoldPresentationModeStartingUp) {
      setCameraStartingPosition(camera.position.clone())
      setCameraStartingRotation(camera.rotation.clone())
      if (camera instanceof PerspectiveCamera) {
        setCameraStartingFov(camera.fov)
      }
    }
  }, [isDigiGoldPresentationModeStartingUp])
  useEffect(() => {
    if (isDigiGoldPresentationModeStartingUp) {
      setExitingDigiGoldMachine(false)
      initialCameraPositionRef.current.copy(camera.position)
      initialCameraRotationRef.current.copy(camera.rotation)
      transitionProgressRef.current = 0
    }
    if (isDigiGoldPresentationModeShuttingDown) {
      transitionProgressRef.current = 0
    }
  }, [
    isDigiGoldPresentationModeStartingUp,
    isDigiGoldPresentationModeShuttingDown,
  ])
  useEffect(() => {
    if (isDigiGoldMachinePromptClicked && isDigiGoldMachinePromptShown) {
      StartPresentationMode()
    }
  }, [isDigiGoldMachinePromptClicked])
  useFrame((_state, delta) => {
    if (!genericStore.getState().isTabFocused) return
    if (camera instanceof PerspectiveCamera && currentMachineID === id) {
      if (isDigiGoldPresentationModeStartingUp) {
        const _orbitControlsRef = cameraOrbitControlsRef.current
        if (_orbitControlsRef !== null) _orbitControlsRef.enabled = false
        
        const newProgress = Math.min(
          transitionProgressRef.current + delta / transitionDuration,
          1
        )
        transitionProgressRef.current = newProgress
        if (digiGoldMachineRef.current) {
          const startPos = initialCameraPositionRef.current
          const offsetConfig = isTouchDevice
            ? config.camera.mobilePosition
            : config.camera.desktopPosition
          const endPos = endPosVectorRef.current.set(
            offsetConfig[0],
            offsetConfig[1],
            offsetConfig[2],
          )
          const startRot = initialCameraRotationRef.current

          const cameraRotation = config.camera.rotation
          const endRot = endRotVectorRef.current.set(
            cameraRotation[0],
            cameraRotation[1],
            cameraRotation[2],
          )
          // Interpolate position and rotation
          camera.position.lerpVectors(startPos, endPos, newProgress)
          const startQuaternion = dummyStartingCameraRotationRef.current.setFromEuler(startRot) 
          const endQuaternion = dummyEndingCameraRotationRef.current.setFromEuler(endRot)
          const slerpedQuaternion = startQuaternion.slerp(
            endQuaternion,
            newProgress,
          )
          camera.setRotationFromQuaternion(slerpedQuaternion)
          if (newProgress === 1) {
            setIsDigiGoldPresentationModeStartingUp(false)
            setIsDigiGoldTransitionToPresentationModeComplete(true)
          }
        }
      } else if (isDigiGoldTransitionToPresentationModeComplete) {
        setIsDigiGoldVisible(true)
        setIsDigiGoldPresentationMode(true)
      } else if (isDigiGoldPresentationModeShuttingDown) {
        updateCameraDigiGoldPresentationModeShuttingDown(camera, delta)
      } else if (isDigiGoldTransitionFromPresentationModeComplete) {
        if (isDigiGoldVisible || isDigiGoldPresentationMode) {
          setIsDigiGoldVisible(false)
          setIsDigiGoldPresentationMode(false)
          PlayerConfigStore.getState().isPlayerParalysedRef.current = false
        }

        const _orbitControlsRef = cameraOrbitControlsRef.current
        if (_orbitControlsRef !== null) _orbitControlsRef.enabled = true
      }
    }
  })
  /// TRANSFORM CONTROLS MODULE -- UNCOMMENT WHEN NEEDED ///
  // const isDebugMode = genericStore((state) => state.isDebugMode)
  // const [showTransformControls, setShowTransformControls] = useState(false)
  // const transformControlsTarget = useRef<THREE.Object3D | null>(null)
  // const [transformControlsMode, setTransformControlsMode] = useState<
  //   'translate' | 'rotate' | 'scale'
  // >('scale')
  // ///--- DIGIGOLD MACHINE CONTROLS ---///
  // useControls(
  //   'DigiGold Machine' + 'storename',
  //   () => ({
  //     showTransformControls: {
  //       value: showTransformControls,
  //       onChange: (value) => {
  //         setShowTransformControls(value)
  //         transformControlsTarget.current = digiGoldMachineRef.current
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
  //   },
  // )

  return (
    <>
      {/* {isDebugMode &&
        showTransformControls &&
        transformControlsTarget.current && (
          <TransformControls
            object={transformControlsTarget.current}
            mode={transformControlsMode}
            onMouseDown={() => {
              CameraControlsStore.getState().orbitControlsRef.current!.enabled =
                false
            }}
            onMouseUp={() => {
              CameraControlsStore.getState().orbitControlsRef.current!.enabled =
                true
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
      {/* <MyTransformControls objectRef={digiGoldMachineRef} /> */}
      <group
        position={config.position}
        rotation={config.rotation}
        scale={[2, 2, 2]}
        ref={digiGoldMachineRef}
      >
        <StoreEntryExitTriggerArea
          keyId='rewardRedeemMachineTriggerArea'
          characterRef={characterRef}
          geometry={digiGoldMachineTriggerAreaGeometry}
          transform={{
            position: [0, 0.1, 0],
            rotation: [0, 0, 0],
            scale: [3, 1, 3],
          }}
          onInside={onPlayerEnterCollision}
          onOutside={onPlayerExitCollision}
          transformControlsEnabled={false}
        />
        <DigiGoldAdaptiveScreen
          targetCameraPosition={[0, 2, 1]}
          targetCameraRotation={[0, 0, 0]}
          planeDistance={1}
          fov={60}
          model={screenScene}
        />
      </group>
    </>
  )
}

// export default DigiGoldMachine
function DigiGoldMachineManager(props: {
  characterRef: React.MutableRefObject<CharacterRef | null>
}) {
  return (
    <>
      {Object.entries(DigiGoldMachineConfigs).map(
        ([machineName, machineConfig]) => (
          <DigiGoldMachine
            key={machineName}
            characterRef={props.characterRef}
            config={machineConfig}
            id={machineName}
          />
        ),
      )}
    </>
  )
}

export default DigiGoldMachineManager
