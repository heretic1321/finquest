import { create } from 'zustand'

interface GenericVRState {
  isVRMode: boolean
  setIsVRMode: (vrMode: boolean) => void

  isVRHudVisible: boolean
  setIsVRHudVisible: (isVRHudVisible: boolean) => void

  useVRLocomotion: boolean
  setUseVRLocomotion: (useLocomotion: boolean) => void

  useVRTeleportation: boolean
  setUseVRTeleportation: (useTeleportation: boolean) => void

  isTriggerUIActive: boolean
  setIsTriggerUIActive: (isTriggerUIActive: boolean) => void

  playerSpeed: number

  isVRSessionSupported?: boolean
  setIsVRSessionSupported: (isVRSessionSupported: boolean) => void
}

export const vrStore = create<GenericVRState>((set) => ({
  isVRMode: false,
  setIsVRMode: (vrMode) => set({ isVRMode: vrMode }),

  isVRHudVisible: false,
  setIsVRHudVisible: (isVRHudVisible) => set({ isVRHudVisible }),

  isTriggerUIActive: false,
  setIsTriggerUIActive: (isTriggerUIActive) => set({ isTriggerUIActive }),

  useVRLocomotion: true,
  setUseVRLocomotion: (useLocomotion) =>
    set({ useVRLocomotion: useLocomotion }),

  useVRTeleportation: true,
  setUseVRTeleportation: (useTeleportation) =>
    set({ useVRTeleportation: useTeleportation }),

  playerSpeed: 3,

  isVRSessionSupported: undefined,
  setIsVRSessionSupported: (isVRSessionSupported) =>
    set({ isVRSessionSupported: isVRSessionSupported }),
}))
