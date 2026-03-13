import { useRef } from 'react'
import { RigidBody } from '@react-three/rapier'

export function Island() {
  const meshRef = useRef()

  return (
    <group>
      {/* Main Island Platform */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh receiveShadow position={[0, 0, 0]} ref={meshRef}>
          <cylinderGeometry args={[14, 16, 2, 32]} />
          <meshStandardMaterial color="#4a9e5c" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* Sandy Beach Edge */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh receiveShadow position={[0, -0.5, 0]}>
          <cylinderGeometry args={[16, 18, 1, 32]} />
          <meshStandardMaterial color="#e8d5a3" roughness={1} />
        </mesh>
      </RigidBody>

      {/* Underwater base */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[18, 12, 3, 32]} />
        <meshStandardMaterial color="#8B7355" roughness={1} />
      </mesh>

      {/* Trees */}
      {[
        [4, 2.5, 4],
        [-3, 2.5, 6],
        [7, 2.5, -1],
        [-8, 2.5, -2],
        [2, 2.5, -7],
        [-5, 2.5, 5],
        [9, 2.5, 3],
        [-9, 2.5, -5],
      ].map((pos, i) => (
        <group key={i} position={pos}>
          {/* Trunk */}
          <mesh castShadow position={[0, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 2, 8]} />
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
          </mesh>
          {/* Canopy */}
          <mesh castShadow position={[0, 1.5, 0]}>
            <sphereGeometry args={[1 + Math.random() * 0.5, 8, 8]} />
            <meshStandardMaterial
              color={`hsl(${130 + Math.random() * 30}, 60%, ${30 + Math.random() * 15}%)`}
              roughness={0.8}
            />
          </mesh>
        </group>
      ))}

      {/* Rocks */}
      {[
        [10, 1.2, 0],
        [-6, 1.2, -8],
        [3, 1.2, 9],
        [-10, 1.2, 3],
      ].map((pos, i) => (
        <mesh key={`rock-${i}`} castShadow position={pos}>
          <dodecahedronGeometry args={[0.6 + Math.random() * 0.4, 0]} />
          <meshStandardMaterial color="#888" roughness={1} />
        </mesh>
      ))}

      {/* Central Building - Finance Hub */}
      <group position={[0, 1, 0]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh castShadow>
            <boxGeometry args={[3, 2.5, 3]} />
            <meshStandardMaterial color="#e8e0d0" roughness={0.7} />
          </mesh>
        </RigidBody>
        {/* Roof */}
        <mesh castShadow position={[0, 1.8, 0]}>
          <coneGeometry args={[2.5, 1.5, 4]} />
          <meshStandardMaterial color="#c0392b" roughness={0.8} />
        </mesh>
        {/* Sign */}
        <mesh position={[0, 0.5, 1.51]}>
          <planeGeometry args={[2, 0.6]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      </group>
    </group>
  )
}
