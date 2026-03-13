import React, { MutableRefObject, useEffect, useRef, useState } from 'react'

import { AnimationStates } from '@server/utils/types'

import { AvatarModelRef } from '@client/components/avatars/Generic'
import Generic from '@client/components/avatars/Generic'
import { AvatarStore, TAvatarData } from '@client/contexts/AvatarAppearanceContext'

type TAvatar = {
  avatarData: TAvatarData
  playerSpeed: MutableRefObject<number>
  playerUserId: string
  isOtherPlayer: boolean
  paramsForAvatar: string
}

type AnimationConfig = {
  fadeIn: number
  fadeOut: number
}

const animationConfig: Record<string, AnimationConfig> = {
  jump: { fadeIn: 0.2, fadeOut: 0.2 },
  idle: { fadeIn: 0.3, fadeOut: 0.3 },
  walk: { fadeIn: 0.3, fadeOut: 0.3 },
  run:  { fadeIn: 0.3, fadeOut: 0.2 },
}

const Avatar = React.memo(({ ...props }: TAvatar & React.PropsWithChildren) => {
  const modelRef = useRef<AvatarModelRef>(null)
  const [modelAnimActions, setModelAnimActions] = useState<Record<string, THREE.AnimationAction | null> | null>(null)

  const currentAvatarAnimationState = AvatarStore((state) => state.avatarAnimationState)

  // Crossfade animations when state changes
  useEffect(() => {
    if (!modelAnimActions) return

    const animation = modelAnimActions[currentAvatarAnimationState]
    if (!animation) return
    const config = animationConfig[currentAvatarAnimationState] || { fadeIn: 0.3, fadeOut: 0.3 }
    animation.reset().fadeIn(config.fadeIn).play()

    return () => {
      animation?.fadeOut(config.fadeOut)
    }
  }, [modelAnimActions, currentAvatarAnimationState])

  // Initialize animation actions from Generic ref
  const [areAnimActionsSet, setAreAnimActionsSet] = useState(false)
  useEffect(() => {
    if (modelRef.current?.animationActions) {
      setModelAnimActions(modelRef.current.animationActions)
      if (modelRef.current.animationActions['walk'])
        modelRef.current.animationActions['walk'].timeScale = 1.5
      modelRef.current.animationActions['idle']?.play()
    }
  }, [areAnimActionsSet])

  return (
    <Generic
      ref={modelRef}
      avatarData={props.avatarData}
      areAnimActionsSet={areAnimActionsSet}
      setAreAnimActionsSet={setAreAnimActionsSet}
      isOtherPlayer={false}
      paramsForAvatar=''
    />
  )
})

export default Avatar
