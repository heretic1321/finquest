import { create } from 'zustand'
import { createRef } from 'react'

// Animation states: 'idle' | 'walk' | 'run' | 'jump'
const usePlayerStore = create((set) => ({
  avatarAnimationState: 'idle',
  setAvatarAnimationState: (state) => set({ avatarAnimationState: state }),

  avatarData: { avatarPath: './models/characters/feb.glb' },
  hasAvatarBeenSelected: true, // always true for FinQuest (no avatar picker)
}))

export default usePlayerStore

// Player physics config (separate store, no reactivity needed)
export const PlayerConfigStore = create(() => ({
  maxSpeed: 4,
  jumpDistance: 15,
  deathHeight: -5.1,
  playerSpawnPosition: [0, 10, 0],  // Will adjust for FinQuest map
  isPlayerParalysedRef: createRef(),  // Set to true during NPC dialog
  resetFn: null,
}))
