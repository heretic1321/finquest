import {
  DepthOfField,
  EffectComposer,
  SMAA,
  SelectiveBloom,
} from '@react-three/postprocessing'
import { memo, useEffect, useRef, useState } from 'react'

// import { useControls } from 'leva'
import { BlendFunction, SelectiveBloomEffect } from 'postprocessing'

import { genericStore } from '@client/contexts/GlobalStateContext'
import { LAYER_SELECTIVE_BLOOM } from '@client/main'

export const Effects = memo(() => {
  // const isDebugMode = genericStore((state) => state.isDebugMode)

  const [
    effectComposerState, 
    // setEffectComposerState
  ] = useState({
    enabled: false,
    depthBuffer: true,
    disableNormalPass: true,
    stencilBuffer: false,
    autoClear: true,
    resolutionScale: 1,
    multisampling: 0,
  })

  const areEffectsEnabled = genericStore((state) => state.areEffectsEnabled)

  // useControls(
  //   'Effects',
  //   () => ({
  //     enabled: {
  //       value: effectComposerState.enabled,
  //       onChange: (value: boolean) =>
  //         setEffectComposerState((state) => ({ ...state, enabled: value })),
  //     },
  //     depthBuffer: {
  //       value: effectComposerState.depthBuffer,
  //       onChange: (value: boolean) =>
  //         setEffectComposerState((state) => ({ ...state, depthBuffer: value })),
  //     },
  //     disableNormalPass: {
  //       value: effectComposerState.disableNormalPass,
  //       onChange: (value: boolean) =>
  //         setEffectComposerState((state) => ({
  //           ...state,
  //           disableNormalPass: value,
  //         })),
  //     },
  //     stencilBuffer: {
  //       value: effectComposerState.stencilBuffer,
  //       onChange: (value: boolean) =>
  //         setEffectComposerState((state) => ({
  //           ...state,
  //           stencilBuffer: value,
  //         })),
  //     },
  //     autoClear: {
  //       value: effectComposerState.autoClear,
  //       onChange: (value: boolean) =>
  //         setEffectComposerState((state) => ({ ...state, autoClear: value })),
  //     },
  //     resolutionScale: {
  //       value: effectComposerState.resolutionScale,
  //       onChange: (value: number) =>
  //         setEffectComposerState((state) => ({
  //           ...state,
  //           resolutionScale: value,
  //         })),
  //     },
  //     multisampling: {
  //       value: effectComposerState.multisampling,
  //       onChange: (value: number) =>
  //         setEffectComposerState((state) => ({
  //           ...state,
  //           multisampling: value,
  //         })),
  //     },
  //   }),
  //   {
  //     collapsed: true,
  //     render: () => {
  //       return isDebugMode || false
  //     },
  //   },
  // )

  const [
    depthOfFieldState, 
    // setDepthOfFieldState
  ] = useState({
    focusDistance: 0.01,
    focalLength: 0.03,
    bokehScale: 6,
    width: 500,
    height: 500,
  })

  // useControls(
  //   'DepthOfField',
  //   () => ({
  //     focusDistance: {
  //       value: depthOfFieldState.focusDistance,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value: number) =>
  //         setDepthOfFieldState((state) => ({ ...state, focusDistance: value })),
  //     },
  //     focalLength: {
  //       value: depthOfFieldState.focalLength,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value: number) =>
  //         setDepthOfFieldState((state) => ({ ...state, focalLength: value })),
  //     },
  //     bokehScale: {
  //       value: depthOfFieldState.bokehScale,
  //       min: 0,
  //       max: 1000,
  //       step: 1,
  //       onChange: (value: number) =>
  //         setDepthOfFieldState((state) => ({ ...state, bokehScale: value })),
  //     },
  //     width: {
  //       value: depthOfFieldState.width,
  //       min: 100,
  //       max: 1000,
  //       step: 1,
  //       onChange: (value: number) =>
  //         setDepthOfFieldState((state) => ({ ...state, width: value })),
  //     },
  //     height: {
  //       value: depthOfFieldState.height,
  //       min: 100,
  //       max: 1000,
  //       step: 1,
  //       onChange: (value: number) =>
  //         setDepthOfFieldState((state) => ({ ...state, height: value })),
  //     },
  //   }),
  //   {
  //     collapsed: true,
  //     render: () => {
  //       return isDebugMode || false
  //     },
  //   },
  // )

  const [
    bloomState, 
    // setBloomState
  ] = useState({
    mipmapBlur: true,
    radius: 0.84,
    levels: 3,
    blendFunction: BlendFunction.SCREEN,
    luminanceThreshold: 0.66,
    luminanceSmoothing: 0.7,
    intensity: 7.03,
    width: 500,
    height: 500,
  })

  // useControls(
  //   'Bloom',
  //   () => ({
  //     mipmapBlur: {
  //       value: bloomState.mipmapBlur,
  //       onChange: (value: boolean) =>
  //         setBloomState((state) => ({ ...state, mipmapBlur: value })),
  //     },
  //     radius: {
  //       value: bloomState.radius,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value: number) =>
  //         setBloomState((state) => ({ ...state, radius: value })),
  //     },
  //     levels: {
  //       value: bloomState.levels,
  //       min: 0,
  //       max: 15,
  //       step: 1,
  //       onChange: (value: number) =>
  //         setBloomState((state) => ({ ...state, levels: value })),
  //     },
  //     blendFunction: {
  //       value: bloomState.blendFunction,
  //       options: {
  //         Screen: BlendFunction.SCREEN,
  //         Add: BlendFunction.ADD,
  //         Subtract: BlendFunction.SUBTRACT,
  //         Multiply: BlendFunction.MULTIPLY,
  //         Divide: BlendFunction.DIVIDE,
  //       },
  //       onChange: (value: BlendFunction) =>
  //         setBloomState((state) => ({ ...state, blendFunction: value })),
  //     },
  //     luminanceThreshold: {
  //       value: bloomState.luminanceThreshold,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value: number) =>
  //         setBloomState((state) => ({ ...state, luminanceThreshold: value })),
  //     },
  //     luminanceSmoothing: {
  //       value: bloomState.luminanceSmoothing,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value: number) =>
  //         setBloomState((state) => ({ ...state, luminanceSmoothing: value })),
  //     },
  //     intensity: {
  //       value: bloomState.intensity,
  //       min: 0,
  //       max: 10,
  //       step: 0.01,
  //       onChange: (value: number) =>
  //         setBloomState((state) => ({ ...state, intensity: value })),
  //     },
  //     width: {
  //       value: bloomState.width,
  //       min: 100,
  //       max: 1000,
  //       step: 1,
  //       onChange: (value: number) =>
  //         setBloomState((state) => ({ ...state, width: value })),
  //     },
  //     height: {
  //       value: bloomState.height,
  //       min: 100,
  //       max: 1000,
  //       step: 1,
  //       onChange: (value: number) =>
  //         setBloomState((state) => ({ ...state, height: value })),
  //     },
  //   }),
  //   {
  //     collapsed: true,
  //     render: () => {
  //       return isDebugMode || false
  //     },
  //   },
  // )

  // this is necessary to ignore the background in selective bloom. This property is not provided in the r3f version of the API.
  // Otherwise along with the jewellery items, the background will also be bloomed.
  const selectiveBloomRef = useRef<SelectiveBloomEffect>(null)
  useEffect(() => {
    if (selectiveBloomRef.current) {
      selectiveBloomRef.current.ignoreBackground = true
    }
  }, [selectiveBloomRef.current])

  // refs for lights. Need this for selective bloom
  const directionalLightRef = useRef<THREE.DirectionalLight>(
    undefined as unknown as THREE.DirectionalLight,
  )
  const hemisphereLightRef = useRef<THREE.HemisphereLight>(
    undefined as unknown as THREE.HemisphereLight,
  )

  // const effectComposerRef = useRef<TEffectComposer>(null)
  return (
    <>
      <directionalLight
        ref={directionalLightRef}
        color={0xffffff}
        intensity={0.5}
        // position={[1 * 50, 1.5 * 50, 1 * 50]}
        position={[-93, 202, -177]}
        name='directionalLight'
      ></directionalLight>
      {/* <spotLight
        color={0xffffff}
        intensity={0.5}
        position={[1 * 50, 1.5 * 50, 1 * 50]}
        target={mapModel ? mapModel : undefined}
      ></spotLight> */}
      <hemisphereLight
        ref={hemisphereLightRef}
        color={0xffffff}
        groundColor={0x223344}
        intensity={0.3}
        name='hemisphereLight'
      ></hemisphereLight>

      <EffectComposer
        multisampling={effectComposerState.multisampling}
        disableNormalPass={effectComposerState.disableNormalPass}
        depthBuffer={effectComposerState.depthBuffer}
        stencilBuffer={effectComposerState.stencilBuffer}
        autoClear={effectComposerState.autoClear}
        resolutionScale={1}
        enabled={areEffectsEnabled}
        // ref={effectComposerRef}
      >
        <SMAA></SMAA>
        <DepthOfField
          focusDistance={depthOfFieldState.focusDistance} // where to focus
          focalLength={depthOfFieldState.focalLength} // focal length
          bokehScale={depthOfFieldState.bokehScale} // bokeh size
        />

        <SelectiveBloom
          ref={selectiveBloomRef}
          mipmapBlur={bloomState.mipmapBlur}
          radius={bloomState.radius}
          levels={bloomState.levels}
          blendFunction={bloomState.blendFunction}
          luminanceThreshold={bloomState.luminanceThreshold}
          luminanceSmoothing={bloomState.luminanceSmoothing}
          intensity={bloomState.intensity}
          lights={[directionalLightRef, hemisphereLightRef]}
          selectionLayer={LAYER_SELECTIVE_BLOOM}
        ></SelectiveBloom>
      </EffectComposer>
    </>
  )
})
