import { SkinColorOptions } from '@client/config/Avatar'
import { AnimationStates } from '@server/utils/types'
import { createContext, useEffect } from 'react'
import { generateUUID } from 'three/src/math/MathUtils'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { AuthAPIStore } from './AuthContext'
import { BackendClient } from '@client/utils/axios'
import { api } from '@client/utils/api'
import toast from 'react-hot-toast'

interface AvatarData {
  avatarPath: string
  avatarName?: string
  skinColorTag?: keyof typeof SkinColorOptions
}

interface PartialAvatarData {
  avatarName?: string
  skinColorTag?: keyof typeof SkinColorOptions
}

export interface AvatarZustandState {
  avatarAnimationState: AnimationStates
  setAvatarAnimationState: (state: AnimationStates) => void

  currentDanceAnimationIndex: number | null

  avatarData: {avatarPath: string}
  setAvatarData: (avatarData: AvatarData | PartialAvatarData) => void

  hasRandomAvatarBeenSelected: boolean
  hasAvatarBeenSelected: boolean
  setHasAvatarBeenSelected: (selected: boolean) => void

  animationServerState: Record<string, AnimationStates>
  setAnimationServerState: (userId: string, newState: AnimationStates) => void
  removeKeyFromAnimationServerState: (userId: string) => void

  handleOnAvatarExported: (path: string) => void
}

export const AvatarStore = create<AvatarZustandState>((set, get) => ({
  avatarAnimationState: 'idle',
  setAvatarAnimationState: (state: AnimationStates) => set({ avatarAnimationState: state }),

  currentDanceAnimationIndex: null,

  avatarData: {avatarPath: localStorage.getItem('avatarPath') || './assets/avatars/feb.glb'},
  setAvatarData: (_avatarData: AvatarData | PartialAvatarData) => set((state) => ({avatarData: {
    ...state.avatarData,
    ..._avatarData,
  }})),

  hasRandomAvatarBeenSelected: false,
  hasAvatarBeenSelected: true, // Always true for FinQuest — no avatar picker
  setHasAvatarBeenSelected: (selected: boolean) => set({ hasAvatarBeenSelected: selected }),

  animationServerState: {},
  setAnimationServerState: (userId: string, newState: AnimationStates) => set((state) => ({
    animationServerState: {
      ...state.animationServerState,
      [userId]: newState,
    },
  })),
  removeKeyFromAnimationServerState: (userId: string) => set((state) => ({
    animationServerState: Object.fromEntries(
      Object.entries(state.animationServerState).filter(([key]) => key !== userId)
    ),
  })),
  handleOnAvatarExported: async (path: string) => {
    get().setAvatarData({
      // to trigger refetching of models and tricking the gltfLoader/threejs to reload the model
      // we add a random query param to the path
      avatarPath: path + `?key=${generateUUID()}`,
    })
    localStorage.setItem('avatarPath', path)

    if (AuthAPIStore.getState().userData?.mobile) {
      // update the avatar url in the database
      try {
        await BackendClient.patch(
          api.user.updateAvatarURL + "/" + (AuthAPIStore.getState().userData?.mobile || ''),
          {
            avatarUrl: path,
          }
        )
      } catch (err) {
        console.error(err)
        toast.error('Something went wrong. Please try again later.')
      }
    }
  },
}))

export type TAvatarData = AvatarZustandState['avatarData']

export const AvatarAppearanceContext = createContext<null>(null)

const AvatarAppearanceProvider = ({ children }: React.PropsWithChildren) => {

  const { avatarData, setHasAvatarBeenSelected } = AvatarStore(
    useShallow((state) => ({
      avatarData: state.avatarData,
      setHasAvatarBeenSelected: state.setHasAvatarBeenSelected,
    }))
  )

  useEffect(() => {
    // If avatar state has already been set, set hasAvatarBeenSelected to true
    if (avatarData === null) return
    if (avatarData.avatarPath === '') setHasAvatarBeenSelected(false)
    else setHasAvatarBeenSelected(true)
  }, [avatarData])

  return (
    <AvatarAppearanceContext.Provider value={null}>
      {children}
    </AvatarAppearanceContext.Provider>
  )
}

export { AvatarAppearanceProvider }
