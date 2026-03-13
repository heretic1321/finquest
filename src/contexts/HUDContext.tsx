import { createContext, useEffect } from 'react'

import Cookies from 'js-cookie'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import { PlayerConfigStore } from '@client/components/Character'

import { GesturesAndDeviceStore } from './GesturesAndDeviceContext'
import { genericStore } from './GlobalStateContext'
import { InventoryConsoleHUDStore } from './InventoryConsoleHUDContext'
import { NetworkingStore } from './NetworkingContext'

export type StoreExitRequest = {
  nameOfStoreToExit: string
  exitingVia: 'portal' | 'gate'
  nameOfStoreIfExitingViaPortal?: string
  locationToTeleport?: string
}

export type HUDContextType = {}

export const HUDContext = createContext<HUDContextType>({})

interface HUDZustandState {
  showChatbox: boolean
  setShowChatbox: (x: boolean) => void
  showJoystick: boolean
  setShowJoystick: (x: boolean) => void
  jumpButtonTapped: boolean
  setJumpButtonTapped: (x: boolean) => void
  hasStartButtonBeenPressed: boolean
  setHasStartButtonBeenPressed: (x: boolean) => void
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
  presentationModeActiveGroupIndex: number
  setPresentationModeActiveGroupIndex: (x: number) => void
  isShowcaseMode: boolean
  setIsShowcaseMode: (x: boolean) => void
  showcaseActiveItemIndex: number
  setShowcaseActiveItemIndex: (x: number) => void
  showcaseActiveGroupIndex: number
  setShowcaseActiveGroupIndex: (x: number) => void
  isShowcaseModeShuttingDown: boolean
  setIsShowcaseModeShuttingDown: (x: boolean) => void
  isShowcaseModeStartingUp: boolean
  setIsShowcaseModeStartingUp: (x: boolean) => void
  isTransitionToShowcaseModeComplete: boolean
  setIsTransitionToShowcaseModeComplete: (x: boolean) => void
  isTransitionFromShowcaseModeComplete: boolean
  setIsTransitionFromShowcaseModeComplete: (x: boolean) => void
  isSelectedShowcaseTranslatingPrevious: boolean
  setIsSelectedShowcaseTranslatingPrevious: (x: boolean) => void
  isSelectedShowcaseTranslatingNext: boolean
  setIsSelectedShowcaseTranslatingNext: (x: boolean) => void
  isShowCaseDetailsPanelExpanded: boolean
  setIsShowCaseDetailsPanelExpanded: (x: boolean) => void
  selectedPanel: 'cart' | 'details'
  setSelectedPanel: (x: 'cart' | 'details') => void
  showTreasureHuntScreen: boolean
  setShowTreasureHuntScreen: (x: boolean) => void
  showHowToPlayScreen: boolean
  setShowHowToPlayScreen: (x: boolean) => void
  showTreasureHuntRewardScreen: boolean
  setShowTreasureHuntRewardScreen: (x: boolean) => void
  showDialogScreen: boolean
  setShowDialogScreen: (x: boolean) => void
  showCarousel: boolean
  setShowCarousel: (x: boolean) => void
  showCart: boolean
  setShowCart: (x: boolean) => void
  tutorialMode: boolean
  setTutorialMode: (x: boolean) => void
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (x: boolean) => void
  currentTreasureHuntTab: 'treasure' | 'rewards'
  setCurrentTreasureHuntTab: (x: 'treasure' | 'rewards') => void
  showNotLoggedInModal: boolean
  setShowNotLoggedInModal: (x: boolean) => void
  currentHowToPlayTab: 'controls' | 'treasure' | 'rewards' | 'onboarding' | null
  setCurrentHowToPlayTab: (
    x: 'controls' | 'treasure' | 'rewards' | 'onboarding' | null,
  ) => void
  isEnterStorePromptShown: boolean
  setIsEnterStorePromptShown: (x: boolean) => void
  enterStorePromptStoreName: string
  setEnterStorePromptStoreName: (x: string) => void
  isExitStorePromptShown: boolean
  setIsExitStorePromptShown: (x: boolean) => void
  exitStorePromptStoreName: string
  setExitStorePromptStoreName: (x: string) => void
  storeRequestedToEnter: string
  setStoreRequestedToEnter: (x: string) => void
  storeRequestedToExit: StoreExitRequest | null
  setStoreRequestedToExit: (x: StoreExitRequest | null) => void
  isInventoryConsolePromptShown: boolean
  setIsInventoryConsolePromptShown: (x: boolean) => void
  exitingInventoryConsole: boolean
  setExitingInventoryConsole: (x: boolean) => void
  isOpenShowcasePromptShown: boolean
  setIsOpenShowcasePromptShown: (x: boolean) => void
  groupIndexForOpenShowcasePrompt: number
  setGroupIndexForOpenShowcasePrompt: (x: number) => void
  isOpenShowcasePromptClicked: boolean
  setIsOpenShowcasePromptClicked: (x: boolean) => void
  isHighPolyModelLoading: boolean
  setIsHighPolyModelLoading: (x: boolean) => void

  showGamizeMenu: boolean
  setShowGamizeMenu: (x: boolean) => void

  handleLogout: () => void

  showEnterPortalPrompt: string | null
  enterPortalPromptActivated: string | null

  isStartMiningPromptShown: boolean

  showNotLoggedInWhileCollectingMinedStuff: boolean

  isRewardRedeemMachinePromptShown: boolean
  isRedeemMachineScreenUIVisible: boolean

  isLeaderboardMachinePromptShown: boolean
  isLeaderboardMachineScreenUIVisible: boolean

  showMeteorLoginRegister: boolean
  setShowMeteorLoginRegister: (x: boolean) => void

  showMeteorRushIntro: boolean
  setShowMeteorRushIntro: (x: boolean) => void
  isTutorialPromptShown: boolean
  setIsTutorialPromptShown: (x: boolean) => void
  startTutorialUIClicked: boolean
}

export const HUDStore = create<HUDZustandState>((set) => ({
  showChatbox: false,
  setShowChatbox: (x) => set({ showChatbox: x }),
  showJoystick: true,
  setShowJoystick: (x) => set({ showJoystick: x }),
  jumpButtonTapped: false,
  setJumpButtonTapped: (x) => set({ jumpButtonTapped: x }),
  hasStartButtonBeenPressed: false,
  setHasStartButtonBeenPressed: (x) => set({ hasStartButtonBeenPressed: x }),
  // To understand presentation/showcase mode, please read the following:
  // PresentationAndShowcaseMode.md in client/docs
  isPresentationMode: false,
  setIsPresentationMode: (x) => set({ isPresentationMode: x }),
  // Toggling boolean flags to know if the presentation mode is shutting down or starting up
  isPresentationModeShuttingDown: false,
  setIsPresentationModeShuttingDown: (x) =>
    set({ isPresentationModeShuttingDown: x }),
  isPresentationModeStartingUp: false,
  setIsPresentationModeStartingUp: (x) =>
    set({ isPresentationModeStartingUp: x }),
  isTransitionToPresentationModeComplete: false,
  setIsTransitionToPresentationModeComplete: (x) =>
    set({ isTransitionToPresentationModeComplete: x }),
  isTransitionFromPresentationModeComplete: false,
  setIsTransitionFromPresentationModeComplete: (x) =>
    set({ isTransitionFromPresentationModeComplete: x }),
  // When presentation mode is active, this state variable will be used to store the currently selected jewellery group's index in the total data
  presentationModeActiveGroupIndex: -1,
  setPresentationModeActiveGroupIndex: (x) =>
    set({ presentationModeActiveGroupIndex: x }),
  isShowcaseMode: false,
  setIsShowcaseMode: (x) => set({ isShowcaseMode: x }),

  // When presentation mode is enabled and the user selects an item to showcase then this state variable will be used
  // to store the currently selected item's index in the showcase group
  // When nothing is selected, this is set to -1. NOTE: There can be many groups, and each
  // group has many items. This state variable is used to store the currently selected item,
  // which is a part of the currently selected group
  showcaseActiveItemIndex: -1,
  setShowcaseActiveItemIndex: (x) => set({ showcaseActiveItemIndex: x }),

  // When presentation mode is enabled and the user selects an item to showcase then this state variable will be used
  // to store the currently selected item's group's index in the showcase
  // When nothing is selected, this is set to -1. NOTE: There can be many groups, and each
  // group has many items. This state variable is used to store the currently selected group
  showcaseActiveGroupIndex: -1,
  setShowcaseActiveGroupIndex: (x) => set({ showcaseActiveGroupIndex: x }),
  isShowcaseModeShuttingDown: false,
  setIsShowcaseModeShuttingDown: (x) => set({ isShowcaseModeShuttingDown: x }),
  isShowcaseModeStartingUp: false,
  setIsShowcaseModeStartingUp: (x) => set({ isShowcaseModeStartingUp: x }),
  isTransitionToShowcaseModeComplete: false,
  setIsTransitionToShowcaseModeComplete: (x) =>
    set({ isTransitionToShowcaseModeComplete: x }),
  isTransitionFromShowcaseModeComplete: false,
  setIsTransitionFromShowcaseModeComplete: (x) =>
    set({ isTransitionFromShowcaseModeComplete: x }),
  isSelectedShowcaseTranslatingPrevious: false,
  setIsSelectedShowcaseTranslatingPrevious: (x) =>
    set({ isSelectedShowcaseTranslatingPrevious: x }),
  isSelectedShowcaseTranslatingNext: false,
  setIsSelectedShowcaseTranslatingNext: (x) =>
    set({ isSelectedShowcaseTranslatingNext: x }),

  // On smaller screens, when the showcase details panel is expanded, we need to hide the carousel
  isShowCaseDetailsPanelExpanded: false,
  setIsShowCaseDetailsPanelExpanded: (x) =>
    set({ isShowCaseDetailsPanelExpanded: x }),

  // This state variable is used to store the currently selected panel in the showcase mode
  selectedPanel: 'details',
  setSelectedPanel: (x: 'cart' | 'details') => set({ selectedPanel: x }),
  showTreasureHuntScreen: false,
  setShowTreasureHuntScreen: (x) => set({ showTreasureHuntScreen: x }),
  showHowToPlayScreen: false,
  setShowHowToPlayScreen: (x) => set({ showHowToPlayScreen: x }),
  showTreasureHuntRewardScreen: false,
  setShowTreasureHuntRewardScreen: (x) =>
    set({ showTreasureHuntRewardScreen: x }),
  showDialogScreen: false,
  setShowDialogScreen: (x) => set({ showDialogScreen: x }),
  showCarousel: true,
  setShowCarousel: (x) => set({ showCarousel: x }),
  showCart: false,
  setShowCart: (x) => set({ showCart: x }),
  tutorialMode: false,
  setTutorialMode: (x) => set({ tutorialMode: x }),
  isMobileMenuOpen: false,
  setIsMobileMenuOpen: (x) => set({ isMobileMenuOpen: x }),
  currentTreasureHuntTab: 'treasure',
  setCurrentTreasureHuntTab: (x: 'treasure' | 'rewards') =>
    set({ currentTreasureHuntTab: x }),
  showNotLoggedInModal: false,
  setShowNotLoggedInModal: (x) => set({ showNotLoggedInModal: x }),
  currentHowToPlayTab: 'controls',
  setCurrentHowToPlayTab: (x) => set({ currentHowToPlayTab: x }),
  isEnterStorePromptShown: false,
  setIsEnterStorePromptShown: (x) => set({ isEnterStorePromptShown: x }),
  enterStorePromptStoreName: '',
  setEnterStorePromptStoreName: (x) => set({ enterStorePromptStoreName: x }),
  isExitStorePromptShown: false,
  setIsExitStorePromptShown: (x) => set({ isExitStorePromptShown: x }),
  exitStorePromptStoreName: '',
  setExitStorePromptStoreName: (x) => set({ exitStorePromptStoreName: x }),
  storeRequestedToEnter: '',
  setStoreRequestedToEnter: (x) => set({ storeRequestedToEnter: x }),
  storeRequestedToExit: null,
  setStoreRequestedToExit: (x) => set({ storeRequestedToExit: x }),
  isInventoryConsolePromptShown: false,
  setIsInventoryConsolePromptShown: (x) => set({ isInventoryConsolePromptShown: x }),
  exitingInventoryConsole: false,
  setExitingInventoryConsole: (x) => set({ exitingInventoryConsole: x }),
  isOpenShowcasePromptShown: false,
  setIsOpenShowcasePromptShown: (x) => set({ isOpenShowcasePromptShown: x }),
  groupIndexForOpenShowcasePrompt: -1,
  setGroupIndexForOpenShowcasePrompt: (x) => set({ groupIndexForOpenShowcasePrompt: x }),
  isOpenShowcasePromptClicked: false,
  setIsOpenShowcasePromptClicked: (x) => set({ isOpenShowcasePromptClicked: x }),
  isHighPolyModelLoading: true,
  setIsHighPolyModelLoading: (x) => set({ isHighPolyModelLoading: x }),

  showGamizeMenu: false,
  setShowGamizeMenu: (x) => set({ showGamizeMenu: x }),

  handleLogout: () => {
    Cookies.remove('access_token', { path: '' })
    localStorage.removeItem('hiddenItems')
    localStorage.removeItem('avatarPath')
    localStorage.removeItem('rpmUserId')
    NetworkingStore.getState().room?.leave()
    window.location.reload()
  },

  showEnterPortalPrompt: null,
  enterPortalPromptActivated: null,

  isStartMiningPromptShown: false,

  showNotLoggedInWhileCollectingMinedStuff: false,

  isRewardRedeemMachinePromptShown: false,
  isRedeemMachineScreenUIVisible: false,

  isLeaderboardMachinePromptShown: false,
  isLeaderboardMachineScreenUIVisible: false,

  showMeteorLoginRegister: false,
  setShowMeteorLoginRegister: (x) => {
    PlayerConfigStore.getState().isPlayerParalysedRef.current = x
    if (x === true) {
      genericStore.getState().hideJoystickAndJumpButton()
    } else {
      if(!genericStore.getState().isTutorialEnabled && GesturesAndDeviceStore.getState().isTouchDevice){
        genericStore.getState().showJoystickAndJumpButton()
      }
    }
    set({ showMeteorLoginRegister: x })
  },

  showMeteorRushIntro: true,
  setShowMeteorRushIntro: (x) => {
    if (x === true) {
      if (GesturesAndDeviceStore.getState().isTouchDevice) {
        genericStore.getState().hideJoystickAndJumpButton()
      }
    } else {
      if(!genericStore.getState().isTutorialEnabled && GesturesAndDeviceStore.getState().isTouchDevice){
        genericStore.getState().showJoystickAndJumpButton()
      }
      PlayerConfigStore.getState().isPlayerParalysedRef.current = false
    }
    set({ showMeteorRushIntro: x })
  },
  isTutorialPromptShown: false,
  setIsTutorialPromptShown: (x) => set({ isTutorialPromptShown: x }),
  startTutorialUIClicked: false,
}))

export const HUDContextProvider = ({ children }: React.PropsWithChildren) => {
  const { showJoystick } = HUDStore(
    useShallow((state) => ({
      showJoystick: state.showJoystick,
    })),
  )

  useEffect(() => {
    if (showJoystick) {
      const joystick = document.getElementById('joystick')
      if (joystick) joystick.classList.remove('hidden')
    } else {
      const joystick = document.getElementById('joystick')
      if (joystick) joystick.classList.add('hidden')
    }
  }, [showJoystick])

  const isPresentationMode = HUDStore((state) => state.isPresentationMode)
  const ICIsPresentationMode = InventoryConsoleHUDStore(
    (state) => state.isPresentationMode,
  )
  useEffect(() => {
    if (isPresentationMode || ICIsPresentationMode) {
      genericStore.setState({ dpr: genericStore.getState().effectsDpr })
    } else {
      genericStore.setState({ dpr: genericStore.getState().defaultDpr })
    }
  }, [isPresentationMode, ICIsPresentationMode])

  // useEffect(() => {
  //   const started = isShowcaseMode
  //   const ended = (
  //     isShowcaseMode == true &&
  //     isShowcaseModeStartingUp == false &&
  //     isShowcaseModeShuttingDown == true
  //   )

  //   if (ended) {
  //     genericStore.setState({ dpr: genericStore.getState().defaultDpr })
  //   } else if (started) genericStore.setState({ dpr: genericStore.getState().effectsDpr })
  // }, [
  //   isShowcaseMode,
  //   isShowcaseModeStartingUp,
  //   isShowcaseModeShuttingDown,
  // ])

  return <HUDContext.Provider value={{}}>{children}</HUDContext.Provider>
}
