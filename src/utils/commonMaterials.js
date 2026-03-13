import * as THREE from 'three'

export const dummyMesh = new THREE.Mesh()
export const dummyWireframeMaterial = new THREE.MeshBasicMaterial({ wireframe: true, visible: false })
export const zeroVector = new THREE.Vector3(0, 0, 0)
export const oneVector = new THREE.Vector3(1, 1, 1)
export const zeroEuler = new THREE.Euler(0, 0, 0)
export const upVector = new THREE.Vector3(0, 1, 0)
export const tempVector = new THREE.Vector3()
export const tempVector2 = new THREE.Vector3()
export const tempBox = new THREE.Box3()
export const tempMat = new THREE.Matrix4()
export const tempSegment = new THREE.Line3()
