import Button from '@client/components/shared/Button'
import { BsHeadsetVr } from 'react-icons/bs'

import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { vrStore } from '@client/contexts/VRStateContext'

function EnterVRButton() {
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)
  const { isVRSessionSupported, setIsVRMode } = vrStore((state) => ({
    isVRSessionSupported: state.isVRSessionSupported,
    setIsVRMode: state.setIsVRMode,
  }))

  function onClickButton() {
    setIsVRMode(true)
  }

  return (
    <div
      className={`top-30 pointer-events-auto absolute right-0 z-[10] sm:top-0${
        isTouchDevice ? 'hidden' : 'block'
      }`}
    >
      <Button
        classNames={`w-[200px] ${isVRSessionSupported && 'primary '}`}
        onClick={() => onClickButton()}
      >
        <div className='flex w-full items-center gap-2 '>
          <BsHeadsetVr className='h-6 w-6 fill-white ' />
          <p className='text-regular w-[max-content] text-white'>Enter VR</p>
        </div>
      </Button>
    </div>
  )
}

export default EnterVRButton
