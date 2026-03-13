import { useEffect, useMemo, useState } from 'react'

import ExitButton from '@client/components/HUD/Showcase/ExitButton'
import toast from 'react-hot-toast'
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi'

import Button from '@client/components/shared/Button'
import { AuthAPIStore } from '@client/contexts/AuthContext'
import { CartStore } from '@client/contexts/CartContext'
import { CollectionStore } from '@client/contexts/CollectionContext'
import { DataStore } from '@client/contexts/DataContext'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { useCamwearaTryOn } from '@client/hooks/useCamwearaTryOn'
import { api, trackEvent } from '@client/utils/api'
import findApiDataItemBySku from '@client/utils/apiDataItemBySku'
import { getUserID } from '@client/utils/helperFunctions'
import { IJewelleryItem } from '@client/utils/types'
import { useShallow } from 'zustand/react/shallow'
import { SoundsStore } from '@client/components/Sounds'

const JewelleryDetails = (
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >,
) => {
  const apiData = DataStore((state) => state.apiData)
  const groupDataCache = CollectionStore((state) => state.groupDataCache)
  const insideStore = genericStore((state) => state.insideStore)
  const { isLoggedIn, accessTokenCookie } = AuthAPIStore(
    useShallow((state) => ({
      isLoggedIn: state.isLoggedIn,
      accessTokenCookie: state.accessTokenCookie,
    })),
  )
  const {
    showcaseActiveItemIndex,
    showcaseActiveGroupIndex,
    setShowcaseActiveItemIndex,
    setShowCarousel,
    setShowNotLoggedInModal,
    isShowCaseDetailsPanelExpanded,
    setIsShowCaseDetailsPanelExpanded,
    setIsHighPolyModelLoading,
  } = HUDStore(
    useShallow((state) => ({
      showcaseActiveItemIndex: state.showcaseActiveItemIndex,
      showcaseActiveGroupIndex: state.showcaseActiveGroupIndex,
      setShowcaseActiveItemIndex: state.setShowcaseActiveItemIndex,
      setShowCarousel: state.setShowCarousel,
      setShowNotLoggedInModal: state.setShowNotLoggedInModal,
      isShowCaseDetailsPanelExpanded: state.isShowCaseDetailsPanelExpanded,
      setIsShowCaseDetailsPanelExpanded:
        state.setIsShowCaseDetailsPanelExpanded,
      setIsHighPolyModelLoading: state.setIsHighPolyModelLoading,
    })),
  )

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)

  const { cart, addItemToCart, setIsCartLoading, refreshCart } = CartStore(
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

  const addToCart = async () => {
    if (!currentItem) return
    if (!cart) return

    let status = false

    setIsLoading(true)
    if (setIsCartLoading) setIsCartLoading(true)
    /**
     * the id system is really confusing here
     * the cart items have an identifier id which is the id of the price
     * and the item details api gives out no identifier key so we have to use the prices id
     */

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
    if (insideStore == null) return
    if (!groupDataCache[insideStore]) return
    const itemSku =
      groupDataCache[insideStore][showcaseActiveGroupIndex].slots[
        showcaseActiveItemIndex
      ].item?.sku
    if (itemSku) {
      const item = findApiDataItemBySku(itemSku, apiData)
      setCurrentItem(apiData ? item : null)
    }
  }, [
    showcaseActiveItemIndex,
    showcaseActiveGroupIndex,
    groupDataCache,
    insideStore,
    apiData,
  ])

  useCamwearaTryOn({ currentItem: currentItem })

  useEffect(() => {
    if (isLoading) setShowCarousel(false)
    else setShowCarousel(true)
  }, [isLoading])

  const showItemPurity = useMemo(() => {
    if (!currentItem) return null
    const price = currentItem.prices[0]

    if (price.diamond_weight) return price.diamond_weight + 'ct'
    if (price.gold_purity) return price.gold_purity + 'kt'
    if (price.platinum_purity) return price.platinum_purity + 'pt'
    if (price.silver_purity) return price.silver_purity + 'pt'
  }, [currentItem])

  const handleLeft = () => {
    const insideStoreName = genericStore.getState().insideStore
    const groupDataCacheName = CollectionStore.getState().groupDataCache
    const showcaseActiveGroupIndex =
      HUDStore.getState().showcaseActiveGroupIndex
    if (insideStoreName == null) return
    if (!groupDataCacheName[insideStoreName]) return
    SoundsStore.getState().playClickSoundOnce()
    setIsHighPolyModelLoading(true)

    // Check if groupDataCacheName and its nested properties are not null
    if (
      groupDataCacheName &&
      groupDataCacheName[insideStoreName] &&
      groupDataCacheName[insideStoreName][showcaseActiveGroupIndex] &&
      Array.isArray(
        groupDataCacheName[insideStoreName][showcaseActiveGroupIndex].slots,
      )
    ) {
      // Initialize newItemIndex with wrap-around logic
      let newItemIndex =
        (showcaseActiveItemIndex -
          1 +
          groupDataCacheName[insideStoreName][showcaseActiveGroupIndex].slots
            .length) %
        groupDataCacheName[insideStoreName][showcaseActiveGroupIndex].slots
          .length

      // Keep finding the previous item until we find one whose `item` is not undefined
      while (
        groupDataCacheName[insideStoreName][showcaseActiveGroupIndex].slots[
          newItemIndex
        ]?.item === undefined
      ) {
        newItemIndex =
          (newItemIndex -
            1 +
            groupDataCacheName[insideStoreName][showcaseActiveGroupIndex].slots
              .length) %
          groupDataCacheName[insideStoreName][showcaseActiveGroupIndex].slots
            .length
      }

      trackEvent(
        'Showcase_Mode_Interactions',
        {
          action: 'Previous_Item',
          showcase_name:
            groupDataCacheName[insideStoreName][showcaseActiveGroupIndex]
              .name || 'Unknown Showcase',
          store_name: insideStore || 'Unknown Store',
          item_name:
            groupDataCacheName[insideStoreName][showcaseActiveGroupIndex].slots[
              newItemIndex
            ]?.name || 'Unknown Item',
        },
        getUserID(),
      )
      setShowcaseActiveItemIndex(newItemIndex)
    }
  }

  const handleRight = () => {
    const insideStoreName = genericStore.getState().insideStore
    const groupDataCacheName = CollectionStore.getState().groupDataCache
    const showcaseActiveGroupIndex =
      HUDStore.getState().showcaseActiveGroupIndex
    if (insideStoreName == null) return
    if (!groupDataCacheName[insideStoreName]) return
    SoundsStore.getState().playClickSoundOnce()
    setIsHighPolyModelLoading(true)
    if (
      groupDataCacheName &&
      groupDataCacheName[insideStoreName] &&
      groupDataCacheName[insideStoreName][showcaseActiveGroupIndex] &&
      Array.isArray(
        groupDataCacheName[insideStoreName][showcaseActiveGroupIndex].slots,
      )
    ) {
      // keep finding the next item until we find one whose `item` is not undefined
      let newItemIndex =
        (showcaseActiveItemIndex + 1) %
        groupDataCacheName[insideStoreName][showcaseActiveGroupIndex].slots
          .length
      while (
        groupDataCacheName[insideStoreName][showcaseActiveGroupIndex].slots[
          newItemIndex
        ].item === undefined
      )
        newItemIndex =
          (newItemIndex + 1) %
          groupDataCacheName[insideStoreName][showcaseActiveGroupIndex].slots
            .length
      trackEvent(
        'Showcase_Mode_Interactions',
        {
          action: 'Next_Item',
          showcase_name:
            groupDataCacheName[insideStoreName][showcaseActiveGroupIndex]
              .name || 'Unknown Showcase',
          store_name: insideStore || 'Unknown Store',
          item_name:
            groupDataCacheName[insideStoreName][showcaseActiveGroupIndex].slots[
              newItemIndex
            ]?.name || 'Unknown Item',
        },
        getUserID(),
      )
      setShowcaseActiveItemIndex(newItemIndex)
    }
  }

  return currentItem ? (
    <div
      className={`pointer-events-auto absolute bottom-0 left-0 right-0 mx-auto h-[max-content] max-h-[80vh] w-full rounded-b-none rounded-t-xl  border border-[#C599FFCF] bg-[#17082F] text-white ${
        isTouchDevice
          ? ''
          : 'md:bottom-5 md:rounded-xl  md:rounded-b-xl lg:right-0 lg:top-16  lg:mr-0 lg:mt-10 lg:w-[25%] lg:min-w-[430px]'
      }`}
      {...props}
    >
      <ExitButton />
      <div className='max-h-[40vh] overflow-y-auto p-2 md:p-4'>
        {/* carousel buttons  */}
        <div className='mb-4 flex items-stretch justify-between gap-2'>
          <button
            onClick={() => handleLeft()}
            className={`flex flex-row rounded-full
              border-[2px] border-[#C599FFCF] bg-[#17082FB2] p-1 transition
              delay-100 ease-in-out hover:scale-110 ${
                isTouchDevice ? 'short:top-[25%]' : 'md:top-[50%]'
              }
            `}
          >
            <HiOutlineChevronLeft className='h-6 w-6 stroke-neutral-300 stroke-1 lg:stroke-2' />
            <div className='flex h-full w-full'>
              <p className='mt-[2px]'>Previous</p>
            </div>
          </button>
          <button
            onClick={() => handleRight()}
            className={`flex flex-row-reverse rounded-full
              border-[2px]
              border-[#C599FFCF] bg-[#17082FB2] p-1 transition delay-100 ease-in-out
              hover:scale-110 ${
                isTouchDevice
                  ? 'short:top-[25%]'
                  : 'md:left-auto md:right-[460px] md:top-[50%]'
              }
            `}
          >
            <HiOutlineChevronRight className='h-6 w-6 stroke-neutral-300 stroke-1 lg:stroke-2' />
            <div className='flex h-full w-full justify-end'>
              <p className='mt-[2px]'>Next</p>
            </div>
          </button>
        </div>
        <div className='flex items-stretch gap-2'>
          {isShowCaseDetailsPanelExpanded && currentItem.images[0].media && (
            <div className='h-20 w-20 overflow-hidden rounded-md bg-white'>
              <img
                src={currentItem.images[0].media}
                className='h-full w-full'
                alt='certificate'
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

        {isShowCaseDetailsPanelExpanded && (
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
        )}

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
          <p
            className='w-[25%] cursor-pointer text-right text-sm text-[#C599FF] underline'
            onClick={() => {
              SoundsStore.getState().playClickSoundOnce()
              if (isShowCaseDetailsPanelExpanded && insideStore) {
                trackEvent(
                  'Showcase_Mode_Interactions',
                  {
                    action: 'View_Less',
                    showcase_name:
                      insideStore &&
                      groupDataCache?.[insideStore] &&
                      groupDataCache[insideStore]?.[showcaseActiveGroupIndex] &&
                      groupDataCache[insideStore]?.[showcaseActiveGroupIndex]
                        ?.name
                        ? groupDataCache[insideStore][showcaseActiveGroupIndex]
                            .name
                        : 'Unknown Showcase',
                    store_name: insideStore || 'Unknown Store',
                    item_name: currentItem.slug || 'Unknown Item',
                  },
                  getUserID(),
                )
                setIsShowCaseDetailsPanelExpanded(false)
              } else if (!isShowCaseDetailsPanelExpanded && insideStore) {
                trackEvent(
                  'Showcase_Mode_Interactions',
                  {
                    action: 'View_More',
                    showcase_name:
                      insideStore &&
                      groupDataCache?.[insideStore] &&
                      groupDataCache[insideStore]?.[showcaseActiveGroupIndex] &&
                      groupDataCache[insideStore]?.[showcaseActiveGroupIndex]
                        ?.name
                        ? groupDataCache[insideStore][showcaseActiveGroupIndex]
                            .name
                        : 'Unknown Showcase',
                    store_name: insideStore || 'Unknown Store',
                    item_name: currentItem.slug || 'Unknown Item',
                  },
                  getUserID(),
                )
                setIsShowCaseDetailsPanelExpanded(true)
              }
            }}
          >
            View {isShowCaseDetailsPanelExpanded ? 'Less' : 'More'}
          </p>
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
                  let cartItems: string[] = []
                  cart?.items?.forEach((item) => {
                    if (item?.slug) {
                      cartItems.push(item.slug)
                    }
                  })
                  trackEvent(
                    'Buy_Cart',
                    {
                      redirect_from: 'Showcase_Mode',
                      cart_items: cartItems,
                    },
                    getUserID(),
                  )
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
              if (isLoggedIn) {
                SoundsStore.getState().playClickSoundOnce()
                const status = await addToCart()
                if (status === true) {
                  toast.success('Updated your cart.')
                  if (insideStore)
                    trackEvent(
                      'Showcase_Mode_Interactions',
                      {
                        action: 'Add_To_Cart',
                        showcase_name:
                          insideStore &&
                          groupDataCache?.[insideStore] &&
                          groupDataCache[insideStore]?.[
                            showcaseActiveGroupIndex
                          ] &&
                          groupDataCache[insideStore]?.[
                            showcaseActiveGroupIndex
                          ]?.name
                            ? groupDataCache[insideStore][
                                showcaseActiveGroupIndex
                              ].name
                            : 'Unknown Showcase',
                        store_name: insideStore || 'Unknown Store',
                        item_name: currentItem.slug || 'Unknown Item',
                      },
                      getUserID(),
                    )
                } else
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

export default JewelleryDetails
