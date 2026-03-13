import { createContext, useEffect } from 'react'

import { toast } from 'react-hot-toast'

import { hiddenItems } from '@client/config/TreasureHunt'
import { AuthAPIStore } from '@client/contexts/AuthContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

const hiddenItemsState = hiddenItems.map((item) => ({
  ...item,
  isFound: false,
}))

export type TreasureHuntContextType = {}

interface TreasureHuntZustandState {
  treasureHuntHiddenItems: typeof hiddenItemsState
  setTreasureHuntHiddenItems: (x: typeof hiddenItemsState) => void
  areAllHiddenItemsFound: boolean
  setAreAllHiddenItemsFound: (x: boolean) => void
  updateHiddenItemsList: (productSKU: string) => void
  hasRewardBeenClaimed: boolean
  setHasRewardBeenClaimed: (x: boolean) => void
}

export const TreasureHuntStore = create<TreasureHuntZustandState>((set, get) => ({
  treasureHuntHiddenItems: hiddenItemsState,
  setTreasureHuntHiddenItems: (x) => set({ treasureHuntHiddenItems: x }),
  areAllHiddenItemsFound: false,
  setAreAllHiddenItemsFound: (x) => set({ areAllHiddenItemsFound: x }),
  updateHiddenItemsList: (productSKU: string) => {
    if (get().areAllHiddenItemsFound) return

    // This is used to update the treasureHuntHiddenItems array when the user finds a hidden item

    const items = get().treasureHuntHiddenItems;
    const updatedItems = items.map((item) => {
      if (item.sku === productSKU && !item.isFound) {
        toast.success(`You found a hidden item!`);
        return { ...item, isFound: true };
      }
      return item;
    });

    set({ treasureHuntHiddenItems: updatedItems });

    // Check if all items are found
    const allFound = updatedItems.every(item => item.isFound);
    if (allFound) {
      AuthAPIStore.getState().claimLoyaltyPoints?.();
      set({ areAllHiddenItemsFound: true })
      HUDStore.getState().setShowTreasureHuntRewardScreen(true);
    }
  },
  hasRewardBeenClaimed: false,
  setHasRewardBeenClaimed: (x) => set({ hasRewardBeenClaimed: x }),
}))

export const TreasureHuntContext = createContext<TreasureHuntContextType>({
  setTreasureHuntHiddenItems: () => undefined,
  treasureHuntHiddenItems: hiddenItemsState,

  areAllHiddenItemsFound: false,
  setAreAllHiddenItemsFound: () => undefined,

  updateHiddenItemsList: () => undefined,
  hasRewardBeenClaimed: false,
})

export const TreasureHuntContextProvider = ({
  children,
}: React.PropsWithChildren) => {
  const { hasStartButtonBeenPressed } =
    HUDStore(
      useShallow((state) => ({
        setShowTreasureHuntRewardScreen: state.setShowTreasureHuntRewardScreen,
        hasStartButtonBeenPressed: state.hasStartButtonBeenPressed,
      })),
    )
  const { isLoggedIn } =
    AuthAPIStore(
      useShallow((state) => ({
        isLoggedIn: state.isLoggedIn,
        checkLoyaltyPointsClaimStatus: state.checkLoyaltyPointsClaimStatus,
        claimLoyaltyPoints: state.claimLoyaltyPoints,
      })),
    )
  const {
    setTreasureHuntHiddenItems,
    treasureHuntHiddenItems,
    hasRewardBeenClaimed
   } = TreasureHuntStore(
    useShallow((state) => ({
      setTreasureHuntHiddenItems: state.setTreasureHuntHiddenItems,
      treasureHuntHiddenItems: state.treasureHuntHiddenItems,
      setHasRewardBeenClaimed: state.setHasRewardBeenClaimed,
      hasRewardBeenClaimed: state.hasRewardBeenClaimed
    })),
   )

  useEffect(() => {
    /**
     * get hidden items from local storage and parse it
     */
    const HiddenItemsFromLocalStorage = JSON.parse(
      localStorage.getItem('hiddenItems') || '[]',
    ) as typeof hiddenItemsState

    // if a copy of this state exists in local storage then use that otherwise use the default state
    setTreasureHuntHiddenItems(
      HiddenItemsFromLocalStorage.length > 0
        ? HiddenItemsFromLocalStorage
        : hiddenItemsState,
    )
  }, [setTreasureHuntHiddenItems])

  // side effect to update local storage everytime a hidden item is updated
  useEffect(() => {
    localStorage.setItem('hiddenItems', JSON.stringify(treasureHuntHiddenItems))
  }, [treasureHuntHiddenItems])

  const getRewardStatus = async () => {
    const {
      checkLoyaltyPointsClaimStatus,
      claimLoyaltyPoints
    } = AuthAPIStore.getState()
    const {
      setHasRewardBeenClaimed,
      areAllHiddenItemsFound,
      treasureHuntHiddenItems,
      setTreasureHuntHiddenItems
    } = TreasureHuntStore.getState()
    
    // check reward claim status
    if (checkLoyaltyPointsClaimStatus) {
      const isClaimed = await checkLoyaltyPointsClaimStatus()
      setHasRewardBeenClaimed(isClaimed || false)

      // if user hasnt already claimed and all hidden items are found then claim the reward
      if (isClaimed === false) {
        if (areAllHiddenItemsFound && claimLoyaltyPoints) claimLoyaltyPoints()
      }
      // if user has claimed then mark all items as found
      else {
        // setTreasureHuntHiddenItems((items) => {
        //   return items.map((item) => {
        //     return { ...item, isFound: true }
        //   })
        // })
        setTreasureHuntHiddenItems(
          treasureHuntHiddenItems.map((item) => {
            return { ... item, isFound: true}
          })
        )
      }
    }
  }

  useEffect(() => {
    if (isLoggedIn && hasStartButtonBeenPressed && hasRewardBeenClaimed) {
      TreasureHuntStore.getState().setAreAllHiddenItemsFound(true)
    }
  }, [hasRewardBeenClaimed, isLoggedIn, hasStartButtonBeenPressed])

  useEffect(() => {
    if (treasureHuntHiddenItems.every((item) => item.isFound === true)) {
      TreasureHuntStore.getState().setAreAllHiddenItemsFound(true)
    }
  }, [treasureHuntHiddenItems])

  useEffect(() => {
    if (isLoggedIn && hasStartButtonBeenPressed) {
      getRewardStatus()
    }
  }, [isLoggedIn, hasStartButtonBeenPressed])

  return (
    <TreasureHuntContext.Provider
      value={{}}
    >
      {children}
    </TreasureHuntContext.Provider>
  )
}
