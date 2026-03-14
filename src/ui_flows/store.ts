import { create } from 'zustand'

import { PlayerConfigStore } from '@client/components/Character'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'

import { UIFlowId } from './config'

type UIFlowSource = 'login' | 'zone' | 'manual'

type OpenFlowOptions = {
  source?: UIFlowSource
  storeKey?: string
}

type UIFlowState = {
  isOpen: boolean
  activeFlowId: UIFlowId | null
  entrySource: UIFlowSource | null
  entryStoreKey: string | null
  openUIFlow: (flowId: UIFlowId, options?: OpenFlowOptions) => void
  closeUIFlow: () => void
}

const freezeWorldForOverlay = () => {
  if (!HUDStore.getState().hasStartButtonBeenPressed) return

  PlayerConfigStore.getState().isPlayerParalysedRef.current = true

  if (GesturesAndDeviceStore.getState().isTouchDevice) {
    genericStore.getState().hideJoystickAndJumpButton()
  }
}

const unfreezeWorldAfterOverlay = () => {
  if (!HUDStore.getState().hasStartButtonBeenPressed) return

  PlayerConfigStore.getState().isPlayerParalysedRef.current = false

  if (
    GesturesAndDeviceStore.getState().isTouchDevice &&
    !genericStore.getState().isTutorialEnabled
  ) {
    genericStore.getState().showJoystickAndJumpButton()
  }
}

export const UIFlowStore = create<UIFlowState>((set) => ({
  isOpen: false,
  activeFlowId: null,
  entrySource: null,
  entryStoreKey: null,

  openUIFlow: (flowId, options = {}) => {
    freezeWorldForOverlay()

    set({
      isOpen: true,
      activeFlowId: flowId,
      entrySource: options.source ?? 'manual',
      entryStoreKey: options.storeKey ?? null,
    })
  },

  closeUIFlow: () => {
    unfreezeWorldAfterOverlay()

    set({
      isOpen: false,
      activeFlowId: null,
      entrySource: null,
      entryStoreKey: null,
    })
  },
}))
