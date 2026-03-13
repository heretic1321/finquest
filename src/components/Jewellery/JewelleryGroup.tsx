import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import {
  MutableRefObject,
  Suspense,
  useEffect,
  // useRef,
  useState,
} from 'react'
import * as THREE from 'three'
import { Euler, Vector3 } from 'three'

import JewelleryShowcaseTriggerArea from '@client/components/JewelleryShowcaseTriggerArea'
import { damp, damp3, dampE, dampLookAt } from 'maath/easing'
import { CharacterRef } from '@client/components/Character'
import JewelleryItem from '@client/components/Jewellery/JewelleryItem'
import CanvasConfig from '@client/config/Canvas'
import { showcaseOffset } from '@client/config/JewelleryGroups'
import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { CameraControlsStore } from '@client/contexts/CameraControlsContext'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { cleanupResources, getUserID } from '@client/utils/helperFunctions'
import { IGroupWithItems } from '@client/utils/types/collectionAPI'
import { useShallow } from 'zustand/react/shallow'
import { SoundsStore } from '../Sounds'
import { trackEvent } from '@client/utils/api'
// import { button, useControls } from 'leva'
// import { genericStore } from '@client/contexts/GlobalStateContext'
// import { MapStore } from '@client/contexts/MapContext'

/**
 * This component is used to render a group of jewellery items.
 * Currently it offers no extra functionality over the JewelleryItem component.
 * But this will soon be extended to house things like jewellery cases, trigger areas, etc
 * - TJewelleryGroup: The jewellery group to render.
 *                    It contains details of a group and
 *                    the items in that group
 * - envMapTexture: The resharable environment map texture to use for the jewellery
 * - whiteGoldMaterial: The white gold resharable material to use for the jewellery
 * - yellowGoldMaterial: The yellow gold resharable material to use for the jewellery
 * - diamondComponentMesh: The mesh of the reusable diamond component to use for the diamonds
 *                         on the jewellery
 */
const JewelleryGroup = (
  props: IGroupWithItems & {
    characterRef: MutableRefObject<CharacterRef | null>
    groupIndex: number // index of this jewellery group
    storeName: string
    groups: IGroupWithItems[]
  },
) => {
  // Show/hide the transform controls of the trigger area (for debugging purposes)
  const [showTriggerTransformControls] = useState<boolean>(false)

  // The position of the camera when presentation mode is activated
  const [cameraStartingPosition, setCameraStartingPosition] =
    useState<Vector3 | null>(null)
  // The rotation of the camera when presentation mode is activated
  const [cameraStartingRotation, setCameraStartingRotation] =
    useState<Euler | null>(null)
  // The FOV of the camera when presentation mode is activated
  const [cameraStartingFov, setCameraStartingFov] = useState<number | null>(
    null,
  )


  const { camera } = useThree()

  // state variable for setting/unsetting of presentation/showcase mode and also to communicate
  // to other components that presentation/showcase mode is active, starting up or shutting down
  const {
    // presentation mode active or not
    isPresentationMode,
    setIsPresentationMode,

    // presentation mode shut down
    isPresentationModeShuttingDown,
    setIsPresentationModeShuttingDown,

    // presentation mode start up
    isPresentationModeStartingUp,
    setIsPresentationModeStartingUp,

    // which jewellery group is currently selected for presentation mode
    presentationModeActiveGroupIndex,
    setPresentationModeActiveGroupIndex,

    // showcase mode active or not
    isShowcaseMode,
    setIsShowcaseMode,

    // showcase mode shut down
    isShowcaseModeShuttingDown,
    setIsShowcaseModeShuttingDown,
    isTransitionFromPresentationModeComplete,
    setIsTransitionFromPresentationModeComplete,
    setIsTransitionFromShowcaseModeComplete,
    isTransitionFromShowcaseModeComplete,

    setIsTransitionToPresentationModeComplete,
    setIsTransitionToShowcaseModeComplete,
    isTransitionToPresentationModeComplete,
    isTransitionToShowcaseModeComplete,

    // showcase mode start up
    isShowcaseModeStartingUp,
    setIsShowcaseModeStartingUp,

    // showcase active item index
    showcaseActiveItemIndex,

    // showcase active group index
    showcaseActiveGroupIndex,
    setShowcaseActiveGroupIndex,

    isSelectedShowcaseTranslatingPrevious,
    setIsSelectedShowcaseTranslatingPrevious,
    isSelectedShowcaseTranslatingNext,
    setIsSelectedShowcaseTranslatingNext,
    isOpenShowcasePromptClicked,
    setIsOpenShowcasePromptClicked,
    isOpenShowcasePromptShown,
    setIsOpenShowcasePromptShown ,
    groupIndexForOpenShowcasePrompt,
    setGroupIndexForOpenShowcasePrompt,
  } = HUDStore(
    useShallow((state) => ({
      isPresentationMode: state.isPresentationMode,
      setIsPresentationMode: state.setIsPresentationMode,

      isPresentationModeShuttingDown: state.isPresentationModeShuttingDown,
      setIsPresentationModeShuttingDown:
        state.setIsPresentationModeShuttingDown,

      isPresentationModeStartingUp: state.isPresentationModeStartingUp,
      setIsPresentationModeStartingUp: state.setIsPresentationModeStartingUp,

      presentationModeActiveGroupIndex: state.presentationModeActiveGroupIndex,
      setPresentationModeActiveGroupIndex:
        state.setPresentationModeActiveGroupIndex,

      isShowcaseMode: state.isShowcaseMode,
      setIsShowcaseMode: state.setIsShowcaseMode,

      isShowcaseModeShuttingDown: state.isShowcaseModeShuttingDown,
      setIsShowcaseModeShuttingDown: state.setIsShowcaseModeShuttingDown,
      isTransitionFromPresentationModeComplete:
        state.isTransitionFromPresentationModeComplete,
      setIsTransitionFromPresentationModeComplete:
        state.setIsTransitionFromPresentationModeComplete,
      isTransitionFromShowcaseModeComplete:
        state.isTransitionFromShowcaseModeComplete,
      setIsTransitionFromShowcaseModeComplete:
        state.setIsTransitionFromShowcaseModeComplete,

      isTransitionToPresentationModeComplete:
        state.isTransitionToPresentationModeComplete,
      setIsTransitionToPresentationModeComplete:
        state.setIsTransitionToPresentationModeComplete,
      isTransitionToShowcaseModeComplete:
        state.isTransitionToShowcaseModeComplete,
      setIsTransitionToShowcaseModeComplete:
        state.setIsTransitionToShowcaseModeComplete,

      isShowcaseModeStartingUp: state.isShowcaseModeStartingUp,
      setIsShowcaseModeStartingUp: state.setIsShowcaseModeStartingUp,

      showcaseActiveItemIndex: state.showcaseActiveItemIndex,

      showcaseActiveGroupIndex: state.showcaseActiveGroupIndex,
      setShowcaseActiveGroupIndex: state.setShowcaseActiveGroupIndex,

      isSelectedShowcaseTranslatingPrevious:
        state.isSelectedShowcaseTranslatingPrevious,
      setIsSelectedShowcaseTranslatingPrevious:
        state.setIsSelectedShowcaseTranslatingPrevious,
      isSelectedShowcaseTranslatingNext:
        state.isSelectedShowcaseTranslatingNext,
      setIsSelectedShowcaseTranslatingNext:
        state.setIsSelectedShowcaseTranslatingNext,
      isOpenShowcasePromptShown: state.isOpenShowcasePromptShown,
      setIsOpenShowcasePromptShown: state.setIsOpenShowcasePromptShown,
      isOpenShowcasePromptClicked: state.isOpenShowcasePromptClicked,
      setIsOpenShowcasePromptClicked: state.setIsOpenShowcasePromptClicked,
      groupIndexForOpenShowcasePrompt: state.groupIndexForOpenShowcasePrompt,
      setGroupIndexForOpenShowcasePrompt: state.setGroupIndexForOpenShowcasePrompt,
    })),
  )

  const breakpoint = GesturesAndDeviceStore((state) => state.breakpoint)

  // The position and target of the camera when in presentation mode. Setting as state vectors here
  // because we need these vectors in the frameloop and we should not create the vectors in the frame
  // loop as it will cause a lot of garbage collection
  const [presentationCameraPosition, setPresentationCameraPosition] =
    useState<Vector3 | null>(null)
  const [presentationCameraTarget, setPresentationCameraTarget] =
    useState<Vector3 | null>(null)

  // The position and target of the camera when in showcase mode. Setting as state vectors here
  // because we need these vectors in the frameloop and we should not create the vectors in the frame
  // loop as it will cause a lot of garbage collection
  const [showcaseCameraPosition, setShowcaseCameraPosition] =
    useState<Vector3>()
  const [showcaseCameraTarget, setShowcaseCameraTarget] = useState<Vector3>()

  useEffect(() => {
    setPresentationCameraPosition(
      new Vector3(...props.triggerArea.presentationCamera.position),
    )
    setPresentationCameraTarget(
      new Vector3(...props.triggerArea.presentationCamera.target),
    )

    setShowcaseCameraPosition(
      new Vector3(...props.triggerArea.showcaseCamera.position),
    )
    setShowcaseCameraTarget(
      new Vector3(...props.triggerArea.showcaseCamera.target),
    )
  }, [])

  // we're storing the camera's starting position, rotation and FOV right before the presentation mode is activated
  useEffect(() => {
    if (isPresentationMode) {
      setCameraStartingPosition(camera.position.clone())
      setCameraStartingRotation(camera.rotation.clone())
      setCameraStartingFov(CanvasConfig.camera.fov)
      if (camera instanceof THREE.PerspectiveCamera) {
        setCameraStartingFov(camera.fov)
      }
    }
  }, [isPresentationMode])

  useEffect(() => {
    setShowcaseCameraTarget(
      new Vector3(...props.triggerArea.showcaseCamera.target),
    )
  }, [showcaseActiveGroupIndex])

  // Disable orbit controls when transform controls are requested on the trigger area
  // (Only in debug mode)
  useEffect(() => {
    const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
    if (_orbitControlsRef.current !== null)
      _orbitControlsRef.current.enabled = !showTriggerTransformControls
  }, [showTriggerTransformControls])

  const moveCamera = (
    camera: THREE.PerspectiveCamera,
    properties: {
      fov?: number
      position?: number[]
      rotation?: THREE.Euler
      target?: Vector3
    },
    delta: number,
    smoothTime = 0.3,
  ) => {
    let isPositionDamping = false
    let isRotationDamping = false
    let isFovDamping = false

    if (properties.position) {
      const positionVector = new Vector3().fromArray(properties.position)
      isPositionDamping = damp3(
        camera.position,
        positionVector,
        smoothTime,
        delta,
      )
    }

    if (properties.rotation) {
      const rotationEuler = properties.rotation
      isRotationDamping = dampE(
        camera.rotation,
        rotationEuler,
        smoothTime,
        delta,
      )
    }

    if (properties.fov) {
      isFovDamping = damp(camera, 'fov', properties.fov, smoothTime, delta)
      camera.updateProjectionMatrix() // required after changing fov
    }

    if (properties.target) {
      dampLookAt(camera, properties.target, 0.15, delta)
    }
    return isPositionDamping || isRotationDamping || isFovDamping
  }

  // a helper variable to check if the camera is damping
  let isDamping = false

  const updateCameraPresentationModeStartUp = (
    camera: THREE.PerspectiveCamera,
    delta: number,
  ) => {
    if (!presentationCameraTarget) return
    if (!isPresentationMode) {
      setIsPresentationMode(true)
      setIsOpenShowcasePromptShown(false)
    }
    isDamping = moveCamera(
      camera,
      {
        fov: props.triggerArea.presentationCamera.fov,
        position: props.triggerArea.presentationCamera.position,
        target: presentationCameraTarget,
      },
      delta,
    )
    if (isDamping === false) {
      setIsPresentationModeStartingUp(false)
      setIsTransitionToPresentationModeComplete(true)
    }
  }

  const updateCameraPresentationModeShutDown = (
    camera: THREE.PerspectiveCamera,
    delta: number,
  ) => {
    if (!cameraStartingPosition || !cameraStartingRotation) return
    isDamping = moveCamera(
      camera,
      {
        fov: cameraStartingFov || CanvasConfig.camera.fov,
        position: cameraStartingPosition.toArray(),
        rotation: cameraStartingRotation,
      },
      delta,
    )

    if (isDamping === false) {
      setIsPresentationModeShuttingDown(false)
      setIsTransitionFromPresentationModeComplete(true)
      setIsPresentationMode(false)
      setIsOpenShowcasePromptShown(true)
      setPresentationModeActiveGroupIndex(-1)
    }
  }

  const updateCameraShowcaseModeStartUp = (
    camera: THREE.PerspectiveCamera,
    delta: number,
  ) => {
    if (!showcaseCameraPosition || !showcaseCameraTarget || !breakpoint) return
    if (!isShowcaseMode) setIsShowcaseMode(true)

    isDamping = moveCamera(
      camera,
      {
        fov: props.triggerArea.showcaseCamera.fov,
        position: showcaseCameraPosition.toArray(),
        target: showcaseCameraTarget
          .clone()
          .add(new Vector3().fromArray(showcaseOffset[breakpoint])),
      },
      delta,
    )

    if (isDamping === false) {
      setIsShowcaseModeStartingUp(false)
      setIsTransitionToShowcaseModeComplete(true)
    }
  }

  const updateCameraShowcaseModeShutDown = (
    camera: THREE.PerspectiveCamera,
    delta: number,
  ) => {
    if (!presentationCameraPosition || !presentationCameraTarget) return
    isDamping = moveCamera(
      camera,
      {
        fov: props.triggerArea.presentationCamera.fov,
        position: presentationCameraPosition.toArray(),
        target: presentationCameraTarget,
      },
      delta,
    )

    if (isDamping === false) {
      setIsShowcaseModeShuttingDown(false)
      setIsShowcaseMode(false)
      setIsTransitionFromShowcaseModeComplete(true)
    }
  }

  const updateCameraShowcaseTranslation = (
    camera: THREE.PerspectiveCamera,
    delta: number,
    direction: 'previous' | 'next',
  ) => {
    const desiredNewIndex =
      direction === 'previous'
        ? (showcaseActiveGroupIndex - 1 + props.groups.length) %
          props.groups.length
        : (showcaseActiveGroupIndex + 1) % props.groups.length

    const newPosition =
      props.groups[desiredNewIndex].triggerArea.presentationCamera.position
    const newTarget = new Vector3().fromArray(
      props.groups[desiredNewIndex].triggerArea.presentationCamera.target,
    )

    isDamping = moveCamera(
      camera,
      {
        position: newPosition,
        target: newTarget,
      },
      delta,
    )

    if (isDamping === false) {
      setIsSelectedShowcaseTranslatingPrevious(false)
      setIsSelectedShowcaseTranslatingNext(false)
      setPresentationModeActiveGroupIndex(desiredNewIndex)
      setShowcaseActiveGroupIndex(desiredNewIndex)
    }
  }

  const updateCameraTarget = () => {
    if (!showcaseCameraTarget || !breakpoint) return
    camera.lookAt(
      new Vector3(...props.triggerArea.showcaseCamera.target)
        .clone()
        .add(new Vector3().fromArray(showcaseOffset[breakpoint])),
    )
  }

  useFrame((_state, delta) => {
    if (!genericStore.getState().isTabFocused) return
    if (!(camera instanceof THREE.PerspectiveCamera)) return
    // we don't want to move the camera for this jewellery group when this group is not the selected one
    if (presentationModeActiveGroupIndex !== props.groupIndex) return

    const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
    if (_orbitControlsRef.current === null) return

    if (
      presentationCameraPosition === null ||
      presentationCameraTarget === null ||
      showcaseCameraPosition === null ||
      showcaseCameraPosition === undefined ||
      showcaseCameraTarget === null ||
      showcaseCameraTarget === undefined ||
      breakpoint === null ||
      breakpoint === undefined
    )
      return

    if (isPresentationModeStartingUp) {
      updateCameraPresentationModeStartUp(camera, delta)
    } else if (isTransitionToPresentationModeComplete) {
      setIsTransitionToPresentationModeComplete(false)
    } else if (isPresentationModeShuttingDown) {
      updateCameraPresentationModeShutDown(camera, delta)
    } else if (isTransitionFromPresentationModeComplete) {
      setIsTransitionFromPresentationModeComplete(false)
    } else if (isSelectedShowcaseTranslatingPrevious) {
      updateCameraShowcaseTranslation(camera, delta, 'previous')
    } else if (isSelectedShowcaseTranslatingNext) {
      updateCameraShowcaseTranslation(camera, delta, 'next')
    }

    if (isShowcaseModeStartingUp) {
      updateCameraShowcaseModeStartUp(camera, delta)
    } else if (isTransitionToShowcaseModeComplete) {
      setIsTransitionToShowcaseModeComplete(false)
    } else if (isTransitionFromShowcaseModeComplete) {
      setIsTransitionFromShowcaseModeComplete(false)
    } else if (isShowcaseModeShuttingDown) {
      updateCameraShowcaseModeShutDown(camera, delta)
    }
  })
  useEffect(() => {
    if (isOpenShowcasePromptShown && isOpenShowcasePromptClicked && props.groupIndex === groupIndexForOpenShowcasePrompt) {
      startPresentationMode()
    }
  }, [isOpenShowcasePromptClicked])
  const startPresentationMode = () => {
    SoundsStore.getState().playClickSoundOnce()
    trackEvent(
      'Presentation_Interactions',
      {
        action: 'Open_Showcase',
        showcase_name: props.name || 'Unknown Showcase',
        store_name: props.storeName || 'Unknown Store',
      },
      getUserID(),
    )
    // enable presentation mode
    setIsPresentationModeStartingUp(true)
    // hide prompt when in presentation mode
    setIsOpenShowcasePromptShown(false)
    // set the showcase active group index to the current group index
    setShowcaseActiveGroupIndex(props.groupIndex)
    // set the presentation mode active group index to the current group index
    // so that other jewellery group components know that this group is selected for presentation mode
    setPresentationModeActiveGroupIndex(props.groupIndex)
    setIsOpenShowcasePromptClicked(false)
  }

  useEffect(() => {
    if (!props.slots || showcaseActiveGroupIndex === -1) return

    props.slots.map((slot) => {
      if (slot.item)
        useGLTF.preload(
          `${staticResourcePaths.s3_bucket_cdn}${slot.item.sku}_l.glb`,
        )
    })
  }, [showcaseActiveGroupIndex])

  useEffect(() => {
    if (
      isShowcaseMode &&
      showcaseActiveItemIndex !== -1 &&
      showcaseActiveGroupIndex !== -1 &&
      showcaseActiveGroupIndex === props.groupIndex
    ) {
      updateCameraTarget()
    }
  }, [
    breakpoint,
    isShowcaseMode,
    showcaseActiveItemIndex,
    showcaseActiveGroupIndex,
  ])

  useEffect(() => {
    if (isShowcaseModeShuttingDown) {
      // this jewellery groups will clean up its own high poly resources
      if (props.groupIndex === showcaseActiveGroupIndex) {
        props.slots.map((slot) => {
          slot.item?.highPolyScene?.traverse((child) => {
            cleanupResources(child)
          })
        })
      }
    }
  }, [isShowcaseModeShuttingDown])

  const [
    planeRadiusXState,
    // setPlaneRadiusXState
  ] = useState<number>(props.triggerArea.scale[0] ?? 10)
  const [
    planeRadiusYState,
    // setPlaneRadiusYState
  ] = useState<number>(props.triggerArea.scale[2] ?? 10)
  const [planeRotationYState] = useState<number>(
    props.triggerArea.rotation[1] ?? 0,
  )

  // for dev mode to adjust the triggger areas
  // const [areTransformControlsShown, setAreTransformControlsShown] = useState(false)
  // const [transformControlsMode, setTransformControlsMode] = useState<'translate' | 'rotate' | 'scale'>('translate')
  // const isDebugMode = genericStore((state) => state.isDebugMode)
  // const tempPositionReference = useRef<[number, number, number]>([0,0,0])
  // const tempRadiusXReference = useRef<number>(props.triggerArea.radiusX ?? 10)
  // const tempRadiusYReference = useRef<number>(props.triggerArea.radiusY ?? 10)
  // const tempRotationYReference = useRef<number>(props.triggerArea.newRotationY ?? 0)
  // const transformControlsCycleListener = (e: KeyboardEvent) => {
  //   if (e.key.toLowerCase() === 'r') {
  //     setTransformControlsMode((prev) => {
  //       if (prev === 'translate') return 'rotate'
  //       if (prev === 'rotate') return 'scale'
  //       if (prev === 'scale') return 'translate'
  //       return 'translate'
  //     })
  //   }
  // }

  // useControls(
  //   `JG-${props._id}`,
  //   () => ({
  //     transformControlsMode: {
  //       options: ['translate', 'rotate', 'scale'],
  //       value: 'translate',
  //       onChange: (value) => {
  //         setTransformControlsMode(value)
  //       }
  //     },
  //     showTransformControls: {
  //       value: areTransformControlsShown,
  //       onChange: (value) => {
  //         setAreTransformControlsShown(value)
  //         // add an event listener to the 'r' keydown event which will cycle through the transform controls modes
  //         if (value) {
  //           window.addEventListener('keydown', transformControlsCycleListener)
  //         } else {
  //           window.removeEventListener('keydown', transformControlsCycleListener)
  //         }
  //       },
  //     },
  //     radiusX: {
  //       min: 0,
  //       max: 15,
  //       step: 0.01,
  //       value: planeRadiusXState,
  //       onChange: (value) => {
  //         setPlaneRadiusXState(value)
  //         tempRadiusXReference.current = value
  //       },
  //     },
  //     radiusY: {
  //       min: 0,
  //       max: 15,
  //       step: 0.01,
  //       value: planeRadiusYState,
  //       onChange: (value) => {
  //         setPlaneRadiusYState(value)
  //         tempRadiusYReference.current = value
  //       },
  //     },
  //     sendDataToDB: button(() => {
  //       // console.log({
  //       //   tempPositionReference,
  //       //   tempRadiusReference
  //       // })

  //       const data = {
  //         position: tempPositionReference.current.map(num => num / MapStore.getState().mapScale),
  //         radiusX: tempRadiusXReference.current,
  //         radiusY: tempRadiusYReference.current,
  //         rotationY: tempRotationYReference.current
  //       }

  //       fetch(
  //         'http://localhost:8000/groups/triggerAreaTransform/' + props._id,
  //         {
  //           method: 'PATCH',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify(data),
  //         }
  //       )

  //     }),
  //     sendOrderToDB: button(async () => {
  //       const res = await fetch(
  //         'http://localhost:8000/groups/addOrder/' + props._id,
  //         {
  //           method: 'PATCH',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify({storeName: props.storeName}),
  //         }
  //       )

  //       console.log(await res.json())
  //     }),
  //     sendScaleFactorForAllLowPolyInThisGroup: button(async () => {
  //       props.groups[props.groupIndex].slots.forEach(async (slot) => {
  //         if (!slot.item) return
  //         await fetch (
  //           'http://localhost:8000/items/updateLowPolyModelConfig/' + slot.item?._id,
  //           {
  //             method: 'PATCH',
  //             headers: {
  //               'Content-Type': 'application/json',
  //             },
  //             body: JSON.stringify({
  //               scaleFactor: 2
  //             })
  //           }
  //         )
  //       })
  //     })
  //   }),
  //   {
  //     collapsed: true,
  //     render: () => {
  //       return isDebugMode || false
  //     },
  //   },
  // )

  const isDebugMode = genericStore((state) => state.isDebugMode)


  return (
    <>
      <JewelleryShowcaseTriggerArea
        _id={props._id}
        target={
          props.characterRef.current?.roundedBoxRef.current
            ? props.characterRef.current?.roundedBoxRef.current
            : null
        }
        name={props.name}
        radiusX={planeRadiusXState}
        radiusY={planeRadiusYState}
        rotationY={planeRotationYState}
        position={props.triggerArea.newPosition ?? props.triggerArea.position}
        onInside={() => {
          setIsOpenShowcasePromptShown(true)
          setGroupIndexForOpenShowcasePrompt(props.groupIndex)
        }}
        onOutside={() => {
          setIsOpenShowcasePromptShown(false)
          setGroupIndexForOpenShowcasePrompt(-1)
        }}
        onClick={() => {
          genericStore.setState({ debug_clickedShowcaseTriggerArea: props._id })
        }}

        // for dev mode to adjust the triggger areas

        // areTransformControlsShown={areTransformControlsShown}
        // transformControlsMode={transformControlsMode}
        // tempPositionReference={tempPositionReference}
        // tempRadiusXReference={tempRadiusXReference}
        // tempRadiusYReference={tempRadiusYReference}
        // tempRotationYReference={tempRotationYReference}
      />

      {props.slots.map((slot, index) => {
        if (!isDebugMode) {
          if (
            !slot.item ||
            (isShowcaseMode &&
              !isShowcaseModeShuttingDown &&
              !isShowcaseModeStartingUp)
          )
            return null
        } else {
          if (!slot.item ||
            (isShowcaseMode &&
              !isShowcaseModeShuttingDown &&
              !isShowcaseModeStartingUp)) return null
        }

        return (
          <Suspense fallback={null} key={index}>
            <JewelleryItem
              index={index}
              groupIndex={props.groupIndex}
              {...slot.item}
              position={slot.itemTransform[slot.item.itemType]?.position}
              rotation={slot.itemTransform[slot.item.itemType]?.rotation}
              scale={slot.itemTransform[slot.item.itemType]?.scale}
              storeName={props.storeName}
              groups={props.groups}
            />
          </Suspense>
        )
      })}
    </>
  )
}

export default JewelleryGroup
