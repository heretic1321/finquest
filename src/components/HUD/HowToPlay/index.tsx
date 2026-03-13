
import { BsInfoLg } from 'react-icons/bs'

import HowToPlayOptions from '@client/components/HUD/HowToPlay/HowToPlayOptions'
import Modal from '@client/components/shared/Modal'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { useShallow } from 'zustand/react/shallow'
import { SoundsStore } from '@client/components/Sounds'
import { useEffect } from 'react'
import { genericStore } from '@client/contexts/GlobalStateContext'

const HowToPlay = () => {
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)
  const {
    showHowToPlayScreen,
    setShowHowToPlayScreen,
    setShowCart,
    setShowChatbox,
    currentHowToPlayTab,
    startTutorialUIClicked,
    setStoreRequestedToExit
  } = HUDStore(
    useShallow((state) => ({
      showHowToPlayScreen: state.showHowToPlayScreen,
      setShowHowToPlayScreen: state.setShowHowToPlayScreen,
      setShowCart: state.setShowCart,
      setShowChatbox: state.setShowChatbox,
      currentHowToPlayTab: state.currentHowToPlayTab,
      startTutorialUIClicked: state.startTutorialUIClicked,
      setStoreRequestedToExit: state.setStoreRequestedToExit,
    }))
  )
  const storeName = genericStore((state) => state.insideStore)

  const handleHowToButtonClick = () => {
    SoundsStore.getState().playClickSoundOnce()
    if (!showHowToPlayScreen) {
      setShowCart(false)
      setShowChatbox(false)
      setShowHowToPlayScreen(true)
    } else {
      setShowHowToPlayScreen(false)
    }
  }
  useEffect(() => {
    if (startTutorialUIClicked) {
      setShowHowToPlayScreen(false)
      if (storeName !== null) {
        setStoreRequestedToExit({
          nameOfStoreToExit: storeName,
          exitingVia: 'gate',
          locationToTeleport: 'tutorialStartPosition',
        })
      } else {
        setStoreRequestedToExit({
          nameOfStoreToExit: 'hub',
          exitingVia: 'gate',
          locationToTeleport: 'tutorialStartPosition',
        })
      }
      genericStore.setState({ isTutorialEnabled: true })
      HUDStore.setState({ startTutorialUIClicked: false })
    }
  }, [
    startTutorialUIClicked,
    storeName,
    setShowHowToPlayScreen,
    setStoreRequestedToExit,
  ])

  const getTitle = () => {
    return currentHowToPlayTab === 'controls'
      ? 'Controls'
      : currentHowToPlayTab === 'treasure'
      ? 'How to play Treasure Hunt'
      : currentHowToPlayTab === 'rewards'
      ? 'How to use Rewards'
      : 'How to play'
  }

  return (
    <div className='pointer-events-auto'>
      {!isTouchDevice && (
        <div
          onClick={() => handleHowToButtonClick()}
          className={`skewed  hidden cursor-pointer items-center justify-center rounded-md border border-[#C599FFCF]
        ${showHowToPlayScreen ? 'bg-radialGradient' : 'bg-[#17082FB2]'}
        p-3 md:flex `}
        >
          <span>
            <BsInfoLg className='mx-auto my-auto h-6 w-6 fill-white' />
          </span>
        </div>
      )}

      {showHowToPlayScreen ? (
        <Modal onClose={() => handleHowToButtonClick()} title={getTitle()}>
          <HowToPlayOptions
            currentTab={currentHowToPlayTab}
          />
        </Modal>
      ) : null}
    </div>
  )
}

export default HowToPlay
