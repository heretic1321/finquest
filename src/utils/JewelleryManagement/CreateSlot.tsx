import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { CameraControlsStore } from '@client/contexts/CameraControlsContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { MapStore } from '@client/contexts/MapContext'
import { TransformControls, useGLTF } from '@react-three/drei'
import { button, useControls } from 'leva'
import { createRef, MutableRefObject, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { IItemConfig, IItemTypeExtended, TCollection } from '../types/collectionAPI'

interface IItem {
  _id: string
  name: string
  highPolyModelConfig: {
    position: [number, number, number]
    rotation: [number, number, number]
    scale: [number, number, number]
  }
  sku: string
  itemType: IItemTypeExtended
  groupId?: string
  slotId?: string
  isInMainBuilding: boolean
  collection: TCollection
}

export interface SlotData {
  itemTransform: { [key in IItemTypeExtended]?: IItemConfig }
  itemTypes: IItemTypeExtended[]
  item?: IItem
  name: string
  _id: string
}

export interface CameraData {
  fov: number
  position: [number, number, number]
  rotation: [number, number, number]
}

export interface TriggerAreaData {
  newPosition: [number, number, number]
  newRotationY: number
  position: [number, number, number]
  presentationCamera: CameraData
  radiusX: number
  radiusY: number
  rotation: [number, number, number]
  scale: [number, number, number]
  showcaseCamera: CameraData
}

export interface GroupData {
  collection: string
  idealRotation: [number, number, number]
  name: string
  order: number
  slots: SlotData[]
  storeName: string
  triggerArea: TriggerAreaData
  _id: string
}

const SlotTypes = [
  'ring',
  'bracelet',
  'necklace',
  'earring',
  'pendant',
  'ringhub',
  'earringhub',
  'necklacehub',
  'pendanthub',
  'bracelethub',
  'flatbracelet',
] as IItemTypeExtended[]

interface JewelleryManagementZustandState {
  selectedGroupName: string
  allGroupsInThisStore: GroupData[]
  allGroupNamesInThisStore: string[]
  selectedGroup: GroupData | null
  selectedGroupIndex: number
  groupID: string

  selectedSlot: SlotData | null
  selectedSlotName: string
  selectedSlotIndex: number
  allSlotsInSelectedGroup: SlotData[]
  allSlotNamesInSelectedGroup: string[]
  newSlotData: {
    position: [number, number, number]
    rotation: [number, number, number]
    scale: [number, number, number]
    type: IItemTypeExtended | null
    name: string
  }
  slotGizmoEnabled: boolean
  gizmoMode: 'translate' | 'rotate' | 'scale'
  slotMeshRef: MutableRefObject<THREE.Mesh | null>

  initSlotMesh: () => void
  toggleGizmo: () => void
  cycleGizmoMode: () => void

  resetSlotState: () => void
  fetchGroupData: () => void
  fetchSlotData: () => void
  postNewSlotData: () => void
  updateNewSlotData: (data: Partial<JewelleryManagementZustandState['newSlotData']>) => void
  selectSlot: (slot: SlotData) => void
  duplicateSelectedSlot: () => void
  refreshDataFromDB: () => void
}

const slotMeshRef = createRef<THREE.Mesh | null>() as MutableRefObject<THREE.Mesh | null>
slotMeshRef.current = null

const scaleUpForRendering = (values: [number, number, number]) => {
  return values.map((value) => value * MapStore.getState().mapScale) as [number, number, number]
}

const scaleDownForStorage = (values: [number, number, number]) => {
  return values.map((value) => value / MapStore.getState().mapScale) as [number, number, number]
}

const JewelleryManagementStore = create<JewelleryManagementZustandState>((set, get) => ({
  selectedGroupName: '',
  allGroupsInThisStore: [],
  allGroupNamesInThisStore: [],
  selectedGroup: null,
  selectedGroupIndex: 0,
  groupID: '',

  selectedSlot: null,
  selectedSlotName: '',
  selectedSlotIndex: 0,
  allSlotsInSelectedGroup: [],
  allSlotNamesInSelectedGroup: [],
  newSlotData: {
    position: [0, 0, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    scale: [1, 1, 1] as [number, number, number],
    type: null,
    name: '',
  },
  slotGizmoEnabled: false,
  gizmoMode: "translate",
  slotMeshRef,

  initSlotMesh: () => {
    const selectedGroup = get().selectedGroup
    if (selectedGroup == null) console.log('Selected Group is null')
    else {
      set((state) => ({
        newSlotData: {
          ...state.newSlotData,
          position: selectedGroup.triggerArea.position,
          rotation: [0, 0, 0],
          scale: scaleUpForRendering([6.181, 6.181, 6.181]),
          type: SlotTypes[0],
        }
      }))
    }
  },

  updateNewSlotData: (data) => {
    set((state) => ({
      newSlotData: {
        ...state.newSlotData,
        ...data
      }
    }))
  },

  toggleGizmo: () => set((state) => ({ slotGizmoEnabled: !state.slotGizmoEnabled })),

  cycleGizmoMode: () => set((state) => {
    const modes: ('translate' | 'rotate' | 'scale')[] = ['translate', 'rotate', 'scale']
    const currentIndex = modes.indexOf(state.gizmoMode)
    const nextIndex = (currentIndex + 1) % modes.length
    return { gizmoMode: modes[nextIndex] }
  }),

  resetSlotState: () => {
    set({
      newSlotData: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        type: null,
        name: '',
      },
      slotGizmoEnabled: false,
    })
  },

  fetchGroupData: () => {
    if (genericStore.getState().insideStore === null) {
      console.log('Store Name is null, please go inside a store')
      return
    }

    const baseUrl = import.meta.env.VITE_FASTAPI_BACKEND_URL
    const url = `${baseUrl}/groups/groups_by_store_name?store_name=${genericStore.getState().insideStore}`
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // Scale up the position and scale values for each group's triggerArea
        const scaledGroups = data.groups.map((group: GroupData) => ({
          ...group,
          triggerArea: {
            ...group.triggerArea,
            position: scaleUpForRendering(group.triggerArea.position) as [number, number, number],
            scale: scaleUpForRendering(group.triggerArea.scale) as [number, number, number],
          }
        }));
        set({ allGroupsInThisStore: scaledGroups })
      })
      .catch((error) => {
        console.error('Error fetching data:', error)
      })
  },

  fetchSlotData: () => {
    const baseUrl = import.meta.env.VITE_FASTAPI_BACKEND_URL
    const groupID = get().groupID
    const url = `${baseUrl}/groups/${groupID}/slots-with-items`
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // Scale up the position and scale values for each slot's itemTransform
        const scaledSlots = data.slots.map((slot: SlotData) => ({
          ...slot,
          itemTransform: Object.fromEntries(
            Object.entries(slot.itemTransform).map(([key, value]) => [
              key,
              {
                ...value,
                position: scaleUpForRendering(value.position) as [number, number, number],
                scale: scaleUpForRendering(value.scale) as [number, number, number],
              }
            ])
          )
        }));
        set({ allSlotsInSelectedGroup: scaledSlots })
        console.log('All Slots in Selected Group:', scaledSlots)
      })
      .catch((error) => {
        console.error('Error fetching data:', error)
      })
  },

  postNewSlotData: () => {
    const { newSlotData, selectedGroupName, groupID } = get()
    if (newSlotData.type === null || newSlotData.name === '' || selectedGroupName === '' || groupID === '') {
      console.log('Slot Type, Slot Name or Group Name is empty')
      return
    }
    
    const payload = JSON.stringify({
      name: newSlotData.name,
      itemTypes: [newSlotData.type],
      itemTransform: {
        [newSlotData.type]: {
          position: scaleDownForStorage(newSlotData.position) as [number, number, number],
          rotation: [newSlotData.rotation[0], newSlotData.rotation[1], newSlotData.rotation[2]] as [number, number, number],
          scale: scaleDownForStorage(newSlotData.scale) as [number, number, number],
        },
      },
    })

    const baseUrl = import.meta.env.VITE_FASTAPI_BACKEND_URL
    const url = `${baseUrl}/groups/${groupID}/slots`
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    })
      .then((response) => response.json())
      .then(() => {
        // Reset slot state and re-fetch data after successful addition
        get().resetSlotState()
        get().fetchSlotData()
        get().refreshDataFromDB()
      })
      .catch((error) => {
        console.error('Error posting new slot data:', error)
      })
  },

  selectSlot: (slot: SlotData) => {
    set({ 
      selectedSlot: slot,
      selectedSlotName: slot.name,
      selectedSlotIndex: get().allSlotsInSelectedGroup.findIndex((s) => s._id === slot._id)
    })
  },
  
  duplicateSelectedSlot: () => {
    const selectedSlot = get().selectedSlot;
    if (selectedSlot) {
      const slotType = selectedSlot.itemTypes[0];
      const transform = selectedSlot.itemTransform[slotType];
      if (transform) {
        set((state) => ({
          newSlotData: {
            ...state.newSlotData,
            position: transform.position as [number, number, number],
            rotation: transform.rotation as [number, number, number],
            scale: transform.scale as [number, number, number],
            type: slotType,
            name: `${selectedSlot.name}_copy`,
          }
        }));
      }
    }
  },

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


const CreateSlot = () => {
  const isDebugMode = genericStore((state) => state.isDebugMode)

  const {
    allGroupsInThisStore,
    allSlotsInSelectedGroup,
    selectedGroupIndex,
    slotGizmoEnabled,
    gizmoMode,
    newSlotData,
    updateNewSlotData,
    selectedSlot,
    selectSlot,
    duplicateSelectedSlot,
  } = JewelleryManagementStore(
    useShallow((state) => ({
      selectedGroupName: state.selectedGroupName,
      allGroupsInThisStore: state.allGroupsInThisStore,
      allSlotsInSelectedGroup: state.allSlotsInSelectedGroup,
      allGroupNamesInThisStore: state.allGroupNamesInThisStore,
      allSlotNamesInSelectedGroup: state.allSlotNamesInSelectedGroup,
      selectedSlotName: state.selectedSlotName,
      selectedSlotIndex: state.selectedSlotIndex,
      selectedGroupIndex: state.selectedGroupIndex,
      groupID: state.groupID,
      slotGizmoEnabled: state.slotGizmoEnabled,
      gizmoMode: state.gizmoMode,
      toggleGizmo: state.toggleGizmo,
      cycleGizmoMode: state.cycleGizmoMode,
      newSlotData: state.newSlotData,
      updateNewSlotData: state.updateNewSlotData,
      selectedSlot: state.selectedSlot,
      selectSlot: state.selectSlot,
      duplicateSelectedSlot: state.duplicateSelectedSlot
    }
    )))

  const defaultRing = useGLTF(staticResourcePaths.defaultRing)
  const defaultEarring = useGLTF(staticResourcePaths.defaultEarring)
  const defaultPendant = useGLTF(staticResourcePaths.defaultPendant)
  const defaultBracelet = useGLTF(staticResourcePaths.defaultBracelet)
  const defaultNecklace = useGLTF(staticResourcePaths.defaultNecklace)

  const newSlotMeshRef = useRef<THREE.Group | null>(null)

  const debug_clickedShowcaseTriggerArea = genericStore((state) => state.debug_clickedShowcaseTriggerArea)
  useEffect(() => {
    if (debug_clickedShowcaseTriggerArea !== null) {
      // We want to fetch the group data and find in that group data a group whose _id matches the debug_clickedShowcaseTriggerArea
      // and then set the selectedGroupIndex to that group's index
      JewelleryManagementStore.getState().fetchGroupData()
      const groupIndex = JewelleryManagementStore.getState().allGroupsInThisStore.findIndex((group) => group._id === debug_clickedShowcaseTriggerArea)
      console.log('Group Index:', groupIndex)
      if (groupIndex !== -1) {
        JewelleryManagementStore.setState({ selectedGroupIndex: groupIndex })
      }
    }
  }, [debug_clickedShowcaseTriggerArea])


  useEffect(() => {
    const groupNames = allGroupsInThisStore.map((group) => {
      return (group.name === undefined || group.name === null || group.name === '') ? group._id : group.name
    })
    JewelleryManagementStore.setState({ allGroupNamesInThisStore: groupNames })
  }, [allGroupsInThisStore])

  useEffect(() => {
    const slotNameOptions = allSlotsInSelectedGroup.map((slot: any) => {
      return slot.name
    })
    JewelleryManagementStore.setState({ allSlotNamesInSelectedGroup: [...slotNameOptions, 'Select Slot Name'] })
  }, [allSlotsInSelectedGroup])


  // Listen for keydown events to toggle the gizmo and cycle through the gizmo modes
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '9') {
        JewelleryManagementStore.getState().toggleGizmo()
      } else if (event.key === '0') {
        JewelleryManagementStore.getState().cycleGizmoMode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
  //----------------------------------------------------------------------------------


  // Compute the selected group's name and groupID and store the group info itself
  // whenever the selectedGroupIndex changes
  useEffect(() => {
    if (selectedGroupIndex < allGroupsInThisStore.length) {
      JewelleryManagementStore.setState({
        selectedGroupName: allGroupsInThisStore[selectedGroupIndex]['name'],
        selectedGroup: allGroupsInThisStore[selectedGroupIndex],
        groupID: allGroupsInThisStore[selectedGroupIndex]['_id']
      })
      JewelleryManagementStore.getState().fetchSlotData()
    }
  }, [selectedGroupIndex, allGroupsInThisStore])
  //----------------------------------------------------------------------------------


  const getModelForType = (type: IItemTypeExtended) => {
    switch (type) {
      case 'ring':
      case 'ringhub':
        return defaultRing.scene.clone()
      case 'earring':
      case 'earringhub':
        return defaultEarring.scene.clone()
      case 'pendant':
      case 'pendanthub':
        return defaultPendant.scene.clone()
      case 'bracelet':
      case 'bracelethub':
      case 'flatbracelet':
        return defaultBracelet.scene.clone()
      case 'necklace':
      case 'necklacehub':
        return defaultNecklace.scene.clone()
      default:
        return defaultRing.scene.clone()
    }
  }
  //----------------------------------------------------------------------------------


  // // Click this button to fetch group data
  // useControls(
  //   'JewellerySetup. 2-Pre Work for Slot Creation / Updation',
  //   () => ({
  //     'Fetch Group Details': button(() => {
  //       JewelleryManagementStore.getState().fetchGroupData()
  //     }),
  //   }),
  //   { collapsed: true },
  // )
  // //----------------------------------------------------------------------------------


  // // After the groups are fetched above, select the group name from the dropdown and it 
  // // will compute and save a bunch of info about the selected group
  // useControls(
  //   'JewellerySetup. 2-Pre Work for Slot Creation / Updation',
  //   () => ({
  //     groupNames: {
  //       value:
  //         allGroupNamesInThisStore.length === 0
  //           ? 'Select Group Name'
  //           : allGroupNamesInThisStore[0],
  //       options: allGroupNamesInThisStore,
  //       onChange: (value: string) => {
  //         if (value !== 'Select Group Name') {
  //           JewelleryManagementStore.setState({ selectedGroupIndex: allGroupNamesInThisStore.indexOf(value) })
  //         }
  //       },
  //       label: 'Select Group Name',
  //     },
  //   }),
  //   { collapsed: true },
  //   [allGroupNamesInThisStore],
  // )
  // //----------------------------------------------------------------------------------

  // Slot creation controls. Here you specify the slot name, type set it's transform using gizmos and then click the
  // 'Add Slot' button to create the slot on the db
  const [_, controlsSet] = useControls(
    'JewellerySetup. 3-Slot Creation',
    () => ({
      'Init Slot Mesh': button(() => {
        JewelleryManagementStore.getState().initSlotMesh()
      }),
      slotName: {
        value: newSlotData.name,
        onChange: (value: string) => {
          updateNewSlotData({ name: value })
        },
        label: 'Slot Name',
      },
      slotType: {
        value: newSlotData.type || SlotTypes[0],
        options: SlotTypes,
        onChange: (value: string) => {
          updateNewSlotData({ type: value as IItemTypeExtended })
        },
        label: 'Select Slot Type',
      },
      'Add Slot': button(() => {
        JewelleryManagementStore.getState().postNewSlotData()
        controlsSet({ slotName: '' })
      }),
      'Duplicate Selected Slot': button(() => {
        duplicateSelectedSlot()
      }, {
        disabled: !selectedSlot
      }),
      // 'Refresh Data From DB': button(refreshDataFromDB),
    }),
    { collapsed: true },
    [selectedSlot]
  )
  //----------------------------------------------------------------------------------


  return (
    <>
      {newSlotMeshRef.current && slotGizmoEnabled && (
        <TransformControls
          object={newSlotMeshRef.current}
          mode={gizmoMode}
          onMouseDown={() => {
            CameraControlsStore.getState().orbitControlsRef.current!.enabled = false
          }}
          onMouseUp={() => {
            CameraControlsStore.getState().orbitControlsRef.current!.enabled = true
            if (newSlotMeshRef.current) {
              if (gizmoMode === 'translate') {
                updateNewSlotData({ position: newSlotMeshRef.current.position.toArray() as [number, number, number] })
              } else if (gizmoMode === 'rotate') {
                updateNewSlotData({ rotation: new THREE.Euler().setFromQuaternion(newSlotMeshRef.current.quaternion).toArray() as [number, number, number] })
              } else if (gizmoMode === 'scale') {
                updateNewSlotData({ scale: newSlotMeshRef.current.scale.toArray() as [number, number, number] })
              }
            }
          }}
        />
      )}
      {isDebugMode && newSlotData.type && (
        <>
          <group
            position={newSlotData.position}
            rotation={newSlotData.rotation}
            scale={newSlotData.scale}
            ref={newSlotMeshRef}
          >
            <primitive object={getModelForType(newSlotData.type)} scale={[0.02, 0.02, 0.02]} />
            <mesh>
              <boxGeometry args={[0.05, 0.05, 0.05]} />
              <meshBasicMaterial color={'red'} wireframe={true} />
            </mesh>
          </group>
        </>
      )}

      {
        allSlotsInSelectedGroup.map((slot, index) => {
          const slotType = slot.itemTypes[0] as IItemTypeExtended
          const transform = slot.itemTransform[slotType]
          if (!transform) return null

          return (
            <group
              key={index} 
              position={transform.position}
              rotation={transform.rotation}
              scale={transform.scale}
              onClick={(e) => {
                e.stopPropagation()
                selectSlot(slot)
              }}
            >
              {
                slot.item ? null :
                <primitive object={getModelForType(slotType)} scale={[0.02, 0.02, 0.02]} />
              }
              <mesh>
                <boxBufferGeometry args={[0.05, 0.05, 0.05]} />
                <meshStandardMaterial color={selectedSlot === slot ? "green" : "blue"} wireframe={true} />
              </mesh>
            </group>
          )
        })
      }
    </>
  )
}

export default CreateSlot