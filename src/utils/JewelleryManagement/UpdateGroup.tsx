import { CameraControlsStore } from '@client/contexts/CameraControlsContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { MapStore } from '@client/contexts/MapContext'
import { TransformControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { button, useControls } from 'leva'
import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

// Types
type GroupData = {
  name: string
  collection: string
  triggerArea: {
    newPosition?: [number, number, number]
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
  _id: string
}

type UpdateGroupState = {
  groups: GroupData[]
  selectedGroup: GroupData | null
  updatedGroupName: string
  collection: string
  triggerArea: {
    newPosition?: [number, number, number]
    position: THREE.Vector3
    rotation: THREE.Euler
    scale: THREE.Vector3
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
  isGizmoEnabled: boolean
  gizmoMode: 'translate' | 'rotate' | 'scale'
  activeTransformControl: string | null
  isCameraInPresentationMode: boolean
  isCameraInShowcaseMode: boolean

  cameraStartPosition: THREE.Vector3 | null
  cameraStartRotation: THREE.Euler | null
  cameraStartFOV: number | null

  refreshDataFromDB: () => void
}

// Zustand store
const useUpdateGroupStore = create<UpdateGroupState>(() => ({
  groups: [],
  selectedGroup: null,
  updatedGroupName: '',
  collection: '',
  triggerArea: {
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    scale: new THREE.Vector3(1, 0.01, 1),
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
  isGizmoEnabled: false,
  gizmoMode: 'translate',
  activeTransformControl: null,
  isCameraInPresentationMode: false,
  isCameraInShowcaseMode: false,

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

const UpdateGroupNew: React.FC = () => {
  const {
    groups,
    selectedGroup,
    updatedGroupName,
    collection,
    triggerArea,
    presentationCamera,
    showcaseCamera,
    isGizmoEnabled,
    gizmoMode,
    activeTransformControl,
    isCameraInPresentationMode,
    isCameraInShowcaseMode,
  } = useUpdateGroupStore(useShallow((state) => state))

  const { camera } = useThree()

  const triggerAreaRef = useRef<THREE.Mesh>(null)
  const presentationCameraRef = useRef<THREE.Mesh>(null)
  const presentationTargetRef = useRef<THREE.Mesh>(null)
  const showcaseCameraRef = useRef<THREE.Mesh>(null)
  const showcaseTargetRef = useRef<THREE.Mesh>(null)

  const mapScale = MapStore((state) => state.mapScale)
  const storeName = genericStore((state) => state.insideStore)

  useEffect(() => {
    fetchGroups()
  }, [storeName])

  const fetchGroups = async () => {
    if (!storeName) {
      console.error('Store name is not set. Please enter a store.')
      return
    }

    const baseUrl = import.meta.env.VITE_FASTAPI_BACKEND_URL
    const url = `${baseUrl}/groups/groups_by_store_name?store_name=${storeName}`

    try {
      const response = await fetch(url)
      const data = await response.json()
      useUpdateGroupStore.setState({ groups: data.groups })
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }

  const updateGroup = async () => {
    const storeName = genericStore.getState().insideStore
    const selectedGroup = useUpdateGroupStore.getState().selectedGroup

    if (!selectedGroup) {
      console.error('No group selected')
      return
    }

    if (!storeName) {
      console.error('Store name is not set. Please enter a store.')
      return
    }

    const {
      updatedGroupName,
      collection,
      triggerArea,
      presentationCamera,
      showcaseCamera,
    } = useUpdateGroupStore.getState()

    const updatedGroup: GroupData = {
      ...selectedGroup,
      name: updatedGroupName || selectedGroup.name,
      collection,
      triggerArea: {
        position: triggerArea.position.toArray().map(v => v / mapScale) as [number, number, number],
        scale: triggerArea.scale.toArray() as [number, number, number],
        rotation: [triggerArea.rotation.x, triggerArea.rotation.y, triggerArea.rotation.z],
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
    const url = `${baseUrl}/groups/${selectedGroup._id}`

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGroup),
      })
      await response.json()
      fetchGroups() // Refresh the groups list
      useUpdateGroupStore.getState().refreshDataFromDB()
    } catch (error) {
      console.error('Error updating group:', error)
    }
  }

  const handleMeshClick = (meshName: string) => {
    console.log('Clicked:', meshName)
    useUpdateGroupStore.setState({ activeTransformControl: meshName === activeTransformControl ? null : meshName })
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '9') {
        useUpdateGroupStore.setState((state) => ({ isGizmoEnabled: !state.isGizmoEnabled }))
      } 
      // else if (event.key === '0') {
      //   useUpdateGroupStore.setState((state) => ({
      //     gizmoMode: state.gizmoMode === 'translate' ? 'rotate' : state.gizmoMode === 'rotate' ? 'scale' : 'translate'
      //   }))
      // }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useFrame((_, delta) => {
    if (camera instanceof THREE.PerspectiveCamera) {
      if (isCameraInPresentationMode) {
        updateCameraMode(camera, presentationCamera, delta)
      } else if (isCameraInShowcaseMode) {
        updateCameraMode(camera, showcaseCamera, delta)
      }
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

  const toggleCameraMode = (mode: 'presentation' | 'showcase') => {
    const {
      cameraStartPosition,
      cameraStartRotation,
      cameraStartFOV,
      isCameraInPresentationMode,
      isCameraInShowcaseMode,
    } = useUpdateGroupStore.getState()

    if (camera instanceof THREE.PerspectiveCamera) {
      if (!cameraStartPosition || !cameraStartRotation || !cameraStartFOV) {
        useUpdateGroupStore.setState({
          cameraStartPosition: camera.position.clone(),
          cameraStartRotation: camera.rotation.clone(),
          cameraStartFOV: camera.fov,
        })
      }

      const isEnteringMode = mode === 'presentation' ? !isCameraInPresentationMode : !isCameraInShowcaseMode

      if (isEnteringMode) {
        useUpdateGroupStore.setState({
          isCameraInPresentationMode: mode === 'presentation',
          isCameraInShowcaseMode: mode === 'showcase',
        })
      } else {
        camera.position.copy(useUpdateGroupStore.getState().cameraStartPosition!)
        camera.rotation.copy(useUpdateGroupStore.getState().cameraStartRotation!)
        camera.fov = cameraStartFOV ?? 45
        camera.updateProjectionMatrix()

        useUpdateGroupStore.setState({
          isCameraInPresentationMode: false,
          isCameraInShowcaseMode: false,
        })
      }

      toggleOrbitControls(!isEnteringMode)
    }
  }

  const toggleOrbitControls = (enabled: boolean) => {
    if (CameraControlsStore.getState().orbitControlsRef.current) {
      CameraControlsStore.getState().orbitControlsRef.current!.enabled = enabled
    }
  }

  const groupOptions = useMemo(() => {
    return ['Select Group', ...groups.map(g => g._id)]
  }, [groups])

  const groupLabels = useMemo(() => {
    return {
      'Select Group': 'Select Group',
      ...Object.fromEntries(groups.map((g, index) => [g._id, g.name || `Unnamed Group ${index + 1}`]))
    }
  }, [groups])

  const selectAGroup = (selected: GroupData) => {
    let triggerAreaPosition: THREE.Vector3 = new THREE.Vector3()
    if (selected.triggerArea.newPosition) {
      triggerAreaPosition = new THREE.Vector3(...selected.triggerArea.newPosition.map(v => v * mapScale))
    } else {
      triggerAreaPosition = new THREE.Vector3(...selected.triggerArea.position.map(v => v * mapScale))
    }
    useUpdateGroupStore.setState({
      selectedGroup: selected,
      updatedGroupName: selected.name,
      collection: selected.collection,
      triggerArea: {
        position: triggerAreaPosition,
        rotation: new THREE.Euler(...selected.triggerArea.rotation),
        scale: new THREE.Vector3(...selected.triggerArea.scale.map(v => v * mapScale)),
      },
      presentationCamera: {
        position: new THREE.Vector3(...selected.triggerArea.presentationCamera.position.map(v => v * mapScale)),
        target: new THREE.Vector3(...selected.triggerArea.presentationCamera.target.map(v => v * mapScale)),
        fov: selected.triggerArea.presentationCamera.fov,
      },
      showcaseCamera: {
        position: new THREE.Vector3(...selected.triggerArea.showcaseCamera.position.map(v => v * mapScale)),
        target: new THREE.Vector3(...selected.triggerArea.showcaseCamera.target.map(v => v * mapScale)),
        fov: selected.triggerArea.showcaseCamera.fov,
      },
    })
  }

  const deleteGroup = async () => {
    const selectedGroup = useUpdateGroupStore.getState().selectedGroup
    if (!selectedGroup) {
      console.error('No group selected')
      return
    }

    const baseUrl = import.meta.env.VITE_FASTAPI_BACKEND_URL
    const url = `${baseUrl}/groups/${selectedGroup._id}`

    try {
      const response = await fetch(url, {
        method: 'DELETE',
      })
      if (response.ok) {
        console.log('Group deleted successfully')
        fetchGroups() // Refresh the groups list
        useUpdateGroupStore.setState({ selectedGroup: null })
        useUpdateGroupStore.getState().refreshDataFromDB()
      } else {
        console.error('Failed to delete group')
      }
    } catch (error) {
      console.error('Error deleting group:', error)
    }
  }

  const [_, levaSetter] = useControls('Update Group', 
    () => ({
      // 'Fetch Groups': button(() => fetchGroups()),
      group: {
        value: selectedGroup?._id || 'Select Group',
        options: groupOptions,
        onChange: (value) => {
          const selected = groups.find(g => g._id === value)
          if (selected) {
            selectAGroup(selected)
          }
        },
      },
      updatedGroupName: {
        value: updatedGroupName,
        onChange: (value: string) => useUpdateGroupStore.setState({ updatedGroupName: value }),
        label: 'Updated Group Name'
      },
      collection: {
        value: collection,
        options: ['everlite', 'rajwada', 'sutra', 'shagun', 'colors', 'spectra', 'cera', 'mariposa', 'lotus', 'sruti', 'other', 'love24'],
        onChange: (value: string) => useUpdateGroupStore.setState({ collection: value }),
        label: 'Collection'
      },
      triggerAreaScaleX: {
        value: triggerArea.scale.x,
        min: 0.1,
        max: 10,
        onChange: (value: number) => {
          useUpdateGroupStore.setState((state) => ({
            triggerArea: { ...state.triggerArea, scale: new THREE.Vector3(value, state.triggerArea.scale.y, state.triggerArea.scale.z) }
          }))
        },
        label: 'Trigger Area Scale X'
      },
      triggerAreaScaleZ: {
        value: triggerArea.scale.z,
        min: 0.1,
        max: 10,
        onChange: (value: number) => useUpdateGroupStore.setState((state) => ({
          triggerArea: { ...state.triggerArea, scale: new THREE.Vector3(state.triggerArea.scale.x, state.triggerArea.scale.y, value) }
        })),
        label: 'Trigger Area Scale Z'
      },
      presentationCameraFOV: {
        value: presentationCamera.fov,
        min: 10,
        max: 100,
        onChange: (value: number) => useUpdateGroupStore.setState((state) => ({
          presentationCamera: { ...state.presentationCamera, fov: value }
        })),
        label: 'Presentation Camera FOV'
      },
      showcaseCameraFOV: {
        value: showcaseCamera.fov,
        min: 10,
        max: 100,
        onChange: (value: number) => useUpdateGroupStore.setState((state) => ({
          showcaseCamera: { ...state.showcaseCamera, fov: value }
        })),
        label: 'Showcase Camera FOV'
      },
      triggerAreaRotationY: {
        value: triggerArea.rotation.y,
        min: -Math.PI,
        max: Math.PI,
        step: 0.01,
        onChange: (value: number) => useUpdateGroupStore.setState((state) => ({
          triggerArea: { ...state.triggerArea, rotation: new THREE.Euler(state.triggerArea.rotation.x, value, state.triggerArea.rotation.z) }
        })),
        label: 'Trigger Area Rotation Y'
      },
      'Toggle Presentation Mode (B -> R)': button(() => toggleCameraMode('presentation')),
      'Toggle Showcase Mode (G -> Y)': button(() => toggleCameraMode('showcase')),
      'Update Group': button(updateGroup),
      'Delete Group': button(() => deleteGroup(), {
        disabled: !selectedGroup
      }),
      // 'Refresh Data From DB': button(refreshDataFromDB),
    }),
    { collapsed: true },
    [ selectedGroup, groups ]
  )

  // Override the render method of the 'Group' control to display custom labels
  useEffect(() => {
    const groupControl = document.querySelector('div[data-key="Group"]')
    if (groupControl) {
      const select = groupControl.querySelector('select')
      if (select) {
        Array.from(select.options).forEach(option => {
          // @ts-ignore
          option.text = groupLabels[option.value] || option.value
        })
      }
    }
  }, [groupLabels])

  const handleGroupClick = (groupId: string) => {
    const group = useUpdateGroupStore.getState().groups.find(g => g._id === groupId)
    if (group === undefined || group === null) return


    let triggerAreaPosition: THREE.Vector3 = new THREE.Vector3()
    if (group.triggerArea.newPosition) {
      triggerAreaPosition = new THREE.Vector3(...group.triggerArea.newPosition.map(v => v * mapScale))
    } else {
      triggerAreaPosition = new THREE.Vector3(...group.triggerArea.position.map(v => v * mapScale))
    }

    useUpdateGroupStore.setState({
      selectedGroup: group,
      updatedGroupName: group.name,
      collection: group.collection,
      triggerArea: {
        position: triggerAreaPosition,
        rotation: new THREE.Euler(...group.triggerArea.rotation),
        scale: new THREE.Vector3(...group.triggerArea.scale),
      },
      presentationCamera: {
        position: new THREE.Vector3(...group.triggerArea.presentationCamera.position.map(v => v * mapScale)),
        target: new THREE.Vector3(...group.triggerArea.presentationCamera.target.map(v => v * mapScale)),
        fov: group.triggerArea.presentationCamera.fov,
      },
      showcaseCamera: {
        position: new THREE.Vector3(...group.triggerArea.showcaseCamera.position.map(v => v * mapScale)),
        target: new THREE.Vector3(...group.triggerArea.showcaseCamera.target.map(v => v * mapScale)),
        fov: group.triggerArea.showcaseCamera.fov,
      },
    })

    levaSetter({
      group: groupId,
      updatedGroupName: group.name,
      collection: group.collection,
      triggerAreaScaleX: group.triggerArea.scale[0],
      triggerAreaScaleZ: group.triggerArea.scale[2],
      presentationCameraFOV: group.triggerArea.presentationCamera.fov,
      showcaseCameraFOV: group.triggerArea.showcaseCamera.fov,
    })
  }

  const debug_clickedShowcaseTriggerArea = genericStore((state) => state.debug_clickedShowcaseTriggerArea)
  useEffect(() => {
    if (debug_clickedShowcaseTriggerArea !== null)
      handleGroupClick(debug_clickedShowcaseTriggerArea)
  }, [debug_clickedShowcaseTriggerArea])

  return (
    <>
      {triggerAreaRef.current && isGizmoEnabled && activeTransformControl === 'triggerArea' && (
        <TransformControls
          object={triggerAreaRef.current}
          mode={'translate'}
          onMouseDown={() => {
          toggleOrbitControls(false)
          }}
          onMouseUp={() => {
            toggleOrbitControls(true)
            if (triggerAreaRef.current) {
              if (gizmoMode === 'translate') {
                useUpdateGroupStore.setState((state) => ({
                  triggerArea: {
                    ...state.triggerArea,
                    position: triggerAreaRef.current!.position,
                  }
                }))
              }
            }
          }}
        />
      )}
      {selectedGroup && (
        <mesh
          ref={triggerAreaRef}
          position={triggerArea.position}
          rotation={[-Math.PI / 2, 0, triggerArea.rotation.y ?? 0]}
          // scale={[triggerArea.scale.x, 0.01, triggerArea.scale.z]}
          scale={[1, 1, 1]}
          onClick={() => handleMeshClick('triggerArea')}
        >
          <planeGeometry args={[triggerArea.scale.x * 4, triggerArea.scale.z * 4]} />
          <meshStandardMaterial color="hotpink" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {presentationCameraRef.current && isGizmoEnabled && activeTransformControl === 'presentationCamera' && (
        <TransformControls
          object={presentationCameraRef.current}
          mode={gizmoMode}
          onMouseDown={() => toggleOrbitControls(false)}
          onMouseUp={() => {
            toggleOrbitControls(true)
            if (presentationCameraRef.current) {
              useUpdateGroupStore.setState((state) => ({
                presentationCamera: {
                  ...state.presentationCamera,
                  position: presentationCameraRef.current!.position,
                }
              }))
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

      {presentationTargetRef.current && isGizmoEnabled && activeTransformControl === 'presentationTarget' && (
        <TransformControls
          object={presentationTargetRef.current}
          mode={gizmoMode}
          onMouseDown={() => toggleOrbitControls(false)}
          onMouseUp={() => {
            toggleOrbitControls(true)
            if (presentationTargetRef.current) {
              useUpdateGroupStore.setState((state) => ({
                presentationCamera: {
                  ...state.presentationCamera,
                  target: presentationTargetRef.current!.position,
                }
              }))
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

      {showcaseCameraRef.current && isGizmoEnabled && activeTransformControl === 'showcaseCamera' && (
        <TransformControls
          object={showcaseCameraRef.current}
          mode={gizmoMode}
          onMouseDown={() => toggleOrbitControls(false)}
          onMouseUp={() => {
            toggleOrbitControls(true)
            if (showcaseCameraRef.current) {
              useUpdateGroupStore.setState((state) => ({
                showcaseCamera: {
                  ...state.showcaseCamera,
                  position: showcaseCameraRef.current!.position,
                }
              }))
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

      {showcaseTargetRef.current && isGizmoEnabled && activeTransformControl === 'showcaseTarget' && (
        <TransformControls
          object={showcaseTargetRef.current}
          mode={gizmoMode}
          onMouseDown={() => toggleOrbitControls(false)}
          onMouseUp={() => {
            toggleOrbitControls(true)
            if (showcaseTargetRef.current) {
              useUpdateGroupStore.setState((state) => ({
                showcaseCamera: {
                  ...state.showcaseCamera,
                  target: showcaseTargetRef.current!.position,
                }
              }))
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
    </>
  )
}

export default UpdateGroupNew