
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi'

import { CollectionStore } from '@client/contexts/CollectionContext'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { useShallow } from 'zustand/react/shallow'

const Carousel = () => {
  const {
    showcaseActiveItemIndex,
    setShowcaseActiveItemIndex,
    showcaseActiveGroupIndex,
  } = HUDStore(
    useShallow((state) => ({
      showcaseActiveItemIndex: state.showcaseActiveItemIndex,
      setShowcaseActiveItemIndex: state.setShowcaseActiveItemIndex,
      showcaseActiveGroupIndex: state.showcaseActiveGroupIndex,
    }))
  )
  const groups = CollectionStore((state) => state.groups)
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)

  // dynamic icon size based on screen width

  const handleLeft = () => {
    if (!groups) return

    let newItemIndex = showcaseActiveItemIndex - 1

    if (newItemIndex < 0) {
      newItemIndex = groups[showcaseActiveGroupIndex].slots.length - 1
    }
    setShowcaseActiveItemIndex(newItemIndex)
  }

  const handleRight = () => {
    if (!groups) return

    let newItemIndex = showcaseActiveItemIndex + 1

    if (newItemIndex > groups[showcaseActiveGroupIndex].slots.length - 1) {
      newItemIndex = 0
    }
    setShowcaseActiveItemIndex(newItemIndex)
  }

  return (
    <div className='pointer-events-auto'>
      <button
        onClick={() => handleLeft()}
        className={`
          absolute left-0 top-[10%] ml-1 rounded-full
          border-[2px] border-[#C599FFCF] bg-[#17082FB2] p-1 transition
          delay-100 ease-in-out hover:scale-110 ${
            isTouchDevice ? 'short:top-[25%]' : 'md:top-[50%]'
          }
        `}
      >
        <HiOutlineChevronLeft className='h-6 w-6 stroke-neutral-300 stroke-1 lg:stroke-2' />
      </button>
      <button
        onClick={() => handleRight()}
        className={`
          absolute right-0 top-[10%] mr-1 max-w-[max-content] rounded-full border-[2px]
          border-[#C599FFCF] bg-[#17082FB2] p-1 transition delay-100 ease-in-out
          hover:scale-110 ${
            isTouchDevice
              ? 'short:top-[25%]'
              : 'md:left-auto md:right-[460px] md:top-[50%]'
          }
        `}
      >
        <HiOutlineChevronRight className='h-6 w-6 stroke-neutral-300 stroke-1 lg:stroke-2' />
      </button>

      <div
        className={`absolute left-1/2 top-[10%] flex h-12 w-[max-content] -translate-x-1/2 items-center gap-2 rounded-full border border-[#C599FFCF] bg-[#17082FB2]  px-3 text-white ${
          isTouchDevice
            ? ''
            : 'md:bottom-10 md:left-[35%] md:top-auto md:gap-4 md:px-6 md:py-3'
        }`}
      >
        <img
          src='/assets/images/MouseClick.svg'
          className='h-6 w-6 object-contain md:h-8 md:w-8'
          alt=''
        />{' '}
        <p className='text-xs md:text-lg'>Click and drag to Interact</p>
      </div>
    </div>
  )
}

export default Carousel
