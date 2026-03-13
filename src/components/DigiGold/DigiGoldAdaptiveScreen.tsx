import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { useThree } from '@react-three/fiber'
import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

interface DigiGoldAdaptiveScreenProps {
  targetCameraPosition: THREE.Vector3 | [number, number, number]
  targetCameraRotation: THREE.Euler | [number, number, number]
  planeDistance: number
  fov: number
  model: THREE.Group
}

const DigiGoldAdaptiveScreen: React.FC<DigiGoldAdaptiveScreenProps> = ({
  targetCameraPosition,
  targetCameraRotation,
  planeDistance,
  fov,
  model,
}) => {
  const [coveragePercent, setCoveragePercent] = useState(0.45)

  const breakpoint = GesturesAndDeviceStore((state) => state.breakpoint)
  useEffect(() => {
    if (breakpoint === 'xs' || breakpoint === 'sm' || breakpoint === 'md') {
      setCoveragePercent(0.55)
    } else {
      setCoveragePercent(0.45)
    }
  }, [breakpoint])

  const planeRef = useRef<THREE.Mesh>(null)
  const { viewport } = useThree()

  const targetPosition = new THREE.Vector3().copy(
    targetCameraPosition instanceof THREE.Vector3
      ? targetCameraPosition
      : new THREE.Vector3(...targetCameraPosition),
  )
  const targetRotation = new THREE.Euler().copy(
    targetCameraRotation instanceof THREE.Euler
      ? targetCameraRotation
      : new THREE.Euler(...targetCameraRotation),
  )

  useEffect(() => {
    if (!planeRef.current) {
      console.warn('planeRef is not available')
      return
    }

    // Check if model has any meshes
    let hasMeshes = false
    model?.traverse((child) => {
      if (child.type === 'Mesh') {
        hasMeshes = true
      }
    })
    if (!hasMeshes) {
      console.warn('No meshes found in model')
    }

    const direction = new THREE.Vector3(0, 0, -1).applyEuler(targetRotation)
    const planePosition = targetPosition
      .clone()
      .add(direction.multiplyScalar(planeDistance))

    // Reset and apply transformations
    model.position.set(0, 0, 0)
    model.rotation.set(0, 0, 0)
    model.scale.set(1, 1, 0.1) // Try an even smaller z scale for testing

    // Try applying scale to all child meshes
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.scale.z = 0.1
      }
    })

    model.visible = true // Ensure visibility is on

    planeRef.current.position.copy(planePosition)
    planeRef.current.rotation.copy(targetRotation)

    const aspectRatio = viewport.width / viewport.height
    const planeHeight =
      2 * Math.tan((fov * Math.PI) / 360) * planeDistance * coveragePercent
    const planeWidth = planeHeight * aspectRatio

    planeRef.current.scale.set(planeWidth, planeHeight, 1)
  }, [
    targetPosition,
    targetRotation,
    planeDistance,
    fov,
    viewport,
    coveragePercent,
    model,
  ])
  return (
    <>
      <primitive object={model} ref={planeRef} />
    </>
  )
  return <></>
}

export default DigiGoldAdaptiveScreen
