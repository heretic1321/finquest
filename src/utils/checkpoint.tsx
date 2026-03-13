import { CharacterRef } from '@client/components/Character'
import StoreEntryExitTriggerArea from '@client/components/StoreEntryExitTriggerArea'
import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { BoxGeometry } from 'three'
import { GLTF } from 'three-stdlib'
import { create } from 'zustand'

interface CheckpointStore {
  isVisible: boolean
  position: [number, number, number] | null
  checkpointReached: boolean
  setCheckpoint: (
    visible: boolean,
    position: [number, number, number] | null,
  ) => void
  setCheckpointReached: (reached: boolean) => void
}

export const useCheckpointStore = create<CheckpointStore>((set) => ({
  isVisible: false,
  position: null,
  checkpointReached: false,
  setCheckpoint: (visible, position) => set({ isVisible: visible, position }),
  setCheckpointReached: (reached) => set({ checkpointReached: reached }),
}))

interface CheckpointProps {
  characterRef: React.MutableRefObject<CharacterRef | null>
  position: [number, number, number]
  onReached?: () => void
}
const Checkpoint: React.FC<CheckpointProps> = ({ characterRef, position }) => {
  const { scene: arrowNodes } = useGLTF(staticResourcePaths.arrow) as GLTF
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const arrowRef = useRef<THREE.Mesh>(null)
  const setCheckpointReached = useCheckpointStore(
    (state) => state.setCheckpointReached,
  )
  const geometry = useMemo(() => {
    return new BoxGeometry(1, 0.01, 1)
  }, [])
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime) * 0.02
      if (arrowRef.current) {
        arrowRef.current.position.y = Math.sin(state.clock.elapsedTime) * 2
      }
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <StoreEntryExitTriggerArea
        keyId='rewardRedeemMachineTriggerArea'
        characterRef={characterRef}
        geometry={geometry}
        transform={{
          position: [0, 0.1, 0],
          rotation: [0, 0, 0],
          scale: [4, 1, 4],
        }}
        onInside={() => {
          setCheckpointReached(true)
        }}
        onOutside={() => {
          setCheckpointReached(false)
        }}
        transformControlsEnabled={false}
      />
      <mesh ref={meshRef}>
        <cylinderGeometry args={[2, 2, 5, 32]} />
        <meshBasicMaterial
          color='#ae4a57'
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={arrowRef}>
        <primitive
          object={arrowNodes}
          position={[0, 5, 0]}
          scale={[1.5, 1.5, 1.5]}
          rotation={[-Math.PI / 2, Math.PI / 2, 0]}
        />
        <meshBasicMaterial color='red' />
      </mesh>
    </group>
  )
}

const CheckpointRenderer = ({
  characterRef,
}: {
  characterRef: React.MutableRefObject<CharacterRef | null>
}) => {
  const { isVisible, position } = useCheckpointStore()

  if (!isVisible || !position) return null

  return <Checkpoint characterRef={characterRef} position={position} />
}

export default CheckpointRenderer
