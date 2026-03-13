import React, { createContext } from 'react'
import { create } from 'zustand'

export type InventoryConsoleHUDContextType = {}

interface InventoryConsoleHUDZustandState {
  currentConsoleID: number
  setCurrentConsoleID: (x: number) => void
  isPresentationMode: boolean
  setIsPresentationMode: (x: boolean) => void
  isPresentationModeShuttingDown: boolean
  setIsPresentationModeShuttingDown: (x: boolean) => void
  isPresentationModeStartingUp: boolean
  setIsPresentationModeStartingUp: (x: boolean) => void
  isTransitionToPresentationModeComplete: boolean
  setIsTransitionToPresentationModeComplete: (x: boolean) => void
  isTransitionFromPresentationModeComplete: boolean
  setIsTransitionFromPresentationModeComplete: (x: boolean) => void
  consoleActiveItemIndex: number
  setConsoleActiveItemIndex: (x: number) => void
  selectedPanel: 'cart' | 'details'
  setSelectedPanel: (x: 'cart' | 'details') => void
  isDetailMode: boolean
  setIsDetailMode: (x: boolean) => void
  currentCollectionID: number
  setCurrentCollectionID: (x: number) => void
}


export const InventoryConsoleHUDStore = create<InventoryConsoleHUDZustandState>((set) => ({
  currentConsoleID: -1,
  setCurrentConsoleID: (x) => set({ currentConsoleID: x }),
  isPresentationMode: false,
  setIsPresentationMode: (x) => set({ isPresentationMode: x }),
  isPresentationModeShuttingDown: false,
  setIsPresentationModeShuttingDown: (x) => set({ isPresentationModeShuttingDown: x }),
  isPresentationModeStartingUp: false,
  setIsPresentationModeStartingUp: (x) => set({ isPresentationModeStartingUp: x }),
  isTransitionToPresentationModeComplete: false,
  setIsTransitionToPresentationModeComplete: (x) => set({ isTransitionToPresentationModeComplete: x }),
  isTransitionFromPresentationModeComplete: false,
  setIsTransitionFromPresentationModeComplete: (x) => set({ isTransitionFromPresentationModeComplete: x }),
  consoleActiveItemIndex: -1,
  setConsoleActiveItemIndex: (x) => set({ consoleActiveItemIndex: x }),
  selectedPanel: 'details',
  setSelectedPanel: (x) => set({ selectedPanel: x }),
  isDetailMode: false,
  setIsDetailMode: (x) => set({ isDetailMode: x }),
  currentCollectionID: -1,
  setCurrentCollectionID: (x) => set({ currentCollectionID: x }),
}))


export const InventoryConsoleHUDContext = createContext<InventoryConsoleHUDContextType>({})

export const InventoryConsoleHUDContextProvider = ({
  children,
}: React.PropsWithChildren) => {

  return (
    <InventoryConsoleHUDContext.Provider
      value={{}}
    >
      {children}
    </InventoryConsoleHUDContext.Provider>
  )
}