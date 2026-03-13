export const api = {
  // baseUrl: 'https://senco-dev.mobotics.in/senco-api',
  baseUrl: import.meta.env.VITE_SENCO_API_BASE_URL,
  frontendUrl: 'https://sencogoldanddiamonds.com/',
  login: {
    loginWithPassword: '/oauth/token',
    generateOTP: '/auth/send-login-otp',
    verifyOTP: '/auth/verify-login-otp',
    loginWithToken: '/login-with-token',
  },
  user: {
    details: '/auth/profile',
    avatar: (phoneNumber: string) => `/users/${phoneNumber}`,
    updateAvatarURL: '/users/updateAvatarURL',
    createAvatar: '/users/create',
    /** Loyalty points APIs on our backend */
    status: '/get-reward-status',
    redeem: '/claim-loyalty-points',
    list: '/list-loyalty-points',
  },
  item: {
    price: '/api/products/find-product-price',
    bySKU: '/product/products-by-skus',
    SKUsByCategory: '/product/skus-by-category',
  },
  cart: {
    list: '/cart/items',
    addToCart: '/cart/add',
    refresh: '/cart/refresh',
    // updateQuantity: '/api/cart/v2/items/update',
    removeItem: '/cart/remove/:id',
  },
  collection: {
    groupsWithItems: '/groups/items',
  },
  meteor: {
    getUserData: '/meteors/userState',
    pushUserData: '/meteors/userState',
    redeem: '/meteors/redeem',
    getAllRewards: '/meteors/all_rewards',
    getLeaderboard: '/meteors/leaderboard',
  },
  signup: {
    sendOTP: '/auth/send-signup-otp',
    register: '/auth/signup',
  }
} as const
export const trackEvent = async (
  event_name: string,
  properties: any,
  user_id: string = '',
) => {
  try {
    const baseUrl = import.meta.env.VITE_FASTAPI_BACKEND_URL
    const url = `${baseUrl}/events/mixpanel`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_name: event_name,
        properties: properties,
        user_id: user_id, // Optional, if you have user identification
      }),
    })
    if (!response.ok) {
      console.error(
        'Failed to track event:',
        response.status,
        await response.text(),
      )
    }
  } catch (error) {
    console.error('Error tracking event:', error)
  }
}


export const fetchLiveRate = async () => {
  const baseUrl = import.meta.env.VITE_FASTAPI_BACKEND_URL
  const url = `${baseUrl}/digi_gold/live_rate`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch rate: ${response.status}`)
  }

  const data = await response.json()
  if (!data || typeof data !== 'number') {
    throw new Error('Invalid rate data received')
  }

  return data
}
export const calculatePerGramRate = async () => {
  const goldBuyRate = await fetchLiveRate()
  if (!goldBuyRate) return null
  // divide by 10, remove 3% gst, add 3% profit(this will change later with API call)
  const ratePerGram = goldBuyRate / 10
  const rateAfterGST = ratePerGram * 0.97
  const rateAfterProfit = rateAfterGST * 1.03
  return rateAfterProfit
}
