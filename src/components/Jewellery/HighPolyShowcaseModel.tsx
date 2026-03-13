import {
  TransformControls
} from '@react-three/drei'
import { MeshProps, useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Group, Mesh, Object3D } from 'three'

import { button, useControls } from 'leva'

import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { loader } from '@client/contexts/CollectionContext'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { MaterialStore } from '@client/contexts/MaterialContext'
import { LAYER_SELECTIVE_BLOOM } from '@client/main'
import { getRotationAllowedForItemTypes, sendGroupsIdealRotationToDB } from '@client/utils/helperFunctions'
import { IGroupWithItems } from '@client/utils/types/collectionAPI'
import { dampE } from 'maath/easing'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { useShallow } from 'zustand/react/shallow'
import { SoundsStore } from '../Sounds'

type THighPolyShowcaseModel = MeshProps & {
  storeName: string
  groups: IGroupWithItems[]
}

// const BreakpointScale = {
//   xxs: 1,
//   xs: 1,
//   sm: 1.5,
//   md: 2,
//   lg: 2,
//   xl: 2,
// }

const HighPolyShowcaseModel = (props: THighPolyShowcaseModel) => {
  const isDebugMode = genericStore((state) => state.isDebugMode)
  const compareAndAssignMaterial = MaterialStore((state) => state.compareAndAssignMaterial)

  const isRotationOnXAllowed = useRef(false)
  const isRotationOnYAllowed = useRef(false)
  const isRotationOnZAllowed = useRef(false)

  const {
    showcaseActiveGroupIndex,
    showcaseActiveItemIndex,
    isShowcaseMode,
    isShowcaseModeShuttingDown,
    setIsHighPolyModelLoading
  } = HUDStore(
    useShallow((state) => ({
      showcaseActiveGroupIndex: state.showcaseActiveGroupIndex,
      showcaseActiveItemIndex: state.showcaseActiveItemIndex,
      isShowcaseMode: state.isShowcaseMode,
      isShowcaseModeShuttingDown: state.isShowcaseModeShuttingDown,
      setIsHighPolyModelLoading: state.setIsHighPolyModelLoading,
    })),
  )
  // const { breakpoint } = useContext(GesturesAndDeviceContext)

  const [model, setModel] = useState<Group | null>(null)

  const [scale, setScale] = useState(60)

  useEffect(() => {
    if (
      !props.groups ||
      showcaseActiveItemIndex === -1 ||
      showcaseActiveGroupIndex === -1
    ) return

    setIsHighPolyModelLoading(true)
    const itemDataInGroups = props.groups[showcaseActiveGroupIndex].slots[showcaseActiveItemIndex].item

    if (itemDataInGroups?.sku) {
      const modelUrl =  `${staticResourcePaths.s3_bucket_cdn}${itemDataInGroups.sku}_h.glb`

      loader.load(
        modelUrl,
        (gltf: GLTF) => {

          gltf.scene.traverse((child) => {
            if (child instanceof Mesh) {
              child.layers.enable(LAYER_SELECTIVE_BLOOM)
              compareAndAssignMaterial(child)
            }
          })
          gltf.scene.layers.enable(LAYER_SELECTIVE_BLOOM)

          // caching the high poly scene's reference in the item data, so we can dispose it later
          if (itemDataInGroups) itemDataInGroups.highPolyScene = gltf.scene

          setModel(gltf.scene)
      
          if (
            itemDataInGroups !== undefined && 
            itemDataInGroups !== null &&
            'highPolyModelConfig' in itemDataInGroups &&
            'scale' in itemDataInGroups.highPolyModelConfig
          ) {
            setScale(60 * itemDataInGroups.highPolyModelConfig.scale[0])
          }

          const result = getRotationAllowedForItemTypes(
            itemDataInGroups.itemType,
            // itemDataInGroups.sku
          )
          isRotationOnXAllowed.current = result.x
          isRotationOnYAllowed.current = result.y
          isRotationOnZAllowed.current = result.z

          setIsHighPolyModelLoading(false)
        }
      )
    }

    return () => {
      if (model) {
        model.traverse((child) => {
          if (child instanceof Mesh) {
            child.material.dispose()
            child.geometry.dispose()
          }
        })
      }
      setModel(null)
    }
  }, [
    props.groups,
    showcaseActiveGroupIndex,
    showcaseActiveItemIndex,
  ])

  const [showTransformControls] = useState(false)
  const [transformControlsMode] = useState<
    'translate' | 'rotate' | 'scale'
  >('translate')
  const transformControlsTargetRef = useRef<Object3D | null>(null)
  const primitiveRef = useRef<Mesh | null>(null)

  useEffect(() => {
    SoundsStore.getState().playShineSound()
    SoundsStore.getState().stopBackgroundMusic()
    return () => {
      SoundsStore.getState().stopShineSound()
      SoundsStore.getState().playBackgroundMusic()
    }
  }, [])

  useControls(
    'High Poly Model System',
    () => ({
      
      
      changeTargetToPrimitive: button(() => {
        transformControlsTargetRef.current = primitiveRef.current
      }),
      rotationX: {
        value: primitiveRef.current?.rotation.x ?? 0,
        min: -Math.PI,
        max: Math.PI,
        step: 0.01,
        onChange: (value) => {
          if (primitiveRef.current) {
            primitiveRef.current.rotation.x = value
          }
        }
      },
      rotationY: {
        value: primitiveRef.current?.rotation.y ?? 0,
        min: -Math.PI,
        max: Math.PI,
        step: 0.01,
        onChange: (value) => {
          if (primitiveRef.current) {
            primitiveRef.current.rotation.y = value
          }
        }
      },
      rotationZ: {
        value: primitiveRef.current?.rotation.z ?? 0,
        min: -Math.PI,
        max: Math.PI,
        step: 0.01,
        onChange: (value) => {
          if (primitiveRef.current) {
            primitiveRef.current.rotation.z = value
          }
        }
      },
      rotateXLocal: {
        value: 0,
        min: -Math.PI,
        max: Math.PI,
        step: 0.01,
        onChange: (value) => {
          if (primitiveRef.current) {
            primitiveRef.current.rotateX(value)
          }
        }
      },
      rotateYLocal: {
        value: 0,
        min: -Math.PI,
        max: Math.PI,
        step: 0.01,
        onChange: (value) => {
          if (primitiveRef.current) {
            primitiveRef.current.rotateY(value)
          }
        }
      },
      rotateZLocal: {
        value: 0,
        min: -Math.PI,
        max: Math.PI,
        step: 0.01,
        onChange: (value) => {
          if (primitiveRef.current) {
            primitiveRef.current.rotateZ(value)
          }
        }
      },
      sendIdealRotation: button(() => {
        if (primitiveRef.current)
          sendGroupsIdealRotationToDB(
            props.groups[showcaseActiveGroupIndex]._id,
            [
              primitiveRef.current.rotation.x,
              primitiveRef.current.rotation.y,
              primitiveRef.current.rotation.z,
            ]
          )
      })
    }),
    {
      collapsed: true,
      render: () => {
        // render the controls only if we are in debug mode
        return isDebugMode || false
      },
    },
  )

  const disturbedFromEquilibrium = useRef(false)

  useFrame((_state, delta) => {
    if (!genericStore.getState().isTabFocused) return
    if (primitiveRef.current) {
      if (GesturesAndDeviceStore.getState().isDragging.current) {
        disturbedFromEquilibrium.current = true

        if (
          isRotationOnXAllowed.current &&
          isRotationOnYAllowed.current
        ) {
          primitiveRef.current.rotateX(
            GesturesAndDeviceStore.getState().dragDeltaY.current * 0.005
          )
          primitiveRef.current.rotateY(
            GesturesAndDeviceStore.getState().dragDeltaX.current * 0.005
          )
        }

        else if (
          isRotationOnZAllowed.current
        ) {
          primitiveRef.current.rotateZ(
            - GesturesAndDeviceStore.getState().dragDeltaX.current * 0.005
          )

          if (isRotationOnXAllowed.current) {
            primitiveRef.current.rotateX(
              GesturesAndDeviceStore.getState().dragDeltaY.current * 0.005
            )
          }
        }
      } else {
        if (disturbedFromEquilibrium.current) {
          // return to original location
          const isDamping = dampE(
            primitiveRef.current.rotation, 
            currentItemRotation as [number, number, number],
            0.1,
            delta
          )

          if (!isDamping) {
            disturbedFromEquilibrium.current = false
          }
        } else {
          // auto rotate slowly
          if (isRotationOnYAllowed.current)
            primitiveRef.current.rotateY(0.2 * delta)
          else if (isRotationOnZAllowed.current)
            primitiveRef.current.rotateZ(0.2 * delta)
        }
      }
    }
  })

  const [currentItemRotation, setCurrentItemRotation] = useState([0, 0, 0])
  useEffect(() => {
    if (props.groups) {
      // console.log({
      //   grp: props.groups[showcaseActiveGroupIndex],
      //   idx: showcaseActiveItemIndex,
      // })

      // each item has a rotation stored against it which makes it looks towards the user, we're applying
      // that rotation to the object so it kind of faces the user
      const currentGroup = props.groups[showcaseActiveGroupIndex]
      const currentSlot = currentGroup.slots[showcaseActiveItemIndex]
      const itemInSlot = currentSlot.item
      if (itemInSlot !== undefined) {
        setCurrentItemRotation(
          // currentGroup.idealRotation
          itemInSlot.highPolyModelConfig?.rotation || [0, 0, 0]
        )
      }
    }
  }, [showcaseActiveGroupIndex, props.groups, showcaseActiveItemIndex])

  // const handleItemScaleOnScroll = (deltaY: number) => {
  //   if (containerRef.current) {
  //     const currentScale = containerRef.current.scale
  //     const newScale = currentScale.clone().addScalar(deltaY * 0.01)
  //     if (newScale.x < 60 || newScale.x >= 150) return
  //     containerRef.current.scale.set(newScale.x, newScale.y, newScale.z)
  //   }
  // }

  if (!isShowcaseMode || isShowcaseModeShuttingDown || !props.groups)
    return null
  return (
    <>
      {showTransformControls && transformControlsTargetRef.current && (
        <TransformControls
          object={transformControlsTargetRef.current}
          mode={transformControlsMode}
          onMouseUp={() => {
            if (transformControlsMode === 'translate') {
              console.log(
                transformControlsTargetRef.current?.position.toArray(),
              )
            } else if (transformControlsMode === 'rotate') {
              console.log(
                transformControlsTargetRef.current?.rotation.toArray(),
              )
            } else if (transformControlsMode === 'scale') {
              console.log(transformControlsTargetRef.current?.scale.toArray())
            }
          }}
        />
      )}
      {props.groups[showcaseActiveGroupIndex].slots[showcaseActiveItemIndex]
        .item &&
        model !== null && (
            <primitive
              object={model}
              position={
                props.groups[showcaseActiveGroupIndex].triggerArea.showcaseCamera
                  .target
              }
              rotation={currentItemRotation as [number, number, number]}
              scale={[scale, scale, scale]}
              ref={(node: Mesh) => {
                if (node) {
                  primitiveRef.current = node
                }  else {
                  primitiveRef.current = null
                }
              }}
            >
             {isDebugMode && <axesHelper args={[10]} />}
            </primitive>
        )}
    </>
  )
}
export default HighPolyShowcaseModel
