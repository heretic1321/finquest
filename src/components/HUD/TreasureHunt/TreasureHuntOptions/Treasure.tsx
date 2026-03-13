import { useState } from 'react'

import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { TreasureHuntStore } from '@client/contexts/TreasureHuntContext'

const Treasure = () => {
  const treasureHuntHiddenItems = TreasureHuntStore((state) => state.treasureHuntHiddenItems)
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)

  const [selectedTreasure, setSelectedTreasure] = useState<number>(0)

  function onClickItem(index: number) {
    setSelectedTreasure(index)
  }

  return (
    <div
      className={`flex flex-col gap-4 ${
        isTouchDevice ? '' : 'md:flex-row md:pt-4'
      }`}
    >
      <div
        className={`h-[300px] w-max-content rounded-lg border border-[#C599FFCF] bg-[#261042] p-4 ${
          isTouchDevice ? '' : 'md:h-[350px] md:w-[35%]'
        }`}
      >
        <p className='yesave pb-2 text-2xl'>
          {treasureHuntHiddenItems[selectedTreasure].isFound
            ? 'Already located'
            : 'Yet to be found'}
        </p>
        <p className='text-sm text-[#C599FF]'>
          {treasureHuntHiddenItems[selectedTreasure].name}
        </p>
        {selectedTreasure !== null && (
          <img
            src={
              treasureHuntHiddenItems[selectedTreasure].isFound
                ? treasureHuntHiddenItems[selectedTreasure].image
                : '/assets/images/lockedTreasure.png'
            }
            className='mx-auto my-4 h-[70%] max-w-[70%]'
            alt='selected treasure'
          />
        )}
      </div>
      <div>
        <p className='pb-2'>
          Find these missing pieces of precious jewels to win exciting prices!
        </p>
        <div className='flex w-full flex-wrap gap-4 py-2'>
          {treasureHuntHiddenItems.map((item, index) => (
            <div
              className={`h-[120px] ${
                selectedTreasure === index ? 'gradient' : ''
              } w-[120px] cursor-pointer rounded-lg border border-white/60 bg-black/50  bg-radialGray p-4 bg-blend-normal md:h-[150px] md:w-[150px]`}
              key={item.sku}
              onClick={() => onClickItem(index)}
            >
              <img
                src={
                  item.isFound
                    ? item.image
                    : '/assets/images/lockedTreasure.png'
                }
                alt='placeholder'
                className='h-full w-full'
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Treasure
