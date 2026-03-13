import React, { ChangeEvent, useState } from 'react'

import GradientBorder from '@client/components/GradientBorder'
import Button from '@client/components/shared/Button'
import { AuthAPIStore } from '@client/contexts/AuthContext'

interface ContinueAsGuestFormProps {
  setCurrentTab: (tab: string) => void
}

const ContinueAsGuestForm: React.FC<ContinueAsGuestFormProps> = ({
  setCurrentTab,
}) => {
  const [username, setUsername] = useState('')
  const continueAsGuest = AuthAPIStore((state) => state.continueAsGuest)
  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
  }

  return (
    <>
      <h1 className='py-4 text-center text-3xl md:text-left md:text-4xl'>
        What should we call you?
      </h1>

      <form>
        <div className='flex flex-col gap-2 py-2'>
          <label htmlFor='' className='py-1'>
            Username
          </label>
          <input
            className='w-full rounded-md border border-[#C599FFCF] bg-[#17082F80] px-5 py-3 text-[#C599FF]'
            type='text'
            placeholder='Pick a cool username'
            onChange={handleUsernameChange}
          />
        </div>

        {
          <div className='mx-auto mb-10 mt-8 h-24 w-24 rounded-md bg-white p-2 '>
            <img
              className='h-full w-full'
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${username}`}
              alt=''
            />
          </div>
        }

        <div className='my-6'>
          <GradientBorder className='-skew-x-[10deg] rounded-md'>
            <Button
              classNames='!skew-x-0 !border-0'
              disabled={username.length < 1}
              onClick={() => continueAsGuest && continueAsGuest(username)}
            >
              Continue
            </Button>
          </GradientBorder>
        </div>

        <div className='py-4 text-center'>
          <a onClick={() => setCurrentTab('mobile')}>Back to Login Selection</a>
        </div>

        <p className='note text-center text-sm text-gray-600'>
          *Note: As you are a guest, you can only explore the space and cannot
          participate in the treasure hunt or make any purchase.
        </p>
      </form>
    </>
  )
}

export default ContinueAsGuestForm
