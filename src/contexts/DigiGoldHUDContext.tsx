import React, { createContext } from 'react'
import { create } from 'zustand'

type DigiGoldHUDContextType = {}
interface DigiGoldHUDZustandState {
  isDigiGoldMachinePromptShown: boolean
  setIsDigiGoldMachinePromptShown: (x: boolean) => void
  isDigiGoldMachinePromptClicked: boolean
  setIsDigiGoldMachinePromptClicked: (x: boolean) => void
  currentMachineID: string
  setCurrentMachineID: (x: string) => void
  isDigiGoldPresentationMode: boolean
  setIsDigiGoldPresentationMode: (x: boolean) => void
  isDigiGoldPresentationModeShuttingDown: boolean
  setIsDigiGoldPresentationModeShuttingDown: (x: boolean) => void
  isDigiGoldPresentationModeStartingUp: boolean
  setIsDigiGoldPresentationModeStartingUp: (x: boolean) => void
  isDigiGoldTransitionToPresentationModeComplete: boolean
  setIsDigiGoldTransitionToPresentationModeComplete: (x: boolean) => void
  isDigiGoldTransitionFromPresentationModeComplete: boolean
  setIsDigiGoldTransitionFromPresentationModeComplete: (x: boolean) => void
  exitingDigiGoldMachine: boolean
  setExitingDigiGoldMachine: (x: boolean) => void
  isDigiGoldVisible: boolean
  setIsDigiGoldVisible: (x: boolean) => void
}

export const DigiGoldHUDStore = create<DigiGoldHUDZustandState>((set) => ({
  isDigiGoldMachinePromptShown: false,
  setIsDigiGoldMachinePromptShown: (x) =>
    set({ isDigiGoldMachinePromptShown: x }),
  isDigiGoldMachinePromptClicked: false,
  setIsDigiGoldMachinePromptClicked: (x) =>
    set({ isDigiGoldMachinePromptClicked: x }),
  currentMachineID: '',
  setCurrentMachineID: (x) => set({ currentMachineID: x }),
  isDigiGoldPresentationMode: false,
  setIsDigiGoldPresentationMode: (x) => set({ isDigiGoldPresentationMode: x }),
  isDigiGoldPresentationModeShuttingDown: false,
  setIsDigiGoldPresentationModeShuttingDown: (x) =>
    set({ isDigiGoldPresentationModeShuttingDown: x }),
  isDigiGoldPresentationModeStartingUp: false,
  setIsDigiGoldPresentationModeStartingUp: (x) =>
    set({ isDigiGoldPresentationModeStartingUp: x }),
  isDigiGoldTransitionToPresentationModeComplete: false,
  setIsDigiGoldTransitionToPresentationModeComplete: (x) =>
    set({ isDigiGoldTransitionToPresentationModeComplete: x }),
  isDigiGoldTransitionFromPresentationModeComplete: false,
  setIsDigiGoldTransitionFromPresentationModeComplete: (x) =>
    set({ isDigiGoldTransitionFromPresentationModeComplete: x }),
  exitingDigiGoldMachine: false,
  setExitingDigiGoldMachine: (x) => set({ exitingDigiGoldMachine: x }),
  isDigiGoldVisible: false,
  setIsDigiGoldVisible: (x) => set({ isDigiGoldVisible: x }),
}))

const DigiGoldHUDContext = createContext<DigiGoldHUDContextType>({})

export const DigiGoldHUDContextProvider = ({
  children,
}: React.PropsWithChildren) => {
  return (
    <DigiGoldHUDContext.Provider value={{}}>
      {children}
    </DigiGoldHUDContext.Provider>
  )
}
