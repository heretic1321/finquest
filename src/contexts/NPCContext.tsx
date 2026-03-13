import React, { createContext, useEffect } from 'react'

import { TDialog } from '@client/components/shared/NPC'
import { HUDStore } from '@client/contexts/HUDContext'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

export type TNPC = {
  name: string
  portrait?: string
}

export type TInteractionState =
  | `${'start' | 'inProgress' | 'end'}${'Dialog' | 'Move'}`
  | 'idle'

export type TNPCContext = {}

interface NPCStoreZustandState {
  dialogs: TDialog[]
  setDialogs: (x: TDialog[]) => void
  NPC: TNPC
  setNPC: (x: TNPC) => void
  activeDialogIndex: number
  setActiveDialogIndex: (x: number) => void
  increaseActiveDialogIndex: (increaseBy: number) => void
  onNext: (() => void) | null
  setOnNext: (x: () => void) => void
  currentPosition: number
  setCurrentPosition: (x: number) => void
  totalPoints: number
  setTotalPoints: (x: number) => void
  interactionState: TInteractionState
  setInteractionState: (x: TInteractionState) => void
}

export const NPCStore = create<NPCStoreZustandState>((set) => ({
  // Dialogs to be shown when the user interacts with the NPC
  dialogs: [],
  setDialogs: (x) => set({ dialogs: x }),
  // NPC name and portrait to show on the dialog screen
  NPC: {
    name: '',
  },
  setNPC: (x) => set({ NPC: x }),
  activeDialogIndex: -1,
  setActiveDialogIndex: (x) => set({ activeDialogIndex: x }),
  increaseActiveDialogIndex: (increaseBy) =>
    set((state) => ({ activeDialogIndex: state.activeDialogIndex + increaseBy })),
  onNext: null,
  setOnNext: (x) => set({ onNext: x }),
  currentPosition: -1,
  setCurrentPosition: (x) => set({ currentPosition: x }),
  totalPoints: 0,
  setTotalPoints: (x) => set({ totalPoints: x }),
  interactionState: 'idle',
  setInteractionState: (x) => set({ interactionState: x }),
}))

export const NPCContext = createContext<TNPCContext>({})

const NPCContextProvider = ({
  children,
}: React.PropsWithChildren) => {


  const {
    activeDialogIndex,
    setOnNext,
  } = NPCStore(
    useShallow((state) => ({
      activeDialogIndex: state.activeDialogIndex,
      setOnNext: state.setOnNext,
    })
  ))

  useEffect(() => {
    if (NPCStore.getState().onNext !== null) return

    setOnNext(() => {
      const activeDialogIndex = NPCStore.getState().activeDialogIndex
      const dialogs = NPCStore.getState().dialogs
      const setActiveDialogIndex = NPCStore.getState().setActiveDialogIndex
      const setShowDialogScreen = HUDStore.getState().setShowDialogScreen
      const setInteractionState = NPCStore.getState().setInteractionState
      const increaseActiveDialogIndex = NPCStore.getState().increaseActiveDialogIndex
  
      if (
        activeDialogIndex === dialogs.length - 1 ||
        dialogs[activeDialogIndex].isEndOfConversation
      ) {
        setActiveDialogIndex(0)
        setShowDialogScreen(false)
        setInteractionState('endDialog')
        return
      }
      dialogs[activeDialogIndex].onEnd?.()
      increaseActiveDialogIndex(1)
    })
  }, [setOnNext])
  

  /**
   * Trigger a callback when the currently visible dialog is updated
   */
  useEffect(() => {
    const dialogs = NPCStore.getState().dialogs
    const interactionState = NPCStore.getState().interactionState
    const showDialogScreen = HUDStore.getState().showDialogScreen

    if (
      dialogs[activeDialogIndex] &&
      interactionState === 'inProgressDialog' &&
      showDialogScreen
    ) {
      dialogs[activeDialogIndex].onStart?.()
    }
  }, [activeDialogIndex])

  return (
    <NPCContext.Provider value={{}}>
      {children}
    </NPCContext.Provider>
  )
}

export default NPCContextProvider
