import { createContext, useEffect } from 'react'
import { AuthAPIStore } from '@client/contexts/AuthContext'
import { CollectionStore } from '@client/contexts/CollectionContext'
import { api } from '@client/utils/api'
import { SencoClient } from '@client/utils/axios'
import { GET_ITEMS_BY_SKU_LIST } from '@client/utils/dummyData'
import { IJewelleryItem } from '@client/utils/types'

import { AxiosError } from 'axios'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { genericStore } from './GlobalStateContext'

export type IInventoryConsoleDataType = {
  categoryID: number
  data: IJewelleryItem[]
}


export const DataContext = createContext({})

interface DataZustandState {
  apiData: IJewelleryItem[] | null
  setApiData: (data: IJewelleryItem[] | null) => void
  inventoryConsoleData: IInventoryConsoleDataType | null
  setInventoryConsoleData: (data: IInventoryConsoleDataType | null) => void
  fetchSKUsByCategory: (categoryID: number) => Promise<[boolean, any]>
  fetchProductDataBySKUs: (skus: string[], accessTokenCookie: string) => Promise<[boolean, any]>
}

export const DataStore = create<DataZustandState>((set) => ({
  apiData: null,
  setApiData: (data: IJewelleryItem[] | null) => set({ apiData: data }),
  inventoryConsoleData: null,
  setInventoryConsoleData: (data: IInventoryConsoleDataType | null) =>
    set({ inventoryConsoleData: data }),
  fetchSKUsByCategory: async (categoryID: number) => {
    try {
      const { data, status } = await SencoClient.get(
        api.item.SKUsByCategory + `/${categoryID}`,
      )

      if (status === 200) {
        return [true, data]
      } else {
        return [false, data]
      }
    } catch (error) {
      console.error('Error in Fetching SKU API: ', error)
      return [false, error]
    }
  },
  fetchProductDataBySKUs: async (skus: string[], accessTokenCookie: string) => {
    try {
      const { data, status } = await SencoClient.post(
        api.item.bySKU,
        JSON.stringify({
          skus: skus,
        }),
        {
          headers: {
            Authorization: `Bearer ${accessTokenCookie}`,
          },
        },
      )
      if (status === 200 || status == 201) {
        return [true, data]
      } else {
        return [false, data]
      }
    } catch (error) {
      console.error('Error in Fetching Product API: ', error)
      throw error as AxiosError
    }
  },
}))

export const DataContextProvider = ({ children }: React.PropsWithChildren) => {
  const { isLoggedIn, isGuest, accessTokenCookie } = AuthAPIStore(
    useShallow((state) => ({
      isLoggedIn: state.isLoggedIn,
      isGuest: state.isGuest,
      accessTokenCookie: state.accessTokenCookie,
    })),
  )

  const setApiData = DataStore((state) => state.setApiData)
  const groupDataCache = CollectionStore((state) => state.groupDataCache)
  const insideStore = genericStore((state) => state.insideStore)
  const fetchProductDataBySKUs = DataStore(state => state.fetchProductDataBySKUs)

  // Fetch and set data for 3D showcases, fetching data for the list of SKUs fetched from our mongo db
  useEffect(() => {
    if (!(isLoggedIn || isGuest)) return
    if (insideStore == null) return
    if (accessTokenCookie == null) {
      // guest user, using stale data
      setApiData(GET_ITEMS_BY_SKU_LIST)
      genericStore.setState({ loading_FetchingProductsBySKU: false })
      return
    }

    genericStore.setState({ loading_FetchingProductsBySKU: true })
    const fetchData = async () => {
      if (!groupDataCache[insideStore]) return

      const SKUList: string[] = []
      for (let i = 0; i < groupDataCache[insideStore].length; i++) {
        for (let j = 0; j < groupDataCache[insideStore][i].slots.length; j++) {
          const item = groupDataCache[insideStore][i].slots[j].item
          if (item) {
            if (item.sku.includes('_') && item.sku.includes('-')) {
              // do nothing
            } else {
              // replace _ with - in SKU
              item.sku = item.sku.replace(/_/g, '-')
            }
            SKUList.push(item.sku)
          }
        }
      }

      const items: IJewelleryItem[] = await fetchProductDataBySKUs(SKUList, accessTokenCookie)
        .then(([, data]) => {
          return data
        })
        .catch((error) => {
          console.error(error)
          const dataInCaseOfError = []
          for (let i = 0; i < SKUList.length; i++) {
            dataInCaseOfError.push({
              ...GET_ITEMS_BY_SKU_LIST,
              sku: SKUList[i],
            })
          }
          return dataInCaseOfError
        })
      
      setApiData(items)
      genericStore.setState({ loading_FetchingProductsBySKU: false })
    }

    fetchData()
  }, [isLoggedIn, isGuest, groupDataCache, insideStore, accessTokenCookie])

  return (
    <DataContext.Provider value={{}}>
      {children}
    </DataContext.Provider>
  )
}
