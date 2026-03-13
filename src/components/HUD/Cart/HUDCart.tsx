import Cart from '@client/components/HUD/Cart'

import CartButton from '@client/components/HUD/Cart/CartButton'
import { AuthAPIStore } from '@client/contexts/AuthContext'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { useShallow } from 'zustand/react/shallow'
import { SoundsStore } from '@client/components/Sounds'
import { trackEvent } from '@client/utils/api'
import { getUserID } from '@client/utils/helperFunctions'

const HUDCart = () => {
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)
  const {
    showCart,
    setShowCart,
    setShowChatbox,
    setShowTreasureHuntScreen,
    setShowNotLoggedInModal,
  } = HUDStore(
    useShallow((state) => ({
      showCart: state.showCart,
      setShowCart: state.setShowCart,
      setShowChatbox: state.setShowChatbox,
      setShowTreasureHuntScreen: state.setShowTreasureHuntScreen,
      setShowNotLoggedInModal: state.setShowNotLoggedInModal,
    })),
  )

  const handleClick = () => {
    SoundsStore.getState().playClickSoundOnce()
    if (!AuthAPIStore.getState().isLoggedIn) {
      trackEvent(
        'Toggle_Cart',
        {
          cart_visibility: true,
        },
        getUserID(),
      )
      setShowNotLoggedInModal(true)
      return
    }

    if (showCart == false) {
      trackEvent(
        'Toggle_Cart',
        {
          cart_visibility: true,
        },
        getUserID(),
      )
      setShowChatbox(false)
      setShowTreasureHuntScreen(false)
      setShowCart(true)
    } else {
      trackEvent(
        'Toggle_Cart',
        {
          cart_visibility: false,
        },
        getUserID(),
      )
      setShowCart(false)
    }
  }

  return (
    <div>
      {!isTouchDevice && <CartButton onClick={() => handleClick()} />}
      {showCart ? (
        <div>
          <Cart />
        </div>
      ) : null}
    </div>
  )
}

export default HUDCart
