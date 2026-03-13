import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useGameStore } from '../../stores/gameStore'

export function NPC({ id, name, position, color, topic, greeting }) {
  const meshRef = useRef()
  const setNearbyNPC = useGameStore((s) => s.setNearbyNPC)
  const nearbyNPC = useGameStore((s) => s.nearbyNPC)
  const isNearby = nearbyNPC?.id === id

  useFrame((state) => {
    if (meshRef.current) {
      // Idle bobbing
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1
    }
  })

  const handleProximity = (isEntering) => {
    if (isEntering) {
      setNearbyNPC({ id, name, greeting, topic })
    } else {
      setNearbyNPC(null)
    }
  }

  return (
    <group ref={meshRef} position={position}>
      {/* Detection zone (invisible) */}
      <RigidBody type="fixed" colliders="ball" sensor onIntersectionEnter={() => handleProximity(true)} onIntersectionExit={() => handleProximity(false)}>
        <mesh visible={false}>
          <sphereGeometry args={[3, 8, 8]} />
        </mesh>
      </RigidBody>

      {/* NPC Body */}
      <mesh castShadow position={[0, 0, 0]}>
        <capsuleGeometry args={[0.35, 0.7, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>

      {/* Head */}
      <mesh castShadow position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#fde68a" roughness={0.5} />
      </mesh>

      {/* Name tag */}
      <Float speed={2} floatIntensity={0.2}>
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.25}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000"
        >
          {name}
        </Text>
      </Float>

      {/* Interaction prompt */}
      {isNearby && (
        <Float speed={3} floatIntensity={0.3}>
          <Text
            position={[0, 2, 0]}
            fontSize={0.18}
            color="#fff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000"
          >
            [E] Talk
          </Text>
        </Float>
      )}

      {/* Topic icon glow */}
      <pointLight
        position={[0, 1, 0]}
        color={color}
        intensity={isNearby ? 2 : 0.5}
        distance={3}
      />
    </group>
  )
}
