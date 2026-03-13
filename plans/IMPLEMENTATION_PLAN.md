# Implementation Plan: FinQuest 3D Layer Replacement

Based on thorough analysis of both codebases, here is the detailed implementation plan.

## Architecture Summary

**everlite-store** uses a layered architecture:
1. **Zustand stores** (contexts/) as the single source of truth for all state: `genericStore`, `MapStore`, `CameraControlsStore`, `AvatarStore`, `GesturesAndDeviceStore`
2. **Hooks** that consume those stores and manage systems: `useMap`, `useCameraControls`, `useSpringArm`, `useCharacterControls`
3. **Components** that render the 3D scene: `Character/index.tsx`, `Avatar.tsx`, `Generic.tsx`, `Water.tsx`, `Effects.tsx`, `Environment.tsx`
4. **Config files** that hold tunable constants: `Canvas.ts`, `Avatar.ts`, `MapConfig.ts`, `staticResourcePaths.ts`
5. **Frame-loop components** that run every frame: `CameraFollowCharacter.tsx`, `SpringArm.tsx`

The physics system is BVH-based (three-mesh-bvh): the map GLB is loaded, all collidable meshes are merged into a single geometry via `StaticGeometryGenerator`, a `MeshBVH` bounds tree is computed on it, and character collision is done via capsule-vs-BVH shapecast every frame in `Character/index.tsx`'s `performFixedUpdate`.

**Key differences to handle:**
- everlite-store is TypeScript; FinQuest is JavaScript -- all type annotations must be stripped
- everlite-store uses `@client/` path aliases; FinQuest uses relative imports
- everlite-store uses React 18 + three 0.151 + drei 9; FinQuest uses React 19 + three 0.183 + drei 10 + fiber 9
- everlite-store has `sRGBEncoding` (deprecated in newer three.js -- must use `SRGBColorSpace` instead)
- everlite-store's `three-mesh-bvh` is 0.6.8; we need a version compatible with three 0.183
- The `@react-three/postprocessing` API changed between v2 and v3 (FinQuest already has v3)

---

## Phase 0: Cleanup

**What to delete from FinQuest `src/`:**

| Path | Reason |
|------|--------|
| `src/components/world/` (entire directory) | Replaced by everlite-store systems |
| `src/components/npcs/NPC.jsx` | Replaced by new NPC system |
| `src/components/npcs/NPCList.jsx` | Replaced by new NPC system |
| `src/components/npcs/NPCModel.jsx` | Replaced by new NPC system |
| `src/components/ui/` (entire directory) | Will rebuild with new patterns |
| `src/hooks/useControlMode.js` | Replaced by useCharacterControls |
| `src/hooks/useInteract.js` | Will rebuild |
| `src/hooks/useInteraction.js` | Will rebuild |
| `src/data/keyboardMap.js` | Replaced by useCharacterControls key map |
| `src/data/assetRegistry.js` | No longer needed |
| `src/App.jsx` | Complete rewrite |

**npm packages to REMOVE:**
```
@react-three/rapier
ecctrl
```

**npm packages to ADD:**
```
three-mesh-bvh
maath
postprocessing (peer dep of @react-three/postprocessing -- may already be transitive)
three-stdlib (for SkeletonUtils, OrbitControls base -- may already be transitive via drei)
```

**npm packages already present that we KEEP:**
```
@react-three/drei (^10.7.7)
@react-three/fiber (^9.5.0)
@react-three/postprocessing (^3.0.4)
three (^0.183.2)
zustand (^5.0.11)
howler (^2.2.4)
leva (^0.10.1)
```

**Assets:** FinQuest already has key animation GLBs, avatar GLBs, skybox PNGs, water texture, and world GLB. No additional asset copying needed.

---

## Phase 1: Foundation (Sequential -- must be done first)

All Phase 2 tasks depend on these files existing.

### Task 1.1: Create `src/stores/worldStore.js`

**Purpose:** Simplified merge of `genericStore` + `MapStore` + `CameraControlsStore` + `AvatarStore` + `GesturesAndDeviceStore`

**Source files:**
- `references/everlite-store/client/src/contexts/GlobalStateContext.tsx`
- `references/everlite-store/client/src/contexts/MapContext.tsx`
- `references/everlite-store/client/src/contexts/CameraControlsContext.tsx`
- `references/everlite-store/client/src/contexts/AvatarAppearanceContext.tsx`

**Recommended structure — 3 stores:**
1. `worldStore.js` -- map state (collider, mapModel, geometry), global flags (isTabFocused, areEffectsEnabled, loading, dpr)
2. `cameraStore.js` -- orbitControlsRef, config, makeCameraFollowCharacter, camera movement flags
3. `playerStore.js` -- avatarAnimationState, characterRef, isCharacterRefReady, player config (maxSpeed, jumpDistance, etc.)

**What to strip:** All multiplayer, VR, store/inventory, dance floor, debug, auth, networking, presentation mode code.

**What to keep:** isTabFocused + tab listeners, characterRef, areEffectsEnabled, collider/mapModel/geometry, orbitControlsRef, orbitDistance, camera movement flags, orbitControlsConfig (third-person only), makeCameraFollowCharacter, avatarAnimationState, isTouchDevice, dpr, loading_initialSpawn.

### Task 1.2: Create `src/config/canvas.js`

**Source:** `config/Canvas.ts`
**Adaptation:** Strip TS. Set `shadows: false`, `far: 500`.

### Task 1.3: Create `src/config/avatar.js`

**Source:** `config/Avatar.ts`
**Adaptation:** Update paths to FinQuest locations (`./models/characters/feb.glb` etc.).

### Task 1.4: Create `src/config/staticResourcePaths.js`

**Source:** `config/staticResourcePaths.ts`
**Adaptation:** Replace ALL paths with FinQuest equivalents. Remove jewellery, meteor, dance, portal paths.

### Task 1.5: Create `src/utils/commonMaterials.js`

**Source:** `utils/commonMaterials.ts`
**Adaptation:** Direct port, strip types. ~29 lines.

### Task 1.6: Copy `src/utils/modifiedOrbitControls/index.js`

**Source:** `utils/modifiedOrbitControls/index.js`
**Adaptation:** Already plain JS. Direct copy.

### Task 1.7: Set up BVH prototypes in `src/main.jsx`

Add to main.jsx:
```js
import { acceleratedRaycast, computeBoundsTree } from 'three-mesh-bvh'
import * as THREE from 'three'
THREE.Mesh.prototype.raycast = acceleratedRaycast
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
```

---

## Phase 2: Core Systems (Parallelizable)

Each task can be worked on independently after Phase 1.

### Task 2A: Map/World Loader (`useMap`)

**Source:** `hooks/useMap.ts`
**Target:** `src/hooks/useMap.js`
**Dependencies:** Task 1.1, 1.4, 1.5

**What to strip:** ALL instance handling, ALL store handling, ALL garden/grass/branding/portal handling, Water2 import.

**What to keep (~40 lines of core logic):**
1. Load GLB with `useGLTF(staticResourcePaths.newEnvironment)`
2. Traverse scene, collect all meshes into collider group
3. Use `StaticGeometryGenerator` to merge geometries
4. Create `MeshBVH` on merged geometry
5. Store collider, mapModel, geometry in worldStore
6. Add scene to three.js scene

### Task 2B: Character Controller

**Source:** `components/Character/index.tsx` (1300+ lines)
**Target:** `src/components/Character/index.jsx`
**Dependencies:** Task 1.1, 2A, 2H

**What to strip:** ALL VR, ALL multiplayer, ALL showcase/presentation mode, ALL leva debug, ALL dance floor, first-person camera mode.

**What to keep (the physics core):**
- PlayerConfigStore equivalent (maxSpeed, jumpDistance, deathHeight, playerSpawnPosition)
- capsuleInfo (radius: 0.5, segment)
- movementDataRef initialization
- handlePlayerInput -- keyboard branch only
- performFixedUpdate -- BVH capsule collision loop
- updatePlayer -- fixed timestep accumulator
- useFrame calling updatePlayer
- useImperativeHandle for ref forwarding
- Avatar rendering
- RoundedBox collision mesh

### Task 2C: Avatar + Animation System

**Source:** `Avatar.tsx` + `avatars/Generic.tsx`
**Target:** `src/components/Avatar.jsx` + `src/components/avatars/Generic.jsx`
**Dependencies:** Task 1.1, 1.3, 1.4

**Simplified Generic.jsx:**
- Load avatar GLB via useGLTF (feb.glb as default)
- Load 4 animation GLBs: Idle, Walk, Run, Jump
- useAnimations to bind them
- SkeletonUtils.clone() for scene
- Reset Hips position each frame (root motion cancellation)

**Simplified Avatar.jsx:**
- Single useEffect watching avatarAnimationState from playerStore
- Fade in/out animations on state change
- No dance, no other-player handling

### Task 2D: Camera System

**Source:** `hooks/useCameraControls.ts` + `hooks/useSpringArm.ts` + `CameraFollowCharacter.tsx` + `SpringArm.tsx`
**Target:** `src/hooks/useCameraControls.js` + `src/hooks/useSpringArm.js` + `src/components/CameraFollowCharacter.jsx` + `src/components/SpringArm.jsx`
**Dependencies:** Task 1.1, 1.6

**Strip:** All leva, presentation mode, first-person mode, unity-like controls. Keep only third-person OrbitControls.

### Task 2E: Water

**Source:** `components/Water.tsx`
**Target:** `src/components/Water.jsx`
**Dependencies:** Task 1.1 (minimal)

**Adapt:** `sRGBEncoding` -> `SRGBColorSpace`. Water texture path: `'./textures/water.jpg'`.

### Task 2F: Environment (Skybox + Fog)

**Source:** `components/Environment.tsx`
**Target:** `src/components/EnvironmentSetup.jsx`
**Dependencies:** None

**Keep:** fog with defaults (near=100, far=262.5), cubemap skybox from `./skybox/`.

### Task 2G: Post-Processing (Effects)

**Source:** `components/Effects.tsx`
**Target:** `src/components/Effects.jsx`
**Dependencies:** Task 1.1 (minimal)

**Adapt:** Use regular `Bloom` instead of `SelectiveBloom` for v3 compatibility. Keep SMAA + DepthOfField + Bloom + lights.

### Task 2H: Input System (useCharacterControls)

**Source:** `hooks/useCharacterControls.ts`
**Target:** `src/hooks/useCharacterControls.js`
**Dependencies:** Task 1.1

**Strip:** ALL joystick/nipplejs, ALL HUD/inventory guards, ALL sounds. Keep: key map (WASD+Space+Shift), handleKey for keydown/keyup, jumped function. ~60 lines.

---

## Phase 3: Integration (Sequential, after Phase 2)

### Task 3.1: Rewrite `src/App.jsx`

```jsx
function App() {
  return (
    <>
      <Canvas {...canvasConfig} dpr={0.8}>
        <Suspense fallback={null}>
          <EnvironmentSetup />
          <MapLoader />
          <CameraSetup />
          <Experience />
          <Effects />
        </Suspense>
      </Canvas>
      <GameUI />
    </>
  )
}
```

### Task 3.2: Create `src/Experience.jsx`

```jsx
function Experience() {
  const characterRef = useRef(null)
  const collider = useWorldStore(s => s.collider)
  if (!collider) return null

  return (
    <>
      <Water />
      <Character ref={characterRef} gravity={-35} />
      <CharacterDependentComponents characterRef={characterRef} />
    </>
  )
}
```

### Task 3.3: Testing Checklist

1. Page loads without errors
2. Map GLB visible
3. Player avatar appears at spawn
4. Player falls to ground (gravity)
5. WASD moves player
6. Shift = run, Space = jump
7. Camera follows with orbit controls
8. Mouse drag rotates camera, scroll zooms
9. Water renders with animation
10. Skybox visible, fog renders
11. Player doesn't fall through ground
12. Player collides with walls

---

## Phase 4: FinQuest-Specific Features

### Task 4.1: NPC System
Port TutorialNPC pattern. Each NPC: loads GLB, has trigger area, rotates to face player, plays idle animation, triggers gameStore.setDialogue().

### Task 4.3: HUD Hookup
Rebuild BankHUD, DialogueBox, InteractionPrompt as DOM overlays reading from gameStore.js.

---

## Agent Parallelization Guide

### Dependency Graph

```
Phase 0 (Cleanup)
    |
    v
Phase 1 (Foundation) -- SEQUENTIAL
    Tasks 1.1-1.7 must all complete before Phase 2
    |
    v
Phase 2 (Core Systems) -- PARALLEL (8 tasks, 3-4 agents)
    2A (Map)       -- depends on 1.1, 1.4, 1.5
    2B (Character) -- depends on 1.1, 2A*, 2H*
    2C (Avatar)    -- depends on 1.1, 1.3, 1.4
    2D (Camera)    -- depends on 1.1, 1.6
    2E (Water)     -- depends on 1.1 (minimal)
    2F (Env)       -- standalone
    2G (Effects)   -- depends on 1.1 (minimal)
    2H (Input)     -- depends on 1.1
    |
    v
Phase 3 (Integration) -- SEQUENTIAL
    3.1 App.jsx -> 3.2 Experience.jsx -> 3.3 Testing
    |
    v
Phase 4 (FinQuest Features) -- PARALLEL
    4.1 (NPCs) + 4.3 (HUD) can be parallel
```

### Recommended Agent Team (4 agents)

**Agent 1: Foundation + Integration Lead**
- Phase 0: Cleanup
- Phase 1: All foundation tasks (1.1-1.7)
- Phase 3: App.jsx + Experience.jsx wiring + testing

**Agent 2: Physics Agent (Character + Map)**
- Task 2A: Map/World loader
- Task 2B: Character controller
- Task 2H: Input system
- (These three are tightly coupled)

**Agent 3: Rendering Agent (Camera + Visuals)**
- Task 2C: Avatar + Animation
- Task 2D: Camera system
- Task 2E: Water
- Task 2F: Environment
- Task 2G: Effects

**Agent 4: Game Features Agent**
- Task 4.1: NPC system
- Task 4.3: HUD hookup

### Strict Ordering Constraints

1. Phase 1 MUST complete before any Phase 2
2. Task 2B needs 2A (collider) and 2H (input)
3. Phase 3 needs ALL Phase 2 complete
4. Phase 4 needs Phase 3 complete

### Maximum Parallelism

- Set A: {2A, 2D, 2E, 2F, 2G} -- all independent
- Set B: {2C, 2H} -- independent of each other and Set A
- Set C: {2B} -- depends on 2A and 2H being done
- Agent 2 does 2H → 2A → 2B. Agent 3 does 2E+2F+2G → 2D → 2C.
