import { useEffect, useRef, useState } from 'react'

import axios from 'axios'
import toast from 'react-hot-toast'

import { AuthAPIStore } from '@client/contexts/AuthContext'

import { AvatarStore } from '@client/contexts/AvatarAppearanceContext'
import { api } from '@client/utils/api'
import { BackendClient } from '@client/utils/axios'
import { useShallow } from 'zustand/react/shallow'

export default function ReadyPlayerMe() {
  const { userData, RPMUserId, setRPMUserId } = AuthAPIStore(
    useShallow((state) => ({
      userData: state.userData,
      RPMUserId: state.RPMUserId,
      setRPMUserId: state.setRPMUserId,
    }))
  )
  const frameRef = useRef<HTMLIFrameElement>(null)

  const [token, setToken] = useState<string | null>(null)

  const handleOnAvatarExported = async (path: string) => {
    AvatarStore.getState().handleOnAvatarExported(path)

    if (frameRef.current && frameRef.current.contentWindow)
      // Once we have a token, we can send a message to the iframe to logout the user
      // https://stackoverflow.com/questions/9153445/how-to-communicate-between-iframe-and-the-parent-site
      frameRef.current.contentWindow.postMessage(
        JSON.stringify({
          target: 'readyplayerme',
          type: 'query',
          eventName: 'v1.user.logout',
        }),
        '*',
      )
  }

  const setNewRPMUserId = async (id: string) => {
    try {
      await BackendClient.put(api.user.avatar(userData?.mobile || ''), {
        phoneNumber: userData?.mobile,
        rpmId: id,
      })
      if (setRPMUserId) setRPMUserId(id)
      localStorage.setItem('rpmUserId', id)
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong. Please try again later.')
    }
  }

  /*
   * Subscribe to events sent from Ready Player Me
   * https://docs.readyplayer.me/ready-player-me/integration-guides/web-and-native-integration/quickstart
   *
   * This function is called when the iframe is loaded and ready to receive messages
   * https://stackoverflow.com/questions/9153445/how-to-communicate-between-iframe-and-the-parent-site
   *
   */
  function subscribe(event: MessageEvent) {
    if (!frameRef.current) return
    if (import.meta.env.DEV === true) console.log(event)

    // Susbribe to all events sent from Ready Player Me once frame is ready
    if (frameRef.current.contentWindow) {
      frameRef.current.contentWindow.postMessage(
        JSON.stringify({
          target: 'readyplayerme',
          type: 'subscribe',
          eventName: 'v1.**',
        }),
        '*',
      )
    }
    /**
     * Only check events where the origin is from ReadyPlayerMe iFrame
     */
    if (event.origin !== 'https://everlite.readyplayer.me') return

    /**
     * The iframe either returns a string which is a path to a .glb file or a string which is the RPM ID
     * If the origin is rpm and data is a string ending with .glb then save that as the avatarPath in the database
     */
    if ((event.data as string).match(/.*.glb$/)) {
      handleOnAvatarExported(event.data)
    } else {
      /**
       * if the origin is rpm but data is just another string then try to save that as the rpmid in the database
       * this event is triggered when user tries to login with their RPM ID
       */
      setNewRPMUserId(event.data as string)
    }
  }

  const authenticateRPMUser = async () => {
    if (!RPMUserId) return

    const { data: generateToken } = await axios.get(
      'https://api.readyplayer.me/v1/auth/token',
      {
        params: {
          userId: RPMUserId,
          partner: 'everlite',
        },
        headers: {
          'x-api-key': import.meta.env.VITE_RPM_API_KEY,
        },
      },
    )
    setToken(generateToken.data.token)
  }

  useEffect(() => {
    if (!frameRef.current) return

    window.addEventListener('message', subscribe)
    // @ts-ignore
    document.addEventListener('message', subscribe)

    return () => {
      window.removeEventListener('message', subscribe)
      // @ts-ignore
      document.removeEventListener('message', subscribe)
    }
  }, [frameRef])

  useEffect(() => {
    if (!RPMUserId) return
    authenticateRPMUser()
  }, [RPMUserId])

  useEffect(() => {
    if (token !== null && frameRef.current) 
        frameRef.current.src = `https://everlite.readyplayer.me/avatar?frameApi&clearCache&token=${token}`
  }, [token])

  return (
    <>
      <iframe
        src={`https://everlite.readyplayer.me/avatar?frameApi&clearCache`}
        className='h-[100vh] w-[100vw] border-none absolute left-0 top-0 z-hud'
        ref={frameRef}
      />
    </>
  )
}
