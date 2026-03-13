import { useRef, useEffect, useState } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import { useControls, folder } from 'leva'

import { CharacterRef } from '@client/components/Character'
import { HUDStore } from '@client/contexts/HUDContext'
import { genericStore } from '@client/contexts/GlobalStateContext'

type OldManNPCProps = {
  characterRef: React.MutableRefObject<CharacterRef | null>
}

// Store for old man interaction
import { create } from 'zustand'
export const useOldManStore = create<{
  isNearby: boolean
  isUIOpen: boolean
  setNearby: (v: boolean) => void
  setUIOpen: (v: boolean) => void
}>((set) => ({
  isNearby: false,
  isUIOpen: false,
  setNearby: (v) => set({ isNearby: v }),
  setUIOpen: (v) => set({ isUIOpen: v }),
}))

const TRIGGER_RADIUS = 15 // units

export default function OldManNPC({ characterRef }: OldManNPCProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const modelRef = useRef<THREE.Group>(null!)

  // Leva controls for positioning
  const { npcPos, npcRot, npcScale } = useControls('Old Man NPC', {
    npcPos: { value: [4, 5.8, -150], label: 'Position', step: 0.5 },
    npcRot: { value: [0, 0, 0], label: 'Rotation', step: 0.1 },
    npcScale: { value: 4, min: 0.5, max: 10, step: 0.1, label: 'Scale' },
  })

  // Load model — using guide.gltf as the old man
  const { scene: originalScene } = useGLTF('./assets/avatars/guide.gltf')
  const { animations: idleAnim } = useGLTF('./assets/animations/Standing_Idle.glb')

  const clonedScene = SkeletonUtils.clone(originalScene)

  // Set up idle animation
  idleAnim[0].name = 'idle'
  const { actions } = useAnimations([idleAnim[0]], modelRef)

  useEffect(() => {
    if (actions['idle']) {
      actions['idle'].play()
    }
  }, [actions])

  // Proximity detection — check distance to player each frame
  useFrame(() => {
    if (!genericStore.getState().isTabFocused) return
    if (!characterRef.current?.playerRef?.current) return
    if (!groupRef.current) return

    const playerPos = characterRef.current.playerRef.current.position
    const npcPosition = groupRef.current.position
    const dist = playerPos.distanceTo(npcPosition)

    const wasNearby = useOldManStore.getState().isNearby
    if (dist < TRIGGER_RADIUS && !wasNearby) {
      useOldManStore.getState().setNearby(true)
    } else if (dist >= TRIGGER_RADIUS && wasNearby) {
      useOldManStore.getState().setNearby(false)
    }

    // Face the player when nearby
    if (dist < TRIGGER_RADIUS && modelRef.current) {
      const dir = new THREE.Vector3()
      dir.subVectors(playerPos, npcPosition).normalize()
      const angle = Math.atan2(dir.x, dir.z)
      modelRef.current.rotation.y = angle
    }
  })

  // E key to open interaction UI
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code !== 'KeyE') return
      const nearby = useOldManStore.getState().isNearby
      const enterPrompt = HUDStore.getState().isEnterStorePromptShown
      // Only trigger if nearby and no zone prompt is showing
      if (nearby && !enterPrompt) {
        useOldManStore.getState().setUIOpen(true)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <group ref={groupRef} position={npcPos as unknown as [number, number, number]}>
      <group
        ref={modelRef}
        rotation={npcRot as unknown as [number, number, number]}
        scale={npcScale}
      >
        <primitive object={clonedScene} />
      </group>
    </group>
  )
}
