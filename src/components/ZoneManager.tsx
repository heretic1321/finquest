import { memo, useEffect } from 'react'
import { Billboard, Detailed, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useShallow } from 'zustand/react/shallow'
import { useControls, folder } from 'leva'

import StoreEntryExitTriggerArea from '@client/components/StoreEntryExitTriggerArea'
import { CharacterRef } from '@client/components/Character'
import { StoreConfigs } from '@client/config/MapConfig'
import { ZONE_CONFIGS, getZoneByStoreKey, STORE_TO_ZONE } from '@client/config/ZoneConfig'
import { HUDStore } from '@client/contexts/HUDContext'
import { MapStore } from '@client/contexts/MapContext'

const getMapScale = () => MapStore.getState().mapScale || 2

// Track cloned meshes per store for live color updates
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

    const hsl = { h: 0, s: 0, l: 0 }
    mat.color.getHSL(hsl)
    const isGoldy = hsl.h > 0.05 && hsl.h < 0.2 && hsl.s > 0.3
    const isSilver = hsl.s < 0.1 && hsl.l > 0.6

    if (isGoldy || isSilver) {
      if (!(child.material as any).__fq_cloned) {
        const newMat = mat.clone()
        ;(newMat as any).__fq_cloned = true
        child.material = newMat
      }
      const m = child.material as THREE.MeshStandardMaterial
      m.color.set(color)
      m.metalness = metalness
      m.roughness = roughness
      meshes.push(child)
    }
  })

  // Merge with existing tracked meshes (multiple LODs)
  trackedMeshes[storeKey] = [...(trackedMeshes[storeKey] || []), ...meshes]
}

function updateStoreMeshColors(
  storeKey: string,
  zoneColor: string,
  metalness: number,
  roughness: number,
) {
  const meshes = trackedMeshes[storeKey]
  if (!meshes || meshes.length === 0) return
  const color = new THREE.Color(zoneColor)
  meshes.forEach((child) => {
    const m = child.material as THREE.MeshStandardMaterial
    if (!m) return
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

  // ── Zone Color Controls ──
  const zoneColors = useControls('Zone Colors', {
    [`FinQuest Bank (${ZONE_CONFIGS.bank.storeKey})`]: folder({
      bankColor: { value: ZONE_CONFIGS.bank.themeColor, label: 'Color' },
      bankMetal: { value: 0.3, min: 0, max: 1, step: 0.05, label: 'Metalness' },
      bankRough: { value: 0.6, min: 0, max: 1, step: 0.05, label: 'Roughness' },
    }),
    [`City Hospital (${ZONE_CONFIGS.hospital.storeKey})`]: folder({
      hospColor: { value: ZONE_CONFIGS.hospital.themeColor, label: 'Color' },
      hospMetal: { value: 1.0, min: 0, max: 1, step: 0.05, label: 'Metalness' },
      hospRough: { value: 0.15, min: 0, max: 1, step: 0.05, label: 'Roughness' },
    }),
    [`Stock Exchange (${ZONE_CONFIGS.stockexchange.storeKey})`]: folder({
      stockColor: { value: ZONE_CONFIGS.stockexchange.themeColor, label: 'Color' },
      stockMetal: { value: 0.3, min: 0, max: 1, step: 0.05, label: 'Metalness' },
      stockRough: { value: 0.6, min: 0, max: 1, step: 0.05, label: 'Roughness' },
    }),
    [`Scam Park (${ZONE_CONFIGS.scampark.storeKey})`]: folder({
      scamColor: { value: ZONE_CONFIGS.scampark.themeColor, label: 'Color' },
      scamMetal: { value: 0.3, min: 0, max: 1, step: 0.05, label: 'Metalness' },
      scamRough: { value: 0.6, min: 0, max: 1, step: 0.05, label: 'Roughness' },
    }),
    [`MF Tower (${ZONE_CONFIGS.mftower.storeKey})`]: folder({
      mfColor: { value: ZONE_CONFIGS.mftower.themeColor, label: 'Color' },
      mfMetal: { value: 0.3, min: 0, max: 1, step: 0.05, label: 'Metalness' },
      mfRough: { value: 0.6, min: 0, max: 1, step: 0.05, label: 'Roughness' },
    }),
  })

  // ── Label Position Controls ──
  const labelPos = useControls('Zone Labels', {
    [`${ZONE_CONFIGS.bank.name} Label`]: folder({
      bankLabelY: { value: ZONE_CONFIGS.bank.labelYOffset, min: 0, max: 60, step: 1, label: 'Y Offset' },
    }),
    [`${ZONE_CONFIGS.hospital.name} Label`]: folder({
      hospLabelY: { value: ZONE_CONFIGS.hospital.labelYOffset, min: 0, max: 60, step: 1, label: 'Y Offset' },
    }),
    [`${ZONE_CONFIGS.stockexchange.name} Label`]: folder({
      stockLabelY: { value: ZONE_CONFIGS.stockexchange.labelYOffset, min: 0, max: 60, step: 1, label: 'Y Offset' },
    }),
    [`${ZONE_CONFIGS.scampark.name} Label`]: folder({
      scamLabelY: { value: ZONE_CONFIGS.scampark.labelYOffset, min: 0, max: 60, step: 1, label: 'Y Offset' },
    }),
    [`${ZONE_CONFIGS.mftower.name} Label`]: folder({
      mfLabelY: { value: ZONE_CONFIGS.mftower.labelYOffset, min: 0, max: 60, step: 1, label: 'Y Offset' },
    }),
  })

  // Map storeKey -> leva values
  const colorMap: Record<string, { color: string; metalness: number; roughness: number }> = {
    [ZONE_CONFIGS.bank.storeKey]: { color: zoneColors.bankColor, metalness: zoneColors.bankMetal, roughness: zoneColors.bankRough },
    [ZONE_CONFIGS.hospital.storeKey]: { color: zoneColors.hospColor, metalness: zoneColors.hospMetal, roughness: zoneColors.hospRough },
    [ZONE_CONFIGS.stockexchange.storeKey]: { color: zoneColors.stockColor, metalness: zoneColors.stockMetal, roughness: zoneColors.stockRough },
    [ZONE_CONFIGS.scampark.storeKey]: { color: zoneColors.scamColor, metalness: zoneColors.scamMetal, roughness: zoneColors.scamRough },
    [ZONE_CONFIGS.mftower.storeKey]: { color: zoneColors.mfColor, metalness: zoneColors.mfMetal, roughness: zoneColors.mfRough },
  }

  const labelYMap: Record<string, number> = {
    [ZONE_CONFIGS.bank.storeKey]: labelPos.bankLabelY,
    [ZONE_CONFIGS.hospital.storeKey]: labelPos.hospLabelY,
    [ZONE_CONFIGS.stockexchange.storeKey]: labelPos.stockLabelY,
    [ZONE_CONFIGS.scampark.storeKey]: labelPos.scamLabelY,
    [ZONE_CONFIGS.mftower.storeKey]: labelPos.mfLabelY,
  }

  // Initial recolor when stores load
  useEffect(() => {
    const storeKeys = Object.keys(allStoresInfo)
    if (storeKeys.length === 0) return

    // Clear tracked meshes for fresh recolor
    Object.keys(trackedMeshes).forEach(k => { trackedMeshes[k] = [] })

    storeKeys.forEach((storeName) => {
      const storeInfo = allStoresInfo[storeName]
      if (!storeInfo) return
      const cm = colorMap[storeName]
      if (!cm) return
      storeInfo.lods.objects.forEach((obj) => {
        if (obj) recolorStoreMeshes(obj, cm.color, cm.metalness, cm.roughness, storeName)
      })
    })
  }, [allStoresInfo])

  // Live update on leva color change
  useEffect(() => {
    Object.entries(colorMap).forEach(([storeKey, { color, metalness, roughness }]) => {
      updateStoreMeshColors(storeKey, color, metalness, roughness)
    })
  }, [
    zoneColors.bankColor, zoneColors.bankMetal, zoneColors.bankRough,
    zoneColors.hospColor, zoneColors.hospMetal, zoneColors.hospRough,
    zoneColors.stockColor, zoneColors.stockMetal, zoneColors.stockRough,
    zoneColors.scamColor, zoneColors.scamMetal, zoneColors.scamRough,
    zoneColors.mfColor, zoneColors.mfMetal, zoneColors.mfRough,
  ])

  // E key to open zone UI
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'KeyE') return
      if (HUDStore.getState().isEnterStorePromptShown) {
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

        const { lods, entryTriggerAreaGeometry, entryTriggerAreaTransform } = storeInfo
        const hasLods = lods.objects[0] || lods.objects[1] || lods.objects[2]
        const zone = getZoneByStoreKey(storeName)
        const yOffset = labelYMap[storeName] ?? 20

        const ms = getMapScale()

        return (
          <group key={storeName}>
            {/* Building LODs */}
            {hasLods && lods.transform.position && (() => {
              const p = lods.transform.position as THREE.Vector3
              const s = lods.transform.scale as THREE.Vector3
              return (
                <group
                  position={[p.x * ms, p.y * ms, p.z * ms]}
                  rotation={lods.transform.rotation || undefined}
                  scale={s ? [s.x * ms, s.y * ms, s.z * ms] : [ms, ms, ms]}
                >
                  <Detailed distances={lods.distances}>
                    {lods.objects[0] && <primitive object={lods.objects[0]} />}
                    {lods.objects[1] && <primitive object={lods.objects[1]} />}
                    {lods.objects[2] && <primitive object={lods.objects[2]} />}
                  </Detailed>
                </group>
              )
            })()}

            {/* Floating zone label */}
            {zone && hasLods && lods.transform.position && (() => {
              const pos = lods.transform.position as THREE.Vector3
              const bx = (pos.x || 0) * ms
              const by = (pos.y || 0) * ms + yOffset
              const bz = (pos.z || 0) * ms

              return (
                <Billboard
                  follow
                  lockX={false}
                  lockY={false}
                  lockZ={false}
                  position={[bx, by, bz]}
                >
                  {/* Glow background */}
                  <mesh position={[0, 0, -0.1]}>
                    <planeGeometry args={[zone.name.length * 1.0 + 2, 3.2]} />
                    <meshBasicMaterial color={zone.themeColor} transparent opacity={0.85} />
                  </mesh>
                  {/* Border line top */}
                  <mesh position={[0, 1.5, -0.05]}>
                    <planeGeometry args={[zone.name.length * 1.0 + 2, 0.06]} />
                    <meshBasicMaterial color={zone.accentColor} />
                  </mesh>
                  {/* Border line bottom */}
                  <mesh position={[0, -1.5, -0.05]}>
                    <planeGeometry args={[zone.name.length * 1.0 + 2, 0.06]} />
                    <meshBasicMaterial color={zone.accentColor} />
                  </mesh>
                  {/* Zone name */}
                  <Text
                    fontSize={2.0}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    font="./assets/fonts/Rajdhani-Bold.ttf"
                    position={[0, 0.2, 0]}
                    outlineWidth={0.08}
                    outlineColor="#000000"
                  >
                    {zone.name.toUpperCase()}
                  </Text>
                  {/* Accent underline */}
                  <mesh position={[0, -0.6, -0.02]}>
                    <planeGeometry args={[zone.name.length * 0.7, 0.08]} />
                    <meshBasicMaterial color={zone.accentColor} />
                  </mesh>
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
