import { useEffect, useState } from 'react'
import { MeshStandardMaterial } from 'three'
import * as THREE from 'three'

// import { useControls } from 'leva'

import { staticResourcePaths } from '@client/config/staticResourcePaths'
import usePMREM from '@client/hooks/usePMREM'
// import { genericStore } from '@client/contexts/GlobalStateContext'

export interface GlassMaterialProps {
  name: string
  skyboxPath: string
  envMap: THREE.Texture
  color: string
  emissiveColor: string
  emissiveIntensity: number
  envMapIntensity: number
  flatShading: boolean
  fog: boolean
  metalness: number
  roughness: number
  opacity: number
  depthTest: boolean
  depthWrite: boolean
  alphaTest: number
  side: THREE.Side
}

export const useGlassMaterial = (props: GlassMaterialProps) => {
  // const isDebugMode = genericStore((state) => state.isDebugMode)
  const [
    state, 
    // setState
  ] = useState<GlassMaterialProps>({
    name: props.name || 'DefaultName',
    skyboxPath: props.skyboxPath || staticResourcePaths.sky,
    envMap: props.envMap || usePMREM(staticResourcePaths.sky),
    color: props.color || '#ff6b6b',
    emissiveColor: props.emissiveColor || '#000000',
    emissiveIntensity: props.emissiveIntensity || 0,
    envMapIntensity: props.envMapIntensity || 1.68,
    flatShading: props.flatShading || false,
    fog: props.fog || false,
    metalness: props.metalness || 1,
    roughness: props.roughness || 1,
    opacity: props.opacity || 0.67,
    depthTest: props.depthTest || true,
    depthWrite: props.depthWrite || true,
    alphaTest: props.alphaTest || 0,
    side: props.side
  })


  // useControls(
  //   'GlassMaterial_' + state.name,
  //   () => ({
  //     color: {
  //       value: state.color,
  //       onChange: (value: string) => {
  //         setState((prevState) => ({
  //           ...prevState,
  //           color: value,
  //         }))
  //       },
  //     },
  //     emissiveColor: {
  //       value: state.emissiveColor,
  //       onChange: (value: string) => {
  //         setState((prevState) => ({
  //           ...prevState,
  //           emissiveColor: value,
  //         }))
  //       },
  //     },
  //     emissiveIntensity: {
  //       value: state.emissiveIntensity,
  //       min: 0,
  //       max: 5,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         setState((prevState) => ({
  //           ...prevState,
  //           emissiveIntensity: value,
  //         }))
  //       },
  //     },
  //     envMapIntensity: {
  //       value: state.envMapIntensity,
  //       min: 0,
  //       max: 5,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         setState((prevState) => ({
  //           ...prevState,
  //           envMapIntensity: value,
  //         }))
  //       },
  //     },
  //     flatShading: {
  //       value: state.flatShading,
  //       onChange: (value: boolean) => {
  //         setState((prevState) => ({
  //           ...prevState,
  //           flatShading: value,
  //         }))
  //       },
  //     },
  //     fog: {
  //       value: state.fog,
  //       onChange: (value: boolean) => {
  //         setState((prevState) => ({
  //           ...prevState,
  //           fog: value,
  //         }))
  //       },
  //     },
  //     metalness: {
  //       value: state.metalness,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         setState((prevState) => ({
  //           ...prevState,
  //           metalness: value,
  //         }))
  //       },
  //     },
  //     roughness: {
  //       value: state.roughness,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         setState((prevState) => ({
  //           ...prevState,
  //           roughness: value,
  //         }))
  //       },
  //     },
  //     opacity: {
  //       value: state.opacity,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         setState((prevState) => ({
  //           ...prevState,
  //           opacity: value,
  //         }))
  //       },
  //     },
  //     depthTest: {
  //       value: state.depthTest,
  //       onChange: (value: boolean) => {
  //         setState((prevState) => ({
  //           ...prevState,
  //           depthTest: value,
  //         }))
  //       },
  //     },
  //     depthWrite: {
  //       value: state.depthWrite,
  //       onChange: (value: boolean) => {
  //         setState((prevState) => ({
  //           ...prevState,
  //           depthWrite: value,
  //         }))
  //       },
  //     },
  //     alphaTest: {
  //       value: state.alphaTest,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         setState((prevState) => ({
  //           ...prevState,
  //           alphaTest: value,
  //         }))
  //       },
  //     },
  //     // side: {
  //     //   value: state.side,
  //     //   options: {
  //     //     FrontSide: THREE.FrontSide,
  //     //     BackSide: THREE.BackSide,
  //     //     DoubleSide: THREE.DoubleSide,
  //     //   },
  //     //   onChange: (value: THREE.Side) => {
  //     //     setState((prevState) => ({
  //     //       ...prevState,
  //     //       side: value,
  //     //     }))
  //     //   },
  //     // },
  //   }),
  //   {
  //     collapsed: true,
  //     render: () => {
  //       return isDebugMode || false
  //     },
  //   },
  // )

  const [glassMaterial] = useState(new MeshStandardMaterial())
  useEffect(() => {
    glassMaterial.envMap = state.envMap
    glassMaterial.transparent = true

    glassMaterial.color = new THREE.Color(state.color)
    glassMaterial.emissive = new THREE.Color(state.emissiveColor)
    glassMaterial.emissiveIntensity = state.emissiveIntensity
    glassMaterial.envMapIntensity = state.envMapIntensity
    glassMaterial.flatShading = state.flatShading
    glassMaterial.fog = state.fog
    glassMaterial.metalness = state.metalness
    glassMaterial.roughness = state.roughness
    glassMaterial.opacity = state.opacity
    glassMaterial.depthTest = state.depthTest
    glassMaterial.depthWrite = state.depthWrite
    glassMaterial.alphaTest = state.alphaTest
    glassMaterial.side = state.side
  }, [state, glassMaterial])

  return glassMaterial
}
