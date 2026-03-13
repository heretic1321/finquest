import { lazy, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { acceleratedRaycast, computeBoundsTree } from 'three-mesh-bvh'

import { Leva } from 'leva'
import { useShallow } from 'zustand/react/shallow'

import { Effects } from '@client/components/Effects'
import EnvironmentComponent from '@client/components/Environment'
import CanvasConfig from '@client/config/Canvas'
import { AuthContextProvider } from '@client/contexts/AuthContext'
import { AvatarAppearanceProvider } from '@client/contexts/AvatarAppearanceContext'
import { CameraControlsContextProvider } from '@client/contexts/CameraControlsContext'
import {
  GesturesAndDeviceContextProvider,
  GesturesAndDeviceStore,
} from '@client/contexts/GesturesAndDeviceContext'
import {
  genericStore,
  GlobalStateContextProvider,
} from '@client/contexts/GlobalStateContext'
import { HUDContextProvider, HUDStore } from '@client/contexts/HUDContext'
import { MapContextProvider } from '@client/contexts/MapContext'
import { MaterialContextProvider } from '@client/contexts/MaterialContext'
import NPCContextProvider from '@client/contexts/NPCContext'

import Sounds from './components/Sounds'
import NPCChatSystem, { mobileOnboardingDialogs, onboardingDialogs } from './components/tutorial/NPCChatSystem'

const Experience = lazy(() => import('@client/Experience'))
const HUD = lazy(() => import('@client/components/HUD'))

THREE.Mesh.prototype.raycast = acceleratedRaycast
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree

export const LAYER_SELECTIVE_BLOOM = 10

const MainCanvas = () => {
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

  return (
    <>
      {hasStartButtonBeenPressed && (
        <Canvas
          id='canvas'
          {...CanvasConfig}
          {...(bindGestures?.() ?? {})}
          performance={{ min: 0.7 }}
          dpr={dpr}
          onCreated={({ gl }) => {
            const touchTarget = gl.domElement.parentElement?.parentElement
            if (touchTarget && disableTouchAction)
              disableTouchAction(touchTarget)
          }}
        >
          <MaterialContextProvider />
          <EnvironmentComponent />
          <MapContextProvider />
          <CameraControlsContextProvider />
          <Experience />
          <Effects />
        </Canvas>
      )}
    </>
  )
}

const Main = () => {
  return (
    <>
      <Leva oneLineLabels collapsed />
      <GlobalStateContextProvider />
      <GesturesAndDeviceContextProvider />
      <AuthContextProvider />
      <AvatarAppearanceProvider />
      <HUDContextProvider />
      <NPCContextProvider />

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
