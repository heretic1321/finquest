
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'

const iconStyles = {
  icon: `h-[45px] object-contain`,
}

const textStyles = {
  title: 'py-2 pb-6',
  description: 'py-2 text-sm',
}

const Controls = () => {
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)

  return (
    <div className='flex flex-col items-center gap-0 font-bold md:flex-row md:gap-4 md:py-4'>
      <div className='hidden w-full flex-col items-center justify-center p-3 md:flex md:w-1/3'>
        <p className={textStyles.title}>Movement</p>
        <div className='my-3 h-[100px] max-w-full'>
          <img
            src='/assets/images/WASD.png'
            className='mx-auto h-full w-full object-contain'
            alt=''
          />
        </div>
        <p className={textStyles.description}>
          Use the WASD or arrow keys to move
        </p>
      </div>
      {isTouchDevice ? (
        <>
          <div className='flex w-full flex-col items-start justify-center p-3 md:w-1/3'>
            <p className='mx-auto py-2 pb-6'>Look Around</p>
            <div className='flex items-center gap-2 py-3'>
              <img
                className={iconStyles.icon}
                src='/assets/images/drag-screen-icon.svg'
                alt=''
              />
              <p className='ml-4 py-2 text-sm'>Drag on screen to pan view</p>
            </div>
            <div className='flex items-center gap-2 py-3'>
              <img
                className={iconStyles.icon}
                src='/assets/images/pinch-to-zoom.svg'
                alt=''
              />
              <p className='ml-4 py-2 text-sm'>Pinch to Zoom in and out</p>
            </div>
          </div>
          <div className='flex w-full flex-col items-start justify-center p-3 text-left md:w-1/3'>
            <p className='mx-auto py-2 pb-6'>Actions</p>
            <div className='flex items-center gap-2 py-3'>
              <img
                className={iconStyles.icon}
                src='/assets/images/hold-and-drag.svg'
                alt=''
              />
              <p className='ml-4 py-2 text-sm'>
                Hold and drag left joystick to move
              </p>
            </div>
            <div className='flex items-center gap-2 py-3'>
              <img
                className={iconStyles.icon}
                src='/assets/images/tap-right-jump.svg'
                alt=''
              />
              <p className='ml-4 py-2 text-sm'>Tap right button to Jump</p>
            </div>
            <div className='flex items-center gap-2 py-3'>
              <img
                className={iconStyles.icon}
                src='/assets/images/tap-to-interact.svg'
                alt=''
              />
              <p className='ml-4 py-2 text-sm'>
                Tap on objects to interact with them
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className='flex w-full flex-col items-start justify-center p-3 md:w-1/3'>
            <p className='mx-auto py-2 pb-6'>Look Around</p>
            <div className='flex items-center gap-2 py-3'>
              <img
                className={iconStyles.icon}
                src='/assets/images/MouseClick.svg'
                alt=''
              />
              <p className='ml-4 py-2 text-sm'>Click and drag to pan view</p>
            </div>
            <div className='flex items-center gap-2 py-3'>
              <img
                className={iconStyles.icon}
                src='/assets/images/MouseScroll.svg'
                alt=''
              />
              <p className='ml-4 py-2 text-sm'>Scroll to Zoom in and out</p>
            </div>
          </div>
          <div className='flex w-full flex-col items-start justify-center p-3 text-left md:w-1/3'>
            <p className='mx-auto py-2 pb-6'>Actions</p>
            <div className='flex items-center gap-2 py-3'>
              <img
                className={iconStyles.icon}
                src='/assets/images/E.svg'
                alt=''
              />
              <p className='ml-4 py-2 text-sm'>Hold shift to Run</p>
            </div>
            <div className='flex items-center gap-2 py-3'>
              <img
                className={iconStyles.icon}
                src='/assets/images/SHIFT.svg'
                alt=''
              />
              <p className='ml-4 py-2 text-sm'>
                Press 'E' to interact with Items
              </p>
            </div>
            <div className='flex items-center gap-2 py-3'>
              <img
                className={iconStyles.icon}
                src='/assets/images/SPACE.svg'
                alt=''
              />
              <p className='ml-4 py-2 text-sm'>Press Spacebar to Jump</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Controls
