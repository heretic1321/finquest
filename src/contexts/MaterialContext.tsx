import { createContext } from 'react'
import { BufferGeometry, Material, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Texture } from 'three'

import useMaterials, { useAsteroidMaterials } from '@client/hooks/useMaterials'
import { ValueOrNull } from '@client/utils/commonTypes'
import { create } from 'zustand'

export type TMaterialContext = ValueOrNull<ReturnType<typeof useMaterials>>

interface MaterialsZustandState {
  envMapTexture: Texture | null
  whiteGoldMaterial: MeshStandardMaterial | null
  yellowGoldMaterial: MeshStandardMaterial | null
  roseGoldMaterial: MeshStandardMaterial | null
  ceramicBlackMaterial: MeshStandardMaterial | null
  ceramicBlueMaterial: MeshStandardMaterial | null
  ceramicBrownMaterial: MeshStandardMaterial | null
  ceramicCreamMaterial: MeshStandardMaterial | null
  ceramicYellowMaterial: MeshStandardMaterial | null
  ceramicGreenMaterial: MeshStandardMaterial | null
  diamondMaterial: MeshPhysicalMaterial | null
  cheapDiamondMaterial: MeshStandardMaterial | null
  blueStoneMaterial: MeshPhysicalMaterial | null
  cheapBlueStoneMaterial: MeshStandardMaterial | null
  emeraldStoneMaterial: MeshPhysicalMaterial | null
  cheapEmeraldStoneMaterial: MeshStandardMaterial | null
  greenStoneMaterial: MeshPhysicalMaterial | null
  cheapGreenStoneMaterial: MeshStandardMaterial | null
  pinkStoneMaterial: MeshPhysicalMaterial | null
  cheapPinkStoneMaterial: MeshStandardMaterial | null
  purpleStoneMaterial: MeshPhysicalMaterial | null
  cheapPurpleStoneMaterial: MeshStandardMaterial | null
  yellowStoneMaterial: MeshPhysicalMaterial | null
  cheapYellowStoneMaterial: MeshStandardMaterial | null
  waterBaseMaterial: MeshStandardMaterial | null
  glassNonReflectiveMaterial: MeshStandardMaterial | null
  glassReflectiveMaterial: MeshStandardMaterial | null
  domeGlassMaterial: MeshStandardMaterial | null
  glassDoorMaterial: MeshStandardMaterial | null
  minaPinkMaterial: MeshStandardMaterial | null
  noMaterial: MeshStandardMaterial | null
  asteroidRockMaterial: MeshStandardMaterial | null
  compareAndAssignMaterial: (mesh: Mesh<BufferGeometry, Material>, useCheapDiamond?: boolean) => void
}

export const MaterialStore = create<MaterialsZustandState>((_, get) => ({
  envMapTexture: null,
  whiteGoldMaterial: null,
  yellowGoldMaterial: null,
  roseGoldMaterial: null,
  ceramicBlackMaterial: null,
  ceramicBlueMaterial: null,
  ceramicBrownMaterial: null,
  ceramicCreamMaterial: null,
  ceramicYellowMaterial: null,
  ceramicGreenMaterial: null,
  diamondMaterial: null,
  cheapDiamondMaterial: null,
  blueStoneMaterial: null,
  cheapBlueStoneMaterial: null,
  emeraldStoneMaterial: null,
  cheapEmeraldStoneMaterial: null,
  greenStoneMaterial: null,
  cheapGreenStoneMaterial: null,
  pinkStoneMaterial: null,
  cheapPinkStoneMaterial: null,
  purpleStoneMaterial: null,
  cheapPurpleStoneMaterial: null,
  yellowStoneMaterial: null,
  cheapYellowStoneMaterial: null,
  waterBaseMaterial: null,
  glassNonReflectiveMaterial: null,
  glassReflectiveMaterial: null,
  domeGlassMaterial: null,
  glassDoorMaterial: null,
  minaPinkMaterial: null,
  noMaterial: null,
  asteroidRockMaterial: null,
  compareAndAssignMaterial: (mesh, useCheapDiamond) => {
    let materialToAssign: Material | null = null

    if (compare(mesh, 'WhiteGold'))
      materialToAssign = get().whiteGoldMaterial
    else if (compare(mesh, ['YellowGold', 'YelloGold']))
      materialToAssign = get().yellowGoldMaterial
    else if (compare(mesh, 'RoseGold'))
      materialToAssign = get().roseGoldMaterial
    else if (compare(mesh, 'CeramicBlack'))
      materialToAssign = get().ceramicBlackMaterial
    else if (compare(mesh, 'CeramicBlue'))
      materialToAssign = get().ceramicBlueMaterial
    else if (compare(mesh, 'CeramicBrown'))
      materialToAssign = get().ceramicBrownMaterial
    else if (compare(mesh, 'CeramicCream'))
      materialToAssign = get().ceramicCreamMaterial
    else if (compare(mesh, 'CeramicYellow'))
      materialToAssign = get().ceramicYellowMaterial
    else if (compare(mesh, 'CeramicGreen'))
      materialToAssign = get().ceramicGreenMaterial
    else if (compare(mesh, ['ColorStoneYellow', 'ColorSoneYellow'])) {
      if (useCheapDiamond) materialToAssign = get().cheapYellowStoneMaterial
      else materialToAssign = get().yellowStoneMaterial
    } else if (compare(mesh, ['ColorStoneBlue', 'ColourStoneBlue'])) {
      if (useCheapDiamond) materialToAssign = get().cheapBlueStoneMaterial
      else materialToAssign = get().blueStoneMaterial
    } else if (compare(mesh, 'ColorStoneEmerald')) {
      if (useCheapDiamond)
        materialToAssign = get().cheapEmeraldStoneMaterial
      else materialToAssign = get().emeraldStoneMaterial
    } else if (compare(mesh, 'ColorStoneGreen')) {
      if (useCheapDiamond) materialToAssign = get().cheapGreenStoneMaterial
      else materialToAssign = get().greenStoneMaterial
    } else if (compare(mesh, 'ColorStonePink')) {
      if (useCheapDiamond) materialToAssign = get().cheapPinkStoneMaterial
      else materialToAssign = get().pinkStoneMaterial
    } else if (compare(mesh, 'ColorStonePurple')) {
      if (useCheapDiamond) materialToAssign = get().cheapPurpleStoneMaterial
      else materialToAssign = get().purpleStoneMaterial
    } else if (compare(mesh, 'Diamond')) {
      if (useCheapDiamond) materialToAssign = get().cheapDiamondMaterial
      else materialToAssign = get().diamondMaterial
    } else if (compare(mesh, 'MinaPink')) {
      materialToAssign = get().minaPinkMaterial
    } else if (compare(mesh, 'Rhodium')) {
      materialToAssign = get().ceramicCreamMaterial
    } else {
      materialToAssign = get().noMaterial
    }

    if (materialToAssign) {
      mesh.material.dispose()
      mesh.material = materialToAssign
    }
  }
}))

export const MaterialContext = createContext<{}>({})

const compare = (a: Mesh, b: string | string[]) => {
  if (Array.isArray(b)) {
    return b.some((name) =>
      (a.material as Material).name.toLowerCase().includes(name.toLowerCase()),
    )
  } else {
    return (a.material as Material).name.toLowerCase().includes(b.toLowerCase())
  }
}

export const MaterialContextProvider = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  useMaterials()
  useAsteroidMaterials()
  return (
    <MaterialContext.Provider
      value={{}}
    >
      {children}
    </MaterialContext.Provider>
  )
}
