import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { useControls } from 'leva'
import * as THREE from 'three'
import { create } from 'zustand'
import { CharacterRef } from '@client/components/Character'
import { HUDStore } from '@client/contexts/HUDContext'
import { genericStore } from '@client/contexts/GlobalStateContext'

// Store for minigame interaction
export type MinigameId = 'wordle' | 'bingo' | 'crossword'

export const useMinigameStore = create<{
  activeGame: MinigameId | null
  nearbyKiosk: MinigameId | null
  openGame: (id: MinigameId) => void
  closeGame: () => void
  setNearbyKiosk: (id: MinigameId | null) => void
}>((set) => ({
  activeGame: null,
  nearbyKiosk: null,
  openGame: (id) => set({ activeGame: id }),
  closeGame: () => set({ activeGame: null }),
  setNearbyKiosk: (id) => set({ nearbyKiosk: id }),
}))

const TRIGGER_RADIUS = 12

const KIOSK_CONFIG: Record<MinigameId, { label: string; color: string }> = {
  wordle: { label: 'WORDLE\nSTREET', color: '#00ff88' },
  bingo: { label: 'FINANCE\nBINGO', color: '#ffcc00' },
  crossword: { label: 'FINANCE\nCROSSWORD', color: '#ff3366' },
}

type KioskProps = {
  gameId: MinigameId
  position: [number, number, number]
  characterRef: React.MutableRefObject<CharacterRef | null>
}

function Kiosk({ gameId, position, characterRef }: KioskProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const config = KIOSK_CONFIG[gameId]
  const bobOffset = useRef(Math.random() * Math.PI * 2)

  // Proximity detection
  useFrame((_, delta) => {
    if (!genericStore.getState().isTabFocused) return
    if (!characterRef.current?.playerRef?.current || !groupRef.current) return

    // Floating bob animation
    bobOffset.current += delta * 1.2
    groupRef.current.position.y = position[1] + Math.sin(bobOffset.current) * 0.2

    const playerPos = characterRef.current.playerRef.current.position
    const kioskPosition = groupRef.current.position
    const dist = playerPos.distanceTo(kioskPosition)

    const currentNearby = useMinigameStore.getState().nearbyKiosk
    if (dist < TRIGGER_RADIUS && currentNearby !== gameId) {
      useMinigameStore.getState().setNearbyKiosk(gameId)
    } else if (dist >= TRIGGER_RADIUS && currentNearby === gameId) {
      useMinigameStore.getState().setNearbyKiosk(null)
    }
  })

  // E key to open game
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code !== 'KeyE') return
      const nearby = useMinigameStore.getState().nearbyKiosk
      const activeGame = useMinigameStore.getState().activeGame
      const enterPrompt = HUDStore.getState().isEnterStorePromptShown
      if (nearby === gameId && !activeGame && !enterPrompt) {
        useMinigameStore.getState().openGame(gameId)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [gameId])

  return (
    <group ref={groupRef} position={position}>
      {/* Main body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 3, 1]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Screen face */}
      <mesh position={[0, 0.3, 0.51]}>
        <planeGeometry args={[1.6, 1.2]} />
        <meshStandardMaterial
          color={config.color}
          emissive={config.color}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Screen label */}
      <Text
        position={[0, 0.3, 0.52]}
        fontSize={0.25}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        font={undefined}
        fontWeight="bold"
      >
        {config.label}
      </Text>

      {/* Base */}
      <mesh position={[0, -1.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.3, 1.2]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  )
}

type MinigameKiosksProps = {
  characterRef: React.MutableRefObject<CharacterRef | null>
}

export function MinigameKiosks({ characterRef }: MinigameKiosksProps) {
  const { wordlePos, bingoPos, crosswordPos } = useControls('Minigame Kiosks', {
    wordlePos: { value: [20, 1.5, 30] as [number, number, number], label: 'Wordle Position', step: 0.5 },
    bingoPos: { value: [-30, 1.5, -20] as [number, number, number], label: 'Bingo Position', step: 0.5 },
    crosswordPos: { value: [40, 1.5, -50] as [number, number, number], label: 'Crossword Position', step: 0.5 },
  })

  return (
    <>
      <Kiosk
        gameId="wordle"
        position={wordlePos as unknown as [number, number, number]}
        characterRef={characterRef}
      />
      <Kiosk
        gameId="bingo"
        position={bingoPos as unknown as [number, number, number]}
        characterRef={characterRef}
      />
      <Kiosk
        gameId="crossword"
        position={crosswordPos as unknown as [number, number, number]}
        characterRef={characterRef}
      />
    </>
  )
}

export default MinigameKiosks
