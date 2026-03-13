
import { SoundsStore } from '@client/components/Sounds'
import Button from '@client/components/shared/Button'
import Modal from '@client/components/shared/Modal'
import { HUDStore } from '@client/contexts/HUDContext'

const NotLoggedInModal = () => {
  const setShowNotLoggedInModal = HUDStore((state) => state.setShowNotLoggedInModal)

  return (
    <Modal
      className='z-hudOverlay max-w-[600px]'
      onClose={() => {
        SoundsStore.getState().playClickSoundOnce()
        setShowNotLoggedInModal(false)
      }}
    >
      <div className='flex flex-col items-center justify-center gap-4 p-4'>
        <p className='text-2xl font-bold'>You are not logged in</p>
        <p className='text-lg'>Please login to continue</p>
        <Button classNames='b-grad' onClick={() => {
            SoundsStore.getState().playClickSoundOnce()
            window.location.reload()
          }}>
          Login
        </Button>
      </div>
    </Modal>
  )
}

export default NotLoggedInModal
