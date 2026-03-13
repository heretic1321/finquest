import { useTexture } from '@react-three/drei'

import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { useCheapDiamondMaterial } from '@client/hooks/materials/useCheapDiamondMaterial'
import { useDiamondMaterial } from '@client/hooks/materials/useDiamondMaterial'
import { useGoldMaterial } from '@client/hooks/materials/useGoldMaterial'
import usePMREM, {
  usePMREMWithCubeMap
} from '@client/hooks/usePMREM'

import { genericStore } from '@client/contexts/GlobalStateContext'
import { MaterialStore } from '@client/contexts/MaterialContext'
import { useEffect } from 'react'
import { DoubleSide, FrontSide, MeshStandardMaterial } from 'three'
import { useCeramicMaterial } from './materials/useCeramicMaterial'
import { useCheapWaterMaterial } from './materials/useCheapWaterMaterial'
import { GlassMaterialProps, useGlassMaterial } from './materials/useGlassMaterial'

export type TUseNonStoneMaterialType = {
  name: string
  envMap?: THREE.Texture
  transparent?: boolean
  color?: string
  emissiveColor?: string
  emissiveIntensity?: number
  envMapIntensity?: number
  flatShading?: boolean
  fog?: boolean
  metalness?: number
  roughness?: number
  opacity?: number
  depthTest?: boolean
  depthWrite?: boolean
  alphaTest?: number
  side?: THREE.Side
  toneMapped?: boolean
  emissiveMap?: THREE.Texture
  debugDisplayName?: string
}

export type TUseStoneMaterialType = TUseNonStoneMaterialType & {
  attenuationColor?: string
  attenuationDistance?: number
  clearcoat?: number
  clearcoatRoughness?: number
  ior?: number
  reflectivity?: number
  sheen?: number
  sheenRoughness?: number
  sheenColor?: string
  specularIntensity?: number
  specularColor?: string
  thickness?: number
  transmission?: number
}

const useMaterials = () => {
  const envMapTexture = usePMREM(staticResourcePaths.jewelleryEnvMapTexture)
  const rainbowTexture = useTexture(staticResourcePaths.rainbowTexture)
  const mainSkyTexture = usePMREMWithCubeMap(staticResourcePaths.mainSkyTexture)

  // GOLD MATERIALS
  const whiteGoldMaterial = useGoldMaterial({
    envMap: envMapTexture,
    name: 'WhiteGold',
    color: '#fffdfd',
    emissiveColor: '#b4abab',
    debugDisplayName: 'WhiteGold',
  })
  useEffect(() => {
    MaterialStore.setState({ whiteGoldMaterial })
  }, [whiteGoldMaterial])

  const yellowGoldMaterial = useGoldMaterial({
    envMap: envMapTexture,
    name: 'YellowGold',
    color: '#e8cf71',
    emissiveColor: '#f4f57f',
    debugDisplayName: 'YellowGold',
  })
  useEffect(() => {
    MaterialStore.setState({ yellowGoldMaterial })
  }, [yellowGoldMaterial])

  const roseGoldMaterial = useGoldMaterial({
    envMap: envMapTexture,
    name: 'RoseGold',
    color: '#ffd2c7',
    emissiveColor: '#ffb3b3',
    debugDisplayName: 'RoseGold',
  })
  useEffect(() => {
    MaterialStore.setState({ roseGoldMaterial })
  }, [roseGoldMaterial])

  const minaPinkMaterial = useGoldMaterial({
    envMap: envMapTexture,
    name: 'MinaPink',
    color: '#FF70A2',
    emissiveColor: '#ffb3b3',
    debugDisplayName: 'MinaPink',
  })
  useEffect(() => {
    MaterialStore.setState({ minaPinkMaterial })
  }, [minaPinkMaterial])

  // CERAMIC MATERIALS
  const ceramicBlackMaterial = useCeramicMaterial({
    envMap: envMapTexture,
    color: '#000000',
    debugDisplayName: 'Black',
    name: 'CeramicBlack',
  })
  useEffect(() => {
    MaterialStore.setState({ ceramicBlackMaterial })
  }, [ceramicBlackMaterial])

  const ceramicBlueMaterial = useCeramicMaterial({
    envMap: envMapTexture,
    color: '#0000ff',
    debugDisplayName: 'Blue',
    name: 'CeramicBlue',
  })
  useEffect(() => {
    MaterialStore.setState({ ceramicBlueMaterial })
  }, [ceramicBlueMaterial])

  const ceramicBrownMaterial = useCeramicMaterial({
    envMap: envMapTexture,
    color: '#a52a2a',
    debugDisplayName: 'Brown',
    name: 'CeramicBrown',
  })
  useEffect(() => {
    MaterialStore.setState({ ceramicBrownMaterial })
  }, [ceramicBrownMaterial])

  const ceramicCreamMaterial = useCeramicMaterial({
    envMap: envMapTexture,
    color: '#fffdd0',
    debugDisplayName: 'Cream',
    name: 'CeramicCream',
  })
  useEffect(() => {
    MaterialStore.setState({ ceramicCreamMaterial })
  }, [ceramicCreamMaterial])

  const ceramicYellowMaterial = useCeramicMaterial({
    envMap: envMapTexture,
    color: '#ffff00',
    debugDisplayName: 'Yellow',
    name: 'CeramicYellow',
  })
  useEffect(() => {
    MaterialStore.setState({ ceramicYellowMaterial })
  }, [ceramicYellowMaterial])

  const ceramicGreenMaterial = useCeramicMaterial({
    envMap: envMapTexture,
    color: '#00ff00',
    debugDisplayName: 'Green',
    name: 'CeramicGreen',
  })
  useEffect(() => {
    MaterialStore.setState({ ceramicGreenMaterial })
  }, [ceramicGreenMaterial])

  // DIAMOND / STONE MATERIALS
  const diamondMaterial = useDiamondMaterial({
    envMap: envMapTexture,
    emissiveMap: rainbowTexture,
    debugDisplayName: 'Plain',
    name: 'Diamond',
  })
  useEffect(() => {
    MaterialStore.setState({ diamondMaterial })
  }, [diamondMaterial])

  const cheapDiamondMaterial = useCheapDiamondMaterial({
    envMap: mainSkyTexture,
    debugDisplayName: 'Plain',
    name: 'Cheap Diamond',
  })
  useEffect(() => {
    MaterialStore.setState({ cheapDiamondMaterial })
  }, [cheapDiamondMaterial])

  const blueStoneMaterial = useDiamondMaterial({
    envMap: envMapTexture,
    emissiveMap: rainbowTexture,
    color: '#0000ff',
    debugDisplayName: 'Blue',
    name: 'ColorStoneBlue',
  })
  useEffect(() => {
    MaterialStore.setState({ blueStoneMaterial })
  }, [blueStoneMaterial])

  const cheapBlueStoneMaterial = useCheapDiamondMaterial({
    envMap: envMapTexture,
    color: '#0000ff',
    debugDisplayName: 'Blue',
    name: 'Cheap ColorStoneBlue',
  })
  useEffect(() => {
    MaterialStore.setState({ cheapBlueStoneMaterial })
  }, [cheapBlueStoneMaterial])

  const emeraldStoneMaterial = useDiamondMaterial({
    envMap: envMapTexture,
    emissiveMap: rainbowTexture,
    color: '#50c878',
    debugDisplayName: 'Emerald',
    name: 'ColorStoneEmerald',
  })
  useEffect(() => {
    MaterialStore.setState({ emeraldStoneMaterial })
  }, [emeraldStoneMaterial])

  const cheapEmeraldStoneMaterial = useCheapDiamondMaterial({
    envMap: envMapTexture,
    color: '#50c878',
    debugDisplayName: 'Emerald',
    name: 'Cheap ColorStoneEmerald',
  })
  useEffect(() => {
    MaterialStore.setState({ cheapEmeraldStoneMaterial })
  }, [cheapEmeraldStoneMaterial])

  const greenStoneMaterial = useDiamondMaterial({
    envMap: envMapTexture,
    emissiveMap: rainbowTexture,
    color: '#00ff00',
    debugDisplayName: 'Green',
    name: 'ColorStoneGreen',
  })
  useEffect(() => {
    MaterialStore.setState({ greenStoneMaterial })
  }, [greenStoneMaterial])

  const cheapGreenStoneMaterial = useCheapDiamondMaterial({
    envMap: envMapTexture,
    color: '#00ff00',
    debugDisplayName: 'Green',
    name: 'Cheap ColorStoneGreen',
  })
  useEffect(() => {
    MaterialStore.setState({ cheapGreenStoneMaterial })
  }, [cheapGreenStoneMaterial])

  const pinkStoneMaterial = useDiamondMaterial({
    envMap: envMapTexture,
    emissiveMap: rainbowTexture,
    color: '#ffc0cb',
    debugDisplayName: 'Pink',
    name: 'ColorStonePink',
  })
  useEffect(() => {
    MaterialStore.setState({ pinkStoneMaterial })
  }, [pinkStoneMaterial])

  const cheapPinkStoneMaterial = useCheapDiamondMaterial({
    envMap: envMapTexture,
    color: '#ffc0cb',
    debugDisplayName: 'Pink',
    name: 'Cheap ColorStonePink',
  })
  useEffect(() => {
    MaterialStore.setState({ cheapPinkStoneMaterial })
  }, [cheapPinkStoneMaterial])

  const purpleStoneMaterial = useDiamondMaterial({
    envMap: envMapTexture,
    emissiveMap: rainbowTexture,
    color: '#800080',
    debugDisplayName: 'Purple',
    name: 'ColorStonePurple',
  })
  useEffect(() => {
    MaterialStore.setState({ purpleStoneMaterial })
  }, [purpleStoneMaterial])

  const cheapPurpleStoneMaterial = useCheapDiamondMaterial({
    envMap: envMapTexture,
    color: '#800080',
    debugDisplayName: 'Purple',
    name: 'Cheap ColorStonePurple',
  })
  useEffect(() => {
    MaterialStore.setState({ cheapPurpleStoneMaterial })
  }, [cheapPurpleStoneMaterial])

  const yellowStoneMaterial = useDiamondMaterial({
    envMap: envMapTexture,
    emissiveMap: rainbowTexture,
    color: '#ffff00',
    debugDisplayName: 'Yellow',
    name: 'ColorStoneYellow',
  })
  useEffect(() => {
    MaterialStore.setState({ yellowStoneMaterial })
  }, [yellowStoneMaterial])

  const cheapYellowStoneMaterial = useCheapDiamondMaterial({
    envMap: envMapTexture,
    color: '#ffff00',
    debugDisplayName: 'Yellow',
    name: 'Cheap ColorStoneYellow',
  })
  useEffect(() => {
    MaterialStore.setState({ cheapYellowStoneMaterial })
  }, [cheapYellowStoneMaterial])

  const waterBaseMaterial = useCheapWaterMaterial({
    color: "#383838",
    metalness: 1,
    roughness: 0,
    depthWrite: true,
    depthTest: true,
    envMapIntensity: 3.41,
    toneMapped: true,
    name: "xxx"
  })
  useEffect(() => {
    MaterialStore.setState({ waterBaseMaterial })
  }, [waterBaseMaterial])

  const glassNonReflectiveMaterial = useGlassMaterial({
    name: 'glassNonReflective',
    color: '#83d8cb',
    emissiveColor: '#000000',
    emissiveIntensity: 0,
    envMapIntensity: 0.51,
    flatShading: false,
    fog: false,
    metalness: 0.94,
    roughness: 0,
    opacity: 0.12,
    depthTest: true,
    depthWrite: true,
    alphaTest: 0,
    side: DoubleSide,
    envMap: mainSkyTexture,
  } as GlassMaterialProps)
  useEffect(() => {
    MaterialStore.setState({ glassNonReflectiveMaterial })
  }, [glassNonReflectiveMaterial])
  
  const glassReflectiveMaterial = useGlassMaterial({
    name: 'glassReflective',
    envMap: mainSkyTexture,
    side: DoubleSide
  } as GlassMaterialProps)
  useEffect(() => {
    MaterialStore.setState({ glassReflectiveMaterial })
  }, [glassReflectiveMaterial])

  const domeGlassMaterial = useGlassMaterial({
    name: 'domeGlass',
    color: '#ffffff',
    skyboxPath: staticResourcePaths.jewelleryEnvMapTexture,
    envMap: mainSkyTexture,
    envMapIntensity: 5,
    metalness: 1,
    roughness: 0.07,
    opacity: 0.59,
    side: DoubleSide
  } as GlassMaterialProps)
  useEffect(() => {
    MaterialStore.setState({ domeGlassMaterial })
  }, [domeGlassMaterial])

  const glassDoorMaterial = useGlassMaterial({
    name: 'glassDoor',
    color: '#d1d1d1',
    envMap: mainSkyTexture,
    envMapIntensity: 1.32,
    metalness: 1,
    roughness: 0.11,
    opacity: 0.51,
    side: FrontSide
  } as GlassMaterialProps)
  useEffect(() => {
    MaterialStore.setState({ glassDoorMaterial })
  }, [glassDoorMaterial])

  const noMaterial = useCeramicMaterial({
    envMap: envMapTexture,
    color: '#ffffff',
    debugDisplayName: 'NoMaterial',
    name: 'NoMaterial',
  })
  useEffect(() => {
    MaterialStore.setState({ noMaterial })
  }, [noMaterial])

  return {}
}

export const useAsteroidMaterials = () => {
  if (!genericStore.getState().isMiningEnabled) return null

  const baseColorTexture = useTexture(staticResourcePaths.asteroidBaseColorTexture)
  const metallicRoughnessTexture = useTexture(staticResourcePaths.asteroidMetallicRoughnessTexture)
  const normalTexture = useTexture(staticResourcePaths.asteroidNormalTexture)

  // const [baseColorTextureState, setBaseColorTextureState] = useState<
  // {
  //   mapping: number
  //   channel: number
  //   wrapS: number
  //   wrapT: number
  //   magFilter: number
  //   minFilter: number
  //   offsetX: number
  //   offsetY: number
  //   repeatX: number
  //   repeatY: number
  //   rotation: number
  //   centerX: number
  //   centerY: number
  //   flipY: boolean
  // }
  // >({
  //   mapping: UVMapping,
  //   channel: 0,
  //   wrapS: ClampToEdgeWrapping,
  //   wrapT: ClampToEdgeWrapping,
  //   magFilter: LinearFilter,
  //   minFilter: LinearMipMapLinearFilter,
  //   offsetX: 0,
  //   offsetY: 0,
  //   repeatX: 1,
  //   repeatY: 1,
  //   rotation: 0,
  //   centerX: 0,
  //   centerY: 0,
  //   flipY: false,
  // })

  // useControls(
  //   'Asteroid Base Color Texture',
  //   () => ({
  //     mapping: {
  //       value: baseColorTextureState.mapping,
  //       options: [UVMapping, CubeReflectionMapping, CubeRefractionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping, CubeUVReflectionMapping],
  //       onChange: (value: number) => {
  //         setBaseColorTextureState((prev) => ({ ...prev, mapping: value }))
  //         baseColorTexture.needsUpdate = true
  //       }
  //     },
  //     channel: {
  //       value: baseColorTextureState.channel,
  //       min: 0,
  //       max: 3,
  //       step: 1,
  //       onChange: (value: number) => {
  //         setBaseColorTextureState((prev) => ({ ...prev, channel: value }))
  //         baseColorTexture.needsUpdate = true
  //       }
  //     },
  //     wrapS: {
  //       value: baseColorTextureState.wrapS,
  //       options: [ClampToEdgeWrapping, RepeatWrapping, MirroredRepeatWrapping],
  //       onChange: (value: number) => {
  //         setBaseColorTextureState((prev) => ({ ...prev, wrapS: value }))
  //         baseColorTexture.needsUpdate = true
  //       }
  //     },
  //     wrapT: {
  //       value: baseColorTextureState.wrapT,
  //       options: [ClampToEdgeWrapping, RepeatWrapping, MirroredRepeatWrapping],
  //       onChange: (value: number) => {
  //         setBaseColorTextureState((prev) => ({ ...prev, wrapT: value }))
  //         baseColorTexture.needsUpdate = true
  //       }
  //     },
  //     magFilter: {
  //       value: baseColorTextureState.magFilter,
  //       options: [LinearFilter, NearestFilter],
  //       onChange: (value: number) => {
  //         setBaseColorTextureState((prev) => ({ ...prev, magFilter: value }))
  //         baseColorTexture.needsUpdate = true
  //       }
  //     },
  //     minFilter: {
  //       value: baseColorTextureState.minFilter,
  //       options: [NearestFilter, NearestMipMapLinearFilter, NearestMipMapNearestFilter, LinearFilter, LinearMipMapLinearFilter, LinearMipMapNearestFilter],
  //       onChange: (value: number) => {
  //         setBaseColorTextureState((prev) => ({ ...prev, minFilter: value }))
  //         baseColorTexture.needsUpdate = true
  //       }
  //     },
  //     offsetX: {
  //       value: baseColorTextureState.offsetX,
  //       min: -1,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         setBaseColorTextureState((prev) => ({ ...prev, offsetX: value }))
  //         baseColorTexture.needsUpdate = true
  //       }
  //     },
  //     offsetY: {
  //       value: baseColorTextureState.offsetY,
  //       min: -1,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         setBaseColorTextureState((prev) => ({ ...prev, offsetY: value }))
  //         baseColorTexture.needsUpdate = true
  //       }
  //     },
  //     repeatX: {
  //       value: baseColorTextureState.repeatX,
  //       min: 0,
  //       max: 10,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         setBaseColorTextureState((prev) => ({ ...prev, repeatX: value }))
  //         baseColorTexture.needsUpdate = true
  //       }
  //     },
  //     repeatY: {
  //       value: baseColorTextureState.repeatY,
  //       min: 0,
  //       max: 10,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         setBaseColorTextureState((prev) => ({ ...prev, repeatY: value }))
  //         baseColorTexture.needsUpdate = true
  //       }
  //     },
  //     rotation: {
  //       value: baseColorTextureState.rotation,
  //       min: -360,
  //       max: 360,
  //       step: 1,
  //       onChange: (value: number) => {
  //         setBaseColorTextureState((prev) => ({ ...prev, rotation: value * (Math.PI / 180) }))
  //         baseColorTexture.needsUpdate = true
  //       }
  //     },
  //     centerX: {
  //       value: baseColorTextureState.centerX,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         setBaseColorTextureState((prev) => ({ ...prev, centerX: value }))
  //         baseColorTexture.needsUpdate = true
  //       }
  //     },
  //     centerY: {
  //       value: baseColorTextureState.centerY,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         setBaseColorTextureState((prev) => ({ ...prev, centerY: value }))
  //         baseColorTexture.needsUpdate = true
  //       }
  //     },
  //     flipY: {
  //       value: baseColorTextureState.flipY,
  //       onChange: (value: boolean) => {
  //         setBaseColorTextureState((prev) => ({ ...prev, flipY: value }))
  //         baseColorTexture.needsUpdate = true
  //       }
  //     },
  //   })
  // )

  // useEffect(() => {
  //   if (baseColorTexture) {
  //     baseColorTexture.mapping = baseColorTextureState.mapping as AnyMapping
  //     baseColorTexture.wrapS = baseColorTextureState.wrapS as Wrapping
  //     baseColorTexture.wrapT = baseColorTextureState.wrapT as Wrapping
  //     baseColorTexture.magFilter = baseColorTextureState.magFilter as MagnificationTextureFilter
  //     baseColorTexture.minFilter = baseColorTextureState.minFilter as MinificationTextureFilter
  //     baseColorTexture.offset.set(baseColorTextureState.offsetX, baseColorTextureState.offsetY)
  //     baseColorTexture.repeat.set(baseColorTextureState.repeatX, baseColorTextureState.repeatY)
  //     baseColorTexture.rotation = baseColorTextureState.rotation
  //     baseColorTexture.center.set(baseColorTextureState.centerX, baseColorTextureState.centerY)
  //     baseColorTexture.flipY = baseColorTextureState.flipY
  //   }
  // }, [baseColorTextureState, baseColorTexture])

  useEffect(() => {
    baseColorTexture.flipY = false
    baseColorTexture.needsUpdate = true

    metallicRoughnessTexture.flipY = false
    metallicRoughnessTexture.needsUpdate = true

    normalTexture.flipY = false
    normalTexture.needsUpdate = true

    normalTexture.flipY = false
    normalTexture.needsUpdate = true

    const mat = new MeshStandardMaterial({
      map: baseColorTexture,
      metalnessMap: metallicRoughnessTexture,
      roughnessMap: metallicRoughnessTexture,
      normalMap: normalTexture,
    })
    MaterialStore.setState({ asteroidRockMaterial: mat })

    return () => {
      baseColorTexture.dispose()
      metallicRoughnessTexture.dispose()
      normalTexture.dispose()
      mat.dispose()
      MaterialStore.setState({ asteroidRockMaterial: null })
    }
  }, [baseColorTexture, metallicRoughnessTexture, normalTexture])
}

export default useMaterials
