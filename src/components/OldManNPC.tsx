import { useRef, useEffect, useState } from 'react'
import { TransformControls } from '@react-three/drei'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { useControls } from 'leva'
import { create } from 'zustand'

import { CharacterRef } from '@client/components/Character'
import { HUDStore } from '@client/contexts/HUDContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { UIFlowStore } from '@client/ui_flows'

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
  const isDebugMode = genericStore((s) => s.isDebugMode)
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate')

  const { npcPos, npcRot, npcScale } = useControls('Old Man NPC', {
    npcPos: { value: [3.5, 1.8, -130], label: 'Position', step: 0.5 },
    npcRot: { value: [0, 0, 0], label: 'Rotation', step: 0.1 },
    npcScale: { value: 0.95, min: 0.01, max: 5, step: 0.01, label: 'Scale' },
  })

  // Load FBX model
  const fbx = useLoader(FBXLoader, './assets/avatars/oldman.fbx')
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)

  // Set up shadow casting on meshes
  useEffect(() => {
    fbx.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [fbx])

  // Set up animation mixer directly on the FBX scene (no clone needed for single instance)
  useEffect(() => {
    if (!fbx || fbx.animations.length === 0) return

    const mixer = new THREE.AnimationMixer(fbx)
    const clip = fbx.animations[0]
    const action = mixer.clipAction(clip)
    action.setLoop(THREE.LoopRepeat, Infinity)
    action.play()
    mixerRef.current = mixer

    return () => {
      mixer.stopAllAction()
      mixer.uncacheRoot(fbx)
      mixerRef.current = null
    }
  }, [fbx])

  useFrame((_, delta) => {
    // Tick the animation mixer every frame
    if (mixerRef.current) mixerRef.current.update(delta)

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

    // Rotate to face player when nearby (only when not in debug transform mode)
    if (dist < TRIGGER_RADIUS && modelGroupRef.current && !isDebugMode) {
      const dir = new THREE.Vector3().subVectors(playerPos, npcPosition).normalize()
      const angle = Math.atan2(dir.x, dir.z)
      modelGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        modelGroupRef.current.rotation.y,
        angle,
        0.05,
      )
    }
  })

  // E key to open blockchain flow
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code !== 'KeyE') return
      const nearby = useOldManStore.getState().isNearby
      const enterPrompt = HUDStore.getState().isEnterStorePromptShown
      if (nearby && !enterPrompt) {
        UIFlowStore.getState().openUIFlow('blockchain-flow', { source: 'zone' })
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  // Debug: cycle transform mode with T key
  useEffect(() => {
    if (!isDebugMode) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.code !== 'KeyT') return
      setTransformMode((prev) =>
        prev === 'translate' ? 'rotate' : prev === 'rotate' ? 'scale' : 'translate',
      )
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isDebugMode])

  // Log position when transform changes (debug mode)
  const handleTransformChange = () => {
    if (!groupRef.current) return
    const p = groupRef.current.position
    const r = groupRef.current.rotation
    const s = groupRef.current.scale
    console.log(
      `Old Man NPC → pos: [${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}], rot: [${r.x.toFixed(2)}, ${r.y.toFixed(2)}, ${r.z.toFixed(2)}], scale: ${s.x.toFixed(4)}`,
    )
  }

  return (
    <>
      <group ref={groupRef} position={npcPos as unknown as [number, number, number]}>
        <group
          ref={modelGroupRef}
          rotation={npcRot as unknown as [number, number, number]}
          scale={npcScale}
        >
          <primitive object={fbx} />
        </group>
      </group>
      {isDebugMode && (
        <TransformControls
          object={groupRef}
          mode={transformMode}
          onObjectChange={handleTransformChange}
        />
      )}
    </>
  )
}
