import {
  memo,
  MutableRefObject
} from 'react'

// import HighPolyShowcaseModel from '@client/components/Jewellery/HighPolyShowcaseModel'
// import JewelleryGroup from '@client/components/Jewellery/JewelleryGroup'
// import { staticResourcePaths } from '@client/config/staticResourcePaths'
// import { HUDContext } from '@client/contexts/HUDContext'

// import { useGLTF } from '@react-three/drei'
// import * as THREE from 'three'
import { CharacterRef } from '@client/components/Character'
import { CollectionStore } from '@client/contexts/CollectionContext'

type JewelleryManagerProps = {
  characterRef: MutableRefObject<CharacterRef | null>
  storeName: string
}

/**
 * This component is used to render and manage all the jewellery in the scene.
 */
const JewelleryManager = memo(
  ({}: // characterRef,
  // storeName,
  JewelleryManagerProps) => {
    // this is the texture that will be used for the environment map
    // being applied to all jewellery's materials
    const groups = CollectionStore((state) => state.groups)

    // const { isShowcaseMode } = useContext(HUDContext)

    // This is the reusable diamond mesh that will be used for all the diamonds in the jewellery models
    // const diamondComponent = useGLTF(staticResourcePaths.reusableDiamondMesh)
    // const [diamondComponentMesh, setDiamondComponentMesh] =
    //   useState<THREE.Mesh | null>(null)

    // useEffect(() => {
    //   diamondComponent.scene.traverse((child) => {
    //     if (child instanceof THREE.Mesh) {
    //       setDiamondComponentMesh(child)
    //     }
    //   })
    // }, [diamondComponent])
    if (!groups) return null
    return (
      <>
        {/* {groups.map((g, i) => {
        return (
          // <JewelleryGroup
          //   key={i + storeName}
          //   groupIndex={i}
          //   {...g}
          //   // diamondComponentMesh={diamondComponentMesh}
          //   characterRef={characterRef}
          //   storeName={storeName}
          // />
          <></>
        )
      })} */}
        {/* {isShowcaseMode && <HighPolyShowcaseModel storeName={storeName}/>} */}
      </>
    )
  },
)

export default JewelleryManager
