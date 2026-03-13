import { useEffect, useMemo, useRef, useState } from 'react'
import { PlayerConfigStore } from '@client/components/Character'
import {
  MeteorManagerStore,
  MeteorMiningState,
  RewardMachineMode,
} from '@client/components/MeteorMining/MeteorManager'
import Button from '@client/components/shared/Button'
import { SoundsStore } from '@client/components/Sounds'
import {
  AiFillCloseCircle,
  AiOutlineLoading3Quarters,
  // AiFillTrophy,
  AiOutlineShoppingCart,
} from 'react-icons/ai'
import { BsFullscreen, BsFullscreenExit } from 'react-icons/bs'
import { FaGamepad, FaPlay } from 'react-icons/fa6'
import { GoMute, GoUnmute } from 'react-icons/go'
import {
  HiChatAlt2,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi'
import {
  IoBody,
  IoCloseSharp,
  IoInformationSharp,
  IoLogOut,
} from 'react-icons/io5'
import { MdTouchApp } from 'react-icons/md'
import { useShallow } from 'zustand/react/shallow'

import GradientBorder from '@client/components/GradientBorder'
import { BuildingManagerLoadingScreen } from '@client/components/HUD/BuildingManagerLoadingScreen'
import HUDCart from '@client/components/HUD/Cart/HUDCart'
import NotLoggedInModal from '@client/components/HUD/Cart/NotLoggedInModal'
import Chatbox from '@client/components/HUD/Chatbox.js'
import HowToPlay from '@client/components/HUD/HowToPlay'
import JumpButton from '@client/components/HUD/JumpButton.js'
import LoginScreen from '@client/components/HUD/LoginScreen'
import PresentationMode from '@client/components/HUD/PresentationMode'
import StartButton from '@client/components/HUD/StartButton.js'
// import TreasureHunt from '@client/components/HUD/TreasureHunt'
import TreasureHuntReward from '@client/components/HUD/TreasureHunt/TreasureHuntReward'
import InventoryConsoleDetails from '@client/components/InventoryConsole/InventoryConsoleDetails'
import ReadyPlayerMe from '@client/components/ReadyPlayerMe'
import { AuthAPIStore } from '@client/contexts/AuthContext'
import { AvatarStore } from '@client/contexts/AvatarAppearanceContext'
import { CollectionStore } from '@client/contexts/CollectionContext'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { InventoryConsoleHUDStore } from '@client/contexts/InventoryConsoleHUDContext'
import { NetworkingStore } from '@client/contexts/NetworkingContext'
import { vrStore } from '@client/contexts/VRStateContext'
import { trackEvent } from '@client/utils/api'
import { getUserID } from '@client/utils/helperFunctions'
import AvatarSelectionMenu from './AvatarSelectionMenu'
import EnterVRButton from './EnterVRButton'
import GamizeHUD from './Gamize/GamizeIndex'
import LeaderboardMachineScreenUI from './LeaderboardMachineScreenUI'
import MeteorInventoryOnScreen from './MeteorInventoryOnScreen'
import MeteorLoginRegister from './MeteorLoginRegister'
import MeteorRushIntro from './MeteorRushIntroUI'
import RedeemingMachineScreenUI from './RedeemMachineScreenUI'
import InventoryConsoleHUD from '../InventoryConsole/InventoryConsoleHUD'
import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { DigiGoldHUDStore } from '@client/contexts/DigiGoldHUDContext'
import DigiGoldHUD from '../DigiGold/DigiGoldHUD'
export default function HUD() {
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)
  const isLandscape = GesturesAndDeviceStore((state) => state.isLandscape)
  const hasAvatarBeenSelected = AvatarStore(
    (state) => state.hasAvatarBeenSelected,
  )
  const setAvatarData = AvatarStore((state) => state.setAvatarData)
  const players = NetworkingStore((state) => state.players)
  const { isLoggedIn, isGuest } = AuthAPIStore(
    useShallow((state) => ({
      isLoggedIn: state.isLoggedIn,
      isGuest: state.isGuest,
    })),
  )
  const showMeteorLoginRegister = HUDStore(
    (state) => state.showMeteorLoginRegister,
  )

  // a ref to store the event listener for the keydown event to enter a store
  // so we can remove this event listener later on
  const fKeydownEventListenerRef = useRef<
    ((this: Document, ev: KeyboardEvent) => any) | null
  >(null)
  const pKeydownEventListenerRef = useRef<
    ((this: Document, ev: KeyboardEvent) => any) | null
  >(null)
  const eKeydownEventListenerRef = useRef<
  ((this: Document, ev: KeyboardEvent) => any) | null
>(null)
  const tKeydownEventListenerRef = useRef<
  ((this: Document, ev: KeyboardEvent) => any) | null
  >(null)
  const bKeydownEventListenerRef = useRef<
  ((this: Document, ev: KeyboardEvent) => any) | null
  >(null)

  /**
   *
   * Presentation mode is when the user is interacting with a 3D model or a group of items of interest.
   * During presentation mode, user can't move around and the user doesn't have control of the camera.
   * Camera is locked at a transform which are defined in the trigger area config files.
   * A specific UI is shown during presentation mode.
   * All other HUD elements are also removed during presentation mode
   * For more information, see the file : PresentationAndShowcaseMode.md
   */
  const {
    showChatbox,
    hasStartButtonBeenPressed,
    isPresentationMode,
    isPresentationModeShuttingDown,
    isPresentationModeStartingUp,
    showTreasureHuntScreen,
    showHowToPlayScreen,
    showTreasureHuntRewardScreen,
    showDialogScreen,
    showCart,
    setShowCart,
    setShowChatbox,
    setShowTreasureHuntScreen,
    setShowHowToPlayScreen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    showNotLoggedInModal,

    isEnterStorePromptShown,
    setIsEnterStorePromptShown,
    enterStorePromptStoreName,
    setEnterStorePromptStoreName,
    setStoreRequestedToEnter,

    isExitStorePromptShown,
    setIsExitStorePromptShown,
    exitStorePromptStoreName,
    setStoreRequestedToExit,
    isInventoryConsolePromptShown,
    setExitingInventoryConsole,
    isOpenShowcasePromptShown,
    setIsOpenShowcasePromptClicked,
    setExitStorePromptStoreName,

    isHighPolyModelLoading,
    showcaseActiveGroupIndex,
    showcaseActiveItemIndex,

    isShowcaseMode,

    setIsSelectedShowcaseTranslatingNext,
    setIsSelectedShowcaseTranslatingPrevious,

    setShowGamizeMenu,
    showEnterPortalPrompt,

    isStartMiningPromptShown,

    showNotLoggedInWhileCollectingMinedStuff,
    isTutorialPromptShown,
  } = HUDStore(
    useShallow((state) => ({
      showChatbox: state.showChatbox,
      hasStartButtonBeenPressed: state.hasStartButtonBeenPressed,
      isPresentationMode: state.isPresentationMode,
      isPresentationModeShuttingDown: state.isPresentationModeShuttingDown,
      isPresentationModeStartingUp: state.isPresentationModeStartingUp,
      showTreasureHuntScreen: state.showTreasureHuntScreen,
      showHowToPlayScreen: state.showHowToPlayScreen,
      showTreasureHuntRewardScreen: state.showTreasureHuntRewardScreen,
      showDialogScreen: state.showDialogScreen,
      showCart: state.showCart,
      setShowCart: state.setShowCart,
      setShowChatbox: state.setShowChatbox,
      setShowTreasureHuntScreen: state.setShowTreasureHuntScreen,
      setShowHowToPlayScreen: state.setShowHowToPlayScreen,
      isMobileMenuOpen: state.isMobileMenuOpen,
      setIsMobileMenuOpen: state.setIsMobileMenuOpen,
      showNotLoggedInModal: state.showNotLoggedInModal,

      isEnterStorePromptShown: state.isEnterStorePromptShown,
      setIsEnterStorePromptShown: state.setIsEnterStorePromptShown,
      enterStorePromptStoreName: state.enterStorePromptStoreName,
      setEnterStorePromptStoreName: state.setEnterStorePromptStoreName,
      setStoreRequestedToEnter: state.setStoreRequestedToEnter,

      isExitStorePromptShown: state.isExitStorePromptShown,
      setIsExitStorePromptShown: state.setIsExitStorePromptShown,
      exitStorePromptStoreName: state.exitStorePromptStoreName,
      setStoreRequestedToExit: state.setStoreRequestedToExit,
      isInventoryConsolePromptShown: state.isInventoryConsolePromptShown,
      setExitingInventoryConsole: state.setExitingInventoryConsole,
      isOpenShowcasePromptShown: state.isOpenShowcasePromptShown,
      setIsOpenShowcasePromptClicked: state.setIsOpenShowcasePromptClicked,
      setExitStorePromptStoreName: state.setExitStorePromptStoreName,

      isHighPolyModelLoading: state.isHighPolyModelLoading,
      showcaseActiveGroupIndex: state.showcaseActiveGroupIndex,
      showcaseActiveItemIndex: state.showcaseActiveItemIndex,

      isShowcaseMode: state.isShowcaseMode,

      setIsSelectedShowcaseTranslatingNext:
        state.setIsSelectedShowcaseTranslatingNext,
      setIsSelectedShowcaseTranslatingPrevious:
        state.setIsSelectedShowcaseTranslatingPrevious,

      setShowGamizeMenu: state.setShowGamizeMenu,

      showEnterPortalPrompt: state.showEnterPortalPrompt,
      enterPortalPromptActivated: state.enterPortalPromptActivated,

      isStartMiningPromptShown: state.isStartMiningPromptShown,
      showNotLoggedInWhileCollectingMinedStuff:
        state.showNotLoggedInWhileCollectingMinedStuff,
      isTutorialPromptShown: state.isTutorialPromptShown,
    })),
  )
  const {
    isDigiGoldMachinePromptShown,
    isDigiGoldMachinePromptClicked,
    setIsDigiGoldMachinePromptClicked,
    isDigiGoldPresentationMode,
    isDigiGoldPresentationModeStartingUp,
    isDigiGoldVisible,
  } = DigiGoldHUDStore(
    useShallow((state) => ({
      isDigiGoldMachinePromptShown: state.isDigiGoldMachinePromptShown,
      isDigiGoldMachinePromptClicked: state.isDigiGoldMachinePromptClicked,
      setIsDigiGoldMachinePromptClicked:
        state.setIsDigiGoldMachinePromptClicked,
      isDigiGoldPresentationMode: state.isDigiGoldPresentationMode,
      isDigiGoldPresentationModeStartingUp:
        state.isDigiGoldPresentationModeStartingUp,
      isDigiGoldVisible: state.isDigiGoldVisible,
    })),
  )
  const isTutorialEnabled = genericStore((state) => state.isTutorialEnabled)
  const currentTutorialDialogId = genericStore((state) => state.currentTutorialDialogId)
  const breakpoint = GesturesAndDeviceStore((state) => state.breakpoint)
  const isVRSessionSupported = vrStore.getState().isVRSessionSupported
  const insideStore = genericStore((state) => state.insideStore)

  const leaderboardMachineMode = MeteorManagerStore(
    (state) => state.leaderboardMachineMode,
  )
  const isRedeemMachineScreenUIVisible = HUDStore(
    (state) => state.isRedeemMachineScreenUIVisible,
  )
  const isLeaderboardMachineScreenUIVisible = HUDStore(
    (state) => state.isLeaderboardMachineScreenUIVisible,
  )

  const inventoryConsoleHUDContext = InventoryConsoleHUDStore(
    useShallow((state) => ({
      isPresentationMode: state.isPresentationMode,
      isDetailMode: state.isDetailMode,
      isPresentationModeStartingUp: state.isPresentationModeStartingUp,
      isPresentationModeShuttingDown: state.isPresentationModeShuttingDown,
    })),
  )

  const isBuildingLoading = genericStore((state) => state.isBuildingLoading)

  useEffect(() => {
    if (showHowToPlayScreen) setShowTreasureHuntScreen(false)
  }, [showHowToPlayScreen])

  useEffect(() => {
    if (showTreasureHuntScreen) setShowHowToPlayScreen(false)
  }, [showTreasureHuntScreen])

  const numPlayersOnline = useMemo(() => {
    if (
      players.length > 0 &&
      hasStartButtonBeenPressed &&
      !isPresentationMode &&
      !inventoryConsoleHUDContext.isPresentationMode &&
      !showTreasureHuntRewardScreen &&
      !showTreasureHuntScreen &&
      !showHowToPlayScreen &&
      !isDigiGoldVisible
    ) {
      return (
        <>
          <div className='inline-block rounded-md border-[#C599FFCF] bg-[#17082FB2] px-3 py-2 text-sm text-white'>
            <div>
              {`${players.length} player${
                players.length > 1 ? 's' : ''
              } online`}
            </div>
          </div>
        </>
      )
    }

    return null
  }, [
    players,
    hasStartButtonBeenPressed,
    isPresentationMode,
    inventoryConsoleHUDContext.isPresentationMode,
    showTreasureHuntRewardScreen,
    showTreasureHuntScreen,
    showHowToPlayScreen,
    isDigiGoldVisible,
  ])

  // const showTreasureHuntScreenComponent = useMemo(() => {
  //   if (
  //     hasStartButtonBeenPressed &&
  //     !isPresentationMode &&
  //     !inventoryConsoleHUDContext.isPresentationMode
  //   )
  //     return <TreasureHunt />
  //   else return null
  // }, [
  //   hasStartButtonBeenPressed,
  //   isPresentationMode,
  //   inventoryConsoleHUDContext.isPresentationMode,
  //   showTreasureHuntScreen,
  // ])

  const showHowToPlayScreenComponent = useMemo(() => {
    if (
      !hasStartButtonBeenPressed ||
      isPresentationMode ||
      inventoryConsoleHUDContext.isPresentationMode
    )
      return null

    return <HowToPlay />
  }, [
    hasStartButtonBeenPressed,
    isPresentationMode,
    inventoryConsoleHUDContext.isPresentationMode,
    showHowToPlayScreen,
    showTreasureHuntScreen,
  ])

  const isMuted = SoundsStore((state) => state.isMuted)
  const muteUnmuteButtonDesktop = useMemo(() => {
    return (
      !showCart &&
      !isPresentationMode &&
      !inventoryConsoleHUDContext.isPresentationMode &&
      hasStartButtonBeenPressed &&
      !isTouchDevice && (
        <div
          onClick={() => {
            SoundsStore.getState().playClickSoundOnce()
            SoundsStore.getState().toggleMuted()
          }}
          className='skewed hidden cursor-pointer items-center justify-center rounded-md border border-[#C599FFCF] bg-[#17082FB2] p-3 md:flex'
        >
          <span>
            {SoundsStore.getState().isMuted ? (
              <GoMute className='mx-auto my-auto h-6 w-6 fill-white' />
            ) : (
              <GoUnmute className='mx-auto my-auto h-6 w-6 fill-white' />
            )}
          </span>
        </div>
      )
    )
  }, [
    showCart,
    isPresentationMode,
    inventoryConsoleHUDContext.isPresentationMode,
    hasStartButtonBeenPressed,
    isTouchDevice,
    isMuted,
  ])

  const muteUnmuteButtonMobile = useMemo(() => {
    return (
      hasStartButtonBeenPressed && (
        <div
          className='flex h-[180px] flex-col items-center justify-center rounded-xl border border-[#C599FFCF] short:h-[80px]'
          onClick={() => {
            SoundsStore.getState().playClickSoundOnce()
            SoundsStore.getState().toggleMuted()
          }}
        >
          <Button className='h-8 w-8 shrink-0 rounded-full bg-white short:h-5 short:w-5'>
            {SoundsStore.getState().isMuted ? (
              <GoMute className='mx-auto fill-[#17082FB2] stroke-[#17082FB2] stroke-2' />
            ) : (
              <GoUnmute className='mx-auto fill-[#17082FB2] stroke-[#17082FB2] stroke-2' />
            )}
          </Button>
          <p className='mt-4 text-xl text-white short:mt-1 short:text-lg'>
            {isMuted ? 'Unmute' : 'Mute'}
          </p>
        </div>
      )
    )
  }, [hasStartButtonBeenPressed, isMuted])

  const showStartButton = useMemo(() => {
    if (
      !hasStartButtonBeenPressed &&
      hasAvatarBeenSelected &&
      (isLoggedIn || isGuest)
    )
      return <StartButton />
    else return null
  }, [hasStartButtonBeenPressed, hasAvatarBeenSelected, isLoggedIn, isGuest])

  const showChatboxComponent = useMemo(() => {
    if (
      hasStartButtonBeenPressed &&
      !isPresentationMode &&
      !inventoryConsoleHUDContext.isPresentationMode &&
      !isTutorialEnabled &&
      !isLeaderboardMachineScreenUIVisible &&
      !isRedeemMachineScreenUIVisible &&
      !isDigiGoldVisible
    )
      return <Chatbox />
    else return null
  }, [
    hasStartButtonBeenPressed,
    isPresentationMode,
    inventoryConsoleHUDContext.isPresentationMode,
    isTutorialEnabled,
    isLeaderboardMachineScreenUIVisible,
    isRedeemMachineScreenUIVisible,
    isDigiGoldVisible,
  ])

  const showCartComponent = useMemo(() => {
    if (
      hasStartButtonBeenPressed &&
      !isPresentationMode &&
      !inventoryConsoleHUDContext.isPresentationMode &&
      !isTutorialEnabled &&
      !isLeaderboardMachineScreenUIVisible &&
      !isRedeemMachineScreenUIVisible &&
      !isDigiGoldVisible
    )
      return <HUDCart />
    else return null
  }, [
    isLeaderboardMachineScreenUIVisible,
    isRedeemMachineScreenUIVisible,
    hasStartButtonBeenPressed,
    isPresentationMode,
    inventoryConsoleHUDContext.isPresentationMode,
    isTutorialEnabled,
    isDigiGoldVisible,
  ])

  const showEnterVRComponent = useMemo(() => {
    if (
      isVRSessionSupported &&
      hasStartButtonBeenPressed &&
      !isPresentationMode &&
      !inventoryConsoleHUDContext.isPresentationMode &&
      !isDigiGoldVisible
    )
      return <EnterVRButton />
    else return null
  }, [
    isVRSessionSupported,
    hasStartButtonBeenPressed,
    isPresentationMode,
    inventoryConsoleHUDContext.isPresentationMode,
    isDigiGoldVisible,
  ])

  const showJumpButton = useMemo(() => {
    if (
      isTouchDevice &&
      !showChatbox &&
      !showDialogScreen &&
      !showCart &&
      hasStartButtonBeenPressed &&
      !isPresentationMode &&
      !inventoryConsoleHUDContext.isPresentationMode &&
      !showTreasureHuntScreen &&
      !showHowToPlayScreen &&
      !isDigiGoldVisible
    )
      return <JumpButton />
    else return null
  }, [
    isTouchDevice,
    showChatbox,
    showCart,
    hasStartButtonBeenPressed,
    showDialogScreen,
    isPresentationMode,
    inventoryConsoleHUDContext.isPresentationMode,
    showTreasureHuntScreen,
    showHowToPlayScreen,
    isDigiGoldVisible,
  ])

  const showPresentationMode = useMemo(() => {
    if (
      isPresentationMode &&
      !isPresentationModeShuttingDown &&
      !isPresentationModeStartingUp
    )
      return <PresentationMode />
    else return null
  }, [
    isPresentationMode,
    isPresentationModeShuttingDown,
    isPresentationModeStartingUp,
  ])

  const showLoginScreen = useMemo(() => {
    if (!isLoggedIn && !isGuest) return <LoginScreen />
    else return null
  }, [isLoggedIn, isGuest])

  const hasRandomAvatarBeenSelected = AvatarStore(
    (state) => state.hasRandomAvatarBeenSelected,
  )
  const showAvatarSelectionMenu = useMemo(() => {
    if (
      !hasRandomAvatarBeenSelected &&
      !localStorage.getItem('avatarPath') &&
      (isLoggedIn || isGuest)
    ) {
      return <AvatarSelectionMenu />
    }

    if (
      hasRandomAvatarBeenSelected &&
      !hasAvatarBeenSelected &&
      (isLoggedIn || isGuest)
    ) {
      return <ReadyPlayerMe />
    } else {
      return null
    }
  }, [hasAvatarBeenSelected, isLoggedIn, isGuest, hasRandomAvatarBeenSelected])

  // a loading spinner div that comes up in showcase mode when a high poly model is loading
  const highPolyModelLoadingDiv = useMemo(() => {
    if (
      !isHighPolyModelLoading ||
      showcaseActiveGroupIndex === -1 ||
      showcaseActiveItemIndex === -1
    )
      return null
    return (
      <div className='absolute left-1/2 top-[50%] z-[2147483640] flex -translate-x-1/2 items-end justify-center'>
        <div className='flex w-[max-content] cursor-pointer items-center rounded-lg border-[2px] border-[#C599FFCF] bg-[#17082FB2] p-2'>
          <div role='status'>
            <svg
              aria-hidden='true'
              className='h-8 w-8 animate-spin fill-white text-gray-200 dark:text-gray-600'
              viewBox='0 0 100 101'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                fill='currentColor'
              />
              <path
                d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                fill='currentFill'
              />
            </svg>
          </div>
          <div className='sm:text-md ml-2 text-white md:text-xl lg:text-2xl'>
            Loading...
          </div>
        </div>
      </div>
    )
  }, [
    isHighPolyModelLoading,
    showcaseActiveGroupIndex,
    showcaseActiveItemIndex,
  ])

  const enterPortalPrompt = useMemo(() => {
    if (
      isPresentationMode ||
      isPresentationModeStartingUp ||
      isShowcaseMode ||
      inventoryConsoleHUDContext.isPresentationMode ||
      inventoryConsoleHUDContext.isPresentationModeStartingUp ||
      showEnterPortalPrompt == null
    ) {
      if (pKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          pKeydownEventListenerRef.current,
        )
        pKeydownEventListenerRef.current = null
      }

      return null
    }

    if (showEnterPortalPrompt != null) {
      if (pKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          pKeydownEventListenerRef.current,
        )
        pKeydownEventListenerRef.current = null
      }

      const promptActivated = () => {
        SoundsStore.getState().playClickSoundOnce()
        HUDStore.setState({ enterPortalPromptActivated: showEnterPortalPrompt })
        HUDStore.setState({ showEnterPortalPrompt: null })

        if (pKeydownEventListenerRef.current !== null) {
          document.removeEventListener(
            'keydown',
            pKeydownEventListenerRef.current,
          )
          pKeydownEventListenerRef.current = null
        }
      }

      const eventListener = (e: KeyboardEvent) => {
        if (e == null) return
        if (e.key.toLowerCase() === 'p') {
          promptActivated()
        }
      }

      pKeydownEventListenerRef.current = eventListener

      // add an event listener on the keypress of the 'E' key
      document.addEventListener('keydown', eventListener)

      return (
        <div
          className='absolute left-1/2 top-[70%] w-max-content -translate-x-1/2 transform cursor-pointer select-none rounded-md border border-[#C599FFCF] bg-[#17082FB2] p-1'
          onTouchStart={promptActivated}
          onClick={promptActivated}
        >
          <div className='flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-md border border-[#C599FFCF]  bg-[#8A2EFF] bg-radialGradient'>
              <p className='font-bold text-white'>
                {isTouchDevice ? <MdTouchApp /> : 'P'}
              </p>
            </div>
            <div className='flex flex-col items-start'>
              <p className='px-3 pr-5 text-sm font-semibold leading-tight text-white'>
                Enter Portal
              </p>
            </div>
          </div>
        </div>
      )
    } else {
      if (pKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          pKeydownEventListenerRef.current,
        )
        pKeydownEventListenerRef.current = null
      }
      return null
    }
  }, [
    showEnterPortalPrompt,
    isPresentationMode,
    isShowcaseMode,
    inventoryConsoleHUDContext.isPresentationMode,
    inventoryConsoleHUDContext.isPresentationModeStartingUp,
    isPresentationModeStartingUp,
  ])

  const meteorMiningStates = MeteorManagerStore(
    (state) => state.meteorMiningStates,
  )
  const currentlyInteractingWithMeteorIndex = MeteorManagerStore(
    (state) => state.currentlyInteractingWithMeteorIndex,
  )
  const showStartMiningPrompt = useMemo(() => {
    if (
      isPresentationMode ||
      isPresentationModeStartingUp ||
      isShowcaseMode ||
      inventoryConsoleHUDContext.isPresentationMode ||
      inventoryConsoleHUDContext.isPresentationModeStartingUp ||
      (isTutorialEnabled && currentTutorialDialogId !== 'meteor_mining_game' && currentTutorialDialogId !== 'collect_mining_rewards' && currentTutorialDialogId !== 'check_meteor_rewards')
    ) {
      if (fKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          fKeydownEventListenerRef.current,
        )
        fKeydownEventListenerRef.current = null
      }

      return null
    }

    const meteorMiningState =
      meteorMiningStates[currentlyInteractingWithMeteorIndex ?? 0]

    if (
      isStartMiningPromptShown &&
      meteorMiningState != MeteorMiningState.REWARDS_COLLECTED
    ) {
      if (fKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          fKeydownEventListenerRef.current,
        )
        fKeydownEventListenerRef.current = null
      }

      const promptActivated = () => {
        if (meteorMiningState == MeteorMiningState.ONGOING) return
        SoundsStore.getState().playClickSoundOnce()

        if (meteorMiningState == MeteorMiningState.NOT_STARTED) {
          MeteorManagerStore.getState().startMining(
            MeteorManagerStore.getState().currentlyInteractingWithMeteorIndex ??
              0,
          )
        } else if (meteorMiningState == MeteorMiningState.COMPLETED) {
          if (AuthAPIStore.getState().mobileNumberForMining === '') {
            HUDStore.setState({
              showNotLoggedInWhileCollectingMinedStuff: true,
            })
            return
          } else {
            HUDStore.setState({
              showNotLoggedInWhileCollectingMinedStuff: false,
            })
            MeteorManagerStore.getState().rewardsCollected(
              MeteorManagerStore.getState()
                .currentlyInteractingWithMeteorIndex ?? 0,
            )
          }
        }

        if (fKeydownEventListenerRef.current !== null) {
          document.removeEventListener(
            'keydown',
            fKeydownEventListenerRef.current,
          )
          fKeydownEventListenerRef.current = null
        }
      }

      const eventListener = (e: KeyboardEvent) => {
        if (e == null) return
        if (e.key.toLowerCase() === 'f') {
          promptActivated()
        }
      }

      fKeydownEventListenerRef.current = eventListener

      // add an event listener on the keypress of the 'E' key
      document.addEventListener('keydown', eventListener)

      return (
        <>
          {!showNotLoggedInWhileCollectingMinedStuff && (
            <div
              className={`
              absolute left-1/2 top-[50%] w-max-content -translate-x-1/2 transform select-none rounded-md border border-[#C599FFCF] bg-[#17082FB2] p-1 lg:top-[70%]
              ${
                meteorMiningState == MeteorMiningState.ONGOING
                  ? ''
                  : 'cursor-pointer'
              }
            `}
              onTouchStart={promptActivated}
              onClick={promptActivated}
            >
              <div className='flex items-center gap-2'>
                <div className='flex h-10 w-10 items-center justify-center rounded-md border border-[#C599FFCF]  bg-[#8A2EFF] bg-radialGradient'>
                  {(meteorMiningState == MeteorMiningState.NOT_STARTED ||
                    meteorMiningState == MeteorMiningState.COMPLETED) && (
                    <p className='font-bold text-white'>
                      {isTouchDevice ? <MdTouchApp /> : 'F'}
                    </p>
                  )}
                  {meteorMiningState == MeteorMiningState.ONGOING && (
                    <p className='font-bold text-white'>
                      {<AiOutlineLoading3Quarters className='animate-spin' />}
                    </p>
                  )}
                </div>
                <div className='flex flex-col items-start'>
                  <p className='px-3 pr-5 text-sm font-semibold leading-tight text-white'>
                    {meteorMiningState === MeteorMiningState.NOT_STARTED
                      ? 'Start Mining'
                      : meteorMiningState === MeteorMiningState.COMPLETED
                      ? 'Mining Completed! Collect your rewards'
                      : 'Mining... Please Wait!'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )
    } else {
      if (fKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          fKeydownEventListenerRef.current,
        )
        fKeydownEventListenerRef.current = null
      }
      return null
    }
  }, [
    meteorMiningStates,
    isStartMiningPromptShown,
    enterStorePromptStoreName,
    showNotLoggedInWhileCollectingMinedStuff,
    isPresentationMode,
    isShowcaseMode,
    inventoryConsoleHUDContext.isPresentationMode,
    inventoryConsoleHUDContext.isPresentationModeStartingUp,
    isPresentationModeStartingUp,
    currentlyInteractingWithMeteorIndex,
    isTutorialEnabled,
    currentTutorialDialogId
  ])

  const isRewardRedeemMachinePromptShown = HUDStore(
    (state) => state.isRewardRedeemMachinePromptShown,
  )
  const rewardMachineMode = MeteorManagerStore(
    (state) => state.rewardMachineMode,
  )
  const showRewardRedeemMachinePrompt = useMemo(() => {
    if(isTutorialEnabled && currentTutorialDialogId !== 'check_meteor_rewards')
    {
      if (fKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          fKeydownEventListenerRef.current,
        )
        fKeydownEventListenerRef.current = null
      }
      return null
    }
    if (
      isRewardRedeemMachinePromptShown &&
      rewardMachineMode == RewardMachineMode.OUTSIDE
    ) {
      if (fKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          fKeydownEventListenerRef.current,
        )
        fKeydownEventListenerRef.current = null
      }

      const promptActivated = () => {
        if (rewardMachineMode == RewardMachineMode.OUTSIDE) {
          PlayerConfigStore.getState().isPlayerParalysedRef.current = true
          MeteorManagerStore.setState({
            rewardMachineMode: RewardMachineMode.TRAVELLING_OUTSIDE_TO_INSIDE,
          })
        }

        SoundsStore.getState().playClickSoundOnce()
        if (fKeydownEventListenerRef.current !== null) {
          document.removeEventListener(
            'keydown',
            fKeydownEventListenerRef.current,
          )
          fKeydownEventListenerRef.current = null
        }
        HUDStore.setState({ isRewardRedeemMachinePromptShown: false })
      }

      const eventListener = (e: KeyboardEvent) => {
        if (e == null) return
        if (e.key.toLowerCase() === 'f') {
          promptActivated()
        }
      }

      fKeydownEventListenerRef.current = eventListener

      // add an event listener on the keypress of the 'E' key
      document.addEventListener('keydown', eventListener)

      return (
        <div
          className='absolute left-1/2 top-[50%] w-max-content -translate-x-1/2 transform cursor-pointer select-none rounded-md border border-[#C599FFCF] bg-[#17082FB2] p-1 lg:top-[70%]'
          onTouchStart={promptActivated}
          onClick={promptActivated}
        >
          <div className='flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-md border border-[#C599FFCF]  bg-[#8A2EFF] bg-radialGradient'>
              <p className='font-bold text-white'>
                {isTouchDevice ? <MdTouchApp /> : 'F'}
              </p>
            </div>
            <div className='flex flex-col items-start'>
              <p className='px-3 pr-5 text-sm font-semibold leading-tight text-white'>
                Activate the Redeem Machine
              </p>
            </div>
          </div>
        </div>
      )
    } else {
      if (fKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          fKeydownEventListenerRef.current,
        )
        fKeydownEventListenerRef.current = null
      }
      return null
    }
  }, [isRewardRedeemMachinePromptShown, rewardMachineMode, isTutorialEnabled, currentTutorialDialogId])

  const isLeaderboardMachinePromptShown = HUDStore(
    (state) => state.isLeaderboardMachinePromptShown,
  )

  const showLeaderboardMachinePrompt = useMemo(() => {
    if(isTutorialEnabled)
    {
      if (fKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          fKeydownEventListenerRef.current,
        )
        fKeydownEventListenerRef.current = null
      }
      return null
    }
      
    if (
      isLeaderboardMachinePromptShown &&
      leaderboardMachineMode == RewardMachineMode.OUTSIDE
    ) {
      if (fKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          fKeydownEventListenerRef.current,
        )
        fKeydownEventListenerRef.current = null
      }

      const promptActivated = () => {
        if (leaderboardMachineMode == RewardMachineMode.OUTSIDE) {
          PlayerConfigStore.getState().isPlayerParalysedRef.current = true
          MeteorManagerStore.setState({
            leaderboardMachineMode:
              RewardMachineMode.TRAVELLING_OUTSIDE_TO_INSIDE,
          })
        }

        SoundsStore.getState().playClickSoundOnce()
        if (fKeydownEventListenerRef.current !== null) {
          document.removeEventListener(
            'keydown',
            fKeydownEventListenerRef.current,
          )
          fKeydownEventListenerRef.current = null
        }
        HUDStore.setState({ isLeaderboardMachinePromptShown: false })
      }

      const eventListener = (e: KeyboardEvent) => {
        if (e == null) return
        if (e.key.toLowerCase() === 'f') {
          promptActivated()
        }
      }

      fKeydownEventListenerRef.current = eventListener

      // add an event listener on the keypress of the 'E' key
      document.addEventListener('keydown', eventListener)

      return (
        <div
          className='absolute left-1/2 top-[70%] w-max-content -translate-x-1/2 transform cursor-pointer select-none rounded-md border border-[#C599FFCF] bg-[#17082FB2] p-1'
          onTouchStart={promptActivated}
          onClick={promptActivated}
        >
          <div className='flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-md border border-[#C599FFCF]  bg-[#8A2EFF] bg-radialGradient'>
              <p className='font-bold text-white'>
                {isTouchDevice ? <MdTouchApp /> : 'F'}
              </p>
            </div>
            <div className='flex flex-col items-start'>
              <p className='px-3 pr-5 text-sm font-semibold leading-tight text-white'>
                Open Leaderboard
              </p>
            </div>
          </div>
        </div>
      )
    } else {
      if (fKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          fKeydownEventListenerRef.current,
        )
        fKeydownEventListenerRef.current = null
      }
      return null
    }
  }, [isLeaderboardMachinePromptShown, leaderboardMachineMode,isTutorialEnabled])

  const showEnterStorePrompt = useMemo(() => {
    // Only show store prompt during tutorial if it's the hub store AND we're at the checkpoint dialog
    if (
      // Tutorial mode check (except for hub store during checkpoint)
      (isTutorialEnabled &&
        !(
          enterStorePromptStoreName === 'hub' &&
          currentTutorialDialogId === 'checkpoint_reached'
        )) ||
      isPresentationMode ||
      isPresentationModeStartingUp ||
      isShowcaseMode ||
      inventoryConsoleHUDContext.isPresentationMode ||
      inventoryConsoleHUDContext.isPresentationModeStartingUp||
      isDigiGoldMachinePromptShown ||
      isDigiGoldPresentationMode ||
      isDigiGoldPresentationModeStartingUp
    ) {
      if (fKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          fKeydownEventListenerRef.current,
        )
        fKeydownEventListenerRef.current = null
      }

      return null
    }

    if (isEnterStorePromptShown && enterStorePromptStoreName !== '') {
      if (fKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          fKeydownEventListenerRef.current,
        )
        fKeydownEventListenerRef.current = null
      }

      const promptActivated = () => {
        trackEvent(
          'Store_Entry_Exit',
          {
            action: 'Entry',
            store_name: enterStorePromptStoreName,
          },
          getUserID(),
        )
        setStoreRequestedToEnter(enterStorePromptStoreName)
        setIsEnterStorePromptShown(false)
        setEnterStorePromptStoreName('')
        SoundsStore.getState().playClickSoundOnce()
        if (fKeydownEventListenerRef.current !== null) {
          document.removeEventListener(
            'keydown',
            fKeydownEventListenerRef.current,
          )
          fKeydownEventListenerRef.current = null
        }
      }

      const eventListener = (e: KeyboardEvent) => {
        if (e == null) return
        if (e.key.toLowerCase() === 'f') {
          promptActivated()
        }
      }

      fKeydownEventListenerRef.current = eventListener

      // add an event listener on the keypress of the 'E' key
      document.addEventListener('keydown', eventListener)

      return (
        <div
          className='absolute left-1/2 top-[50%] w-max-content -translate-x-1/2 transform cursor-pointer select-none rounded-md border border-[#C599FFCF] bg-[#17082FB2] p-1 lg:top-[70%]'
          onTouchStart={promptActivated}
          onClick={promptActivated}
        >
          <div className='flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-md border border-[#C599FFCF]  bg-[#8A2EFF] bg-radialGradient'>
              <p className='font-bold text-white'>
                {isTouchDevice ? <MdTouchApp /> : 'F'}
              </p>
            </div>
            <div className='flex flex-col items-start'>
              <p className='px-3 pr-5 text-sm font-semibold leading-tight text-white'>
                Enter Store
              </p>
            </div>
          </div>
        </div>
      )
    } else {
      if (fKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          fKeydownEventListenerRef.current,
        )
        fKeydownEventListenerRef.current = null
      }
      return null
    }
  }, [
    isEnterStorePromptShown,
    enterStorePromptStoreName,
    isPresentationMode,
    isShowcaseMode,
    inventoryConsoleHUDContext.isPresentationMode,
    inventoryConsoleHUDContext.isPresentationModeStartingUp,
    isPresentationModeStartingUp,
    isTutorialEnabled,
    currentTutorialDialogId,
    isDigiGoldMachinePromptShown,
    isDigiGoldPresentationMode,
    isDigiGoldPresentationModeStartingUp,
  ])

  const showOpenShowcasePrompt = useMemo(() => {
    if (
      (isTutorialEnabled && !(insideStore === 'hub')) ||
      isPresentationMode ||
      isPresentationModeStartingUp ||
      isShowcaseMode ||
      inventoryConsoleHUDContext.isPresentationMode ||
      inventoryConsoleHUDContext.isPresentationModeStartingUp
    ) {
      if (eKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          eKeydownEventListenerRef.current,
        )
        eKeydownEventListenerRef.current = null
      }

      return null
    }

    if (isOpenShowcasePromptShown) {
      if (eKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          eKeydownEventListenerRef.current,
        )
        eKeydownEventListenerRef.current = null
      }

      const promptActivated = () => {
        setIsOpenShowcasePromptClicked(true)
        if (eKeydownEventListenerRef.current !== null) {
          document.removeEventListener(
            'keydown',
            eKeydownEventListenerRef.current,
          )
          eKeydownEventListenerRef.current = null
        }
      }

      const eventListener = (e: KeyboardEvent) => {
        if (e == null) return
        if (e.key.toLowerCase() === 'e') {
          promptActivated()
        }
      }

      eKeydownEventListenerRef.current = eventListener

      // add an event listener on the keypress of the 'E' key
      document.addEventListener('keydown', eventListener)

      return (
        <div
          className='absolute left-1/2 top-[70%] w-max-content -translate-x-1/2 transform cursor-pointer select-none rounded-md border border-[#C599FFCF] bg-[#17082FB2] p-1'
          onTouchStart={promptActivated}
          onClick={promptActivated}
        >
          <div className='flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-md border border-[#C599FFCF]  bg-[#8A2EFF] bg-radialGradient'>
              <p className='font-bold text-white'>
                {isTouchDevice ? <MdTouchApp /> : 'E'}
              </p>
            </div>
            <div className='flex flex-col items-start'>
              <p className='px-3 pr-5 text-sm font-semibold leading-tight text-white'>
                Open
                <br />
                Showcase
              </p>
            </div>
          </div>
        </div>
      )
    } else {
      if (eKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          eKeydownEventListenerRef.current,
        )
        eKeydownEventListenerRef.current = null
      }
      return null
    }
  }, [
    isOpenShowcasePromptShown,
    isPresentationMode,
    isShowcaseMode,
    inventoryConsoleHUDContext.isPresentationMode,
    inventoryConsoleHUDContext.isPresentationModeStartingUp,
    isPresentationModeStartingUp,
    isTutorialEnabled,
    insideStore,
  ])

  const inventoryConsolePromptShown = useMemo(() => {
    if (
      isPresentationMode ||
      isPresentationModeStartingUp ||
      isShowcaseMode ||
      inventoryConsoleHUDContext.isPresentationMode ||
      inventoryConsoleHUDContext.isPresentationModeStartingUp
    ) {
      if (tKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          tKeydownEventListenerRef.current,
        )
        tKeydownEventListenerRef.current = null
      }

      return null
    }

    if (isInventoryConsolePromptShown) {
      if (tKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          tKeydownEventListenerRef.current,
        )
        tKeydownEventListenerRef.current = null
      }

      const promptActivated = () => {
        setIsOpenShowcasePromptClicked(true)
        if (tKeydownEventListenerRef.current !== null) {
          document.removeEventListener(
            'keydown',
            tKeydownEventListenerRef.current,
          )
          tKeydownEventListenerRef.current = null
        }
      }

      const eventListener = (e: KeyboardEvent) => {
        if (e == null) return
        if (e.key.toLowerCase() === 't') {
          promptActivated()
        }
      }

      tKeydownEventListenerRef.current = eventListener

      // add an event listener on the keypress of the 'E' key
      document.addEventListener('keydown', eventListener)

      return (
        <div
          className='absolute left-1/2 top-[70%] w-max-content -translate-x-1/2 transform cursor-pointer select-none rounded-md border border-[#C599FFCF] bg-[#17082FB2] p-1'
          onTouchStart={promptActivated}
          onClick={promptActivated}
        >
          <div className='flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-md border border-[#C599FFCF]  bg-[#8A2EFF] bg-radialGradient'>
              <p className='font-bold text-white'>
                {isTouchDevice ? <MdTouchApp /> : 'T'}
              </p>
            </div>
            <div className='flex flex-col items-start'>
              <p className='px-3 pr-5 text-sm font-semibold leading-tight text-white'>
                Open
                <br />
                Showcase
              </p>
            </div>
          </div>
        </div>
      )
    } else {
      if (tKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          tKeydownEventListenerRef.current,
        )
        tKeydownEventListenerRef.current = null
      }
      return null
    }
  }, [
    isInventoryConsolePromptShown,
    isPresentationMode,
    isShowcaseMode,
    inventoryConsoleHUDContext.isPresentationMode,
    inventoryConsoleHUDContext.isPresentationModeStartingUp,
    isPresentationModeStartingUp,
  ])
  const showDigiGoldMachinePrompt = useMemo(() => {
    if (
      isDigiGoldMachinePromptClicked ||
      isTutorialEnabled ||
      isStartMiningPromptShown
    ) {
      if (bKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          bKeydownEventListenerRef.current,
        )
        bKeydownEventListenerRef.current = null
      }
      return null
    }
    if (isDigiGoldMachinePromptShown) {
      if (bKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          bKeydownEventListenerRef.current,
        )
        bKeydownEventListenerRef.current = null
      }
      const promptActivated = () => {
        PlayerConfigStore.getState().isPlayerParalysedRef.current = true
        setIsDigiGoldMachinePromptClicked(true)
        if (bKeydownEventListenerRef.current !== null) {
          document.removeEventListener(
            'keydown',
            bKeydownEventListenerRef.current,
          )
          bKeydownEventListenerRef.current = null
        }
      }
      const eventListener = (e: KeyboardEvent) => {
        if (e == null) return
        if (e.key.toLowerCase() === 'b') {
          promptActivated()
        }
      }
      bKeydownEventListenerRef.current = eventListener
      document.addEventListener('keydown', eventListener)
      return (
        <div
          className='absolute left-1/2 top-[70%] w-max-content -translate-x-1/2 transform cursor-pointer select-none rounded-md border border-[#C599FFCF] bg-[#17082FB2] p-1'
          onTouchStart={promptActivated}
          onClick={promptActivated}
        >
          <div className='flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-md border border-[#C599FFCF]  bg-[#8A2EFF] bg-radialGradient'>
              <p className='font-bold text-white'>
                {isTouchDevice ? <MdTouchApp /> : 'B'}
              </p>
            </div>
            <div className='flex flex-col items-start'>
              <p className='px-3 pr-5 text-sm font-semibold leading-tight text-white'>
                Buy
                <br />
                DigiGold
              </p>
            </div>
          </div>
        </div>
      )
    } else {
      if (bKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          bKeydownEventListenerRef.current,
        )
        bKeydownEventListenerRef.current = null
      }
      return null
    }
  }, [
    isDigiGoldMachinePromptShown,
    isDigiGoldMachinePromptClicked,
    isTutorialEnabled,
    isStartMiningPromptShown,
  ])
  const exitInventoryConsolePopup = useMemo(() => {
    if (!inventoryConsoleHUDContext.isPresentationMode) return
    if (tKeydownEventListenerRef.current !== null) {
      document.removeEventListener(
        'keydown',
        tKeydownEventListenerRef.current,
      )
      tKeydownEventListenerRef.current = null
    }

    const promptActivated = () => {
      setExitingInventoryConsole(true)
      if (tKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          tKeydownEventListenerRef.current,
        )
        tKeydownEventListenerRef.current = null
      }
    }

    const eventListener = (e: KeyboardEvent) => {
      if (e == null) return
      if (e.key.toLowerCase() === 't') {
        promptActivated()
      }
    }

    tKeydownEventListenerRef.current = eventListener

    // add an event listener on the keypress of the 'E' key
    document.addEventListener('keydown', eventListener)

    return null
  }, [inventoryConsoleHUDContext.isPresentationMode])

  const isInFullscreen = GesturesAndDeviceStore((state) => state.isInFullscreen)
  const fullscreenButton = useMemo(() => {
    return (
      <>
        {!isPresentationMode &&
          !inventoryConsoleHUDContext.isPresentationMode &&
          !isTouchDevice &&
          hasStartButtonBeenPressed && (
            <div
              onClick={() => {
                SoundsStore.getState().playClickSoundOnce()
                GesturesAndDeviceStore.getState().toggleFullscreen()
              }}
              className='skewed hidden cursor-pointer items-center justify-center rounded-md border border-[#C599FFCF] bg-[#17082FB2] p-3 md:flex'
            >
              <span>
                {isInFullscreen ? (
                  <BsFullscreenExit className='mx-auto my-auto h-6 w-6 fill-white' />
                ) : (
                  <BsFullscreen className='mx-auto my-auto h-6 w-6 fill-white' />
                )}
              </span>
            </div>
          )}
      </>
    )
  }, [
    isPresentationMode,
    inventoryConsoleHUDContext.isPresentationMode,
    isTouchDevice,
    hasStartButtonBeenPressed,
    isInFullscreen,
  ])

  const showExitStorePrompt = useMemo(() => {
    if (
      isPresentationMode ||
      isPresentationModeStartingUp ||
      isShowcaseMode ||
      inventoryConsoleHUDContext.isPresentationMode ||
      inventoryConsoleHUDContext.isPresentationModeStartingUp
    ) {
      if (fKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          fKeydownEventListenerRef.current,
        )
        fKeydownEventListenerRef.current = null
      }

      return null
    }

    if (isExitStorePromptShown && exitStorePromptStoreName !== '') {
      if (fKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          fKeydownEventListenerRef.current,
        )
        fKeydownEventListenerRef.current = null
      }

      const promptActivated = () => {
        trackEvent(
          'Store_Entry_Exit',
          {
            action: 'Exit',
            store_name: exitStorePromptStoreName,
          },
          getUserID(),
        )
        setStoreRequestedToExit({
          nameOfStoreToExit: exitStorePromptStoreName,
          exitingVia: 'gate',
        })
        setIsExitStorePromptShown(false)
        setExitStorePromptStoreName('')
        SoundsStore.getState().playClickSoundOnce()

        if (fKeydownEventListenerRef.current !== null) {
          document.removeEventListener(
            'keydown',
            fKeydownEventListenerRef.current,
          )
          fKeydownEventListenerRef.current = null
        }
      }

      const eventListener = (e: KeyboardEvent) => {
        if (e == null) return
        if (e.key.toLowerCase() === 'f') {
          promptActivated()
        }
      }

      fKeydownEventListenerRef.current = eventListener

      // add an event listener on the keypress of the 'E' key
      document.addEventListener('keydown', eventListener)

      return (
        <div
          className='absolute left-1/2 top-[70%] w-max-content -translate-x-1/2 transform cursor-pointer select-none rounded-md border border-[#C599FFCF] bg-[#17082FB2] p-1'
          onTouchStart={promptActivated}
          onClick={promptActivated}
        >
          <div className='flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-md border border-[#C599FFCF]  bg-[#8A2EFF] bg-radialGradient'>
              <p className='font-bold text-white'>
                {isTouchDevice ? <MdTouchApp /> : 'F'}
              </p>
            </div>
            <div className='flex flex-col items-start'>
              <p className='px-3 pr-5 text-sm font-semibold leading-tight text-white'>
                Exit Store
              </p>
            </div>
          </div>
        </div>
      )
    } else {
      if (fKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          fKeydownEventListenerRef.current,
        )
        fKeydownEventListenerRef.current = null
      }

      return null
    }
  }, [
    isExitStorePromptShown,
    exitStorePromptStoreName,
    isPresentationMode,
    isShowcaseMode,
    inventoryConsoleHUDContext.isPresentationMode,
    inventoryConsoleHUDContext.isPresentationModeStartingUp,
    isPresentationModeStartingUp,
  ])
  const showTutorialPrompt = useMemo(() => {
    if(isTutorialEnabled) return null
    if (isTutorialPromptShown) {
      if (fKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          fKeydownEventListenerRef.current,
        )
        fKeydownEventListenerRef.current = null
      }

      const promptActivated = () => {
        genericStore.setState({ isTutorialEnabled: true })
        genericStore.setState({ isTutorialNPCActive: true })
        if (fKeydownEventListenerRef.current !== null) {
          document.removeEventListener(
            'keydown',
            fKeydownEventListenerRef.current,
          )
          fKeydownEventListenerRef.current = null
        }
      }

      const eventListener = (e: KeyboardEvent) => {
        if (e == null) return
        if (e.key.toLowerCase() === 'f') {
          promptActivated()
        }
      }

      fKeydownEventListenerRef.current = eventListener

      // add an event listener on the keypress of the 'E' key
      document.addEventListener('keydown', eventListener)

      return (
        <div
          className='absolute left-1/2 top-[50%] w-max-content -translate-x-1/2 transform cursor-pointer select-none rounded-md border border-[#C599FFCF] bg-[#17082FB2] p-1 lg:top-[70%]'
          onTouchStart={promptActivated}
          onClick={promptActivated}
        >
          <div className='flex items-center gap-2'>
            <div className={`flex ${breakpoint === "md" || breakpoint === "sm" || breakpoint === "xs" || breakpoint === "xxs" || breakpoint === 'lg' ? 'h-10 w-10': breakpoint === 'xl' ? 'h-12 w-12': 'h-10 w-10'} items-center justify-center rounded-md border border-[#C599FFCF]  bg-[#8A2EFF] bg-radialGradient`}>
              <p className='font-bold text-white'>
                {isTouchDevice ? <MdTouchApp /> : 'F'}
              </p>
            </div>
            <div className='flex flex-col items-start'>
              <p className='px-3 pr-5 text-sm font-semibold leading-tight text-white'>
                Start
                <br />
                Tutorial
              </p>
            </div>
          </div>
        </div>
      )
    } else {
      if (fKeydownEventListenerRef.current !== null) {
        document.removeEventListener(
          'keydown',
          fKeydownEventListenerRef.current,
        )
        fKeydownEventListenerRef.current = null
      }
      return null
    }
  }, [isTutorialPromptShown,isTutorialEnabled])

  // const handleLogout = () => {
  //   Cookies.remove('access_token', { path: '' })
  //   localStorage.removeItem('hiddenItems')
  //   localStorage.removeItem('avatarPath')
  //   localStorage.removeItem('rpmUserId')
  //   room?.leave()
  //   window.location.reload()
  // }

  const OpenAvatarSelectionMenu = () => {
    SoundsStore.getState().playClickSoundOnce()
    localStorage.removeItem('avatarPath')
    if (setAvatarData) setAvatarData({ avatarPath: '' })
    setIsMobileMenuOpen(false)
    AvatarStore.getState().setHasAvatarBeenSelected(false)
  }

  const presentationModeShowcaseCarouselButtons = useMemo(() => {
    if (isShowcaseMode) return null
    if (isPresentationModeShuttingDown || isPresentationModeStartingUp)
      return null
    if (!isPresentationMode) return null

    if (isPresentationMode) {
      const handleLeft = () => {
        const insideStore = genericStore.getState().insideStore
        const groupDataCache = CollectionStore.getState().groupDataCache
        const showcaseActiveGroupIndex =
          HUDStore.getState().showcaseActiveGroupIndex
        const groupCount = Object.keys(groupDataCache).length
        const desiredNewIndex =
          (showcaseActiveGroupIndex - 1 + groupCount) % groupCount
        trackEvent(
          'Presentation_Interactions',
          {
            action: 'Previous_Group',
            showcase_name:
              insideStore &&
              groupDataCache?.[insideStore] &&
              groupDataCache[insideStore]?.[desiredNewIndex] &&
              groupDataCache[insideStore]?.[desiredNewIndex]?.name
                ? groupDataCache[insideStore][desiredNewIndex].name
                : 'Unknown Showcase',
            store_name: insideStore || 'Unknown Store',
          },
          getUserID(),
        )

        SoundsStore.getState().playClickSoundOnce()
        setIsSelectedShowcaseTranslatingPrevious(true)
      }
      const handleRight = () => {
        const insideStore = genericStore.getState().insideStore
        const groupDataCache = CollectionStore.getState().groupDataCache
        const showcaseActiveGroupIndex =
          HUDStore.getState().showcaseActiveGroupIndex
        const groupCount = Object.keys(groupDataCache).length
        const desiredNewIndex = (showcaseActiveGroupIndex + 1) % groupCount
        trackEvent(
          'Presentation_Interactions',
          {
            action: 'Next_Group',
            showcase_name:
              insideStore &&
              groupDataCache?.[insideStore] &&
              groupDataCache[insideStore]?.[desiredNewIndex] &&
              groupDataCache[insideStore]?.[desiredNewIndex]?.name
                ? groupDataCache[insideStore][desiredNewIndex].name
                : 'Unknown Showcase',
            store_name: insideStore || 'Unknown Store',
          },
          getUserID(),
        )
        SoundsStore.getState().playClickSoundOnce()
        setIsSelectedShowcaseTranslatingNext(true)
      }

      return (
        <>
          <div className='absolute left-1/2 top-[80%] w-full -translate-x-1/2 transform p-1 sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%]'>
            <div className='mb-4 flex items-stretch justify-between gap-2'>
              <button
                onClick={() => handleLeft()}
                className={`flex cursor-pointer flex-row rounded-md
                  border-[2px] border-[#C599FFCF] bg-[#17082FB2] p-1 transition
                  delay-100 ease-in-out hover:scale-110 ${
                    isTouchDevice ? 'short:top-[25%]' : 'md:top-[50%]'
                  }
                `}
              >
                <HiOutlineChevronLeft className='lg:stroke-5 h-8 w-8 stroke-neutral-300 stroke-1' />
                <div className='flex h-full w-full'>
                  <p className='mt-[2px] text-xl text-white'>Previous</p>
                </div>
              </button>
              <button
                onClick={() => handleRight()}
                className={`flex cursor-pointer flex-row-reverse rounded-md
                  border-[2px]
                  border-[#C599FFCF] bg-[#17082FB2] p-1 transition delay-100 ease-in-out
                  hover:scale-110 ${
                    isTouchDevice
                      ? 'short:top-[25%]'
                      : 'md:left-auto md:right-[460px] md:top-[50%]'
                  }
                `}
              >
                <HiOutlineChevronRight className='lg:stroke-5 h-8 w-8 stroke-neutral-300 stroke-1' />
                <div className='flex h-full w-full justify-end'>
                  <p className='mt-[2px] text-xl text-white'>Next</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )
    }
  }, [
    isPresentationMode,
    isShowcaseMode,
    setIsSelectedShowcaseTranslatingNext,
    setIsSelectedShowcaseTranslatingPrevious,
    isPresentationModeStartingUp,
    isPresentationModeShuttingDown,
  ])

  // hide the joystick and jump button when the redeem machine or leaderboard machine is visible
  useEffect(() => {
    if (
      isShowcaseMode ||
      isPresentationMode ||
      inventoryConsoleHUDContext.isPresentationMode ||
      inventoryConsoleHUDContext.isDetailMode ||
      isRedeemMachineScreenUIVisible ||
      isLeaderboardMachineScreenUIVisible ||
      isDigiGoldVisible
    ) {
      genericStore.getState().hideJoystickAndJumpButton()
    } else {
      if(!isTutorialEnabled && isTouchDevice){
        genericStore.getState().showJoystickAndJumpButton()
      }
    }
  }, [
    isShowcaseMode,
    isPresentationMode,
    inventoryConsoleHUDContext.isPresentationMode,
    inventoryConsoleHUDContext.isDetailMode,
    isRedeemMachineScreenUIVisible,
    isLeaderboardMachineScreenUIVisible,
    isDigiGoldVisible,
  ])

  const IntroVideo = () => {
    const [isPlaying, setIsPlaying] = useState(false)

    const [progress, setProgress] = useState(0)
    const [showCloseButton, setShowCloseButton] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const animationRef = useRef<number | null>(null)
    const startTime = useRef<number | null>(null)
    const [videoTopOffset, setVideoTopOffset] = useState(0)
    const [videoRightOffset, setVideoRightOffset] = useState(0)
    const [timerCompleted, setTimerCompleted] = useState(false)

    const isAparupaVideoPopupVisible = genericStore(
      (state) => state.isAparupaVideoPopupVisible,
    )

    const handleCloseButtonPositioning = () => {
      if (videoRef.current && containerRef.current) {
        const videoRect = videoRef.current.getBoundingClientRect()
        const padding = 16 // Desired padding from video edge
        
        // Set position relative to video boundaries
        const topOffset = videoRect.top + padding
        const rightOffset = window.innerWidth - (videoRect.right - padding)
        
        if (closeButtonRef.current) {
          closeButtonRef.current.style.setProperty('top', `${topOffset}px`)
          closeButtonRef.current.style.setProperty('right', `${rightOffset}px`) 
        }

        setVideoTopOffset(topOffset)
        setVideoRightOffset(rightOffset)

        genericStore
          .getState()
          .joystickRoot?.style.setProperty('display', 'none')
      }
    }

    useEffect(() => {
      const videoElement = videoRef.current
      if (videoElement) {
        window.addEventListener('resize', handleCloseButtonPositioning);
      }
      return () => {
        window.removeEventListener('resize', handleCloseButtonPositioning);
      };
    }, []);

    const togglePlayPause = () => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause()
        } else {
          SoundsStore.getState().stopBackgroundMusic()
          videoRef.current.play()
          setShowCloseButton(true)
          if (!timerCompleted) {
            startTimer()
          }
        }
        setIsPlaying(!isPlaying)
      }
    };

    const handleVideoEnd = () => {
      genericStore
        .getState()
        .joystickRoot?.style.setProperty('display', 'block')
      genericStore.setState({ isAparupaVideoPopupVisible: false })
      SoundsStore.getState().playBackgroundMusic()
    };

    const handleClose = () => {
      if (timerCompleted) {
        genericStore
          .getState()
          .joystickRoot?.style.setProperty('display', 'block')
        genericStore.setState({ isAparupaVideoPopupVisible: false })
        SoundsStore.getState().playBackgroundMusic()
      }
    };

    const startTimer = () => {
      startTime.current = null;
      animationRef.current = requestAnimationFrame(animate);
    };

    const animate = (timestamp: number) => {
      if (startTime.current === null) {
        startTime.current = timestamp
      }
      const elapsed = timestamp - startTime.current;
      const newProgress = Math.min((elapsed / 5000) * 100, 100); // 5000ms = 5 seconds
      setProgress(newProgress);

      if (newProgress < 100) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setTimerCompleted(true)
      }
    }

    const closeButtonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
        if (videoRef.current) {
          videoRef.current.pause()
          videoRef.current.src = ''
        }
      };
    }, []);

    useEffect(() => {
        PlayerConfigStore.getState().isPlayerParalysedRef.current = isAparupaVideoPopupVisible
    }, [isAparupaVideoPopupVisible])

    if (!isAparupaVideoPopupVisible) {
      return null
    }

    return (
      <div className='absolute inset-0 z-[2147483647]'>
        <div className='absolute inset-0 bg-[#17082FB2] bg-opacity-90 backdrop-blur-sm z-10'></div>
        <div ref={containerRef} className='relative flex items-center justify-center z-[2147483647]'>
          {showCloseButton && (
            <div 
              className='fixed ' 
              style={{ top: `${videoTopOffset}px`, right: `${videoRightOffset}px` }}
              ref={closeButtonRef}
            >
              <div className="relative w-10 h-10">
                {
                  !timerCompleted &&
                  <svg className='w-full h-full' viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      className="stroke-gray-300"
                      strokeWidth="2"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      className="stroke-purple-500"
                      strokeWidth="2"
                      strokeDasharray="100"
                      strokeDashoffset={100 - progress}
                      transform="rotate(-90 18 18)"
                    />
                  </svg>
                }
                <AiFillCloseCircle
                  className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-gray-300'
                  size={30}
                  onClick={handleClose}
                />
              </div>
            </div>
          )}
        </div>
        <div className='absolute inset-0 z-20' onClick={togglePlayPause}>
          {!isPlaying && (
            <FaPlay
              className='absolute left-1/2 top-1/2 z-30 h-20 w-20 -translate-x-1/2 -translate-y-1/2 transform fill-purple-300 stroke-purple-800'
              style={{ fillOpacity: 0.5, strokeWidth: '20px' }}
            />
          )}
          <video
            ref={videoRef}
            playsInline
            className='fixed left-1/2 top-1/2 h-auto w-auto max-h-[90vh] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 p-1 md:p-10'
            src={staticResourcePaths.introVideo}
            onEnded={handleVideoEnd}
            onLoadedData={handleCloseButtonPositioning}
          />
        </div>
      </div>
    )
  }

  const isAparupaVideoEnabled = genericStore((state) => state.isAparupaVideoEnabled)
  const isDebugMode = genericStore((state) => state.isDebugMode)

  const HamburgerMenuButton = () => {
    return (
      <Button
        classNames='!w-12 h-12 flex justify-center items-center !z-[100] !relative pointer-events-auto mobileBgGradient'
        onClick={() => {
          SoundsStore.getState().playClickSoundOnce()
          setIsMobileMenuOpen(!isMobileMenuOpen)
          setShowCart(false)
          setShowChatbox(false)
          setShowHowToPlayScreen(false)
        }}
      >
        <svg
          width='24'
          height='25'
          viewBox='0 0 24 25'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='mx-auto'
        >
          <path
            d='M3 6.72852H21V8.72852H3V6.72852ZM3 11.7285H21V13.7285H3V11.7285ZM3 16.7285H21V18.7285H3V16.7285Z'
            fill='white'
          />
        </svg>
      </Button>
    )
  }

  const showMeteorRushIntro = HUDStore((state) => state.showMeteorRushIntro)

  if (isBuildingLoading) return <BuildingManagerLoadingScreen />
  return (
    <>
      {isAparupaVideoEnabled && hasStartButtonBeenPressed && !isDebugMode && (
        <IntroVideo />
      )}
      {showMeteorLoginRegister && !isLoggedIn && <MeteorLoginRegister />}
      {showMeteorRushIntro &&
        !isBuildingLoading &&
        hasStartButtonBeenPressed && (
          <MeteorRushIntro
            onClose={() => {
              HUDStore.getState().setShowMeteorRushIntro(false)
            }}
          />
        )}
      <div className='container pointer-events-none absolute left-1/2 top-5 z-hud mx-auto -translate-x-1/2'>
        <div className='flex items-center justify-between'>
          {hasStartButtonBeenPressed &&
            !inventoryConsoleHUDContext.isPresentationMode &&
            !isDigiGoldVisible && (
              <div className='flex flex-col self-start'>
                <img
                  src='/assets/images/logoNew.png'
                  className='h-18 ml-[-3px] w-32 self-start object-contain'
                  alt=''
                />
                {!isLandscape &&
                  !isRedeemMachineScreenUIVisible &&
                  !isLeaderboardMachineScreenUIVisible &&
                  numPlayersOnline}
              </div>
            )}
          {isTouchDevice &&
            (isLoggedIn || isGuest) &&
            !isPresentationMode &&
            !inventoryConsoleHUDContext.isPresentationMode &&
            !showTreasureHuntRewardScreen &&
            !showTreasureHuntScreen &&
            !showHowToPlayScreen &&
            hasStartButtonBeenPressed &&
            !isDigiGoldVisible && (
              <div className='flex flex-col items-end justify-center gap-2'>
                {!isRedeemMachineScreenUIVisible &&
                  !isLeaderboardMachineScreenUIVisible &&
                  !isTutorialEnabled && <HamburgerMenuButton />}
                {!showCart &&
                  !isRedeemMachineScreenUIVisible &&
                  !isLeaderboardMachineScreenUIVisible &&
                  !isShowcaseMode &&
                  !isPresentationMode &&
                  !inventoryConsoleHUDContext.isPresentationMode &&
                  !inventoryConsoleHUDContext.isDetailMode && (
                    <MeteorInventoryOnScreen />
                  )}
              </div>
            )}
        </div>
        {isLandscape && numPlayersOnline}
      </div>

      {showStartButton}

      {showJumpButton}
      {showPresentationMode}
      {showLoginScreen}
      {showAvatarSelectionMenu}
      {showTutorialPrompt}
      {showEnterStorePrompt}
      {showExitStorePrompt}
      {showOpenShowcasePrompt}
      {inventoryConsolePromptShown}
      {showDigiGoldMachinePrompt}
      {enterPortalPrompt}
      {exitInventoryConsolePopup}

      {highPolyModelLoadingDiv}
      {presentationModeShowcaseCarouselButtons}

      {showStartMiningPrompt}
      {showRewardRedeemMachinePrompt}
      {showLeaderboardMachinePrompt}

      {isRedeemMachineScreenUIVisible && <RedeemingMachineScreenUI />}
      {isLeaderboardMachineScreenUIVisible && <LeaderboardMachineScreenUI />}

      {showNotLoggedInModal ? <NotLoggedInModal /> : null}
      {inventoryConsoleHUDContext.isPresentationMode && <InventoryConsoleHUD />}
      {isDigiGoldPresentationMode && <DigiGoldHUD />}
      {inventoryConsoleHUDContext.isDetailMode && <InventoryConsoleDetails />}

      {hasAvatarBeenSelected && (
        <div className='pointer-events-none absolute bottom-0 left-1/2 top-auto z-hud mx-auto flex h-auto w-full -translate-x-1/2 items-center justify-end md:container md:bottom-5 md:top-5'>
          <div className='flex flex-col items-start'>
            <div className='pointer-events-auto self-end'>
              {showCartComponent}
            </div>
            <div className='pointer-events-auto self-end'>
              {showEnterVRComponent}
            </div>
          </div>
          <div className='md:backdrop-none fixed right-0 flex w-full items-end justify-between self-end rounded-t-3xl md:bottom-0 md:h-full'>
            {isTouchDevice
              ? showChatbox
                ? showChatboxComponent
                : null
              : showChatboxComponent}
            <div className='pointer-events-auto items-center space-y-4 self-end md:flex-col'>
              {isLandscape &&
                hasStartButtonBeenPressed &&
                !showCart &&
                !isRedeemMachineScreenUIVisible &&
                !isLeaderboardMachineScreenUIVisible &&
                !isDigiGoldVisible &&
                !isShowcaseMode &&
                !isPresentationMode &&
                !inventoryConsoleHUDContext.isPresentationMode &&
                !inventoryConsoleHUDContext.isDetailMode && (
                  <MeteorInventoryOnScreen />
                )}
              {!isTutorialEnabled &&
                !isLeaderboardMachineScreenUIVisible &&
                !isRedeemMachineScreenUIVisible &&
                !isOpenShowcasePromptShown &&
                !isEnterStorePromptShown &&
                !isExitStorePromptShown &&
                !isStartMiningPromptShown &&
                !isLeaderboardMachinePromptShown &&
                !isRewardRedeemMachinePromptShown &&
                !isTutorialPromptShown &&
                !isDigiGoldMachinePromptShown &&
                !isDigiGoldVisible && (
                  <div className='items-center gap-3 self-end md:flex'>
                    <GamizeHUD />
                    {!showCart && fullscreenButton}
                    {/* {!showCart && showTreasureHuntScreenComponent} */}
                    {!showCart && showHowToPlayScreenComponent}
                    {!showCart &&
                      !isPresentationMode &&
                      !inventoryConsoleHUDContext.isPresentationMode &&
                      !isTouchDevice &&
                      hasStartButtonBeenPressed && (
                        <div
                          onClick={OpenAvatarSelectionMenu}
                          className='skewed hidden cursor-pointer items-center justify-center rounded-md border border-[#C599FFCF] bg-[#17082FB2] p-3 md:flex'
                        >
                          <span>
                            <IoBody className='mx-auto my-auto h-6 w-6 fill-white' />
                          </span>
                        </div>
                      )}
                    {!showCart &&
                      !isPresentationMode &&
                      !inventoryConsoleHUDContext.isPresentationMode &&
                      isLoggedIn &&
                      !isTouchDevice && (
                        <div
                          onClick={() => {
                            SoundsStore.getState().playClickSoundOnce()
                            HUDStore.getState().handleLogout()
                          }}
                          className='skewed hidden cursor-pointer items-center justify-center rounded-md border border-[#C599FFCF] bg-[#17082FB2] p-3 md:flex'
                        >
                          <span>
                            <IoLogOut className='mx-auto my-auto h-6 w-6 fill-white' />
                          </span>
                        </div>
                      )}

                    {showTreasureHuntRewardScreen && <TreasureHuntReward />}
                    {muteUnmuteButtonDesktop}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {(showTreasureHuntScreen ||
        showHowToPlayScreen ||
        (!isPresentationMode && showCart)) && (
        <div className='animate-fade anim-fade-in fixed left-0 top-0 z-[1] h-screen w-screen'></div>
      )}

      <div
        className='menu-transition fixed bottom-0 left-0 z-hudOverlay block h-screen w-full'
        style={{
          visibility: isMobileMenuOpen ? 'visible' : 'hidden',
          top: isMobileMenuOpen ? '0' : '80%',
        }}
        onClick={() => {
          SoundsStore.getState().playClickSoundOnce()
          setIsMobileMenuOpen(false)
        }}
      >
        <GradientBorder className='absolute bottom-0 left-0 w-full rounded-t-xl'>
          <div
            onClick={(e) => e.stopPropagation()}
            className='z-[2147483647] rounded-t-xl bg-[#17082F] p-4 pb-8'
          >
            <div className='flex w-full items-center justify-between'>
              <h3 className='text-2xl text-white'>Menu</h3>
              <Button
                className={
                  'flex h-7 w-7 items-center justify-center rounded-full border border-[#C599FFCF]'
                }
                onClick={() => {
                  SoundsStore.getState().playClickSoundOnce()
                  setIsMobileMenuOpen(false)
                }}
              >
                <IoCloseSharp className='h-4 w-4 fill-[#C599FFCF]' />
              </Button>
            </div>
            <div className='mt-4 grid h-auto w-full grid-cols-2 flex-wrap justify-start gap-6 overflow-auto short:gap-2'>
              <div
                className='flex h-[180px] flex-col items-center justify-center rounded-xl border border-[#C599FFCF] short:h-[80px]'
                onClick={() => {
                  SoundsStore.getState().playClickSoundOnce()
                  setShowCart(true)
                  setIsMobileMenuOpen(false)
                }}
              >
                <AiOutlineShoppingCart className='h-8 w-8 fill-white short:h-5 short:w-5' />
                <p className='mt-4 text-xl text-white short:mt-1 short:text-lg'>
                  My Cart
                </p>
              </div>
              <div
                className='flex h-[180px] flex-col items-center justify-center rounded-xl border border-[#C599FFCF] short:h-[80px]'
                onClick={() => {
                  SoundsStore.getState().playClickSoundOnce()
                  setShowChatbox(true)
                  setIsMobileMenuOpen(false)
                }}
              >
                <HiChatAlt2 className='h-8 w-8 fill-white short:h-5 short:w-5' />

                <p className='mt-4 text-xl text-white short:mt-1 short:text-lg'>
                  Open Chat
                </p>
              </div>
              {/* <div
                className='flex h-[180px] flex-col items-center justify-center rounded-xl border border-[#C599FFCF] short:h-[80px]'
                onClick={() => {
                  setShowTreasureHuntScreen(true)
                  setIsMobileMenuOpen(false)
                }}
              >
                <AiFillTrophy className='h-8 w-8 fill-white short:h-5 short:w-5  ' />
                <p className='mt-4 text-xl text-white short:mt-1 short:text-lg'>
                  My Rewards
                </p>
              </div> */}
              <div
                className='flex h-[180px] flex-col items-center justify-center rounded-xl border border-[#C599FFCF] short:h-[80px]'
                onClick={() => {
                  SoundsStore.getState().playClickSoundOnce()
                  setShowHowToPlayScreen(true)
                  setIsMobileMenuOpen(false)
                }}
              >
                <Button className='h-8 w-8 shrink-0 rounded-full bg-white short:h-5 short:w-5'>
                  <IoInformationSharp className='mx-auto fill-[#17082FB2] stroke-[#17082FB2] stroke-2' />
                </Button>
                <p className='mt-4 text-xl text-white short:mt-1 short:text-lg'>
                  More Info
                </p>
              </div>

              <div
                className='flex h-[180px] flex-col items-center justify-center rounded-xl border border-[#C599FFCF] short:h-[80px]'
                onClick={OpenAvatarSelectionMenu}
              >
                <Button className='h-8 w-8 shrink-0 rounded-full bg-white short:h-5 short:w-5'>
                  <IoBody className='mx-auto fill-[#17082FB2] stroke-[#17082FB2] stroke-2' />
                </Button>
                <p className='mt-4 text-xl text-white short:mt-1 short:text-lg'>
                  Avatar
                </p>
              </div>
              {isLoggedIn && (
                <div
                  className='flex h-[180px] flex-col items-center justify-center rounded-xl border border-[#C599FFCF] short:h-[80px]'
                  onClick={() => {
                    SoundsStore.getState().playClickSoundOnce()
                    HUDStore.getState().handleLogout()
                  }}
                >
                  <Button className='h-8 w-8 shrink-0 rounded-full bg-white short:h-5 short:w-5'>
                    <IoLogOut className='mx-auto fill-[#17082FB2] stroke-[#17082FB2] stroke-2' />
                  </Button>
                  <p className='mt-4 text-xl text-white short:mt-1 short:text-lg'>
                    Log Out
                  </p>
                </div>
              )}
              {isLoggedIn && (
                <div
                  className='flex h-[180px] flex-col items-center justify-center rounded-xl border border-[#C599FFCF] short:h-[80px]'
                  onClick={() => {
                    SoundsStore.getState().playClickSoundOnce()
                    setShowGamizeMenu(true)
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <Button className='h-8 w-8 shrink-0 rounded-full bg-white short:h-5 short:w-5'>
                    <FaGamepad className='mx-auto fill-[#17082FB2] stroke-[#17082FB2] stroke-2' />
                  </Button>
                  <p className='mt-4 text-xl text-white short:mt-1 short:text-lg'>
                    Play & Earn
                  </p>
                </div>
              )}
              <div
                className='flex h-[180px] flex-col items-center justify-center rounded-xl border border-[#C599FFCF] short:h-[80px]'
                onClick={() => {
                  SoundsStore.getState().playClickSoundOnce()
                  GesturesAndDeviceStore.getState().toggleFullscreen()
                }}
              >
                <Button className='h-8 w-8 shrink-0 rounded-full bg-white short:h-5 short:w-5'>
                  {isInFullscreen ? (
                    <BsFullscreenExit className='mx-auto fill-[#17082FB2] stroke-[#17082FB2] stroke-2' />
                  ) : (
                    <BsFullscreen className='mx-auto fill-[#17082FB2] stroke-[#17082FB2] stroke-2' />
                  )}
                </Button>
                <p className='mt-4 text-xl text-white short:mt-1 short:text-lg'>
                  {isInFullscreen ? 'Exit Fullscreen' : 'Go Fullscreen'}
                </p>
              </div>
              {muteUnmuteButtonMobile}
            </div>
          </div>
        </GradientBorder>
      </div>
    </>
  )
}
