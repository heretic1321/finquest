// import { AdaptiveDpr } from '@react-three/drei'
import { lazy, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  createXRStore,
  DefaultXRController,
  DefaultXRInputSourceTeleportPointer,
  useSessionModeSupported,
  XR,
} from '@react-three/xr'
import * as THREE from 'three'
import { acceleratedRaycast, computeBoundsTree } from 'three-mesh-bvh'

import { Leva } from 'leva'
import { Toaster } from 'react-hot-toast'
import { useShallow } from 'zustand/react/shallow'

import { Effects } from '@client/components/Effects'
import EnvironmentComponent from '@client/components/Environment'
import CanvasConfig from '@client/config/Canvas'
import { AuthContextProvider } from '@client/contexts/AuthContext'
import { AvatarAppearanceProvider } from '@client/contexts/AvatarAppearanceContext'
import { CameraControlsContextProvider } from '@client/contexts/CameraControlsContext'
import { CartContextProvider } from '@client/contexts/CartContext'
import { CollectionContextProvider } from '@client/contexts/CollectionContext'
import { DataContextProvider } from '@client/contexts/DataContext'
import { GamizeContextProvider } from '@client/contexts/GamizeContext'
import {
  GesturesAndDeviceContextProvider,
  GesturesAndDeviceStore,
} from '@client/contexts/GesturesAndDeviceContext'
import {
  genericStore,
  GlobalStateContextProvider,
} from '@client/contexts/GlobalStateContext'
import { HUDContextProvider, HUDStore } from '@client/contexts/HUDContext'
import { InventoryConsoleHUDContextProvider } from '@client/contexts/InventoryConsoleHUDContext'
import { MapContextProvider } from '@client/contexts/MapContext'
import { MaterialContextProvider } from '@client/contexts/MaterialContext'
import { NetworkingContextProvider } from '@client/contexts/NetworkingContext'
import NPCContextProvider from '@client/contexts/NPCContext'
import { TreasureHuntContextProvider } from '@client/contexts/TreasureHuntContext'

import { PerformanceMeterDisplay } from './components/PerformanceMeterDisplay'
import Sounds from './components/Sounds'
import NPCChatSystem, { mobileOnboardingDialogs, onboardingDialogs } from './components/tutorial/NPCChatSystem'
import CheckpointRenderer, { useCheckpointStore } from './utils/checkpoint'
import HandHud from './components/VR/HandHUD'
import { vrStore } from './contexts/VRStateContext'
import { DigiGoldHUDContextProvider } from './contexts/DigiGoldHUDContext'

// import Temp from './components/HUD/Temp'
// import DevScripts from './components/dev/DevScripts'

const Experience = lazy(() => import('@client/Experience'))
const HUD = lazy(() => import('@client/components/HUD'))

THREE.Mesh.prototype.raycast = acceleratedRaycast // taken from https://github.com/gkjohnson/three-mesh-bvh/blob/master/example/raycast.js
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree

export const LAYER_SELECTIVE_BLOOM = 10

// FOR SPECTOR ANALYSIS
// @ts-ignore
// import * as SPECTOR from "spectorjs";

const CustomHandController = () => {
  return (
    <>
      <DefaultXRController rayPointer={{ rayModel: { color: '#5bb2df' } }} />
      <DefaultXRInputSourceTeleportPointer
        rayModel={{ color: '#5bb2df' }}
        cursorModel={{ color: '#5bb2df', size: 1, opacity: 1 }}
      />
      <HandHud />
    </>
  )
}

const store = createXRStore({
  controller: {
    left: CustomHandController,
    right: {
      teleportPointer: {
        rayModel: { color: '#5bb2df' },
        cursorModel: {
          size: 1,
          opacity: 1,
          color: '#5bb2df',
        },
      },
    },
  },
  handTracking: false,
  emulate: false,
  frameRate: 'high',
})

const MainCanvas = () => {
  const characterRef = genericStore((state) => state.characterRef)
  const {
    bindGestures,
    disableTouchAction
  } = GesturesAndDeviceStore(
    useShallow((state) => ({
      bindGestures: state.bindGestures,
      disableTouchAction: state.disableTouchAction,
    })),
  )
  const hasStartButtonBeenPressed = HUDStore(
    (state) => state.hasStartButtonBeenPressed,
  )
  const dpr = genericStore((state) => state.dpr)

  const isVRSessionSupported = useSessionModeSupported('immersive-vr')
  const { setIsVRSessionSupported, isVRMode } = vrStore(
    useShallow((state) => ({
      setIsVRSessionSupported: state.setIsVRSessionSupported,
      isVRMode: state.isVRMode,
    })),
  )
  const isCheckpointVisible = useCheckpointStore((state) => state.isVisible)

  useEffect(() => {
    //isVRSupported can be undefined
    if (isVRSessionSupported !== undefined) {
      setIsVRSessionSupported(isVRSessionSupported)
    }
  }, [isVRSessionSupported])

  useEffect(() => {
    if (isVRMode) {
      store.enterVR()
    }
  }, [isVRMode])

  return (
    <>
      {hasStartButtonBeenPressed && (
        <Canvas
          id='canvas'
          {...CanvasConfig}
          {...(bindGestures?.() ?? {})}
          performance={{ min: 0.7 }}
          // dpr={1}
          dpr={dpr}
          onCreated={({ gl }) => {
            // recommendation by react compiler. Should disable touch action
            // to not interfere with the accessibility features of a touch device
            const touchTarget = gl.domElement.parentElement?.parentElement
            if (touchTarget && disableTouchAction)
              disableTouchAction(touchTarget)
          }}
        >
          {/* <AdaptiveDpr pixelated /> */}
          <XR store={store}>
            <PerformanceMeterDisplay />
            <MaterialContextProvider />
            <EnvironmentComponent />
            <MapContextProvider />
            <CameraControlsContextProvider />

            {/* <Temp /> */}
            <Experience />

            <Effects />
            {/* These are some dev related scripts which need to be run from react / threejs context.
          So these are run during the dev time, in one shot, and then this component is commented out. */}
            {/* <DevScripts /> */}
          </XR>
          {isCheckpointVisible && <CheckpointRenderer characterRef={characterRef} />}
        </Canvas>
      )}
    </>
  )
}


const NetworkingComponent = () => {
  const hasStartButtonBeenPressed = HUDStore(
    (state) => state.hasStartButtonBeenPressed,
  )
  return hasStartButtonBeenPressed ? <NetworkingContextProvider /> : null
}

const Main = () => {
  // if (process.env.NODE_ENV === 'production'){
  //   // eslint-disable-next-line @typescript-eslint/no-empty-function
  //   console.log = function no_console() {}

  //   // eslint-disable-next-line @typescript-eslint/no-empty-function
  //   console.error = function no_console() {}
  // }

  // FOR SPECTOR ANALYSIS
  // var spector = new SPECTOR.Spector();
  // spector.displayUI();

  // This is for adaptive dpr(device pixel ratio)
  // A lower dpr is better for performance as it reduces the number of pixels
  // that need to be rendered. However, a lower dpr also means that the
  // resolution of the canvas is lower. So we need to find a balance between
  // performance and resolution. This is what adaptive dpr does. It will
  // increase the dpr when the performance is good and decrease it when the
  // performance is bad
  // const [, setDpr] = useState(2)

  return (
    <>
      <Leva oneLineLabels collapsed />
      <Toaster />
      <GlobalStateContextProvider />
      <GesturesAndDeviceContextProvider />
      <AuthContextProvider />
      <CollectionContextProvider />
      <DataContextProvider />
      <AvatarAppearanceProvider />
      <CartContextProvider />
      <HUDContextProvider />
      <InventoryConsoleHUDContextProvider />
      <DigiGoldHUDContextProvider />
      <NPCContextProvider />
      <TreasureHuntContextProvider />
      <NetworkingComponent />
      <GamizeContextProvider />
      {/* <PerformanceContextProvider setDpr={setDpr} /> */}

      <MainCanvas />
      <HUD />
      <Sounds />
      <NPCChatSystem
        dialogs={GesturesAndDeviceStore.getState().isTouchDevice ? mobileOnboardingDialogs : onboardingDialogs}
        onComplete={() => console.log('Tutorial completed')}
      />
    </>
  )
}

export default Main
