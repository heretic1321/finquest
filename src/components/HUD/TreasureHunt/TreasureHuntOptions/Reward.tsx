import { useEffect, useState } from 'react'

import GradientBorder from '@client/components/GradientBorder'
import Button from '@client/components/shared/Button'
import { AuthAPIStore } from '@client/contexts/AuthContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { TreasureHuntStore } from '@client/contexts/TreasureHuntContext'
import { useShallow } from 'zustand/react/shallow'

const Reward = () => {
  const areAllHiddenItemsFound = TreasureHuntStore((state) => state.areAllHiddenItemsFound)
  const { listLoyaltyPoints, isLoggedIn } = AuthAPIStore(
    useShallow((state) => ({
      listLoyaltyPoints: state.listLoyaltyPoints,
      isLoggedIn: state.isLoggedIn,
    }))
  )
  const {
    setShowNotLoggedInModal,
    setShowHowToPlayScreen,
    setCurrentHowToPlayTab,
  } = HUDStore(
    useShallow((state) => ({
      setShowNotLoggedInModal: state.setShowNotLoggedInModal,
      setShowHowToPlayScreen: state.setShowHowToPlayScreen,
      setCurrentHowToPlayTab: state.setCurrentHowToPlayTab,
    }))
  )
  const [isLoading, setIsLoading] = useState(false)

  const [loyaltyPoints, setLoyaltyPoints] = useState(0)

  const listPoints = async () => {
    if (!listLoyaltyPoints) return

    setIsLoading(true)
    try {
      const res = await listLoyaltyPoints()
      if ('AvailablePoints' in res[1]) {
        setLoyaltyPoints(res[1].AvailablePoints)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (isLoggedIn) {
      listPoints()
    } else {
      setShowNotLoggedInModal(true)
    }
  }, [])

  return (
    <div className='flex min-h-[250px] flex-col justify-center gap-4'>
      {isLoggedIn ? (
        areAllHiddenItemsFound ? (
          <div className='flex flex-col items-center justify-center'>
            <img
              src='/assets/icons/diamond-icon.svg'
              alt='diamond'
              className='mt-2'
            />
            <h1 className='mt-2 text-[4rem]'>{loyaltyPoints}</h1>
            <p className='mt-3'>Loyalty Points</p>
            {loyaltyPoints > 0 && (
              <GradientBorder className='mt-8 w-[250px] -skew-x-[10deg] rounded-md'>
                <Button
                  classNames='bg-[#251243] w-full !skew-x-0 !border-none'
                  isLoading={isLoading}
                  onClick={() => {
                    setShowHowToPlayScreen(true)
                    setCurrentHowToPlayTab('rewards')
                  }}
                >
                  Redeem Points
                </Button>
              </GradientBorder>
            )}
          </div>
        ) : (
          <p className='text-center text-3xl'>
            Find all the treasure items to unlock your rewards
          </p>
        )
      ) : (
        <p className='text-center text-3xl'>
          Please login to claim your rewards
        </p>
      )}
    </div>
  )
}

export default Reward
