import { Object3D } from 'three'

export type PyObjectId = string

// Base model with an ID
export interface IBaseModelWithId {
  _id: PyObjectId
}

// User model
export interface IUser extends IBaseModelWithId {
  phoneNumber: string
  avatarUrl?: string
  rpmId?: string
}

export type TItemType =
  | 'ring'
  | 'bracelet'
  | 'necklace'
  | 'earring'
  | 'pendant'
  | 'charm'
  | 'watch'
  | 'other'


export type IItemTypeExtended =
  | 'ring'
  | 'bracelet'
  | 'necklace'
  | 'earring'
  | 'pendant'
  | 'ringhub'
  | 'earringhub'
  | 'necklacehub'
  | 'pendanthub'
  | 'bracelethub'
  | 'flatbracelet'
  
export type TCollection =
  | 'everlite'
  | 'rajwada'
  | 'sutra'
  | 'shagun'
  | 'colours'
  | 'spectra'
  | 'cera'
  | 'mariposa'
  | 'lotus'
  | 'sruti'
  | 'other'

// Item model
export interface IItem extends IBaseModelWithId {
  name: string
  highPolyModelConfig: {
    position: [number, number, number]
    rotation: [number, number, number]
    scale: [number, number, number]
  }
  lowPolyModelConfig: {
    scaleFactor: number
  }
  sku: string
  itemType: TItemType
  groupId?: string
  slotId?: string
  isInMainBuilding: boolean
  collection: TCollection
  lowPolyScene?: Object3D
  highPolyScene?: Object3D
}

// ItemConfig model
export interface IItemConfig {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

export type TTriggerArea = {
  // position of the trigger area box
  position: [number, number, number]
  // scale of the trigger area box
  scale: [number, number, number]
  rotation: [number, number, number]
  // position and target of the camera when presentation mode starts
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
  radiusX: number
  radiusY: number
  newPosition?: [number, number, number]
  newRotationY?: number
}

// Slot model
export interface ISlot extends IBaseModelWithId {
  name: string
  itemTypes: TItemType[]
  itemTransform: { [key in TItemType]?: IItemConfig }
}

// Group model
export interface IGroup extends IBaseModelWithId {
  name: string
  collection: TCollection
  slots: ISlot[]
  triggerArea: TTriggerArea
  idealRotation: [number, number, number]
}

export interface IGroupWithItems extends IGroup {
  slots: (ISlot & { item?: IItem })[]
}
