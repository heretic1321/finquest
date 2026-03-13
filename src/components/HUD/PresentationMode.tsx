import { IoCloseSharp } from 'react-icons/io5'

import Showcase from '@client/components/HUD/Showcase'
import { HUDStore } from '@client/contexts/HUDContext'
import { useShallow } from 'zustand/react/shallow'
import { SoundsStore } from '../Sounds'
import { trackEvent } from '@client/utils/api'
import { CollectionStore } from '@client/contexts/CollectionContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { getUserID } from '@client/utils/helperFunctions'

// A button to exit presentation mode
const ExitPresentationModeButton = () => {
  const { setIsPresentationModeShuttingDown, setShowcaseActiveItemIndex } =
    HUDStore(
      useShallow((state) => ({
        setIsPresentationModeShuttingDown:
          state.setIsPresentationModeShuttingDown,
        setShowcaseActiveItemIndex: state.setShowcaseActiveItemIndex,
      })),
    )

  return (
    <div
      className='flex w-[max-content] cursor-pointer items-center rounded-lg border-[2px] border-[#C599FFCF] bg-[#17082FB2] p-2'
      onClick={() => {
        const insideStore = genericStore.getState().insideStore
        const groupDataCache = CollectionStore.getState().groupDataCache
        const showcaseActiveGroupIndex =
          HUDStore.getState().showcaseActiveGroupIndex
        trackEvent(
          'Presentation_Interactions',
          {
            action: 'Close_Showcase',
            showcase_name:
              insideStore &&
              groupDataCache?.[insideStore] &&
              groupDataCache[insideStore]?.[showcaseActiveGroupIndex] &&
              groupDataCache[insideStore]?.[showcaseActiveGroupIndex]?.name
                ? groupDataCache[insideStore][showcaseActiveGroupIndex].name
                : 'Unknown Showcase',
            store_name: insideStore || 'Unknown Store',
          },
          getUserID(),
        )
        SoundsStore.getState().playClickSoundOnce()
        setIsPresentationModeShuttingDown(true)
        setShowcaseActiveItemIndex(-1)
      }}
    >
      <div className='flex h-12 w-12 items-center justify-center rounded-lg border border-[#C599FFCF] bg-radialGradient p-2 '>
        <IoCloseSharp className='h-10 w-10 fill-neutral-300'></IoCloseSharp>
      </div>
      <p className='pl-4 pr-6 font-semibold text-white'>
        Close
        <br />
        Showcase
      </p>
    </div>
  )
}

const PresentationMode = () => {
  const {
    isShowcaseMode,
    isShowcaseModeStartingUp,
    isShowcaseModeShuttingDown,
  } = HUDStore(
    useShallow((state) => ({
      isShowcaseMode: state.isShowcaseMode,
      isShowcaseModeStartingUp: state.isShowcaseModeStartingUp,
      isShowcaseModeShuttingDown: state.isShowcaseModeShuttingDown,
    })),
  )

  return (
    <>
      {!isShowcaseModeShuttingDown &&
        !isShowcaseModeStartingUp &&
        isShowcaseMode && <Showcase />}
      {!isShowcaseMode && (
        <div className='absolute left-1/2 top-[30%] z-[2147483640] flex -translate-x-1/2 items-end justify-center'>
          <ExitPresentationModeButton />
        </div>
      )}
    </>
  )
}

export default PresentationMode
