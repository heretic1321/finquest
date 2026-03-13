import { createContext, createRef, MutableRefObject, useEffect } from 'react'

import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import { CharacterRef } from '@client/components/Character'

import { HUDStore } from './HUDContext'
// import { SoundsStore } from '@client/components/Sounds'

export type TGlobalStateContext = {}

export const GlobalStateContext = createContext<TGlobalStateContext>({})

interface GenericZustandState {
  dpr: number
  defaultDpr: number
  effectsDpr: number
  isTutorialEnabled: boolean
  setIsTutorialEnabled: (enabled: boolean) => void
  moveToNextTutorialDialog: boolean
  setMoveToNextTutorialDialog: (enabled: boolean) => void
  currentTutorialDialogId : string | null
  setCurrentTutorialDialogId: (dialogId: string | null) => void
  isTutorialNPCActive: boolean
  isDebugMode: boolean
  setIsDebugMode: (debug: boolean) => void

  isBuildingLoading: boolean
  setIsBuildingLoading: (loading: boolean) => void

  loading_FetchingGroupDataFromFastapi: boolean
  loading_FetchingProductsBySKU: boolean
  loading_FetchingDataForInventoryConsole: boolean
  loading_initialSpawn: boolean
  loading_avatarModelAndAnims: boolean

  insideStore: string | null
  setInsideStore: (storeName: string | null) => void

  havePortalsCooledDown: boolean
  setHavePortalsCooledDown: (cooledDown: boolean) => void

  areEffectsEnabled: boolean
  setAreEffectsEnabled: (enabled: boolean) => void

  isTabFocused: boolean

  unityLikeControlsEnabled: boolean
  unityLikeControlsCameraSpeed: number

  isMiningEnabled: boolean
  isAparupaVideoEnabled: boolean
  isAparupaVideoPopupVisible: boolean
  joystickRoot: HTMLElement | null
  jumpButtonRoot: HTMLElement | null

  // this represents the _id of the showcase trigger area that was clicked
  debug_clickedShowcaseTriggerArea: string | null
  isCharacterRefReady: boolean
  characterRef: React.MutableRefObject<CharacterRef | null>

  debug_reFetchGroupData_forStore: string

  isOnDanceFloor: boolean
  hideJoystickAndJumpButton: () => void
  showJoystickAndJumpButton: () => void
}

const characterRef =
  createRef<CharacterRef>() as MutableRefObject<CharacterRef | null>
characterRef.current = null

export const genericStore = create<GenericZustandState>((set, get) => ({
  dpr: 0.8,
  // dpr: 0.3,
  defaultDpr: 0.8,
  // defaultDpr: 0.3,
  effectsDpr: 1.2,
  // effectsDpr: 0.3,

  isTutorialEnabled: false,
  setIsTutorialEnabled: (enabled: boolean) => set({ isTutorialEnabled: enabled }),
  moveToNextTutorialDialog: false,
  setMoveToNextTutorialDialog: (enabled: boolean) => set({ moveToNextTutorialDialog: enabled }),
  currentTutorialDialogId: null,
  setCurrentTutorialDialogId: (dialogId: string | null) => set({ currentTutorialDialogId: dialogId }),
  isTutorialNPCActive: false,
  isDebugMode: false,
  setIsDebugMode: (debug: boolean) => set({ isDebugMode: debug }),

  isBuildingLoading: true,
  setIsBuildingLoading: (loading: boolean) =>
    set({ isBuildingLoading: loading }),

  loading_FetchingGroupDataFromFastapi: false,
  loading_FetchingProductsBySKU: false,
  loading_FetchingDataForInventoryConsole: false,
  loading_initialSpawn: false,
  loading_avatarModelAndAnims: false,

  insideStore: null,
  setInsideStore: (storeName: string | null) => set({ insideStore: storeName }),

  havePortalsCooledDown: true,
  setHavePortalsCooledDown: (cooledDown: boolean) =>
    set({ havePortalsCooledDown: cooledDown }),

  areEffectsEnabled: false,
  setAreEffectsEnabled: (enabled: boolean) =>
    set({ areEffectsEnabled: enabled }),

  isTabFocused: true,

  unityLikeControlsEnabled: false,
  unityLikeControlsCameraSpeed: 0.1,

  isMiningEnabled: true,
  isAparupaVideoEnabled: true,
  isAparupaVideoPopupVisible: true,

  joystickRoot: null,
  jumpButtonRoot: null,

  debug_clickedShowcaseTriggerArea: null,
  isCharacterRefReady: false,
  characterRef,

  debug_reFetchGroupData_forStore: '',

  isOnDanceFloor: false,
  hideJoystickAndJumpButton: () => {
    get().joystickRoot?.style.setProperty('display', 'none')
    get().jumpButtonRoot?.style.setProperty('display', 'none')
  },
  showJoystickAndJumpButton: () => {
    get().joystickRoot?.style.setProperty('display', 'block')
    get().jumpButtonRoot?.style.setProperty('display', 'block')
  },
}))

export const GlobalStateContextProvider = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  const {
    loading_FetchingGroupDataFromFastapi,
    loading_FetchingProductsBySKU,
    loading_FetchingDataForInventoryConsole,
    loading_initialSpawn,
    loading_avatarModelAndAnims,
  } = genericStore(
    useShallow((state) => ({
      loading_FetchingGroupDataFromFastapi:
        state.loading_FetchingGroupDataFromFastapi,
      loading_FetchingProductsBySKU: state.loading_FetchingProductsBySKU,
      loading_FetchingDataForInventoryConsole:
        state.loading_FetchingDataForInventoryConsole,
      loading_initialSpawn: state.loading_initialSpawn,
      loading_avatarModelAndAnims: state.loading_avatarModelAndAnims,
    })),
  )

  useEffect(() => {
    if (
      loading_FetchingGroupDataFromFastapi ||
      loading_FetchingProductsBySKU ||
      loading_FetchingDataForInventoryConsole ||
      loading_initialSpawn ||
      loading_avatarModelAndAnims
    ) {
      genericStore.setState({ isBuildingLoading: true })
    } else {
      genericStore.setState({ isBuildingLoading: false })
    }
  }, [
    loading_FetchingGroupDataFromFastapi,
    loading_FetchingProductsBySKU,
    loading_FetchingDataForInventoryConsole,
    loading_initialSpawn,
    loading_avatarModelAndAnims,
  ])

  const hasStartButtonBeenPressed = HUDStore(
    (state) => state.hasStartButtonBeenPressed,
  )
  useEffect(() => {
    if (hasStartButtonBeenPressed) {
      genericStore.setState({ loading_initialSpawn: true })
    }
  }, [hasStartButtonBeenPressed])

  // const isAparupaVideoPopupVisible = genericStore((state) => state.isAparupaVideoPopupVisible)
  // useEffect(() => {
  //   if (!isAparupaVideoPopupVisible) {
  //     SoundsStore.getState().backgroundSoundRef.current?.play()
  //   }
  // }, [isAparupaVideoPopupVisible])

  useEffect(() => {
    const handleTabFocus = () => {
      genericStore.setState({ isTabFocused: true })
    }

    const handleTabBlur = () => {
      genericStore.setState({ isTabFocused: false })
    }

    // Add event listeners when the component mounts
    window.addEventListener('focus', handleTabFocus)
    window.addEventListener('blur', handleTabBlur)

    // Remove event listeners when the component unmounts
    return () => {
      window.removeEventListener('focus', handleTabFocus)
      window.removeEventListener('blur', handleTabBlur)
    }
  }, [])

  return (
    <GlobalStateContext.Provider value={{}}>
      {children}
    </GlobalStateContext.Provider>
  )
}
