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
import { GLTF as GLTF2 } from 'three/examples/jsm/loaders/GLTFLoader'
import { SkeletonUtils } from 'three-stdlib'

import { AvatarOptions } from '@client/config/Avatar'
import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { AvatarStore } from '@client/contexts/AvatarAppearanceContext'
import { loader } from '@client/contexts/CollectionContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { NetworkingStore } from '@client/contexts/NetworkingContext'

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

const Generic: ForwardRefRenderFunction<AvatarModelRef, AvatarModelProps> = (
  {
    avatarData,
    setAreAnimActionsSet,
    areAnimActionsSet,
    isOtherPlayer,
    paramsForAvatar = '',
    ...props
  },
  ref,
) => {
  const group = useRef<THREE.Group | null>(null)
  const hips = useRef<THREE.Object3D | null>(null)

  const { animations: IdleAnimation } = useGLTF(
    './assets/animations/Standing_Idle.glb',
  )
  const { animations: WalkAnimation } = useGLTF('./assets/animations/Walk.glb')
  const { animations: RunAnimation } = useGLTF('./assets/animations/Run.glb')
  const { animations: JumpAnimation } = useGLTF(
    './assets/animations/Jump_2.glb',
  )
  const { animations: DanceAnimation1 } = useGLTF(
    staticResourcePaths.danceAnims[0],
  )
  const { animations: DanceAnimation2 } = useGLTF(
    staticResourcePaths.danceAnims[1],
  )
  const { animations: DanceAnimation3 } = useGLTF(
    staticResourcePaths.danceAnims[2],
  )
  const { animations: DanceAnimation4 } = useGLTF(
    staticResourcePaths.danceAnims[3],
  )
  const { animations: DanceAnimation5 } = useGLTF(
    staticResourcePaths.danceAnims[4],
  )
  const { animations: DanceAnimation6 } = useGLTF(
    staticResourcePaths.danceAnims[5],
  )
  const { animations: DanceAnimation7 } = useGLTF(
    staticResourcePaths.danceAnims[6],
  )
  const { animations: DanceAnimation8 } = useGLTF(
    staticResourcePaths.danceAnims[7],
  )

  IdleAnimation[0].name = 'idle'
  WalkAnimation[0].name = 'walk'
  RunAnimation[0].name = 'run'
  JumpAnimation[0].name = 'jump'
  DanceAnimation1[0].name = 'dance_1'
  DanceAnimation2[0].name = 'dance_2'
  DanceAnimation3[0].name = 'dance_3'
  DanceAnimation4[0].name = 'dance_4'
  DanceAnimation5[0].name = 'dance_5'
  DanceAnimation6[0].name = 'dance_6'
  DanceAnimation7[0].name = 'dance_7'
  DanceAnimation8[0].name = 'dance_8'

  const { actions } = useAnimations(
    [
      IdleAnimation[0],
      WalkAnimation[0],
      RunAnimation[0],
      JumpAnimation[0],
      DanceAnimation1[0],
      DanceAnimation2[0],
      DanceAnimation3[0],
      DanceAnimation4[0],
      DanceAnimation5[0],
      DanceAnimation6[0],
      DanceAnimation7[0],
      DanceAnimation8[0],
    ],
    group,
  )

  const [animationActions, setAnimationActions] = useState<Record<
    string,
    THREE.AnimationAction | null
  > | null>(null)

  const [sceneBeforeCloning, setSceneBeforeCloning] =
    useState<THREE.Group | null>(null)

  useEffect(() => {
    if (!isOtherPlayer) {
      genericStore.setState({ loading_avatarModelAndAnims: true })
    } else {
      // After reloading the the avatarDataPath is getting a key at end which doesnt contains the
      // query symbol. So adding the query symbol to the end of the path.
      if (!avatarData.avatarPath.includes('?')) {
        paramsForAvatar = '?' + paramsForAvatar
      }
    }
    loader.load(
      avatarData?.avatarPath
        ? avatarData.avatarPath + paramsForAvatar
        : './assets/avatars/feb.glb',
      (gltf: GLTF2) => {
        setSceneBeforeCloning(gltf.scene)
      },
      undefined,
      (error) => {
        console.error('Error loading avatar model:', error)
      },
    )

    return () => {
      if (group.current !== null) {
        group.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material.dispose()
            child.geometry.dispose()
          }
        })
        group.current = null
      }
    }
  }, [isOtherPlayer, avatarData])

  useImperativeHandle(ref, () => ({
    animationActions: animationActions,
  }))

  const scene = useMemo(() => {
    if (sceneBeforeCloning === null) return null
    const clone = SkeletonUtils.clone(sceneBeforeCloning)
    clone.traverse((child) => {
      if (
        NetworkingStore.getState().leglessNetworkedAvatarsEnabled &&
        isOtherPlayer
      ) {
        if (
          child instanceof THREE.SkinnedMesh &&
          (child.name.includes('Bottom') || child.name.includes('Footwear'))
        ) {
          child.visible = false
        }
        if (
          child instanceof THREE.Bone &&
          (child.name == 'LeftUpLeg' || child.name == 'RightUpLeg')
        ) {
          child.scale.set(0, 0, 0)
        }
      }

      if (child.name === 'Hips') hips.current = child
    })
    return clone
  }, [sceneBeforeCloning])

  useEffect(() => {
    scene?.traverse((child) =>
      child.traverse((child) => {
        if (child.name === 'Hips') hips.current = child
        return
      }),
    )
  }, [scene])

  useFrame(() => {
    if (!genericStore.getState().isTabFocused) return
    // this is used to reset the avatar's position to the origin
    // needed because the animation moves the avatar around and we want to keep it in place
    // and only move it on user input
    if (
      (isOtherPlayer &&
        NetworkingStore.getState().networkedAvatarAnimationsEnabled) ||
      !isOtherPlayer
    ) {
      if (hips.current)
        hips.current.position.fromArray([0, hips.current.position.y, 0])
    }
    if (!areAnimActionsSet) {
      if (
        'idle' in actions &&
        actions['idle'] !== null &&
        actions['idle'] !== undefined
      ) {
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
            if (!AvatarStore.getState().hasAvatarBeenSelected) {
              if (group.current !== null) {
                group.current.traverse((child) => {
                  if (child instanceof THREE.Mesh) {
                    child.material.dispose()
                    child.geometry.dispose()
                  }
                })
              }
            }
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
