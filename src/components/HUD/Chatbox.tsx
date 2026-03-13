
import { BsSendFill } from 'react-icons/bs'
import { HiChatAlt2 } from 'react-icons/hi'
import { IoCloseSharp } from 'react-icons/io5'
import SVG from 'react-inlinesvg'

import { Message } from '@server/utils/types'

import Button from '@client/components/shared/Button'
import { HUDStore } from '@client/contexts/HUDContext'
import { NetworkingStore } from '@client/contexts/NetworkingContext'
import { useShallow } from 'zustand/react/shallow'
import { SoundsStore } from '../Sounds'

const CHAT_COLOR_OPTIONS = ['#8AFF6C', '#FF6B6B', '#FF6BDF', '#FFD12E'] as const

const userColorMap: {
  [key: string]: string
} = {}

const Chatbox = () => {
  const {
    chatMessageList,
    currentChatMessage,
    setCurrentChatMessage,
    sendChatMessageToServer,
    avatarSVGs,
    areUnreadMessagesPresent,
    setAreUnreadMessagesPresent,
    room
  } = NetworkingStore(
    useShallow((state) => ({
      chatMessageList: state.chatMessageList,
      currentChatMessage: state.currentChatMessage,
      setCurrentChatMessage: state.setCurrentChatMessage,
      sendChatMessageToServer: state.sendChatMessageToServer,
      avatarSVGs: state.avatarSVGs,
      areUnreadMessagesPresent: state.areUnreadMessagesPresent,
      setAreUnreadMessagesPresent: state.setAreUnreadMessagesPresent,
      room: state.room
    }))
  )
  const {
    showChatbox,
    setShowChatbox,
    setShowCart,
    setShowTreasureHuntScreen,
  } = HUDStore(
    useShallow((state) => ({
      showChatbox: state.showChatbox,
      setShowChatbox: state.setShowChatbox,
      setShowCart: state.setShowCart,
      setShowTreasureHuntScreen: state.setShowTreasureHuntScreen,
    }))
  )

  // if any of the networking data is null, don't render the chatbox
  if (
    room === null ||
    chatMessageList === null ||
    currentChatMessage === null ||
    setCurrentChatMessage === null ||
    sendChatMessageToServer === null
  )
    return null

  function getRandomChatColor(id: string) {
    if (userColorMap[id]) {
      return userColorMap[id]
    }
    const randomColor =
      CHAT_COLOR_OPTIONS[Math.floor(Math.random() * CHAT_COLOR_OPTIONS.length)]
    userColorMap[id] = randomColor
    return randomColor
  }

  const renderMessage = ({ type, data }: Message, color: string) => {
    if (!room) return ''
    switch (type) {
      case 'text':
        return (
          // text message bubble
          <div
            className={`w-fit py-2 text-xs ${
              data.userId === room?.sessionId ? 'ml-auto  ' : 'mr-auto '
            } `}
          >
            <div
              className={`flex items-center justify-end gap-1 ${
                data.userId === room?.sessionId
                  ? 'ml-auto flex-row'
                  : `mr-auto flex-row-reverse`
              }  `}
              style={{
                color: data.userId === room.sessionId ? '#4AF1FF' : color,
              }}
            >
              <div className='font-bold'>
                {data.userId === room?.sessionId ? 'You' : data.displayName}
              </div>
              <div className='h-6 w-6 rounded-full bg-black'>
                <SVG src={avatarSVGs !== null ? avatarSVGs[data.userId] : ''} />
              </div>
            </div>
            <div
              className={`w-fit ${
                data.userId === room?.sessionId
                  ? 'ml-auto text-[#4AF1FF]'
                  : 'mr-auto text-white'
              }  `}
            >
              <p className='font-regular'>{data.message}</p>
            </div>
          </div>
        )
      case 'info':
        if (data.userId === room?.sessionId) return ''
        return (
          // info message interface
          <div
            className='mx-auto flex flex-col py-2 text-center  text-xs '
            style={{
              opacity: data.info === 'user connected' ? 1 : 0.5,
            }}
          >
            <div className='flex items-center justify-center gap-1 py-1'>
              <div className='h-6 w-6'>
                <SVG src={avatarSVGs !== null ? avatarSVGs[data.userId] : ''} />
              </div>
              <div className='font-bold text-[#FFD12E]'>{data.displayName}</div>
            </div>
            <div className='relative flex items-center justify-between gap-2 text-white'>
              <hr className='w-full border-[#0B33F1]' />
              <div className='flex items-center justify-center text-white'>
                <span>&gt;</span>
                <span className='z-[2] block whitespace-nowrap'>
                  {(() => {
                    if (data.info === 'user connected') return ` Has joined`
                    if (data.info === 'user disconnected') return ` Has left`
                  })()}
                </span>
                <span>&lt;</span>
              </div>
              <hr className='w-full border-[#0B33F1]' />
            </div>
          </div>
        )
    }
  }

  const handleChatButtonClick = (action: string) => {
    /**
     * Hide the cart if the chatbox is being opened
     */
    SoundsStore.getState().playClickSoundOnce()
    if (!showChatbox) {
      setShowCart(false)
      setShowTreasureHuntScreen(false)
    }
    setShowChatbox(action === 'open')
  }

  return (
    <div
      className={`mobileChatBgGradient gradient-border slide-up-anim md:rounded-0 pointer-events-auto flex flex-row gap-2 rounded-t-2xl p-4 pt-16 md:p-0  ${
        showChatbox ? 'h-initial w-full md:w-1/2 lg:w-1/4' : ''
      }`}
    >
      <div className='relative flex w-full flex-col justify-end gap-4 md:w-[400px]'>
        {showChatbox && (
          <div className=' absolute -top-12 right-[0] flex w-full items-center justify-start'>
            <h3 className='text-2xl text-white md:hidden'>Live Chat</h3>
            <Button
              className='ml-auto h-8 w-8 rounded-full border-[2px] border-[#C599FFCF] bg-[#17082FB2] '
              onClick={() => handleChatButtonClick('close')}
            >
              <IoCloseSharp className='mx-auto my-auto h-2/3 w-2/3 fill-neutral-300'></IoCloseSharp>
            </Button>
          </div>
        )}
        <div>
          {showChatbox ? (
            <div className='w-full rounded-md  border  border-[#C599FFCF] bg-[#17082FB2] p-4 pr-2 backdrop:blur-md'>
              <div className='relative flex max-h-[50vh] flex-col-reverse overflow-x-auto pr-2'>
                {chatMessageList.map((message) => (
                  <li className='list-none' key={message.id}>
                    {renderMessage(
                      message,
                      getRandomChatColor(message.data.userId),
                    )}
                  </li>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <div className='flex items-stretch justify-between rounded-md text-white  md:gap-4'>
          <div
            className='flex w-full items-center rounded-md rounded-r-none border border-r-0 border-[#C599FFCF]  bg-[#17082FB2]  p-2 backdrop:blur-md md:w-[345px] md:gap-2 md:rounded-r-md md:border-r'
            onClick={() => {
              // if the chatbox is being opened, set the unread messages indicator to false
              if (showChatbox && setAreUnreadMessagesPresent !== null)
                setAreUnreadMessagesPresent(false)
              handleChatButtonClick('open')
            }}
          >
            <HiChatAlt2 className='h-6 w-6 fill-white' />
            <input
              type='text'
              placeholder='Say Something'
              value={currentChatMessage}
              onChange={(e) => {
                setCurrentChatMessage(e.target.value)
              }}
              className='ml-2 w-full bg-transparent text-white focus:outline-none active:outline-none md:w-[95%]'
              onKeyDown={(e) => {
                e.stopPropagation()
                if (e.key === 'Enter')
                  sendChatMessageToServer(currentChatMessage)
              }}
            />
          </div>

          <div
            className=' flex h-[50px] w-[50px]  items-center justify-center rounded-md rounded-l-none border border-l-0 border-[#C599FFCF] bg-[#17082FB2] p-2 backdrop:blur-md md:rounded-l-md md:border-l'
            onClick={() => {
              SoundsStore.getState().playClickSoundOnce()
              sendChatMessageToServer(currentChatMessage)
            }}
          >
            <BsSendFill className='h-6 w-6 fill-white' />
          </div>
        </div>

        {/* This is a ping indicator that shows up when there are unread messages */}
        <span
          className={`pointer-events-none absolute bottom-10 left-0 h-6 w-6 ${
            areUnreadMessagesPresent && !showChatbox ? 'flex' : 'hidden'
          }`}
        >
          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C599FF] opacity-75'></span>
          <span className='relative left-1.5 top-1.5 inline-flex h-3 w-3 rounded-full bg-[#C599FF]'></span>
        </span>
      </div>
    </div>
  )
}

export default Chatbox
