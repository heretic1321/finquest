import { useEffect, useState } from 'react'

import { useControls } from 'leva'

import { CharacterRef } from '@client/components/Character'
import NPC from '@client/components/shared/NPC'
import { tourGuide } from '@client/config/dimensions'
import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { useShallow } from 'zustand/react/shallow'

type TourGuideProps = {
  characterRef: React.MutableRefObject<CharacterRef | null>
}

const TourGuide = (props: TourGuideProps) => {
  const isDebugMode = genericStore((state) => state.isDebugMode)

  const {
    setIsPresentationModeStartingUp,
    setShowcaseActiveGroupIndex,
    setShowcaseActiveItemIndex,
    setShowTreasureHuntScreen,
    setShowChatbox,
    setIsShowcaseModeStartingUp,
    isTransitionToPresentationModeComplete,
    setIsPresentationModeShuttingDown,
    isTransitionFromShowcaseModeComplete,
    setIsShowcaseModeShuttingDown,
    setPresentationModeActiveGroupIndex,
    setCurrentTreasureHuntTab,
  } = HUDStore(
    useShallow((state) => ({
      setIsPresentationModeStartingUp: state.setIsPresentationModeStartingUp,
      setShowcaseActiveGroupIndex: state.setShowcaseActiveGroupIndex,
      setShowcaseActiveItemIndex: state.setShowcaseActiveItemIndex,
      setShowTreasureHuntScreen: state.setShowTreasureHuntScreen,
      setShowChatbox: state.setShowChatbox,
      setIsShowcaseModeStartingUp: state.setIsShowcaseModeStartingUp,
      isTransitionToPresentationModeComplete:
        state.isTransitionToPresentationModeComplete,
      setIsPresentationModeShuttingDown: state.setIsPresentationModeShuttingDown,
      isTransitionFromShowcaseModeComplete:
        state.isTransitionFromShowcaseModeComplete,
      setIsShowcaseModeShuttingDown: state.setIsShowcaseModeShuttingDown,
      setPresentationModeActiveGroupIndex:
        state.setPresentationModeActiveGroupIndex,
      setCurrentTreasureHuntTab: state.setCurrentTreasureHuntTab,
    }))
  )

  const setAreEffectsEnabled = genericStore((state) => state.setAreEffectsEnabled)

  const [shouldEnterShowcaseMode, setShouldEnterShowcaseMode] = useState(false)
  const [shouldExitPresentationMode, setShouldExitPresentationMode] =
    useState(false)

  const [, , getNPCControls] = useControls(
    'NPC',
    () => ({
      movementSpeed: {
        value: 0.6,
        min: 0,
        max: 1,
        step: 0.01,
      },
      moveAnimationTimescaleFactor: {
        value: 30,
        min: 0,
        max: 100,
        step: 1,
      },
    }),
    {
      collapsed: true,
      render: () => {
        return isDebugMode || false
      },
    },
  )

  const startPresentationMode = () => {
    // set the showcase active group index to the current group index
    setShowcaseActiveGroupIndex(0)
    setPresentationModeActiveGroupIndex(0)
    // enable presentation mode
    setIsPresentationModeStartingUp(true)
  }

  useEffect(() => {
    if (shouldEnterShowcaseMode && isTransitionToPresentationModeComplete) {
      setAreEffectsEnabled(true)
      setShowcaseActiveItemIndex(0)
      setIsShowcaseModeStartingUp(true)
      setShouldEnterShowcaseMode(false)
    }
  }, [shouldEnterShowcaseMode, isTransitionToPresentationModeComplete])

  useEffect(() => {
    if (shouldExitPresentationMode && isTransitionFromShowcaseModeComplete) {
      setIsPresentationModeShuttingDown(true)
      setShouldExitPresentationMode(false)
    }
  }, [shouldExitPresentationMode, isTransitionFromShowcaseModeComplete])

  return (
    <NPC
      name='Tour Guide'
      triggerButton='T'
      characterRef={props.characterRef}
      triggerArea={{ activationRadius: tourGuide.activationRadius }}
      position={tourGuide.tourPath[0]}
      faceUser
      modelPath={staticResourcePaths.gltfFilePaths.guide}
      modelScale={tourGuide.modelScale}
      dialogs={[
        {
          text: "Welcome to Everlite Virtual Store! I'm here to help you navigate this amazing shopping experience. Let's kick things off with a guided tour.",
          name: 'welcome',
        },
        {
          text: "Inside our store, you'll find a dazzling array of jewelry items. Feel free to click or tap on any item to explore it in detail.",
          name: 'showcase',
          onStart() {
            startPresentationMode()
            setShouldEnterShowcaseMode(true)
          },
        },
        {
          text: 'Oh, and here\'s something cool! You can even click on the "Virtual Try on" button to see how the jewelry will look on your face or hand. It\'s like having a personal fitting room right here in the virtual world!',
          name: 'tryon',
          onStart() {
            const tryonButton = document.getElementById('tryonButton')
            if (tryonButton) {
              tryonButton.style.boxShadow = '0 0 0 5px #fff'
            }
          },
          onEnd() {
            const tryonButton = document.getElementById('tryonButton')
            if (tryonButton) {
              tryonButton.style.boxShadow = 'none'
            }
          },
        },
        {
          text: ' If you fall head over heels for a jewelry piece, simply click the "Buy Now" or "Add to Cart" button. To complete your purchase, we\'ll smoothly redirect you to the secure Senco Gold payments page.',
          name: 'buynow',
          onStart() {
            const buyNowButton = document.getElementById('buy-button')
            if (buyNowButton) {
              buyNowButton.style.border = '5px solid #fff'
            }
          },
          onEnd() {
            const buyNowButton = document.getElementById('buy-button')
            if (buyNowButton) {
              buyNowButton.style.border = 'none'
            }
            setAreEffectsEnabled(false)
            setIsShowcaseModeShuttingDown(true)
            setShouldExitPresentationMode(true)
          },
        },
        {
          text: "Brace yourself for some extra excitement! We've got fantastic rewards waiting for you. All you need to do is embark on a thrilling treasure hunt. The Treasure Hunt menu will show you the items you need to find inside our store.",
          name: 'treasureHunt',
          onStart() {
            setShowTreasureHuntScreen(true)
          },
        },
        {
          text: ' Your mission, should you choose to accept it, is to locate these items within the store. You can track your progress from the Treasure Hunt menu, so keep your eyes peeled!',
          name: 'locateItems',
          onStart: () => {
            setCurrentTreasureHuntTab('treasure')
          },
        },
        {
          text: "As you discover the required products, you'll unlock unique reward coupons that can be used for online or offline purchases from the Everlite store. Check out your collected rewards under the My Rewards section. It's like finding hidden treasure but with fabulous discounts!",
          name: 'unlockRewards',
          onStart: () => {
            setCurrentTreasureHuntTab('rewards')
          },
          onEnd: () => {
            setCurrentTreasureHuntTab('treasure')
            setShowTreasureHuntScreen(false)
          },
        },
        {
          text: "Need to chat or mingle with fellow online shoppers? Look no further! You can communicate with other users through this handy chat box. Share your thoughts, ask for opinions, or just make some new friends while you're here.",
          name: 'chat',
          onStart: () => {
            setShowChatbox(true)
          },
          onEnd: () => {
            setShowChatbox(false)
          },
        },
        {
          text: "And that's a wrap! It's time for you to dive in and immerse yourself in our store. Enjoy exploring our stunning jewelry collections, have fun, and make this experience your own. Feel free to ask me anything along the way—I'm here to make your virtual shopping journey a breeze!",
          name: 'end',
        },
      ]}
      movementSpeed={getNPCControls('movementSpeed')}
      portrait='https://api.minimalavatars.com/avatar/random/png'
      animation={{
        idle: {
          name: 'idle',
          fadeIn: 0.3,
          fadeOut: 0.3,
          timeScaleFactor: 0,
        },
        move: {
          name: 'walk',
          fadeIn: 0.3,
          fadeOut: 0.3,
          timeScaleFactor: getNPCControls('moveAnimationTimescaleFactor'),
        },
        talk: {
          name: 'talk',
          fadeIn: 0.3,
          fadeOut: 1,
          timeScaleFactor: 0,
        },
      }}
    />
  )
}

export default TourGuide
