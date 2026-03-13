import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { TransformControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import {
  Box3,
  BufferGeometry,
  Line3,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from 'three'
import { ExtendedTriangle } from 'three-mesh-bvh'

import { CameraControlsStore } from '@client/contexts/CameraControlsContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { TransformLite } from '@client/utils/commonTypes'

import { CharacterRef } from './Character'

export type StoreEntryExitTriggerAreaProps = {
  characterRef: MutableRefObject<CharacterRef | null>
  geometry: BufferGeometry
  transform: TransformLite
  onInside?: () => void
  onOutside?: () => void
  transformControlsEnabled?: boolean
  isVisible?: boolean
  keyId: string
}

const StoreEntryExitTriggerArea = ({
  characterRef,
  geometry,
  transform,
  onInside,
  onOutside,
  isVisible = false,
  transformControlsEnabled = false,
}: // keyId
StoreEntryExitTriggerAreaProps) => {
  const triggerAreaMeshRef = useRef<Mesh>()
  const [isInside, setIsInside] = useState(false)
  const isDebugMode = genericStore((state) => state.isDebugMode)

  useEffect(() => {
    if (isInside) {
      if (onInside) onInside()
    } else {
      if (onOutside) onOutside()
    }
  }, [isInside])

  const tempVector = useRef(new Vector3()).current
  const tempVector2 = useRef(new Vector3()).current
  const tempMat = useRef(new Matrix4()).current
  const tempBox = useRef(new Box3()).current
  const tempSegment = useRef(new Line3()).current
  const capsuleInfo = useRef({
    radius: 0.5,
    segment: new Line3(new Vector3(), new Vector3(0, -1.0, 0.0)),
  }).current

  useFrame(() => {
    if (!genericStore.getState().isTabFocused) return
    const target = characterRef.current?.roundedBoxRef.current
    if (!target) return
    if (!triggerAreaMeshRef.current) return
    if (!(triggerAreaMeshRef.current instanceof Mesh)) return
    if (!triggerAreaMeshRef.current.geometry.boundsTree) {
      triggerAreaMeshRef.current.geometry.computeBoundsTree()
      return
    }

    tempBox.makeEmpty()
    tempMat.copy(triggerAreaMeshRef.current.matrixWorld).invert()
    tempSegment.copy(capsuleInfo.segment)

    // get the position of the target in the local space of the trigger area
    tempSegment.start.applyMatrix4(target.matrixWorld).applyMatrix4(tempMat)
    tempSegment.end.applyMatrix4(target.matrixWorld).applyMatrix4(tempMat)

    // get the axis aligned bounding box of the capsule
    tempBox.expandByPoint(tempSegment.start)
    tempBox.expandByPoint(tempSegment.end)

    tempBox.min.addScalar(-capsuleInfo.radius)
    tempBox.max.addScalar(capsuleInfo.radius)

    let isIntersects = false

    triggerAreaMeshRef.current.geometry.boundsTree?.shapecast({
      intersectsBounds: (box: Box3) => box.intersectsBox(tempBox),
      intersectsTriangle: (tri: ExtendedTriangle) => {
        // check if the triangle is intersecting the capsule and adjust the
        // capsule position if it is.
        const triPoint = tempVector
        const capsulePoint = tempVector2

        const distance = tri.closestPointToSegment(
          tempSegment,
          triPoint,
          capsulePoint,
        )
        if (distance < capsuleInfo.radius) {
          isIntersects = true
        }
      },
    })

    if (isIntersects) {
      ;(triggerAreaMeshRef.current?.material as MeshBasicMaterial).color.set(
        'green',
      )
      if (!isInside) {
        setIsInside(true)
      }
    } else {
      ;(triggerAreaMeshRef.current?.material as MeshBasicMaterial).color.set(
        'red',
      )
      if (isInside) {
        setIsInside(false)
      }
    }
  })

  const [transformControlsTarget, setTransformControlsTarget] = useState<
    'translate' | 'rotate' | 'scale'
  >('translate')

  // setup a useEffect to listen for keydown events on key P and when pressed set the transformControlsTarget to the next value
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'p') {
        setTransformControlsTarget((prev) => {
          if (prev === 'translate') {
            return 'rotate'
          } else if (prev === 'rotate') {
            return 'scale'
          } else {
            return 'translate'
          }
        })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [transformControlsEnabled])

  return (
    <>
      <mesh
        ref={useCallback((node: Mesh) => {
          if (node) {
            node.updateMatrixWorld(true)
            node.geometry.computeBoundsTree()
            triggerAreaMeshRef.current = node
          } else if (node === null) {
            triggerAreaMeshRef.current = undefined
          }
        }, [])}
        geometry={geometry}
        position={transform.position}
        rotation={transform.rotation}
        scale={transform.scale}
      >
        {geometry ? null : <boxBufferGeometry args={[1, 1, 1]} />}
        <meshBasicMaterial
          color='red'
          transparent={true}
          opacity={0.5}
          visible={isVisible || isDebugMode}
        />
      </mesh>
      {transformControlsEnabled && (
        <TransformControls
          mode={transformControlsTarget}
          object={triggerAreaMeshRef.current}
          onMouseDown={() => {
            CameraControlsStore.getState().orbitControlsRef.current!.enabled =
              false
          }}
          onMouseUp={() => {
            CameraControlsStore.getState().orbitControlsRef.current!.enabled =
              true
            if (transformControlsTarget === 'translate') {
              console.log(triggerAreaMeshRef.current!.position.toArray())
            } else if (transformControlsTarget === 'rotate') {
              console.log(triggerAreaMeshRef.current!.rotation.toArray())
            } else {
              console.log(triggerAreaMeshRef.current!.scale.toArray())
            }
          }}
        ></TransformControls>
      )}
    </>
  )
}

export default StoreEntryExitTriggerArea
