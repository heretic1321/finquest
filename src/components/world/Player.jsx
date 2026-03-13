import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useGameStore } from '../../stores/gameStore'

const SPEED = 5
const SPRINT_MULTIPLIER = 1.6

export function Player() {
  const bodyRef = useRef()
  const meshRef = useRef()
  const [, getKeys] = useKeyboardControls()
  const direction = useRef(new THREE.Vector3())
  const nearbyNPC = useGameStore((s) => s.nearbyNPC)
  const setActiveDialogue = useGameStore((s) => s.setActiveDialogue)

  useFrame((state, delta) => {
    if (!bodyRef.current) return

    const { forward, backward, leftward, rightward, sprint, interact } = getKeys()

    // Movement
    const speed = sprint ? SPEED * SPRINT_MULTIPLIER : SPEED
    direction.current.set(0, 0, 0)

    if (forward) direction.current.z -= 1
    if (backward) direction.current.z += 1
    if (leftward) direction.current.x -= 1
    if (rightward) direction.current.x += 1

    direction.current.normalize().multiplyScalar(speed)

    const position = bodyRef.current.translation()
    bodyRef.current.setLinvel(
      { x: direction.current.x, y: bodyRef.current.linvel().y, z: direction.current.z },
      true
    )

    // Rotate player to face movement direction
    if (direction.current.length() > 0.1 && meshRef.current) {
      const angle = Math.atan2(direction.current.x, direction.current.z)
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        angle,
        0.15
      )
    }

    // Camera follow
    const cameraTarget = new THREE.Vector3(position.x, position.y + 6, position.z + 10)
    state.camera.position.lerp(cameraTarget, 0.05)
    state.camera.lookAt(position.x, position.y + 1, position.z)

    // Interact with nearby NPC
    if (interact && nearbyNPC) {
      setActiveDialogue({
        npcName: nearbyNPC.name,
        text: nearbyNPC.greeting,
        topic: nearbyNPC.topic,
      })
    }

    // Prevent falling off the island - respawn
    if (position.y < -5) {
      bodyRef.current.setTranslation({ x: 0, y: 3, z: 0 }, true)
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
    }
  })

  return (
    <RigidBody
      ref={bodyRef}
      colliders="ball"
      position={[0, 3, 5]}
      mass={1}
      lockRotations
      linearDamping={4}
    >
      <group ref={meshRef}>
        {/* Body */}
        <mesh castShadow position={[0, 0.5, 0]}>
          <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
          <meshStandardMaterial color="#6366f1" roughness={0.5} />
        </mesh>
        {/* Head */}
        <mesh castShadow position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.5} />
        </mesh>
        {/* Eyes */}
        <mesh position={[0.08, 1.25, 0.2]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[-0.08, 1.25, 0.2]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      </group>
    </RigidBody>
  )
}
