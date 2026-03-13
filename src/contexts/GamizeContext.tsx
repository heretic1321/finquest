import { createContext, useEffect } from 'react'

import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { AuthAPIStore } from './AuthContext'
import { HUDStore } from './HUDContext'

export type GamizeContextType = {}
export const GamizeContext = createContext<GamizeContextType>({})

// Declare the Gamize class to inform TypeScript about its existence
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare const Gamize: any
interface GamizeZustandState {
  gamizeObject: typeof Gamize | null
  setGamizeObject: (gamizeObject: typeof Gamize) => void

  gamizeDiv: HTMLElement | null
  setGamizeDiv: (gamizeDiv: HTMLElement) => void

  ruleNames: string[]
  ruleDisplayNames: string[]
  loadAndRenderTemplate: (ruleName: string) => void
  loadAndRenderLeaderboard: (ruleName: string) => void
}

export const GamizeStore = create<GamizeZustandState>((set, get) => ({
  gamizeObject: null,
  setGamizeObject: (gamizeObject) => set({ gamizeObject }),

  gamizeDiv: null,
  setGamizeDiv: (gamizeDiv) => set({ gamizeDiv }),

  ruleNames: ["Groovymeta", "Bouncemeta1", "SpeedMeta", "Metaslotmachine28032024"],
  ruleDisplayNames: ["Groovy Ski", "Bouncy", "Furious Speed", "Slot Machine"],
  loadAndRenderTemplate: async (ruleName: string) => {
    if (AuthAPIStore.getState().isLoggedIn === false) {
      HUDStore.getState().setShowNotLoggedInModal(true)
      return
    }

    const ruleData = await get().gamizeObject.getGetRuleData(ruleName, 'en')

    if (
      'widget' in ruleData && 
      'display' in ruleData.widget &&
      ruleData.widget.display === true
    ) {
      await get().gamizeObject?.loadTemplateByRuleName(ruleName)
      if (ruleName === 'Metaslotmachine28032024') await get().gamizeObject?.loadLeaderboardByRuleName(ruleName)
    }
  },
  loadAndRenderLeaderboard: async (ruleName: string) => {
    if (AuthAPIStore.getState().isLoggedIn === false) {
      HUDStore.getState().setShowNotLoggedInModal(true)
      return
    }

    if (
      'loadLeaderboardByRuleName' in get().gamizeObject
    ) {
      await get().gamizeObject?.loadLeaderboardByRuleName(ruleName)
    } else {
      console.error('loadLeaderboardByRuleName not available')
    }
  }
}))

export const GamizeContextProvider = ({
  children,
}: React.PropsWithChildren) => {

  
  const { isLoggedIn, userData } = AuthAPIStore(
    useShallow((state) => ({
      isLoggedIn: state.isLoggedIn,
      userData: state.userData,
    })),
  )

  // const gamizeRuleNames = ['triviatestwebhook']

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GAMIZE_API_KEY

    if (
      !apiKey ||
      !isLoggedIn ||
      !userData ||
      (userData?.mobile === undefined && userData?.email === undefined)
    ) {
      return
    }

    // Dynamically load the Gamize script from the CDN
    const script = document.createElement('script')
    script.src = 'https://cdn.gamize.com/websdk/js/gamize.min.js'
    script.async = true
    script.onload = async () => {
      // Create the Gamize object once the script is loaded
      const gamize = new Gamize({ apiKey, onCloseModal: () => {
      }})
      GamizeStore.getState().setGamizeObject(gamize)

      // Initialize the Gamize object with the user's mobile number or email
      await gamize.initialize(userData.mobile)
    }
    document.body.appendChild(script)

    // Clean up the script element when the component unmounts
    return () => {
      document.body.removeChild(script)
    }
  }, [isLoggedIn, userData])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars


  return (
    <GamizeContext.Provider value={{}}>
      {children}
    </GamizeContext.Provider>
  )
}
