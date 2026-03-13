import { CharacterRef } from '@client/components/Character'
import { CameraControlsStore } from '@client/contexts/CameraControlsContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { MapStore } from '@client/contexts/MapContext'
import { TransformControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { button, folder, useControls } from 'leva'
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

type GroupData = {
  name: string
  collection: string
  triggerArea: {
    position: [number, number, number]
    scale: [number, number, number]
    rotation: [number, number, number]
    presentationCamera: {
      position: [number, number, number]
      target: [number, number, number]
      fov: number
    }
    showcaseCamera: {
      position: [number, number, number]
      target: [number, number, number]
      fov: number
    }
  }
  storeName: string
}

type CreateGroupState = {
  groupName: string
  collection: string
  triggerArea: {
    position: THREE.Vector3
    rotation: THREE.Euler
    scaleX: number
    scaleZ: number
  }
  presentationCamera: {
    position: THREE.Vector3
    target: THREE.Vector3
    fov: number
  }
  showcaseCamera: {
    position: THREE.Vector3
    target: THREE.Vector3
    fov: number
  }
  isTriggerAreaActive: boolean
  isPresentationModeActive: boolean
  isShowcaseModeActive: boolean
  isGizmoEnabled: boolean
  gizmoMode: 'translate' | 'rotate'
  setGroupName: (name: string) => void
  setCollection: (collection: string) => void
  setTriggerArea: (triggerArea: Partial<CreateGroupState['triggerArea']>) => void
  setPresentationCamera: (camera: Partial<CreateGroupState['presentationCamera']>) => void
  setShowcaseCamera: (camera: Partial<CreateGroupState['showcaseCamera']>) => void
  toggleTriggerArea: () => void
  togglePresentationModeState: () => void
  toggleShowcaseMode: () => void
  setGizmoMode: (mode: 'translate' | 'rotate') => void
  toggleGizmo: () => void
  cycleGizmoMode: () => void

  activeTransformControl: string | null
  setActiveTransformControl: (control: string | null) => void

  cameraStartPosition: THREE.Vector3 | null
  cameraStartRotation: THREE.Euler | null
  cameraStartFOV: number | null

  refreshDataFromDB: () => void
}

const useCreateGroupStore = create<CreateGroupState>((set) => ({
  groupName: '',
  collection: 'everlite',
  triggerArea: {
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    scaleX: 1,
    scaleZ: 1,
  },
  presentationCamera: {
    position: new THREE.Vector3(),
    target: new THREE.Vector3(),
    fov: 45,
  },
  showcaseCamera: {
    position: new THREE.Vector3(),
    target: new THREE.Vector3(),
    fov: 45,
  },
  isTriggerAreaActive: false,
  isPresentationModeActive: false,
  isShowcaseModeActive: false,
  isGizmoEnabled: false,
  gizmoMode: 'translate',
  setGroupName: (name) => set({ groupName: name }),
  setCollection: (collection) => set({ collection }),
  setTriggerArea: (triggerArea) => set((state) => ({ triggerArea: { ...state.triggerArea, ...triggerArea } })),
  setPresentationCamera: (camera) => set((state) => ({ presentationCamera: { ...state.presentationCamera, ...camera } })),
  setShowcaseCamera: (camera) => set((state) => ({ showcaseCamera: { ...state.showcaseCamera, ...camera } })),
  toggleTriggerArea: () => set((state) => ({ isTriggerAreaActive: !state.isTriggerAreaActive })),
  togglePresentationModeState: () => set((state) => ({ isPresentationModeActive: !state.isPresentationModeActive })),
  toggleShowcaseMode: () => set((state) => ({ isShowcaseModeActive: !state.isShowcaseModeActive })),
  setGizmoMode: (mode) => set({ gizmoMode: mode }),
  toggleGizmo: () => set((state) => ({ isGizmoEnabled: !state.isGizmoEnabled })),
  cycleGizmoMode: () => set((state) => ({
    gizmoMode: state.gizmoMode === 'translate' ? 'rotate' : 'translate'
  })),

  activeTransformControl: null as string | null,
  setActiveTransformControl: (control: string | null) => set({ activeTransformControl: control }),

  cameraStartPosition: null,
  cameraStartRotation: null,
  cameraStartFOV: null,

  refreshDataFromDB: () => {
    const currentStore = genericStore.getState().insideStore
    if (currentStore) {
      genericStore.setState({ debug_reFetchGroupData_forStore: currentStore })
      setTimeout(() => {
        genericStore.setState({ debug_reFetchGroupData_forStore: '' })
      }, 100) // Reset after a short delay
    }
  }
}))

type Props = {
  characterRef: React.MutableRefObject<CharacterRef | null>
}

const CreateGroupNew = (props: Props) => {
  const {
    groupName,
    collection,
    triggerArea,
    presentationCamera,
    showcaseCamera,
    isTriggerAreaActive,
    isPresentationModeActive,
    isShowcaseModeActive,
    gizmoMode,
    setGroupName,
    setCollection,
    setTriggerArea,
    setPresentationCamera,
    setShowcaseCamera,
    toggleTriggerArea,
    toggleShowcaseMode,
    toggleGizmo,
    cycleGizmoMode,
    activeTransformControl,
    setActiveTransformControl,
    togglePresentationModeState
  } = useCreateGroupStore(useShallow((state) => state))

  const togglePresentationMode = () => {
    const isPresentationModeActive = useCreateGroupStore.getState().isPresentationModeActive
    const cameraStartPosition = useCreateGroupStore.getState().cameraStartPosition
    const cameraStartRotation = useCreateGroupStore.getState().cameraStartRotation
    const cameraStartFOV = useCreateGroupStore.getState().cameraStartFOV

    if (isPresentationModeActive) {
      // Exit presentation mode
      if (cameraStartPosition && cameraStartRotation && cameraStartFOV) {
        camera.position.copy(cameraStartPosition)
        camera.rotation.copy(cameraStartRotation)
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.fov = cameraStartFOV
          camera.updateProjectionMatrix()
        }
      }
      toggleOrbitControls(true)
    } else {
      // Enter presentation mode

      useCreateGroupStore.setState({
        cameraStartPosition: camera.position.clone(),
        cameraStartRotation: camera.rotation.clone(),
      })

      if (camera instanceof THREE.PerspectiveCamera) {
        useCreateGroupStore.setState({ cameraStartFOV: camera.fov })
      }
      toggleOrbitControls(false)
    }
    togglePresentationModeState()
  }


  const toggleOrbitControls = (enabled: boolean) => {
    if (CameraControlsStore.getState().orbitControlsRef.current) {
      CameraControlsStore.getState().orbitControlsRef.current!.enabled = enabled
    }
  }

  const handleMeshClick = (meshName: string) => {
    setActiveTransformControl(meshName === activeTransformControl ? null : meshName)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '9') {
        toggleGizmo()
      } else if (event.key === '0') {
        cycleGizmoMode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [toggleGizmo, cycleGizmoMode])
  

  const triggerAreaRef = useRef<THREE.Mesh>(null)
  const presentationCameraRef = useRef<THREE.Mesh>(null)
  const presentationTargetRef = useRef<THREE.Mesh>(null)
  const showcaseCameraRef = useRef<THREE.Mesh>(null)
  const showcaseTargetRef = useRef<THREE.Mesh>(null)

  const { camera } = useThree()
  const mapScale = MapStore((state) => state.mapScale)

  const collections = ['everlite', 'rajwada', 'sutra', 'shagun', 'colors', 'spectra', 'cera', 'mariposa', 'lotus', 'sruti', 'other', 'love24']

  useEffect(() => {
    if (isTriggerAreaActive && triggerAreaRef.current) {
      setTriggerArea({ position: triggerAreaRef.current.position })
    }
  }, [isTriggerAreaActive])

  const createGroup = () => {
    const storeName = genericStore.getState().insideStore

    if (!storeName) { 
      console.error('Store name is not set. Please enter a store.')
      return
    }

    const {
      groupName,
      collection,
      triggerArea,
      presentationCamera,
      showcaseCamera,
    } = useCreateGroupStore.getState()

    const groupData: GroupData = {
      name: groupName,
      collection,
      triggerArea: {
        position: triggerArea.position.toArray().map(v => v / mapScale) as [number, number, number],
        scale: [triggerArea.scaleX / (2 * mapScale), 0.01, triggerArea.scaleZ / (2 * mapScale)],
        rotation: [triggerArea.rotation.toArray()[0], triggerArea.rotation.toArray()[1], triggerArea.rotation.toArray()[2]] as [number, number, number],
        presentationCamera: {
          position: presentationCamera.position.toArray().map(v => v / mapScale) as [number, number, number],
          target: presentationCamera.target.toArray().map(v => v / mapScale) as [number, number, number],
          fov: presentationCamera.fov,
        },
        showcaseCamera: {
          position: showcaseCamera.position.toArray().map(v => v / mapScale) as [number, number, number],
          target: showcaseCamera.target.toArray().map(v => v / mapScale) as [number, number, number],
          fov: showcaseCamera.fov,
        },
      },
      storeName,
    }

    const baseUrl = import.meta.env.VITE_FASTAPI_BACKEND_URL
    fetch(`${baseUrl}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Group created:', data)
        useCreateGroupStore.getState().refreshDataFromDB()
      })
      .catch((error) => console.error('Error creating group:', error))
  }

  useFrame((_, delta) => {
    if (isPresentationModeActive) {
      updateCameraMode(camera as THREE.PerspectiveCamera, presentationCamera, delta)
    } else if (isShowcaseModeActive) {
      updateCameraMode(camera as THREE.PerspectiveCamera, showcaseCamera, delta)
    }
  })

  const updateCameraMode = (
    camera: THREE.PerspectiveCamera,
    targetCamera: { position: THREE.Vector3; target: THREE.Vector3; fov: number },
    delta: number
  ) => {
    camera.position.lerp(targetCamera.position, 5 * delta)
    camera.lookAt(targetCamera.target)
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetCamera.fov, 5 * delta)
    camera.updateProjectionMatrix()
  }

  const initTriggerArea = () => {
    if (props.characterRef.current && props.characterRef.current.playerRef.current) {
      const playerPosition = props.characterRef.current.playerRef.current.position.clone()
      setTriggerArea({ position: playerPosition })
      toggleTriggerArea()
    } else {
      console.error('Character reference is not available')
    }
  }

  const resetTriggerArea = () => {
    if (props.characterRef.current && props.characterRef.current.playerRef.current) {
      const playerPosition = props.characterRef.current.playerRef.current.position.clone()
      setTriggerArea({ position: playerPosition })
    }
  }

  useControls('Create Group', () => ({
    'Group Name': {
      value: groupName,
      onChange: setGroupName,
    },
    'Collection': {
      value: collection,
      options: collections,
      onChange: setCollection,
    },
    'Init Trigger Area': button(initTriggerArea, { disabled: isTriggerAreaActive }),
    'Scale X': {
      value: triggerArea.scaleX,
      min: 0.1,
      max: 10,
      onChange: (value) => setTriggerArea({ scaleX: value }),
    },
    'Scale Z': {
      value: triggerArea.scaleZ,
      min: 0.1,
      max: 10,
      onChange: (value) => setTriggerArea({ scaleZ: value }),
    },
    'Reset Trigger Area': button(resetTriggerArea, { disabled: !isTriggerAreaActive }),
    'Presentation Settings': folder({
      'Spawn Presentation Look From Mesh (B)': button(() => {
        if (triggerAreaRef.current) {
          setPresentationCamera({ position: triggerAreaRef.current.position.clone().add(new THREE.Vector3(1, 2, 1)) })
        }
      }, { disabled: !isTriggerAreaActive }),
      'Spawn Presentation Look At Mesh (R)': button(() => {
        if (triggerAreaRef.current) {
          setPresentationCamera({ target: triggerAreaRef.current.position.clone() })
        }
      }, { disabled: !isTriggerAreaActive }),
      'Presentation FOV': {
        value: presentationCamera.fov,
        min: 10,
        max: 100,
        onChange: (value) => setPresentationCamera({ fov: value }),
      },
      'Toggle Presentation Mode': button(togglePresentationMode, { disabled: !isTriggerAreaActive }),
    }),
    'Showcase Settings': folder({
      'Spawn Showcase Look From Mesh (G)': button(() => {
        if (triggerAreaRef.current) {
          setShowcaseCamera({ position: presentationCameraRef.current?.position.clone().add(new THREE.Vector3(0, 0.1, 0)) })
        }
      }, { disabled: !isTriggerAreaActive }),
      'Spawn Showcase Look At Mesh (Y)': button(() => {
        if (triggerAreaRef.current) {
          setShowcaseCamera({ target: presentationCameraRef.current?.position.clone().add(new THREE.Vector3(0, 0.2, 0)) })
        }
      }, { disabled: !isTriggerAreaActive }),
      'Showcase FOV': {
        value: showcaseCamera.fov,
        min: 10,
        max: 100,
        onChange: (value) => setShowcaseCamera({ fov: value }),
      },
      'Enable Showcase Mode': button(toggleShowcaseMode, { disabled: !isTriggerAreaActive }),
    }),
    // 'Refresh Data From DB': button(refreshDataFromDB),
    'Create Group': button(createGroup, { disabled: !isTriggerAreaActive }),
  }), { collapsed: true }, [isTriggerAreaActive])

  return (
    <>
      {isTriggerAreaActive && (
        <mesh
          ref={triggerAreaRef}
          position={triggerArea.position}
          rotation={triggerArea.rotation}
          scale={[triggerArea.scaleX, 0.01, triggerArea.scaleZ]}
          onClick={() => handleMeshClick('triggerArea')}
        >
          <boxGeometry />
          <meshStandardMaterial color="hotpink" transparent opacity={0.5} />
        </mesh>
      )}
      {triggerAreaRef.current && isTriggerAreaActive && activeTransformControl === 'triggerArea' && (
        <TransformControls
          object={triggerAreaRef.current}
          mode={gizmoMode}
          onMouseDown={() => toggleOrbitControls(false)}
          onMouseUp={() => {
            toggleOrbitControls(true)
            if (triggerAreaRef.current) {
              setTriggerArea({
                position: triggerAreaRef.current.position,
                rotation: triggerAreaRef.current.rotation,
              })
            }
          }}
        />
      )}
      <mesh
        ref={presentationCameraRef}
        position={presentationCamera.position}
        onClick={() => handleMeshClick('presentationCamera')}
      >
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      {presentationCameraRef.current && activeTransformControl === 'presentationCamera' && (
        <TransformControls
          object={presentationCameraRef.current}
          mode="translate"
          onMouseDown={() => toggleOrbitControls(false)}
          onMouseUp={() => {
            toggleOrbitControls(true)
            if (presentationCameraRef.current) {
              setPresentationCamera({ position: presentationCameraRef.current.position })
            }
          }}
        />
      )}
      <mesh
        ref={presentationTargetRef}
        position={presentationCamera.target}
        onClick={() => handleMeshClick('presentationTarget')}
      >
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="red" />
      </mesh>
      {presentationTargetRef.current && activeTransformControl === 'presentationTarget' && (
        <TransformControls
          object={presentationTargetRef.current}
          mode="translate"
          onMouseDown={() => toggleOrbitControls(false)}
          onMouseUp={() => {
            toggleOrbitControls(true)
            if (presentationTargetRef.current) {
              setPresentationCamera({ target: presentationTargetRef.current.position })
            }
          }}
        />
      )}
      <mesh
        ref={showcaseCameraRef}
        position={showcaseCamera.position}
        onClick={() => handleMeshClick('showcaseCamera')}
      >
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="green" />
      </mesh>
      {showcaseCameraRef.current && activeTransformControl === 'showcaseCamera' && (
        <TransformControls
          object={showcaseCameraRef.current}
          mode="translate"
          onMouseDown={() => toggleOrbitControls(false)}
          onMouseUp={() => {
            toggleOrbitControls(true)
            if (showcaseCameraRef.current) {
              setShowcaseCamera({ position: showcaseCameraRef.current.position })
            }
          }}
        />
      )}
      <mesh
        ref={showcaseTargetRef}
        position={showcaseCamera.target}
        onClick={() => handleMeshClick('showcaseTarget')}
      >
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
      {showcaseTargetRef.current && activeTransformControl === 'showcaseTarget' && (
        <TransformControls
          object={showcaseTargetRef.current}
          mode="translate"
          onMouseDown={() => toggleOrbitControls(false)}
          onMouseUp={() => {
            toggleOrbitControls(true)
            if (showcaseTargetRef.current) {
              setShowcaseCamera({ target: showcaseTargetRef.current.position })
            }
          }}
        />
      )}
    </>
  )
}

export default CreateGroupNew