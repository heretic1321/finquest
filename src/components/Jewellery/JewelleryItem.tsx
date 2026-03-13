import {
  Detailed,
  Gltf,
  Html,
  TransformControls,
  useGLTF,
} from '@react-three/drei'
import { useEffect, useState } from 'react'
import { Mesh, Object3D } from 'three'

import { staticResourcePaths } from '@client/config/staticResourcePaths'
// import { GesturesAndDeviceContext } from '@client/contexts/GesturesAndDeviceContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { MaterialStore } from '@client/contexts/MaterialContext'
import { TransformLite } from '@client/utils/commonTypes'
import { IGroupWithItems, IItem } from '@client/utils/types/collectionAPI'
import { useShallow } from 'zustand/react/shallow'
import { SoundsStore } from '../Sounds'
import { trackEvent } from '@client/utils/api'
import { getUserID } from '@client/utils/helperFunctions'

/**
 * This component is used to render a single jewellery item.
 * Props:
 * - TJewelleryItem: The jewellery item to render. (to see what the properties mean, check config file in config folder)
 * - envMapTexture: The resharable environment map texture to use for the jewellery
 * - whiteGoldMaterial: The white gold resharable material to use for the jewellery
 * - yellowGoldMaterial: The yellow gold resharable material to use for the jewellery
 * - diamondComponentMesh: The mesh of the reusable diamond component to use for the diamonds present in this item.
 */
const JewelleryItem = (
  props: IItem & {
    position?: [number, number, number]
    rotation?: [number, number, number]
    scale?: [number, number, number]
    index: number // the index of this jewellery item in the jewellery group
    groupIndex: number // the index of the jewellery group to which this jewellery item belongs
    storeName: string
    groups: IGroupWithItems[]
  },
) => {
  const setAreEffectsEnabled = genericStore((state) => state.setAreEffectsEnabled)
  const {
    isPresentationMode,
    isPresentationModeShuttingDown,
    isPresentationModeStartingUp,
    presentationModeActiveGroupIndex,

    isShowcaseMode,
    isShowcaseModeStartingUp,
    isShowcaseModeShuttingDown,
    setIsShowcaseModeStartingUp,

    showcaseActiveGroupIndex,

    setShowcaseActiveItemIndex,
  } = HUDStore(
    useShallow((state) => ({
      isPresentationMode: state.isPresentationMode,
      isPresentationModeShuttingDown: state.isPresentationModeShuttingDown,
      isPresentationModeStartingUp: state.isPresentationModeStartingUp,
      presentationModeActiveGroupIndex: state.presentationModeActiveGroupIndex,

      isShowcaseMode: state.isShowcaseMode,
      isShowcaseModeStartingUp: state.isShowcaseModeStartingUp,
      isShowcaseModeShuttingDown: state.isShowcaseModeShuttingDown,
      setIsShowcaseModeStartingUp: state.setIsShowcaseModeStartingUp,

      showcaseActiveGroupIndex: state.showcaseActiveGroupIndex,

      setShowcaseActiveItemIndex: state.setShowcaseActiveItemIndex,
    })),
  )

  const selectedJewelleryItemIndexForShowcase = () => {
    if (!props.groups) return

    SoundsStore.getState().playClickSoundOnce()
    // update the current active item in the showcase
    const skuItemIndex = props.groups[showcaseActiveGroupIndex].slots.findIndex(
      (slot) => slot.item?.sku === props.sku,
    )
    setShowcaseActiveItemIndex(skuItemIndex)
    trackEvent(
      'Item_View',
      {
        item_group_name: props.groups[showcaseActiveGroupIndex].name,
        item_name:
          props.groups[showcaseActiveGroupIndex].slots[skuItemIndex].name,
        store_name: props.storeName,
      },
      getUserID(),
    )
    setIsShowcaseModeStartingUp(true)
    setAreEffectsEnabled(true)
  }

  const { scene: gltfJewelScene } = useGLTF(
    `${staticResourcePaths.s3_bucket_cdn}${props.sku}_l.glb`,
  )
  const [mesh, setMesh] = useState<Object3D>()
  const [
    areTransformControlsEnabled,
    // setAreTransformControlsEnabled
  ] = useState(false)

  const compareAndAssignMaterial = MaterialStore(
    (state) => state.compareAndAssignMaterial,
  )

  const [lodTransform, setLodTransform] = useState<TransformLite>({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  })

  // This is the meat of the logic.
  // We traverse the scene and find three types of meshes.
  // 1. The meshes for which we have to apply white gold material.
  //    These meshes have the name 'WHITEGOLD' in them. For them, we just apply
  //    our shared white gold material and the environment map texture.
  // 2. The meshes for which we have to apply yellow gold material.
  //    These meshes have the name 'YELLOWGOLD' in them. For them, we just apply
  //    our shared yellow gold material and the environment map texture.
  // 3. The meshes for diamonds on the jewellery item. Different jewellery items
  //    might have different diamond meshes, of different geometries, materials, etc.
  //    To save time of designer to place a proper diamond mesh (with textures) on
  //    every jewellery item, we have a reusable diamond mesh. We just replace the
  //    geometry and material of the diamond meshes in the jewellery item with the
  //    geometry and material of the reusable diamond mesh. We also preserve positions
  //    and rotations of the original diamond meshes in the jewellery item.
  useEffect(() => {
    gltfJewelScene.traverse((child) => {
      if (child instanceof Mesh) {
        compareAndAssignMaterial(child, true)
      }
    })

    // if (props.position) gltfJewelScene.position.fromArray(props.position)
    // if (props.rotation) gltfJewelScene.rotation.fromArray(props.rotation)
    // gltfJewelScene.scale.setScalar(20)

    if (props.position)
      setLodTransform((prev) => ({ ...prev, position: props.position! }))
    if (props.rotation)
      setLodTransform((prev) => ({ ...prev, rotation: props.rotation! }))

    // OLD DEPRECATED CODE
    // let customScaleMultiplier = -1
    // const _item = props.groups[props.groupIndex].slots[props.index].item
    // if (
    //   _item !== undefined &&
    //   'lowPolyModelConfig' in _item &&
    //   _item.lowPolyModelConfig !== null &&
    //   'scaleFactor' in _item.lowPolyModelConfig &&
    //   _item.lowPolyModelConfig.scaleFactor !== null
    // ) {
    //   customScaleMultiplier = _item.lowPolyModelConfig.scaleFactor
    // }
    // if (customScaleMultiplier == -1) {
    //   // console.log(props.groups[props.groupIndex]._id, props.groups[props.groupIndex].slots[props.index]._id)
    //   customScaleMultiplier = props.scale ? props.scale[0] : 1
    // } else {
    //   console.log(props.groups[props.groupIndex]._id, props.groups[props.groupIndex].slots[props.index]._id)
    // }

    setLodTransform((prev) => ({
       ...prev, 
       scale: props.scale ? props.scale : [1, 1, 1]
    }))

    setMesh(gltfJewelScene)
  }, [gltfJewelScene])

  return (
    <>
      {mesh && (
        <>
          {areTransformControlsEnabled && (
            <TransformControls
              object={mesh}
              mode='rotate'
              onMouseUp={() => {
                console.log(mesh.rotation.toArray())
              }}
            />
          )}
          {mesh && (
            <Detailed
              distances={[0, 20]}
              objects={null}
              position={lodTransform.position}
              rotation={lodTransform.rotation}
              scale={lodTransform.scale}
              // onPointerEnter={() => {console.log(props.groups[props.groupIndex]._id)}}
            >
              <primitive object={mesh}>
                {/* { isDebugMode && <axesHelper args={[1]} /> } */}
              </primitive>
              <Gltf
                src={staticResourcePaths.dummyTriGltf}
                scale={[0, 0, 0]}
                visible={false}
              />
            </Detailed>
          )}
        </>
      )}
      {/* This is the button that appears on the jewellery item in presentation mode. It will pulse
      and the user can select an item by clicking on that button */}
      {isPresentationMode &&
        !isShowcaseMode &&
        !isPresentationModeShuttingDown &&
        !isPresentationModeStartingUp &&
        !isShowcaseModeStartingUp &&
        !isShowcaseModeShuttingDown &&
        props.groupIndex === presentationModeActiveGroupIndex && (
          <Html position={props.position} center>
            <button
              className='relative flex h-8 w-8 items-center justify-center'
              onClick={() => selectedJewelleryItemIndexForShowcase()}
              // onMouseOver={() => {console.log(props.sku, props.groups[props.groupIndex]._id, props.groups[props.groupIndex].slots[props.index]._id)}}
            >
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75'></span>
            </button>
          </Html>
        )}
    </>
  )
}

export default JewelleryItem
