import { staticResourcePaths } from '@client/config/staticResourcePaths'
import {
  DataStore,
  IInventoryConsoleDataType,
} from '@client/contexts/DataContext'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { IImage, IJewelleryItem } from '@client/utils/types'
import { useState, useEffect, memo } from 'react'
import { SoundsStore } from '../Sounds'
import { InventoryConsoleHUDStore } from '@client/contexts/InventoryConsoleHUDContext'
import { AuthAPIStore } from '@client/contexts/AuthContext'
import toast from 'react-hot-toast'
import { HUDStore } from '@client/contexts/HUDContext'
import { CartStore } from '@client/contexts/CartContext'
import { useShallow } from 'zustand/react/shallow'
import { api } from '@client/utils/api'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { GrLinkNext, GrNext, GrPrevious, GrLinkPrevious } from 'react-icons/gr'

type Category = {
  id: number
  name: string
  image: string
  backgroundColor: string
}
type Collection = {
  id: number
  name: string
  portrait: string
  landscape: string
  backgroundColor: string
}
const collections: Collection[] = [
  {
    id: 113,
    name: 'Everlite Festive Collection',
    portrait: staticResourcePaths.hybridScreenUIContent.portrait.everlite, // Replace with actual image path
    landscape: staticResourcePaths.hybridScreenUIContent.landscape.everlite, // Replace with actual image path
    backgroundColor: '#E6D5CB', // Replace with actual background color
  },
  {
    id: 455,
    name: 'Mariposa Collection',
    portrait: staticResourcePaths.hybridScreenUIContent.portrait.mariposa, // Replace with actual image path
    landscape: staticResourcePaths.hybridScreenUIContent.landscape.mariposa, // Replace with actual image path
    backgroundColor: '#E6D5CB', // Replace with actual background color
  },
  // {
  //   id: 456,
  //   name: 'Cera Collection',
  //   portrait: staticResourcePaths.hybridScreenUIContent.portrait.cera, // Replace with actual image path
  //   landscape: staticResourcePaths.hybridScreenUIContent.landscape.cera, // Replace with actual image path
  //   backgroundColor: '#E6D5CB', // Replace with actual background color
  // },
  {
    id: 116,
    name: 'Rajwada Collection',
    portrait: staticResourcePaths.hybridScreenUIContent.portrait.rajwada, // Replace with actual image path
    landscape: staticResourcePaths.hybridScreenUIContent.landscape.rajwada, // Replace with actual image path
    backgroundColor: '#E6D5CB', // Replace with actual background color
  },
  {
    id: 120,
    name: 'Sutra Collection',
    portrait: staticResourcePaths.hybridScreenUIContent.portrait.sutra, // Replace with actual image path
    landscape: staticResourcePaths.hybridScreenUIContent.landscape.sutra, // Replace with actual image path
    backgroundColor: '#E6D5CB', // Replace with actual background color
  },
  {
    id: 414,
    name: 'Sruti Earrings Collection',
    portrait: staticResourcePaths.hybridScreenUIContent.portrait.sruti, // Replace with actual image path
    landscape: staticResourcePaths.hybridScreenUIContent.landscape.sruti, // Replace with actual image path
    backgroundColor: '#E6D5CB', // Replace with actual background color
  },
  {
    id: 30,
    name: 'Love 2024',
    portrait: staticResourcePaths.hybridScreenUIContent.portrait.love, // Replace with actual image path
    landscape: staticResourcePaths.hybridScreenUIContent.landscape.love, // Replace with actual image path
    backgroundColor: '#E6D5CB', // Replace with actual background color
  },
]

const categories: Category[] = [
  {
    id: 257,
    name: 'Bracelets',
    image: staticResourcePaths.hybridScreenUIContent.bracelet, // Replace with actual image path
    backgroundColor: '#E6D5CB', // Replace with actual background color
  },
  {
    id: 258,
    name: 'Chains',
    image: staticResourcePaths.hybridScreenUIContent.chain, // Replace with actual image path
    backgroundColor: '#C4B5A6', // Replace with actual background color
  },
  {
    id: 259,
    name: 'Earrings',
    image: staticResourcePaths.hybridScreenUIContent.earrings, // Replace with actual image path
    backgroundColor: '#E5C992', // Replace with actual background color
  },
  {
    id: 261,
    name: 'Necklaces',
    image: staticResourcePaths.hybridScreenUIContent.necklace, // Replace with actual image path
    backgroundColor: '#D4B6A6', // Replace with actual background color
  },
  {
    id: 263,
    name: 'Pendants',
    image: staticResourcePaths.hybridScreenUIContent.pendant, // Replace with actual image path
    backgroundColor: '#E8D1D1', // Replace with actual background color
  },
  {
    id: 265,
    name: 'Rings',
    image: staticResourcePaths.hybridScreenUIContent.ring, // Replace with actual image path
    backgroundColor: '#DBCABC', // Replace with actual background color
  },
  // Add more categories as needed
]
export type ProductData = {
  id: number
  name: string
  images: IImage[]
  price: number
  sku: string
  type: string
  description: string
  purity: string | null
  size: string | null
  // itemPurity: string | null | undefined
}

// Add this new component above the main component
const LoadingImage = () => (
  <div className='flex h-full w-full items-center justify-center bg-gray-100'>
    <div className='h-12 w-12 animate-spin rounded-full border-4 border-[#966b48] border-t-transparent'></div>
  </div>
)

const InventoryConsoleHUD = memo(() => {
  const [hudVisible, setHudVisible] = useState(true)
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)
  const [visibleCategories, setVisibleCategories] = useState<Category[]>(
    categories.slice(0, 2),
  )
  const [visibleProducts, setVisibleProducts] = useState<ProductData[]>()
  const [productsPerPage, setProductsPerPage] = useState<number>(
    isTouchDevice ? 4 : 6,
  )
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(0)

  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [categoriesPerPage, setCategoriesPerPage] = useState<number>(
    isTouchDevice ? 2 : 3,
  )
  const [currentCollectionIndex, setCurrentCollectionIndex] =
    useState<number>(0)
  const [collectionsPerPage, setCollectionsPerPage] = useState<number>(
    isTouchDevice ? 2 : 3,
  )
  const [visibleCollections, setVisibleCollections] = useState<Collection[]>(
    collections.slice(0, 3),
  )
  const data = DataStore((state) => state.inventoryConsoleData)
  const [apiData, setApiData] = useState<IJewelleryItem[]>()
  const [products, setProducts] = useState<ProductData[]>()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pagenumber, setPagenumber] = useState<number>(1)
  const [currentProductIndex, setCurrentProductIndex] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [
    dictionaryOfInventoryConsoleData,
    setDictionaryOfInventoryConsoleData,
  ] = useState<Record<number, IInventoryConsoleDataType>>({})
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const exitingInventoryConsole = HUDStore((state) => state.exitingInventoryConsole)

  // Add this new state to track loading status of each image
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})

  function ViewProductPage(id: number) {
    setPagenumber(4)
    if (products && apiData) {
      //find the product in products array where the id matches and set the current product index to that index of the prodcut
      const index = products.findIndex((product) => product.id === id)
      setCurrentProductIndex(index)
    }
  }
  const { addItemToCart, refreshCart } = CartStore(
    useShallow((state) => ({
      addItemToCart: state.addItemToCart,
      refreshCart: state.refreshCart,
    })),
  )
  const addToCart = async () => {
    if (!apiData || !apiData[currentProductIndex]) return
    if (!CartStore.getState().cart) return

    let status = false
    setIsLoading(true)
    if (CartStore.getState().setIsCartLoading)
      CartStore.getState().setIsCartLoading(true)

    if (addItemToCart) {
      const [success] = await addItemToCart(
        apiData[currentProductIndex].prices[0].id,
      )
      status = success
      if (refreshCart) {
        await refreshCart
      }
    }
    setIsLoading(false)
    if (CartStore.getState().setIsCartLoading)
      CartStore.getState().setIsCartLoading(false)

    return status
  }
  const addToCartButtonClicked = async () => {
    SoundsStore.getState().playClickSoundOnce()
    if (AuthAPIStore.getState().isLoggedIn) {
      setIsLoading(true)
      const status = await addToCart()
      setIsLoading(false)
      if (status === true) {
        setShowSuccessModal(true)
      } else {
        setShowErrorModal(true)
      }
    } else HUDStore.getState().setShowNotLoggedInModal(true)
  }
  const buyNowButtonClicked = async () => {
    if (!apiData || !apiData[currentProductIndex]) return

    SoundsStore.getState().playClickSoundOnce()
    if (AuthAPIStore.getState().isLoggedIn) {
      setIsLoading(true)
      const status = await addToCart()
      setIsLoading(false)

      if (status === true) {
        toast.success('Redirecting to the checkout page')
        let url = api.frontendUrl + api.login.loginWithToken
        url += '?destination=' + encodeURIComponent('/checkout')
        url +=
          '&token=' +
          encodeURIComponent(AuthAPIStore.getState().accessTokenCookie || '')

        // delay so that the cart gets time to be updated before we redirect to Senco checkout
        setTimeout(() => {
          window.open(url, '_blank')
        }, 500)
      } else toast.error('Something went wrong. Please try again later.')
    } else {
      const url =
        api.frontendUrl + '/products/' + apiData[currentProductIndex].slug
      window.open(url, '_blank')
    }
  }

  // const viewDetailsButtonClicked = () => {
  //   SoundsStore.getState().playClickSoundOnce()
  //   InventoryConsoleHUDStore.getState().setIsDetailMode(
  //     !InventoryConsoleHUDStore.getState().isDetailMode,
  //   )
  // }
  const navigateToPreviousProduct = () => {
    if (products) {
      if (currentProductIndex - 1 >= 0) {
        setCurrentProductIndex((prevIndex) => prevIndex - 1)
      } else {
        setCurrentProductIndex(products.length - 1)
      }
    }
  }
  const navigateToNextProduct = () => {
    if (products) {
      if (currentProductIndex + 1 < products.length) {
        setCurrentProductIndex((prevIndex) => prevIndex + 1)
      } else {
        setCurrentProductIndex(0)
      }
    }
  }
  const insideStore = genericStore((state) => state.insideStore)
  const { isLoggedIn, isGuest, accessTokenCookie } = AuthAPIStore(
    useShallow((state) => ({
      isLoggedIn: state.isLoggedIn,
      isGuest: state.isGuest,
      accessTokenCookie: state.accessTokenCookie,
    })),
  )
  const fetchData = async (collectionID: number) => {
    if (accessTokenCookie == null) return null
    try {
      let _inventoryConsoleData: IInventoryConsoleDataType = {
        categoryID: collectionID,
        data: [],
      }

      const [isSuccess, apiResponse] =
        await DataStore.getState().fetchSKUsByCategory(collectionID)
      if (!isSuccess || !apiResponse) return null

      try {
        const [isSuccessful, skuData] =
          await DataStore.getState().fetchProductDataBySKUs(
            apiResponse.skus,
            accessTokenCookie,
          )
        if (!isSuccessful || !skuData) return null
        _inventoryConsoleData = {
          categoryID: collectionID,
          data: skuData,
        }
      } catch (e) {
        console.error('Error fetching SKU data:', e)
        return null
      }

      DataStore.getState().setInventoryConsoleData(_inventoryConsoleData)
      setDictionaryOfInventoryConsoleData((prevDict) => ({
        ...prevDict,
        [collectionID]: _inventoryConsoleData,
      }))

      return _inventoryConsoleData
    } catch (error) {
      console.error('Error fetching data:', error)
      return null
    }
  }
  const fetchCurrentCollectionData = async (collectionID: number) => {
    if (!(isLoggedIn || isGuest)) return
    if (insideStore == null) return

    try {
      setIsPageLoading(true)
      const cachedData = dictionaryOfInventoryConsoleData[collectionID]
      if (cachedData) {
        DataStore.getState().setInventoryConsoleData(cachedData)
        setPagenumber(3)
        setIsPageLoading(false)
        return
      }

      const data = await fetchData(collectionID)
      if (data) {
        setPagenumber(3)
      } else {
        console.error('Failed to fetch collection data')
      }
    } catch (error) {
      console.error('Error in fetchCurrentCollectionData:', error)
    } finally {
      setIsPageLoading(false)
    }
  }
  useEffect(() => {
    if (exitingInventoryConsole ) {
      exitButtonClicked()
    }
  }, [exitingInventoryConsole])
  useEffect(() => {
    setCurrentIndex(0)
    setCurrentCollectionIndex(0)
    setCurrentPageNumber(0)
  }, [pagenumber])
  useEffect(() => {
    setVisibleCategories(
      categories.slice(currentIndex, currentIndex + categoriesPerPage),
    )
  }, [currentIndex])
  useEffect(() => {
    setVisibleCollections(
      collections.slice(
        currentCollectionIndex,
        currentCollectionIndex + collectionsPerPage,
      ),
    )
  }, [currentCollectionIndex])
  useEffect(() => {
    if (products)
      setVisibleProducts(
        products.slice(currentPageNumber, currentPageNumber + productsPerPage),
      )
  }, [currentPageNumber])
  useEffect(() => {
    InventoryConsoleHUDStore.getState().setConsoleActiveItemIndex(
      currentProductIndex,
    )
  }, [currentProductIndex])
  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }
  useEffect(() => {
    if (data) {
      setApiData(data.data)
    }
  }, [data])
  useEffect(() => {
    if (apiData) {
      const products = apiData.map((item) => ({
        id: item.id,
        name: item.title || '',
        images: item.images,
        price: item.prices[0].discount
          ? item.prices[0].discount.total
          : item.prices[0].total,
        sku: item.sku,
        type: item.type,
        description: item.description || '',
        size: item.prices[0].size,
        purity: item.prices[0].purity,
        //if asked for purity separately will add this back
        // itemPurity: item
        //   ? item.prices[0].diamond_weight
        //     ? item.prices[0].diamond_weight + 'ct'
        //     : item.prices[0].gold_purity
        //     ? item.prices[0].gold_purity + 'kt'
        //     : item.prices[0].platinum_purity
        //     ? item.prices[0].platinum_purity + 'pt'
        //     : item.prices[0].silver_purity
        //     ? item.prices[0].silver_purity + 'pt'
        //     : null
        //   : null,
      }))
      setProducts(products)
    }
  }, [apiData])
  useEffect(() => {
    if (products) {
      isTouchDevice
        ? setVisibleProducts(products.slice(0, 4))
        : setVisibleProducts(products.slice(0, 6))
    }
  }, [products])

  const navigateToNextProducts = () => {
    if (products)
      setCurrentPageNumber((prevIndex) => {
        if (prevIndex + productsPerPage >= products.length) {
          return 0
        } else {
          return prevIndex + productsPerPage
        }
      })
  }
  const navigateToPreviousProducts = () => {
    if (products)
      setCurrentPageNumber((prevIndex) => {
        if (prevIndex === 0) {
          const remainder = products.length % productsPerPage
          return remainder === 0
            ? products.length - productsPerPage
            : products.length - remainder
        } else {
          return Math.max(0, prevIndex - productsPerPage)
        }
      })
  }

  // Function to handle Next button click
  const navigateToNextCategories = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex + categoriesPerPage >= categories.length) {
        // If we're at the end, loop back to the start
        return 0
      } else {
        // Otherwise, move to the next set of categories
        return prevIndex + categoriesPerPage
      }
    })
  }

  // Function to handle Previous button click
  const navigateToPreviousCategories = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex === 0) {
        // If we're at the first page, loop back to the last full page
        const remainder = categories.length % categoriesPerPage
        return remainder === 0
          ? categories.length - categoriesPerPage
          : categories.length - remainder
      } else {
        // Move back by categoriesPerPage, ensuring we loop correctly
        return Math.max(0, prevIndex - categoriesPerPage)
      }
    })
  }
  const navigateToPreviousCollections = () => {
    setCurrentCollectionIndex((prevIndex) => {
      if (prevIndex + collectionsPerPage >= collections.length) {
        // If we're at the end, loop back to the start
        return 0
      } else {
        // Otherwise, move to the next set of categories
        return prevIndex + collectionsPerPage
      }
    })
  }

  const navigateToNextCollections = () => {
    setCurrentCollectionIndex((prevIndex) => {
      if (prevIndex + collectionsPerPage >= collections.length) {
        return 0
      } else {
        return prevIndex + collectionsPerPage
      }
    })
  }
  const exitButtonClicked = () => {
    setHudVisible(false)
    setMenuOpen(false)
    setPagenumber(2)
    SoundsStore.getState().playClickSoundOnce()
    if (
      InventoryConsoleHUDStore.getState()
        .isTransitionToPresentationModeComplete &&
      InventoryConsoleHUDStore.getState().isPresentationMode
    ) {
      InventoryConsoleHUDStore.getState().setIsPresentationModeShuttingDown(
        true,
      )
      InventoryConsoleHUDStore.getState().setIsTransitionToPresentationModeComplete(
        false,
      )
    }
    InventoryConsoleHUDStore.getState().setIsDetailMode(false)
  }

  useEffect(() => {
    setProductsPerPage(isTouchDevice ? 4 : 6)
    setCategoriesPerPage(isTouchDevice ? 2 : 3)
    setCollectionsPerPage(isTouchDevice ? 2 : 3)
  }, [isTouchDevice])

  // Add this handler function
  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages((prev) => ({
      ...prev,
      [imageUrl]: true,
    }))
  }

  if (!hudVisible) return null

  return (
    <div>
      {/* Add semi-transparent background overlay */}
      <div className='fixed inset-0 bg-black bg-opacity-50' />

      {/* Loading State */}
      {isPageLoading && (
        <div className='absolute left-1/2 top-1/2 z-hudOverlay mx-auto grid h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 grid-rows-[7%_93%] object-contain text-black lg:grid-rows-[5%_95%]'>
          {/* Top bar to match other pages */}
          <div className='w-full rounded-t-lg bg-white/0 shadow-md'></div>

          {/* Main content area */}
          <div className='flex h-full items-center justify-center rounded-b-lg bg-[#e6e4e0]/0'>
            <div className='rounded-lg bg-white px-8 py-4 shadow-xl'>
              <span className='text-2xl font-semibold text-[#966b48]'>
                Loading...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Conditional Rendering */}
      {!isPageLoading && pagenumber === 4 && (
        <div
          className='absolute left-1/2 top-1/2 z-hud mx-auto grid  h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 select-none grid-rows-[7%_93%] object-contain text-black lg:grid-rows-[5%_65%_30%]'
          style={{ overflowY: 'hidden', boxSizing: 'border-box' }}
        >
          <div className='grid h-full w-full grid-cols-[33%_33%_33%] items-center justify-between rounded-t-lg bg-white/0 shadow-md lg:grid-cols-1'>
            {/* Menu Button for Mobile */}
            <div className='flex items-center justify-center gap-2 lg:hidden'>
              {/* TODO UNCOMMENT */}
              <button
                className='rounded-md bg-[#966b48] px-4 py-2 text-white'
                onClick={toggleMenu}
              >
                Menu
              </button>
            </div>
            <div className='flex justify-center lg:hidden'></div>
            <div className='flex justify-center lg:hidden'>
              <button
                className='rounded-md bg-[#966b48] px-4 py-2 text-white'
                style={{
                  backgroundColor: '#966b48',
                }}
                onClick={() => {
                  exitButtonClicked()
                }}
              >
                EXIT
              </button>
            </div>

            {/* Overlay Menu for Mobile */}
            <div
              className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ${
                menuOpen ? 'visible opacity-100' : 'invisible opacity-0'
              } lg:hidden`}
              onClick={toggleMenu}
            ></div>

            <div
              className={`fixed left-0 top-0 z-50 h-full w-full transform bg-white transition-transform duration-300 ${
                menuOpen ? 'translate-x-0' : '-translate-x-full'
              } lg:relative lg:flex lg:min-h-0 lg:w-full lg:min-w-0 lg:translate-x-0 lg:flex-row lg:items-center lg:justify-between lg:rounded-t-lg lg:bg-white/0 lg:shadow-md`}
              style={{
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Light shadow for larger screens
              }}
            >
              {/* Button Group */}
              <div className='flex h-full w-full flex-col p-4 lg:min-h-0 lg:w-auto lg:min-w-0 lg:flex-row lg:p-0'>
                <button
                  className='w-full bg-[#8A643E] px-6 py-3 text-lg font-bold text-white lg:bg-[#966b48] lg:hover:text-[#000] lg:mr-4 lg:w-auto lg:rounded-md lg:px-4 lg:py-2 lg:text-xl'
                  onClick={() => {
                    setMenuOpen(false)
                    setPagenumber(3)
                  }}
                >
                  <div className='flex items-center justify-center lg:justify-start'>
                    <GrLinkPrevious className='mr-2' />
                    <span>Go Back</span>
                  </div>
                </button>
                {/* Categories Button */}
                {/* TODO UNCOMMENT */}
                <button
                  className='w-full bg-[#8A643E] px-6 py-3 text-lg font-bold text-white lg:bg-[#966b48] lg:hover:text-[#000] lg:mr-4 lg:w-auto lg:rounded-md lg:px-4 lg:py-2 lg:text-xl'
                  onClick={() => {
                    setMenuOpen(false)
                    setPagenumber(2)
                  }}
                >
                  Categories
                </button>

                {/* Collections Button */}
                {/* TODO UNCOMMENT */}
                <button
                  className='w-full bg-[#8A643E] px-6 py-3 text-lg font-bold text-white lg:bg-[#966b48] lg:hover:text-[#000] lg:mr-4 lg:w-auto lg:rounded-md lg:px-4 lg:py-2 lg:text-xl'
                  onClick={() => {
                    setMenuOpen(false)
                    setPagenumber(1)
                  }}
                >
                  Collections
                </button>
                <button
                  className='block w-full px-6 py-3 text-lg font-bold text-[#8A643E] transition-all duration-300 ease-in-out hover:bg-[#8A643E] hover:text-white 
                    lg:hidden'
                  onClick={() => {
                    setMenuOpen(false)
                  }}
                >
                  Close Menu
                </button>
              </div>

              {/* Exit Button */}
              <button
                className='hidden w-full bg-[#966b48] px-4 py-2 text-lg text-white hover:text-[#000] lg:mr-4 lg:block lg:w-auto lg:rounded-md lg:text-xl'
                onClick={() => {
                  exitButtonClicked()
                }}
              >
                EXIT
              </button>
            </div>
          </div>

          {/* Main Content Section */}
          <div className='relative grid h-full min-h-0 w-full min-w-0 grid-cols-[5%_90%_5%]  items-center rounded-b-lg bg-[#e6e4e0]/0 lg:rounded-none '>
            {/* Left navigation arrow */}
            <div className='relative flex h-full items-center justify-center'>
              <GrPrevious
                className='absolute left-0 z-hudOverlay min-h-0 min-w-0 cursor-pointer rounded-full bg-[#e6e4e0] 
                p-2 text-4xl text-[#966b48] 
                shadow-md transition-all duration-300 ease-in-out hover:text-[#8A643E] sm:text-3xl lg:text-6xl lg:shadow-none'
              onClick={navigateToPreviousProduct}
              />
            </div>

            {/* Upper Section: Main Image and Right Side Content */}
            <div className='grid h-full max-h-full w-full max-w-full grid-rows-[33%_67%] overflow-hidden md:grid-rows-[67%_33%] lg:grid-cols-[33%_67%] lg:grid-rows-1'>
              {/* Left side: Main Image */}
              <div className='grid place-items-center'>
                <div className='aspect-[1/1] max-h-[22vh] rounded-lg bg-gradient-to-br from-[#D0B283] to-[#8A634A] object-contain p-[0.5vw] md:max-h-[45vh] lg:max-h-[45vh]'>
                  {!loadedImages[
                    products?.[currentProductIndex]?.images[0]?.media || ''
                  ] && <LoadingImage />}
                  <img
                    className='aspect-[1/1] object-contain lg:min-w-full'
                    src={
                      products
                        ? products[currentProductIndex].images[0].media
                        : ''
                    }
                    alt='Main Image'
                    style={{
                      display: loadedImages[
                        products?.[currentProductIndex]?.images[0]?.media || ''
                      ]
                        ? 'block'
                        : 'none',
                    }}
                    onLoad={() =>
                      handleImageLoad(
                        products?.[currentProductIndex]?.images[0]?.media || '',
                      )
                    }
                  />
                </div>
              </div>

              {/* Right side: Description, Price, and Buttons */}
              <div className='grid w-full grid-rows-[70%_30%] place-items-center sm:grid-rows-[80%_20%] lg:max-w-[90%] lg:grid-rows-[35%_40%_25%]'>
                {/* Description Box */}
                <div className='flex hidden h-full  max-w-[90%] items-end lg:grid'>
                  {data?.categoryID &&
                    collections.find(
                      (collection) => collection.id === data.categoryID,
                    ) && (
                      <img
                        className='h-[80%] cursor-pointer' //TODO unhidden
                        src={
                          collections.find(
                            (collection) => collection.id === data?.categoryID,
                          )?.landscape
                        }
                        alt='Senco Gold & Diamonds'
                        onClick={() => {
                          fetchCurrentCollectionData(data!.categoryID)
                        }}
                      />
                    )}
                  {data?.categoryID &&
                    categories.find(
                      (category) => category.id === data.categoryID,
                    ) && (
                      <button
                        className='text-lg font-bold text-[#8A643E] hover:text-[#000] hover:underline' //TODO unhidden
                        onClick={() => {
                          fetchCurrentCollectionData(data!.categoryID)
                        }}
                      >
                        Category:{' '}
                        {categories.find(
                          (category) => category.id === data?.categoryID,
                        )?.name || ''}
                      </button>
                    )}
                </div>
                <div className='grid h-full max-w-[90%] grid-rows-[80%_20%] place-items-center'>
                  <div className='grid h-full max-w-full grid-rows-[20%_20%_60%] px-[1.5vw] text-center'>
                    <div className='grid'>
                      <h2 className='text-l font-bold text-white lg:text-2xl'>
                        {products ? products[currentProductIndex].name : ''}
                      </h2>
                    </div>
                    <div className='grid'>
                      {products && (
                        <div className='flex justify-center py-2 text-white lg:text-lg'>
                          {/* if asked for separate purity uncomment this */}
                          {/* {products[currentProductIndex].itemPurity && (
                              <p className='pr-1 lg:pr-2'>
                                {products[currentProductIndex].itemPurity}
                              </p>
                            )} */}
                          {products[currentProductIndex].size && (
                            <p className='border-r border-white px-1 lg:px-2'>
                              {products[currentProductIndex].size}
                            </p>
                          )}
                          {products[currentProductIndex].purity && (
                            <p className=' pl-1 lg:pl-2'>
                              {products[currentProductIndex].purity}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className='grid h-[90%] min-h-0 py-2'>
                      <p
                        className='overflow-y-auto pr-2 text-sm text-white transition-all duration-300
                          ease-in-out lg:max-h-none
                          lg:pr-0 lg:text-lg [&::-webkit-scrollbar-thumb]:bg-[#966b48] [&::-webkit-scrollbar-track]:bg-[#E6D5CB] [&::-webkit-scrollbar]:w-2'
                      >
                        {products
                          ? products[currentProductIndex].description
                          : ''}
                      </p>
                    </div>
                  </div>

                  {/* Price Box */}
                  <div className='w-[70%] rounded-2xl border-2 border-gray-300 bg-white px-4 py-2 text-center text-2xl text-black shadow-md'>
                    {products
                      ? new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          maximumFractionDigits: 0,
                          currency: 'INR',
                        }).format(products[currentProductIndex].price)
                      : ''}
                  </div>
                </div>

                <div className='grid w-[90%] max-w-[90%] grid-cols-1  place-items-center gap-4 md:grid-cols-2 lg:mt-4'>
                  <button
                    className='text-l w-[70%] max-w-full rounded-full bg-[#966b48] py-2 font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:bg-[#8A643E] lg:text-2xl'
                    onClick={buyNowButtonClicked}
                  >
                    Buy Now
                  </button>
                  <button
                    className='text-l w-[70%] max-w-full rounded-full bg-[#966b48] py-2 font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:bg-[#8A643E] lg:text-2xl'
                    onClick={addToCartButtonClicked}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Right navigation arrow */}
            <div className='relative flex h-full items-center justify-center'>
              <GrNext
                className='absolute right-0 z-hudOverlay min-h-0 min-w-0 cursor-pointer rounded-full bg-[#e6e4e0] 
                p-2 text-4xl text-[#966b48] 
                shadow-md transition-all duration-300 ease-in-out hover:text-[#8A643E] sm:text-3xl lg:text-6xl lg:shadow-none'
              onClick={navigateToNextProduct}
              />
            </div>

            {/* Lower Section: Remaining Images */}
          </div>
          <div className='relative hidden h-full min-h-0 min-w-0 grid-cols-4 place-items-center items-center justify-center rounded-b-lg bg-[#e6e4e0]/0 lg:grid'>
            {/* take length of images from index 1 to end of images in products array */}
            {products &&
              products[currentProductIndex].images.slice(1, 5).map((image) => (
                <div
                  key={image.media}
                  className='flex min-w-[2vw] items-center justify-center overflow-hidden rounded-lg bg-white md:max-w-[8vw] lg:max-w-[11vw]'
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #D0B283, #8A634A)',
                    padding: '0.5vw',
                  }}
                >
                  {!loadedImages[image.media] && <LoadingImage />}
                  <img
                    className='h-full object-contain'
                    src={image.media}
                    alt='Image'
                    style={{
                      display: loadedImages[image.media] ? 'block' : 'none',
                    }}
                    onLoad={() => handleImageLoad(image.media)}
                  />
                </div>
              ))}
          </div>
        </div>
      )}
      {!isPageLoading && pagenumber === 3 && (
        <div
          className='absolute left-1/2 top-1/2 z-hud mx-auto grid  h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 select-none grid-rows-[7%_3%_90%] object-contain text-black lg:grid-rows-[5%_95%]'
          style={{ overflowY: 'hidden', boxSizing: 'border-box' }}
        >
          {/* Top bar for categories and collections */}
          <div className='grid w-full grid-cols-[33%_33%_33%] items-center justify-between rounded-t-lg bg-white/0 shadow-md lg:grid-cols-1'>
            {/* Menu Button for Mobile */}
            <div className='flex items-center justify-center gap-2 lg:hidden'>
              {/* TODO UNCOMMENT */}
              <button
                className='rounded-md bg-[#966b48] px-4 py-2 text-white'
                onClick={toggleMenu}
              >
                Menu
              </button>
            </div>
            <div className='flex justify-center lg:hidden'></div>
            <div className='flex justify-center lg:hidden'>
              <button
                className='rounded-md bg-[#966b48] px-4 py-2 text-white'
                style={{
                  backgroundColor: '#966b48',
                }}
                onClick={() => {
                  exitButtonClicked()
                }}
              >
                EXIT
              </button>
            </div>

            {/* Overlay Menu for Mobile */}
            <div
              className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ${
                menuOpen ? 'visible opacity-100' : 'invisible opacity-0'
              } lg:hidden`}
              onClick={toggleMenu}
            ></div>

            <div
              className={`fixed left-0 top-0 z-50 h-full w-full transform bg-white transition-transform duration-300 ${
                menuOpen ? 'translate-x-0' : '-translate-x-full'
              } lg:relative lg:flex lg:min-h-0 lg:w-full lg:min-w-0 lg:translate-x-0 lg:flex-row lg:items-center lg:justify-between lg:rounded-t-lg lg:bg-white/0 lg:shadow-md`}
              style={{
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Light shadow for larger screens
              }}
            >
              {/* Button Group */}
              <div className='flex h-full w-full flex-col p-4 lg:min-h-0 lg:w-auto lg:min-w-0 lg:flex-row lg:p-0'>
                {/* TODO UNCOMMENT */}
                {/* Categories Button */}
                <button
                  className='w-full bg-[#8A643E] px-6 py-3 text-lg font-bold text-white lg:bg-[#966b48] lg:hover:text-[#000] lg:mr-4 lg:w-auto lg:rounded-md lg:px-4 lg:py-2 lg:text-xl'
                  onClick={() => {
                    setMenuOpen(false)
                    setPagenumber(2)
                  }}
                >
                  Categories
                </button>

                {/* Collections Button */}
                {/* TODO UNCOMMENT */}
                <button
                  className='w-full bg-[#8A643E] px-6 py-3 text-lg font-bold text-white lg:bg-[#966b48] lg:hover:text-[#000] lg:mr-4 lg:w-auto lg:rounded-md lg:px-4 lg:py-2 lg:text-xl'
                  onClick={() => {
                    setMenuOpen(false)
                    setPagenumber(1)
                  }}
                >
                  Collections
                </button>
                <button
                  className='block w-full px-6 py-3 text-lg font-bold text-[#8A643E] transition-all duration-300 ease-in-out hover:bg-[#8A643E] hover:text-white 
                    lg:hidden'
                  onClick={() => {
                    setMenuOpen(false)
                  }}
                >
                  Close Menu
                </button>
              </div>

              {/* Title */}
              {/* TODO UNCOMMENT */}
              <span
                className='hidden px-4 pt-2 text-lg font-bold text-[#8A643E] lg:block lg:px-0 lg:pt-0 lg:text-2xl lg:underline'
                style={{
                  contain: 'content',
                }}
              >
                {categories.find((category) => category.id === data?.categoryID)
                  ?.name ||
                  collections.find(
                    (collection) => collection.id === data?.categoryID,
                  )?.name ||
                  ''}
              </span>

              {/* Exit Button */}
              <button
                className='hidden w-full bg-[#966b48] px-4 py-2 text-lg text-white hover:text-[#000] lg:mr-4 lg:block lg:w-auto lg:rounded-md lg:text-xl'
                onClick={() => {
                  exitButtonClicked()
                }}
              >
                EXIT
              </button>
            </div>
          </div>
          <div className='flex w-full items-center justify-center lg:hidden'>
            {/* TODO UNHIDDEN */}
            <span className='text-l font-bold text-[#8A643E] bg-[#e6e4e0]'>
              {categories.find((category) => category.id === data?.categoryID)
                ?.name ||
                collections.find(
                  (collection) => collection.id === data?.categoryID,
                )?.name ||
                ''}
            </span>
          </div>

          {/* Main Content Section */}
          <div className='relative grid h-full min-h-0 w-full min-w-0 grid-cols-[5%_90%_5%]  items-center rounded-b-lg bg-[#e6e4e0]/0 '>
            <div className='relative flex h-full items-center justify-center'>
              <GrPrevious
                className='absolute left-0 z-hudOverlay min-h-0 min-w-0 cursor-pointer rounded-full bg-[#e6e4e0] 
                p-2 text-4xl text-[#966b48] 
                shadow-md transition-all duration-300 ease-in-out hover:text-[#8A643E] sm:text-3xl lg:text-6xl lg:shadow-none'
              onClick={navigateToPreviousProducts}
              />
            </div>

            <div className='grid h-[95%] min-h-0 min-w-0 grid-cols-2 grid-rows-2 gap-8 lg:grid-cols-3  '>
              {visibleProducts &&
                visibleProducts.map((product, idx) => (
                  <div
                    className='grid min-h-0 min-w-0 grid-rows-[85%_15%]'
                    key={product.id}
                  >
                    {/* Image Section */}
                    <div className='flex min-h-0 w-full min-w-0 justify-center rounded-t-[10px] bg-white'>
                      {!loadedImages[product.images[0].media] && (
                        <LoadingImage />
                      )}
                      <img
                        src={product.images[0].media}
                        alt={`Product Image ${idx + 1}`}
                        style={{
                          objectFit: 'contain',
                          aspectRatio: '1 / 1',
                          cursor: 'pointer',
                          display: loadedImages[product.images[0].media]
                            ? 'block'
                            : 'none',
                        }}
                        onClick={() => ViewProductPage(product.id)}
                        onLoad={() => handleImageLoad(product.images[0].media)}
                      />
                    </div>

                    {/* Product Info Section */}
                    <button
                      className='grid-row-[33%_66%] grid grid min-h-0 min-w-0 items-center'
                      style={{
                        backgroundColor: '#A57C4D', // Background for product name, price, and button
                        borderRadius: '0px 0px 10px 10px', // Rounded bottom corners
                        // padding: '10px',
                        // height: '15%',
                      }}
                      onClick={() => ViewProductPage(product.id)}
                    >
                      {/* Product Name */}
                      <div className='min-h-0 w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap pl-2 pr-2 text-center text-sm font-semibold text-white hover:text-[#000] hover:underline lg:text-2xl'>
                        {product.name}
                      </div>

                      {/* Price and Cart Icon */}
                      <div
                        className='grid min-h-0 w-full min-w-0 items-center justify-self-center text-center'
                        // style={{ height: '66%' }}
                      >
                        <div className='text-l h-full min-h-0 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap pl-4 text-white lg:text-xl'>
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            maximumFractionDigits: 0,
                            currency: 'INR',
                          }).format(product.price)}
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
            </div>
            <div className='relative flex h-full items-center justify-center'>
              <GrNext
                className='absolute right-0 z-hudOverlay min-h-0 min-w-0 cursor-pointer rounded-full bg-[#e6e4e0] 
                p-2 text-4xl text-[#966b48] 
                shadow-md transition-all duration-300 ease-in-out hover:text-[#8A643E] sm:text-3xl lg:text-6xl lg:shadow-none'
              onClick={navigateToNextProducts}
              />
            </div>
          </div>
        </div>
      )}
      {/* Categories Page */}
      {!isPageLoading &&pagenumber === 2 && (
        <div
          className='absolute left-1/2 top-1/2 z-hud mx-auto grid  h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 select-none grid-rows-[7%_93%] object-contain text-black lg:grid-rows-[5%_95%]'
          style={{ overflowY: 'hidden', boxSizing: 'border-box' }}
        >
          {/* Top bar for categories and collections */}
          <div className='grid w-full grid-cols-[33%_33%_33%] items-center justify-between rounded-t-lg bg-white/0 shadow-md lg:grid-cols-1'>
            {/* Menu Button for Mobile */}
            <div className='flex items-center justify-center gap-2 lg:hidden'>
              {/* TODO UNCOMMENT */}
              <button
                className='rounded-md bg-[#966b48] px-4 py-2 text-white'
                onClick={toggleMenu}
              >
                Menu
              </button>
            </div>
            <div className='flex justify-center lg:hidden'></div>
            <div className='flex justify-center lg:hidden'>
              <button
                className='rounded-md bg-[#966b48] px-4 py-2 text-white'
                style={{
                  backgroundColor: '#966b48',
                }}
                onClick={() => {
                  exitButtonClicked()
                }}
              >
                EXIT
              </button>
            </div>

            {/* Overlay Menu for Mobile */}
            <div
              className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ${
                menuOpen ? 'visible opacity-100' : 'invisible opacity-0'
              } lg:hidden`}
              onClick={toggleMenu}
            ></div>

            <div
              className={`fixed left-0 top-0 z-50 h-full w-full transform bg-white transition-transform duration-300 ${
                menuOpen ? 'translate-x-0' : '-translate-x-full'
              } lg:relative lg:flex lg:min-h-0 lg:w-full lg:min-w-0 lg:translate-x-0 lg:flex-row lg:items-center lg:justify-between lg:rounded-t-lg lg:bg-white/0 lg:shadow-md`}
              style={{
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Light shadow for larger screens
              }}
            >
              {/* Button Group */}
              <div className='flex h-full w-full flex-col p-4 lg:min-h-0 lg:w-auto lg:min-w-0 lg:flex-row lg:p-0'>
                {/* TODO UNCOMMENT */}
                {/* Categories Button */}
                <button
                  className='w-full bg-[#8A643E] px-6 py-3 text-lg font-bold text-white lg:bg-[#966b48] lg:hover:text-[#000] lg:mr-4 lg:w-auto lg:rounded-md lg:px-4 lg:py-2 lg:text-xl'
                  onClick={() => {
                    setMenuOpen(false)
                    setPagenumber(2)
                  }}
                >
                  Categories
                </button>

                {/* Collections Button */}
                {/* TODO UNCOMMENT */}
                <button
                  className='w-full px-6 py-3 text-lg font-bold text-[#8A643E] transition-all duration-300 ease-in-out hover:bg-[#8A643E] hover:text-white
                  lg:bg-[#3f2409] lg:text-[#949090] hover:text-[#000] lg:mr-4 lg:rounded-md lg:w-auto lg:px-4 lg:py-2 lg:text-xl'
                  onClick={() => {
                    setMenuOpen(false)
                    setPagenumber(1)
                  }}
                >
                  Collections
                </button>
                <button
                  className='block w-full px-6 py-3 text-lg font-bold text-[#8A643E] transition-all duration-300 ease-in-out hover:bg-[#8A643E] hover:text-white 
                    lg:hidden'
                  onClick={() => {
                    setMenuOpen(false)
                  }}
                >
                  Close Menu
                </button>
              </div>

              {/* Exit Button */}
              <button
                className='hidden w-full bg-[#966b48] px-4 py-2 text-lg text-white hover:text-[#000] lg:mr-4 lg:block lg:w-auto lg:rounded-md lg:text-xl'
                onClick={() => {
                  exitButtonClicked()
                }}
              >
                EXIT
              </button>
            </div>
          </div>

          {/* Main Content Section */}
          <div className='relative grid h-full min-h-0 w-full min-w-0 grid-cols-[5%_90%_5%] items-center rounded-b-lg bg-[#e6e4e0]/0 py-6'>
            <div className='relative flex h-full items-center justify-center'>
              <GrPrevious
                className='absolute left-0 z-hudOverlay min-h-0 min-w-0 cursor-pointer rounded-full bg-[#e6e4e0] 
                  p-2 text-4xl text-[#966b48] 
                  shadow-md transition-all duration-300 ease-in-out hover:text-[#8A643E] sm:text-3xl lg:text-6xl lg:shadow-none'
                onClick={navigateToPreviousCategories}
              />
            </div>
            {/* Left navigation arrow */}

            {/* Grid section for categories */}
            <div className='grid h-[95%] w-full grid-cols-1 grid-rows-2 gap-4 overflow-hidden lg:grid-cols-3 lg:grid-rows-1'>
              {visibleCategories.map((category, idx) => (
                <div
                  key={category.id}
                  className='flex h-full flex-col items-center '
                >
                  {/* Image Section */}
                  <div
                    className='relative flex h-[65%] w-full cursor-pointer justify-center overflow-hidden'
                    onClick={() => {
                      fetchCurrentCollectionData(category.id)
                    }}
                  >
                    <img
                      src={category.image}
                      alt={`Category Image ${idx + 1}`}
                      className='h-full w-full object-cover'
                    />
                  </div>

                  {/* Category Info Section */}
                  <div
                    className='flex h-[35%] w-full cursor-pointer flex-row items-center justify-between px-4 py-2 lg:h-[20%]'
                    style={{
                      backgroundColor: category.backgroundColor,
                      borderRadius: '0px 0px 10px 10px',
                    }}
                    onClick={() => {
                      fetchCurrentCollectionData(category.id)
                    }}
                  >
                    {/* Category Name */}
                    <div className='w-[75%] truncate text-xl font-bold text-black md:text-2xl'>
                      {category.name}
                    </div>

                    {/* Arrow Icon */}
                    <div className='flex h-12 w-24 items-center justify-center rounded-full border-2 border-white shadow-md md:h-16 md:w-36'>
                      <GrLinkNext
                        className='h-5 w-5 md:h-6 md:w-6'
                        style={{
                          filter: 'brightness(0) invert(1)',
                          transform: 'scale(1.5)',
                          strokeWidth: '3',
                          fontWeight: 'bold',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Right navigation arrow */}
            <div className='relative flex h-full items-center justify-center overflow-visible '>
              <GrNext
                className=' absolute right-0 z-hudOverlay min-h-0 min-w-0 cursor-pointer rounded-full bg-[#e6e4e0] 
                  p-2 text-4xl text-[#966b48] 
                  shadow-md transition-all duration-300 ease-in-out hover:text-[#8A643E] sm:text-3xl lg:text-6xl lg:shadow-none'
                onClick={navigateToNextCategories}
              />
            </div>
          </div>
        </div>
      )}
      {/* Collections Page */}
      {!isPageLoading &&pagenumber === 1 && (
        <div
          className='absolute left-1/2 top-1/2 z-hud mx-auto grid  h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 select-none grid-rows-[7%_93%] object-contain text-black lg:grid-rows-[5%_95%]'
          style={{ overflowY: 'hidden', boxSizing: 'border-box' }}
        >
          {/* Top bar for categories and collections */}
          <div className='grid w-full grid-cols-[33%_33%_33%] items-center justify-between rounded-t-lg bg-white/0 shadow-md lg:grid-cols-1'>
            {/* Menu Button for Mobile */}
            <div className='flex items-center justify-center gap-2 lg:hidden'>
              {/* TODO UNCOMMENT */}
              <button
                className='rounded-md bg-[#966b48] px-4 py-2 text-white'
                onClick={toggleMenu}
              >
                Menu
              </button>
            </div>
            <div className='flex justify-center lg:hidden'></div>
            <div className='flex justify-center lg:hidden'>
              <button
                className='rounded-md bg-[#966b48] px-4 py-2 text-white'
                style={{
                  backgroundColor: '#966b48',
                }}
                onClick={() => {
                  exitButtonClicked()
                }}
              >
                EXIT
              </button>
            </div>

            {/* Overlay Menu for Mobile */}
            <div
              className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ${
                menuOpen ? 'visible opacity-100' : 'invisible opacity-0'
              } lg:hidden`}
              onClick={toggleMenu}
            ></div>

            <div
              className={`fixed left-0 top-0 z-50 h-full w-full bg-white transform transition-transform duration-300 ${
                menuOpen ? 'translate-x-0' : '-translate-x-full'
              } lg:relative lg:flex lg:min-h-0 lg:w-full lg:min-w-0 lg:translate-x-0 lg:flex-row lg:items-center lg:justify-between lg:rounded-t-lg lg:bg-white/0 lg:shadow-md`}
              style={{
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Light shadow for larger screens
              }}
            >
              {/* Button Group */}
              <div className='flex h-full w-full flex-col p-4 lg:min-h-0 lg:w-auto lg:min-w-0 lg:flex-row lg:p-0'>
                {/* TODO UNCOMMENT */}
                {/* Categories Button */}
                <button
                  className='w-full px-6 py-3 text-lg font-bold text-[#8A643E] transition-all duration-300 ease-in-out hover:bg-[#8A643E] hover:text-white
                  lg:bg-[#3f2409] lg:text-[#949090] hover:text-[#000] lg:mr-4 lg:rounded-md lg:w-auto lg:px-4 lg:py-2 lg:text-xl'
                  onClick={() => {
                    setMenuOpen(false)
                    setPagenumber(2)
                  }}
                >
                  Categories
                </button>

                {/* Collections Button */}
                {/* TODO UNCOMMENT */}
                <button
                  className='w-full bg-[#8A643E] px-6 py-3 text-lg font-bold text-white lg:bg-[#966b48] lg:hover:text-[#000] lg:mr-4 lg:w-auto lg:rounded-md lg:px-4 lg:py-2 lg:text-xl'
                  onClick={() => {
                    setMenuOpen(false)
                    setPagenumber(1)
                  }}
                >
                  Collections
                </button>
                <button
                  className='block w-full px-6 py-3 text-lg font-bold text-[#8A643E] transition-all duration-300 ease-in-out hover:bg-[#8A643E] hover:text-white 
                    lg:hidden'
                  onClick={() => {
                    setMenuOpen(false)
                  }}
                >
                  Close Menu
                </button>
              </div>

              {/* Exit Button */}
              <button
                className='hidden w-full bg-[#966b48] px-4 py-2 text-lg text-white hover:text-[#000] lg:mr-4 lg:block lg:w-auto lg:rounded-md lg:text-xl'
                onClick={() => {
                  exitButtonClicked()
                }}
              >
                EXIT
              </button>
            </div>
          </div>

          {/* Main Content Section */}
          <div className='relative grid h-full min-h-0 w-full min-w-0 grid-cols-[5%_90%_5%] items-center rounded-b-lg bg-[#e6e4e0]/0 py-6'>
            <div className='relative flex h-full items-center justify-center'>
              <GrPrevious
                className='absolute left-0 z-hudOverlay min-h-0 min-w-0 cursor-pointer rounded-full bg-[#e6e4e0] 
                  p-2 text-4xl text-[#966b48] 
                  shadow-md transition-all duration-300 ease-in-out hover:text-[#8A643E] sm:text-3xl lg:text-6xl lg:shadow-none'
                onClick={navigateToPreviousCollections}
              />
            </div>

            {/* Grid section for collections */}
            <div className='grid h-[95%] w-full grid-cols-1 grid-rows-2 gap-4 overflow-hidden lg:grid-cols-3 lg:grid-rows-1'>
              {visibleCollections.map((collection, idx) => (
                <div
                  key={collection.id}
                  className='flex h-full flex-col items-center '
                >
                  {/* Image Section */}
                  <div
                    className='relative flex h-[65%] w-full cursor-pointer justify-center overflow-hidden'
                    onClick={() => {
                      fetchCurrentCollectionData(collection.id)
                    }}
                  >
                    <img
                      src={collection.portrait}
                      alt={`Collection Image ${idx + 1}`}
                      className='h-full w-full object-cover'
                    />
                  </div>

                  {/* Category Info Section */}
                  <div
                    className='flex h-[35%] w-full cursor-pointer flex-row items-center justify-between px-4 py-2 lg:h-[20%]'
                    style={{
                      backgroundColor: collection.backgroundColor,
                      borderRadius: '0px 0px 10px 10px',
                    }}
                    onClick={() => {
                      fetchCurrentCollectionData(collection.id)
                    }}
                  >
                    {/* Category Name */}
                    <div className='w-[75%] truncate text-xl font-bold text-black md:text-2xl'>
                      {collection.name}
                    </div>

                    {/* Arrow Icon */}
                    <div className='flex h-12 w-24 items-center justify-center rounded-full border-2 border-white shadow-md md:h-16 md:w-36'>
                      <GrLinkNext
                        className='h-5 w-5 md:h-6 md:w-6'
                        style={{
                          filter: 'brightness(0) invert(1)',
                          transform: 'scale(1.5)',
                          strokeWidth: '3',
                          fontWeight: 'bold',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Right navigation arrow */}
            <div className='relative flex h-full items-center justify-center'>
              <GrNext
                className='absolute right-0 z-hudOverlay min-h-0 min-w-0 cursor-pointer rounded-full bg-[#e6e4e0] 
                  p-2 text-4xl text-[#966b48] 
                  shadow-md transition-all duration-300 ease-in-out hover:text-[#8A643E] sm:text-3xl lg:text-6xl lg:shadow-none'
                onClick={navigateToNextCollections}
              />
            </div>
          </div>
        </div>
      )}
      {/* Loading Modal */}
      {isLoading && (
        <>
          {/* Overlay */}
          <div className='fixed inset-0 z-hud bg-black bg-opacity-50' />
          {/* Modal */}
          <div className='absolute left-1/2 top-1/2 z-hudOverlay w-64 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 shadow-xl'>
            <div className='mb-4 flex items-center justify-center gap-2 text-[#966b48]'>
              <span className='text-lg font-semibold'>Adding to cart...</span>
            </div>
          </div>
        </>
      )}
      {/* Success Modal */}
      {showSuccessModal && (
        <>
          {/* Overlay */}
          <div className='fixed inset-0 z-hud bg-black bg-opacity-50' />
          {/* Modal */}
          <div className='absolute left-1/2 top-1/2 z-hudOverlay w-64 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 shadow-xl'>
            <div className='mb-4 flex items-center justify-center gap-2 text-green-600'>
              <svg
                className='h-6 w-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
              <span className='text-lg font-semibold'>Updated your cart</span>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className='w-full rounded-md bg-[#966b48] px-4 py-2 text-white hover:bg-[#8A643E]'
            >
              Close
            </button>
          </div>
        </>
      )}
      {/* Error Modal */}
      {showErrorModal && (
        <>
          {/* Overlay */}
          <div className='fixed inset-0 z-hud bg-black bg-opacity-50' />
          {/* Modal */}
          <div className='absolute left-1/2 top-1/2  w-64 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 shadow-xl'>
            <div className='mb-4 flex items-center justify-center gap-2 text-red-600'>
              <svg
                className='h-6 w-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
              <span className='text-lg font-semibold'>
                Something went wrong. Please try again later.
              </span>
            </div>
            <button
              onClick={() => setShowErrorModal(false)}
              className='w-full rounded-md bg-[#966b48] px-4 py-2 text-white hover:bg-[#8A643E]'
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  )
})
export default InventoryConsoleHUD
