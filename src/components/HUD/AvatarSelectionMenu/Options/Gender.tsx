import React from 'react'

import { AvatarOptions } from '@client/config/Avatar'

interface GenderProps {
  currentlySelectedAvatar: string
  handleAvatarClick: (key: string) => void
}

const Gender: React.FC<GenderProps> = ({
  currentlySelectedAvatar,
  handleAvatarClick,
}) => {
  return (
    <div className='mx-auto  flex  gap-6 md:flex-col'>
      {Object.entries(AvatarOptions).map(([key, avatar]) => (
        <div
          key={key}
          onClick={() => handleAvatarClick(key)}
          className={`md:w-30 mx-auto h-28 w-28 cursor-pointer rounded-full ${
            currentlySelectedAvatar === key
              ? 'border-4 border-[#8A2EFF] bg-[#251243AD]'
              : 'bg-black'
          }`}
          style={{
            backgroundImage: `url('${avatar.previewImagePath}')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />
      ))}
    </div>
  )
}

export default Gender
