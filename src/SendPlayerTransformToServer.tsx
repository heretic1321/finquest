import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { CharacterRef } from "./components/Character";
import { NetworkingStore } from "./contexts/NetworkingContext";
import { genericStore } from "./contexts/GlobalStateContext";

function SendPlayerTransformToServer(props: {
  characterRef:  React.MutableRefObject<CharacterRef | null>
}) {
  const {
    sendPlayerTransformToServer,
    isConnectionStable,
    players
  } = NetworkingStore(
    useShallow((state) => ({
      sendPlayerTransformToServer: state.sendPlayerTransformToServer,
      isConnectionStable: state.isConnectionStable,
      players: state.players,
    }))
  )

  // we push movements to the server at different intervals depending on the number of players in the room
  const pushMoveEventInterval = useRef<number>(50)

  useEffect(() => {
    if (players.length >= 1 && players.length <= 5) {
      pushMoveEventInterval.current = 50
    } else if (players.length >= 6 && players.length <= 10) {
      pushMoveEventInterval.current = 50
    } else if (players.length >= 10 && players.length < 15) {
      pushMoveEventInterval.current = 60
    } else if (players.length >= 15 && players.length < 20) {
      pushMoveEventInterval.current = 60
    } else if (players.length >= 20 && players.length < 25) {
      pushMoveEventInterval.current = 70
    } else if (players.length >= 25) {
      pushMoveEventInterval.current = 80
    }
  }, [players])

  // we'll be pushing the transforms of the current player to the server every 60ms
  const lastTransformPushTime = useRef<number>(Date.now())

  useFrame(() => {
    if (!genericStore.getState().isTabFocused) return
    if (props.characterRef.current?.playerRef) {
      // send the player's position to the server
      if (
        sendPlayerTransformToServer !== null && 
        isConnectionStable &&
        props.characterRef.current?.playerRef.current?.position &&
        props.characterRef.current?.playerRef.current?.rotation
      )
        sendPlayerTransformToServer(
          props.characterRef.current?.playerRef.current?.position,
          props.characterRef.current?.playerRef.current?.rotation,
          pushMoveEventInterval,
          lastTransformPushTime
        )
    }
  })
  return null
}

export default SendPlayerTransformToServer