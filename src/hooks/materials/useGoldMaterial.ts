import { useEffect, useState } from 'react'
import { MeshStandardMaterial } from 'three'
import * as THREE from 'three'

// import { useControls } from 'leva'
import { TUseNonStoneMaterialType } from '@client/hooks/useMaterials'

// import { genericStore } from '@client/contexts/GlobalStateContext'

export function useGoldMaterial(props: TUseNonStoneMaterialType) {
  // const isDebugMode = genericStore((state) => state.isDebugMode)

  const [
    state, 
    // setState
  ] = useState({
    name: props.name,
    envMap: props.envMap,
    transparent: props.transparent ?? false,
    color: props.color ?? '#e8cf71',
    emissiveColor: props.emissiveColor ?? '#f4f57f',
    emissiveIntensity: props.emissiveIntensity ?? 0,
    envMapIntensity: props.envMapIntensity ?? 2.7,
    flatShading: props.flatShading ?? false,
    fog: props.fog ?? true,
    metalness: props.metalness ?? 0.9,
    roughness: props.roughness ?? 0.16,
    opacity: props.opacity ?? 1,
    depthTest: props.depthTest ?? true,
    depthWrite: props.depthWrite ?? true,
    alphaTest: props.alphaTest ?? 0,
    side: props.side ?? THREE.FrontSide,
    toneMapped: props.toneMapped ?? true,
  })

  // useControls(
  //   `GoldMaterial ${props.debugDisplayName}`,
  //   () => ({
  //     transparent: {
  //       value: state.transparent,
  //       onChange: (value: boolean) => {
  //         setState((prevState) => ({
  //           ...prevState,
  //           transparent: value,
  //         }))
  //       },
  //     },
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
  //       max: 10,
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
  //       max: 10,
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
  //       onChange: (value: number) => {
  //         setState((prevState) => ({
  //           ...prevState,
  //           alphaTest: value,
  //         }))
  //       },
  //     },
  //     side: {
  //       value: state.side,
  //       options: {
  //         FrontSide: THREE.FrontSide,
  //         BackSide: THREE.BackSide,
  //         DoubleSide: THREE.DoubleSide,
  //       },
  //       onChange: (value: THREE.Side) => {
  //         setState((prevState) => ({
  //           ...prevState,
  //           side: value,
  //         }))
  //       },
  //     },
  //     toneMapped: {
  //       value: state.toneMapped,
  //       onChange: (value: boolean) => {
  //         setState((prevState) => ({
  //           ...prevState,
  //           toneMapped: value,
  //         }))
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

  const [material] = useState<MeshStandardMaterial>(new MeshStandardMaterial())

  useEffect(() => {
    material.name = state.name
    if (state.envMap) material.envMap = state.envMap
    material.transparent = state.transparent
    material.color = new THREE.Color(state.color)
    material.emissive = new THREE.Color(state.emissiveColor)
    material.emissiveIntensity = state.emissiveIntensity
    material.envMapIntensity = state.envMapIntensity
    material.flatShading = state.flatShading
    material.fog = state.fog
    material.metalness = state.metalness
    material.roughness = state.roughness
    material.opacity = state.opacity
    material.depthTest = state.depthTest
    material.depthWrite = state.depthWrite
    material.alphaTest = state.alphaTest
    material.side = state.side
    material.toneMapped = state.toneMapped

    return () => {
      material.dispose()
    }
  }, [state, material])

  return material
}
