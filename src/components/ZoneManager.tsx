import { memo, useEffect } from 'react'
import { Billboard, Detailed, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useShallow } from 'zustand/react/shallow'
import { useControls, folder } from 'leva'

import StoreEntryExitTriggerArea from '@client/components/StoreEntryExitTriggerArea'
import { CharacterRef } from '@client/components/Character'
import { StoreConfigs } from '@client/config/MapConfig'
import { ZONE_CONFIGS, getZoneByStoreKey } from '@client/config/ZoneConfig'
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
  } = HUDStore(
    useShallow((state) => ({
      setIsEnterStorePromptShown: state.setIsEnterStorePromptShown,
      setEnterStorePromptStoreName: state.setEnterStorePromptStoreName,
    })),
  )

  const allStoresInfo = MapStore((state) => state.allStoresInfo)
  const buildingNames = Object.keys(StoreConfigs)

  // Leva color pickers for each zone
  const zoneColors = useControls('Zone Colors', {
    'FinQuest Bank (hub)': folder({
      bankColor: { value: ZONE_CONFIGS.bank.themeColor, label: 'Color' },
      bankMetalness: { value: 0.3, min: 0, max: 1, step: 0.05, label: 'Metalness' },
      bankRoughness: { value: 0.6, min: 0, max: 1, step: 0.05, label: 'Roughness' },
    }),
    'City Hospital (tallstore)': folder({
      hospitalColor: { value: ZONE_CONFIGS.hospital.themeColor, label: 'Color' },
      hospitalMetalness: { value: 0.3, min: 0, max: 1, step: 0.05, label: 'Metalness' },
      hospitalRoughness: { value: 0.6, min: 0, max: 1, step: 0.05, label: 'Roughness' },
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
    tallstore: { color: zoneColors.hospitalColor, metalness: zoneColors.hospitalMetalness, roughness: zoneColors.hospitalRoughness },
    domestore: { color: zoneColors.mftowerColor, metalness: zoneColors.mftowerMetalness, roughness: zoneColors.mftowerRoughness },
    ogstore: { color: zoneColors.scamparkColor, metalness: zoneColors.scamparkMetalness, roughness: zoneColors.scamparkRoughness },
    cylinderstore: { color: zoneColors.stockColor, metalness: zoneColors.stockMetalness, roughness: zoneColors.stockRoughness },
  }

  // After allStoresInfo changes, do initial recolor
  useEffect(() => {
    const storeKeys = Object.keys(allStoresInfo)
    if (storeKeys.length === 0) return

    storeKeys.forEach((storeName) => {
      const storeInfo = allStoresInfo[storeName]
      if (!storeInfo) return
      const { lods } = storeInfo
      const cm = colorMap[storeName]
      if (!cm) return
      lods.objects.forEach((obj) => {
        if (obj) recolorStoreMeshes(obj, cm.color, cm.metalness, cm.roughness, storeName)
      })
    })
  }, [allStoresInfo])

  // Live update when leva values change
  useEffect(() => {
    Object.entries(colorMap).forEach(([storeKey, { color, metalness, roughness }]) => {
      updateStoreMeshColors(storeKey, color, metalness, roughness)
    })
  }, [
    zoneColors.bankColor, zoneColors.bankMetalness, zoneColors.bankRoughness,
    zoneColors.hospitalColor, zoneColors.hospitalMetalness, zoneColors.hospitalRoughness,
    zoneColors.mftowerColor, zoneColors.mftowerMetalness, zoneColors.mftowerRoughness,
    zoneColors.scamparkColor, zoneColors.scamparkMetalness, zoneColors.scamparkRoughness,
    zoneColors.stockColor, zoneColors.stockMetalness, zoneColors.stockRoughness,
  ])

  // Key listener for E to confirm entry (opens zone UI overlay)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'KeyE') return

      const enterPromptShown = HUDStore.getState().isEnterStorePromptShown
      if (enterPromptShown) {
        const storeName = HUDStore.getState().enterStorePromptStoreName
        if (storeName) {
          HUDStore.getState().setStoreRequestedToEnter(storeName)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
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
        } = storeInfo

        // LOD objects: [high, mid, low]
        const hasLods = lods.objects[0] || lods.objects[1] || lods.objects[2]

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

            {/* Floating zone name billboard */}
            {hasLods && lods.transform.position && (() => {
              const zone = getZoneByStoreKey(storeName)
              if (!zone) return null
              const pos = lods.transform.position as THREE.Vector3
              // Position above the building
              const billboardY = (pos.y || 0) + 25
              return (
                <Billboard
                  follow={true}
                  lockX={false}
                  lockY={false}
                  lockZ={false}
                  position={[pos.x || 0, billboardY, pos.z || 0]}
                >
                  {/* Background panel */}
                  <mesh position={[0, 0, -0.05]}>
                    <planeGeometry args={[zone.name.length * 0.85 + 1.5, 2.8]} />
                    <meshBasicMaterial color={'#000000'} transparent opacity={0.7} />
                  </mesh>
                  {/* Zone name */}
                  <Text
                    fontSize={1.8}
                    color={zone.accentColor}
                    anchorX="center"
                    anchorY="middle"
                    font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2"
                    fontWeight={700}
                    position={[0, 0.3, 0]}
                  >
                    {zone.name}
                  </Text>
                  {/* Subtitle */}
                  <Text
                    fontSize={0.6}
                    color={'#94a3b8'}
                    anchorX="center"
                    anchorY="middle"
                    font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2"
                    position={[0, -0.8, 0]}
                  >
                    {zone.description}
                  </Text>
                </Billboard>
              )
            })()}

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
          </group>
        )
      })}
    </>
  )
})

ZoneManager.displayName = 'ZoneManager'

export default ZoneManager
