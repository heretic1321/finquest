import { useEffect, useMemo, useState } from 'react'

import toast from 'react-hot-toast'
import { IoCloseSharp } from 'react-icons/io5'

import Button from '@client/components/shared/Button'
import { AuthAPIStore } from '@client/contexts/AuthContext'
import { CartStore } from '@client/contexts/CartContext'
import { DataStore } from '@client/contexts/DataContext'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { InventoryConsoleHUDStore } from '@client/contexts/InventoryConsoleHUDContext'
import { api } from '@client/utils/api'
import { IJewelleryItem } from '@client/utils/types'
import { useShallow } from 'zustand/react/shallow'
import { SoundsStore } from '../Sounds'

const ModalCloseButton = () => {

  const { setIsDetailMode } = InventoryConsoleHUDStore(
    useShallow((state) => ({
      setIsDetailMode: state.setIsDetailMode,
    })),
  )

  const handleClick = () => {
    SoundsStore.getState().playClickSoundOnce()
    setIsDetailMode(false)
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

const InventoryConsoleDetails = (
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >,
) => {
  const data = DataStore((state) => state.inventoryConsoleData)
  const [apiData, setApiData] = useState<IJewelleryItem[]>()
  const { isLoggedIn, accessTokenCookie } = AuthAPIStore(
    useShallow((state) => ({
      isLoggedIn: state.isLoggedIn,
      accessTokenCookie: state.accessTokenCookie,
    })),
  )
  const { consoleActiveItemIndex } = InventoryConsoleHUDStore(
    useShallow((state) => ({
      consoleActiveItemIndex: state.consoleActiveItemIndex,
    })),
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)
  const setShowNotLoggedInModal = HUDStore((state) => state.setShowNotLoggedInModal)
  const [imageLoaded, setImageLoaded] = useState(false)
  const { cart, addItemToCart, setIsCartLoading, refreshCart } =
    CartStore(
      useShallow((state) => ({
        cart: state.cart,
        addItemToCart: state.addItemToCart,
        setIsCartLoading: state.setIsCartLoading,
        refreshCart: state.refreshCart,
      })),
    )

  const [currentItem, setCurrentItem] = useState<
    IJewelleryItem | null | undefined
  >(null)

  // useEffect(() => {
  //   if (data) {
  //     const index = data
  //       ? data.findIndex((item) => item.categoryID === currentCollectionID)
  //       : -1
  //     setApiData(data[index].data)
  //   }
  // }, [currentCollectionID])

  useEffect(() => {
    if (data) {
      setApiData(data.data)
    }
  }, [data])

  const handleImageLoad = () => {
    setImageLoaded(true)
  }
  const addToCart = async () => {
    if (!currentItem) return
    if (!cart) return

    let status = false
    setIsLoading(true)
    if (setIsCartLoading) setIsCartLoading(true)
    if (addItemToCart) {
      const [success] = await addItemToCart(currentItem.prices[0].id)
      status = success
      if (refreshCart) await refreshCart()
    }
    setIsLoading(false)
    if (setIsCartLoading) setIsCartLoading(false)

    return status
  }

  useEffect(() => {
    if (consoleActiveItemIndex !== -1 && apiData) {
      setCurrentItem(apiData[consoleActiveItemIndex])
    }
  }, [consoleActiveItemIndex, apiData])

  const showItemPurity = useMemo(() => {
    if (!currentItem) return null
    const price = currentItem.prices[0]

    if (price.diamond_weight) return price.diamond_weight + 'ct'
    if (price.gold_purity) return price.gold_purity + 'kt'
    if (price.platinum_purity) return price.platinum_purity + 'pt'
    if (price.silver_purity) return price.silver_purity + 'pt'
  }, [currentItem])

  return currentItem ? (
    <div
      className={`pointer-events-auto absolute bottom-0 left-0 right-0 mx-auto h-[max-content] max-h-[80vh] w-full rounded-b-none rounded-t-xl  border border-[#C599FFCF] bg-[#17082F] text-white ${
        isTouchDevice
          ? ''
          : 'md:bottom-5 md:rounded-xl  md:rounded-b-xl lg:right-0 lg:top-16  lg:mr-0 lg:mt-10 lg:w-[25%] lg:min-w-[430px]'
      }`}
      {...props}
      style={{ zIndex: 99999999 }}
    >
      <ModalCloseButton />
      <div className='max-h-[40vh] overflow-y-auto p-2 md:p-4'>
        <div className='flex items-stretch gap-2'>
          {currentItem.images[0].media && (
            <div className='h-20 w-20 overflow-hidden rounded-md bg-white'>
              {!imageLoaded && <div className='spinner'>Loading...</div>}
              <img
                src={currentItem.images[0].media}
                className={`h-full w-full ${
                  imageLoaded ? 'visible' : 'hidden'
                }`}
                alt='certificate'
                onLoad={handleImageLoad}
              />
            </div>
          )}
          <div className='w-[max-content] '>
            <p className='mb-0.5 pb-1 text-sm font-bold md:text-xl'>
              {currentItem.title}
            </p>

            <div className='flex items-center py-0.5 text-xs'>
              <p className='pr-2'>{showItemPurity}</p>
              {currentItem?.prices[0].size && (
                <p className='border-l border-white px-2'>
                  {currentItem?.prices[0].size}
                </p>
              )}
              {currentItem?.prices[0].purity && (
                <p className='border-l border-white pl-2 '>
                  {currentItem?.prices[0].purity}
                </p>
              )}
            </div>
          </div>
        </div>

        {
          <>
            <hr className='my-6 border border-[#C599FF80]' />

            <div className='py-1'>
              <p className='text-sm font-bold'>Product Description</p>
              <p className='text-justify text-xs'>{currentItem.description}</p>
            </div>

            {/* <p className='mb-2 font-bold'>{`${currentItem.prices[0].} | ${currentItem.attributes.size} | ${currentItem.attributes.grossWeight}`}</p> */}
            <div className='flex w-full items-center justify-between gap-3 py-3'>
              <div className='h-20 w-[30%] overflow-hidden rounded-md bg-white'>
                <img
                  src='https://sencogoldanddiamonds.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogos.59ba1e64.png&w=640&q=75'
                  className='h-full w-full'
                  alt='certificate'
                />
              </div>
              <div className='w-[65%] text-justify'>
                <p className='text-sm font-bold'>Certificate of Authenticity</p>
                <p className=' text-xs'>
                  Every piece of jewellery that we make is certifiednfor
                  authenticity by third-party international laboratories like
                  SGL, IGI, BIS and GIA.
                </p>
              </div>
            </div>
          </>
        }

        <div className='flex items-center py-1 md:py-3'>
          <div className='w-[70%]'>
            {currentItem.prices[0].discount && (
              <p
                className={`hidden py-1 text-[8px] font-bold text-[#FF6B6B] sm:block md:text-sm`}
              >
                {currentItem.prices[0].discount.name}
              </p>
            )}
            <div className='flex items-center gap-2'>
              <p className='text-md py-0.5 font-semibold md:text-2xl'>
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  maximumFractionDigits: 0,
                  currency: 'INR',
                }).format(
                  currentItem.prices[0].discount
                    ? currentItem.prices[0].discount.total
                    : currentItem.prices[0].total,
                )}
              </p>
              {/* {currentItem.prices[0].discount && (
                <p className='rounded-md border border-[#FF6B6B] bg-[#FF6B6B4D] px-1 py-0.5 text-xs text-[#FF6B6B] md:px-2 md:py-1 md:text-sm'>
                  -{currentItem.prices[0].discount.total}%
                </p>
              )} */}
            </div>
            <p className='hidden py-1 text-xs text-[#BAB9B9] sm:block'>
              Inclusive of all taxes
            </p>
          </div>
        </div>
        <div
          id={`button-container-${currentItem.sku}`}
          className={`button-container-${currentItem.sku} flex gap-4 py-1 md:flex-col md:py-4`}
        >
          <Button
            classNames='b-grad'
            isLoading={isLoading}
            id='buy-button'
            onClick={async () => {
              SoundsStore.getState().playClickSoundOnce()
              if (isLoggedIn) {
                setIsLoading(true)
                // Add item to cart and then open the checkout screen
                const status = await addToCart()
                setIsLoading(false)

                if (status === true) {
                  toast.success('Redirecting to the checkout page')
                  let url = api.frontendUrl + api.login.loginWithToken
                  url += '?destination=' + encodeURIComponent('/checkout')
                  url += '&token=' + encodeURIComponent(accessTokenCookie || '')

                  // delay so that the cart gets time to be updated before we redirect to Senco checkout
                  setTimeout(() => {
                    window.open(url, '_blank')
                  }, 500)
                } else
                  toast.error('Something went wrong. Please try again later.')
              } else {
                const url = api.frontendUrl + '/products/' + currentItem.slug
                window.open(url, '_blank')
              }
            }}
          >
            Buy Now
          </Button>
          <Button
            classNames='b-grad'
            onClick={async () => {
              SoundsStore.getState().playClickSoundOnce()
              if (isLoggedIn) {
                const status = await addToCart()
                if (status === true) toast.success('Updated your cart.')
                else
                  toast.error('Something went wrong. Please try again later.')
              } else setShowNotLoggedInModal(true)
            }}
            isLoading={isLoading}
          >
            Add to Cart
          </Button>
        </div>
        {isLoading && (
          <div className='absolute left-0 top-0 z-[100] h-full w-full rounded-lg bg-[rgba(0,0,0,0.4)]'></div>
        )}
      </div>
    </div>
  ) : null
}

export default InventoryConsoleDetails
