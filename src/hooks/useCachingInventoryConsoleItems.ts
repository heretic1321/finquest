import { useState } from 'react'

import { TJewelleryDisplayData } from '@client/components/InventoryConsole/InventoryConsoleDisplayPanels'

export default function useCachingInventoryConsoleItems() {
  const [inventoryConsoleItems, setInventoryConsoleItems] = useState<
    TJewelleryDisplayData[]
  >([])

  const shiftLeft = (data: TJewelleryDisplayData) => {
    const newArray = [...inventoryConsoleItems]
    newArray.shift()
    newArray.push(data)
    setInventoryConsoleItems(newArray)
  }

  const shiftRight = (data: TJewelleryDisplayData) => {
    const newArray = [...inventoryConsoleItems]
    newArray.unshift(data)
    newArray.pop()
    setInventoryConsoleItems(newArray)
  }

  const copy = (data: TJewelleryDisplayData[]) => {
    setInventoryConsoleItems(data)
  }

  return { inventoryConsoleItems, shiftLeft, shiftRight, copy }
}
