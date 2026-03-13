import React from 'react'

import Controls from '@client/components/HUD/HowToPlay/HowToPlayOptions/Controls'
import Rewards from '@client/components/HUD/HowToPlay/HowToPlayOptions/Rewards'
import Treasures from '@client/components/HUD/HowToPlay/HowToPlayOptions/Treasures'
import { HUDStore } from '@client/contexts/HUDContext'
import { SoundsStore } from '@client/components/Sounds'
import Onboarding from './Onboarding'

interface HowToPlayOptionsProps {
  currentTab: string | null
}

const HowToPlayOptions: React.FC<HowToPlayOptionsProps> = ({
  currentTab,
}) => {
  const setCurrentTab = HUDStore((state) => state.setCurrentHowToPlayTab)

  return (
    <div className='relative mb-24 mt-4 rounded-lg border border-[#C599FFCF] bg-[#17082FB2] p-6 py-4 md:mb-0 md:mt-10 md:py-10'>
      <div className='skewed absolute bottom-[-80px] left-0 rounded-md border  border-[#C599FFCF]  bg-[#17082F] p-2 md:bottom-[auto] md:left-10 md:top-[-8%]'>
        <div className='unskewed'>
          <div className='flex flex-wrap justify-center items-center gap-3 text-center text-sm md:flex-nowrap md:font-bold'>
            <div
              className={`skewed cursor-pointer rounded-md px-4 py-2 text-xs md:px-6 md:text-sm ${
                currentTab === 'controls'
                  ? 'bg-radialGradient'
                  : 'text-white/50'
              }`}
              onClick={() => {
                SoundsStore.getState().playClickSoundOnce()
                setCurrentTab('controls')
              }}
            >
              <span>Controls</span>
            </div>
            <div
              className={`skewed cursor-pointer rounded-md px-4 py-2 text-xs md:px-6 md:text-sm ${
                currentTab === 'treasure'
                  ? 'bg-radialGradient'
                  : 'text-white/50'
              }`}
              onClick={() => {
                SoundsStore.getState().playClickSoundOnce()
                setCurrentTab('treasure')
              }}
            >
              <span>Treasure Hunt</span>
            </div>
            <div
              className={`skewed cursor-pointer rounded-md px-4 py-2 text-xs md:px-6 md:text-sm ${
                currentTab === 'rewards' ? 'bg-radialGradient' : 'text-white/50'
              }`}
              onClick={() => {
                SoundsStore.getState().playClickSoundOnce()
                setCurrentTab('rewards')
              }}
            >
              <span>Rewards</span>
            </div>
            <div
              className={`skewed cursor-pointer rounded-md px-4 py-2 text-xs md:px-6 md:text-sm ${
                currentTab === 'onboarding' ? 'bg-radialGradient' : 'text-white/50'
              }`}
              onClick={() => {
                SoundsStore.getState().playClickSoundOnce()
                setCurrentTab('onboarding')
              }}
            >
              <span>Onboarding</span>
            </div>
          </div>
        </div>
      </div>
      {currentTab === 'controls' ? (
        <Controls />
      ) : currentTab === 'treasure' ? (
        <Treasures />
      ) : currentTab === 'rewards' ? (
        <Rewards />
      ) : currentTab === 'onboarding' ? (
        <Onboarding />
      ) : null}
    </div>
  )
}

export default HowToPlayOptions
