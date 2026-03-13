import {
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

import { AvatarOptions } from '@client/config/Avatar'
import { genericStore } from '@client/contexts/GlobalStateContext'

export interface AvatarModelRef {
  animationActions: Record<string, THREE.AnimationAction | null> | null
}
type AvatarModelProps = JSX.IntrinsicElements['group'] & {
  avatarData: {
    avatarPath: string
  }
  areAnimActionsSet: boolean
  setAreAnimActionsSet: React.Dispatch<React.SetStateAction<boolean>>
  isOtherPlayer: boolean
  paramsForAvatar: string
}

const AVATAR_CONFIG = AvatarOptions.feb
const DEFAULT_AVATAR = './assets/avatars/feb.glb'

const Generic: ForwardRefRenderFunction<AvatarModelRef, AvatarModelProps> = (
  {
    avatarData,
    setAreAnimActionsSet,
    areAnimActionsSet,
    isOtherPlayer,
    ...props
  },
  ref,
) => {
  // This group wraps the avatar primitive — useAnimations binds the mixer to this
  const wrapperGroup = useRef<THREE.Group>(null!)
  const hips = useRef<THREE.Object3D | null>(null)

  // Load animations
  const { animations: IdleAnimation } = useGLTF('./assets/animations/Standing_Idle.glb')
  const { animations: WalkAnimation } = useGLTF('./assets/animations/Walk.glb')
  const { animations: RunAnimation } = useGLTF('./assets/animations/Run.glb')
  const { animations: JumpAnimation } = useGLTF('./assets/animations/Jump_2.glb')

  IdleAnimation[0].name = 'idle'
  WalkAnimation[0].name = 'walk'
  RunAnimation[0].name = 'run'
  JumpAnimation[0].name = 'jump'

  const allClips = useMemo(() => [
    IdleAnimation[0], WalkAnimation[0], RunAnimation[0], JumpAnimation[0],
  ], [IdleAnimation, WalkAnimation, RunAnimation, JumpAnimation])

  // useAnimations creates an AnimationMixer on wrapperGroup
  const { actions } = useAnimations(allClips, wrapperGroup)

  const [animationActions, setAnimationActions] = useState<Record<
    string,
    THREE.AnimationAction | null
  > | null>(null)

  // Load avatar model
  const avatarPath = avatarData?.avatarPath && avatarData.avatarPath !== ''
    ? avatarData.avatarPath
    : DEFAULT_AVATAR
  const safePath = avatarPath.startsWith('http') ? DEFAULT_AVATAR : avatarPath
  const { scene: originalScene } = useGLTF(safePath)

  const clonedScene = useMemo(() => {
    if (!originalScene) return null
    const clone = SkeletonUtils.clone(originalScene)
    clone.traverse((child) => {
      if (child.name === 'Hips') hips.current = child
    })
    return clone
  }, [originalScene])

  useImperativeHandle(ref, () => ({
    animationActions: animationActions,
  }))

  // Once actions are populated, expose them and play idle
  useEffect(() => {
    if (areAnimActionsSet) return
    if (actions['idle']) {
      setAnimationActions(actions)
      setAreAnimActionsSet(true)
      actions['idle']?.play()
      if (!isOtherPlayer)
        genericStore.setState({ loading_avatarModelAndAnims: false })
    }
  }, [actions, areAnimActionsSet])

  useFrame(() => {
    if (!genericStore.getState().isTabFocused) return
    // Reset hips x/z each frame to cancel root motion drift
    if (hips.current) {
      hips.current.position.x = 0
      hips.current.position.z = 0
    }
  })

  if (!clonedScene) return null

  return (
    <group ref={wrapperGroup}>
      <primitive
        object={clonedScene}
        scale={AVATAR_CONFIG.scale}
        position={AVATAR_CONFIG.position}
        rotation={AVATAR_CONFIG.rotation}
        {...props}
      />
    </group>
  )
}

export default forwardRef(Generic)
