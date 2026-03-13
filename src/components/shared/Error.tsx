import React from 'react'

interface ErrorProps {
  text: string
}

const Error: React.FC<ErrorProps> = ({ text }) => {
  return (
    <div className='flex items-center gap-3 pb-2 text-sm font-medium'>
      <span className='h-6 w-6 rounded-full border border-[#FF8686] text-center text-[#FF8686]'>
        !
      </span>
      <p className='text-white'>{text}</p>
    </div>
  )
}

export default Error
