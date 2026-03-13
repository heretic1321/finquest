import { Vector3Tuple } from 'three'

import { TransformLite } from '@client/utils/commonTypes'

export type TInventoryConsoleConfig = {
  name: string
  id: number
  CollectionID: number
  transform: {
    position: Vector3Tuple
    rotation: Vector3Tuple
    scale: Vector3Tuple
  }
  TriggerScale: Vector3Tuple
}

type TInventoryConsoleButtonConfig = {
  forwardButtonTransform: TransformLite
  backwardButtonTransform: TransformLite
  buyButtonTransform: TransformLite
  addToCartButtonTransform: TransformLite
  viewMoreButtonTransform: TransformLite
  quitButtonTransform: TransformLite
}

export const InventoryConsoleButtonConfig: TInventoryConsoleButtonConfig = {
  forwardButtonTransform: {
    position: [0.49, 1.2, -0.24],
    rotation: [0, 0, 0],
    scale: [0.1, 0.1, 0.1],
  },
  backwardButtonTransform: {
    position: [-0.49, 1.2, -0.24],
    rotation: [0, 0, 0],
    scale: [0.2, 0.2, 0.2],
  },
  buyButtonTransform: {
    position: [0.22, 1.2, -0.04],
    rotation: [0, 0, 0],
    scale: [0.2, 0.2, 0.2],
  },
  addToCartButtonTransform: {
    position: [-0.22, 1.2, -0.04],
    rotation: [0, 0, 0],
    scale: [0.2, 0.2, 0.2],
  },
  viewMoreButtonTransform: {
    position: [0.22, 1.2, -0.52],
    rotation: [0, 0, 0],
    scale: [0.2, 0.2, 0.2],
  },
  quitButtonTransform: {
    position: [-0.22, 1.2, -0.52],
    rotation: [0, 0, 0],
    scale: [0.2, 0.2, 0.2],
  },
}
