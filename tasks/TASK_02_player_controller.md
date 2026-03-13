# TASK 02: Player Character Controller

## Phase
Phase 1b — Player Character Controller

## Prerequisites
- TASK_00 must be complete (R3F Canvas, Physics, KeyboardControls)
- TASK_01 must be complete (Island terrain with physics collider — player needs ground to walk on)

## Goal
Add a third-person player character using the `ecctrl` controller that can walk (WASD), sprint (Shift), and jump (Space) around the island, with a smooth camera follow. The player is a simple capsule mesh (body + head). Respawn if the player falls off the island.

## Detailed Requirements

### 1. Player Component — `src/components/world/Player.jsx`

Use the `ecctrl` package for the character controller. It provides third-person camera, physics-based movement, and input handling in a few lines of JSX.

```jsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Ecctrl from 'ecctrl';

export default function Player() {
  const ecctrlRef = useRef();

  // Respawn if player falls off the island
  useFrame(() => {
    if (ecctrlRef.current) {
      const position = ecctrlRef.current.translation();
      if (position.y < -5) {
        ecctrlRef.current.setTranslation({ x: 0, y: 5, z: 0 }, true);
        ecctrlRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      }
    }
  });

  return (
    <Ecctrl
      ref={ecctrlRef}
      capsuleHalfHeight={0.35}
      capsuleRadius={0.3}
      floatHeight={0}
      camInitDis={-7}
      camMaxDis={-10}
      camMinDis={-3}
      camInitDir={{ x: 0.3, y: 0 }}
      maxVelLimit={5}
      sprintMult={2}
      jumpVel={4}
      position={[0, 3, 5]}
      animated={false}
    >
      {/* Simple capsule character mesh */}
      <group>
        {/* Body */}
        <mesh castShadow position={[0, 0, 0]}>
          <capsuleGeometry args={[0.3, 0.7, 8, 16]} />
          <meshStandardMaterial color="#4488cc" />
        </mesh>
        {/* Head */}
        <mesh castShadow position={[0, 0.65, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#ffcc88" />
        </mesh>
      </group>
    </Ecctrl>
  );
}
```

**Ecctrl Props Explained:**
| Prop | Value | Purpose |
|------|-------|---------|
| `capsuleHalfHeight` | 0.35 | Half the height of the physics capsule |
| `capsuleRadius` | 0.3 | Radius of the physics capsule |
| `floatHeight` | 0 | No floating above ground |
| `camInitDis` | -7 | Initial camera distance behind player |
| `camMaxDis` | -10 | Maximum zoom-out distance |
| `camMinDis` | -3 | Maximum zoom-in distance |
| `camInitDir` | {x: 0.3, y: 0} | Slight downward camera angle |
| `maxVelLimit` | 5 | Walk speed |
| `sprintMult` | 2 | Sprint is 2x walk speed |
| `jumpVel` | 4 | Jump velocity |
| `position` | [0, 3, 5] | Spawn position (above island surface near center) |
| `animated` | false | No animation system (we use simple geometry, not GLB models) |

**Respawn Logic:**
- Every frame, check the player's Y position via `ecctrlRef.current.translation()`
- If `position.y < -5`, teleport back to `[0, 5, 0]` and reset velocity
- This handles falling off the island edge into the ocean

### 2. Interact Key Detection — `src/hooks/useInteract.js`

Create a hook that detects when the player presses "E" (interact key):

```jsx
import { useEffect } from 'react';

export function useInteract(callback) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyE') {
        callback();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callback]);
}
```

This hook is used by NPC interaction in TASK_03, but create it now since it's part of the player input system.

### 3. Update App.jsx — Add Player

Add the Player component inside the Physics provider in App.jsx:

```jsx
import Player from './components/world/Player';

// Inside <Physics timeStep="vary">:
<Atmosphere />
<Lighting />
<Island />
<Ocean />
<Player />
```

**IMPORTANT:** The `<Player>` component MUST be inside `<Physics>` because ecctrl creates a Rapier RigidBody for the player capsule. It also MUST be inside `<KeyboardControls>` (which wraps the Canvas) because ecctrl reads keyboard input from the KeyboardControls context.

### 4. Camera Behavior

When ecctrl is active, it controls the camera automatically (third-person follow). The `camera` prop on `<Canvas>` serves as a fallback for initial render before ecctrl takes over. Either keep it or remove it — both work fine:

```jsx
<Canvas
  shadows
  camera={{ position: [0, 8, 15], fov: 60 }}
  style={{ width: '100%', height: '100%' }}
>
```

Ecctrl's camera will override this once the player spawns.

## File Structure

```
CREATE: src/components/world/Player.jsx
CREATE: src/hooks/useInteract.js
MODIFY: src/App.jsx (add Player import and component)
```

## Code Patterns (from resources.md)

### Character Controller Setup (ecctrl)
```jsx
import Ecctrl, { EcctrlAnimation } from "ecctrl";

<Physics timeStep="vary">
  <KeyboardControls map={[
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
    { name: 'run', keys: ['ShiftLeft'] },
  ]}>
    <Ecctrl animated camInitDis={-5}>
      <EcctrlAnimation characterURL="/models/character.glb" animationSet={{
        idle: "Idle", walk: "Walk", run: "Run",
      }}>
        <CharacterModel />
      </EcctrlAnimation>
    </Ecctrl>
  </KeyboardControls>
</Physics>
```

**NOTE for this task:** We are NOT using `EcctrlAnimation` or GLB models. Our character is a simple capsule mesh. Set `animated={false}` on Ecctrl. The animation setup pattern above is for reference only — use it later if adding character models.

### KeyboardControls Map (already created in TASK_00)
```js
export const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'run', keys: ['ShiftLeft'] },
  { name: 'interact', keys: ['KeyE'] },
];
```

The `jump` and `interact` keys are already in the map from TASK_00. Ecctrl reads `forward`, `backward`, `leftward`, `rightward`, `jump`, and `run` automatically from KeyboardControls.

## Data/Constants

| Constant | Value | Notes |
|----------|-------|-------|
| Player spawn position | [0, 3, 5] | Above island surface, slightly off-center |
| Respawn threshold Y | -5 | Below this Y, teleport back |
| Respawn position | [0, 5, 0] | Center of island, above surface |
| Walk speed (maxVelLimit) | 5 | Normal movement speed |
| Sprint multiplier | 2 | Shift makes you 2x faster |
| Jump velocity | 4 | Moderate jump height |
| Camera distance | -7 (init), -3 to -10 (range) | Third-person follow |
| Body color | #4488cc | Blue body capsule |
| Head color | #ffcc88 | Skin-toned sphere head |
| Capsule radius | 0.3 | Physics and visual capsule |
| Capsule half-height | 0.35 | Physics capsule |

## Acceptance Criteria

- [ ] Player character (blue capsule with skin-colored head) is visible on the island
- [ ] WASD keys move the player around the island
- [ ] Camera follows the player in third-person view, can orbit with mouse drag
- [ ] Shift key makes the player move faster (sprint)
- [ ] Space key makes the player jump
- [ ] Player walks on the island surface (doesn't fall through — requires TASK_01 collider)
- [ ] Walking off the island edge causes the player to fall, then respawn on island when Y < -5
- [ ] No console errors
- [ ] Player movement feels responsive and smooth

## What NOT to Do

- Do NOT use GLB character models — simple capsule geometry is fine for MVP
- Do NOT add character animations (idle, walk, run) — skip for P0
- Do NOT add EcctrlAnimation wrapper — set `animated={false}`
- Do NOT implement NPC interaction yet — that's TASK_03
- Do NOT add any UI/HUD elements — that's a Phase 2 task
- Do NOT add a minimap or compass
- Do NOT worry about mobile/touch controls

## Estimated Complexity
Medium — ~30 minutes. Main challenge is getting ecctrl props right and ensuring the physics collider from TASK_01 works with the player capsule.
