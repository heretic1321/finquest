import { useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import useGameStore from '../../stores/gameStore'
import NPCModel from './NPCModel'

export default function NPC({ id, name, position, color, zone, greeting, characterModel }) {
  const groupRef = useRef()
  const setNearbyNPC = useGameStore((s) => s.setNearbyNPC)
  const nearbyNPC = useGameStore((s) => s.nearbyNPC)
  const isNearby = nearbyNPC?.id === id

  // Idle bobbing animation (subtle, on top of the model's skeletal idle anim)
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        position[1] + Math.sin(clock.getElapsedTime() * 2 + position[0]) * 0.04
    }
  })

  const handleEnter = () => {
    setNearbyNPC({ id, name, color, zone, greeting })
  }

  const handleExit = () => {
    // Only clear if this NPC is the current nearby one
    const current = useGameStore.getState().nearbyNPC
    if (current?.id === id) {
      setNearbyNPC(null)
    }
  }

  // Default model URL if not specified
  const modelUrl = characterModel || '/models/characters/Female.glb'

  return (
    <group ref={groupRef} position={position}>
      {/* Proximity sensor -- invisible, triggers enter/exit */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[3, 3, 3]}
          sensor
          onIntersectionEnter={handleEnter}
          onIntersectionExit={handleExit}
        />
      </RigidBody>

      {/* NPC Character Model */}
      <Suspense fallback={
        <>
          <mesh castShadow>
            <capsuleGeometry args={[0.35, 0.7, 8, 16]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          <mesh castShadow position={[0, 0.8, 0]}>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial color="#fde68a" roughness={0.5} />
          </mesh>
        </>
      }>
        <NPCModel
          modelUrl={modelUrl}
          scale={0.72}
          position={[0, -0.65, 0]}
          rotation={[0, 0, 0]}
        />
      </Suspense>

      {/* Name tag */}
      <Float speed={2} floatIntensity={0.15}>
        <Text
          position={[0, 1.6, 0]}
          fontSize={0.22}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000"
          font={undefined}
        >
          {name}
        </Text>
      </Float>

      {/* [E] Talk prompt -- only when nearby */}
      {isNearby && (
        <Float speed={3} floatIntensity={0.25}>
          <Text
            position={[0, 2.1, 0]}
            fontSize={0.18}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#000"
          >
            [E] Talk
          </Text>
        </Float>
      )}

      {/* Glow point light */}
      <pointLight
        position={[0, 1, 0]}
        color={color}
        intensity={isNearby ? 2 : 0.5}
        distance={4}
      />
    </group>
  )
}
