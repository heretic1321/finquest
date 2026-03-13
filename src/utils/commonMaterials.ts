import {
  Euler,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Vector3,
} from 'three'

// Create a transparent material
export const transparentMaterial = new MeshBasicMaterial({
  transparent: true,
  opacity: 0, // Completely transparent
})

export const dummyWireframeMaterial = new MeshBasicMaterial({
  color: 'blue',
  wireframe: true,
  visible: false,
})

export const dummyMesh = new Mesh(
  new PlaneGeometry(1, 1),
  dummyWireframeMaterial,
)

export const zeroVector = new Vector3(0, 0, 0)
export const oneVector = new Vector3(1, 1, 1)
export const zeroEuler = new Euler(0, 0, 0)
