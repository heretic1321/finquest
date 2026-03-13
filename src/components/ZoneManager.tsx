import { memo, useEffect } from 'react'
import { Detailed } from '@react-three/drei'
import { useShallow } from 'zustand/react/shallow'

import StoreEntryExitTriggerArea from '@client/components/StoreEntryExitTriggerArea'
import { CharacterRef } from '@client/components/Character'
import { StoreConfigs } from '@client/config/MapConfig'
import { getZoneByStoreKey } from '@client/config/ZoneConfig'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { MapStore } from '@client/contexts/MapContext'

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
