import { create } from 'zustand'
import { createRef } from 'react'

const useWorldStore = create((set, get) => ({
  // Tab focus
  isTabFocused: true,

  // Map/collision state
  collider: null,        // THREE.Mesh with BVH boundsTree
  mapModel: null,        // THREE.Group (the loaded GLB scene)
  geometry: null,        // THREE.BufferGeometry (merged collider geometry)

  // Loading state
  loading_initialSpawn: true,

  // Effects
  areEffectsEnabled: false,

  // DPR
  dpr: 0.8,

  // Character ref (set by Character component)
  isCharacterRefReady: false,
  characterRef: createRef(),

  // Actions
  setCollider: (collider) => set({ collider }),
  setMapModel: (mapModel) => set({ mapModel }),
  setGeometry: (geometry) => set({ geometry }),
  setLoading: (loading_initialSpawn) => set({ loading_initialSpawn }),
  setCharacterRef: (ref) => set({ characterRef: ref, isCharacterRefReady: true }),
}))

// Tab focus listener (call once in App)
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    useWorldStore.setState({ isTabFocused: !document.hidden })
  })
}

export default useWorldStore
