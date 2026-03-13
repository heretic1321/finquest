import { create } from 'zustand'

const useHudStore = create((set) => ({
  hasStartButtonBeenPressed: true,  // true for FinQuest (no start screen initially)
  showJoystick: false,
  jumpButtonTapped: false,
  showDialogScreen: false,

  setShowDialogScreen: (show) => set({ showDialogScreen: show }),
  setJumpButtonTapped: (tapped) => set({ jumpButtonTapped: tapped }),
}))

export default useHudStore
