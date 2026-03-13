import { useFrame, useThree } from '@react-three/fiber'
import {
  useEffect
} from 'react'
import * as THREE from 'three'
import { OrbitControls as OrbitControlsType } from 'three-stdlib'

import { button, useControls } from 'leva'

import { CameraControlsStore } from '@client/contexts/CameraControlsContext'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { InventoryConsoleHUDStore } from '@client/contexts/InventoryConsoleHUDContext'
import { OrbitControls } from '@client/utils/modifiedOrbitControls'
import { useShallow } from 'zustand/react/shallow'

export enum CameraMode {
  FIRST_PERSON = 'FIRST_PERSON',
  THIRD_PERSON = 'THIRD_PERSON',
}



const useCameraControls = () => {

  const { gl, camera } = useThree()

  const {
    isPinchOrScrollEventActive,
    isDragEventActive
  } = GesturesAndDeviceStore(
    useShallow((state) => ({
      isPinchOrScrollEventActive: state.isPinchOrScrollEventActive,
      isTouchDevice: state.isTouchDevice,
      isDragEventActive: state.isDragEventActive,
    }))
  )

  const isDebugMode = genericStore((state) => state.isDebugMode)

  const { hasStartButtonBeenPressed, isPresentationMode } =
    HUDStore(
      useShallow((state) => ({
        hasStartButtonBeenPressed: state.hasStartButtonBeenPressed,
        isPresentationMode: state.isPresentationMode,
      })),
    )
    
  const inventoryConsoleHUDContext = InventoryConsoleHUDStore(
    useShallow((state) => ({
      isPresentationMode: state.isPresentationMode,
    }))
  )
  
  useFrame(() => {
    if (!genericStore.getState().isTabFocused) return
    if (
      CameraControlsStore.getState().isCameraMovingByUserZoom.current === false &&
      CameraControlsStore.getState().isCameraMovingByUserMove.current === false &&
      CameraControlsStore.getState().isCameraMovingByUserDrag.current === false
    ) CameraControlsStore.getState().isCameraMovingByAnyUserAction.current = false
    else CameraControlsStore.getState().isCameraMovingByAnyUserAction.current = true
  })

  useControls(
    'Camera Controls',
    () => ({
      unityLikeControls: {
        value: genericStore.getState().unityLikeControlsEnabled,
        onChange: (v) => {
          genericStore.setState({ unityLikeControlsEnabled: v })
        },
      },
      unityLikeControlsCameraSpeed: {
        min: 0.1,
        max: 3,
        step: 0.1,
        value: genericStore.getState().unityLikeControlsCameraSpeed,
        onChange: (v) => {
          genericStore.setState({ unityLikeControlsCameraSpeed: v })
        },
      },
      printCameraFOV: button(() => {
        console.log((camera as THREE.PerspectiveCamera).fov)
      }),
      printCameraTransform: button(() => {
        console.log("position", camera.position.toArray())
        console.log("rotation", camera.rotation.toArray())
      }),
      enableDisableOrbitControls: button(() => {
        const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
        if (_orbitControlsRef.current === null) {
          console.error('OrbitControls ref is null')
          return
        }
        _orbitControlsRef.current.enabled = !_orbitControlsRef.current.enabled
      }),
      position: {
        value: CameraControlsStore.getState().cameraPosition,
        onChange: (v: [number, number, number]) => {
          const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
          if (_orbitControlsRef.current === null) return
          _orbitControlsRef.current.enabled = false
          camera.position.fromArray(v)
          CameraControlsStore.setState({ cameraPosition: v })
        },
      },
      rotation: {
        value: CameraControlsStore.getState().cameraRotation,
        onChange: (v: [number, number, number]) => {
          const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
          if (_orbitControlsRef.current === null) return
          _orbitControlsRef.current.enabled = false
          camera.rotation.fromArray(v)
          CameraControlsStore.setState({ cameraRotation: v })
        },
      },
      enablePan: {
        value: CameraControlsStore.getState().orbitControlsConfig.enablePan,
        onChange: (v) => {
          CameraControlsStore.setState({
            orbitControlsConfig: {
              ...CameraControlsStore.getState().orbitControlsConfig,
              enablePan: v,
            },
          })
          const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
          if (_orbitControlsRef.current === null) return
          _orbitControlsRef.current.enablePan = v
        }
      },
      enableZoom: {
        value: CameraControlsStore.getState().orbitControlsConfig.enableZoom,
        onChange: (v) => {
          CameraControlsStore.setState({
            orbitControlsConfig: {
              ...CameraControlsStore.getState().orbitControlsConfig,
              enableZoom: v,
            },
          })
          const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
          if (_orbitControlsRef.current === null) return
          _orbitControlsRef.current.enableZoom = v
        }
      },
      enableDamping: {
        value: CameraControlsStore.getState().orbitControlsConfig.enableDamping,
        onChange: (v) => {
          CameraControlsStore.setState({
            orbitControlsConfig: {
              ...CameraControlsStore.getState().orbitControlsConfig,
              enableDamping: v,
            },
          })
          const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
          if (_orbitControlsRef.current === null) return
          _orbitControlsRef.current.enableDamping = v
        }
      },
      dampingFactor: {
        value: CameraControlsStore.getState().orbitControlsConfig.dampingFactor,
        min: 0,
        max: 1,
        step: 0.001,
        onChange: (v) => {
          CameraControlsStore.setState({
            orbitControlsConfig: {
              ...CameraControlsStore.getState().orbitControlsConfig,
              dampingFactor: v,
            },
          })
          const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
          if (_orbitControlsRef.current === null) return
          _orbitControlsRef.current.dampingFactor = v
        }
      },
      maxDistance: {
        value: CameraControlsStore.getState().orbitControlsConfig.maxDistance,
        min: 0,
        max: 100,
        step: 0.001,
        onChange: (v) => {
          CameraControlsStore.setState({
            orbitControlsConfig: {
              ...CameraControlsStore.getState().orbitControlsConfig,
              maxDistance: v,
            },
          })
          const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
          if (_orbitControlsRef.current === null) return
          _orbitControlsRef.current.maxDistance = v
        }
      },
      minPolarAngle: {
        value: CameraControlsStore.getState().orbitControlsConfig.minPolarAngle,
        min: 0,
        max: Math.PI,
        step: 0.001,
        onChange: (v) => {
          CameraControlsStore.setState({
            orbitControlsConfig: {
              ...CameraControlsStore.getState().orbitControlsConfig,
              minPolarAngle: v,
            },
          })
          const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
          if (_orbitControlsRef.current === null) return
          _orbitControlsRef.current.minPolarAngle = v
        }
      },
      maxPolarAngle: {
        value: CameraControlsStore.getState().orbitControlsConfig.maxPolarAngle,
        min: 0,
        max: Math.PI,
        step: 0.001,
        onChange: (v) => {
          CameraControlsStore.setState({
            orbitControlsConfig: {
              ...CameraControlsStore.getState().orbitControlsConfig,
              maxPolarAngle: v,
            },
          })
          const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
          if (_orbitControlsRef.current === null) return
          _orbitControlsRef.current.maxPolarAngle = v
        }
      },
      zoomSpeed: {
        value: CameraControlsStore.getState().orbitControlsConfig.zoomSpeed,
        min: 0,
        max: 50,
        step: 0.001,
        onChange: (v) => {
          CameraControlsStore.setState({
            orbitControlsConfig: {
              ...CameraControlsStore.getState().orbitControlsConfig,
              zoomSpeed: v,
            },
          })
          const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
          if (_orbitControlsRef.current === null) return
          _orbitControlsRef.current.zoomSpeed = v
        }
      },
      cameraMode: {
        value: CameraControlsStore.getState().cameraMode,
        options: [CameraMode.THIRD_PERSON, CameraMode.FIRST_PERSON],
        onChange: (v) => {
          if (v === CameraMode.FIRST_PERSON) CameraControlsStore.getState().switchToFirstPerson()
          else CameraControlsStore.getState().switchToThirdPerson()
        },
      },
      cameraDistanceThreshold1or3Person: {
        value: CameraControlsStore.getState().cameraDistanceThreshold1or3Person,
        min: 0,
        max: 10,
        step: 0.001,
        onChange: (v) => {
          CameraControlsStore.setState({ cameraDistanceThreshold1or3Person: v })
        }
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


  // Whenever the user zooms in/out, we get the distance of camera from player and
  // update a state variable
  useEffect(() => {
    if (genericStore.getState().unityLikeControlsEnabled) return

    // Keeping a track of when the user is zooming or not
    CameraControlsStore.getState().isCameraMovingByUserZoom.current = isPinchOrScrollEventActive

    // checking when the scrolling ends
    if (isPinchOrScrollEventActive == false) {
      const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
      if (_orbitControlsRef.current === null) return

      const cameraDistanceFromPlayer = _orbitControlsRef.current.getDistance()
      CameraControlsStore.setState({ orbitDistance: cameraDistanceFromPlayer })

      if(
        cameraDistanceFromPlayer < CameraControlsStore.getState().cameraDistanceThreshold1or3Person &&
        CameraControlsStore.getState().cameraMode === CameraMode.THIRD_PERSON
      ) CameraControlsStore.getState().switchToFirstPerson()
        
      else if (
        cameraDistanceFromPlayer >= CameraControlsStore.getState().cameraDistanceThreshold1or3Person &&
        CameraControlsStore.getState().cameraMode === CameraMode.FIRST_PERSON
      ) CameraControlsStore.getState().switchToThirdPerson()
    }
  }, [isPinchOrScrollEventActive])

  // We want to disable orbit controls when the user is in presentation mode
  useEffect(() => {
    const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
    if (_orbitControlsRef.current === null) return

    if (isPresentationMode || inventoryConsoleHUDContext.isPresentationMode) {
      _orbitControlsRef.current.enabled = false
    } else {
      _orbitControlsRef.current.enabled = true

      // reset the FOV of the camera to the default value
      // This FOV might've been changed by the presentation mode controls
      ;(camera as THREE.PerspectiveCamera).fov =
        CameraControlsStore.getState().cameraMode == CameraMode.FIRST_PERSON
          ? CameraControlsStore.getState().firstPersonOrbitControlsConfig.fov
          : CameraControlsStore.getState().thirdPersonOrbitControlsConfig.fov
      camera.updateProjectionMatrix()
    }
  }, [isPresentationMode, inventoryConsoleHUDContext.isPresentationMode])

  useEffect(() => {
    if (genericStore.getState().unityLikeControlsEnabled) return
    CameraControlsStore.getState().isCameraMovingByUserDrag.current = isDragEventActive
  }, [isDragEventActive])

  // const checkForCameraMovingAndFirstOrThirdPerson = () => {
  //   if (
  //     orbitControlsRef.current === undefined ||
  //     orbitControlsRef.current === null
  //   )
  //     return
  //   const cameraDistanceFromPlayer: number | undefined =
  //     orbitControlsRef.current?.getDistance()
  //   if (
  //     cameraDistanceFromPlayer !== undefined &&
  //     cameraDistanceFromPlayer !== null
  //   ) {
  //     if (
  //       cameraDistanceFromPlayer <
  //         getOrbitConfig('cameraDistanceThreshold1or3Person') &&
  //       getOrbitConfig('cameraMode') === CameraMode.THIRD_PERSON &&
  //       CameraControlsStore.getState().isCameraMovingByUserZoom.current === true
  //     ) {
  //       switchToFirstPerson()
  //     } else if (
  //       cameraDistanceFromPlayer >=
  //         getOrbitConfig('cameraDistanceThreshold1or3Person') &&
  //       getOrbitConfig('cameraMode') === CameraMode.FIRST_PERSON
  //     )
  //       switchToThirdPerson()
  //   }
  // }

  // Updates the main OrbitControls component
  // We can pass in a list of fields to update, or if we don't pass anything,
  // we update all the allowed fields
  // const updateOrbitControls = (fieldsToUpdate?: {
  //   [key in keyof OrbitControls]?: number | boolean
  // }) => {
  //   if (
  //     orbitControlsRef.current === undefined ||
  //     orbitControlsRef.current === null
  //   )
  //     return
  //   if (fieldsToUpdate !== null && fieldsToUpdate !== undefined) {
  //     Object.keys(fieldsToUpdate).forEach((key) => {
  //       // @ts-ignore TODO: fix this
  //       ;(orbitControlsRef.current as unknown)[key] = fieldsToUpdate[key]
  //     })
  //   } else {
  //     const listOfAllowedKeys = [
  //       'enablePan',
  //       'enableZoom',
  //       'enableDamping',
  //       'dampingFactor',
  //       'maxDistance',
  //       'minPolarAngle',
  //       'maxPolarAngle',
  //       'zoomSpeed',
  //       'position',
  //       'rotation',
  //     ]
  //     listOfAllowedKeys.forEach((key) => {
  //       if (key === 'position' || key === 'rotation') {
  //         camera[key].set(
  //           getOrbitConfig(key).x,
  //           getOrbitConfig(key).y,
  //           getOrbitConfig(key).z,
  //         )
  //         return
  //       }

  //       // eslint-disable-next-line
  //       ;(orbitControlsRef.current as any)[key] = getOrbitConfig(
  //         key as ArgumentType<typeof getOrbitConfig>,
  //       )
  //     })
  //   }
  // }

  const updateOrbitControls = () => {
    const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
    if (_orbitControlsRef.current === null) return

    const _config = CameraControlsStore.getState().orbitControlsConfig
    _orbitControlsRef.current.enablePan = _config.enablePan
    _orbitControlsRef.current.enableZoom = _config.enableZoom
    _orbitControlsRef.current.enableDamping = _config.enableDamping
    _orbitControlsRef.current.dampingFactor = _config.dampingFactor
    _orbitControlsRef.current.maxDistance = _config.maxDistance
    _orbitControlsRef.current.minPolarAngle = _config.minPolarAngle
    _orbitControlsRef.current.maxPolarAngle = _config.maxPolarAngle
    _orbitControlsRef.current.zoomSpeed = _config.zoomSpeed
    ;(_orbitControlsRef.current.object as THREE.PerspectiveCamera).fov = _config.fov
    ;(_orbitControlsRef.current.object as THREE.PerspectiveCamera).position.fromArray(CameraControlsStore.getState().cameraPosition)
    ;(_orbitControlsRef.current.object as THREE.PerspectiveCamera).rotation.fromArray(CameraControlsStore.getState().cameraRotation)
    ;(_orbitControlsRef.current.object as THREE.PerspectiveCamera).updateProjectionMatrix()
  }

  // This will be called every frame
  // This code keeps the camera always looking at and following
  // the character's head

  useEffect(() => {
    const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef

    if (_orbitControlsRef.current == null) {
      // @ts-ignore TODO: fix this
      const newOrbitControls: OrbitControlsType = new OrbitControls(
        camera,
        gl.domElement,
      )
      _orbitControlsRef.current = newOrbitControls

      camera.position.fromArray(CameraControlsStore.getState().cameraPosition)
      camera.rotation.fromArray(CameraControlsStore.getState().cameraRotation)


      updateOrbitControls()
      // _orbitControlsRef.current.addEventListener(
      //   'change',
      //   checkForCameraMovingAndFirstOrThirdPerson,
      // )

      return
    }

    // If the start button has not been pressed, we will
    // initialize the orbit controls but keep them disabled.
    // we just want to set the camera's initial position and rotation
    // but if the start button has been pressed, we want orbit controls
    // to be enabled
    if (_orbitControlsRef.current !== null) {
      if (hasStartButtonBeenPressed === false) {
        _orbitControlsRef.current.enabled = false
      } else {
        _orbitControlsRef.current.enabled = true
        if (GesturesAndDeviceStore.getState().isTouchDevice)
          CameraControlsStore.getState().switchToFirstPerson()
      }
    }

    return () => {
      // orbitControlsRef.current?.removeEventListener(
      //   'change',
      //   checkForCameraMovingAndFirstOrThirdPerson,
      // )
      // newOrbitControls.dispose()
    }
  }, [camera, gl, hasStartButtonBeenPressed])

  const unityLikeControlsEnabled = genericStore((state) => state.unityLikeControlsEnabled)
  useEffect(() => {
    if (unityLikeControlsEnabled) {
      CameraControlsStore.getState().orbitControlsRef.current!.enabled = false
    } else {
      CameraControlsStore.getState().orbitControlsRef.current!.enabled = true
    }
  }, [unityLikeControlsEnabled])


  return {}
}

export default useCameraControls
