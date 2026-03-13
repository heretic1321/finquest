import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh'
import * as THREE from 'three'
import './index.css'
import App from './App.jsx'

THREE.Mesh.prototype.raycast = acceleratedRaycast
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
