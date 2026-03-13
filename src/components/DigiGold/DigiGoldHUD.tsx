import { memo, useEffect, useState } from 'react'
import { SoundsStore } from '../Sounds'
import { DigiGoldHUDStore } from '@client/contexts/DigiGoldHUDContext'
import { useShallow } from 'zustand/react/shallow'
import { calculatePerGramRate } from '@client/utils/api'

const DigiGoldHUD = memo(() => {
  const [hudVisible, setHudVisible] = useState(true)
  const [buyType, setBuyType] = useState<'INR' | 'g'>('INR')
  const [amount, setAmount] = useState<string>('')
  const gst = 1.03
  const quickAmounts = [500, 2000, 5000, 10000]
  const quickAmountsInG = [1, 2, 5, 10]
  const [minAmount, setMinAmount] = useState<number>(0)
  const minGrams = 0.05 // Add minimum grams constant
  const [ratePerGram, setRatePerGram] = useState<number | null>(null)

  const calculateGold = (value: number) => {
    if (!ratePerGram) return 0
    return buyType === 'INR'
      ? (value / ratePerGram).toFixed(4)
      : value.toFixed(4)
  }

  const calculatePrice = (value: number) => {
    if (!ratePerGram) return 0
    return buyType === 'INR'
      ? (value * gst).toFixed(2)
      : (value * ratePerGram * gst).toFixed(2)
  }
  const {
    isDigiGoldTransitionToPresentationModeComplete,
    isDigiGoldPresentationMode,
    setIsDigiGoldPresentationModeShuttingDown,
    setIsDigiGoldTransitionToPresentationModeComplete,
    isDigiGoldVisible,
  } = DigiGoldHUDStore(
    useShallow((state) => ({
      isDigiGoldTransitionToPresentationModeComplete:
        state.isDigiGoldTransitionToPresentationModeComplete,
      isDigiGoldPresentationMode: state.isDigiGoldPresentationMode,
      setIsDigiGoldPresentationModeShuttingDown:
        state.setIsDigiGoldPresentationModeShuttingDown,
      setIsDigiGoldTransitionToPresentationModeComplete:
        state.setIsDigiGoldTransitionToPresentationModeComplete,
      isDigiGoldVisible: state.isDigiGoldVisible,
    })),
  )
  const exitButtonClicked = () => {
    setHudVisible(false)
    SoundsStore.getState().playClickSoundOnce()
    if (
      isDigiGoldTransitionToPresentationModeComplete &&
      isDigiGoldPresentationMode
    ) {
      setIsDigiGoldPresentationModeShuttingDown(true)
      setIsDigiGoldTransitionToPresentationModeComplete(false)
    }
  }
  //every 2sec if the digigold is visible   call the API and update the ratePerGram
  useEffect(() => {
    if (!isDigiGoldVisible) return
    const fetchRate = async () => {
      if (!isDigiGoldVisible) return
      try {
        const rate = await calculatePerGramRate()
        if (rate) {
          setRatePerGram(rate)
        }
      } catch (e) {
        console.log('error fetching rate', e)
      }
    }

    // Initial fetch
    fetchRate()
    const interval = setInterval(fetchRate, 2000)
    return () => clearInterval(interval)
  }, [isDigiGoldVisible])

  useEffect(() => {
    if (isDigiGoldVisible && ratePerGram) {
      //min amount should be set such that that weight come as 0.05 at min value of ratePerGram
      const minAmount = minGrams * ratePerGram
      setMinAmount(minAmount)
    }
  }, [ratePerGram])

  return (
    <div>
      {hudVisible && (
        <div className='absolute left-1/2 top-1/2 z-hud grid h-[85%] w-[80%] -translate-x-1/2 -translate-y-1/2 select-none grid-rows-[8%_92%] object-contain text-black lg:mx-auto lg:h-[80%] lg:w-[80%] lg:grid-rows-[10%_90%]'>
          {/* Live Buy Rate Header */}
          <div className='flex items-center lg:m-4'>
            <div className='flex flex-1 items-center justify-center gap-2'>
              <div className='h-3 w-3 rounded-full bg-green-500 lg:h-4 lg:w-4'></div>
              <span className='text-base text-white lg:text-3xl'>
                Live Buy Rate -
              </span>
              <span className='text-base text-white lg:text-3xl'>
                GOLD :
                <span className='animate-[pulse_0.8s_ease-in-out_infinite] text-[#E5B95F]'>
                  {' '}
                  ₹{ratePerGram?.toFixed(2)}/g
                </span>
              </span>
            </div>
            <button
              className='rounded bg-[#B17C3F] px-3 py-1 text-base text-white transition-colors hover:bg-[#9c6d37] lg:px-8 lg:py-4 lg:text-3xl'
              onClick={exitButtonClicked}
            >
              EXIT
            </button>
          </div>

          {/* Main Card */}
          <div className='grid grid-rows-[0.5fr_1fr_0.8fr_1fr_0.7fr] rounded-md border border-[#E5B95F] p-2 lg:grid-rows-5 lg:rounded-xl lg:p-6'>
            {/* Toggle Buttons */}
            <div className='grid h-8 w-full grid-cols-2 py-0.5 lg:h-auto lg:px-4 lg:py-4'>
              <div
                className={`mx-1 flex cursor-pointer items-center justify-center rounded-md py-0.5 text-center text-xs transition-colors lg:mx-2 lg:rounded-2xl lg:py-4 lg:text-4xl ${
                  buyType === 'INR'
                    ? 'bg-[#14163D] text-white'
                    : 'bg-gray-400 text-white'
                }`}
                onClick={() => {
                  setBuyType('INR')
                  setAmount('')
                }}
              >
                Buy in ₹
              </div>
              <div
                className={`mx-1 flex cursor-pointer items-center justify-center rounded-md py-0.5 text-center text-xs transition-colors lg:mx-2 lg:rounded-2xl lg:py-4 lg:text-4xl ${
                  buyType === 'g'
                    ? 'bg-[#14163D] text-white'
                    : 'bg-gray-400 text-white'
                }`}
                onClick={() => {
                  setBuyType('g')
                  setAmount('')
                }}
              >
                Buy in g
              </div>
            </div>

            {/* Input Section */}
            <div className='flex flex-col justify-center'>
              <label className='mb-2 block text-center text-lg text-white lg:text-3xl'>
                {buyType === 'INR'
                  ? `Enter Amount (Min. ₹${minAmount.toFixed(2)})`
                  : 'Enter Weight (Min. 0.05 g)'}
              </label>
              <input
                type='number'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Enter ${buyType === 'INR' ? 'amount' : 'weight'}`}
                className='w-full border-b-2 border-[#E5B95F] bg-transparent p-2 text-lg text-white placeholder-gray-400 focus:outline-none lg:p-3 lg:text-2xl'
              />
            </div>

            {/* Quick Selection Buttons - 2x2 grid on mobile, single row on desktop */}
            <div className='m-1 grid h-16 grid-cols-2 gap-1 lg:m-6 lg:flex lg:h-auto lg:gap-2'>
              {buyType === 'INR'
                ? quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      className={`mx-1 flex-1 rounded-xl py-0.5 text-center text-xs lg:mx-4 lg:py-3 lg:text-2xl ${
                        amount === amt.toString()
                          ? 'bg-[#14163D] text-white'
                          : 'border border-gray-300 bg-gray-400 text-white hover:bg-gray-500'
                      }`}
                    >
                      ₹ {amt}
                    </button>
                  ))
                : quickAmountsInG.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      className={`mx-1 flex-1 rounded-xl py-0.5 text-center text-xs lg:mx-4 lg:py-3 lg:text-2xl ${
                        amount === amt.toString()
                          ? 'bg-[#14163D] text-white'
                          : 'border border-gray-300 bg-gray-400 text-white hover:bg-gray-500'
                      }`}
                    >
                      {amt} g
                    </button>
                  ))}
            </div>

            {/* Total Calculation */}
            <div className='mb-2 grid grid-rows-3 lg:mb-5'>
              <div className='text-sm text-white lg:text-2xl'>
                Total Gold :{' '}
                <span className='text-[#E5B95F]'>
                  {calculateGold(Number(amount) || 0)} g
                </span>
              </div>

              <div className='flex justify-between'>
                <div className='text-sm text-white lg:text-2xl'>
                  Total Price : ₹
                  <span className='text-[#E5B95F]'>
                    {calculatePrice(Number(amount) || 0)}
                  </span>
                </div>
                <div className='text-sm text-white lg:text-2xl'>
                  Including 3% GST
                </div>
              </div>
              <div className='text-xs text-white lg:text-2xl'>
                The Gold You Purchase Will take 48 Working Hours to process and
                Reflect in your myDigiGold Wallet. Meanwhile it will be shown
                Under Processing
              </div>
            </div>

            {/* Info Text */}
            {/* <div className='mb-5 text-2xl text-gray-500'>
          The Gold You Purchase Will take 48 Working Hours to process and
          Reflect in your myDigiGold Wallet. Meanwhile it will be shown Under
          Processing
        </div> */}

            {/* Proceed Button */}
            <div className='w-full rounded py-1 lg:py-3'>
              <button
                className={`h-full w-full rounded-xl py-1 text-xl lg:rounded-3xl lg:py-3 lg:text-4xl ${
                  (buyType === 'INR' && Number(amount) < minAmount) ||
                  (buyType === 'g' && Number(amount) < minGrams)
                    ? 'cursor-not-allowed bg-gray-400 text-white'
                    : 'bg-[#B17C3F] text-white hover:bg-[#9c6d37]'
                }`}
                disabled={
                  (buyType === 'INR' && Number(amount) < minAmount) ||
                  (buyType === 'g' && Number(amount) < minGrams)
                }
                onClick={() => {
                  window.open('https://mydigigold.com/', '_blank')
                }}
              >
                PROCEED
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default DigiGoldHUD
