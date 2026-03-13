import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  MeshBVH,
  StaticGeometryGenerator,
} from 'three-mesh-bvh'
import { staticResourcePaths } from '../config/staticResourcePaths'
import useWorldStore from '../stores/worldStore'
import {
  dummyWireframeMaterial,
} from '../utils/commonMaterials'

// Mesh names to exclude from the collider (non-walkable decoration)
const EXCLUDE_PATTERNS = [
  'store', 'jewel', 'shop', 'portal', 'screen', 'branding',
  'digigold', 'display', 'machine', 'inventory', 'console',
  'hovering', 'particle',
]

function shouldExclude(name) {
  const lower = name.toLowerCase()
  return EXCLUDE_PATTERNS.some((p) => lower.includes(p))
}

const useMap = () => {
  const { scene } = useThree()

  const { scene: mapScene } = useGLTF(staticResourcePaths.newEnvironment)

  useEffect(() => {
    if (!mapScene) return

    // Add the visible model to the scene
    const mapModel = mapScene.clone()
    scene.add(mapModel)
    useWorldStore.getState().setMapModel(mapModel)

    // Build collider group — only include walkable meshes
    const colliderGroup = new THREE.Group()

    mapScene.traverse((child) => {
      if (child.isMesh && !shouldExclude(child.name)) {
        const cloned = child.clone()
        cloned.material = dummyWireframeMaterial
        colliderGroup.add(cloned)
      }
    })

    scene.add(colliderGroup)
    colliderGroup.updateMatrixWorld(true)

    // Generate merged static geometry
    const generator = new StaticGeometryGenerator(colliderGroup)
    generator.attributes = ['position']
    const mergedGeometry = generator.generate()

    // Build BVH
    mergedGeometry.boundsTree = new MeshBVH(mergedGeometry)

    // Create invisible collider mesh
    const collider = new THREE.Mesh(mergedGeometry, dummyWireframeMaterial)
    collider.visible = false
    scene.add(collider)

    // Remove the temp collider group
    scene.remove(colliderGroup)

    // Store in worldStore
    useWorldStore.getState().setCollider(collider)
    useWorldStore.getState().setGeometry(mergedGeometry)
    useWorldStore.getState().setLoading(false)

    return () => {
      scene.remove(mapModel)
      scene.remove(collider)
      mergedGeometry.dispose()
    }
  }, [mapScene, scene])
}

export default useMap
