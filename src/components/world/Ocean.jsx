import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export function Ocean() {
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = -1.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.5, 0]}
      receiveShadow
    >
      <planeGeometry args={[200, 200, 32, 32]} />
      <meshStandardMaterial
        color="#1a8fa8"
        transparent
        opacity={0.85}
        roughness={0.1}
        metalness={0.3}
      />
    </mesh>
  )
}
