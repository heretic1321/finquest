import { useEffect, useState } from 'react'
import {
  // BackSide,
  Color,
  // DoubleSide,
  FrontSide,
  MeshPhysicalMaterial,
} from 'three'

// import { useControls } from 'leva'
import { TUseStoneMaterialType } from '@client/hooks/useMaterials'

// import { genericStore } from '@client/contexts/GlobalStateContext'

export function useDiamondMaterial(props: TUseStoneMaterialType) {
  // const isDebugMode = genericStore((state) => state.isDebugMode)

  const [
    state, 
    // setState
  ] = useState({
    name: props.name,
    envMap: props.envMap,
    transparent: props.transparent ?? false,
    color: props.color ?? '#ffffff',
    emissiveColor: props.emissiveColor ?? '#bebaba',
    emissiveIntensity: props.emissiveIntensity ?? 0.34,
    envMapIntensity: props.envMapIntensity ?? 3.04,
    flatShading: props.flatShading ?? false,
    fog: props.fog ?? false,
    metalness: props.metalness ?? 0.31,
    roughness: props.roughness ?? 0,
    opacity: props.opacity ?? 1,
    depthTest: props.depthTest ?? true,
    depthWrite: props.depthWrite ?? true,
    alphaTest: props.alphaTest ?? 0.1,
    side: props.side ?? FrontSide,
    toneMapped: props.toneMapped ?? true,
    emissiveMap: props.emissiveMap ?? null,

    attenuationColor: props.attenuationColor ?? '#ffffff',
    attenuationDistance: props.attenuationDistance ?? Infinity,
    clearcoat: props.clearcoat ?? 1,
    clearcoatRoughness: props.clearcoatRoughness ?? 0.29,
    ior: props.ior ?? 2.42,
    reflectivity: props.reflectivity ?? 0.44,
    sheen: props.sheen ?? 1,
    sheenRoughness: props.sheenRoughness ?? 0.15,
    sheenColor: props.sheenColor ?? '#ffffff',
    specularIntensity: props.specularIntensity ?? 1,
    specularColor: props.specularColor ?? '#dbdbdb',
    thickness: props.thickness ?? 0,
    transmission: props.transmission ?? 1,
  })

  // useControls(
  //   'Diamond Material ' + props.debugDisplayName,
  //   () => ({
  //     transparent: {
  //       value: state.transparent,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, transparent: value })),
  //     },
  //     color: {
  //       value: state.color,
  //       onChange: (value) => setState((state) => ({ ...state, color: value })),
  //     },
  //     emissiveColor: {
  //       value: state.emissiveColor,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, emissiveColor: value })),
  //     },
  //     emissiveIntensity: {
  //       value: state.emissiveIntensity,
  //       min: 0,
  //       max: 10,
  //       step: 0.01,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, emissiveIntensity: value })),
  //     },
  //     envMapIntensity: {
  //       value: state.envMapIntensity,
  //       min: 0,
  //       max: 10,
  //       step: 0.01,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, envMapIntensity: value })),
  //     },
  //     flatShading: {
  //       value: state.flatShading,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, flatShading: value })),
  //     },
  //     fog: {
  //       value: state.fog,
  //       onChange: (value) => setState((state) => ({ ...state, fog: value })),
  //     },
  //     metalness: {
  //       value: state.metalness,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, metalness: value })),
  //     },
  //     roughness: {
  //       value: state.roughness,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, roughness: value })),
  //     },
  //     opacity: {
  //       value: state.opacity,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, opacity: value })),
  //     },
  //     depthTest: {
  //       value: state.depthTest,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, depthTest: value })),
  //     },
  //     depthWrite: {
  //       value: state.depthWrite,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, depthWrite: value })),
  //     },
  //     alphaTest: {
  //       value: state.alphaTest,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, alphaTest: value })),
  //     },
  //     side: {
  //       value: state.side,
  //       options: {
  //         FrontSide: FrontSide,
  //         BackSide: BackSide,
  //         DoubleSide: DoubleSide,
  //       },
  //       onChange: (value) => setState((state) => ({ ...state, side: value })),
  //     },
  //     toneMapped: {
  //       value: state.toneMapped,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, toneMapped: value })),
  //     },
  //     attentuationColor: {
  //       value: state.attenuationColor,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, attentuationColor: value })),
  //     },
  //     attenuationDistance: {
  //       value: state.attenuationDistance,
  //       min: 0,
  //       max: 1000,
  //       step: 1,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, attenuationDistance: value })),
  //     },
  //     clearcoat: {
  //       value: state.clearcoat,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, clearcoat: value })),
  //     },
  //     clearcoatRoughness: {
  //       value: state.clearcoatRoughness,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, clearcoatRoughness: value })),
  //     },
  //     ior: {
  //       value: state.ior,
  //       min: 1,
  //       max: 2.33,
  //       step: 0.01,
  //       onChange: (value) => setState((state) => ({ ...state, ior: value })),
  //     },
  //     reflectivity: {
  //       value: state.reflectivity,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, reflectivity: value })),
  //     },
  //     sheen: {
  //       value: state.sheen,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value) => setState((state) => ({ ...state, sheen: value })),
  //     },
  //     sheenRoughness: {
  //       value: state.sheenRoughness,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, sheenRoughness: value })),
  //     },
  //     sheenColor: {
  //       value: state.sheenColor,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, sheenColor: value })),
  //     },
  //     specularIntensity: {
  //       value: state.specularIntensity,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, specularIntensity: value })),
  //     },
  //     specularColor: {
  //       value: state.specularColor,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, specularColor: value })),
  //     },
  //     thickness: {
  //       value: state.thickness,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, thickness: value })),
  //     },
  //     transmission: {
  //       value: state.transmission,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value) =>
  //         setState((state) => ({ ...state, transmission: value })),
  //     },
  //   }),
  //   {
  //     collapsed: true,
  //     render: () => {
  //       return isDebugMode || false
  //     },
  //   },
  // )

  const [material] = useState<MeshPhysicalMaterial>(
    new MeshPhysicalMaterial({
      envMap: state.envMap,
      transparent: state.transparent,
      color: new Color(state.color),
      emissive: new Color(state.emissiveColor),
      emissiveIntensity: state.emissiveIntensity,
      envMapIntensity: state.envMapIntensity,
      flatShading: state.flatShading,
      fog: state.fog,
      metalness: state.metalness,
      roughness: state.roughness,
      opacity: state.opacity,
      depthTest: state.depthTest,
      depthWrite: state.depthWrite,
      alphaTest: state.alphaTest,
      side: state.side,
      toneMapped: state.toneMapped,
      emissiveMap: state.emissiveMap,
      attenuationColor: new Color(state.attenuationColor),
      attenuationDistance: state.attenuationDistance,
      clearcoat: state.clearcoat,
      clearcoatRoughness: state.clearcoatRoughness,
      ior: state.ior,
      reflectivity: state.reflectivity,
      sheen: state.sheen,
      sheenRoughness: state.sheenRoughness,
      sheenColor: new Color(state.sheenColor),
      specularIntensity: state.specularIntensity,
      specularColor: new Color(state.specularColor),
      // @ts-ignore
      thickness: state.thickness,
      transmission: state.transmission,
    }),
  )

  useEffect(() => {
    material.name = state.name
    if (state.envMap) material.envMap = state.envMap
    material.transparent = state.transparent
    material.color = new Color(state.color)
    material.emissive = new Color(state.emissiveColor)
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
    material.emissiveMap = state.emissiveMap

    material.attenuationColor = new Color(state.attenuationColor)
    material.attenuationDistance = state.attenuationDistance
    material.clearcoat = state.clearcoat
    material.clearcoatRoughness = state.clearcoatRoughness
    material.ior = state.ior
    material.reflectivity = state.reflectivity
    material.sheen = state.sheen
    material.sheenRoughness = state.sheenRoughness
    material.sheenColor = new Color(state.sheenColor)
    material.specularIntensity = state.specularIntensity
    material.specularColor = new Color(state.specularColor)
    material.thickness = state.thickness
    material.transmission = state.transmission
  }, [state, material])

  return material
}
