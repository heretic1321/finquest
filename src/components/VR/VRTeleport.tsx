import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { TeleportTarget } from '@react-three/xr'
import { Vector3 } from 'three'
import { StaticGeometryGenerator } from 'three-mesh-bvh'
import { MeshBVH } from 'three-mesh-bvh'

import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { MapStore } from '@client/contexts/MapContext'

type TVRCharacterProps = {
  avatarRef: THREE.Group | null
  onTeleport: () => void
}

function VRTeleport({ avatarRef, onTeleport }: TVRCharacterProps) {
  const mapScale = MapStore.getState().mapScale
  const colliderForTeleportation = useGLTF(staticResourcePaths.teleportCollider)

  const groundGroup = useMemo(() => {
    if (!colliderForTeleportation.scene) return null

    colliderForTeleportation.scene.updateMatrixWorld(true)

    const staticGenerator = new StaticGeometryGenerator(
      colliderForTeleportation.scene,
    )
    staticGenerator.attributes = ['position', 'normal']
    const mergedGeometry = staticGenerator.generate()
    mergedGeometry.boundsTree = new MeshBVH(mergedGeometry)

    return (
      <group visible={false} scale={mapScale}>
        <mesh geometry={mergedGeometry}>
          <meshBasicMaterial wireframe color='red' />
        </mesh>
      </group>
    )
  }, [colliderForTeleportation])

  function onSetXRPosition(value: Vector3) {
    value.y += 1.2
    avatarRef?.position.copy(value)
    onTeleport()
  }

  return (
    <TeleportTarget onTeleport={onSetXRPosition}>{groundGroup}</TeleportTarget>
  )
}

export default VRTeleport
