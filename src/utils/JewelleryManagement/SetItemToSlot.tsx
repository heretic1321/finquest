import { genericStore } from '@client/contexts/GlobalStateContext'
import { button, useControls } from 'leva'
import { useEffect, useState } from 'react'

const StoreName = ['domestore', 'hub', 'ogstore', 'tallstore', 'cylinderstore']
const SetItemToSlot = () => {
  const isDebugMode = genericStore((state) => state.isDebugMode)
  const [storeName, setStoreName] = useState<string>('hub')
  const [
    fetchAllGroupsInStoreButtonClicked,
    setFetchAllGroupsInStoreButtonClicked,
  ] = useState<boolean>(false)
  const [reRenderGroupNamesList, setReRenderGroupNamesList] =
    useState<boolean>(false)
  const [storeData, setStoreData] = useState<any>(null)
  const [optionsForGroupNames, setOptionsForGroupNames] = useState<string[]>([])
  const [selectedGroupName, setSelectedGroupName] = useState<string>('')
  const [groupID, setGroupID] = useState<string>('')
  const [collectionName, setCollectionName] = useState<string>('Group 1')

  const [slotsData, setSlotsData] = useState<any>(null)
  const [optionsForSlots, setOptionsForSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [slotID, setSlotID] = useState<string>('')
  const [slotType, setSlotType] = useState<string>('')

  const [isInMainBuilding, setIsInMainBuilding] = useState<boolean>(false)
  const [SKUToattach, setSKUToattach] = useState<string>('')
  const [SKUButtonClicked, setSKUButtonClicked] = useState<boolean>(false)
  const [reRenderSKUButton, setReRenderSKUButton] = useState<boolean>(false)

  /************************************************************************************
   * fetch the store data when the fetch button is clicked, including the group names
   * and populate the group name options with the group names also save the store data
   * for later use
   * variables used: storeName, fetchAllGroupsInStoreButtonClicked, reRenderGroupNamesList
   * storeData, optionsForGroupNames
   ************************************************************************************/
  useEffect(() => {
    if (fetchAllGroupsInStoreButtonClicked) {
      console.log('Store Name', storeName)
      const baseUrl = import.meta.env.VITE_FASTAPI_BACKEND_URL
      const url = `${baseUrl}/groups/groups_by_store_name?store_name=${storeName}`
      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Groups:', data.groups)
          setStoreData(data.groups)
          // populate group name options with each name from the data.groups also if the name is empty string then use  _id instead
          let groupNameOptions1: string[] = data.groups.map((group: any) => {
            return group.name === '' ? group._id : group.name // chnage to group.name TODO
          })
          setOptionsForGroupNames(groupNameOptions1)
        })
        .catch((error) => {
          console.error('Error fetching data:', error)
        })
    }
  }, [reRenderGroupNamesList])

  /************************************************************************************
   * when the group name is selected, populate the slot name options with the slot names
   * and save the group id, collection name and slots data for later use
   * variables used: selectedGroupName, optionsForSlots, storeData, groupID, collectionName, slotsData
   ************************************************************************************/
  useEffect(() => {
    if (selectedGroupName === '' || selectedGroupName === 'Select Group') return
    let indexOfGroupInStoreData: number =
      optionsForGroupNames.indexOf(selectedGroupName)
    setGroupID(storeData[indexOfGroupInStoreData]['_id'])
    setCollectionName(storeData[indexOfGroupInStoreData]['collection'])
    setSlotsData(storeData[indexOfGroupInStoreData]['slots'])
    let slotNames: string[] = storeData[indexOfGroupInStoreData]['slots'].map(
      (slot: any) => {
        return slot.name === '' ? slot._id : slot.name
      },
    )
    setOptionsForSlots(slotNames)
  }, [selectedGroupName])

  /************************************************************************************
   * when the slot name is selected, save the slot id and slot type for later use
   * variables used: selectedSlot, optionsForSlots, slotsData, slotID, slotType
   ************************************************************************************/
  useEffect(() => {
    if (selectedSlot === '' || selectedSlot === 'Select Slot') return
    let indexOfSlotInSlotsData: number = optionsForSlots.indexOf(selectedSlot)
    setSlotID(slotsData[indexOfSlotInSlotsData]['_id'])
    setSlotType(slotsData[indexOfSlotInSlotsData]['itemTypes'][0])
  }, [selectedSlot])

  /************************************************************************************
   * when the attach SKU button is clicked, attach the SKU to the slot
   * variables used: SKUButtonClicked, SKUToattach, slotType, groupID, slotID,
   * isInMainBuilding, collectionName, reRenderSKUButton
   ************************************************************************************/
  useEffect(() => {
    if (SKUButtonClicked) {
      const checks3url =
        'https://everlite-video-assets.s3.ap-south-1.amazonaws.com/' +
        SKUToattach +
        '_l.glb'
      console.log(checks3url)
      fetch(checks3url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (response.status === 404) {
            console.log('SKU not found in S3')
            return
          }
          if (response.status === 200) {
            console.log('SKU found in S3')
            const baseUrl = import.meta.env.VITE_FASTAPI_BACKEND_URL
            const url = `${baseUrl}/items/upsert-or-create`
            const data = {
              name: '',
              sku: SKUToattach,
              itemType: slotType,
              groupId: groupID,
              slotId: slotID,
              isInMainBuilding: isInMainBuilding,
              collection: collectionName,
            }
            fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            })
              .then((response) => response.json())
              .then((data) => {
                console.log('Attached SKU:', data)
              })
              .catch((error) => {
                console.error('Error fetching data:', error)
              })
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error)
        })
    }
  }, [reRenderSKUButton])

  if (isDebugMode) {
    useControls(
      'JewellerySetup. 4-Set Item To Slot',
      () => ({
        storeName: {
          value: 'hub',
          options: StoreName,
          onChange: (value: string) => {
            setStoreName(value)
            console.log('Store Name', value)
          },
          label: 'Select Store',
        },
        'Fetch Store Details': button(() => {
          console.log('Button fetch group data clicked')

          setFetchAllGroupsInStoreButtonClicked(true)
          setReRenderGroupNamesList((prev) => {
            return !prev
          })
        }),
      }),
      { collapsed: true },
    )
    useControls(
      'JewellerySetup. 4-Set Item To Slot',
      () => ({
        groupName: {
          value:
            optionsForGroupNames.length === 0
              ? 'Select Group'
              : optionsForGroupNames[0],
          options: optionsForGroupNames,
          onChange: (value: string) => {
            console.log('Initial Group Name', value)
            if (value !== 'Select Group') {
              console.log('Group Name', value)
              setSelectedGroupName(value)
            }
          },
          label: 'Select Group',
        },
      }),
      { collapsed: true },
      [optionsForGroupNames],
    )
    const [, set] = useControls(
      'JewellerySetup. 4-Set Item To Slot',
      () => ({
        slotName: {
          value:
            optionsForSlots.length === 0 ? 'Select Slot' : optionsForSlots[0],
          options: optionsForSlots,
          onChange: (value: string) => {
            console.log('Slot Name', value)
            if (value !== 'Select Slot') {
              setSelectedSlot(value)
              let indexOfSlotInSlotsData: number =
                optionsForSlots.indexOf(value)
              set({
                SlotType: slotsData[indexOfSlotInSlotsData]['itemTypes'][0],
              })
              let indexOfGroupInStoreData: number =
                optionsForGroupNames.indexOf(selectedGroupName)
              set({
                CollectionName:
                  storeData[indexOfGroupInStoreData]['collection'],
              })
            }
          },
          label: 'Select Slot',
        },
        SlotType: {
          value: slotType,
          disabled: true,
          label: 'Slot Type',
        },
        IsInMainBuilding: {
          value: isInMainBuilding,
          label: 'Is In Main Building',
          onChange: (value: boolean) => {
            setIsInMainBuilding(value)
          },
        },
        CollectionName: {
          value: collectionName,
          disabled: true,
          label: 'Collection Name',
        },
        SKUToattach: {
          value: SKUToattach,
          label: 'SKU',
          onChange: (value: string) => {
            setSKUToattach(value)
          },
        },
        'Attach SKU': button(() => {
          console.log('Button attach SKU clicked')
          setSKUButtonClicked(true)
          setReRenderSKUButton((prev) => {
            return !prev
          })
        }),
      }),
      { collapsed: true },
      [optionsForSlots],
    )
  }
  return <></>
}
export default SetItemToSlot
