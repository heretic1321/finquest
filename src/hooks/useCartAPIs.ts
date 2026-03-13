import { useEffect } from 'react'

import { toast } from 'react-hot-toast'

import { AuthAPIStore } from '@client/contexts/AuthContext'
import { CartStore } from '@client/contexts/CartContext'
import { api, trackEvent } from '@client/utils/api'
import { SencoClient } from '@client/utils/axios'
import { ICart } from '@client/utils/types'
import { useShallow } from 'zustand/react/shallow'
import { getUserID } from '@client/utils/helperFunctions'

const useCartAPIs = () => {
  const { isLoggedIn } = AuthAPIStore((state) => ({
    isLoggedIn: state.isLoggedIn,
  }))
  const { setCart, setAddItemToCart, setRemoveItemFromCart, setRefreshCart } =
    CartStore(
      useShallow((state) => ({
        setCart: state.setCart,
        setAddItemToCart: state.setAddItemToCart,
        setRemoveItemFromCart: state.setRemoveItemFromCart,
        setRefreshCart: state.setRefreshCart,
      })),
    )

  const fetchCart = async () => {
    try {
      const { data, status } = await SencoClient.get<ICart>(api.cart.list, {
        headers: {
          Authorization: `Bearer ${AuthAPIStore.getState().accessTokenCookie}`,
        },
      })

      if (status === 200) {
        setCart(data)
        return [true, data]
      } else {
        return [false, data]
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return [false, error.response.data]
    }
  }

  // use item's price id
  useEffect(() => {
    const addItemToCart = async (
      product_id: number,
    ): Promise<[boolean, any]> => {
      try {
        const { data, status } = await SencoClient.post<{ data: ICart }>(
          api.cart.addToCart,
          {
            identifier: product_id,
            type: 'product',
          },
          {
            headers: {
              Authorization: `Bearer ${
                AuthAPIStore.getState().accessTokenCookie
              }`,
            },
          },
        )

        if (status === 200) {
          await fetchCart()
          return [true, data]
        } else {
          return [false, data]
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        return [false, error.response.data]
      }
    }

    setAddItemToCart(addItemToCart)
  }, [setAddItemToCart])

  // Deprecated API
  // const updateQuantityOfCartItem = async (
  //   product_id: number,
  //   quantity: number,
  // ) => {
  //   try {
  //     const { data, status } = await SencoClient.put<{ data: ICart }>(
  //       api.cart.updateQuantity,
  //       {
  //         identifier: product_id,
  //         quantity,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessTokenCookie}`,
  //         },
  //       },
  //     )

  //     if (status === 200) {
  //       setCart(data.data)
  //       return [true, data]
  //     } else {
  //       return [false, data]
  //     }
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   } catch (error: any) {
  //     return [false, error.response.data]
  //   }
  // }

  // use item id from the cart item type
  useEffect(() => {
    const removeItemFromCart = async (
      product_id: number,
    ): Promise<[boolean, any]> => {
      try {
        trackEvent(
          'Remove_Item_From_Cart',
          {
            removed_item_ID: product_id.toString(),
          },
          getUserID(),
        )

        const { data, status } = await SencoClient.delete<{ data: ICart }>(
          api.cart.removeItem.replace(':id', product_id.toString()),
          {
            headers: {
              Authorization: `Bearer ${
                AuthAPIStore.getState().accessTokenCookie
              }`,
            },
          },
        )

        if (status === 200) {
          await fetchCart()
          toast.success('Item removed from cart')
          return [true, data]
        } else {
          toast.error('Failed to remove the item from cart')
          return [false, data]
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        return [false, error.response.data]
      }
    }
    setRemoveItemFromCart(removeItemFromCart)
  }, [setRemoveItemFromCart])

  useEffect(() => {
    const refreshCart = async (): Promise<[boolean, any]> => {
      try {
        const { data, status } = await SencoClient.post<{ status: boolean }>(
          api.cart.refresh,
          {
            headers: {
              Authorization: `Bearer ${
                AuthAPIStore.getState().accessTokenCookie
              }`,
            },
          },
        )

        if (status === 200) {
          return [true, data.status]
        } else {
          return [false, data.status]
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        return [false, error.response.data]
      }
    }
    setRefreshCart(refreshCart)
  }, [setRefreshCart])

  useEffect(() => {
    if (isLoggedIn) fetchCart()
  }, [isLoggedIn])

  return {}
}

export default useCartAPIs
