
import { AiFillTrophy } from 'react-icons/ai'

import TreasureHuntOptions from '@client/components/HUD/TreasureHunt/TreasureHuntOptions'
import Modal from '@client/components/shared/Modal'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { useShallow } from 'zustand/react/shallow'

const TreasureHunt = () => {
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)
  const {
    showTreasureHuntScreen,
    setShowTreasureHuntScreen,
    setShowCart,
    setShowChatbox,
    currentTreasureHuntTab,
  } = HUDStore(
    useShallow((state) => ({
      showTreasureHuntScreen: state.showTreasureHuntScreen,
      setShowTreasureHuntScreen: state.setShowTreasureHuntScreen,
      setShowCart: state.setShowCart,
      setShowChatbox: state.setShowChatbox,
      currentTreasureHuntTab: state.currentTreasureHuntTab,
    }))
  )

  const handleTreasureButtonClick = () => {
    if (!showTreasureHuntScreen) {
      setShowCart(false)
      setShowChatbox(false)
      setShowTreasureHuntScreen(true)
    } else {
      setShowTreasureHuntScreen(false)
    }
  }

  const getTitle = () => {
    return currentTreasureHuntTab === 'treasure' ? 'My Treasures' : 'My Rewards'
  }

  return (
    <div className='pointer-events-auto'>
      {!isTouchDevice && (
        <div
          onClick={() => handleTreasureButtonClick()}
          className={`skewed  hidden cursor-pointer   items-center justify-center rounded-md border border-[#C599FFCF] ${
            showTreasureHuntScreen ? 'bg-radialGradient' : 'bg-[#17082FB2]'
          } p-3 md:flex `}
        >
          <span>
            <AiFillTrophy className='h-6 w-6 fill-white  ' />
          </span>
        </div>
      )}

      {showTreasureHuntScreen ? (
        <Modal onClose={() => handleTreasureButtonClick()} title={getTitle()}>
          <TreasureHuntOptions
            currentTab={currentTreasureHuntTab}
          />
        </Modal>
      ) : null}
    </div>
  )
}

export default TreasureHunt
