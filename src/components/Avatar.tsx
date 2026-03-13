// import { PerformanceMonitorApi, usePerformanceMonitor } from '@react-three/drei'
import React, { MutableRefObject, PropsWithChildren, useEffect, useRef, useState } from 'react'

// import { damp } from 'maath/easing'

import { AnimationStates } from '@server/utils/types'

import { AvatarModelRef } from '@client/components/avatars/Feb'
import Generic from '@client/components/avatars/Generic'
import May from '@client/components/avatars/May'
import { SkinColorOptions } from '@client/config/Avatar'
import { AvatarStore, TAvatarData } from '@client/contexts/AvatarAppearanceContext'
import { NetworkingStore } from '@client/contexts/NetworkingContext'
import { staticResourcePaths } from '@client/config/staticResourcePaths'

type TAvatar = {
  avatarData: TAvatarData
  // currentAvatarAnimationState?: AnimationStates
  playerSpeed: MutableRefObject<number> // delta adjusted player speed
  // isPerformanceMonitorContextAvailable?: boolean
  playerUserId: string
  isOtherPlayer: boolean
  paramsForAvatar: string
}

type AnimationConfig = {
  fadeIn: number
  fadeOut: number
  timeScaleFactor: number
}

// This is a config to store different properties for different kinds of animation states.
// For example, the "jump" animation should fade in and out faster than the "idle" animation.
// Or the "run" animation should be on a faster timescale rather than the "walk" animation.
const animationConfig: Record<AnimationStates, AnimationConfig> = {
  jump: {
    fadeIn: 0.2,
    fadeOut: 0.2,
    timeScaleFactor: 0,
  },
  idle: {
    fadeIn: 0.3,
    fadeOut: 0.3,
    timeScaleFactor: 0,
  },
  walk: {
    fadeIn: 0.3,
    fadeOut: 0.3,
    timeScaleFactor: 30,
  },
  run: {
    fadeIn: 0.3,
    fadeOut: 0.2,
    timeScaleFactor: 7,
  },
  dance: {
    fadeIn: 0.3,
    fadeOut: 0.2,
    timeScaleFactor: 1,
  },
}

const Avatar = React.memo(
  ({
    // isPerformanceMonitorContextAvailable = true,
    ...props
  }: TAvatar & PropsWithChildren) => {
    const modelRef = useRef<AvatarModelRef>(null)
    const [modelAnimActions, setModelAnimActions] = useState(
      modelRef.current?.animationActions,
    )
    // for listening and reacting to the animation state changes of others on the server
    const animationServerState = AvatarStore((state) => state.animationServerState)

    // for listening and reacting to the animation state changes of self
    const currentAvatarAnimationState = AvatarStore((state) => state.avatarAnimationState)


    // This is for the case when frame rate drops, and due to that, the animation
    // will play faster and it just looks very bad. Why does it play faster? Because
    // the animation is dependent on adjusted player speed, which is inversely dependent on
    // frame rate. So if the frame rate drops, the player speed will increase, and hence
    // the animation will play faster. To counter this, we need to adjust the animation's
    // timescale based on the current fps. This is what this state is for.
    // const [, setFpsAdjustedTimeScaleMultiplier] =
    //   useState(1)
    // if (isPerformanceMonitorContextAvailable) {
    //   // Whenever the fps changes, this will set the above factor as a ratio of the current fps to 60
    //   // So if the app is running on 30fps, this time scale multiplier will be 0.5 and hence the `timeScaleFactor`
    //   // of the animation will be multiplied by 0.5, which will slow down the animation by half.
    //   usePerformanceMonitor({
    //     onChange: (api: PerformanceMonitorApi) => {
    //       setFpsAdjustedTimeScaleMultiplier(api.fps / api.refreshrate)
    //     },
    //   })
    // }

    const selectRandomDanceIndex = () => {
      const randomIndex = Math.floor(Math.random() * staticResourcePaths.danceAnims.length);
      return randomIndex;
    };

    // This effect will rerun whenever the self's animation state changes
    // If self is going from "idle" to "walk", this effect will run
    // and the avatar will slowly fadeout the idle animation and fadein the walk animation.
    useEffect(() => {
      if (
        props.playerUserId == '' ||
        modelAnimActions === undefined ||
        modelAnimActions === null
      )
        return

      const lerpAnimation = (currentAnimState: AnimationStates) => {
        let animation = modelAnimActions[currentAnimState]
        if (currentAnimState === 'dance') {
          const randomDanceIndex = selectRandomDanceIndex();
          animation = modelAnimActions[`dance_${randomDanceIndex + 1}`]
        }
        if (animation === null || animation === undefined) return
        const fadeInValue = animationConfig[currentAnimState].fadeIn
        const fadeOutValue = animationConfig[currentAnimState].fadeOut
        animation.reset().fadeIn(fadeInValue).play()

        // This return function will be called before the next time this useEffect triggers,
        // hence fading out the previous animation before starting the new one
        return () => {
          animation?.fadeOut(fadeOutValue)
        }
      }

      if (!props.isOtherPlayer) {
        const currentAnimState = currentAvatarAnimationState
        return lerpAnimation(currentAnimState)
      }
    }, [
      modelAnimActions,
      currentAvatarAnimationState,
      props.isOtherPlayer
    ])

    // This effect will rerun whenever the other avatar's animation state changes
    // If John Doe avatar is going from "idle" to "walk", this effect will run
    // and the avatar will slowly fadeout the idle animation and fadein the walk animation.
    useEffect(() => {
      if (
        props.playerUserId == '' ||
        modelAnimActions === undefined ||
        modelAnimActions === null
      )
        return

      const lerpAnimation = (currentAnimState: AnimationStates) => {
        let animation = modelAnimActions[currentAnimState]
        if (currentAnimState === 'dance') {
          return
        }
        if (animation === null || animation === undefined) return
        const fadeInValue = animationConfig[currentAnimState].fadeIn
        const fadeOutValue = animationConfig[currentAnimState].fadeOut
        animation.reset().fadeIn(fadeInValue).play()

        // This return function will be called before the next time this useEffect triggers,
        // hence fading out the previous animation before starting the new one
        return () => {
          animation?.fadeOut(fadeOutValue)
        }
      }

      if (props.isOtherPlayer) {
        if (!(props.playerUserId in animationServerState)) return
        const currentAnimState = animationServerState[props.playerUserId]

        // if networked avatar's animations are nor enabled, for example in high volumne events,
        // we only want the idle animation to play
        if (!NetworkingStore.getState().networkedAvatarAnimationsEnabled) {
          if (currentAnimState !== 'idle') return lerpAnimation('idle')
          return lerpAnimation(currentAnimState)
        } else return lerpAnimation(currentAnimState)
      } else {
        lerpAnimation('idle')
      }
    }, [
      modelAnimActions,
      animationServerState[props.playerUserId],
      props.isOtherPlayer
    ])

    const [areAnimActionsSet, setAreAnimActionsSet] = useState(false)
    useEffect(() => {
      if (modelRef.current?.animationActions) {
        setModelAnimActions(modelRef.current?.animationActions)
        if (modelRef.current.animationActions['walk'])
          modelRef.current.animationActions['walk'].timeScale = 1.5
        modelRef.current.animationActions['idle']?.play()
      }

    }, [areAnimActionsSet])

    // This effect is responsible for adjusting the timescale property of each playing animation.
    // We don't want it to seem that the charachter is gliding on the ground when they are walking or running.
    // We wanna have a close match between the avatar's animation and the player's overall translation. Timescale helps us with that
    // useEffect(() => {
    //   if (
    //     modelAnimActions === undefined ||
    //     modelAnimActions === null ||
    //     props.playerUserId == '' ||
    //     animationServerState == null ||
    //     !(props.playerUserId in animationServerState)
    //   )
    //     return

    //   const currentAnimState = animationServerState[props.playerUserId]
    //   const animation = modelAnimActions[currentAnimState]
    //   if (animation === null || animation === undefined) return
    //   const fpsAdjustedTimeScaleValue =
    //     1 +
    //     animationConfig[currentAnimState].timeScaleFactor *
    //       props.playerSpeed.current *
    //       Math.pow(fpsAdjustedTimeScaleMultiplier, 2)

    //   // we're damping this because if we don't, the walking/running animation's speed
    //   // changes too abruptly.
    //   damp(animation, 'timeScale', fpsAdjustedTimeScaleValue, 0.25)
    // }, [props.playerSpeed, fpsAdjustedTimeScaleMultiplier, animationServerState, props.playerUserId])

    if (props.avatarData === null || props.avatarData === undefined)
      return <May ref={modelRef} skinColor={SkinColorOptions.fair} />

    return <Generic
      ref={modelRef}
      avatarData={props.avatarData}
      areAnimActionsSet={areAnimActionsSet}
      setAreAnimActionsSet={setAreAnimActionsSet}
      isOtherPlayer={props.isOtherPlayer}
      paramsForAvatar={props.paramsForAvatar}
    />
  },
)
export default Avatar
