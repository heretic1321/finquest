// import { staticResourcePaths } from '@client/config/staticResourcePaths'
// import { genericStore } from '@client/contexts/GlobalStateContext'
// import { MapStore } from '@client/contexts/MapContext'
// import { useGLTF } from '@react-three/drei'
// import React, { useEffect, useRef } from 'react'
// import * as THREE from 'three'
// import { create } from 'zustand'
// import { useShallow } from 'zustand/react/shallow'

// // Reuse types from CreateSlot
// import { IItemTypeExtended } from '../types/collectionAPI'
// import { GroupData, SlotData } from './CreateSlot'

// interface ItemData {
//   _id: string
//   name: string
//   sku: string
//   highPolyModelConfig: {
//     position: [number, number, number]
//     rotation: [number, number, number]
//     scale: [number, number, number]
//   }
//   itemType: IItemTypeExtended
//   isInMainBuilding: boolean
//   collection: string
//   groupId: string
//   slotId: string
// }

// // interface ExtendedSlotData extends SlotData {
// //   item?: ItemData
// // }

// // interface ExtendedGroupData extends Omit<GroupData, 'slots'> {
// //   slots: ExtendedSlotData[]
// // }

// // interface UpdateSlotNewState {
// //   allGroupsInStore: ExtendedGroupData[]
// //   selectedGroup: ExtendedGroupData | null
// //   selectedSlot: ExtendedSlotData | null
// //   allSlotsInSelectedGroup: ExtendedSlotData[]

// //   fetchGroupData: () => void
// //   setSelectedGroup: (groupId: string) => void
// //   setSelectedSlot: (slot: ExtendedSlotData | null) => void
// // }

// const UpdateSlotNewStore = create<UpdateSlotNewState>((set, get) => ({
//   allGroupsInStore: [],
//   selectedGroup: null,
//   selectedSlot: null,
//   allSlotsInSelectedGroup: [],

//   fetchGroupData: async () => {
//     const storeName = genericStore.getState().insideStore
//     if (!storeName) {
//       console.log('Store Name is null, please go inside a store')
//       return
//     }

//     const baseUrl = import.meta.env.VITE_FASTAPI_BACKEND_URL
//     const url = `${baseUrl}/groups/items?storeName=${storeName}`
//     try {
//       const response = await fetch(url)
//       const data = await response.json()
//       set({ allGroupsInStore: data.groups })
//     } catch (error) {
//       console.error('Error fetching group data:', error)
//     }
//   },

//   setSelectedGroup: (groupId: string) => {
//     const selectedGroup = get().allGroupsInStore.find(group => group._id === groupId)
//     if (selectedGroup) {
//       set({ 
//         selectedGroup,
//         allSlotsInSelectedGroup: selectedGroup.slots,
//         selectedSlot: null
//       })
//     }
//   },

//   setSelectedSlot: (slot: ExtendedSlotData | null) => {
//     set({ selectedSlot: slot })
//   },
// }))

// const SetItemToSlotNew: React.FC = () => {
//   const {
//     allGroupsInStore,
//     selectedGroup,
//     selectedSlot,
//     allSlotsInSelectedGroup,
//     fetchGroupData,
//     setSelectedGroup,
//     setSelectedSlot,
//   } = UpdateSlotNewStore(useShallow((state) => state))

//   const groupRefs = useRef<{ [key: string]: THREE.Group | null }>({})

//   const defaultRing = useGLTF(staticResourcePaths.defaultRing)
//   const defaultEarring = useGLTF(staticResourcePaths.defaultEarring)
//   const defaultPendant = useGLTF(staticResourcePaths.defaultPendant)
//   const defaultBracelet = useGLTF(staticResourcePaths.defaultBracelet)
//   const defaultNecklace = useGLTF(staticResourcePaths.defaultNecklace)

//   const insideStore = genericStore((state) => state.insideStore)
//   // Fetch group data when store name changes
//   useEffect(() => {
//     if (insideStore) {
//       fetchGroupData()
//     }
//   }, [insideStore])

//   const debug_clickedShowcaseTriggerArea = genericStore((state) => state.debug_clickedShowcaseTriggerArea)
//   useEffect(() => {
//     if (debug_clickedShowcaseTriggerArea) {
//       const group = UpdateSlotNewStore.getState().allGroupsInStore.find(group => group._id === debug_clickedShowcaseTriggerArea)
//       if (group) {
//         setSelectedGroup(group._id)
//       }
//     }
//   }, [debug_clickedShowcaseTriggerArea])

//   const getModelForSlotType = (slotType: IItemTypeExtended) => {
//     switch (slotType) {
//       case 'ring':
//         return defaultRing.scene.clone()
//       case 'earring':
//         return defaultEarring.scene.clone()
//       case 'pendant':
//         return defaultPendant.scene.clone()
//       case 'bracelet':
//         return defaultBracelet.scene.clone()
//       case 'necklace':
//         return defaultNecklace.scene.clone()
//       default:
//         return new THREE.Mesh(
//           new THREE.BoxGeometry(1, 1, 1),
//           new THREE.MeshBasicMaterial({ color: 'red', wireframe: true })
//         )
//     }
//   }

//   return (
//     <>
//       {selectedGroup && allSlotsInSelectedGroup.map((slot) => {
//         const slotType = slot.itemTypes[0] as IItemTypeExtended
//         const slotTransform = slot.itemTransform[slotType]
//         const isSelected = selectedSlot?._id === slot._id

//         if (!slotTransform) return null

//         return (
//           <group
//             key={slot._id}
//             position={slotTransform.position.map((pos) => pos * MapStore.getState().mapScale) as [number, number, number]}
//             rotation={slotTransform.rotation as [number, number, number]}
//             scale={slotTransform.scale.map((scale) => scale * MapStore.getState().mapScale) as [number, number, number]}
//             onClick={() => setSelectedSlot(slot)}
//             ref={(group: THREE.Group | null) => {
//               if (group) {
//                 groupRefs.current[slot._id] = group
//               }
//             }}
//           >
//             {!slot.item && (
//               <primitive object={getModelForSlotType(slotType)} />
//             )}
//             <mesh>
//               <boxBufferGeometry args={[1, 1, 1]} />
//               <meshStandardMaterial color={isSelected ? "yellow" : "blue"} wireframe={true} />
//             </mesh>
//           </group>
//         )
//       })}
//     </>
//   )
// }

// export default SetItemToSlotNew

export {}