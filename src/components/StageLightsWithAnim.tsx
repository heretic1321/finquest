import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { MapStore } from '@client/contexts/MapContext'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import { Group, Mesh, MeshStandardMaterial, Color } from 'three'

export function StageLightsWithAnim() {
  const group = useRef<Group>(null)
  const { scene, animations } = useGLTF(staticResourcePaths.stageLightsWithAnim)
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    const mapScale = MapStore.getState().mapScale

    if (group.current) {
      group.current.scale.setScalar(mapScale)
      group.current.position.multiplyScalar(mapScale)

      // Create an array of brighter, more vibrant party light colors
      const partyColors = [
        '#FF5555', // Bright red
        '#55FFFF', // Bright cyan
        '#55FF55', // Bright green
        '#FFFF55', // Bright yellow
        '#FF55FF', // Bright magenta
        '#5555FF', // Bright blue
      ]

      // Replace materials for meshes containing "COLOUR LIGHT"
      let colorIndex = 0
      group.current.traverse((child) => {
        if (child instanceof Mesh) {
          const material = child.material as MeshStandardMaterial
          if (material && material.name && material.name.includes('COLOUR LIGHT')) {
            const newMaterial = new MeshStandardMaterial({
              color: new Color(partyColors[colorIndex % partyColors.length]),
              transparent: true,
              opacity: 0.5,
              emissive: new Color(partyColors[colorIndex % partyColors.length]),
              emissiveIntensity: 0.5,
            })
            child.material = newMaterial
            colorIndex++
          }
        }
      })
    }

    Object.values(actions).forEach(action => {
      if (action) {
        action.timeScale = 0.7
        action.play()
      }
    })
  }, [actions, scene])

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  )
}
