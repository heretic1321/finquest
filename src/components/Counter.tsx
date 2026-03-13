import React from 'react'

import GradientBorder from '@client/components/GradientBorder'

type Props = {
  value: number
  setValue: (action: 'add' | 'remove') => void
}

const Counter: React.FC<Props> = ({ value, setValue }) => {
  return (
    <GradientBorder className='w-[70px] rounded-md'>
      <div className='flex h-6 w-full items-center justify-center rounded-md bg-[#17082F] [&>div]:flex-1 [&>div]:text-center'>
        <div className='cursor-pointer' onClick={() => setValue('remove')}>
          -
        </div>
        <div>{value}</div>
        <div className='cursor-pointer' onClick={() => setValue('add')}>
          +
        </div>
      </div>
    </GradientBorder>
  )
}

export default Counter
