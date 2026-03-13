import { useFrame } from '@react-three/fiber'
import { MutableRefObject, useEffect, useRef, useState } from 'react'
import { Matrix4, Mesh, Object3D } from 'three'
import { genericStore } from '@client/contexts/GlobalStateContext'

type JewelleryShowcaseTriggerAreaProps = {
  target: Object3D | null
  name: string
  _id?: string // in case this belongs to a showcase on db
  radiusX: number // width of the plane trigger area
  radiusY: number // depth of the plane trigger area
  rotationY?: number // rotation of the plane trigger area in world's XZ plane and local 
  position: [number, number, number]
  scale?: [number, number, number]
  onInside?: () => void
  onOutside?: () => void
  onClick?: () => void
  areTransformControlsShown?: boolean
  transformControlsMode?: 'translate' | 'rotate' | 'scale'

  // refs which represent some values of the trigger area which need to be udpated for dev mode adjustments and syncing to db
  tempPositionReference?: MutableRefObject<[number, number, number]>
  tempRadiusXReference?: MutableRefObject<number>
  tempRadiusYReference?: MutableRefObject<number>
  tempRotationYReference?: MutableRefObject<number>
  transformControlsSelectionId?: string
}

const JewelleryShowcaseTriggerArea = (
  props: JewelleryShowcaseTriggerAreaProps,
) => {
  const triggerAreaRef = useRef<Mesh | null>(null)
  const dummyMatrix = useRef(new Matrix4()).current
  const [isIntersecting, setIsIntersecting] = useState(false)
  const isDebugMode = genericStore((state) => state.isDebugMode)

  useEffect(() => {
    if (isIntersecting) {
      if (props.onInside) props.onInside()
    } else {
      if (props.onOutside) props.onOutside()
    }
  }, [isIntersecting])

  useFrame(() => {
    if (!genericStore.getState().isTabFocused) return
    if (!triggerAreaRef.current) return
    if (!triggerAreaRef.current.geometry.boundsTree) return
    if (!props.target) return

    props.target.updateMatrixWorld()

    const transformMatrix = dummyMatrix
      .copy(props.target.matrixWorld)
      .invert()
      .multiply(triggerAreaRef.current.matrixWorld)

    const hit = (props.target as Mesh).geometry.boundsTree?.intersectsGeometry(
      triggerAreaRef.current.geometry,
      transformMatrix,
    )

    if (hit) {
      if (!isIntersecting) {
        setIsIntersecting(true)
      }
    } else {
      if (isIntersecting) {
        setIsIntersecting(false)
      }
    }
  })


  useEffect(() => {
    triggerAreaRef.current?.geometry.computeBoundsTree()
  }, [])

  return (
    <>
      {/* {
        isDebugMode && props.areTransformControlsShown && (props.transformControlsSelectionId !== undefined) &&
        <TransformControls
          mode={props.transformControlsMode ?? 'translate'}
          object={triggerAreaRef.current ? triggerAreaRef.current : undefined}
          onMouseDown={() => {
            CameraControlsStore.getState().orbitControlsRef.current!.enabled = false
          }}
          onMouseUp={() => {
            CameraControlsStore.getState().orbitControlsRef.current!.enabled = true
            if (props.transformControlsMode === 'translate')
              console.log(triggerAreaRef.current!.position.toArray())
            
            if (props.transformControlsMode === 'scale')
              console.log(triggerAreaRef.current!.scale.toArray())

            if (props.transformControlsMode === 'rotate')
              console.log(triggerAreaRef.current!.rotation.toArray())

            if (props.tempPositionReference)
              props.tempPositionReference.current = triggerAreaRef.current!.position.toArray() as [number, number, number]

            if (props.tempRadiusXReference)
              props.tempRadiusXReference.current = props.radiusX

            if (props.tempRadiusYReference)
              props.tempRadiusYReference.current = props.radiusY

            if (props.tempRotationYReference) {
              props.tempRotationYReference.current = triggerAreaRef.current!.rotation.z
            }
          }}
        ></TransformControls>
      } */}
      <mesh
        ref={triggerAreaRef}
        position={props.position}
        scale={props.scale ?? [1, 1, 1]}
        rotation={[-Math.PI / 2, 0, props.rotationY ?? 0]}
        onClick={props.onClick}
        // onPointerEnter={() => {console.log(props._id)}}
      >
        <planeGeometry args={[props.radiusX, props.radiusY]} />
        <meshBasicMaterial
          color={isIntersecting ? 0x00ff00 : 0xff0000}
          transparent
          opacity={0.5}
          visible={isDebugMode ? true : false}
        />
      </mesh>
    </>
  )
}

export default JewelleryShowcaseTriggerArea
