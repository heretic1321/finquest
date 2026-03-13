import { TransformControls } from '@react-three/drei'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { Object3D } from 'three'

import { useControls } from 'leva'

import { CharacterRef } from '@client/components/Character'
import { CameraControlsStore } from '@client/contexts/CameraControlsContext'
import { genericStore } from '@client/contexts/GlobalStateContext'

type TDebugCube = {
  characterRef: React.MutableRefObject<CharacterRef | null>
}
/**
 * This is a debug cube that can be used to figure out transforms in the scene
 * Add debug=true in the URL, go to the Debug Cube section, enable it.
 * A cube will popup in the scene, placed right where the player is placed.
 * A transform control rig will also appear. Changing the handles will log the
 * transform values to the console.
 */
const DebugCube = (props: TDebugCube) => {
  const isDebugMode = genericStore((state) => state.isDebugMode)
  const meshRef = useRef<THREE.Mesh | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState<THREE.Vector3>(new THREE.Vector3())
  const [transformControlsMode, setTransformControlsMode] = useState<
    'translate' | 'rotate' | 'scale'
  >('translate')

  useControls(
    'Debug Cube',
    () => ({
      enabled: {
        value: false,
        onChange: (value: boolean) => {
          setIsVisible(value)
          if (props.characterRef.current?.playerRef.current?.position)
            setPosition(
              new THREE.Vector3().copy(
                props.characterRef.current?.playerRef.current?.position,
              ),
            )

          const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
          if (_orbitControlsRef.current == null) return

          if (value === true) {
            _orbitControlsRef.current.enabled = false
          } else {
            _orbitControlsRef.current.enabled = true
          }
        },
      },
      transformControlsMode: {
        value: 'translate',
        options: ['translate', 'rotate', 'scale'],
        onChange: (value: 'translate' | 'rotate' | 'scale') => {
          setTransformControlsMode(value)
        },
      },
    }),
    {
      collapsed: true,
      render: () => {
        // render the controls only if we are in debug mode
        return isDebugMode || false
      },
    },
  )

  return (
    <>
      {isVisible && (
        <TransformControls
          object={meshRef.current as Object3D}
          mode={transformControlsMode}
          onMouseUp={() => {
            if (transformControlsMode === 'translate') {
              console.log(meshRef.current?.position.toArray())
            } else if (transformControlsMode === 'rotate') {
              console.log(meshRef.current?.rotation.toArray())
            } else if (transformControlsMode === 'scale') {
              console.log(meshRef.current?.scale.toArray())
            }
          }}
        />
      )}
      <mesh visible={isVisible} position={position} ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color='hotpink' />
      </mesh>
    </>
  )
}

export default DebugCube
