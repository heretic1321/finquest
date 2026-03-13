import { MutableRefObject, createContext, createRef } from 'react'

import useCameraControls, { CameraMode } from '@client/hooks/useCameraControls'
import { PerspectiveCamera, Vector3 } from 'three'
import { OrbitControls as OrbitControlsType } from 'three-stdlib'
import { create } from 'zustand'

export type TCameraControlsContext = {}

interface OrbitControlsConfig {
  enableDamping: boolean
  maxDistance: number
  minPolarAngle: number
  maxPolarAngle: number
  zoomSpeed: number
  fov: number
  dampingFactor: number
  enableZoom: boolean
  enablePan: boolean
}

interface CameraControlsZustandState {
  isCameraMovingByAnyUserAction: MutableRefObject<boolean>
  isCameraMovingByUserMove: MutableRefObject<boolean>
  isCameraMovingByUserZoom: MutableRefObject<boolean>
  isCameraMovingByUserDrag: MutableRefObject<boolean>
  orbitDistance: number
  orbitControlsRef: MutableRefObject<OrbitControlsType | null>
  
  cameraPosition: [number, number, number]
  cameraRotation: [number, number, number]
  cameraDistanceThreshold1or3Person: number
  firstPersonOrbitControlsConfig: OrbitControlsConfig
  thirdPersonOrbitControlsConfig: OrbitControlsConfig
  orbitControlsConfig: OrbitControlsConfig
  setOrbitControlsConfig: (config: Partial<OrbitControlsConfig>) => void
  cameraMode: CameraMode

  makeCameraFollowCharacter: (
    playerRef: MutableRefObject<THREE.Group | null>,
  ) => void

  switchToFirstPerson: () => void
  switchToThirdPerson: () => void

  dummyVectorRef: MutableRefObject<Vector3>
}

const isCameraMovingByAnyUserAction = createRef<boolean>() as MutableRefObject<boolean>
isCameraMovingByAnyUserAction.current = false

const isCameraMovingByUserMove = createRef<boolean>() as MutableRefObject<boolean>
isCameraMovingByUserMove.current = false

const isCameraMovingByUserZoom = createRef<boolean>() as MutableRefObject<boolean>
isCameraMovingByUserZoom.current = false

const isCameraMovingByUserDrag = createRef<boolean>() as MutableRefObject<boolean>
isCameraMovingByUserDrag.current = false

const orbitControlsRef = createRef<OrbitControlsType>() as MutableRefObject<OrbitControlsType | null>
orbitControlsRef.current = null

const dummyVectorRef = createRef<Vector3>() as MutableRefObject<Vector3>
dummyVectorRef.current = new Vector3()

export const CameraControlsStore = create<CameraControlsZustandState>((set) => ({
  isCameraMovingByAnyUserAction,
  isCameraMovingByUserMove,
  isCameraMovingByUserZoom,
  isCameraMovingByUserDrag,
  orbitDistance: 15,
  orbitControlsRef,

  cameraPosition: [0.08, 25.8, 82.6],
  cameraRotation: [0.35, -0.000963, -0.000402],
  cameraDistanceThreshold1or3Person: 1.5,
  firstPersonOrbitControlsConfig: {
    enableDamping: false,
    maxDistance: 0.01,
    minPolarAngle: Math.PI / 4,
    maxPolarAngle: Math.PI,
    zoomSpeed: 8,
    fov: 60,
    dampingFactor: 0.2,
    enableZoom: true,
    enablePan: false
  },
  thirdPersonOrbitControlsConfig: {
    enableDamping: true,
    maxDistance: 9,
    minPolarAngle: 1,
    maxPolarAngle: 2,
    zoomSpeed: 1.5,
    fov: 60,
    dampingFactor: 0.2,
    enableZoom: true,
    enablePan: false
  },
  orbitControlsConfig: {
    enableDamping: true,
    maxDistance: 9,
    minPolarAngle: 1,
    maxPolarAngle: 2,
    zoomSpeed: 1.5,
    fov: 60,
    dampingFactor: 0.2,
    enableZoom: true,
    enablePan: false
  },
  setOrbitControlsConfig: (config) => {
    set((state) => {
      const newConfig = {
        ...state.orbitControlsConfig,
        ...config,
      }

      const _orbitControlsRef = state.orbitControlsRef
      if (_orbitControlsRef.current !== null) {
        _orbitControlsRef.current.enableDamping = newConfig.enableDamping
        _orbitControlsRef.current.maxDistance = newConfig.maxDistance
        _orbitControlsRef.current.minPolarAngle = newConfig.minPolarAngle
        _orbitControlsRef.current.maxPolarAngle = newConfig.maxPolarAngle
        _orbitControlsRef.current.zoomSpeed = newConfig.zoomSpeed
        ;(_orbitControlsRef.current.object as PerspectiveCamera).fov = newConfig.fov
        ;(_orbitControlsRef.current.object as PerspectiveCamera).updateProjectionMatrix()
        _orbitControlsRef.current.dampingFactor = newConfig.dampingFactor
        _orbitControlsRef.current.enableZoom = newConfig.enableZoom
        _orbitControlsRef.current.enablePan = newConfig.enablePan
      }

      return {
        orbitControlsConfig: newConfig,
      }
    })
  },
  cameraMode: CameraMode.THIRD_PERSON,

  makeCameraFollowCharacter: (
    playerRef: MutableRefObject<THREE.Group | null>,
  ) => {
    const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
    if (_orbitControlsRef.current === null) return
    if (!playerRef.current) return
    if (_orbitControlsRef.current.enabled === false) return
    // adjust the camera to always look at the charachter's head
    const playerHead = dummyVectorRef.current.set(
      playerRef.current.position.x,
      playerRef.current.position.y + 2,
      playerRef.current.position.z,
    )
    const camera = _orbitControlsRef.current.object as PerspectiveCamera
    camera.position.sub(_orbitControlsRef.current.target)
    _orbitControlsRef.current.target.copy(playerHead)
    camera.position.add(playerHead)
    _orbitControlsRef.current.update()
  },

  switchToFirstPerson: () => {
    const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
    if (_orbitControlsRef.current === null) return

    CameraControlsStore.getState().setOrbitControlsConfig({
      maxDistance: CameraControlsStore.getState().firstPersonOrbitControlsConfig.maxDistance,
      minPolarAngle: CameraControlsStore.getState().firstPersonOrbitControlsConfig.minPolarAngle,
      maxPolarAngle: CameraControlsStore.getState().firstPersonOrbitControlsConfig.maxPolarAngle,
      zoomSpeed: CameraControlsStore.getState().firstPersonOrbitControlsConfig.zoomSpeed,
      enableDamping: CameraControlsStore.getState().firstPersonOrbitControlsConfig.enableDamping,
      fov: CameraControlsStore.getState().firstPersonOrbitControlsConfig.fov,
    })
    CameraControlsStore.setState({ cameraMode: CameraMode.FIRST_PERSON })

    // this is done to quickly snap the user's camera to the character's head
    // and after 500ms allow the user to scroll back to third person
    setTimeout(() => {
      CameraControlsStore.getState().setOrbitControlsConfig({
        maxDistance: CameraControlsStore.getState().thirdPersonOrbitControlsConfig.maxDistance,
      })
    }, 500)
  },

  switchToThirdPerson: () => {
    const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
    if (_orbitControlsRef.current === null) return

    CameraControlsStore.getState().setOrbitControlsConfig({
      maxDistance: CameraControlsStore.getState().thirdPersonOrbitControlsConfig.maxDistance,
      minPolarAngle: CameraControlsStore.getState().thirdPersonOrbitControlsConfig.minPolarAngle,
      maxPolarAngle: CameraControlsStore.getState().thirdPersonOrbitControlsConfig.maxPolarAngle,
      zoomSpeed: CameraControlsStore.getState().thirdPersonOrbitControlsConfig.zoomSpeed,
      enableDamping: CameraControlsStore.getState().thirdPersonOrbitControlsConfig.enableDamping,
      fov: CameraControlsStore.getState().thirdPersonOrbitControlsConfig.fov,
    })

    CameraControlsStore.setState({ cameraMode: CameraMode.THIRD_PERSON })
  },

  dummyVectorRef,
}))



export const CameraControlsContext = createContext<TCameraControlsContext>({})

export const CameraControlsContextProvider = ({
  children,
}: React.PropsWithChildren) => {
  useCameraControls()
  return (
    <CameraControlsContext.Provider value={{}}>
      {children}
    </CameraControlsContext.Provider>
  )
}
