import { useEffect } from 'react'

import axios from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

import { TLoyaltyPoints } from '@server/utils/types'

import { AuthAPIStore } from '@client/contexts/AuthContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { api } from '@client/utils/api'
import { BackendClient, SencoClient } from '@client/utils/axios'
import { useShallow } from 'zustand/react/shallow'
import { getMeteorDataForThisUser } from '@client/utils/meteorAPI'
import { MeteorManagerStore } from '@client/components/MeteorMining/MeteorManager'

export type TUserData = {
  uuid: string
  name: string
  mobile: string
  email: string
  gender?: string
  billing_address?: string
  dob?: string
  anniversary?: string
  account_id?: string
  duplicate_records: unknown[]
}

const useAuthAPIs = () => {
  const {
    accessTokenCookie,
    setAccessTokenCookie,
    setIsLoggedIn,
    setUserData,
    setIsGuest,
    isLoggedIn,
    userData,
    setLoginWithEmail,
    setLoginWithMobileSendOTP,
    setLoginWithMobileVerifyOTP,
    setContinueAsGuest,
    setCheckLoyaltyPointsClaimStatus,
    setClaimLoyaltyPoints,
    setListLoyaltyPoints,
    setFetchAvatar,
    setUserDisplayName
  } = AuthAPIStore(
    useShallow((state) => ({
      accessTokenCookie: state.accessTokenCookie,
      setAccessTokenCookie: state.setAccessTokenCookie,
      setIsLoggedIn: state.setIsLoggedIn,
      setUserData: state.setUserData,
      setIsGuest: state.setIsGuest,
      isLoggedIn: state.isLoggedIn,
      userData: state.userData,
      setLoginWithEmail: state.setLoginWithEmail,
      setLoginWithMobileSendOTP: state.setLoginWithMobileSendOTP,
      setLoginWithMobileVerifyOTP: state.setLoginWithMobileVerifyOTP,
      setContinueAsGuest: state.setContinueAsGuest,
      setCheckLoyaltyPointsClaimStatus: state.setCheckLoyaltyPointsClaimStatus,
      setClaimLoyaltyPoints: state.setClaimLoyaltyPoints,
      setListLoyaltyPoints: state.setListLoyaltyPoints,
      setFetchAvatar: state.setFetchAvatar,
      setUserDisplayName: state.setUserDisplayName
    }))
  )

  useEffect(() => {
    if (accessTokenCookie === null) {
      setIsLoggedIn(false)
    } else {
      Cookies.set('access_token', accessTokenCookie)
      SencoClient.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${accessTokenCookie}`
      setIsLoggedIn(true)
      fetchUserDetails().then(async (response) => {
        setUserData(response[1])
        const mobileNumber = response[1].mobile
        AuthAPIStore.setState( { 
          mobileNumberForMining: mobileNumber,
        } )
        let displayName = ''
        if (response[0] === true) {
          displayName = response[1]['name'].split(' ')[0]
          Cookies.set('user_display_name', displayName)
          setUserDisplayName(displayName)
        }
        const data = await getMeteorDataForThisUser(mobileNumber, displayName)
        MeteorManagerStore.setState({ rewardsData: data })
      })
    }
  }, [accessTokenCookie])

  useEffect(() => {
    /** Unused */
    const loginWithEmail = async (email: string, password: string) => {
      try {
        const { data, status } = await SencoClient.post(
          api.login.loginWithPassword,
          {
            username: email,
            password: password,
            grant_type: 'password',
            client_id: 1,
            client_secret: 'IrDzoIQ7ZX4OYAWjG3upX4uLVF99AqMhu50wpCyU',
            scope: '',
          },
        )

        if (status === 200 && data['access_token']) {
          setAccessTokenCookie(data['access_token'])
          return [true, data]
        } else {
          return [false, data]
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        return [false, error.response.data]
      }
    }
    setLoginWithEmail(loginWithEmail)
  }, [setLoginWithEmail])

  useEffect(() => {
    const loginWithMobileSendOTP = async (mobileNumber: string) => {
      try {
        const { data, status } = await SencoClient.post(api.login.generateOTP, {
          mobile: mobileNumber,
        })
        if (status === 200 && data['status'] && data['status'] === true) {
          return [true, data]
        } else {
          return [false, data]
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        return [false, error.response.data]
      }
    }
    setLoginWithMobileSendOTP(loginWithMobileSendOTP)
  }, [setLoginWithMobileSendOTP])

  useEffect(() => {
    const loginWithMobileVerifyOTP = async (
      mobileNumber: string,
      otp: string,
      otp_uuid: string,
    ) => {
      try {
        const { data, status } = await SencoClient.post(api.login.verifyOTP, {
          mobile: mobileNumber,
          otp,
          otp_uuid,
        })
        if (status === 200 && data['access_token']) {
          setAccessTokenCookie(data['access_token'])
          return [true, data]
        } else {
          return [false, data]
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        return [false, error.response.data]
      }
    }
    setLoginWithMobileVerifyOTP(loginWithMobileVerifyOTP)
  }, [setLoginWithMobileVerifyOTP])

  const fetchUserDetails = async () => {
    try {
      const { data, status } = await SencoClient.get(api.user.details)
      if (status === 200) {
        return [true, data]
      } else {
        return [false, data]
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      HUDStore.getState().handleLogout()
      return [false, error.response.data]
    }
  }

  useEffect(() => {
    const continueAsGuest = (displayName: string) => {
      setIsGuest(true)
      setUserDisplayName(displayName)
    }
    setContinueAsGuest(continueAsGuest)
  }, [setContinueAsGuest])

  useEffect(() => {
    const checkLoyaltyPointsClaimStatus = async () => {
      if (!isLoggedIn || !userData) return

      try {
        const { data } = await axios.get<[true, boolean] | [false, string]>(
          import.meta.env.VITE_NETWORKING_SERVER_API_URL + api.user.status,
          {
            params: {
              easyID: userData.mobile,
            },
          },
        )

        if (data[0] === true) {
          return data[1]
        } else {
          return false
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(error)
      }
    }
    setCheckLoyaltyPointsClaimStatus(checkLoyaltyPointsClaimStatus)
  }, [setCheckLoyaltyPointsClaimStatus])

  useEffect(() => {
    const claimLoyaltyPoints = async () => {
      if (!isLoggedIn || !userData) return
      try {
        const { data } = await axios.get(
          import.meta.env.VITE_NETWORKING_SERVER_API_URL + api.user.redeem,
          {
            params: {
              easyID: userData.mobile,
              authorization: import.meta.env.VITE_LOYALTY_POINTS_SECURITY_CODE,
            },
          },
        )
  
        if (data[0] === true) {
          if ('AvailablePoints' in data[1]) {
            toast.success('Reward points claimed successfully.')
            return [true, data[1]]
          }
        } else {
          toast.error('Failed to claim reward points. Please try again later.')
          return [false, data]
        }
  
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast.error('Failed to claim reward points. Please try again later.')
        return [false, error.response.data]
      }
    }
    setClaimLoyaltyPoints(claimLoyaltyPoints)
  }, [setClaimLoyaltyPoints])

  useEffect(() => {
    const listLoyaltyPoints = async (): Promise<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [false, any] | [true, TLoyaltyPoints]
    > => {
      if (!isLoggedIn || !userData) {
        return [false, new Error("Can't fetch loyalty points")]
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await axios.get<[false, any] | [true, TLoyaltyPoints]>(
          import.meta.env.VITE_NETWORKING_SERVER_API_URL + api.user.list,
          {
            params: {
              easyID: userData.mobile,
              authorization: import.meta.env.VITE_LOYALTY_POINTS_SECURITY_CODE,
            },
          },
        )

        if (data[0] === true) {
          return [true, data[1]]
        } else {
          return [false, data[1]]
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        return [false, error.response.data]
      }
    }
    setListLoyaltyPoints(listLoyaltyPoints)
  }, [setListLoyaltyPoints])

  useEffect(() => {
    const fetchAvatar = async (mobileNumber: string) => {
      try {
        const { data } = await BackendClient.get<{
          result: {
            phoneNumber: string
            avatarUrl?: string
            rpmId: string
          }
        }>(api.user.avatar(mobileNumber))

        return { success: true, data: data.result }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        return { success: false, error: error }
      }
    }
    setFetchAvatar(fetchAvatar)
  }, [setFetchAvatar])

  useEffect(() => {
    const sendSignupOTP = async (mobile: string, email: string) => {
      try {
        const { data, status } = await SencoClient.post(api.signup.sendOTP, {
          mobile,
          email,
        })
        if (status === 200 && data['status'] && data['status'] === true) {
          return [true, data]
        } else {
          return [false, data]
        }
      } catch (error: any) {
        return [false, error.response.data]
      }
    }
    AuthAPIStore.setState({ sendSignupOTP })
  }, [])

  useEffect(() => {
    const signup = async (signupData: {
      name: string
      mobile: string
      email: string
      pincode: string
      otp: string
      otp_uuid: string
    }) => {
      try {
        const { data, status } = await SencoClient.post(
          api.signup.register, 
          {
            ...signupData,
            consent: true,
            source: 'metaverse',
          },
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_LOGIN_SIGNUP_ACCESS_TOKEN}`,
            },
          }
        )

        if (status === 200 && data['status'] === true) {
          return [true, data]
        } else {
          return [false, data]
        }
      } catch (error: any) {
        return [false, error.response.data]
      }
    }
    AuthAPIStore.setState({ signup })
  }, [])

  return {
    // accessTokenCookie,
    // isLoggedIn,
    // loginWithEmail,
    // loginWithMobileSendOTP,
    // loginWithMobileVerifyOTP,
    // isGuest,
    // fetchAvatar,
    // continueAsGuest,
    // claimLoyaltyPoints,
    // listLoyaltyPoints,
    // userData,
    // checkLoyaltyPointsClaimStatus,
    // RPMUserId,
    // setRPMUserId,
  }
}

export default useAuthAPIs
