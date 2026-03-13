import { IoCloseSharp } from 'react-icons/io5'

import GradientBorder from '@client/components/GradientBorder'
import Button from '@client/components/shared/Button'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { HUDStore } from '@client/contexts/HUDContext'

export type TModalProps = {
  children?: React.ReactNode
  title?: string
  onClose: () => void
  className?: string
  extrasLeft?: React.ReactNode
  extrasRight?: React.ReactNode
}

const Modal = (props: TModalProps) => {
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)
  const tutorialMode = HUDStore((state) => state.tutorialMode)

  return (
    <GradientBorder
      className={`slide-up-anim pointer-events-auto absolute -bottom-5 left-0 right-0 z-hud m-auto  max-h-[90vh] items-center gap-3 self-end rounded-xl ${
        isTouchDevice
          ? ''
          : 'md:top-0 md:h-[max-content] md:max-h-[90%] md:w-full'
      } ${props.className}`}
    >
      {isTouchDevice && tutorialMode && (
        <GradientBorder className='absolute -top-10 left-10 z-[20] h-[80px] w-[80px] rounded-full md:h-[100px]'>
          <div className='h-full w-full rounded-full bg-[#17082F]'>
            <img
              src='/assets/images/robot.png'
              alt='robot'
              className='h-full w-full rounded-full object-cover'
            />
          </div>
        </GradientBorder>
      )}
      <div
        className={`pointer-events-auto flex  max-h-[90vh]  w-full flex-col items-center overflow-y-auto rounded-xl bg-[#17082F] ${
          tutorialMode && isTouchDevice ? 'pt-14 md:pt-6' : ''
        } p-6 text-white ${
          isTouchDevice
            ? ''
            : 'md:flex md:h-[max-content] md:max-h-[90%] md:w-full md:px-8 '
        } ${props.className || ''}`}
      >
        <div className='z-[1] flex w-full items-center justify-between pb-2'>
          <div>
            <p className='yesave max-w-[100%] text-2xl font-semibold md:text-3xl'>
              {props.title}
            </p>
          </div>
          <div>
            {props.extrasLeft}
            <Button
              className='h-8 w-8 shrink-0 rounded-full border-[2px] border-[#C599FFCF] bg-[#17082FB2]'
              onClick={() => {
                props.onClose()
              }}
            >
              <IoCloseSharp className='mx-auto' />
            </Button>
            {props.extrasRight}
          </div>
        </div>
        <div className='h-full w-full'>{props.children}</div>
      </div>
    </GradientBorder>
  )
}

export default Modal
