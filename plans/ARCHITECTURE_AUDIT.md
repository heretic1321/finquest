# ARCHITECTURE AUDIT: everlite-store to FinQuest Migration

## 1. DEPENDENCY GRAPH (Porting Order)

Port bottom-up:

**Layer 0 -- Zero Dependencies (Port First)**
- `utils/commonTypes.ts` -- Type definitions (Transform, TransformLite, etc.)
- `utils/commonMaterials.ts` -- Shared THREE objects (dummyMesh, zeroVector, etc.)
- `config/Canvas.ts` -- Canvas configuration object
- `config/Avatar.ts` -- Avatar scale/position/rotation config
- `config/staticResourcePaths.ts` -- All asset paths (MUST rewrite for FinQuest assets)
- Local type: `AnimationStates` -- currently imported from `@server/utils/types`. It is simply `type AnimationStates = 'idle' | 'walk' | 'run' | 'jump' | 'dance'`. Inline this.

**Layer 1 -- Zustand Stores (Port Second)**
- `contexts/GesturesAndDeviceContext.tsx` + `hooks/useGesturesAndDevice.ts`
- `contexts/GlobalStateContext.tsx`
- `contexts/HUDContext.tsx`
- `contexts/AvatarAppearanceContext.tsx`
- `contexts/CameraControlsContext.tsx`
- `contexts/MapContext.tsx`

**Layer 2 -- Modified OrbitControls (Port Third)**
- `utils/modifiedOrbitControls/index.js` + `index.d.ts` (~29KB vendored/modified OrbitControls)

**Layer 3 -- Core Hooks (Port Fourth)**
- `hooks/useCameraControls.ts` -- Depends on: CameraControlsStore, GesturesAndDeviceStore, genericStore, HUDStore, modified OrbitControls
- `hooks/useMap.ts` -- MOST COMPLEX (~1500 lines). Depends on: MapStore, MaterialStore, staticResourcePaths, commonMaterials
- `hooks/useSpringArm.ts` -- Depends on: CameraControlsStore, GesturesAndDeviceStore, MapStore, AvatarStore
- `hooks/useCharacterControls.ts` -- Depends on: PlayerConfigStore, SoundsStore, AvatarStore, GesturesAndDeviceStore, HUDStore

**Layer 4 -- Core Components (Port Fifth)**
- `components/Character/index.tsx` (1465 lines) -- Depends on: ALL stores, useCharacterControls, Avatar, useMap collider
- `components/Avatar.tsx` -- Depends on: AvatarStore, NetworkingStore (strip), Generic component
- `components/avatars/Generic.tsx` -- Depends on: AvatarStore, staticResourcePaths, CollectionContext (strip)

**Layer 5 -- Scene Components (Port Sixth)**
- `CameraFollowCharacter.tsx`, `SpringArm.tsx`, `Water.tsx`, `Effects.tsx`, `Environment.tsx`

**Layer 6 -- Scene Orchestrator (Port Last)**
- `Experience.tsx`, `main.tsx`

---

## 2. PER-SYSTEM BREAKDOWN

### 2.1 Character Controller (`components/Character/index.tsx`)

**What it does**: Complete custom physics character controller using BVH capsule collision:
- Capsule collision (radius 0.5, segment [0,0,0] to [0,-1,0])
- Gravity (-35 default)
- Fixed timestep (1/160 desktop, 1/60 mobile, max 10 substeps)
- WASD movement relative to camera azimuthal angle
- Joystick movement via angle + camera angle
- Smooth rotation via `damp()` from maath
- Jump (velocity.y = 15), ground detection
- Death/respawn below deathHeight (-5.1)
- BVH `boundsTree.shapecast()` for collision
- Animation state transitions

**Strip**: ALL VR/XR, ALL multiplayer (isOtherPlayer, NetworkingStore, NameTag), ALL presentation/showcase mode, MeteorManagerStore, AuthAPIStore, Leva debug, dance floor logic

**Adapt**: PlayerConfigStore.playerSpawnPosition for FinQuest, capsuleInfo tuning, isPlayerParalysedRef for NPC dialog lock

### 2.2 Avatar System (`Avatar.tsx` + `avatars/Generic.tsx`)

**What it does**: Loads GLTF avatar, clones with SkeletonUtils, loads separate animation GLBs (Idle, Walk, Run, Jump, 8x Dance), crossfades between them.

**Strip**: NetworkingStore, animationServerState, isOtherPlayer branching, CollectionContext.loader (use useGLTF)

**Critical**: Hips position reset in useFrame (Generic.tsx line 210-211) prevents root motion drift. MUST preserve.

### 2.3 Camera System

**What it does**: Custom vendored OrbitControls, camera follows character (+2 Y offset), spring arm prevents wall clipping via raycasting, first/third person toggle, damped controls.

**Strip**: InventoryConsoleHUDStore, Unity-like controls, Leva debug, presentation mode orbit disable

### 2.4 Map/World Loading (`hooks/useMap.ts`)

**What it does**: Loads single GLB, traverses by naming convention, generates BVH collider via `StaticGeometryGenerator` + `MeshBVH`.

**Strip**: ALL store-specific logic, MaterialStore, LOD buildings, portals, display panels, garden areas, Water2. **Heaviest rewrite needed.**

**Keep core**: GLB load → traverse → merge geometry → compute BVH → store collider

### 2.5 Input System (`hooks/useCharacterControls.ts`)

**What it does**: Keyboard WASD/Space/Shift + nipplejs joystick. Exports movement data (direction booleans + joystick angle/distance).

**Strip**: SoundsStore (optional), InventoryConsoleHUDStore, cart/chatbox/treasure conditions
**Add**: 'E' key for FinQuest NPC interaction

### 2.6 Water (`components/Water.tsx`)

Self-contained. 220x220 PlaneGeometry, sine wave vertex animation, water.jpg texture.
**Adapt**: `sRGBEncoding` → `SRGBColorSpace`

### 2.7 Post-Processing (`components/Effects.tsx`)

EffectComposer with SMAA, DepthOfField, SelectiveBloom + lights.
**Strip**: SelectiveBloom (jewellery-specific). Keep SMAA + DepthOfField + regular Bloom.

### 2.8 Environment (`components/Environment.tsx`)

Fog (near 100, far 262.5) + cubemap skybox from 6 PNGs.
**Strip**: Leva controls. Adjust fog for island feel.

### 2.9 Trigger Area System

BVH-based trigger detection for zone entry/exit. Adapt for FinQuest zones (TechCorp, ScamPark, etc.).

### 2.10 NPC/Tutorial System

TutorialNPC with Idle/Talk animations + proximity trigger. NPCChatSystem with branching dialog.
**Adapt**: Very close to what FinQuest needs for quest NPCs.

---

## 3. NPM PACKAGES NEEDED

**REMOVE:**
- `@react-three/rapier` -- Replace with BVH collision
- `ecctrl` -- Replace with custom controller
- `three-custom-shader-material`

**ADD:**
- `three-mesh-bvh` (^0.6.8) -- BVH collision detection (CRITICAL)
- `maath` (^0.10.7) -- `damp()` for smooth lerping
- `nipplejs` (^0.10.1) -- Mobile joystick
- `@use-gesture/react` (^10.2.26) -- Gesture detection for camera
- `postprocessing` -- Peer dep of @react-three/postprocessing
- `three-stdlib` -- SkeletonUtils, OrbitControls base

**KEEP:** @react-three/fiber, @react-three/drei, @react-three/postprocessing, three, zustand, howler, leva

---

## 4. STORES TO CREATE

**Keep existing**: `useGameStore` (FinQuest financial state)

**Port simplified from everlite-store:**

1. **`genericStore`** → isTabFocused, isCharacterRefReady, characterRef, loading_initialSpawn, areEffectsEnabled, dpr, joystickRoot/jumpButtonRoot

2. **`CameraControlsStore`** → orbitControlsRef, orbitDistance, camera movement flags, makeCameraFollowCharacter, orbitControlsConfig (third-person only)

3. **`GesturesAndDeviceStore`** → isTouchDevice, isPinchOrScrollEventActive, isDragEventActive, screenSize

4. **`MapStore`** → collider, mapModel, geometry (strip all store/portal/display/panel state)

5. **`AvatarStore`** → avatarAnimationState, setAvatarAnimationState, avatarData, hasAvatarBeenSelected (strip animationServerState, ReadyPlayerMe, dance index)

6. **`HUDStore`** → hasStartButtonBeenPressed, showJoystick, jumpButtonTapped, showDialogScreen (strip all showcase/presentation/cart/treasure)

7. **`PlayerConfigStore`** → maxSpeed, jumpDistance, deathHeight, playerSpawnPosition, isPlayerParalysedRef, resetFn

8. **`NPCStore`** → dialogs, NPC info, activeDialogIndex, interactionState

---

## 5. STRIPPING GUIDE (Per File)

### `main.tsx`
Strip: ALL XR/VR, Auth/Cart/Collection/Data providers, InventoryConsole/DigiGold providers, Networking, TreasureHunt/Gamize, CheckpointRenderer
Keep: Canvas, BVH patches, Map/Camera/Gestures/GlobalState/Avatar/HUD/NPC providers, Experience, Effects, Environment, HUD, Sounds

### `Experience.tsx`
Strip: VRItemShowcase, HorizontalScreening, BuildingManager, MiningManager, DigiGoldMachineManager, DanceFloor, DancingCharacters, StageLights, OtherPlayers, SendPlayerTransformToServer, UnityControls, HoveringDisplays, DebugEntities
Keep: Character, CameraFollowCharacter, SpringArm, Water, TutorialNPC (adapt), WorldConfigStore

### `Character/index.tsx`
Strip: ALL VR (XROrigin, useXRInputSourceState, vrStore, VRTeleport), ALL multiplayer (isOtherPlayer, playerObject, selfPlayer, NameTag), MeteorManagerStore, InventoryConsoleHUDStore, AuthAPIStore, NetworkingStore, presentation/showcase mode, Leva useControls
Keep: capsuleInfo, movementDataRef, handlePlayerInput (keyboard only), performFixedUpdate, updatePlayer, useFrame, useImperativeHandle, Avatar rendering, RoundedBox

### `Avatar.tsx`
Strip: NetworkingStore, animationServerState useEffect, isOtherPlayer branching

### `Generic.tsx`
Strip: NetworkingStore (legless avatars), CollectionContext.loader (use useGLTF), isOtherPlayer parameter

### `useMap.ts` (MAJOR REWRITE)
Strip: ALL store handling, ALL LOD/building/portal/display/panel/garden/water handling, MaterialStore
Keep: GLB load, scene traversal, StaticGeometryGenerator + MeshBVH collider generation (~40 lines of core logic)

### `useCharacterControls.ts`
Strip: SoundsStore (optional), InventoryConsoleHUDStore, cart/chatbox/treasure conditions

### `useCameraControls.ts`
Strip: InventoryConsoleHUDStore, Unity-like controls, Leva debug, first-person mode (optional)

### `useSpringArm.ts`
Strip: isTutorialEnabled check (or adapt). Otherwise port as-is.

---

## 6. RISK ASSESSMENT

### HIGH RISK

1. **Three.js version mismatch** (0.151 → 0.183): `sRGBEncoding` → `SRGBColorSpace`, `THREE.Event` removed, OrbitControls API changes, BufferGeometry.computeBoundsTree prototype patching may differ

2. **three-mesh-bvh version compatibility** (0.6.8 → latest 0.8.x+): `shapecast` API, `intersectsGeometry`, `StaticGeometryGenerator` have evolved. **Test BVH collision in isolation first.**

3. **React 18 → 19**: `createRef()` pattern may behave differently. Core R3F/drei should be compatible.

4. **R3F 8.x → 9.x**: Breaking changes to Canvas, events system, `useFrame` delta, `GroupProps` type.

### MEDIUM RISK

5. **Character falls through floor**: If BVH collider fails silently or isn't ready when physics starts. Must preserve: shader pre-compilation delay, stabilization check, deathHeight respawn.

6. **Modified OrbitControls**: Vendored copy may not be compatible with Three.js 0.183. May need re-patching from newer three-stdlib.

7. **GLB naming conventions**: useMap.ts relies on mesh naming in GLB. FinQuest world GLB must follow defined conventions.

8. **Animation root motion**: Generic.tsx hips reset (line 210-211) is critical. If missed, avatar drifts with each step.

### LOW RISK

9. **Nipplejs styling**: Accesses internal DOM elements. Cosmetic only.
10. **Post-processing performance**: Disabled by default, opt-in.
11. **Sound system**: Howler is straightforward.
12. **Water animation**: Self-contained, just fix `sRGBEncoding`.
