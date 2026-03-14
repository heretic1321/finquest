import { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
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
  const modelRef = useRef<THREE.Group>(null!)

  const { npcPos, npcRot, npcScale } = useControls('Old Man NPC', {
    npcPos: { value: [4, 5.8, -150], label: 'Position', step: 0.5 },
    npcRot: { value: [0, 0, 0], label: 'Rotation', step: 0.1 },
    npcScale: { value: 5, min: 0.5, max: 15, step: 0.1, label: 'Scale' },
  })

  // Load static model (no rig, no animations)
  const { scene } = useGLTF('./assets/avatars/oldguy.glb')

  // Gentle idle bobbing
  useFrame(({ clock }) => {
    if (!genericStore.getState().isTabFocused) return
    if (!modelRef.current) return

    // Subtle floating bob
    const t = clock.getElapsedTime()
    modelRef.current.position.y = Math.sin(t * 1.5) * 0.08

    // Proximity detection
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
    if (dist < TRIGGER_RADIUS) {
      const dir = new THREE.Vector3().subVectors(playerPos, npcPosition).normalize()
      const angle = Math.atan2(dir.x, dir.z)
      modelRef.current.rotation.y = THREE.MathUtils.lerp(
        modelRef.current.rotation.y,
        angle,
        0.05
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
        ref={modelRef}
        rotation={npcRot as unknown as [number, number, number]}
        scale={npcScale}
      >
        <primitive object={scene} />
      </group>
    </group>
  )
}
