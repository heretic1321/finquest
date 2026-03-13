import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Water() {
  const meshRef = useRef()
  const geometryRef = useRef()

  const amplitude = 0.44
  const factor1 = 5.2
  const factor2 = 6.49

  useEffect(() => {
    const texture = new THREE.TextureLoader().load('/textures/water.jpg')
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(6, 6)

    const geometry = new THREE.PlaneGeometry(220, 220, 127, 127)
    geometry.rotateX(-Math.PI / 2)
    const position = geometry.attributes.position
    position.usage = THREE.DynamicDrawUsage

    for (let i = 0; i < position.count; i++) {
      const y = 0.5 * Math.sin(i / 2)
      position.setY(i, y)
    }

    const material = new THREE.MeshStandardMaterial({
      color: '#29a6db',
      map: texture,
      side: THREE.DoubleSide,
      metalness: 0,
      roughness: 0.08,
      envMapIntensity: 1.2,
      bumpMap: texture,
      bumpScale: 0.09,
      displacementMap: texture,
      displacementScale: 0.2,
      displacementBias: 0,
    })

    if (meshRef.current) {
      meshRef.current.geometry = geometry
      meshRef.current.material = material
      geometryRef.current = geometry
    }
  }, [])

  useFrame(({ clock }) => {
    if (!geometryRef.current) return
    const position = geometryRef.current.attributes.position
    if (!position) return
    const time = clock.getElapsedTime() * 10

    for (let i = 0; i < position.count; i++) {
      const y = amplitude * Math.sin(i / factor1 + (time + i) / factor2)
      position.setY(i, y)
    }
    position.needsUpdate = true
  })

  return <mesh ref={meshRef} position={[0, -1, 0]} />
}
