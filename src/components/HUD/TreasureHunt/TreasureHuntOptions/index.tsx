import React from 'react'

import Reward from '@client/components/HUD/TreasureHunt/TreasureHuntOptions/Reward'
import Treasure from '@client/components/HUD/TreasureHunt/TreasureHuntOptions/Treasure'
import { HUDStore } from '@client/contexts/HUDContext'

interface TreasureHuntOptionsProps {
  currentTab: 'treasure' | 'rewards'
}

const TreasureHuntOptions: React.FC<TreasureHuntOptionsProps> = ({
  currentTab,
}) => {

  const setCurrentTab = HUDStore((state) => state.setCurrentTreasureHuntTab)

  return (
    <div className='relative z-[10] mb-24 mt-5 rounded-lg border border-[#C599FFCF] bg-[#17082FB2] p-6 py-8 md:mb-0 md:mt-10 md:py-10'>
      <div className='custom-skewed-h-center absolute bottom-[-80px] rounded-md border border-[#C599FFCF] bg-[#17082F]  p-2 md:bottom-[auto] md:left-10 md:top-[-8%] md:translate-x-0'>
        <div className='unskewed'>
          <div className='flex items-center gap-3 text-center text-sm font-bold'>
            <div
              className={`skewed cursor-pointer rounded-md px-6 py-2 ${
                currentTab === 'treasure'
                  ? 'bg-radialGradient'
                  : 'text-white/50'
              }`}
              onClick={() => setCurrentTab('treasure')}
            >
              <span>My Treasures</span>
            </div>
            <div
              className={`skewed cursor-pointer rounded-md px-6 py-2 ${
                currentTab === 'rewards' ? 'bg-radialGradient' : 'text-white/50'
              }`}
              onClick={() => setCurrentTab('rewards')}
            >
              <span>My Rewards</span>
            </div>
          </div>
        </div>
      </div>
      {currentTab === 'treasure' ? (
        <Treasure />
      ) : currentTab === 'rewards' ? (
        <Reward />
      ) : null}
    </div>
  )
}

export default TreasureHuntOptions
