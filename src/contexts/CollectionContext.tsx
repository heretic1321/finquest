import { createContext } from 'react'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import QueryString from 'qs'

import { api } from '@client/utils/api'
import { BackendClient } from '@client/utils/axios'
import { IGroupWithItems } from '@client/utils/types/collectionAPI'
import { create } from 'zustand'
import { MapStore } from './MapContext'
import { staticResourcePaths } from '@client/config/staticResourcePaths'

export type TCollectionContext = {}

interface CollectionZustandState {
  groups: IGroupWithItems[] | null
  setGroups: (groups: IGroupWithItems[] | null) => void
  currentActiveStoreName: string
  setCurrentActiveStoreName: (storeName: string) => void
  groupDataCache: Record<string, IGroupWithItems[]>
  addToOrUpdateGroupDataCache: (cacheKey: string, cacheValue: IGroupWithItems[]) => void
}

export const CollectionStore = create<CollectionZustandState>((set) => ({
  groups: null,
  setGroups: (groups: IGroupWithItems[] | null) => set({ groups: groups }),
  currentActiveStoreName: '',
  setCurrentActiveStoreName: (storeName: string) => set({ currentActiveStoreName: storeName }),
  groupDataCache: {},
  addToOrUpdateGroupDataCache: (cacheKey: string, cacheValue: IGroupWithItems[]) => set((state) => ({
    groupDataCache: {
      ...state.groupDataCache,
      [cacheKey]: cacheValue,
    }
  })),
}))

export const CollectionContext = createContext<TCollectionContext>({})

export const CollectionContextProvider = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  return (
    <CollectionContext.Provider
      value={{}}
    >
      {children}
    </CollectionContext.Provider>
  )
}

// Instantiate a loader
export const loader = new GLTFLoader()

// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./draco/')
loader.setDRACOLoader(dracoLoader)

export const fetchGroupDataForStore = async (
  storeName: string,
  preloadHighPoly = false,
  preloadLowPoly = true,
) => {
  if (storeName === '') return { groups: [] }

  const fetchAllGroups = async () => {
    const res = await BackendClient.get<{ groups: IGroupWithItems[] }>(
      api.collection.groupsWithItems,
      {
        params: {
          // collections: collectionsByStore.all,
          storeName: storeName,
          // store in collectionsByStore
          //   ? collectionsByStore[store as keyof typeof collectionsByStore]
          //   : undefined,
        },
        paramsSerializer: (params) => {
          return QueryString.stringify(params, { arrayFormat: 'repeat' })
        },
      },
    )

    await Promise.all(
      res.data.groups.map(async (group: IGroupWithItems) => {
        await Promise.all(
          group.slots.map(async (slot) => {
            if (slot.itemTransform) {
              // iterate on key values of itemTransform
              Object.keys(slot.itemTransform).forEach((itemType) => {
                // @ts-ignore
                slot.itemTransform[itemType].position = slot.itemTransform[
                  itemType
                ].position.map((num: number) => num * MapStore.getState().mapScale)

                // @ts-ignore
                slot.itemTransform[itemType].scale = slot.itemTransform[itemType].scale.map((num: number) => num * MapStore.getState().mapScale)
              })
            }

            try {
              if (slot.item) {
                if (preloadLowPoly) {
                  const gltf = await loader.loadAsync(
                    `${staticResourcePaths.s3_bucket_cdn}${slot.item.sku}_l.glb`,
                  )
                  slot.item.lowPolyScene = gltf.scene
                }

                if (preloadHighPoly) {
                  const gltf = await loader.loadAsync(
                    `${staticResourcePaths.s3_bucket_cdn}${slot.item.sku}_h.glb`,
                  )
                  slot.item.highPolyScene = gltf.scene
                }
              }
            } catch (err) {
              console.error(err)
            }
          }),
        )

        group.triggerArea.position = group.triggerArea.position.map(
          (num) => num * MapStore.getState().mapScale,
        ) as [number, number, number]

        if (group.triggerArea.newPosition) {
          group.triggerArea.newPosition = group.triggerArea.newPosition.map(
            (num) => num * MapStore.getState().mapScale,
          ) as [number, number, number]
        }

        group.triggerArea.scale = group.triggerArea.scale.map(
          (num) => num * MapStore.getState().mapScale * 2,
        ) as [number, number, number]
        group.triggerArea.presentationCamera.position =
          group.triggerArea.presentationCamera.position.map(
            (num) => num * MapStore.getState().mapScale,
          ) as [number, number, number]
        group.triggerArea.presentationCamera.target =
          group.triggerArea.presentationCamera.target.map(
            (num) => num * MapStore.getState().mapScale,
          ) as [number, number, number]
        group.triggerArea.showcaseCamera.position =
          group.triggerArea.showcaseCamera.position.map(
            (num) => num * MapStore.getState().mapScale,
          ) as [number, number, number]
        group.triggerArea.showcaseCamera.target =
          group.triggerArea.showcaseCamera.target.map(
            (num) => num * MapStore.getState().mapScale,
          ) as [number, number, number]
      }),
    )
    return { groups: res.data.groups }
  }

  const { groups } = await fetchAllGroups()
  return { groups }
}
