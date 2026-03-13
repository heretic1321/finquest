import { useRef } from 'react'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

type TLargeItemShowcaseProps = {
  itemTransform: {
    position: THREE.Vector3Tuple
    rotation: THREE.Vector3Tuple
    scale: THREE.Vector3Tuple
  }
  staticCameraTransform: {
    position: THREE.Vector3Tuple
    rotation: THREE.Vector3Tuple
  }
  item?: {
    modelPath: string
  }
  isEnabled: boolean
}

const LargeItemShowcase = ({
  itemTransform,
  staticCameraTransform,
  isEnabled,
}: TLargeItemShowcaseProps) => {
  const showcaseCameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  return (
    <>
      <PerspectiveCamera
        ref={showcaseCameraRef}
        makeDefault={isEnabled}
        position={staticCameraTransform.position}
        rotation={staticCameraTransform.rotation}
      />
      <mesh
        position={itemTransform.position}
        rotation={itemTransform.rotation}
        scale={itemTransform.scale}
      >
        {/* <primitive object={item} /> */}
        <boxBufferGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color='hotpink' />
      </mesh>
    </>
  )
}

export default LargeItemShowcase
