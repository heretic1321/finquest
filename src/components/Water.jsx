import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import useWorldStore from '../stores/worldStore'
import { staticResourcePaths } from '../config/staticResourcePaths'

const Water = () => {
  const geometryRef = useRef(null)
  const materialRef = useRef(null)
  const meshRef = useRef(null)
  const { scene } = useThree()

  const amplitude = useRef(0.44)
  const factor1 = useRef(5.2)
  const factor2 = useRef(6.49)

  const waterConfig = useRef({
    color: '#29a6db',
    repeatX: 6,
    repeatY: 6,
    metalness: 0,
    roughness: 0.08,
    bumpScale: 0.09,
    displacementScale: 0.2,
    displacementBias: 0,
    envMapIntensity: 1.2,
    opacity: 1,
  })

  useEffect(() => {
    const cfg = waterConfig.current

    const texture = new THREE.TextureLoader().load(staticResourcePaths.waterTexture)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(cfg.repeatX, cfg.repeatY)
    texture.colorSpace = THREE.SRGBColorSpace

    const geometry = new THREE.PlaneGeometry(220, 220, 127, 127)
    geometry.rotateX(-Math.PI / 2)
    const position = geometry.attributes.position
    position.usage = THREE.DynamicDrawUsage

    for (let i = 0; i < position.count; i++) {
      const y = 0.5 * Math.sin(i / 2)
      position.setY(i, y)
    }

    const material = new THREE.MeshStandardMaterial({
      color: cfg.color,
      map: texture,
      side: THREE.DoubleSide,
      metalness: cfg.metalness,
      roughness: cfg.roughness,
      envMapIntensity: cfg.envMapIntensity,
      opacity: cfg.opacity,
    })
    material.bumpMap = texture
    material.bumpScale = cfg.bumpScale
    material.displacementMap = texture
    material.displacementScale = cfg.displacementScale
    material.displacementBias = cfg.displacementBias

    geometryRef.current = geometry
    materialRef.current = material

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.y = -0.5
    meshRef.current = mesh
    scene.add(mesh)

    return () => {
      scene.remove(mesh)
      geometry.dispose()
      material.dispose()
    }
  }, [scene])

  useFrame(({ clock }) => {
    if (!useWorldStore.getState().isTabFocused) return
    if (!geometryRef.current) return

    const position = geometryRef.current.attributes.position
    if (!position) return
    const time = clock.getElapsedTime() * 10

    for (let i = 0; i < position.count; i++) {
      const y = amplitude.current * Math.sin(
        i / factor1.current +
        (time + i) / factor2.current
      )
      position.setY(i, y)
    }
    position.needsUpdate = true
  })

  return null
}

export default Water
