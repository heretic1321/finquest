import { BsInfoLg } from 'react-icons/bs'

import Button from '@client/components/shared/Button'

const JewelleryDetailsButton = (
  // @ts-ignore
  props: Omit<IconButtonProps, 'icon'> &
    React.ButtonHTMLAttributes<HTMLButtonElement>,
) => {
  return (
    <Button
      className='absolute right-0 top-2 mr-[180px] h-12 w-12 rounded-full border-[2px] border-[#C599FFCF] bg-[#17082FB2]'
      {...props}
    >
      <BsInfoLg className='mx-auto my-auto h-[3/4] w-[3/4] fill-neutral-300' />
    </Button>
  )
}
export default JewelleryDetailsButton
