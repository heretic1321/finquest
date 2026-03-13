import { createContext } from 'react'

import useCartAPIs from '@client/hooks/useCartAPIs'
import { ICart } from '@client/utils/types'
import { create } from 'zustand'



export const CartContext = createContext<{}>({})

interface CartZustandState {
  cart: ICart
  setCart: (cart: ICart) => void
  addItemToCart: ((product_id: number) => Promise<[boolean, any]>) | null
  setAddItemToCart: (addItemToCart: ((product_id: number) => Promise<[boolean, any]>)) => void
  removeItemFromCart: ((product_id: number) => Promise<[boolean, any]>) | null
  setRemoveItemFromCart: (removeItemFromCart: ((product_id: number) => Promise<[boolean, any]>)) => void
  refreshCart: (() => Promise<[boolean, any]>) | null
  setRefreshCart: (refreshCart: (() => Promise<[boolean, any]>)) => void
  isCartLoading: boolean
  setIsCartLoading: (isLoading: boolean) => void
}

export const CartStore = create<CartZustandState>((set) => ({
  cart: {
    items: [],
    discounts: [],
    total: 0,
    sub_total: 0,
  },
  setCart: (cart: ICart) => set({ cart: cart }),
  addItemToCart: null,
  setAddItemToCart: (addItemToCart: ((product_id: number) => Promise<[boolean, any]>)) => set({ addItemToCart: addItemToCart }),
  removeItemFromCart: null,
  setRemoveItemFromCart: (removeItemFromCart: ((product_id: number) => Promise<[boolean, any]>)) => set({ removeItemFromCart: removeItemFromCart }),
  refreshCart: null,
  setRefreshCart: (refreshCart: (() => Promise<[boolean, any]>)) => set({ refreshCart: refreshCart }),
  isCartLoading: false,
  setIsCartLoading: (isLoading: boolean) => set({ isCartLoading: isLoading }),
}))

export const CartContextProvider = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  
  useCartAPIs()

  return <CartContext.Provider value={{}}>{children}</CartContext.Provider>
}
