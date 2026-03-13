import { Detailed, Preload } from '@react-three/drei'
import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { LOD, Mesh, ShaderMaterial } from 'three'

import JewelleryManager from '@client/components/Jewellery/JewelleryManager'
import StoreEntryExitTriggerArea from '@client/components/StoreEntryExitTriggerArea'

import { CharacterRef } from '@client/components/Character'
import InventoryConsole from '@client/components/InventoryConsole/InventoryConsole'
import PortalEntry from '@client/components/Portal/PortalEntry'
import { StoreConfigs, TutorialStore } from '@client/config/MapConfig'
import {
  CollectionStore,
  fetchGroupDataForStore
} from '@client/contexts/CollectionContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { MapStore } from '@client/contexts/MapContext'
import { MaterialStore } from '@client/contexts/MaterialContext'
import { dummyMesh } from '@client/utils/commonMaterials'
import { cleanupResources } from '@client/utils/helperFunctions'
import { IGroupWithItems } from '@client/utils/types/collectionAPI'
import { useFrame } from '@react-three/fiber'
import { useShallow } from 'zustand/react/shallow'
import ColorShiftMaterial from '../Portal/PortalShader'
import OGStoreScreens from '../OGStoreScreens'
import { CameraControlsStore } from '@client/contexts/CameraControlsContext'
import { CameraMode } from '@client/hooks/useCameraControls'

type TBuildingManagerProps = {
  characterRef: React.MutableRefObject<CharacterRef | null>
  portalResetTime?: number
}

const BuildingManager = memo(
  ({ characterRef, portalResetTime = 5000 }: TBuildingManagerProps) => {
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
    const { allStoresInfo, portalConfigs } = MapStore(
      useShallow((state) => ({
        allStoresInfo: state.allStoresInfo,
        portalConfigs: state.portalConfigs,
      })),
    )
    const { groupDataCache, addToOrUpdateGroupDataCache } = CollectionStore(
      useShallow((state) => ({
        groupDataCache: state.groupDataCache,
        addToOrUpdateGroupDataCache: state.addToOrUpdateGroupDataCache,
      })),
    )
    const compareAndAssignMaterial = MaterialStore((state) => state.compareAndAssignMaterial)
    const setHavePortalsCooledDown = genericStore((state) => state.setHavePortalsCooledDown)
    const setIsBuildingLoading = genericStore((state) => state.setIsBuildingLoading)
    const insideStore = genericStore((state) => state.insideStore)
    const setInsideStore = genericStore((state) => state.setInsideStore)
    const isTutorialEnabled = genericStore((state) => state.isTutorialEnabled)
    const onEnterPortal = (
      isPortalInCooldown: boolean,
      buildingName: string,
      exitToBuildingName: string,
    ) => {
      setHavePortalsCooledDown(isPortalInCooldown)
      if (isPortalInCooldown) return
      setStoreRequestedToExit({
        nameOfStoreToExit: buildingName,
        exitingVia: 'portal',
        nameOfStoreIfExitingViaPortal: exitToBuildingName,
      })
    }

    const buildingNames = useMemo(() => Object.keys(StoreConfigs), [])

    type DetailedRefs = Record<string, THREE.LOD | null>
    const detailedRefs = useRef<DetailedRefs>({})
    const [refsSet, setRefsSet] = useState(false)

    const portalMat = useRef<ShaderMaterial | null>(null)
    useEffect(() => {
      portalMat.current = new ShaderMaterial(ColorShiftMaterial)
    }, [])
    useFrame((_, delta) => {
      if (!genericStore.getState().isTabFocused) return
      if (genericStore.getState().insideStore == null) return
      if (portalMat.current) {
        portalMat.current.uniforms.uTime.value += delta
        portalMat.current.needsUpdate = true // Ensure the material knows it needs an update
      }
    })

    useEffect(() => {
      Object.entries(detailedRefs.current).forEach(
        ([storeName, detailedRef]) => {
          if (detailedRef == null || detailedRef == undefined) return
          MapStore.getState().addOrUpdateItemToHide(storeName, detailedRef)
        },
      )
    }, [refsSet])

    const showPromptToEnterStore = (storeName: string) => {
      setEnterStorePromptStoreName(storeName)
      setIsEnterStorePromptShown(true)
    }
    const hidePromptToEnterStore = () => {
      setIsEnterStorePromptShown(false)
      setEnterStorePromptStoreName('')
    }

    const showPromptToExitStore = (storeName: string) => {
      setExitStorePromptStoreName(storeName)
      setIsExitStorePromptShown(true)
    }
    const hidePromptToExitStore = () => {
      setIsExitStorePromptShown(false)
      setExitStorePromptStoreName('')
    }

    const [BuildingInsideComponents, setBuildingInsideComponents] =
      useState<JSX.Element | null>(null)

    const isDebugMode = genericStore((state) => state.isDebugMode)

    const handleEnteringStore = (
      storeName: string,
      groups: IGroupWithItems[],
      timerStart?: number,
      shouldTeleportPlayer: boolean = true,
    ) => {
      

      const newComponentToInject = (
        <>
          <JewelleryManager
            storeName={storeName}
            characterRef={characterRef}
            groups={groups}
          />
          {StoreConfigs[storeName].inventoryConsole !== undefined && (
            <>
              <group key={storeName + 'console'}>
                <InventoryConsole
                  characterRef={characterRef}
                  config={StoreConfigs[storeName].inventoryConsole!}
                  name={storeName}
                />
              </group>
              <Preload all key={storeName + 'console_p'}></Preload>
            </>
          )}
          {
            portalConfigs !== undefined &&
            storeName in portalConfigs &&
            portalMat.current !== null &&
            portalConfigs[storeName].map(
              (portalConfig) =>
                (
                  <PortalEntry
                    key={portalConfig.portalName}
                    uniqueIdentifier={portalConfig.portalName}
                    buildingName={storeName}
                    characterRef={characterRef}
                    portalConfig={portalConfig}
                    portalResetTime={portalResetTime}
                    onEnterPortal={onEnterPortal}
                    portalMat={portalMat.current!}
                  />
                ),
            )
          }
          {
            storeName === 'ogstore' && (
              <OGStoreScreens />
            )
          }
        </>
      )

      setBuildingInsideComponents(newComponentToInject)
      
      const timeElapsed = Date.now() - timerStart!
      if (timeElapsed < 2000) {
        setTimeout(() => {
          if (shouldTeleportPlayer) {
            if (isTutorialEnabled && storeName === 'hub') {
              genericStore.getState().setMoveToNextTutorialDialog(true)
              characterRef.current?.teleportPlayer(
                TutorialStore.entrySpawnPosition
              )
            } else {
              characterRef.current?.teleportPlayer(
                StoreConfigs[storeName].entrySpawnPosition
              )
            }
          }
          genericStore.setState({ loading_FetchingGroupDataFromFastapi: false })
        }, 2000 - timeElapsed)
      } else {
        if (shouldTeleportPlayer) {
          if (isTutorialEnabled && storeName === 'hub') {
            genericStore.getState().setMoveToNextTutorialDialog(true)
            characterRef.current?.teleportPlayer(
              TutorialStore.entrySpawnPosition
            )
          } else {
            characterRef.current?.teleportPlayer(
              StoreConfigs[storeName].entrySpawnPosition
            )
          }
        }
        genericStore.setState({ loading_FetchingGroupDataFromFastapi: false })
      }
    }

    useEffect(() => {
      


      if (
        storeRequestedToEnter === 'hub' ||
        storeRequestedToEnter === 'ogstore' ||
        storeRequestedToEnter === 'tallstore' ||
        storeRequestedToEnter === 'domestore' ||
        storeRequestedToEnter === 'cylinderstore'
      ) {
        if (CameraControlsStore.getState().cameraMode == CameraMode.THIRD_PERSON) {
          CameraControlsStore.getState().setOrbitControlsConfig({
            maxDistance: 4
          })
        }

        const timerStart = Date.now()
        genericStore.setState({ insideStore: storeRequestedToEnter })
        genericStore.setState({ loading_FetchingGroupDataFromFastapi: true })
        HUDStore.setState({ storeRequestedToExit: null })
        if (groupDataCache[storeRequestedToEnter] && !isDebugMode) {
          handleEnteringStore(
            storeRequestedToEnter,
            groupDataCache[storeRequestedToEnter],
            timerStart
          )
        } else {
          fetchGroupDataForStore(storeRequestedToEnter).then((data) => {
            data.groups.map((g: IGroupWithItems) => {
              g.slots.map((s) => {
                s.item?.lowPolyScene?.traverse((child) => {
                  if (child instanceof Mesh) {
                    compareAndAssignMaterial(child)
                  }
                })
              })
            })
            addToOrUpdateGroupDataCache(storeRequestedToEnter, data.groups)
            handleEnteringStore(storeRequestedToEnter, data.groups, timerStart)
          })
        }
      }
    }, [storeRequestedToEnter])

    const debug_reFetchGroupData_forStore = genericStore((state) => state.debug_reFetchGroupData_forStore)
    useEffect(() => {
      if (debug_reFetchGroupData_forStore === '') return
      setBuildingInsideComponents(null)
      const timerStart = Date.now()
      fetchGroupDataForStore(debug_reFetchGroupData_forStore).then((data) => {
        data.groups.map((g: IGroupWithItems) => {
          g.slots.map((s) => {
            s.item?.lowPolyScene?.traverse((child) => {
              if (child instanceof Mesh) {
                compareAndAssignMaterial(child)
              }
            })
          })
        })
        addToOrUpdateGroupDataCache(debug_reFetchGroupData_forStore, data.groups)
        handleEnteringStore(debug_reFetchGroupData_forStore, data.groups, timerStart, false)
      })
    }, [debug_reFetchGroupData_forStore])

    useEffect(() => {
      if (setIsBuildingLoading == null || setInsideStore == null || storeRequestedToExit == null) return

      if (
        storeRequestedToExit.nameOfStoreToExit === 'hub' ||
        storeRequestedToExit.nameOfStoreToExit === 'ogstore' ||
        storeRequestedToExit.nameOfStoreToExit === 'tallstore' ||
        storeRequestedToExit.nameOfStoreToExit === 'domestore' ||
        storeRequestedToExit.nameOfStoreToExit === 'cylinderstore'
      ) {
        if (CameraControlsStore.getState().cameraMode == CameraMode.THIRD_PERSON) {
          CameraControlsStore.getState().setOrbitControlsConfig({
            maxDistance: 9
          })
        }

        setInsideStore(null)
        genericStore.setState({ loading_FetchingGroupDataFromFastapi: true })
        HUDStore.setState({ storeRequestedToEnter: '' })
        setBuildingInsideComponents(null)

        if (groupDataCache[storeRequestedToExit.nameOfStoreToExit]) {
          groupDataCache[storeRequestedToExit.nameOfStoreToExit].map((g: IGroupWithItems) => {
            g.slots.map((s) => {
              s.item?.lowPolyScene?.traverse((child) => {
                cleanupResources(child)
              })
              s.item?.highPolyScene?.traverse((child) => {
                cleanupResources(child)
              })
            })
          })
        } else {
          console.error(
            'user is exiting from building but group data is not cached',
          )
        }

       

        if (storeRequestedToExit.exitingVia == 'portal' && storeRequestedToExit.nameOfStoreIfExitingViaPortal !== undefined) {
          setStoreRequestedToEnter(storeRequestedToExit.nameOfStoreIfExitingViaPortal)
        } else {
          if(storeRequestedToExit.locationToTeleport !== undefined) {
            setTimeout(() => {
              characterRef.current?.teleportPlayer(
                TutorialStore[storeRequestedToExit.locationToTeleport as keyof typeof TutorialStore]
              )
              genericStore.setState({ loading_FetchingGroupDataFromFastapi: false })
            }, 1000)
          }
          else {
            setTimeout(() => {
              characterRef.current?.teleportPlayer(
                StoreConfigs[storeRequestedToExit.nameOfStoreToExit].exitSpawnPosition,
              )
              genericStore.setState({ loading_FetchingGroupDataFromFastapi: false })
            }, 1000)
          }
        }
      }
    }, [storeRequestedToExit])

    return (
      <>
        {allStoresInfo &&
          Object.entries(allStoresInfo).map(
            ([storeName, storeInfo], storeIndex) => (
              <group
                key={storeIndex}
                scale={[MapStore.getState().mapScale, MapStore.getState().mapScale, MapStore.getState().mapScale]}
              >
                <Detailed
                  distances={storeInfo.lods.distances}
                  position={storeInfo.lods.transform.position ?? [0, 0, 0]}
                  rotation={storeInfo.lods.transform.rotation ?? [0, 0, 0]}
                  scale={[1, 1, 1]}
                  objects={null}
                  ref={(el) => {
                    if (refsSet) return
                    if (el instanceof LOD) {
                      detailedRefs.current[storeName] = el
                      // Check if all refs have been set
                      if (
                        Object.keys(detailedRefs.current).length ===
                        Object.keys(allStoresInfo).length
                      ) {
                        setRefsSet(true)
                      }
                    }
                  }}
                >
                  {storeInfo.lods.objects.map((model, modelIndex) => (
                    <primitive object={model ?? dummyMesh} key={modelIndex} />
                  ))}
                </Detailed>
              </group>
            ),
          )}

        {/* Entry triggers */}
        {buildingNames.map((storeNameKey) => {
          if (
            allStoresInfo == null ||
            allStoresInfo[storeNameKey] == null ||
            allStoresInfo[storeNameKey].entryTriggerAreaGeometry == null ||
            characterRef.current?.roundedBoxRef.current == null ||
            insideStore !== null
          )
            return null 

          return (
            <StoreEntryExitTriggerArea
              key={storeNameKey + ' entry'}
              keyId={storeNameKey + ' entry'}
              characterRef={characterRef}
              geometry={allStoresInfo[storeNameKey].entryTriggerAreaGeometry!}
              transform={allStoresInfo[storeNameKey].entryTriggerAreaTransform}
              onInside={() => showPromptToEnterStore(storeNameKey)}
              onOutside={() => hidePromptToEnterStore()}
            ></StoreEntryExitTriggerArea>
          )
        })}

        {/* exit triggers */}
        {buildingNames.map((storeNameKey) => {
          if (
            allStoresInfo == null ||
            allStoresInfo[storeNameKey] == null ||
            allStoresInfo[storeNameKey].exitTriggerAreaGeometry == null ||
            insideStore !== storeNameKey ||
            insideStore == null
          )
            return null

          return (
            <StoreEntryExitTriggerArea
              key={storeNameKey + ' exit'}
              keyId={storeNameKey + ' exit'}
              characterRef={characterRef}
              geometry={allStoresInfo[storeNameKey].exitTriggerAreaGeometry!}
              transform={allStoresInfo[storeNameKey].exitTriggerAreaTransform}
              onInside={() => {
                showPromptToExitStore(storeNameKey)
              }}
              onOutside={() => hidePromptToExitStore()}
            ></StoreEntryExitTriggerArea>
          )
        })}

        {/* 2d inventory console manager for each building that has it configured.
        This loads the console when user is inside the building */}
        {/* {buildingNames.map(
          (storeNameKey, index) =>
            insideStore == storeNameKey &&
            StoreConfigs[storeNameKey].inventoryConsole !== undefined && (
              <Suspense
                fallback={<LoadingScreen />}
                key={storeNameKey + 'console'}
              >
                <group key={index}>
                  <InventoryConsole
                    characterRef={characterRef}
                    config={StoreConfigs[storeNameKey].inventoryConsole!}
                    name={storeNameKey}
                  />
                </group>
                <Preload all></Preload>
              </Suspense>
            ),
        )} */}

        {BuildingInsideComponents}
      </>
    )
  },
)

export default BuildingManager
