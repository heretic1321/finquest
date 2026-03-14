import { useRef, useEffect, useMemo } from 'react'
import { useAnimations } from '@react-three/drei'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { useControls } from 'leva'
import { create } from 'zustand'

import { CharacterRef } from '@client/components/Character'
import { HUDStore } from '@client/contexts/HUDContext'
import { genericStore } from '@client/contexts/GlobalStateContext'

// Store for old man interaction
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

const TRIGGER_RADIUS = 15

type OldManNPCProps = {
  characterRef: React.MutableRefObject<CharacterRef | null>
}

export default function OldManNPC({ characterRef }: OldManNPCProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const modelGroupRef = useRef<THREE.Group>(null!)

  const { npcPos, npcRot, npcScale } = useControls('Old Man NPC', {
    npcPos: { value: [4, 5.8, -150], label: 'Position', step: 0.5 },
    npcRot: { value: [0, 0, 0], label: 'Rotation', step: 0.1 },
    npcScale: { value: 0.06, min: 0.01, max: 0.5, step: 0.005, label: 'Scale' },
  })

  // Load FBX model
  const fbx = useLoader(FBXLoader, './assets/avatars/oldman.fbx')

  // Clone so we don't mutate the cached original
  const clonedScene = useMemo(() => {
    const clone = fbx.clone()
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return clone
  }, [fbx])

  // Set up animations from the FBX (mixamo embeds them in the file)
  const { actions } = useAnimations(fbx.animations, modelGroupRef)

  // Play the first animation (the dance from mixamo) on loop
  useEffect(() => {
    const animNames = Object.keys(actions)
    if (animNames.length > 0) {
      const firstAnim = actions[animNames[0]]
      if (firstAnim) {
        firstAnim.setLoop(THREE.LoopRepeat, Infinity)
        firstAnim.play()
      }
    }
  }, [actions])

  useFrame(() => {
    if (!genericStore.getState().isTabFocused) return
    if (!characterRef.current?.playerRef?.current || !groupRef.current) return

    const playerPos = characterRef.current.playerRef.current.position
    const npcPosition = groupRef.current.position
    const dist = playerPos.distanceTo(npcPosition)

    const wasNearby = useOldManStore.getState().isNearby
    if (dist < TRIGGER_RADIUS && !wasNearby) {
      useOldManStore.getState().setNearby(true)
    } else if (dist >= TRIGGER_RADIUS && wasNearby) {
      useOldManStore.getState().setNearby(false)
    }

    // Rotate to face player when nearby
    if (dist < TRIGGER_RADIUS && modelGroupRef.current) {
      const dir = new THREE.Vector3().subVectors(playerPos, npcPosition).normalize()
      const angle = Math.atan2(dir.x, dir.z)
      modelGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        modelGroupRef.current.rotation.y,
        angle,
        0.05,
      )
    }
  })

  // E key to open interaction UI
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code !== 'KeyE') return
      const nearby = useOldManStore.getState().isNearby
      const enterPrompt = HUDStore.getState().isEnterStorePromptShown
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
        ref={modelGroupRef}
        rotation={npcRot as unknown as [number, number, number]}
        scale={npcScale}
      >
        <primitive object={clonedScene} />
      </group>
    </group>
  )
}
