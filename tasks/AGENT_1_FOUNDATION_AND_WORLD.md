# AGENT 1: Foundation + World + Environment + Integration

**This agent owns**: Stores, configs, utilities, map loading, water, environment, effects, App.jsx, Experience.jsx

**Does NOT touch**: Character controller, avatar, camera, spring arm, input system (Agent 2 owns those)

**Reference codebase**: `/home/heretic/Documents/Projects/iiitd-hackathon/references/everlite-store/client/src/`

**All code is JavaScript (NOT TypeScript)** — strip all type annotations, interfaces, generics.
**Use relative imports** — NOT `@client/` path aliases.
**Three.js 0.183** — use `SRGBColorSpace` instead of `sRGBEncoding`.

---

## Task 1: Zustand Stores (`src/stores/`)

### 1A: `src/stores/worldStore.js`

Create a Zustand store combining simplified `genericStore` + `MapStore`:

```js
import { create } from 'zustand'
import { createRef } from 'react'

const useWorldStore = create((set, get) => ({
  // Tab focus
  isTabFocused: true,

  // Map/collision state
  collider: null,        // THREE.Mesh with BVH boundsTree
  mapModel: null,        // THREE.Group (the loaded GLB scene)
  geometry: null,        // THREE.BufferGeometry (merged collider geometry)

  // Loading state
  loading_initialSpawn: true,

  // Effects
  areEffectsEnabled: false,

  // DPR
  dpr: 0.8,

  // Character ref (set by Character component)
  isCharacterRefReady: false,
  characterRef: createRef(),

  // Actions
  setCollider: (collider) => set({ collider }),
  setMapModel: (mapModel) => set({ mapModel }),
  setGeometry: (geometry) => set({ geometry }),
  setLoading: (loading_initialSpawn) => set({ loading_initialSpawn }),
  setCharacterRef: (ref) => set({ characterRef: ref, isCharacterRefReady: true }),
}))

// Tab focus listener (call once in App)
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    useWorldStore.setState({ isTabFocused: !document.hidden })
  })
}

export default useWorldStore
```

**Source ref**: `contexts/GlobalStateContext.tsx` (lines 74-140), `contexts/MapContext.tsx` (lines 73-111)

### 1B: `src/stores/playerStore.js`

```js
import { create } from 'zustand'
import { createRef } from 'react'

// Animation states: 'idle' | 'walk' | 'run' | 'jump'
const usePlayerStore = create((set) => ({
  avatarAnimationState: 'idle',
  setAvatarAnimationState: (state) => set({ avatarAnimationState: state }),

  avatarData: { avatarPath: './models/characters/feb.glb' },
  hasAvatarBeenSelected: true, // always true for FinQuest (no avatar picker)
}))

export default usePlayerStore

// Player physics config (separate store, no reactivity needed)
export const PlayerConfigStore = create(() => ({
  maxSpeed: 4,
  jumpDistance: 15,
  deathHeight: -5.1,
  playerSpawnPosition: [0, 10, 0],  // Will adjust for FinQuest map
  isPlayerParalysedRef: createRef(),  // Set to true during NPC dialog
  resetFn: null,
}))
```

**Source ref**: `contexts/AvatarAppearanceContext.tsx` (lines 43-94), `components/Character/index.tsx` (PlayerConfigStore near top)

### 1C: `src/stores/cameraStore.js`

```js
import { create } from 'zustand'
import { createRef } from 'react'
import * as THREE from 'three'

const useCameraStore = create((set, get) => ({
  orbitControlsRef: createRef(),

  orbitDistance: 6,

  // Camera movement tracking
  isCameraMovingByUserMove: createRef(),   // .current = bool
  isCameraMovingByUserZoom: createRef(),
  isCameraMovingByUserDrag: createRef(),
  isCameraMovingByAnyUserAction: createRef(),

  // Third-person config
  orbitControlsConfig: {
    enablePan: false,
    enableZoom: true,
    enableDamping: true,
    dampingFactor: 0.2,
    maxDistance: 9,
    minDistance: 1.5,
    minPolarAngle: 1,
    maxPolarAngle: 2,
    rotateSpeed: 0.8,
    zoomSpeed: 0.3,
    enableRotate: true,
  },

  // Camera follow function
  makeCameraFollowCharacter: () => {
    const state = get()
    const controls = state.orbitControlsRef.current
    if (!controls) return

    const characterRef = useWorldStore_ref.current
    if (!characterRef) return

    const playerPos = characterRef.position
    const targetY = playerPos.y + 2 // head height offset

    controls.target.lerp(
      new THREE.Vector3(playerPos.x, targetY, playerPos.z),
      0.15
    )
    controls.update()
  },
}))

// NOTE: The makeCameraFollowCharacter needs access to the character's position.
// The Character component stores its group ref in worldStore.characterRef.
// Wire this up in the actual implementation by reading from worldStore.

export default useCameraStore
```

**Source ref**: `contexts/CameraControlsContext.tsx` (lines 67-199)

### 1D: `src/stores/hudStore.js`

```js
import { create } from 'zustand'

const useHudStore = create((set) => ({
  hasStartButtonBeenPressed: true,  // true for FinQuest (no start screen initially)
  showJoystick: false,
  jumpButtonTapped: false,
  showDialogScreen: false,

  setShowDialogScreen: (show) => set({ showDialogScreen: show }),
  setJumpButtonTapped: (tapped) => set({ jumpButtonTapped: tapped }),
}))

export default useHudStore
```

### 1E: `src/stores/gestureStore.js`

```js
import { create } from 'zustand'

const useGestureStore = create((set) => ({
  isTouchDevice: false,
  isPinchOrScrollEventActive: false,
  isDragEventActive: false,
  screenSize: { width: window.innerWidth, height: window.innerHeight },

  setIsTouchDevice: (v) => set({ isTouchDevice: v }),
  setScreenSize: (size) => set({ screenSize: size }),
}))

// Detect touch device
if (typeof window !== 'undefined') {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  useGestureStore.setState({ isTouchDevice })

  window.addEventListener('resize', () => {
    useGestureStore.setState({
      screenSize: { width: window.innerWidth, height: window.innerHeight }
    })
  })
}

export default useGestureStore
```

---

## Task 2: Config Files (`src/config/`)

### 2A: `src/config/canvas.js`

```js
export const canvasConfig = {
  shadows: false,
  camera: { fov: 60, near: 0.1, far: 500, position: [3, 2, 6] },
}
```

**Source ref**: `config/Canvas.ts`

### 2B: `src/config/avatar.js`

```js
export const AvatarOptions = {
  feb: {
    gltfFilePath: './models/characters/feb.glb',
    scale: 2,
    position: [0, -1.5, 0],
    rotation: [0, Math.PI, 0],
  },
  may: {
    gltfFilePath: './models/characters/may.glb',
    scale: 2,
    position: [0, -1.5, 0],
    rotation: [0, Math.PI, 0],
  },
}
```

**Source ref**: `config/Avatar.ts`

### 2C: `src/config/staticResourcePaths.js`

```js
export const staticResourcePaths = {
  newEnvironment: './models/world.glb',

  gltfFilePaths: {
    feb: './models/characters/feb.glb',
    may: './models/characters/may.glb',
    sia: './models/characters/Female.glb',
  },

  animations: {
    idle: './models/animations/Standing_Idle.glb',
    walk: './models/animations/Walk.glb',
    run: './models/animations/Run.glb',
    jump: './models/animations/Jump_2.glb',
  },

  skyboxPath: './skybox/',
  waterTexture: './textures/water.jpg',
}
```

**Source ref**: `config/staticResourcePaths.ts`

---

## Task 3: Utilities (`src/utils/`)

### 3A: `src/utils/commonMaterials.js`

```js
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
```

**Source ref**: `utils/commonMaterials.ts`

### 3B: Copy `src/utils/modifiedOrbitControls/index.js`

**Direct copy** from `references/everlite-store/client/src/utils/modifiedOrbitControls/index.js`
This is already plain JavaScript. Copy as-is.

---

## Task 4: Map/World Loader (`src/hooks/useMap.js`)

**Source ref**: `hooks/useMap.ts` — HEAVILY simplified. Keep only the BVH core.

Load the world GLB, traverse all meshes, merge into a single BVH collider, store in worldStore.

Key imports: `useGLTF` from drei, `StaticGeometryGenerator` + `MeshBVH` from three-mesh-bvh.

The collider mesh should be invisible. The visible model is the GLB scene added to the three.js scene directly.

Filter out meshes with names containing: store, jewel, shop, portal, screen, branding, digigold, display, machine, inventory, console, hovering, particle.

**IMPORTANT**: Call `colliderGroup.updateMatrixWorld(true)` before generating static geometry.

---

## Task 5: Water (`src/components/Water.jsx`)

**Source ref**: `components/Water.tsx` — Nearly direct port.

- PlaneGeometry 220x220, 127x127 segments
- Rotated -PI/2 on X
- DynamicDrawUsage on position attribute
- water.jpg texture with RepeatWrapping (6x6)
- MeshStandardMaterial: color #29a6db, metalness 0, roughness 0.08, bumpMap + displacementMap
- useFrame: sinusoidal vertex Y animation (amplitude 0.44, factors 5.2 and 6.49)
- **FIX**: Use `SRGBColorSpace` not `sRGBEncoding`
- Position at y = -0.5 or so (adjust for map)

---

## Task 6: Environment (`src/components/EnvironmentSetup.jsx`)

**Source ref**: `components/Environment.tsx`

- `<fog attach="fog" args={['#87CEEB', 80, 300]} />` (lighter blue for island)
- `<Environment background files={['px.png','nx.png','py.png','ny.png','pz.png','nz.png']} path="./skybox/" />`

---

## Task 7: Post-Processing (`src/components/Effects.jsx`)

**Source ref**: `components/Effects.tsx`

- EffectComposer with multisampling={0}
- SMAA antialiasing
- Bloom (NOT SelectiveBloom — use regular Bloom for v3 compat)
  - intensity: 3, luminanceThreshold: 0.8, luminanceSmoothing: 0.5
- Directional light: position [-93, 202, -177], intensity 0.5
- Hemisphere light: color white, groundColor #223344, intensity 0.3
- Conditionally render based on `areEffectsEnabled` from worldStore

---

## Task 8: App.jsx + Experience.jsx (Integration)

### 8A: `src/App.jsx`

```jsx
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { canvasConfig } from './config/canvas'
import Experience from './Experience'
import Effects from './components/Effects'
import EnvironmentSetup from './components/EnvironmentSetup'

export default function App() {
  return (
    <Canvas {...canvasConfig} dpr={0.8} style={{ width: '100%', height: '100%' }}>
      <Suspense fallback={null}>
        <EnvironmentSetup />
        <Experience />
        <Effects />
      </Suspense>
    </Canvas>
  )
}
```

### 8B: `src/Experience.jsx`

```jsx
import { useRef } from 'react'
import useWorldStore from './stores/worldStore'
import useMap from './hooks/useMap'
import Water from './components/Water'
import Character from './components/Character'
import CameraFollowCharacter from './components/CameraFollowCharacter'
import SpringArm from './components/SpringArm'

function MapLoader() {
  useMap()
  return null
}

function CharacterDependentComponents() {
  const isReady = useWorldStore(s => s.isCharacterRefReady)
  if (!isReady) return null

  return (
    <>
      <SpringArm />
      <CameraFollowCharacter />
    </>
  )
}

export default function Experience() {
  const collider = useWorldStore(s => s.collider)

  return (
    <>
      <MapLoader />
      <Water />
      {collider && (
        <>
          <Character />
          <CharacterDependentComponents />
        </>
      )}
    </>
  )
}
```

---

## Files This Agent Creates (Summary)

| # | File | Lines (approx) |
|---|------|----------------|
| 1 | `src/stores/worldStore.js` | 40 |
| 2 | `src/stores/playerStore.js` | 25 |
| 3 | `src/stores/cameraStore.js` | 55 |
| 4 | `src/stores/hudStore.js` | 15 |
| 5 | `src/stores/gestureStore.js` | 25 |
| 6 | `src/config/canvas.js` | 5 |
| 7 | `src/config/avatar.js` | 15 |
| 8 | `src/config/staticResourcePaths.js` | 20 |
| 9 | `src/utils/commonMaterials.js` | 15 |
| 10 | `src/utils/modifiedOrbitControls/index.js` | ~800 (copy) |
| 11 | `src/hooks/useMap.js` | 80 |
| 12 | `src/components/Water.jsx` | 65 |
| 13 | `src/components/EnvironmentSetup.jsx` | 20 |
| 14 | `src/components/Effects.jsx` | 50 |
| 15 | `src/App.jsx` | 20 |
| 16 | `src/Experience.jsx` | 40 |

**Total**: ~16 files
