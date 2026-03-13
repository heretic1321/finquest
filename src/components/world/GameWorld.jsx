import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

const EXCLUDE_PATTERNS = [
  'store', 'jewel', 'shop', 'portal', 'screen', 'branding',
  'digigold', 'display', 'machine', 'inventory', 'console',
  'hovering', 'npc', 'trigger', 'particle'
]

export default function GameWorld() {
  const { scene } = useGLTF('/models/world.glb')

  const filteredScene = useMemo(() => {
    const clone = scene.clone(true)
    const toRemove = []
    clone.traverse((child) => {
      const name = child.name.toLowerCase()
      if (EXCLUDE_PATTERNS.some(pattern => name.includes(pattern))) {
        toRemove.push(child)
      }
      // Enable shadows on meshes
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    toRemove.forEach(child => {
      if (child.parent) child.parent.remove(child)
    })
    return clone
  }, [scene])

  return (
    <RigidBody type="fixed" colliders="trimesh" restitution={0.2} friction={1}>
      <primitive object={filteredScene} />
    </RigidBody>
  )
}

useGLTF.preload('/models/world.glb')
