import { memo, useEffect, useState } from 'react'
import { DataStore } from '@client/contexts/DataContext'
import { InventoryConsoleHUDStore } from '@client/contexts/InventoryConsoleHUDContext'
import { IJewelleryItem } from '@client/utils/types'
import { useShallow } from 'zustand/react/shallow'
import { SoundsStore } from '../Sounds'
import { create } from 'zustand'


interface InventoryConsoleButtonHandlerZustandState {
  currentItemIndex: number
  isDataDisplayed: boolean
  exitInventoryConsole: () => void
}

export const InventoryConsoleButtonHandlerStore =
  create<InventoryConsoleButtonHandlerZustandState>((set) => ({
    currentItemIndex: 3,
    isDataDisplayed: false,
    exitInventoryConsole: () => {
      SoundsStore.getState().playClickSoundOnce()
      if (
        InventoryConsoleHUDStore.getState()
          .isTransitionToPresentationModeComplete &&
        InventoryConsoleHUDStore.getState().isPresentationMode
      ) {
        InventoryConsoleHUDStore.getState().setIsPresentationModeShuttingDown(
          true,
        )
        InventoryConsoleHUDStore.getState().setIsTransitionToPresentationModeComplete(
          false,
        )
      }
      set({ currentItemIndex: 3 })
      InventoryConsoleHUDStore.setState({ isDetailMode: false })
      set({ isDataDisplayed: false })
    },
  }))

const InventoryConsoleButtonHandler = memo(() => {
  // taking 3 here because we have 3 + 1 + 3 items in the console. 3 on the left, 1 in the middle and 3 on the right
  // we want to start with the middle item, so we set the index to 3
  const { isPresentationMode, setConsoleActiveItemIndex } =
    InventoryConsoleHUDStore(
      useShallow((state) => ({
        isPresentationMode: state.isPresentationMode,
        setConsoleActiveItemIndex: state.setConsoleActiveItemIndex,
      })),
    )
  const data = DataStore((state) => state.inventoryConsoleData)
  const [apiData, setApiData] = useState<IJewelleryItem[]>()
  useEffect(() => {
    if (data) {
      setApiData(data.data)
    }
  }, [data])

  const [, setApiDataLength] = useState(-1)


  useEffect(() => {
    if (apiData) setApiDataLength(Math.floor(apiData.length))
  }, [apiData])

  // this effect can be used to fetch inventory console data from the server when entering store  wthout clicking anything
  // useEffect(() => {
  //   if (!isPresentationMode) {
  //     // when presentation mode is shut down, we want to dispose the textures
  //     // that we had cached
  //     cachedJewelleryItems.inventoryConsoleItems.forEach((item) => {
  //       item.imageTexture.dispose()
  //       item.sidePanelsTexture.left.dispose()
  //       item.sidePanelsTexture.right.dispose()
  //     })
  //     return
  //   }
  //   if (!apiData) return

  //   const dataToSet: TJewelleryDisplayData[] = []

  //   for (let i = -cacheLimit; i < 7 + cacheLimit; i++) {
  //     let normalizedIndex = i % (apiDataLength - 1)
  //     if (normalizedIndex < 0) normalizedIndex = apiDataLength + normalizedIndex
  //     const description = showItemPurity(apiData[normalizedIndex])
  //     const jwelData = {
  //       id: normalizedIndex,
  //       title: apiData[normalizedIndex]?.title || '',
  //       price: apiData[normalizedIndex].prices[0].discount
  //         ? apiData[normalizedIndex].prices[0].discount.total
  //         : apiData[normalizedIndex].prices[0].total,
  //       description: description || '',
  //       imageTexture: textureLoader.load(
  //         apiData[normalizedIndex]?.images?.[0]?.media,
  //       ) || null,
  //       sidePanelsTexture: {
  //         left: textureLoader.load(apiData[normalizedIndex]?.images?.[1]?.media) || null,
  //         right: textureLoader.load(apiData[normalizedIndex]?.images?.[2]?.media) || null,
  //       },
  //     }
  //     dataToSet.push(jwelData)
  //   }
  //   InventoryConsoleButtonHandlerStore.setState({ isDataDisplayed: true })
  //   cachedJewelleryItems.copy(dataToSet)
  // }, [isPresentationMode, apiData])

  useEffect(() => {
    if (!isPresentationMode) {
      InventoryConsoleButtonHandlerStore.setState({ isDataDisplayed: false })
    }
  }, [isPresentationMode])

  const _currentItemIndex = InventoryConsoleButtonHandlerStore(
    (state) => state.currentItemIndex,
  )
  useEffect(() => {
    setConsoleActiveItemIndex(_currentItemIndex)
  }, [_currentItemIndex])

  return <></>
})

export default InventoryConsoleButtonHandler
