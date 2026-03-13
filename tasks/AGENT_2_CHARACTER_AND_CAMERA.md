# AGENT 2: Character Controller + Avatar + Camera + Input

**This agent owns**: Character controller, avatar/animation system, camera controls, spring arm, input system

**Does NOT touch**: Stores, configs, utilities, map loading, water, environment, effects, App.jsx, Experience.jsx (Agent 1 owns those)

**IMPORTANT**: This agent's files import from stores/configs that Agent 1 creates. Use these exact import paths:
- `import useWorldStore from '../stores/worldStore'`
- `import usePlayerStore, { PlayerConfigStore } from '../stores/playerStore'`
- `import useCameraStore from '../stores/cameraStore'`
- `import useHudStore from '../stores/hudStore'`
- `import useGestureStore from '../stores/gestureStore'`
- `import { AvatarOptions } from '../config/avatar'`
- `import { staticResourcePaths } from '../config/staticResourcePaths'`
- `import { upVector, tempVector, tempVector2, tempBox, tempMat, tempSegment } from '../utils/commonMaterials'`

**Reference codebase**: `/home/heretic/Documents/Projects/iiitd-hackathon/references/everlite-store/client/src/`

**All code is JavaScript (NOT TypeScript)** — strip all type annotations.
**Use relative imports** — NOT `@client/` path aliases.
**Three.js 0.183** — use `SRGBColorSpace` not `sRGBEncoding`.

---

## Task 1: Input System (`src/hooks/useCharacterControls.js`)

**Source ref**: `hooks/useCharacterControls.ts`

Simplified keyboard-only input handler. Returns a mutable ref with movement data.

### What to keep:
- `keys` object mapping keyboard keys to actions (forward/backward/left/right/sprint/jump)
- `keydown`/`keyup` event listeners that set direction booleans
- Jump handler that sets velocity and animation state
- Return `movementDataRef` with shape:
  ```js
  {
    direction: { forward, backward, left, right, sprint },
    joystick: { angle: null, distance: null, direction: { x: null, y: null }, quadrant: null }
  }
  ```

### What to strip:
- ALL nipplejs joystick code (for now — can add mobile later)
- ALL SoundsStore references
- ALL InventoryConsoleHUDStore references
- ALL HUD button conditions (cart, chatbox, treasure, etc.)
- ALL `isTutorialEnabled` guard

### Key additions for FinQuest:
- Add 'e'/'E' key for NPC interaction

### Key behavior:
- Jump: sets `playerVelocity.y = PlayerConfigStore.getState().jumpDistance`, `isPlayerOnGround.current = false`, sets animation to 'jump'
- Sprint detection: Shift key sets sprint = true
- Return cleanup function to remove event listeners

**Approx lines**: ~80

---

## Task 2: Character Controller (`src/components/Character/index.jsx`)

**Source ref**: `components/Character/index.tsx` (1465 lines) — THE most complex file. Port ~400 lines of core physics.

### Architecture:
The Character is a `forwardRef` component that:
1. Creates a THREE.Group as the player container
2. Has a `<RoundedBox>` as collision visualization (invisible)
3. Renders `<Avatar>` inside the group
4. Runs physics in `useFrame` via fixed timestep

### Core physics loop (`performFixedUpdate`):
1. Reset capsule segment to local position
2. Apply gravity to `playerVelocity.y`
3. Adjust capsule segment by velocity
4. Transform capsule to world space
5. **BVH shapecast**: `collider.geometry.boundsTree.shapecast()` with capsule radius
6. For each collision triangle, compute penetration depth and push capsule out
7. Check if any collision normal points up (ground detection)
8. Transform adjusted position back to local space
9. Apply position delta to player group
10. If on ground, zero out downward velocity

### Core input handler (`handlePlayerInput`):
1. Get camera azimuthal angle from OrbitControls
2. Check WASD direction from `movementDataRef`
3. Calculate movement direction vector relative to camera angle
4. Apply movement to player position (`addScaledVector`)
5. Calculate desired rotation angle from movement direction
6. Smooth rotation with `damp()` from maath
7. Set animation state (idle/walk/run) based on speed

### What to strip:
- ALL VR code (~200 lines): XROrigin, useXRInputSourceState, vrStore, VRTeleport, vrPlayerSpeed, vrPlayerPosition, rightThumbStickState, leftThumbStickState, rotationSpeedInVR
- ALL multiplayer code (~150 lines): isOtherPlayer branching, playerObject, selfPlayer, NameTag, distance-based avatar visibility, position lerping for other players
- ALL presentation/showcase mode (~100 lines): isPresentationMode, isShowcaseMode, inventoryConsoleHUDContext, avatar visibility toggling
- MeteorManagerStore and meteor colliders in shapecast
- AuthAPIStore (player name)
- NetworkingStore references
- Leva useControls debug panel
- Dance floor logic (isOnDanceFloor)
- First-person camera mode handling
- Shader pre-compilation (simplify: just use a timeout)
- The entire second useFrame for other players

### What to keep:
- `capsuleInfo` = `{ radius: 0.5, segment: new THREE.Line3(new THREE.Vector3(), new THREE.Vector3(0, -1, 0)) }`
- `playerVelocity` = `new THREE.Vector3()`
- `isPlayerOnGround` ref
- `playerSpeed` ref (for animation timescale)
- `handlePlayerInput` — keyboard branch only (lines ~993-1068)
- `performFixedUpdate` — BVH collision loop (lines ~1130-1230, strip meteor check)
- `updatePlayer` — fixed timestep accumulator (lines ~776-827)
- `useFrame` calling `updatePlayer`
- `useImperativeHandle` exposing `teleportPlayer`, `playerRef`
- Death/respawn check (if y < deathHeight, teleport to spawn)
- Stabilization check (dismiss loading screen after player settles)
- Avatar + RoundedBox rendering

### Key imports:
```js
import { forwardRef, useRef, useImperativeHandle, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { damp } from 'maath/easing'
import Avatar from '../components/Avatar'
import useCharacterControls from '../hooks/useCharacterControls'
import useWorldStore from '../stores/worldStore'
import usePlayerStore, { PlayerConfigStore } from '../stores/playerStore'
import useCameraStore from '../stores/cameraStore'
import { upVector, tempVector, tempVector2, tempBox, tempMat, tempSegment } from '../utils/commonMaterials'
```

### Spawn:
- Initial position: `PlayerConfigStore.getState().playerSpawnPosition` = `[0, 10, 0]`
- deathHeight: -5.1 (respawn if below)

**Approx lines**: ~350

---

## Task 3: Avatar System

### 3A: `src/components/Avatar.jsx`

**Source ref**: `components/Avatar.tsx`

Simplified animation crossfade controller. No multiplayer, no dance.

```jsx
import { useEffect, useRef, useState, memo } from 'react'
import usePlayerStore from '../stores/playerStore'
import Generic from './avatars/Generic'
import { AvatarOptions } from '../config/avatar'

const animationConfig = {
  idle: { fadeIn: 0.3, fadeOut: 0.3 },
  walk: { fadeIn: 0.3, fadeOut: 0.3 },
  run:  { fadeIn: 0.3, fadeOut: 0.2 },
  jump: { fadeIn: 0.2, fadeOut: 0.2 },
}

const Avatar = memo(({ playerSpeed }) => {
  const modelRef = useRef(null)
  const [modelAnimActions, setModelAnimActions] = useState(null)
  const avatarAnimationState = usePlayerStore(s => s.avatarAnimationState)

  // Crossfade animations on state change
  useEffect(() => {
    if (!modelAnimActions) return
    const animation = modelAnimActions[avatarAnimationState]
    if (!animation) return
    const { fadeIn, fadeOut } = animationConfig[avatarAnimationState] || { fadeIn: 0.3, fadeOut: 0.3 }
    animation.reset().fadeIn(fadeIn).play()
    return () => { animation?.fadeOut(fadeOut) }
  }, [modelAnimActions, avatarAnimationState])

  // Initialize: set walk timeScale, play idle
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (modelRef.current?.animationActions) {
      setModelAnimActions(modelRef.current.animationActions)
      if (modelRef.current.animationActions['walk'])
        modelRef.current.animationActions['walk'].timeScale = 1.5
      modelRef.current.animationActions['idle']?.play()
      setReady(true)
    }
  }, [ready])

  return <Generic ref={modelRef} setReady={setReady} />
})

export default Avatar
```

### 3B: `src/components/avatars/Generic.jsx`

**Source ref**: `components/avatars/Generic.tsx`

Loads avatar GLB + 4 animation GLBs, clones with SkeletonUtils, resets hips each frame.

```jsx
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import { staticResourcePaths } from '../../config/staticResourcePaths'
import { AvatarOptions } from '../../config/avatar'
import useWorldStore from '../../stores/worldStore'

const AVATAR_CONFIG = AvatarOptions.feb

const Generic = forwardRef(({ setReady, ...props }, ref) => {
  const group = useRef(null)
  const hips = useRef(null)

  // Load animations
  const { animations: IdleAnimation } = useGLTF(staticResourcePaths.animations.idle)
  const { animations: WalkAnimation } = useGLTF(staticResourcePaths.animations.walk)
  const { animations: RunAnimation } = useGLTF(staticResourcePaths.animations.run)
  const { animations: JumpAnimation } = useGLTF(staticResourcePaths.animations.jump)

  // Rename clips
  IdleAnimation[0].name = 'idle'
  WalkAnimation[0].name = 'walk'
  RunAnimation[0].name = 'run'
  JumpAnimation[0].name = 'jump'

  const { actions } = useAnimations(
    [IdleAnimation[0], WalkAnimation[0], RunAnimation[0], JumpAnimation[0]],
    group
  )

  // Load avatar model
  const { scene: originalScene } = useGLTF(AVATAR_CONFIG.gltfFilePath)
  const scene = useMemo(() => {
    const clone = SkeletonUtils.clone(originalScene)
    clone.traverse(child => {
      if (child.name === 'Hips') hips.current = child
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return clone
  }, [originalScene])

  useImperativeHandle(ref, () => ({ animationActions: actions }))

  // Reset hips x/z each frame to cancel root motion
  useFrame(() => {
    if (!useWorldStore.getState().isTabFocused) return
    if (hips.current) {
      hips.current.position.x = 0
      hips.current.position.z = 0
    }
    // Signal ready once actions are available
    if (actions['idle'] && setReady) setReady(prev => !prev ? true : prev)
  })

  return (
    <primitive
      object={scene}
      ref={node => { if (node) group.current = node }}
      scale={AVATAR_CONFIG.scale}
      position={AVATAR_CONFIG.position}
      rotation={AVATAR_CONFIG.rotation}
      {...props}
    />
  )
})

export default Generic
```

**Approx lines**: Avatar ~45, Generic ~75

---

## Task 4: Camera System

### 4A: `src/hooks/useCameraControls.js`

**Source ref**: `hooks/useCameraControls.ts`

Creates OrbitControls instance from modifiedOrbitControls, applies config, attaches to camera.

### What to keep:
- Import modified OrbitControls from `../utils/modifiedOrbitControls`
- Create OrbitControls instance with camera + domElement
- Apply third-person config (enablePan, enableZoom, enableDamping, dampingFactor, maxDistance, minPolarAngle, maxPolarAngle, etc.)
- Store the controls ref in `cameraStore.orbitControlsRef`
- Track zoom distance changes
- Return cleanup function

### What to strip:
- ALL leva useControls
- ALL first-person mode switching
- ALL InventoryConsoleHUDStore
- ALL presentation mode orbit disabling
- ALL Unity-like controls
- Screen size change handling (simplify)

**Approx lines**: ~80

### 4B: `src/hooks/useSpringArm.js`

**Source ref**: `hooks/useSpringArm.ts`

Raycasts from camera toward player. If something is between them, moves camera to the collision point. Uses interval-based raycasting (every 10ms) for performance.

### What to keep:
- Raycast from camera to character
- If hit, move camera to hit point (inner raycast)
- Lerp camera back to original distance when obstruction clears (outer raycast)
- Hide avatar when camera is too close (first-person-ish distance)

### What to strip:
- `AvatarStore.hasAvatarBeenSelected` bounds tree recompute
- `GesturesAndDeviceStore` pinch guard
- First-person mode guard

**Approx lines**: ~100

### 4C: `src/components/CameraFollowCharacter.jsx`

**Source ref**: `CameraFollowCharacter.tsx`

Minimal useFrame component that calls `makeCameraFollowCharacter` from cameraStore.

```jsx
import { useFrame } from '@react-three/fiber'
import useCameraStore from '../stores/cameraStore'

export default function CameraFollowCharacter() {
  useFrame(() => {
    useCameraStore.getState().makeCameraFollowCharacter()
  })
  return null
}
```

**Approx lines**: ~10

### 4D: `src/components/SpringArm.jsx`

**Source ref**: `SpringArm.tsx`

Minimal wrapper that calls `useSpringArm` hook.

```jsx
import useSpringArm from '../hooks/useSpringArm'

export default function SpringArm() {
  useSpringArm()
  return null
}
```

**Approx lines**: ~8

---

## Files This Agent Creates (Summary)

| # | File | Lines (approx) | Complexity |
|---|------|----------------|------------|
| 1 | `src/hooks/useCharacterControls.js` | 80 | Medium |
| 2 | `src/components/Character/index.jsx` | 350 | **HIGH** |
| 3 | `src/components/Avatar.jsx` | 45 | Low |
| 4 | `src/components/avatars/Generic.jsx` | 75 | Medium |
| 5 | `src/hooks/useCameraControls.js` | 80 | Medium |
| 6 | `src/hooks/useSpringArm.js` | 100 | Medium |
| 7 | `src/components/CameraFollowCharacter.jsx` | 10 | Low |
| 8 | `src/components/SpringArm.jsx` | 8 | Low |

**Total**: ~8 files, ~750 lines

**Critical file**: `Character/index.jsx` — the BVH physics loop. Read `components/Character/index.tsx` lines 776-1230 very carefully. The `performFixedUpdate` function is the heart of collision detection.

---

## Key References to Read (in order of importance)

1. `components/Character/index.tsx` — Full character controller (read lines 776-1230 for physics core, 829-1068 for input handling)
2. `hooks/useCharacterControls.ts` — Input system
3. `hooks/useCameraControls.ts` — Camera setup
4. `hooks/useSpringArm.ts` — Spring arm collision avoidance
5. `components/Avatar.tsx` — Animation state machine
6. `components/avatars/Generic.tsx` — Avatar model loading + hips reset
7. `CameraFollowCharacter.tsx` — Camera follow (tiny file)
8. `SpringArm.tsx` — Spring arm wrapper (tiny file)
