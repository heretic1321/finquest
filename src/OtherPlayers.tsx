import { Suspense, useEffect, useState } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { Player } from '@server/rooms/schema/MyRoomState'

import Character from './components/Character'
import { NetworkingStore } from './contexts/NetworkingContext'

function OtherPlayers(props: { gravity: number }) {
  const { room, players, avatarDatas } = NetworkingStore(
    useShallow((state) => ({
      room: state.room,
      players: state.players,
      avatarDatas: state.avatarDatas,
    })),
  )

  const [selfPlayer, setSelfPlayer] = useState<Player | null>(null)
  useEffect(() => {
    setSelfPlayer(
      players?.find((player) => player.id === room?.sessionId) || null,
    )
  }, [players])

  return (
    <group name='players'>
      {players?.map((player: Player) => {
        if (player.id !== room?.sessionId)
          return (
            <Suspense fallback={null} key={player.id}>
              <Character
                playerName={player.displayName}
                position={[
                  player.position.x,
                  player.position.y,
                  player.position.z,
                ]}
                rotation={[
                  player.rotation.x,
                  player.rotation.y,
                  player.rotation.z,
                ]}
                gravity={props.gravity}
                avatarData={avatarDatas[player.id]}
                avatarAnimationState={player.animationState}
                isOtherPlayer={true}
                playerObject={player}
                playerUserId={player.id}
                paramsForAvatar={
                  'quality=low&lod=2&textureSizeLimit=256&textureQuality=low&textureAtlas=256&textureFormat=webp&textureChannels=baseColor&useDracoMeshCompression=true'
                }
                selfPlayer={selfPlayer}
                isVRMode={false}
              />
            </Suspense>
          )

        return null
      })}
    </group>
  )
}

export default OtherPlayers
