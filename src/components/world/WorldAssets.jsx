import { useMemo } from 'react'
import { useGLTF, Clone } from '@react-three/drei'
import { WORLD_ASSETS, UNIQUE_MODELS } from '../../data/assetRegistry'

/**
 * Renders a single GLB model at the given transform.
 */
function AssetModel({ url, position, rotation, scale }) {
  const { scene } = useGLTF(url)
  return (
    <Clone
      object={scene}
      position={position}
      rotation={rotation}
      scale={typeof scale === 'number' ? [scale, scale, scale] : scale}
      castShadow
      receiveShadow
    />
  )
}

/**
 * Reads the full WORLD_ASSETS registry and renders every decorative asset.
 * These are purely visual (no physics colliders).
 */
export default function WorldAssets() {
  const assets = useMemo(() => WORLD_ASSETS, [])

  return (
    <group>
      {assets.map((asset, i) => (
        <AssetModel
          key={i}
          url={asset.model}
          position={asset.position}
          rotation={asset.rotation}
          scale={asset.scale}
        />
      ))}
    </group>
  )
}

// Preload every unique model so they're ready before first render
UNIQUE_MODELS.forEach((url) => {
  useGLTF.preload(url)
})
