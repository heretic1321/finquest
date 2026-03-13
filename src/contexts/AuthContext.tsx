import { createContext } from 'react'
import { create } from 'zustand'

export type TAuthContext = {}

export const AuthContext = createContext<TAuthContext>({})

interface AuthZustandState {
  isLoggedIn: boolean
  setIsLoggedIn: (x: boolean) => void
  isGuest: boolean
  setIsGuest: (x: boolean) => void
  continueAsGuest: (displayName: string) => void
  userDisplayName: string
  setUserDisplayName: (name: string) => void
  userData: any
  setUserData: (x: any) => void
  RPMUserId: string | null
  setRPMUserId: (x: string | null) => void
  // Stubs for compatibility
  fetchAvatar: null
  setFetchAvatar: (x: any) => void
  loginWithEmail: null
  setLoginWithEmail: (x: any) => void
  loginWithMobileSendOTP: null
  setLoginWithMobileSendOTP: (x: any) => void
  loginWithMobileVerifyOTP: null
  setLoginWithMobileVerifyOTP: (x: any) => void
  accessTokenCookie: string | null
  setAccessTokenCookie: (x: string | null) => void
  claimLoyaltyPoints: null
  setClaimLoyaltyPoints: (x: any) => void
  listLoyaltyPoints: null
  setListLoyaltyPoints: (x: any) => void
  checkLoyaltyPointsClaimStatus: null
  setCheckLoyaltyPointsClaimStatus: (x: any) => void
  mobileNumberForMining: string
  sendSignupOTP: null
  signup: null
}

export const AuthAPIStore = create<AuthZustandState>((set) => ({
  isLoggedIn: false,
  setIsLoggedIn: (x: boolean) => set({ isLoggedIn: x }),
  isGuest: false,
  setIsGuest: (x: boolean) => set({ isGuest: x }),
  continueAsGuest: (displayName: string) => {
    set({
      isGuest: true,
      userDisplayName: displayName,
    })
  },
  userDisplayName: '',
  setUserDisplayName: (name: string) => set({ userDisplayName: name }),
  userData: null,
  setUserData: (x: any) => set({ userData: x }),
  RPMUserId: null,
  setRPMUserId: (x: string | null) => set({ RPMUserId: x }),
  // Stubs
  fetchAvatar: null,
  setFetchAvatar: () => {},
  loginWithEmail: null,
  setLoginWithEmail: () => {},
  loginWithMobileSendOTP: null,
  setLoginWithMobileSendOTP: () => {},
  loginWithMobileVerifyOTP: null,
  setLoginWithMobileVerifyOTP: () => {},
  accessTokenCookie: null,
  setAccessTokenCookie: () => {},
  claimLoyaltyPoints: null,
  setClaimLoyaltyPoints: () => {},
  listLoyaltyPoints: null,
  setListLoyaltyPoints: () => {},
  checkLoyaltyPointsClaimStatus: null,
  setCheckLoyaltyPointsClaimStatus: () => {},
  mobileNumberForMining: '',
  sendSignupOTP: null,
  signup: null,
}))

export const AuthContextProvider = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  // No API hooks needed — FinQuest uses local guest auth only
  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  )
}
