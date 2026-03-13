import React, { useEffect, useState } from 'react'
import { IoCloseSharp, IoInformationSharp } from 'react-icons/io5'
import Button from '@client/components/shared/Button'
import GradientBorder from '@client/components/GradientBorder'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { PlayerConfigStore } from '../Character'
import { useCheckpointStore } from '@client/utils/checkpoint'
import { create } from 'zustand'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { useShallow } from 'zustand/react/shallow'
import { cleanupCamwearaTryOn } from '@client/hooks/useCamwearaTryOn'
import {
  MeteorManagerStore,
  MeteorMiningState,
  RewardMachineMode,
} from '../MeteorMining/MeteorManager'
import { BsInfoLg } from 'react-icons/bs'

interface NPCChatSystemProps {
  dialogs: TDialog[]
  onComplete?: () => void
}

interface BaseDialog {
  id: string
  text: string
  name: string
  isQuestion: boolean
  nextDialogId?: string
  options?: {
    text: string
    callback?: () => void
    nextDialogId?: string
  }[]
}

interface KeyPressDialog extends BaseDialog {
  requiredKey: string
  proceedInstruction?: never
}

interface InstructionDialog extends BaseDialog {
  requiredKey?: never
  proceedInstruction: string
}

interface SimpleDialog extends BaseDialog {
  requiredKey?: never
  proceedInstruction?: never
}

type TDialog = KeyPressDialog | InstructionDialog | SimpleDialog

interface ControlState {
  controlsEnabled: boolean
  setControlsEnabled: (enabled: boolean) => void
}
export const useControlStore = create<ControlState>((set) => ({
  controlsEnabled: true,
  setControlsEnabled: (enabled) => set({ controlsEnabled: enabled }),
}))

export const onboardingDialogs: TDialog[] = [
  {
    id: 'welcome',
    text: 'Hi there! Welcome to Sencoverse – your destination to explore stunning jewelry, play games, and earn rewards. I’m Sia, your guide. Let’s get started!',
    name: 'Sia',
    isQuestion: true,
    options: [
      {
        text: "Let's Go!",
        nextDialogId: 'navigation_tutorial',
      },
      {
        text: 'Skip Onboarding',
      },
    ],
  },
  {
    id: 'navigation_tutorial',
    text: 'First, Let’s get you moving! Use W, A, S, D keys to move around.',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'navigation_tutorial_1',
  },
  {
    id: 'navigation_tutorial_1',
    text: 'Use left-click and drag your mouse to look around.',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'navigation_tutorial_2',
  },
  {
    id: 'navigation_tutorial_2',
    text: 'Let’s give it a try! Move to the glowing checkpoint in front of you.',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'checkpoint_reached',
    proceedInstruction: 'Proceed by moving towards the checkpoint',
  },
  {
    id: 'checkpoint_reached',
    text: 'Great job! You’ve got the hang of moving. Now, press F at the entrance to enter the store ahead.',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'store_entrance',
    requiredKey: 'KeyF',
  },
  {
    id: 'store_entrance',
    text: 'Welcome to our store! Here, you can browse jewelry items, view details, and make purchases. Let me show you how!',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'showcase_interaction',
  },
  {
    id: 'showcase_interaction',
    text: 'Press E to view the available items on this showcase.',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'presentation_mode',
    requiredKey: 'KeyE',
  },
  {
    id: 'presentation_mode',
    text: 'Great! You can click on any item you like to view its details. Give it a try!',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'showcase_mode',
    proceedInstruction: 'Click on an item to view its details',
  },
  {
    id: 'showcase_mode',
    text: 'Here’s the item you selected with all its details. You can add it to your cart, buy it now or use the Next and Previous buttons to explore other items.',
    name: 'Sia',
    isQuestion: true,
    options: [
      {
        text: 'Ok! I got it.',
        nextDialogId: 'close_showcase',
      },
    ],
  },
  {
    id: 'close_showcase',
    text: 'Well done! That’s how easy it is to shop in Sencoverse.',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'after_showcase_mode',
  },
  {
    id: 'after_showcase_mode',
    text: 'Next, I’m taking you to the Meteor Mining game. Hold tight while we teleport to the mining area!',
    name: 'Sia',
    isQuestion: true,
    options: [
      {
        text: 'Let’s goooo!',
        nextDialogId: 'meteor_mining_game',
      },
      {
        text: 'I will pass',
        nextDialogId: 'view_specific_collection',
      },
    ],
  },
  {
    id: 'meteor_mining_game',
    text: "Here's how it works: Meteors are falling across Sencoverse. Click 'Start Mining' to begin. Note: You'll need to be logged in to mine!",
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'collect_mining_rewards',
    proceedInstruction: 'Press F to start mining',
  },
  {
    id: 'collect_mining_rewards',
    text: 'Once mining is complete, collect your resources – gold, silver, or diamonds. You can check your total in the bottom-left corner of your screen.',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'check_meteor_rewards',
    requiredKey: 'KeyF',
  },
  {
    id: 'check_meteor_rewards',
    text: 'Let’s take your collected resources to the ‘Conversion Machine’ to redeem them for rewards. Let’s see what you’ve earned!',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'finish_meteor_mining_game',
    requiredKey: 'KeyF',
  },
  {
    id: 'finish_meteor_mining_game',
    text: 'Looks like you still have a lot of mining to do before you can claim the reward. Best of luck',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'view_specific_collection',
    requiredKey: 'KeyF',
  },
  {
    id: 'view_specific_collection',
    text: 'Great job! You’re all set to enjoy the Sencoverse shopping experience. Where would you like to start?',
    name: 'Sia',
    isQuestion: true,
    options: [
      {
        text: 'OG Store',
        nextDialogId: 'ogstore',
      },
      {
        text: 'Dome Store',
        nextDialogId: 'domestore',
      },
      {
        text: 'Love Store',
        nextDialogId: 'cylinderstore',
      },
      {
        text: 'Tall Store',
        nextDialogId: 'tallstore',
      },
    ],
  },
  {
    id: 'ogstore',
    text: 'Fantastic choice! Let’s take you to the store.',
    name: 'Sia',
    isQuestion: true,
    options: [
      {
        text: 'Take me to the store',
        nextDialogId: 'final_dialog',
      },
    ],
  },
  {
    id: 'domestore',
    text: 'Fantastic choice! Let’s take you to the store.',
    name: 'Sia',
    isQuestion: true,
    options: [
      {
        text: 'Take me to the store',
        nextDialogId: 'final_dialog',
      },
    ],
  },
  {
    id: 'cylinderstore',
    text: 'Fantastic choice! Let’s take you to the store.',
    name: 'Sia',
    isQuestion: true,
    options: [
      {
        text: 'Take me to the store',
        nextDialogId: 'final_dialog',
      },
    ],
  },
  {
    id: 'tallstore',
    text: 'Fantastic choice! Let’s take you to the store.',
    name: 'Sia',
    isQuestion: true,
    options: [
      {
        text: 'Take me to the store',
        nextDialogId: 'final_dialog',
      },
    ],
  },
  {
    id: 'final_dialog',
    text: 'You’re all set! Explore, shop, and play as much as you like. If you need me, just press the ‘i’ icon. Happy shopping!',
    name: 'Sia',
    isQuestion: true,
    options: [
      {
        text: 'Start Exploring',
      },
    ],
  },
]
export const mobileOnboardingDialogs: TDialog[] = [
  {
    id: 'welcome',
    text: 'Hi there! Welcome to Sencoverse – your destination to explore stunning jewelry, play games, and earn rewards. I’m Sia, your guide. Let’s get started!',
    name: 'Sia',
    isQuestion: true,
    options: [
      {
        text: "Let's Go!",
        nextDialogId: 'navigation_tutorial',
      },
      {
        text: 'Skip Onboarding',
      },
    ],
  },
  {
    id: 'navigation_tutorial',
    text: 'First, Let’s get you moving! Use the joystick on the left to move around.',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'navigation_tutorial_1',
  },
  {
    id: 'navigation_tutorial_1',
    text: 'Drag your fingers across the screen to look around.',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'navigation_tutorial_2',
  },
  {
    id: 'navigation_tutorial_2',
    text: 'Let’s give it a try! Move to the glowing checkpoint in front of you.',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'checkpoint_reached',
    proceedInstruction: 'Proceed by moving towards the checkpoint',
  },
  {
    id: 'checkpoint_reached',
    text: 'Great job! You’ve got the hang of moving.',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'store_entrance',
    requiredKey: 'KeyEnter Store',
  },
  {
    id: 'store_entrance',
    text: 'Welcome to our store! Here, you can browse jewelry items, view details, and make purchases. Let me show you how!',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'showcase_interaction',
  },
  {
    id: 'showcase_interaction',
    text: 'Tap "Open Showcase" button to view the available items on this showcase.',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'presentation_mode',
    requiredKey: 'KeyOpen Showcase',
  },
  {
    id: 'presentation_mode',
    text: 'Great! You can click on any item you like to view its details. Give it a try!',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'showcase_mode',
    proceedInstruction: 'Click on an item to view its details',
  },
  {
    id: 'showcase_mode',
    text: 'Here’s the item you selected with all its details. You can add it to your cart, buy it now or use the Next and Previous buttons to explore other items.',
    name: 'Sia',
    isQuestion: true,
    options: [
      {
        text: 'Ok! I got it.',
        nextDialogId: 'close_showcase',
      },
    ],
  },
  {
    id: 'close_showcase',
    text: 'Well done! That’s how easy it is to shop in Sencoverse.',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'after_showcase_mode',
  },
  {
    id: 'after_showcase_mode',
    text: 'Next, I’m taking you to the Meteor Mining game. Hold tight while we teleport to the mining area!',
    name: 'Sia',
    isQuestion: true,
    options: [
      {
        text: 'Let’s goooo!',
        nextDialogId: 'meteor_mining_game',
      },
      {
        text: 'I will pass',
        nextDialogId: 'view_specific_collection',
      },
    ],
  },
  {
    id: 'meteor_mining_game',
    text: "Here's how it works: Meteors are falling across Sencoverse. Click 'Start Mining' to begin. Note: You'll need to be logged in to mine!",
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'collect_mining_rewards',
    proceedInstruction: 'Press Start Mining to proceed',
  },
  {
    id: 'collect_mining_rewards',
    text: 'Once mining is complete, collect your resources – gold, silver, or diamonds. You can check your total in the top-right corner of your screen.',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'check_meteor_rewards',
    requiredKey: 'KeyCollect Resources',
  },
  {
    id: 'check_meteor_rewards',
    text: 'Let’s take your collected resources to the ‘Conversion Machine’ to redeem them for rewards. Let’s see what you’ve earned!',
    name: 'Sia',
    isQuestion: false,
    nextDialogId: 'finish_meteor_mining_game',
    requiredKey: 'KeyActivate Redeem Machine',
  },
  {
    id: 'finish_meteor_mining_game',
    text: 'Looks like you still have a lot of mining to do before you can claim the reward. Best of luck!',
    name: 'Sia',
    isQuestion: true,
    options: [
      {
        text: 'Exit',
        nextDialogId: 'view_specific_collection',
      },
    ],
  },
  {
    id: 'view_specific_collection',
    text: 'Great job! You’re all set to enjoy the Sencoverse shopping experience. Where would you like to start?',
    name: 'Sia',
    isQuestion: true,
    options: [
      {
        text: 'OG Store',
        nextDialogId: 'ogstore',
      },
      {
        text: 'Dome Store',
        nextDialogId: 'domestore',
      },
      {
        text: 'Love Store',
        nextDialogId: 'cylinderstore',
      },
      {
        text: 'Tall Store',
        nextDialogId: 'tallstore',
      },
    ],
  },
  {
    id: 'ogstore',
    text: 'Fantastic choice! Let’s take you to the store.',
    name: 'Sia',
    isQuestion: true,
    options: [
      {
        text: 'Take me to the store',
        nextDialogId: 'final_dialog',
      },
    ],
  },
  {
    id: 'domestore',
    text: 'Fantastic choice! Let’s take you to the store.',
    name: 'Sia',
    isQuestion: true,
    options: [
      {
        text: 'Take me to the store',
        nextDialogId: 'final_dialog',
      },
    ],
  },
  {
    id: 'cylinderstore',
    text: 'Fantastic choice! Let’s take you to the store.',
    name: 'Sia',
    isQuestion: true,
    options: [
      {
        text: 'Take me to the store',
        nextDialogId: 'final_dialog',
      },
    ],
  },
  {
    id: 'tallstore',
    text: 'Fantastic choice! Let’s take you to the store.',
    name: 'Sia',
    isQuestion: true,
    options: [
      {
        text: 'Take me to the store',
        nextDialogId: 'final_dialog',
      },
    ],
  },
  {
    id: 'final_dialog',
    text: 'You’re all set! Explore, shop, and play as much as you like. If you need me, just press the ‘i’ icon. Happy shopping!',
    name: 'Sia',
    isQuestion: true,
    options: [
      {
        text: 'Start Exploring',
      },
    ],
  },
]
const NPCChatSystem: React.FC<NPCChatSystemProps> = ({
  dialogs,
  onComplete,
}) => {
  const [showDialogScreen, setShowDialogScreen] = useState(false)
  const [parsedDialogList, setParsedDialogList] = useState<string[]>([])
  const [activeDialogIndex, setActiveDialogIndex] = useState(-1)
  const breakpoint = GesturesAndDeviceStore((state) => state.breakpoint)
  const [isDialogPanelExpanded, setIsDialogPanelExpanded] = useState(true)
  const setCheckpoint = useCheckpointStore((state) => state.setCheckpoint)
  const isCheckpointReached = useCheckpointStore(
    (state) => state.checkpointReached,
  )
  const setCheckpointReached = useCheckpointStore(
    (state) => state.setCheckpointReached,
  )
  const setControlsEnabled = useControlStore(
    (state) => state.setControlsEnabled,
  )
  const isBuildingLoading = genericStore((state) => state.isBuildingLoading)

  const {
    isShowcaseMode,
    isPresentationMode,
    isTransitionFromPresentationModeComplete,
    isPresentationModeShuttingDown,
    setIsPresentationModeShuttingDown,
    setShowcaseActiveItemIndex,
    isTransitionFromShowcaseModeComplete,
    isShowcaseModeShuttingDown,
    setIsShowcaseModeShuttingDown,
    setSelectedPanel,
    setIsShowCaseDetailsPanelExpanded,
    setShowCart,
    setStoreRequestedToExit,
    setIsTutorialPromptShown,
    isEnterStorePromptShown,
  } = HUDStore(
    useShallow((state) => ({
      isShowcaseMode: state.isShowcaseMode,
      isPresentationMode: state.isPresentationMode,
      isTransitionFromPresentationModeComplete:
        state.isTransitionFromPresentationModeComplete,
      isPresentationModeShuttingDown: state.isPresentationModeShuttingDown,
      setIsPresentationModeShuttingDown:
        state.setIsPresentationModeShuttingDown,
      setShowcaseActiveItemIndex: state.setShowcaseActiveItemIndex,
      isTransitionFromShowcaseModeComplete:
        state.isTransitionFromShowcaseModeComplete,
      isShowcaseModeShuttingDown: state.isShowcaseModeShuttingDown,
      setIsShowcaseModeShuttingDown: state.setIsShowcaseModeShuttingDown,
      setSelectedPanel: state.setSelectedPanel,
      setIsShowCaseDetailsPanelExpanded:
        state.setIsShowCaseDetailsPanelExpanded,
      setShowCart: state.setShowCart,
      setStoreRequestedToExit: state.setStoreRequestedToExit,
      setIsTutorialPromptShown: state.setIsTutorialPromptShown,
      isEnterStorePromptShown: state.isEnterStorePromptShown,
    })),
  )
  const isTutorialEnabled = genericStore((state) => state.isTutorialEnabled)
  const currentTutorialDialogId = genericStore(
    (state) => state.currentTutorialDialogId,
  )
  const setAreEffectsEnabled = genericStore(
    (state) => state.setAreEffectsEnabled,
  )
  const appendDialogToList = (text: string) => {
    setParsedDialogList((prevList) => [...prevList, text])
  }
  const changeDialog = (index: number) => {
    appendDialogToList(dialogs[index].id)
    setActiveDialogIndex(index)
    genericStore.setState({ currentTutorialDialogId: dialogs[index].id })
  }
  const {
    rewardMachineMode,
    meteorMiningStates,
    currentlyInteractingWithMeteorIndex,
  } = MeteorManagerStore(
    useShallow((state) => ({
      rewardMachineMode: state.rewardMachineMode,
      meteorMiningStates: state.meteorMiningStates,
      currentlyInteractingWithMeteorIndex:
        state.currentlyInteractingWithMeteorIndex,
    })),
  )
  const moveToNextTutorialDialog = genericStore(
    (state) => state.moveToNextTutorialDialog,
  )
  const setMoveToNextTutorialDialog = genericStore(
    (state) => state.setMoveToNextTutorialDialog,
  )
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)
  useEffect(() => {
    if (moveToNextTutorialDialog) {
      changeDialog(dialogs.findIndex((d) => d.id === 'store_entrance'))
      setMoveToNextTutorialDialog(false)
    }
  }, [moveToNextTutorialDialog])
  useEffect(() => {
    if (isTutorialEnabled) {
      if (isBuildingLoading) {
        setShowDialogScreen(false)
      } else if (!isBuildingLoading) {
        setShowDialogScreen(true)
      }
    }
  }, [isBuildingLoading])
  useEffect(() => {
    if (currentTutorialDialogId === null) return
    if (isTutorialEnabled) {
      if (
        currentTutorialDialogId === 'navigation_tutorial' ||
        currentTutorialDialogId === 'navigation_tutorial_2'
      ) {
        PlayerConfigStore.getState().isPlayerParalysedRef.current = false
        genericStore.getState().showJoystickAndJumpButton()
        return disableControlsExcept(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyF'])
      } else {
        PlayerConfigStore.getState().isPlayerParalysedRef.current = true
        setTimeout(() => {
          genericStore.getState().hideJoystickAndJumpButton()
        }, 500)
        return () => {}
      }
    }
  }, [currentTutorialDialogId])
  useEffect(() => {
    if (isShowcaseMode) {
      changeDialog(dialogs.findIndex((d) => d.id === 'showcase_mode'))
    }
  }, [isShowcaseMode])
  useEffect(() => {
    if (isShowcaseModeShuttingDown) {
      setShowDialogScreen(false)
    }
  }, [isShowcaseModeShuttingDown])
  useEffect(() => {
    if (isTutorialEnabled && isTransitionFromShowcaseModeComplete) {
      changeDialog(dialogs.findIndex((d) => d.id === 'close_showcase'))
      setShowDialogScreen(true)
    }
  }, [isTransitionFromShowcaseModeComplete])
  useEffect(() => {
    if (isPresentationMode) {
      changeDialog(dialogs.findIndex((d) => d.id === 'presentation_mode'))
    }
  }, [isPresentationMode])
  useEffect(() => {
    if (isPresentationModeShuttingDown) {
      setShowDialogScreen(false)
    }
  }, [isPresentationModeShuttingDown])

  useEffect(() => {
    if (isTutorialEnabled && isTransitionFromPresentationModeComplete) {
      // if parsedDialogList contains 'presentation_mode' and 'showcase_mode' then changeDialog to 'close_showcase'
      if (
        parsedDialogList.includes('presentation_mode') &&
        parsedDialogList.includes('showcase_mode')
      ) {
        changeDialog(dialogs.findIndex((d) => d.id === 'after_showcase_mode'))
        setShowDialogScreen(true)
      }
      //if it does contain 'presentation_mode but not 'showcase_mode' then changeDialog to 'presentation_mode'
      else if (
        parsedDialogList.includes('presentation_mode') &&
        !parsedDialogList.includes('showcase_mode')
      ) {
        changeDialog(dialogs.findIndex((d) => d.id === 'showcase_interaction'))
        setShowDialogScreen(true)
      }
    }
  }, [isTransitionFromPresentationModeComplete])

  useEffect(() => {
    if (isTutorialEnabled) {
      setIsTutorialPromptShown(false)
      changeDialog(0)
      setShowDialogScreen(true)
    } else {
      if (genericStore.getState().isTutorialNPCActive) {
        genericStore.setState({ isTutorialNPCActive: false })
      }
    }
  }, [isTutorialEnabled])

  useEffect(() => {
    const closeHandler = () => {
      setShowDialogScreen(false)
    }
    window.addEventListener('closeDialog', closeHandler)
    return () => window.removeEventListener('closeDialog', closeHandler)
  }, [])

  const handleNext = (nextOption?: string) => {
    const currentDialog = dialogs[activeDialogIndex]
    if (currentDialog.id === 'navigation_tutorial_2') {
      return
    }
    if (currentDialog.id === 'checkpoint_reached') {
      return
    }
    if (currentDialog.id === 'presentation_mode') {
      return
    }
    if (currentDialog.id === 'showcase_mode') {
      setIsShowCaseDetailsPanelExpanded(false)
      setSelectedPanel('details')
      setShowCart(false)
      cleanupCamwearaTryOn()
      setAreEffectsEnabled(false)
      setIsShowcaseModeShuttingDown(true)
      setShowDialogScreen(false)
    }
    if (currentDialog.id === 'close_showcase') {
      setIsPresentationModeShuttingDown(true)
      setShowDialogScreen(false)
      setShowcaseActiveItemIndex(-1)
    }

    if (
      currentDialog.id === 'ogstore' ||
      currentDialog.id === 'domestore' ||
      currentDialog.id === 'cylinderstore' ||
      currentDialog.id === 'tallstore'
    ) {
      setStoreRequestedToExit({
        nameOfStoreToExit: 'hub',
        exitingVia: 'portal',
        nameOfStoreIfExitingViaPortal: currentDialog.id,
      })
    }
    if (nextOption === 'meteor_mining_game') {
      setStoreRequestedToExit({
        nameOfStoreToExit: 'hub',
        exitingVia: 'gate',
        locationToTeleport: 'meteorMiningPosition',
      })
    }
    if (currentDialog.id === 'meteor_mining_game') {
      if (
        currentlyInteractingWithMeteorIndex &&
        meteorMiningStates[currentlyInteractingWithMeteorIndex] !==
          MeteorMiningState.ONGOING
      ) {
        return
      }
    }
    if (currentDialog.id === 'finish_meteor_mining_game') {
      MeteorManagerStore.setState({
        rewardMachineMode: RewardMachineMode.TRAVELLING_INSIDE_TO_OUTSIDE,
      })
      HUDStore.setState({ isRedeemMachineScreenUIVisible: false })
      return
    }

    if (nextOption) {
      const nextIndex = dialogs.findIndex((d) => d.id === nextOption)
      changeDialog(nextIndex)
      return
    }
    if (currentDialog.nextDialogId) {
      const nextDialogID = currentDialog.nextDialogId
      const nextDialogIndex = dialogs.findIndex((d) => d.id === nextDialogID)
      if (nextDialogID === 'navigation_tutorial_2') {
        const checkpointPos: [number, number, number] = [
          0.21540790134725252, 2.9516449110412597, 39.682220968449926,
        ]
        setCheckpoint(true, checkpointPos)
      }
      if (nextDialogID === 'check_meteor_rewards') {
        return
      }
      changeDialog(nextDialogIndex)
    } else {
      handleClose()
      if (onComplete) onComplete()
    }
  }
  useEffect(() => {
    if (rewardMachineMode === RewardMachineMode.TRAVELLING_INSIDE_TO_OUTSIDE) {
      changeDialog(
        dialogs.findIndex((d) => d.id === 'view_specific_collection'),
      )
    }
    if (rewardMachineMode === RewardMachineMode.TRAVELLING_OUTSIDE_TO_INSIDE) {
      changeDialog(
        dialogs.findIndex((d) => d.id === 'finish_meteor_mining_game'),
      )
    }
  }, [rewardMachineMode])

  const handleCheckpointReached = () => {
    setCheckpoint(false, null)
    const nextIndex = dialogs.findIndex((d) => d.id === 'checkpoint_reached')
    if (nextIndex !== -1) {
      changeDialog(nextIndex)
    }
  }
  useEffect(() => {
    if (isCheckpointReached && isEnterStorePromptShown && !parsedDialogList.includes('checkpoint_reached')) {
      handleCheckpointReached()
    }
  }, [isCheckpointReached, isEnterStorePromptShown])

  const disableControlsExcept = (allowedKeys: string[]) => {
    // Enable all controls if no specific keys are provided
    if (allowedKeys.length === 0) {
      setControlsEnabled(true)
      // Still return a cleanup function for consistency
      return () => {}
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!allowedKeys.includes(event.code)) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    // Disable controls through the control store
    setControlsEnabled(false)

    // Add key listener for preventing non-allowed keys
    window.addEventListener('keydown', handleKeyDown, true)

    // Return cleanup function
    return () => {
      setControlsEnabled(true)
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }

  useEffect(() => {
    if (!showDialogScreen) return

    const currentDialog = dialogs[activeDialogIndex]
    if (!currentDialog.requiredKey) return

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === currentDialog.requiredKey) {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [activeDialogIndex, showDialogScreen])

  // Add useEffect to watch mining state changes
  useEffect(() => {
    const currentDialog = dialogs[activeDialogIndex]
    if (currentDialog?.id === 'meteor_mining_game') {
      if (
        currentlyInteractingWithMeteorIndex === null ||
        currentlyInteractingWithMeteorIndex === undefined
      )
        return

      const miningState =
        meteorMiningStates[currentlyInteractingWithMeteorIndex]

      if (miningState === MeteorMiningState.ONGOING) {
        changeDialog(
          dialogs.findIndex((d) => d.id === 'collect_mining_rewards'),
        )
      }
    }
    if (currentDialog?.id === 'collect_mining_rewards') {
      if (
        currentlyInteractingWithMeteorIndex === null ||
        currentlyInteractingWithMeteorIndex === undefined
      )
        return

      const miningState =
        meteorMiningStates[currentlyInteractingWithMeteorIndex]

      if (miningState === MeteorMiningState.REWARDS_COLLECTED) {
        setStoreRequestedToExit({
          nameOfStoreToExit: 'hub',
          exitingVia: 'gate',
          locationToTeleport: 'redeemMiningRewards',
        })
        changeDialog(dialogs.findIndex((d) => d.id === 'check_meteor_rewards'))
      }
    }
  }, [meteorMiningStates, activeDialogIndex])
  const handleClose = () => {
    window.dispatchEvent(new CustomEvent('closeDialog'))
    setParsedDialogList([])
    genericStore.setState({ isTutorialEnabled: false })
    PlayerConfigStore.getState().isPlayerParalysedRef.current = false
    setActiveDialogIndex(-1)
    genericStore.setState({ currentTutorialDialogId: null })
    setCheckpointReached(false)
    setCheckpoint(false, null)
    if (isTouchDevice) {
      genericStore.getState().showJoystickAndJumpButton()
    }
  }
  const renderDialogButtons = () => {
    const currentDialog = dialogs[activeDialogIndex]

    // Don't show buttons if waiting for a specific key press
    if (currentDialog.requiredKey || currentDialog.proceedInstruction) {
      return (
        <div className='text-center text-white opacity-70'>
          {currentDialog.requiredKey
            ? `Press ${currentDialog.requiredKey.replace(
                'Key',
                '',
              )} to continue`
            : currentDialog.proceedInstruction}
        </div>
      )
    }

    if (currentDialog.isQuestion) {
      const hasMultipleOptions =
        currentDialog.options && currentDialog.options.length > 3
      return (
        <div
          className={`flex justify-center ${
            hasMultipleOptions && isTouchDevice
              ? 'grid grid-cols-2'
              : 'flex-row'
          } gap-2 lg:flex-row ${
            hasMultipleOptions ? 'w-[calc(100%-2rem)]' : 'w-full lg:w-auto'
          } pr-4`}
        >
          {currentDialog.options?.map((option) => (
            <GradientBorder
              key={option.text}
              className='w-fit max-w-full -skew-x-[10deg] rounded-md'
            >
              <Button
                className='whitespace-normal break-words rounded-md bg-[#17082F] px-4 py-3 text-white'
                onClick={() => {
                  option.callback?.()
                  if (option.nextDialogId) {
                    handleNext(option.nextDialogId)
                  } else {
                    handleNext()
                  }
                }}
              >
                <span className='block skew-x-[10deg]'>{option.text}</span>
              </Button>
            </GradientBorder>
          ))}
        </div>
      )
    }

    return (
      <GradientBorder className='-skew-x-[10deg] rounded-md'>
        <Button
          className='min-w-[180px] rounded-md bg-[#17082F] px-4 py-3 text-white'
          onClick={() => handleNext()}
        >
          <span className='block skew-x-[10deg]'>
            {currentDialog.options?.[0]?.text || 'Next'}
          </span>
        </Button>
      </GradientBorder>
    )
  }

  if (!showDialogScreen) return null
  return (
    <div>
      {dialogs[activeDialogIndex] && (
        <>
          {isDialogPanelExpanded ||
          breakpoint === 'md' ||
          breakpoint === 'lg' ||
          breakpoint === 'xl' ? (
            <GradientBorder
              className={`fixed ${
                currentTutorialDialogId === 'showcase_mode' && isTouchDevice
                  ? 'top-0'
                  : 'bottom-0'
              } z-hud w-full rounded-t-xl md:left-0 md:right-0 md:mx-auto lg:bottom-5 lg:w-[800px] lg:-skew-x-[10deg] lg:rounded-md`}
            >
              <div className='rounded-t-xl bg-[#17082F] p-3 pt-2 lg:w-[800px] lg:rounded-md lg:p-5 lg:pt-5'>
                <div className='mb-4 flex justify-between gap-3'>
                  <div className='relative flex flex-grow flex-col gap-3 md:flex-row lg:skew-x-[10deg]'>
                    <GradientBorder className='absolute -top-[40px] left-0 h-[40px] w-[40px] flex-shrink-0 overflow-hidden rounded-full lg:-left-[90px] lg:top-[85%] lg:h-[130px] lg:h-[80px] lg:w-[130px] lg:w-[80px] lg:-translate-y-1/2'>
                      <div className='h-full w-full rounded-full bg-[#17082F]'>
                        <img
                          className='h-full w-full object-cover'
                          src='/assets/images/sia_dp.png'
                          alt='NPC Portrait'
                        />
                      </div>
                    </GradientBorder>
                    <div className='ml-auto lg:w-[calc(100%-4rem)]'>
                      <p className='text-lg font-semibold text-[#C599FF]'>
                        {dialogs[activeDialogIndex].name}
                      </p>
                      <div className='mt-2 max-h-[500px] overflow-auto lg:max-h-[200px]'>
                        <p className='text-md leading-6 text-white'>
                          {currentTutorialDialogId === 'final_dialog' ? (
                            <span>
                              You're all set! Explore, shop, and play as much as
                              you like. If you need me, just press the{' '}
                              {!isTouchDevice ? (
                                <BsInfoLg className='mx-auto my-auto inline-block h-6 w-6 fill-white' />
                              ) : (
                                <span>
                                  <IoInformationSharp className='mx-auto inline-block fill-white' />{' '}
                                  icon under the{' '}
                                  <svg
                                    width='24'
                                    height='25'
                                    viewBox='0 0 24 25'
                                    fill='none'
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='mx-auto inline-block'
                                  >
                                    <path
                                      d='M3 6.72852H21V8.72852H3V6.72852ZM3 11.7285H21V13.7285H3V11.7285ZM3 16.7285H21V18.7285H3V16.7285Z'
                                      fill='white'
                                    />
                                  </svg>{' '}
                                  section
                                </span>
                              )}
                              . Happy shopping!
                            </span>
                          ) : (
                            dialogs[activeDialogIndex].text
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[#C599FFCF] lg:skew-x-[10deg]'
                    onClick={handleClose}
                  >
                    <IoCloseSharp className='h-4 w-4 fill-[#C599FFCF]' />
                  </Button>
                </div>
                <div className='mt-2 flex justify-center lg:mt-0 lg:justify-end'>
                  {renderDialogButtons()}
                </div>
              </div>
            </GradientBorder>
          ) : (
            <div className='absolute bottom-0 z-hud w-full md:left-0 md:right-0'>
              <div className='flex justify-center'>
                <Button
                  className='w-[max-content] justify-center rounded-t-lg bg-slate-200 px-2 font-bold'
                  onClick={() => setIsDialogPanelExpanded(true)}
                >
                  Show Dialog
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default NPCChatSystem
