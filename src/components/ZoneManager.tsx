import { memo, useEffect, useRef } from 'react'
import { Detailed } from '@react-three/drei'
import * as THREE from 'three'
import { useShallow } from 'zustand/react/shallow'
import { useControls, folder } from 'leva'

import StoreEntryExitTriggerArea from '@client/components/StoreEntryExitTriggerArea'
import { CharacterRef } from '@client/components/Character'
import { StoreConfigs } from '@client/config/MapConfig'
import { getZoneByStoreKey, ZONE_CONFIGS, STORE_TO_ZONE } from '@client/config/ZoneConfig'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { MapStore } from '@client/contexts/MapContext'

// Track which meshes we've cloned materials for, so we can update them live
const trackedMeshes: Record<string, THREE.Mesh[]> = {}

function recolorStoreMeshes(
  obj: THREE.Object3D,
  zoneColor: string,
  metalness: number,
  roughness: number,
  storeKey: string,
) {
  const color = new THREE.Color(zoneColor)
  const meshes: THREE.Mesh[] = []

  obj.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    const mat = child.material as THREE.MeshStandardMaterial
    if (!mat || !mat.color) return

    // Target gold-ish materials (hue ~30-60, high saturation)
    const hsl = { h: 0, s: 0, l: 0 }
    mat.color.getHSL(hsl)
    const isGoldy = hsl.h > 0.05 && hsl.h < 0.2 && hsl.s > 0.3
    const isSilver = hsl.s < 0.1 && hsl.l > 0.6

    if (isGoldy || isSilver) {
      // Only clone once
      if (!(child.material as any).__finquest_cloned) {
        const newMat = mat.clone()
        ;(newMat as any).__finquest_cloned = true
        child.material = newMat
      }
      const m = child.material as THREE.MeshStandardMaterial
      m.color.set(color)
      m.metalness = metalness
      m.roughness = roughness
      meshes.push(child)
    }
  })

  trackedMeshes[storeKey] = meshes
}

// Live update colors without re-traversing
function updateStoreMeshColors(
  storeKey: string,
  zoneColor: string,
  metalness: number,
  roughness: number,
) {
  const meshes = trackedMeshes[storeKey]
  if (!meshes) return
  const color = new THREE.Color(zoneColor)
  meshes.forEach((child) => {
    const m = child.material as THREE.MeshStandardMaterial
    m.color.set(color)
    m.metalness = metalness
    m.roughness = roughness
  })
}

type ZoneManagerProps = {
  characterRef: React.MutableRefObject<CharacterRef | null>
}

const ZoneManager = memo(({ characterRef }: ZoneManagerProps) => {
  const {
    setIsEnterStorePromptShown,
    setEnterStorePromptStoreName,
    storeRequestedToEnter,
    setStoreRequestedToEnter,

    setIsExitStorePromptShown,
    setExitStorePromptStoreName,
    storeRequestedToExit,
    setStoreRequestedToExit,
  } = HUDStore(
    useShallow((state) => ({
      setIsEnterStorePromptShown: state.setIsEnterStorePromptShown,
      setEnterStorePromptStoreName: state.setEnterStorePromptStoreName,
      storeRequestedToEnter: state.storeRequestedToEnter,
      setStoreRequestedToEnter: state.setStoreRequestedToEnter,

      setIsExitStorePromptShown: state.setIsExitStorePromptShown,
      setExitStorePromptStoreName: state.setExitStorePromptStoreName,
      storeRequestedToExit: state.storeRequestedToExit,
      setStoreRequestedToExit: state.setStoreRequestedToExit,
    })),
  )

  const allStoresInfo = MapStore((state) => state.allStoresInfo)
  const buildingNames = Object.keys(StoreConfigs)
  const initialColorsDone = useRef(false)

  // Leva color pickers for each zone
  const zoneColors = useControls('Zone Colors', {
    'FinQuest Bank (hub)': folder({
      bankColor: { value: ZONE_CONFIGS.bank.themeColor, label: 'Color' },
      bankMetalness: { value: 0.3, min: 0, max: 1, step: 0.05, label: 'Metalness' },
      bankRoughness: { value: 0.6, min: 0, max: 1, step: 0.05, label: 'Roughness' },
    }),
    'TechCorp HQ (tallstore)': folder({
      techcorpColor: { value: ZONE_CONFIGS.techcorp.themeColor, label: 'Color' },
      techcorpMetalness: { value: 0.3, min: 0, max: 1, step: 0.05, label: 'Metalness' },
      techcorpRoughness: { value: 0.6, min: 0, max: 1, step: 0.05, label: 'Roughness' },
    }),
    'MF Tower (domestore)': folder({
      mftowerColor: { value: ZONE_CONFIGS.mftower.themeColor, label: 'Color' },
      mftowerMetalness: { value: 0.3, min: 0, max: 1, step: 0.05, label: 'Metalness' },
      mftowerRoughness: { value: 0.6, min: 0, max: 1, step: 0.05, label: 'Roughness' },
    }),
    'Scam Park (ogstore)': folder({
      scamparkColor: { value: ZONE_CONFIGS.scampark.themeColor, label: 'Color' },
      scamparkMetalness: { value: 0.3, min: 0, max: 1, step: 0.05, label: 'Metalness' },
      scamparkRoughness: { value: 0.6, min: 0, max: 1, step: 0.05, label: 'Roughness' },
    }),
    'Stock Exchange (cylinderstore)': folder({
      stockColor: { value: ZONE_CONFIGS.stockexchange.themeColor, label: 'Color' },
      stockMetalness: { value: 0.3, min: 0, max: 1, step: 0.05, label: 'Metalness' },
      stockRoughness: { value: 0.6, min: 0, max: 1, step: 0.05, label: 'Roughness' },
    }),
  })

  // Map leva values to store keys for live updates
  const colorMap: Record<string, { color: string; metalness: number; roughness: number }> = {
    hub: { color: zoneColors.bankColor, metalness: zoneColors.bankMetalness, roughness: zoneColors.bankRoughness },
    tallstore: { color: zoneColors.techcorpColor, metalness: zoneColors.techcorpMetalness, roughness: zoneColors.techcorpRoughness },
    domestore: { color: zoneColors.mftowerColor, metalness: zoneColors.mftowerMetalness, roughness: zoneColors.mftowerRoughness },
    ogstore: { color: zoneColors.scamparkColor, metalness: zoneColors.scamparkMetalness, roughness: zoneColors.scamparkRoughness },
    cylinderstore: { color: zoneColors.stockColor, metalness: zoneColors.stockMetalness, roughness: zoneColors.stockRoughness },
  }

  // Live update when leva values change
  useEffect(() => {
    if (!initialColorsDone.current) return
    Object.entries(colorMap).forEach(([storeKey, { color, metalness, roughness }]) => {
      updateStoreMeshColors(storeKey, color, metalness, roughness)
    })
  }, [
    zoneColors.bankColor, zoneColors.bankMetalness, zoneColors.bankRoughness,
    zoneColors.techcorpColor, zoneColors.techcorpMetalness, zoneColors.techcorpRoughness,
    zoneColors.mftowerColor, zoneColors.mftowerMetalness, zoneColors.mftowerRoughness,
    zoneColors.scamparkColor, zoneColors.scamparkMetalness, zoneColors.scamparkRoughness,
    zoneColors.stockColor, zoneColors.stockMetalness, zoneColors.stockRoughness,
  ])

  // Handle entry: teleport player into the zone
  useEffect(() => {
    if (!storeRequestedToEnter) return
    const config = StoreConfigs[storeRequestedToEnter]
    if (!config) return

    const zone = getZoneByStoreKey(storeRequestedToEnter)
    console.log(`[ZoneManager] Entering zone: ${zone?.name || storeRequestedToEnter}`)

    // Teleport player to entry spawn
    if (characterRef.current?.teleportPlayer) {
      characterRef.current.teleportPlayer(config.entrySpawnPosition)
    }

    genericStore.setState({ insideStore: storeRequestedToEnter })
    setStoreRequestedToEnter('')
    setIsEnterStorePromptShown(false)
  }, [storeRequestedToEnter])

  // Handle exit: teleport player out of the zone
  useEffect(() => {
    if (!storeRequestedToExit) return

    const exitStoreName = typeof storeRequestedToExit === 'string'
      ? storeRequestedToExit
      : storeRequestedToExit.nameOfStoreToExit

    const config = StoreConfigs[exitStoreName]
    if (!config) return

    const zone = getZoneByStoreKey(exitStoreName)
    console.log(`[ZoneManager] Exiting zone: ${zone?.name || exitStoreName}`)

    // Teleport player to exit spawn
    if (characterRef.current?.teleportPlayer) {
      characterRef.current.teleportPlayer(config.exitSpawnPosition)
    }

    genericStore.setState({ insideStore: null })
    setStoreRequestedToExit(null)
    setIsExitStorePromptShown(false)
  }, [storeRequestedToExit])

  // Key listener for E to confirm entry/exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'KeyE') return

      const enterPromptShown = HUDStore.getState().isEnterStorePromptShown
      const exitPromptShown = HUDStore.getState().isExitStorePromptShown

      if (enterPromptShown) {
        const storeName = HUDStore.getState().enterStorePromptStoreName
        if (storeName) {
          HUDStore.getState().setStoreRequestedToEnter(storeName)
        }
      } else if (exitPromptShown) {
        const storeName = HUDStore.getState().exitStorePromptStoreName
        if (storeName) {
          HUDStore.getState().setStoreRequestedToExit({
            nameOfStoreToExit: storeName,
            exitingVia: 'gate',
          })
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Mark initial colors done after first render so leva live-updates kick in
  useEffect(() => {
    // Small delay to ensure the initial recolor ran in the render pass
    const t = setTimeout(() => { initialColorsDone.current = true }, 500)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      {buildingNames.map((storeName) => {
        const storeInfo = allStoresInfo[storeName]
        if (!storeInfo) return null

        const {
          lods,
          entryTriggerAreaGeometry,
          entryTriggerAreaTransform,
          exitTriggerAreaGeometry,
          exitTriggerAreaTransform,
        } = storeInfo

        // LOD objects: [high, mid, low]
        const hasLods = lods.objects[0] || lods.objects[1] || lods.objects[2]

        // Recolor store meshes based on zone theme (from leva or config)
        const cm = colorMap[storeName]
        if (cm && hasLods && !initialColorsDone.current) {
          lods.objects.forEach((obj) => {
            if (obj) recolorStoreMeshes(obj, cm.color, cm.metalness, cm.roughness, storeName)
          })
        }

        return (
          <group key={storeName}>
            {/* Render building LODs */}
            {hasLods && lods.transform.position && (
              <group
                position={lods.transform.position}
                rotation={lods.transform.rotation || undefined}
                scale={lods.transform.scale || undefined}
              >
                <Detailed distances={lods.distances}>
                  {lods.objects[0] && <primitive object={lods.objects[0]} />}
                  {lods.objects[1] && <primitive object={lods.objects[1]} />}
                  {lods.objects[2] && <primitive object={lods.objects[2]} />}
                </Detailed>
              </group>
            )}

            {/* Entry trigger */}
            {entryTriggerAreaGeometry && (
              <StoreEntryExitTriggerArea
                characterRef={characterRef}
                geometry={entryTriggerAreaGeometry}
                transform={entryTriggerAreaTransform}
                keyId={`${storeName}-entry`}
                onInside={() => {
                  setEnterStorePromptStoreName(storeName)
                  setIsEnterStorePromptShown(true)
                }}
                onOutside={() => {
                  if (HUDStore.getState().enterStorePromptStoreName === storeName) {
                    setIsEnterStorePromptShown(false)
                  }
                }}
              />
            )}

            {/* Exit trigger */}
            {exitTriggerAreaGeometry && (
              <StoreEntryExitTriggerArea
                characterRef={characterRef}
                geometry={exitTriggerAreaGeometry}
                transform={exitTriggerAreaTransform}
                keyId={`${storeName}-exit`}
                onInside={() => {
                  setExitStorePromptStoreName(storeName)
                  setIsExitStorePromptShown(true)
                }}
                onOutside={() => {
                  if (HUDStore.getState().exitStorePromptStoreName === storeName) {
                    setIsExitStorePromptShown(false)
                  }
                }}
              />
            )}
          </group>
        )
      })}
    </>
  )
})

ZoneManager.displayName = 'ZoneManager'

export default ZoneManager
