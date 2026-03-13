import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { CameraControlsStore } from '@client/contexts/CameraControlsContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { MapStore } from '@client/contexts/MapContext'
import { TransformControls, useGLTF } from '@react-three/drei'
import { button, useControls } from 'leva'
import React, { createRef, MutableRefObject, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

// Reuse types from CreateSlot
import { IItemTypeExtended } from '../types/collectionAPI'
import { GroupData, SlotData } from './CreateSlot'

// Add these utility functions at the top of the file
const scaleUpForRendering = (value: number[]): number[] => {
  const mapScale = MapStore.getState().mapScale;
  return value.map(v => v * mapScale);
};

const scaleDownForStorage = (value: number[]): number[] => {
  const mapScale = MapStore.getState().mapScale;
  return value.map(v => v / mapScale);
};

interface UpdateSlotState {
  selectedGroupName: string
  allGroupsInThisStore: GroupData[]
  allGroupNamesInThisStore: string[]
  selectedGroup: GroupData | null
  selectedGroupIndex: number
  groupID: string

  selectedSlot: SlotData | null
  allSlotsInSelectedGroup: SlotData[]
  allSlotNamesInSelectedGroup: string[]
  updatedSlotName: string
  updatedSlotType: IItemTypeExtended | null
  slotPosition: [number, number, number]
  slotRotation: [number, number, number]
  slotScale: [number, number, number]
  slotGizmoEnabled: boolean
  gizmoMode: 'translate' | 'rotate' | 'scale'
  slotMeshRef: MutableRefObject<THREE.Group | null>

  setSelectedSlot: (slot: SlotData | null) => void
  toggleGizmo: () => void
  cycleGizmoMode: () => void
  updateSlotTransform: (position?: [number, number, number], rotation?: [number, number, number], scale?: [number, number, number]) => void
}

const slotMeshRef = createRef<THREE.Group | null>() as MutableRefObject<THREE.Group | null>
slotMeshRef.current = null

const UpdateSlotStore = create<UpdateSlotState>((set) => ({
  selectedGroupName: '',
  allGroupsInThisStore: [],
  allGroupNamesInThisStore: [],
  selectedGroup: null,
  selectedGroupIndex: 0,
  groupID: '',

  selectedSlot: null,
  allSlotsInSelectedGroup: [],
  allSlotNamesInSelectedGroup: [],
  updatedSlotName: '',
  updatedSlotType: null,
  slotPosition: [0, 0, 0],
  slotRotation: [0, 0, 0],
  slotScale: [1, 1, 1],
  slotGizmoEnabled: false,
  gizmoMode: 'translate',
  slotMeshRef,

  setSelectedSlot: (slot) => {
    if (slot) {
      const slotType = slot.itemTypes[0];
      const transform = slot.itemTransform[slotType];
      set({ 
        selectedSlot: slot,
        updatedSlotName: slot.name,
        updatedSlotType: slotType,
        slotPosition: transform!.position as [number, number, number],
        slotRotation: transform!.rotation,
        slotScale: transform!.scale as [number, number, number],
        slotGizmoEnabled: true,
        gizmoMode: 'translate',
      })
    } else {
      set({
        selectedSlot: null,
        updatedSlotName: '',
        updatedSlotType: null,
        slotPosition: [0, 0, 0],
        slotRotation: [0, 0, 0],
        slotScale: [1, 1, 1],
        slotGizmoEnabled: false,
      })
    }
  },
  toggleGizmo: () => {
    set((state) => ({ slotGizmoEnabled: !state.slotGizmoEnabled }))
  },
  cycleGizmoMode: () => set((state) => {
    const modes: ('translate' | 'rotate' | 'scale')[] = ['translate', 'rotate', 'scale']
    const currentIndex = modes.indexOf(state.gizmoMode)
    const nextIndex = (currentIndex + 1) % modes.length
    return { gizmoMode: modes[nextIndex] }
  }),
  updateSlotTransform: (position, rotation, scale) => set((state) => ({
    slotPosition: position || state.slotPosition,
    slotRotation: rotation || state.slotRotation,
    slotScale: scale || state.slotScale,
  })),
}))

const UpdateSlot: React.FC = () => {
  const {
    selectedGroupIndex,
    allGroupsInThisStore,
    allSlotsInSelectedGroup,
    selectedSlot,
    updatedSlotName,
    updatedSlotType,
    slotGizmoEnabled,
    gizmoMode,
    setSelectedSlot,
    updateSlotTransform,
    slotPosition,
    slotRotation,
    slotScale,
  } = UpdateSlotStore(useShallow((state) => state))

  const groupRefs = useRef<{ [key: string]: THREE.Group | null }>({})

  const defaultRing = useGLTF(staticResourcePaths.defaultRing)
  const defaultEarring = useGLTF(staticResourcePaths.defaultEarring)
  const defaultPendant = useGLTF(staticResourcePaths.defaultPendant)
  const defaultBracelet = useGLTF(staticResourcePaths.defaultBracelet)
  const defaultNecklace = useGLTF(staticResourcePaths.defaultNecklace)


  useEffect(() => {
    const groupNames = allGroupsInThisStore.map((group) => {
      return (group.name === undefined || group.name === null || group.name === '') ? group._id : group.name
    })
    UpdateSlotStore.setState({ allGroupNamesInThisStore: groupNames })
  }, [allGroupsInThisStore])

  useEffect(() => {
    const slotNameOptions = allSlotsInSelectedGroup.map((slot: any) => {
      return slot.name
    })
    UpdateSlotStore.setState({ allSlotNamesInSelectedGroup: [...slotNameOptions, 'Select Slot Name'] })
  }, [allSlotsInSelectedGroup])

  const fetchGroupData = () => {
    if (genericStore.getState().insideStore === null) {
      console.log('Store Name is null, please go inside a store')
      return
    }

    const baseUrl = import.meta.env.VITE_FASTAPI_BACKEND_URL
    const url = `${baseUrl}/groups/groups_by_store_name?store_name=${genericStore.getState().insideStore}`
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const scaledGroups = data.groups.map((group: GroupData) => ({
          ...group,
          triggerArea: {
            ...group.triggerArea,
            position: scaleUpForRendering(group.triggerArea.position) as [number, number, number],
            scale: scaleUpForRendering(group.triggerArea.scale) as [number, number, number],
          }
        }));
        UpdateSlotStore.setState({ allGroupsInThisStore: scaledGroups })
      })
      .catch((error) => console.error('Error fetching group data:', error))
  }
  
  const fetchSlotData = () => {
    const baseUrl = import.meta.env.VITE_FASTAPI_BACKEND_URL
    const groupID = UpdateSlotStore.getState().groupID
    const url = `${baseUrl}/groups/${groupID}/slots-with-items`
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
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
        UpdateSlotStore.setState({ allSlotsInSelectedGroup: scaledSlots })
      })
      .catch((error) => console.error('Error fetching slot data:', error))
  }

  const updateSlotData = () => {
    if (!selectedSlot) {
      console.log('No slot selected for update')
      return
    }

    const baseUrl = import.meta.env.VITE_FASTAPI_BACKEND_URL
    const groupID = UpdateSlotStore.getState().groupID
    const url = `${baseUrl}/groups/${groupID}/slots/${selectedSlot._id}`

    const updatedItemTransform = {
      [updatedSlotType || selectedSlot.itemTypes[0]]: {
        position: scaleDownForStorage(UpdateSlotStore.getState().slotPosition) as [number, number, number],
        rotation: UpdateSlotStore.getState().slotRotation,
        scale: scaleDownForStorage(UpdateSlotStore.getState().slotScale) as [number, number, number],
      },
    }

    fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _id: selectedSlot._id,
        name: updatedSlotName || selectedSlot.name,
        itemTypes: [updatedSlotType || selectedSlot.itemTypes[0]],
        itemTransform: updatedItemTransform,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        console.log('Slot updated successfully')
        fetchSlotData() // Refresh slot data after update
        refreshDataFromDB()
      })
      .catch((error) => console.error('Error updating slot:', error))
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '9') UpdateSlotStore.getState().toggleGizmo()
      else if (event.key === '0') UpdateSlotStore.getState().cycleGizmoMode()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const groupSelected = (selectedGroupIndex: number) => {
    UpdateSlotStore.setState({ selectedGroupIndex })
  }


  const deleteSlot = () => {
    if (!selectedSlot) {
      console.log('No slot selected for deletion')
      return
    }

    const baseUrl = import.meta.env.VITE_FASTAPI_BACKEND_URL
    const groupID = UpdateSlotStore.getState().groupID
    const url = `${baseUrl}/groups/${groupID}/slots/${selectedSlot._id}`

    fetch(url, { method: 'DELETE' })
      .then((response) => response.json())
      .then(() => {
        console.log('Slot deleted successfully')
        setSelectedSlot(null)
        fetchSlotData() // Refresh slot data after deletion
      })
      .catch((error) => console.error('Error deleting slot:', error))
  }

  // Compute the selected group's name and groupID and store the group info itself
  // whenever the selectedGroupIndex changes
  useEffect(() => {
    if (selectedGroupIndex < allGroupsInThisStore.length) {
      UpdateSlotStore.setState({
        selectedGroupName: allGroupsInThisStore[selectedGroupIndex]['name'],
        selectedGroup: allGroupsInThisStore[selectedGroupIndex],
        groupID: allGroupsInThisStore[selectedGroupIndex]['_id']
      })
      fetchSlotData()
    }
  }, [selectedGroupIndex, allGroupsInThisStore])
  //----------------------------------------------------------------------------------

  const debug_clickedShowcaseTriggerArea = genericStore((state) => state.debug_clickedShowcaseTriggerArea)
  useEffect(() => {
    if (debug_clickedShowcaseTriggerArea !== null) {
      // We want to fetch the group data and find in that group data a group whose _id matches the debug_clickedShowcaseTriggerArea
      // and then set the selectedGroupIndex to that group's index
      fetchGroupData()
      const groupIndex = UpdateSlotStore.getState().allGroupsInThisStore.findIndex((group) => group._id === debug_clickedShowcaseTriggerArea)
      if (groupIndex !== -1) groupSelected(groupIndex)
    }
  }, [debug_clickedShowcaseTriggerArea])


  // // Click this button to fetch group data
  // useControls(
  //   'JewellerySetup. 2-Pre Work for Slot Updation',
  //   () => ({
  //     'Fetch Group Details': button(() => {
  //       fetchGroupData()
  //     }),
  //   }),
  //   { collapsed: true },
  // )
  // //----------------------------------------------------------------------------------

  // useControls(
  //   'JewellerySetup. 2-Pre Work for Slot Updation', 
  //   () => ({
  //     groupNames: {
  //       value: allGroupNamesInThisStore.length === 0 ? 'Select Group Name' : selectedGroupName,
  //       options: allGroupNamesInThisStore,
  //       onChange: (value) => {
  //         if (value !== 'Select Group Name') {
  //           const selectedGroupIndex = allGroupsInThisStore.findIndex((group) => group.name === value)
  //           groupSelected(selectedGroupIndex)
  //         }
  //       },
  //     },
  //   }),
  //   { collapsed: true },
  //   [ selectedGroupName, allGroupNamesInThisStore ]
  // )

  const refreshDataFromDB = () => {
    const currentStore = genericStore.getState().insideStore
    if (currentStore) {
      genericStore.setState({ debug_reFetchGroupData_forStore: currentStore })
      setTimeout(() => {
        genericStore.setState({ debug_reFetchGroupData_forStore: '' })
      }, 100) // Reset after a short delay
    }
  }


  const [_, setter] = useControls(
    'JewellerySetup. Slot Updation',
    () => ({
      updateSlotName: {
        value: updatedSlotName,
        onChange: (value) => UpdateSlotStore.setState({ updatedSlotName: value }),
        label: 'Update Slot Name'
      },
      updateSlotType: {
        value: updatedSlotType,
        options: ['ring', 'bracelet', 'necklace', 'earring', 'pendant'],
        onChange: (value) => UpdateSlotStore.setState({ updatedSlotType: value as IItemTypeExtended }),
        label: 'Update Slot Type'
      },
      'Update Slot': button(updateSlotData),
      'Delete Slot': button(deleteSlot),
      // 'Refresh Data From DB': button(refreshDataFromDB),
    }),
    { collapsed: true },
    [updatedSlotName, updatedSlotType]
  )

  useEffect(() => {
    console.log({updatedSlotName})
    setter({
      updateSlotName: updatedSlotName,
      updateSlotType: updatedSlotType 
    })
  }, [updatedSlotName, updatedSlotType])

  return (
    <>
      {slotMeshRef.current && slotGizmoEnabled && selectedSlot && (
        <TransformControls
          object={slotMeshRef.current}
          mode={gizmoMode}
          onMouseDown={() => {
            CameraControlsStore.getState().orbitControlsRef.current!.enabled = false
          }}
          onMouseUp={() => {
            CameraControlsStore.getState().orbitControlsRef.current!.enabled = true
            if (slotMeshRef.current) {
              console.log(scaleDownForStorage(slotMeshRef.current.position.toArray()))
              updateSlotTransform(
                slotMeshRef.current.position.toArray() as [number, number, number],
                [slotMeshRef.current.rotation.x, slotMeshRef.current.rotation.y, slotMeshRef.current.rotation.z] as [number, number, number],
                slotMeshRef.current.scale.toArray() as [number, number, number]
              )
            }
          }}
        />
      )}
      {allSlotsInSelectedGroup.map((slot) => {
        const slotType = (selectedSlot?._id === slot._id && updatedSlotType) ? updatedSlotType : slot.itemTypes[0]
        const isSelected = selectedSlot?._id === slot._id
        const slotTransform = isSelected
          ? { position: slotPosition, rotation: slotRotation, scale: slotScale }
          : slot.itemTransform[slotType]

        let slotMesh
        switch (slotType) {
          case 'ring':
            slotMesh = defaultRing.scene.clone()
            break
          case 'earring':
            slotMesh = defaultEarring.scene.clone()
            break
          case 'pendant':
            slotMesh = defaultPendant.scene.clone()
            break
          case 'bracelet':
            slotMesh = defaultBracelet.scene.clone()
            break
          case 'necklace':
            slotMesh = defaultNecklace.scene.clone()
            break
          default:
            slotMesh = new THREE.Mesh(
              new THREE.BoxGeometry(1, 1, 1),
              new THREE.MeshBasicMaterial({ color: 'red', wireframe: true })
            )
        }

        return (
          <group
            key={slot._id}
            position={slotTransform?.position}
            rotation={slotTransform?.rotation}
            scale={slotTransform?.scale}
            onClick={() => {
              setSelectedSlot(slot)
              const selectedGroup = groupRefs.current[slot._id]
              if (selectedGroup) {
                slotMeshRef.current = selectedGroup
              }
            }}
            ref={(group: THREE.Group) => {
              if (group) {
                groupRefs.current[slot._id] = group
                if (isSelected) {
                  slotMeshRef.current = group
                }
              }
            }}
          >
            {
              slot.item ? null : <primitive object={slotMesh} scale={[0.02, 0.02, 0.02]} />
            }
            {isSelected && (
              <mesh>
                <boxBufferGeometry args={[.02, .02, .02]} />
                <meshStandardMaterial color="yellow" wireframe={true} />
              </mesh>
            )}{
              !isSelected && (
                <mesh>
                  <boxBufferGeometry args={[.02, .02, .02]} />
                  <meshStandardMaterial color="blue" wireframe={true} />
                </mesh>
              )
            }
          </group>
        )
      })}
    </>
  )
}

export default UpdateSlot