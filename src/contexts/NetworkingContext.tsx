import { createContext } from 'react'
import { create } from 'zustand'

export type NetworkingContextType = {}
export const NetworkingContext = createContext<NetworkingContextType>({})

// Stub — no multiplayer in FinQuest. All methods are no-ops.
export const NetworkingStore = create<any>(() => ({
  room: null,
  players: [],
  setRoom: () => {},
  addPlayer: () => {},
  removePlayer: () => {},
  setPlayers: () => {},
  chatMessageList: [],
  setChatMessageList: () => {},
  currentChatMessage: '',
  setCurrentChatMessage: () => {},
  sendChatMessageToServer: () => {},
  sendPlayerTransformToServer: () => {},
  sendPlayerAnimationStateToServer: () => {},
  avatarSVGs: {},
  setAvatarSVGs: () => {},
  addOrUpdateAvatarSVG: () => {},
  removeAvatarSVG: () => {},
  avatarDatas: {},
  addOrUpdateAvatarData: () => {},
  removeAvatarData: () => {},
  areUnreadMessagesPresent: false,
  setAreUnreadMessagesPresent: () => {},
  roomSessionId: null,
  setRoomSessionId: () => {},
  isConnectionStable: true, // Always "stable" — no server needed
  setIsConnectionStable: () => {},
  leglessNetworkedAvatarsEnabled: false,
  networkedAvatarAnimationsEnabled: false,
  nameTagsEnabled: false,
}))

export const NetworkingContextProvider = ({
  children,
}: React.PropsWithChildren) => {
  // No networking hook — just pass children through
  return (
    <NetworkingContext.Provider value={{}}>
      {children}
    </NetworkingContext.Provider>
  )
}
