// Stub — stripped Colyseus decorators, kept types for client compatibility
import { AnimationStates } from '../../utils/types'

class Vector3 {
  x = 0
  y = 0
  z = 0

  constructor(x?: number | { x: number; y: number; z: number }, y?: number, z?: number) {
    if (typeof x === 'object') {
      this.x = x.x
      this.y = x.y
      this.z = x.z
    } else if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
      this.x = x
      this.y = y
      this.z = z
    }
  }

  set(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
    return this
  }

  lerp(v: Vector3, alpha: number) {
    this.x += (v.x - this.x) * alpha
    this.y += (v.y - this.y) * alpha
    this.z += (v.z - this.z) * alpha
    return this
  }
}

export class Player {
  id = ''
  position: Vector3 = new Vector3()
  scale: Vector3 = new Vector3()
  rotation: Vector3 = new Vector3()
  animationState: AnimationStates = 'idle'
  displayName = ''
  avatarPath = './assets/avatars/feb.glb'

  constructor(
    id?: string,
    position?: Vector3,
    scale?: Vector3,
    rotation?: Vector3,
  ) {
    if (id) this.id = id
    if (position) this.position = new Vector3(position)
    if (scale) this.scale = new Vector3(scale)
    if (rotation) this.rotation = new Vector3(rotation)
  }
}

export class MyRoomState {
  players = new Map<string, Player>()
}
