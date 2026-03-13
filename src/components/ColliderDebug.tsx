import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { MapStore } from '@client/contexts/MapContext'
import { useState } from 'react'

type ColliderInfo = {
  name: string
  position: [number, number, number]
  size: [number, number, number]
  mesh: THREE.Mesh
}

/**
 * Debug component that finds all invisible collider meshes in the scene
 * and optionally shows them as wireframes with name labels.
 */
export default function ColliderDebug() {
  const { scene } = useThree()
  const [colliders, setColliders] = useState<ColliderInfo[]>([])

  const { showColliders } = useControls('Debug', {
    showColliders: { value: false, label: 'Show Colliders' },
  })

  // Scan scene for collider meshes
  useEffect(() => {
    if (!showColliders) {
      // Hide all debug visuals
      setColliders([])
      scene.traverse((child) => {
        if ((child as any).__colliderDebugWireframe) {
          child.visible = false
        }
      })
      return
    }

    const found: ColliderInfo[] = []
    const mapScale = MapStore.getState().mapScale || 2

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      if (!child.geometry) return

      // Find invisible meshes or ones with wireframe material that are colliders
      const isInvisible = !child.visible || (child.material as any)?.visible === false
      const isWireframe = (child.material as any)?.wireframe === true
      const nameHint = child.name.toLowerCase()
      const isColliderByName = nameHint.includes('collider') ||
        nameHint.includes('trigger') ||
        nameHint.includes('roundedbox') ||
        nameHint.includes('raycast')

      if ((isInvisible || isWireframe) && child.geometry.attributes.position) {
        // Get world position
        const worldPos = new THREE.Vector3()
        child.getWorldPosition(worldPos)

        // Get bounding box for size
        child.geometry.computeBoundingBox()
        const box = child.geometry.boundingBox
        let size: [number, number, number] = [1, 1, 1]
        if (box) {
          const s = new THREE.Vector3()
          box.getSize(s)
          const worldScale = new THREE.Vector3()
          child.getWorldScale(worldScale)
          size = [
            s.x * worldScale.x,
            s.y * worldScale.y,
            s.z * worldScale.z,
          ]
        }

        const label = child.name || child.parent?.name || `unnamed_${child.id}`

        found.push({
          name: label,
          position: worldPos.toArray() as [number, number, number],
          size,
          mesh: child,
        })
      }
    })

    setColliders(found)
    console.log(`[ColliderDebug] Found ${found.length} collider meshes:`, found.map(c => c.name))
  }, [showColliders, scene])

  if (!showColliders) return null

  return (
    <>
      {colliders.map((c, i) => (
        <group key={`${c.name}-${i}`} position={c.position}>
          {/* Wireframe box showing collider bounds */}
          <mesh>
            <boxGeometry args={c.size} />
            <meshBasicMaterial
              color={
                c.name.toLowerCase().includes('trigger') ? '#ff0' :
                c.name.toLowerCase().includes('entry') ? '#0f0' :
                c.name.toLowerCase().includes('exit') ? '#f00' :
                '#0af'
              }
              wireframe
              transparent
              opacity={0.6}
            />
          </mesh>
          {/* Label */}
          <Billboard position={[0, c.size[1] / 2 + 0.5, 0]}>
            <Text
              fontSize={0.4}
              color="#ffffff"
              anchorX="center"
              anchorY="bottom"
              font="./assets/fonts/Rajdhani-Bold.ttf"
              outlineWidth={0.03}
              outlineColor="#000000"
            >
              {c.name}
            </Text>
          </Billboard>
        </group>
      ))}
    </>
  )
}
