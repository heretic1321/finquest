import { createContext, useEffect } from 'react'
import { MeshBVHVisualizer } from 'three-mesh-bvh'

import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

// import { useControls } from 'leva'
import { StoreConfigs, TPortalConfig } from '@client/config/MapConfig'
import { HUDStore } from '@client/contexts/HUDContext'
import useMap from '@client/hooks/useMap'
import {
  Transform,
  TransformLite,
  TransformWithNulls,
} from '@client/utils/commonTypes'

import { genericStore } from './GlobalStateContext'

export interface StoreInfo {
  lods: {
    distances: [number, number, number]
    objects: [
      THREE.Group | THREE.Mesh | null,
      THREE.Group | THREE.Mesh | null,
      THREE.Group | THREE.Mesh | null,
    ]
    transform: TransformWithNulls
  }
  entryTriggerAreaGeometry: THREE.BufferGeometry | null
  entryTriggerAreaTransform: TransformLite
  exitTriggerAreaGeometry: THREE.BufferGeometry | null
  exitTriggerAreaTransform: TransformLite
}

type AllStoreInfoMap = Record<string, StoreInfo>

export type MapContextType = {}

interface MapZustandState {
  mapScale: number
  showVisualizer: boolean
  visualizerDepth: number

  geometry: THREE.BufferGeometry | null
  visualizer: MeshBVHVisualizer | null
  collider: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> | null
  mapModel: THREE.Group | null
  mapTransform: Transform | null
  allStoresInfo: AllStoreInfoMap
  listOfDisplayContainers: THREE.Group[] | null
  listOfDisplayPanels: THREE.Mesh[] | null
  inventoryConsoleBody: THREE.Group | null
  itemsToHide: Record<
    string,
    THREE.Object3D<THREE.Event> | THREE.Object3D<THREE.Event>[]
  >
  portalCircleGeometry: THREE.BufferGeometry | null
  portalBoundaryMesh: THREE.Group | null
  portalConfigs: Record<string, TPortalConfig[]>
  horizontalScreenDetails: {
    screenGeometry: THREE.BufferGeometry | null
    screenTransform: Transform | null
  }
  screeningAreaPanels: THREE.Mesh[]

  addOrUpdateItemToHide: (
    key: string,
    value: THREE.Object3D<THREE.Event> | THREE.Object3D<THREE.Event>[],
  ) => void
  addOrUpdateAllStoresInfo: (key: string, value: StoreInfo) => void
}

export const MapStore = create<MapZustandState>((set) => ({
  mapScale: 2,
  showVisualizer: false,
  visualizerDepth: 10,

  geometry: null,
  visualizer: null,
  collider: null,
  mapModel: null,
  mapTransform: null,
  allStoresInfo: {},
  listOfDisplayContainers: null,
  listOfDisplayPanels: null,
  inventoryConsoleBody: null,
  itemsToHide: {},
  portalCircleGeometry: null,
  portalBoundaryMesh: null,
  portalConfigs: {},
  horizontalScreenDetails: {
    screenGeometry: null,
    screenTransform: null,
  },
  screeningAreaPanels: [],

  addOrUpdateItemToHide: (key, value) =>
    set((state) => ({
      itemsToHide: {
        ...state.itemsToHide,
        [key]: value,
      },
    })),
  addOrUpdateAllStoresInfo: (key, value) =>
    set((state) => ({
      allStoresInfo: {
        ...state.allStoresInfo,
        [key]: value,
      },
    })),
}))

export const MapContext = createContext<MapContextType>({})

export const MapContextProvider = ({ children }: React.PropsWithChildren) => {
  const {
    // isDebugMode,
    insideStore,
  } = genericStore(
    useShallow((state) => ({
      isDebugMode: state.isDebugMode,
      insideStore: state.insideStore,
    })),
  )

  const { isShowcaseMode, isShowcaseModeShuttingDown } = HUDStore(
    useShallow((state) => ({
      isShowcaseMode: state.isShowcaseMode,
      isShowcaseModeShuttingDown: state.isShowcaseModeShuttingDown,
    })),
  )

  // useControls(
  //   'Map',
  //   () => ({
  //     mapScale: {
  //       value: MapStore.getState().mapScale,
  //       min: 0,
  //       max: 10,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         MapStore.setState({ mapScale: value })
  //       }
  //     },
  //     showVisualizer: {
  //       value: MapStore.getState().showVisualizer,
  //       onChange: (value: boolean) => {
  //         MapStore.setState({ showVisualizer: value })
  //       },
  //     },
  //     visualizerDepth: {
  //       value: MapStore.getState().visualizerDepth,
  //       min: 0,
  //       max: 100,
  //       step: 1,
  //       onChange: (value: number) => {
  //         MapStore.setState({ visualizerDepth: value })
  //       }
  //     },
  //   }),
  //   {
  //     collapsed: true,
  //     render: () => {
  //       return isDebugMode || false
  //     },
  //   },
  // )

  useMap()

  // hide some objects when we enter showcase mode
  useEffect(() => {
    if (insideStore === '' || insideStore == null) return

    // showcase mode not opened
    if (isShowcaseMode == false && isShowcaseModeShuttingDown == false) return

    const toggleVisibilityOfItems = (toShow: boolean) => {
      for (let i = 0; i < StoreConfigs[insideStore].thingsToHide.length; i++) {
        const thing_s_ToHide =
          MapStore.getState().itemsToHide[
            StoreConfigs[insideStore].thingsToHide[i]
          ]
        if (thing_s_ToHide == undefined) continue
        if (thing_s_ToHide instanceof Array) {
          thing_s_ToHide.forEach((thingToHide) => {
            thingToHide.visible = toShow
          })
        } else {
          thing_s_ToHide.visible = toShow
        }
      }
    }

    // reached showcase mode
    if (isShowcaseMode == true && isShowcaseModeShuttingDown == false) {
      toggleVisibilityOfItems(false)
      return
    }

    // showcase mode just shut down
    if (isShowcaseMode == true && isShowcaseModeShuttingDown == true) {
      toggleVisibilityOfItems(true)
      return
    }
  }, [insideStore, isShowcaseMode, isShowcaseModeShuttingDown])

  return <MapContext.Provider value={{}}>{children}</MapContext.Provider>
}
