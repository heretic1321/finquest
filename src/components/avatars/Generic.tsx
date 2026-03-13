import {
  forwardRef,
  ForwardRefRenderFunction,
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
  const group = useRef<THREE.Group | null>(null)
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

  const { actions } = useAnimations(
    [IdleAnimation[0], WalkAnimation[0], RunAnimation[0], JumpAnimation[0]],
    group,
  )

  const [animationActions, setAnimationActions] = useState<Record<
    string,
    THREE.AnimationAction | null
  > | null>(null)

  // Load avatar model via useGLTF (no custom loader needed)
  const avatarPath = avatarData?.avatarPath && avatarData.avatarPath !== ''
    ? avatarData.avatarPath
    : DEFAULT_AVATAR

  // Only load local paths (skip remote ReadyPlayerMe URLs)
  const safePath = avatarPath.startsWith('http') ? DEFAULT_AVATAR : avatarPath
  const { scene: originalScene } = useGLTF(safePath)

  useImperativeHandle(ref, () => ({
    animationActions: animationActions,
  }))

  const scene = useMemo(() => {
    if (!originalScene) return null
    const clone = SkeletonUtils.clone(originalScene)
    clone.traverse((child) => {
      if (child.name === 'Hips') hips.current = child
    })
    return clone
  }, [originalScene])

  useFrame(() => {
    if (!genericStore.getState().isTabFocused) return
    // Reset hips x/z each frame to cancel root motion drift
    if (hips.current) {
      hips.current.position.fromArray([0, hips.current.position.y, 0])
    }
    // Set animation actions once ready
    if (!areAnimActionsSet) {
      if (actions['idle'] !== null && actions['idle'] !== undefined) {
        setAnimationActions(actions)
        setAreAnimActionsSet(true)
        actions['idle']?.play()
        if (!isOtherPlayer)
          genericStore.setState({ loading_avatarModelAndAnims: false })
      }
    }
  })

  return (
    scene && (
      <primitive
        object={scene}
        ref={(node: THREE.Object3D) => {
          if (node) {
            group.current = node as THREE.Group
          } else {
            group.current = null
          }
        }}
        scale={AVATAR_CONFIG.scale}
        position={AVATAR_CONFIG.position}
        rotation={AVATAR_CONFIG.rotation}
        {...props}
      />
    )
  )
}

export default forwardRef(Generic)
