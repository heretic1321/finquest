import { useGLTF } from '@react-three/drei'
import { Mesh } from 'three'

import { CharacterRef } from '@client/components/Character'

import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { MaterialStore } from '@client/contexts/MaterialContext'
import { LAYER_SELECTIVE_BLOOM } from '@client/main'

import VRShowcaseHandler from './VRShowcaseHandler'

type VRItemShowcaseProps = {
  characterRef: React.MutableRefObject<CharacterRef | null>
}

function VRItemShowcase({ characterRef }: VRItemShowcaseProps) {
  const jewelleryItemModel = useGLTF(
    staticResourcePaths.jewelleryItemForVRShwocase,
  )
  const compareAndAssignMaterial = MaterialStore(
    (state) => state.compareAndAssignMaterial,
  )
  const showcasePositions = [
    // first position is near the player spawn, easy for testing
    //[-2.6, 10, 75.72],
    [-16.32, 3.25, 27.8],
    [-31.05, 3.25, -7.98],
    [-22.67, 3.25, -22.67],
    [22.92, 3.25, -22.77],
    [31.38, 3.25, -8.02],
    [16.32, 3.25, 28.0],
  ]

  const showcaseRotations = [
    //[-3.14, 0.53, -3.14],
    [-3.14, 0.53, -3.14],
    [0, 1.32, 0],
    [0, 0.79, 0],
    [0, -0.79, 0],
    [0, -1.32, 0],
    [3.14, -0.52, 3.14],
  ]

  const cloneModel = () => {
    if (!jewelleryItemModel.scene) return null
    const clone = jewelleryItemModel.scene.clone(true)
    clone.traverse((child) => {
      if (child instanceof Mesh) {
        child.layers.enable(LAYER_SELECTIVE_BLOOM)
        compareAndAssignMaterial(child)
      }
    })
    clone.layers.enable(LAYER_SELECTIVE_BLOOM)
    return clone
  }

  const JewlleryShowcaseItem = () => {
    const model = cloneModel()
    return (
      model && (
        <primitive object={model} position={[0, 0, 0]} rotation={[0, 0, 0]} />
      )
    )
  }

  return (
    <>
      {showcasePositions.map((position, index) => (
        <VRShowcaseHandler
          position={[position[0] - 0.1, position[1] + 1.5, position[2]]}
          rotation={[
            showcaseRotations[index][0],
            showcaseRotations[index][1],
            showcaseRotations[index][2],
          ]}
          characterRef={characterRef}
          key={`showcase-${index}`}
        >
          <group position={[0, 0, 0]} scale={[10, 10, 10]}>
            <JewlleryShowcaseItem />
          </group>
        </VRShowcaseHandler>
      ))}
    </>
  )
}

export default VRItemShowcase
