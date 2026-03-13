
import Button from '@client/components/shared/Button'
import Modal from '@client/components/shared/Modal'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { useShallow } from 'zustand/react/shallow'

const TreasureHuntReward = () => {
  const {
    setShowTreasureHuntRewardScreen,
    setShowTreasureHuntScreen,
    setCurrentTreasureHuntTab,
    setShowJoystick,
    setShowCart,
    setShowChatbox,
    setIsPresentationMode,
    setIsShowcaseMode,
    showTreasureHuntScreen
  } = HUDStore(
    useShallow((state) => ({
      setShowTreasureHuntRewardScreen: state.setShowTreasureHuntRewardScreen,
      setShowTreasureHuntScreen: state.setShowTreasureHuntScreen,
      setCurrentTreasureHuntTab: state.setCurrentTreasureHuntTab,
      setShowJoystick: state.setShowJoystick,
      setShowCart: state.setShowCart,
      setShowChatbox: state.setShowChatbox,
      setIsPresentationMode: state.setIsPresentationMode,
      setIsShowcaseMode: state.setIsShowcaseMode,
      showTreasureHuntScreen: state.showTreasureHuntScreen
    }))
  )
  const setAreEffectsEnabled = genericStore((state) => state.setAreEffectsEnabled)
  const handleClose = () => {
    setShowTreasureHuntRewardScreen(false)
  }

  const handleOpenRewards = () => {
    setIsPresentationMode(false)
    setIsShowcaseMode(false)
    setAreEffectsEnabled(false)
    setShowTreasureHuntRewardScreen(false)
    setShowJoystick(!setShowJoystick)
    if (!showTreasureHuntScreen) {
      setShowCart(false)
      setShowChatbox(false)
      setShowTreasureHuntScreen(true)
    } else setShowTreasureHuntScreen(false)

    setCurrentTreasureHuntTab('rewards')
  }

  return (
    <Modal
      title='Congratulations!'
      className='w-full max-w-[600px]'
      onClose={handleClose}
    >
      <p className='mt-2 text-center'>
        You have found all the hidden items and we have already credited the
        reward to your account!
      </p>
      <img src='/assets/images/treasureHuntCongratulationsScreen.png' alt='' />
      <Button
        classNames='b-grad w-[fit-content]'
        onClick={() => handleOpenRewards()}
      >
        My Rewards
      </Button>
    </Modal>
  )
}

export default TreasureHuntReward
