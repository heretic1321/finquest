import { useEffect } from 'react'

import Cart from '@client/components/HUD/Cart'
import CartButton from '@client/components/HUD/Cart/CartButton'
// import Carousel from '@client/components/HUD/Showcase/Carousel'
import JewelleryDetails from '@client/components/HUD/Showcase/JewelleryDetails'
import JewelleryDetailsButton from '@client/components/HUD/Showcase/JewelleryDetailsButton'
import { AuthAPIStore } from '@client/contexts/AuthContext'
import { CollectionStore } from '@client/contexts/CollectionContext'
import { DataStore } from '@client/contexts/DataContext'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { TreasureHuntStore } from '@client/contexts/TreasureHuntContext'
import findApiDataItemBySku from '@client/utils/apiDataItemBySku'
import { useShallow } from 'zustand/react/shallow'
import { SoundsStore } from '@client/components/Sounds'

const Showcase = () => {
  const breakpoint = GesturesAndDeviceStore((state) => state.breakpoint)
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)
  const groupDataCache = CollectionStore((state) => state.groupDataCache)
  const insideStore = genericStore((state) => state.insideStore)
  const apiData = DataStore((state) => state.apiData)
  const {
    isShowCaseDetailsPanelExpanded,
    selectedPanel,
    setSelectedPanel,
    showcaseActiveItemIndex,
    setShowCarousel,
    showcaseActiveGroupIndex,
    setShowCart,
    setShowNotLoggedInModal,
  } = HUDStore(
    useShallow((state) => ({
      isShowCaseDetailsPanelExpanded: state.isShowCaseDetailsPanelExpanded,
      selectedPanel: state.selectedPanel,
      setSelectedPanel: state.setSelectedPanel,
      showcaseActiveItemIndex: state.showcaseActiveItemIndex,
      setShowCarousel: state.setShowCarousel,
      showcaseActiveGroupIndex: state.showcaseActiveGroupIndex,
      setShowCart: state.setShowCart,
      setShowNotLoggedInModal: state.setShowNotLoggedInModal,
    }))
  )

  const isLoggedIn = AuthAPIStore((state) => state.isLoggedIn)

  const { areAllHiddenItemsFound, updateHiddenItemsList } =
    TreasureHuntStore(
      useShallow((state) => ({
        areAllHiddenItemsFound: state.areAllHiddenItemsFound,
        updateHiddenItemsList: state.updateHiddenItemsList
      }))
    )

  const handleSelectJewelleryDetails = () => {
    setSelectedPanel('details')
    setShowCart(false)
  }

  const handleSelectCart = () => {
    if (!isLoggedIn) {
      setShowNotLoggedInModal(true)
      return
    }

    setSelectedPanel('cart')
    setShowCart(true)
  }

  /**
   * Mark treasure hunt item as found
   */
  useEffect(() => {
    if (insideStore == null) return
    if (areAllHiddenItemsFound) return
    if (!groupDataCache[insideStore]) return
    const itemSku =
      groupDataCache[insideStore][showcaseActiveGroupIndex].slots[
        showcaseActiveItemIndex
      ].item?.sku
    if (itemSku) {
      const item = findApiDataItemBySku(itemSku, apiData)

      if (item && item.id) {
        updateHiddenItemsList(item.sku)
      }
    }
  }, [
    showcaseActiveItemIndex,
    showcaseActiveGroupIndex,
    apiData,
    areAllHiddenItemsFound,
    insideStore,
  ])

  useEffect(() => {
    /**
     * If the screen size is xs, sm or md, and if the details panel is expanded, don't show the carousel
     */
    if (
      ((breakpoint === 'xxs' || breakpoint === 'xs' || breakpoint === 'sm') &&
        isShowCaseDetailsPanelExpanded) ||
      selectedPanel === 'cart'
    ) {
      setShowCarousel(false)
    } else {
      setShowCarousel(true)
    }
  }, [breakpoint, isShowCaseDetailsPanelExpanded, selectedPanel])

  return (
    <div
      className={`pointer-events-none absolute bottom-0 left-1/2 top-5 z-10 w-screen -translate-x-1/2 ${
        isTouchDevice ? '' : 'md:container md:bottom-5 md:mx-auto'
      }`}
    >
      {selectedPanel === 'cart' && (
        <div className='pointer-events-auto'>
          <JewelleryDetailsButton
            onClick={() => {
              SoundsStore.getState().playClickSoundOnce()
              handleSelectJewelleryDetails()
            }}
          />
        </div>
      )}
      <CartButton onClick={() => {
          SoundsStore.getState().playClickSoundOnce()
          handleSelectCart()
        }} />

      {/* {showCarousel ? <Carousel /> : null} */}

      {selectedPanel === 'details' ? (
        <JewelleryDetails />
      ) : (
        <div className='pointer-events-none absolute bottom-1 left-0 right-0 lg:bottom-0 lg:right-0 lg:top-0'>
          <Cart />
        </div>
      )}
    </div>
  )
}

export default Showcase
