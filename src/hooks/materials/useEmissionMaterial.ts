import { useEffect, useState } from 'react'
import { MeshStandardMaterial } from 'three'
import * as THREE from 'three'

import { useControls } from 'leva'

import { staticResourcePaths } from '@client/config/staticResourcePaths'
import usePMREM from '@client/hooks/usePMREM'
import { genericStore } from '@client/contexts/GlobalStateContext'

type TUseEmissionMaterial = {
  color?: string
  emissiveColor: string
  debugDisplayName: string
  emissiveIntensity: number
  envMapIntensity?: number
  metalness?: number
}

export const useEmissionMaterial = (props: TUseEmissionMaterial) => {
  const isDebugMode = genericStore((state) => state.isDebugMode)
  const envMap = usePMREM(staticResourcePaths.jewelleryEnvMapTexture)

  const [state, setState] = useState<{
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
  }>({
    color: props.color ?? '#000000',
    emissiveColor: props.emissiveColor,
    emissiveIntensity: props.emissiveIntensity,
    envMapIntensity: props.envMapIntensity ?? 0.5,
    flatShading: false,
    fog: true,
    metalness: props.metalness ?? 0,
    roughness: 1,
    opacity: 1,
    depthTest: true,
    depthWrite: false,
    alphaTest: 0,
    side: THREE.FrontSide,
  })

  useControls(
    `EmissiveMaterial ${props.debugDisplayName}`,
    () => ({
      color: {
        value: state.color,
        onChange: (value: string) => {
          setState((prevState) => ({
            ...prevState,
            color: value,
          }))
        },
      },
      emissiveColor: {
        value: state.emissiveColor,
        onChange: (value: string) => {
          setState((prevState) => ({
            ...prevState,
            emissiveColor: value,
          }))
        },
      },
      emissiveIntensity: {
        value: state.emissiveIntensity,
        min: 0,
        max: 5,
        step: 0.01,
        onChange: (value: number) => {
          setState((prevState) => ({
            ...prevState,
            emissiveIntensity: value,
          }))
        },
      },
      envMapIntensity: {
        value: state.envMapIntensity,
        min: 0,
        max: 5,
        step: 0.01,
        onChange: (value: number) => {
          setState((prevState) => ({
            ...prevState,
            envMapIntensity: value,
          }))
        },
      },
      flatShading: {
        value: state.flatShading,
        onChange: (value: boolean) => {
          setState((prevState) => ({
            ...prevState,
            flatShading: value,
          }))
        },
      },
      fog: {
        value: state.fog,
        onChange: (value: boolean) => {
          setState((prevState) => ({
            ...prevState,
            fog: value,
          }))
        },
      },
      metalness: {
        value: state.metalness,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value: number) => {
          setState((prevState) => ({
            ...prevState,
            metalness: value,
          }))
        },
      },
      roughness: {
        value: state.roughness,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value: number) => {
          setState((prevState) => ({
            ...prevState,
            roughness: value,
          }))
        },
      },
      opacity: {
        value: state.opacity,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value: number) => {
          setState((prevState) => ({
            ...prevState,
            opacity: value,
          }))
        },
      },
      depthTest: {
        value: state.depthTest,
        onChange: (value: boolean) => {
          setState((prevState) => ({
            ...prevState,
            depthTest: value,
          }))
        },
      },
      depthWrite: {
        value: state.depthWrite,
        onChange: (value: boolean) => {
          setState((prevState) => ({
            ...prevState,
            depthWrite: value,
          }))
        },
      },
      alphaTest: {
        value: state.alphaTest,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value: number) => {
          setState((prevState) => ({
            ...prevState,
            alphaTest: value,
          }))
        },
      },
      side: {
        value: state.side,
        options: {
          FrontSide: THREE.FrontSide,
          BackSide: THREE.BackSide,
          DoubleSide: THREE.DoubleSide,
        },
        onChange: (value: THREE.Side) => {
          setState((prevState) => ({
            ...prevState,
            side: value,
          }))
        },
      },
    }),
    {
      collapsed: true,
      render: () => {
        return isDebugMode || false
      },
    },
  )

  const [emissiveMaterial] = useState(new MeshStandardMaterial())

  useEffect(() => {
    emissiveMaterial.envMap = envMap
    emissiveMaterial.transparent = true

    emissiveMaterial.color = new THREE.Color(state.color)
    emissiveMaterial.emissive = new THREE.Color(state.emissiveColor)
    emissiveMaterial.emissiveIntensity = state.emissiveIntensity
    emissiveMaterial.envMapIntensity = state.envMapIntensity
    emissiveMaterial.flatShading = state.flatShading
    emissiveMaterial.fog = state.fog
    emissiveMaterial.metalness = state.metalness
    emissiveMaterial.roughness = state.roughness
    emissiveMaterial.opacity = state.opacity
    emissiveMaterial.depthTest = state.depthTest
    emissiveMaterial.depthWrite = state.depthWrite
    emissiveMaterial.alphaTest = state.alphaTest
    emissiveMaterial.side = state.side
    emissiveMaterial.toneMapped = false
  }, [state, emissiveMaterial])

  return emissiveMaterial
}
