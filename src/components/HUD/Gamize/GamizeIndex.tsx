import { SoundsStore } from "@client/components/Sounds"
import Modal from "@client/components/shared/Modal"
import { GamizeStore } from "@client/contexts/GamizeContext"
import { GesturesAndDeviceStore } from "@client/contexts/GesturesAndDeviceContext"
import { HUDStore } from "@client/contexts/HUDContext"
import { InventoryConsoleHUDStore } from "@client/contexts/InventoryConsoleHUDContext"
import { useState } from "react"
import { FaGamepad } from "react-icons/fa6"
import { useShallow } from "zustand/react/shallow"

const GamizeGames = () => {
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)
  const [hoveringLeaderboard, setHoveringLeaderboard] = useState(false);

  return (
    <div
      className={`flex flex-col gap-4 ${
        isTouchDevice ? '' : 'md:flex-col md:pt-4'
      }`}
    >
      {
        GamizeStore.getState().ruleNames.map((ruleName, index) => {
          return (
            <div
              className={`
                h-full w-full rounded-lg border 
                border-[#C599FFCF] 
                bg-[#261042] 
                ${!hoveringLeaderboard ? 'hover:bg-radialGradient' : ''} 
                hover:cursor-pointer
                p-4 
                ${isTouchDevice ? '' : ''}
                ${ruleName === 'Metaslotmachine28032024' ? 'flex flex-row justify-between' : ''}
                items-center justify-center
              `}
              onClick={() => {
                SoundsStore.getState().playClickSoundOnce()
                GamizeStore.getState().loadAndRenderTemplate(ruleName)
              }}
              key= {ruleName}
            >
              <div className='yesave text-xl w-max-content'>
                {GamizeStore.getState().ruleDisplayNames[index]}
              </div>
              {
              ruleName === 'Metaslotmachine28032024' && (
                <div
                  className={`
                    h-full rounded-lg border 
                    border-[#C599FFCF] 
                    bg-[#261042] hover:bg-radialGradient 
                    hover:cursor-pointer
                    p-1 ${
                    isTouchDevice ? '' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    SoundsStore.getState().playClickSoundOnce()
                    GamizeStore.getState().loadAndRenderLeaderboard(ruleName)
                  }}
                  key= {ruleName + 'Leaderboard'}
                  onMouseEnter={() => setHoveringLeaderboard(true)}
                  onMouseLeave={() => setHoveringLeaderboard(false)}
                >
                  <div className='yesave text-lg w-max-content'>
                    {'Leaderboard'}
                  </div>
                </div>
              )
            }
            </div>
          )
        })
      }
    </div>
  )
}
 
const GamizeHUD = () => {

  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)
  const {
    hasStartButtonBeenPressed,
    isPresentationMode,
    showGamizeMenu,
    showCart,
    setShowCart,
    setShowChatbox,
    setShowGamizeMenu,
  } = HUDStore(
    useShallow((state) => ({
      hasStartButtonBeenPressed: state.hasStartButtonBeenPressed,
      isPresentationMode: state.isPresentationMode,
      showGamizeMenu: state.showGamizeMenu,
      showCart: state.showCart,
      setShowCart: state.setShowCart,
      setShowChatbox: state.setShowChatbox,
      setShowGamizeMenu: state.setShowGamizeMenu,
    }))
  )

  const inventoryConsoleHUDContext = InventoryConsoleHUDStore(
    useShallow((state) => ({
      isPresentationMode: state.isPresentationMode,
    }))
  )

  const handleGamizeButtonClick = () => {
    SoundsStore.getState().playClickSoundOnce()
    if (!showGamizeMenu) {
      setShowCart(false)
      setShowChatbox(false)
      setShowGamizeMenu(true)
    } else {
      setShowGamizeMenu(false)
    }
  }

  if (
    hasStartButtonBeenPressed &&
    !isPresentationMode &&
    !inventoryConsoleHUDContext.isPresentationMode
  ) return (
    <div className='pointer-events-auto'>
    {!isTouchDevice && !showCart && (
      <div
        onClick={handleGamizeButtonClick}
        className={`skewed  hidden cursor-pointer   items-center justify-center rounded-md border border-[#C599FFCF] ${
          showGamizeMenu ? 'bg-radialGradient' : 'bg-[#17082FB2]'
        } p-3 md:flex `}
      >
        <span>
          <FaGamepad className='h-6 w-6 fill-white  ' />
        </span>
      </div>
    )}

    {showGamizeMenu ? (
      <Modal onClose={handleGamizeButtonClick} title={"Play & Earn!"}>
        <div className='relative z-[10] mb-24 mt-5 rounded-lg border border-[#C599FFCF] bg-[#17082FB2] p-6 py-8 md:mb-0 md:mt-10 md:py-10'>
          <div className='custom-skewed-h-center absolute bottom-[-80px] rounded-md border border-[#C599FFCF] bg-[#17082F]  p-2 md:bottom-[auto] md:left-10 md:top-[-8%] md:translate-x-0'>
            <div className='unskewed'>
              <div className='flex items-center gap-3 text-center text-sm font-bold'>
                <div
                  className={`skewed cursor-pointer rounded-md px-6 py-2 bg-radialGradient`}
                >
                  <span>Games</span>
                </div>
              </div>
            </div>
          </div>
          <GamizeGames />
        </div>
      </Modal>
    ) : null}
  </div>
  )

  return null
}

export default GamizeHUD