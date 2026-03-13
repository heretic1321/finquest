import { Fragment, useState } from 'react'

import toast from 'react-hot-toast'
import { IoCloseSharp } from 'react-icons/io5'

import GradientBorder from '@client/components/GradientBorder'
import ExitButton from '@client/components/HUD/Showcase/ExitButton'
import Button from '@client/components/shared/Button'
import { AuthAPIStore } from '@client/contexts/AuthContext'
import { CartStore } from '@client/contexts/CartContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { api, trackEvent } from '@client/utils/api'
import { getUserID } from '@client/utils/helperFunctions'
import { ICartItem } from '@client/utils/types'
import { useShallow } from 'zustand/react/shallow'

type TCartItemProps = {
  handleRemove: (id: number) => Promise<void>
  loading: boolean
  setLoading: (loading: boolean) => void
} & ICartItem

type TCartProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

const CartItem = (props: TCartItemProps) => {
  const { setLoading } = props

  async function handleClickRemove(id: number) {
    setLoading(true)
    await props.handleRemove(id)
    setLoading(false)
  }

  return (
    <div className='pointer-events-auto flex items-stretch gap-2 border-b border-[#C599FF80] pb-4'>
      <div className='aspect-square  h-28 w-28 flex-shrink-0 rounded-md border border-[#C599FFCF] bg-gradient-to-tr from-[#DF4DBF66] to-[#8A2EFF66]'>
        <img src={props.image} alt='' />
      </div>
      <div className='w-full '>
        <p className='mb-0.5 pb-1 text-lg font-bold'>{props.product_name}</p>

        <div className='flex items-center  py-1 text-xs'>
          <p className='pr-2'>22k Yellow Gold</p>
          <p className='border-x border-white px-2'>9 Size - 15.7 mm</p>
          <p className='pl-2'>3.4g</p>
        </div>
        {/* <div className='flex items-center justify-between py-2 text-xs'>
          <div className='flex w-full items-center gap-2 '>
            <div className='flex items-center justify-center gap-2'>
              <span>Qty.</span>
              <div>
                <Counter
                  value={props.quantity}
                  setValue={(action) =>
                    props.manageQuantity(props.id, action)
                  }
                />
              </div>
            </div>
          </div>
        </div> */}
        <div className='flex items-center justify-between gap-3 pt-2'>
          <div className='w-[50%]'>
            <p className='text-lg font-bold'>
              {new Intl.NumberFormat('en-IN', {
                maximumFractionDigits: 0,
                style: 'currency',
                currency: 'INR',
              }).format(props.price)}
            </p>
          </div>
          <div className='w-[40%] text-right'>
            <a
              onClick={() => handleClickRemove(props.id)}
              className='text-sm text-[#C599FF]'
            >
              Remove
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

const Cart = (props: TCartProps) => {
  const { className } = props
  const { isLoggedIn, accessTokenCookie } = AuthAPIStore(
    useShallow((state) => ({
      isLoggedIn: state.isLoggedIn,
      accessTokenCookie: state.accessTokenCookie,
    })),
  )
  const { cart, removeItemFromCart, refreshCart } = CartStore(
    useShallow((state) => ({
      cart: state.cart,
      removeItemFromCart: state.removeItemFromCart,
      refreshCart: state.refreshCart,
    })),
  )
  const [loading, setLoading] = useState(false)

  const { setShowCart, isShowcaseMode } = HUDStore(
    useShallow((state) => ({
      setShowCart: state.setShowCart,
      isShowcaseMode: state.isShowcaseMode,
    })),
  )

  const removeItem = async (id: number) => {
    if (removeItemFromCart) {
      setLoading(true)
      await removeItemFromCart(id)
      setLoading(false)
    }
  }
  // Feature deprecated
  // const manageQuantity = async (id: string, action: 'add' | 'remove') => {
  //   if (!cart) return
  //   if (!addItemToCart) return

  //   setLoading(true)
  //   const itemToUpdate = cart.items.find((item) => item.identifier === id)
  //   if (!itemToUpdate) return

  //   if (action === 'add') {
  //     // add item to cart
  //     await addItemToCart(parseInt(id))
  //   } else {
  //     // remove item from cart
  //       removeItemFromCart && (await removeItemFromCart(parseInt(id)))
  //   }
  //   setLoading(false)
  // }

  return (
    <GradientBorder
      className={`slide-up-anim absolute bottom-0 right-0 mx-auto h-[max-content] w-full rounded-xl short:bottom-0 lg:bottom-auto lg:right-0 ${
        isShowcaseMode ? 'lg:top-16' : 'lg:top-10'
      } lg:mr-0 lg:mt-10 lg:w-[25%] lg:min-w-[430px]`}
    >
      {isShowcaseMode && <ExitButton />}
      <div
        className={`h-[70vh] max-h-full w-full overflow-auto rounded-xl rounded-b-none bg-[#17082F] p-4 text-white md:h-[600px] md:min-w-[400px] md:rounded-b-xl  ${
          className ? className : ''
        }`}
        {...props}
      >
        <div className='flex items-center justify-between'>
          <h3 className='text-2xl'>Cart</h3>
          {!isShowcaseMode && (
            <Button
              className='h-8 w-8 shrink-0 rounded-full border-[2px] border-[#C599FFCF] bg-[#17082FB2]'
              onClick={() => setShowCart(false)}
            >
              <IoCloseSharp className='mx-auto' />
            </Button>
          )}
        </div>

        {cart?.items?.length ? (
          <div className='my-4'>
            {cart?.items.map((item) => (
              <Fragment key={item.id}>
                <CartItem
                  {...item}
                  handleRemove={removeItem}
                  loading={loading}
                  setLoading={setLoading}
                />
              </Fragment>
            ))}
          </div>
        ) : isLoggedIn ? (
          <p className='py-4 text-sm text-gray-400'>
            Your cart is empty. Why don't you look around?
          </p>
        ) : (
          <p className='py-4 text-sm text-gray-400'>
            Please login to view your cart.
          </p>
        )}
        {cart?.items?.length ? (
          <div className='px-2 py-4'>
            <p className='pb-4 text-center'>
              Subtotal ({cart.items.length} Item
              {cart.items.length > 1 ? 's' : ''}){' '}
              <span className='font-bold'>
                {new Intl.NumberFormat('en-IN', {
                  maximumFractionDigits: 0,
                  style: 'currency',
                  currency: 'INR',
                }).format(cart.total)}
              </span>{' '}
            </p>
            <p className='mb-2 px-4 py-1 text-xs text-[#BAB9B9]'>
              All your orders will be placed and managed via -
              <a
                href='https://sencogoldanddiamonds.com'
                className='text-[#C599FF]'
                target='_blank'
              >
                Sencogoldanddiamonds.com
              </a>
            </p>
            <p className='mb-2 px-4 py-1 text-xs text-[#BAB9B9]'>
              To track your existing order placed in the metaverse, kindly visit{' '}
              <a
                href='https://sencogoldanddiamonds.com'
                className='text-[#C599FF]'
                target='_blank'
              >
                Sencogoldanddiamonds.com
              </a>
            </p>
            <Button
              disabled={!cart?.items && cart.items.length < 1}
              classNames='gradient pointer-events-auto'
              isLoading={loading}
              onClick={async () => {
                if (refreshCart) await refreshCart()

                toast.success('Redirecting to the checkout page')
                let cartItems: string[] = []
                cart?.items?.forEach((item) => {
                  if (item?.slug) {
                    cartItems.push(item.slug)
                  }
                })
                trackEvent(
                  'Buy_Cart',
                  {
                    redirect_from: 'Cart',
                    cart_items: cartItems,
                  },
                  getUserID(),
                )
                let url = api.frontendUrl + api.login.loginWithToken
                url += '?destination=' + encodeURIComponent('/checkout')
                url += '&token=' + encodeURIComponent(accessTokenCookie || '')

                setTimeout(() => {
                  window.open(url, '_blank')
                }, 500)
              }}
            >
              Proceed to buy
            </Button>
          </div>
        ) : null}
        {loading && (
          <div className='absolute left-0 top-0 z-[100] h-full w-full rounded-lg bg-[rgba(0,0,0,0.4)]'></div>
        )}
      </div>
    </GradientBorder>
  )
}

export default Cart
