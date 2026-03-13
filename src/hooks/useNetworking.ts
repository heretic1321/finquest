import { useEffect, useRef } from 'react'

import * as Colyseus from 'colyseus.js'
import { identicon } from 'minidenticons'

import { MyRoomState, Player } from '@server/rooms/schema/MyRoomState'
import {
  ClientOnJoinOptions,
  Message
} from '@server/utils/types'

import { AuthAPIStore } from '@client/contexts/AuthContext'
import { AvatarStore } from '@client/contexts/AvatarAppearanceContext'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { NetworkingStore } from '@client/contexts/NetworkingContext'
import { useShallow } from 'zustand/react/shallow'

export type MessageWithAvatarSVG = Message & { avatarSVG?: string }

const useNetworking = () => {
  const {
    room,
    isConnectionStable
  } = NetworkingStore(
    useShallow((state) => ({
      room: state.room,
      isConnectionStable: state.isConnectionStable,
    }))
  )

  const urlParams = GesturesAndDeviceStore((state) => state.urlParams)

  // Listen for any new messages in the room and update the chat message list
  useEffect(() => {
    if (!room) return

    room.onMessage('message', (message) => {
      NetworkingStore.getState().setChatMessageList(message)
      NetworkingStore.getState().setAreUnreadMessagesPresent(true)
    })

    room.onMessage('animationStateChanged', (message) => {
      AvatarStore.getState().setAnimationServerState(message.data.userId, message.data.newState)
    })

    room.onMessage('avatarDataSet', (message) => {
      NetworkingStore.setState({
        avatarDatas: message.data,
      })
    })
  }, [room])

  const avatarAnimationState = AvatarStore((state) => state.avatarAnimationState)
  const avatarData = AvatarStore((state) => state.avatarData)
  // Send the player's animation state to the server whenever it changes
  // We don't wanna do this in the useFrame as it's not needed to send the animation state
  // every frame, only when it changes
  useEffect(() => {
    if (NetworkingStore.getState().networkedAvatarAnimationsEnabled)
      NetworkingStore.getState().sendPlayerAnimationStateToServer(avatarAnimationState)
   }, [avatarAnimationState])

  const reconnectAttempts = useRef(0)
  const userDisplayName = AuthAPIStore((state) => state.userDisplayName)
  // Connect to the Colyseus server
  useEffect(() => {
    // Don't make a connection to the WS server if the display name is not available for the user
    // Currently this is our proxy for checking if the user is logged in or not
    // When we later on add guest login functionality, even then we'll ask for a display name

    if (isConnectionStable) return
    if (!isConnectionStable && reconnectAttempts.current >= 5) return

    if (
      userDisplayName === null ||
      userDisplayName === undefined ||
      userDisplayName === ''
    )
      return

    const createRoom = async (
      client: Colyseus.Client,
      clientJoinOptions: ClientOnJoinOptions,
    ) => {
      const room = await client.joinOrCreate<MyRoomState>(
        'room',
        clientJoinOptions,
      )
      NetworkingStore.getState().setRoomSessionId(room.sessionId)
      NetworkingStore.getState().setRoom(room)
      NetworkingStore.getState().setIsConnectionStable(true)
      // set room id to url as a query param
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.set('room', room.id)
      window.history.pushState({ path: newUrl.href }, '', newUrl.href)
    }

    const connectToRoom = async () => {
      const client = new Colyseus.Client(import.meta.env.VITE_WS_SERVER_URL)
      const roomID = urlParams ? urlParams.get('room') : ''
      const clientJoinOptions: ClientOnJoinOptions = {
        displayName: userDisplayName ?? 'Guest',
      }

      // if room in params then join the room by given room id
      if (roomID) {
        try {
          const _roomSessionId = NetworkingStore.getState().roomSessionId
          if (_roomSessionId) {
            const room = await client.reconnect<MyRoomState>(roomID, _roomSessionId)
            NetworkingStore.getState().setRoom(room)
          } else {
            const room = await client.joinById<MyRoomState>(
              roomID,
              clientJoinOptions,
            )
            NetworkingStore.getState().setRoom(room)
          }
          NetworkingStore.getState().setIsConnectionStable(true)
          // eslint-disable-next-line
        } catch (err: any) {
          console.error(err.code)

          // Error code 4212 represents that the room is not found
          if (err.code === 4212) {
            createRoom(client, clientJoinOptions)
          }
        }
      } else {
        try {
          await createRoom(client, clientJoinOptions)
        } catch (err) {
          NetworkingStore.getState().setIsConnectionStable(true)
          console.warn('[Networking] Server unavailable:', err)
        }
      }
    }

    reconnectAttempts.current++
    connectToRoom().catch((err) => {
      console.warn('[Networking] Could not connect to server:', err?.message || err)
      NetworkingStore.getState().setIsConnectionStable(true)
    })
  }, [userDisplayName, urlParams, isConnectionStable])

  useEffect(() => {
    if (
      !room ||
      userDisplayName === null ||
      userDisplayName === undefined ||
      userDisplayName === ''
    )
      return
    room.send('setDisplayName', {
      displayName: userDisplayName,
    })
  }, [userDisplayName, room, isConnectionStable])

  // Sets the avatar data such as avatarName and skinColor for the user
  useEffect(() => {
    if (!room || avatarData === null || avatarData === undefined) return
    room.send('setAvatarData', {
      avatarData: avatarData,
    })
  }, [avatarData, room])

  // Listen for changes in the room state and update the players array accordingly
  useEffect(() => {
    if (!room) return

    // just one, when the room state changes, set the players
    // this is necessary for the very first person to join the room
    // because for that person, the onAdd will not fire
    room.onStateChange.once((roomState) => {
      const { players } = roomState
      const playersArray: Player[] = []
      const playerAvatarSVGs: Record<string, string> = {}
      players.forEach((player) => {
        playerAvatarSVGs[player.id] = identicon(player.id)
        playersArray.push(player)
        AvatarStore.getState().setAnimationServerState(player.id, 'idle')
      })
      NetworkingStore.getState().setPlayers(playersArray)
      NetworkingStore.getState().setAvatarSVGs(playerAvatarSVGs)
    })

    room.state.players.onAdd = (player) => {
      NetworkingStore.getState().addOrUpdateAvatarSVG(player.id, identicon(player.id))
      NetworkingStore.getState().addPlayer(player)
      AvatarStore.getState().setAnimationServerState(player.id, 'idle')
    }
    room.state.players.onRemove = (_, playerId) => {
      NetworkingStore.getState().removeAvatarSVG(playerId)
      NetworkingStore.getState().removePlayer(playerId)
      AvatarStore.getState().removeKeyFromAnimationServerState(playerId)
    }
  }, [room])

  return {
  }
}

export default useNetworking
