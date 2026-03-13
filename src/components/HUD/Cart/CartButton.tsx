
import { AiOutlineShoppingCart } from 'react-icons/ai'

import Button from '@client/components/shared/Button'
import { CartStore } from '@client/contexts/CartContext'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { useShallow } from 'zustand/react/shallow'

const CartButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const showCart = HUDStore((state) => state.showCart)
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)
  const { cart, isCartLoading } = CartStore(
    useShallow((state) => ({
      cart: state.cart,
      isCartLoading: state.isCartLoading,
    }))
  )

  return (
    <div
      className={`pointer-events-auto absolute right-0 top-5 z-[10] sm:top-0 ${
        isTouchDevice ? 'hidden' : 'block'
      }`}
    >
      <Button
        classNames={`w-[200px] ${showCart ? 'gradient ' : 'primary'}`}
        isLoading={isCartLoading || false}
        {...props}
      >
        <div className='flex w-full items-center  gap-2'>
          <AiOutlineShoppingCart className='h-6 w-6 fill-white' />
          <p className='text-regular w-[max-content] text-white'>My Cart</p>
        </div>
      </Button>
      {cart?.items?.length ? (
        <div className='absolute -top-2 right-2 z-[11]'>
          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-[#DF4DBF50] bg-white p-1 text-xs text-black'>
            <div className='flex h-full w-full items-center justify-center rounded-full bg-[#C931A7] text-white'>
              {cart?.items.length}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CartButton
