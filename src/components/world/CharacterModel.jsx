import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import { useGame } from 'ecctrl'

/**
 * CharacterModel — loads a character GLB and separate animation GLBs,
 * then subscribes to ecctrl's useGame store to play the correct animation.
 *
 * Based on the everlite-store Generic.tsx pattern of loading animations
 * from separate files and merging them with useAnimations.
 */
export default function CharacterModel({
  modelUrl = '/models/characters/Female.glb',
  scale = 0.72,
  position = [0, -0.65, 0],
  rotation = [0, 0, 0],
}) {
  const group = useRef()
  const hipsRef = useRef()

  // Load the character model
  const { scene: originalScene } = useGLTF(modelUrl)

  // Clone the scene so multiple instances don't conflict
  const scene = useMemo(() => {
    const clone = SkeletonUtils.clone(originalScene)
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
      if (child.name === 'Hips') {
        hipsRef.current = child
      }
    })
    return clone
  }, [originalScene])

  // Load each animation from separate GLB files
  const { animations: idleAnims } = useGLTF('/models/animations/Standing_Idle.glb')
  const { animations: walkAnims } = useGLTF('/models/animations/Walk.glb')
  const { animations: runAnims } = useGLTF('/models/animations/Run.glb')
  const { animations: jumpAnims } = useGLTF('/models/animations/Jump.glb')

  // Rename animation clips so they match the animation set names
  const allAnimations = useMemo(() => {
    const clips = []
    if (idleAnims[0]) {
      const clip = idleAnims[0].clone()
      clip.name = 'Idle'
      clips.push(clip)
    }
    if (walkAnims[0]) {
      const clip = walkAnims[0].clone()
      clip.name = 'Walk'
      clips.push(clip)
    }
    if (runAnims[0]) {
      const clip = runAnims[0].clone()
      clip.name = 'Run'
      clips.push(clip)
    }
    if (jumpAnims[0]) {
      const clip = jumpAnims[0].clone()
      clip.name = 'Jump'
      clips.push(clip)
    }
    return clips
  }, [idleAnims, walkAnims, runAnims, jumpAnims])

  // Apply all animations to the character group
  const { actions, mixer } = useAnimations(allAnimations, group)

  // Subscribe to ecctrl's animation state
  const curAnimation = useGame((state) => state.curAnimation)
  const resetAnimation = useGame((state) => state.reset)
  const initializeAnimationSet = useGame((state) => state.initializeAnimationSet)

  // Initialize the animation set mapping for ecctrl
  useEffect(() => {
    initializeAnimationSet({
      idle: 'Idle',
      walk: 'Walk',
      run: 'Run',
      jump: 'Jump',
      jumpIdle: 'Jump',
      jumpLand: 'Idle',
      fall: 'Jump',
    })
  }, [initializeAnimationSet])

  // Play animations in response to curAnimation changes
  useEffect(() => {
    const key = curAnimation ?? 'Idle'
    const action = key ? actions[key] : null
    if (!action) return

    // Jump/jumpLand: play once and clamp
    if (curAnimation === 'Jump') {
      action.reset().fadeIn(0.2).setLoop(THREE.LoopOnce, 0).play()
      action.clampWhenFinished = true
    } else {
      action.reset().fadeIn(0.2).play()
    }

    // When a clamped action finishes, reset to idle
    const onFinished = () => resetAnimation()
    mixer.addEventListener('finished', onFinished)

    return () => {
      action.fadeOut(0.2)
      mixer.removeEventListener('finished', onFinished)
    }
  }, [curAnimation, actions, mixer, resetAnimation])

  // Cancel root motion: reset Hips x/z every frame so animation stays in-place
  // while ecctrl handles actual movement via physics. Keep y for jump animations.
  useFrame(() => {
    if (hipsRef.current) {
      hipsRef.current.position.x = 0
      hipsRef.current.position.z = 0
    }
  })

  return (
    <group ref={group} dispose={null} userData={{ camExcludeCollision: true }}>
      <primitive
        object={scene}
        scale={scale}
        position={position}
        rotation={rotation}
      />
    </group>
  )
}

// Preload all assets
useGLTF.preload('/models/characters/Female.glb')
useGLTF.preload('/models/animations/Standing_Idle.glb')
useGLTF.preload('/models/animations/Walk.glb')
useGLTF.preload('/models/animations/Run.glb')
useGLTF.preload('/models/animations/Jump.glb')
