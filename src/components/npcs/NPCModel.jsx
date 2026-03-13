import { useRef, useEffect, useMemo } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

/**
 * NPCModel — loads a character GLB and plays idle animation on loop.
 * Used by NPC.jsx to display a real 3D character model instead of a capsule.
 */
export default function NPCModel({
  modelUrl = '/models/characters/Female.glb',
  scale = 0.72,
  position = [0, -0.65, 0],
  rotation = [0, 0, 0],
}) {
  const group = useRef()

  // Load the character model
  const { scene: originalScene } = useGLTF(modelUrl)

  // Clone the scene so multiple NPC instances don't share geometry state
  const scene = useMemo(() => {
    const clone = SkeletonUtils.clone(originalScene)
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return clone
  }, [originalScene])

  // Load idle animation from separate GLB
  const { animations: idleAnims } = useGLTF('/models/animations/Standing_Idle.glb')

  // Rename the clip
  const allAnimations = useMemo(() => {
    if (idleAnims[0]) {
      const clip = idleAnims[0].clone()
      clip.name = 'Idle'
      return [clip]
    }
    return []
  }, [idleAnims])

  // Apply animation to the group
  const { actions } = useAnimations(allAnimations, group)

  // Play idle animation on mount
  useEffect(() => {
    const idle = actions['Idle']
    if (idle) {
      idle.reset().fadeIn(0.3).play()
    }
    return () => {
      if (idle) idle.fadeOut(0.3)
    }
  }, [actions])

  return (
    <group ref={group} dispose={null}>
      <primitive
        object={scene}
        scale={scale}
        position={position}
        rotation={rotation}
      />
    </group>
  )
}

// Preload commonly used models
useGLTF.preload('/models/characters/Female.glb')
useGLTF.preload('/models/characters/feb.glb')
useGLTF.preload('/models/characters/may.glb')
useGLTF.preload('/models/animations/Standing_Idle.glb')
