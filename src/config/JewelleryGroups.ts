/**
 * README
 * - this file was used to store the static jewellery groups data
 * - this file is no longer used
 */

import { Euler } from '@react-three/fiber'
import * as THREE from 'three'

import { TBreakpointKeys } from '@client/utils/types'

export type TJewelleryGroupTriggerArea = {
  // position of the trigger area box
  position: THREE.Vector3Tuple
  // scale of the trigger area box
  scale: THREE.Vector3Tuple
  rotation?: Euler
  // position and target of the camera when presentation mode starts
  presentationCamera: {
    position: THREE.Vector3Tuple
    target: THREE.Vector3Tuple
    fov: number
  }
  showcaseCamera: {
    position: THREE.Vector3Tuple
    target: THREE.Vector3Tuple
    fov: number
  }
}

export type TJewelleryGroup = {
  name: string
  description: string
  items: TJewelleryItem[]
  triggerArea: TJewelleryGroupTriggerArea
}

export type TJewelleryItem = {
  sku: string
  showcaseModelScale: number
  showcaseModelRotation: Euler
  showcaseOffset: Record<TBreakpointKeys, number[]>
  position: [number, number, number]
}

// export const showcaseOffset = {
//   xxs: [0, 0, 0],
//   xs: [0, 0, 0],
//   sm: [0, 0, 0],
//   md: [1, 0, 0],
//   lg: [1, 0, 0],
//   xl: [2, 0, 0],
// }

export const showcaseOffset = {
  xxs: [0, 0, 0],
  xs: [0, 0, 0],
  sm: [0, 0, 0],
  md: [0, 0, 0],
  lg: [0, 0, 0],
  xl: [0, 0, 0],
}
