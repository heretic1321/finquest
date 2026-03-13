import { AuthAPIStore } from '@client/contexts/AuthContext'
import {
  Material,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
} from 'three'

// oscillates between 1 and -1 at a given frequency (in Hz)
export const oscillatorOneAndMinusOne = (
  elapsedTime: number,
  frequency: number,
) => {
  return Math.sign(Math.sin(elapsedTime * frequency))
}

export function getLocalStorageItem<T extends object>(
  key: string,
  object: T,
  defaultValue: keyof T,
): keyof T {
  const item = localStorage.getItem(key)
  return item && item in object ? (item as keyof T) : defaultValue
}

export const convertArrayToObject = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any>,
  U extends keyof T,
>(
  array: T[],
  key: U,
): Record<T[U], T> => {
  const objectified = array.reduce<T>((obj, item) => {
    return {
      ...obj,
      [item[key]]: item,
    }
  }, {} as T)

  return objectified
}

export const cleanupResources = (child: Object3D | Material | null) => {
  if (child == null) return
  if (child instanceof Mesh) {
    if (child.material !== null) {
      if (child.material instanceof MeshStandardMaterial) {
        if (child.material.envMap !== null) child.material.envMap?.dispose()
        // child.material.envMap = null
      } else if (child.material instanceof MeshPhysicalMaterial) {
        if (child.material.envMap !== null) child.material.envMap?.dispose()
        // child.material.envMap = null

        if (child.material.emissiveMap !== null)
          child.material.emissiveMap?.dispose()
        // child.material.emissiveMap = null
      }
    }

    if (child.material !== null) child.material.dispose()
    if (child.geometry !== null) child.geometry.dispose()

    // child.material = null
    // child.geometry = null
  } else if (child instanceof Material) {
    child.dispose()
  }
}

export const getRotationAllowedForItemTypes = (itemType: string): {
  x: boolean
  y: boolean
  z: boolean
} => {
  if (
    itemType == 'ring' || 
    itemType == 'ringhub' ||
    itemType == 'bracelethub' ||
    itemType == 'flatbracelet' ||
    itemType == 'bracelet' ||
    itemType == 'chainpendant'
  ) {
    return { x: true, y: true, z: false }
  }

  if (
    itemType == 'necklacehub' ||
    itemType == 'necklace'
  ) return { x: false, y: false, z: true }

  if (
    itemType == 'earring' ||
    itemType == 'earringhub' ||
    itemType == 'pendanthub' ||
    itemType == 'pendant'
  ) {
        return { x: true, y: false, z: true }
  }

  return { x: false, y: false, z: false }
}

export const sendGroupsIdealRotationToDB = async (
  groupId: string,
  idealRotation: [number, number, number],
) => {
  fetch(
    'http://localhost:8000/groups/idealRotation/' + groupId,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(idealRotation),
    }
  )
}
export const getUserID = () => {
  let userID = AuthAPIStore.getState().isLoggedIn
            ? AuthAPIStore.getState().userData?.uuid || ''
            : ''
  return userID
}