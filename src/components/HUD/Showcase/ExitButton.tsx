
import { IoCloseSharp } from 'react-icons/io5'

import Button from '@client/components/shared/Button'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { cleanupCamwearaTryOn } from '@client/hooks/useCamwearaTryOn'
import { useShallow } from 'zustand/react/shallow'

const ExitButton = () => {
  const {
    setIsShowcaseModeShuttingDown,
    setSelectedPanel,
    setIsShowCaseDetailsPanelExpanded,
    setShowCart,
  } = HUDStore(
    useShallow((state) => ({
      setIsShowcaseModeShuttingDown: state.setIsShowcaseModeShuttingDown,
      setSelectedPanel: state.setSelectedPanel,
      setIsShowCaseDetailsPanelExpanded: state.setIsShowCaseDetailsPanelExpanded,
      setShowCart: state.setShowCart,
    }))
  )

  const setAreEffectsEnabled = genericStore((state) => state.setAreEffectsEnabled)

  const handleClick = () => {
    setIsShowCaseDetailsPanelExpanded(false)
    setSelectedPanel('details')
    setShowCart(false)
    cleanupCamwearaTryOn()
    setAreEffectsEnabled(false)
    setIsShowcaseModeShuttingDown(true)
  }

  return (
    <div className='absolute -top-10 right-0'>
      <Button
        className='pointer-events-auto h-8 w-8 rounded-full border-[2px] border-[#C599FFCF] bg-[#17082FB2]'
        onClick={handleClick}
      >
        <IoCloseSharp className='mx-auto my-auto h-2/3 w-2/3 fill-neutral-300'></IoCloseSharp>
      </Button>
    </div>
  )
}

export default ExitButton
