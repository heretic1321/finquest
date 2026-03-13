import { create } from 'zustand'
import { createRef } from 'react'
import * as THREE from 'three'
import useWorldStore from './worldStore'

const useCameraStore = create((set, get) => ({
  orbitControlsRef: createRef(),

  orbitDistance: 6,

  // Camera movement tracking
  isCameraMovingByUserMove: createRef(),   // .current = bool
  isCameraMovingByUserZoom: createRef(),
  isCameraMovingByUserDrag: createRef(),
  isCameraMovingByAnyUserAction: createRef(),

  // Third-person config
  orbitControlsConfig: {
    enablePan: false,
    enableZoom: true,
    enableDamping: true,
    dampingFactor: 0.2,
    maxDistance: 9,
    minDistance: 1.5,
    minPolarAngle: 1,
    maxPolarAngle: 2,
    rotateSpeed: 0.8,
    zoomSpeed: 0.3,
    enableRotate: true,
  },

  // Camera follow function
  makeCameraFollowCharacter: () => {
    const state = get()
    const controls = state.orbitControlsRef.current
    if (!controls) return

    const characterRef = useWorldStore.getState().characterRef
    if (!characterRef || !characterRef.current) return

    const playerPos = characterRef.current.position
    const targetY = playerPos.y + 2 // head height offset

    controls.target.lerp(
      new THREE.Vector3(playerPos.x, targetY, playerPos.z),
      0.15
    )
    controls.update()
  },
}))

export default useCameraStore
