# Task 1.4: NPCs with Proximity Detection

## Phase
Phase 1 — 3D World Foundation

## Priority
P0

## Dependencies
- Requires TASK_0_1 (project setup — KeyboardControls with `interact` key)
- Requires TASK_1_1 (island terrain — NPCs stand on island surface)
- Requires TASK_1_2 (player controller — proximity detection needs a player to detect)
- Requires TASK_1_3 (zone buildings — NPCs are placed near their respective buildings)

## Objective
Create an NPC component that renders a capsule character with distinct color, floating name tag (drei `Text` + `Float`), and a Rapier sensor collider for proximity detection. When the player walks near an NPC, a "[E] Talk" prompt appears above the NPC. When the player walks away, the prompt disappears. Create 3 NPCs placed at zone buildings: HR Vikram (TechCorp), Shady Ravi (Scam Park), and Fund Manager Priya (MF Tower). Wire proximity state into the Zustand game store via `setNearbyNPC`.

## Detailed Requirements

### 1. NPC Component — `src/components/npcs/NPC.jsx`

A reusable NPC component that takes props for customization.

**Props interface:**
```
{
  name: string,        // Display name (e.g., "HR Vikram")
  color: string,       // Body color hex (e.g., "#cc4444")
  position: [x, y, z], // World position
  npcId: string,       // Unique identifier (e.g., "hr-vikram")
}
```

**NPC Body (capsule character, similar to player but different color):**
- Body: `capsuleGeometry args={[0.3, 0.7, 8, 16]}`, color from `color` prop
- Head: `sphereGeometry args={[0.25, 16, 16]}`, color `#ffcc88` (skin tone), position `[0, 0.7, 0]`
- Left Eye: `sphereGeometry args={[0.06, 8, 8]}`, color `#222222`, position `[-0.08, 0.75, 0.2]`
- Right Eye: `sphereGeometry args={[0.06, 8, 8]}`, color `#222222`, position `[0.08, 0.75, 0.2]`
- All meshes: `castShadow={true}`

**Floating Name Tag:**
- Use drei `<Float speed={2} rotationIntensity={0} floatIntensity={0.3}>` to add gentle bobbing
- Inside Float: `<Text>` with the NPC's name
- Position: `[0, 1.5, 0]` (above head, relative to NPC group)
- `fontSize={0.3}`, color `#ffffff`
- `anchorX="center"`, `anchorY="middle"`
- `outlineWidth={0.03}`, `outlineColor="#000000"`

**"[E] Talk" Prompt:**
- Only visible when this NPC is the `nearbyNPC` in the game store
- Position: `[0, 2.0, 0]` (above name tag, relative to NPC group)
- `<Text>` with content `"[E] Talk"`
- `fontSize={0.25}`, color `#ffdd44` (yellow/gold to stand out)
- `outlineWidth={0.03}`, `outlineColor="#000000"`
- Also wrapped in `<Float speed={3} rotationIntensity={0} floatIntensity={0.5}>` for attention-grabbing bob

**Idle Bobbing Animation:**
- The entire NPC body group bobs gently up and down using a `useFrame` animation
- `y += Math.sin(clock.getElapsedTime() * 1.5) * 0.05` — subtle 0.05 unit amplitude

**Rapier Sensor Collider for Proximity:**
- Wrap NPC in `<RigidBody type="fixed" colliders={false}>` (disable auto colliders)
- Add a `<CuboidCollider args={[3, 3, 3]} sensor />` — a 6x6x6 invisible detection zone
- `onIntersectionEnter` callback: call `useGameStore.getState().setNearbyNPC({ npcId, name })`
- `onIntersectionExit` callback: call the following logic:
  ```js
  const current = useGameStore.getState().nearbyNPC;
  if (current && current.npcId === npcId) {
    useGameStore.getState().setNearbyNPC(null);
  }
  ```
  This ensures we only clear if this specific NPC was the one marked as nearby.

**Full Component structure:**
```jsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Text, Float } from '@react-three/drei';
import useGameStore from '../../stores/gameStore';

export default function NPC({ name, color, position, npcId }) {
  const bodyRef = useRef();
  const nearbyNPC = useGameStore((s) => s.nearbyNPC);
  const isNearby = nearbyNPC && nearbyNPC.npcId === npcId;

  useFrame(({ clock }) => {
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(clock.getElapsedTime() * 1.5) * 0.05;
    }
  });

  const handleEnter = () => {
    useGameStore.getState().setNearbyNPC({ npcId, name });
  };

  const handleExit = () => {
    const current = useGameStore.getState().nearbyNPC;
    if (current && current.npcId === npcId) {
      useGameStore.getState().setNearbyNPC(null);
    }
  };

  return (
    <group position={position}>
      <RigidBody type="fixed" colliders={false}>
        {/* Sensor collider for proximity detection */}
        <CuboidCollider
          args={[3, 3, 3]}
          sensor
          onIntersectionEnter={handleEnter}
          onIntersectionExit={handleExit}
        />

        {/* NPC body with idle bobbing */}
        <group ref={bodyRef}>
          {/* Body */}
          <mesh castShadow>
            <capsuleGeometry args={[0.3, 0.7, 8, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>

          {/* Head */}
          <mesh castShadow position={[0, 0.7, 0]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#ffcc88" />
          </mesh>

          {/* Left Eye */}
          <mesh position={[-0.08, 0.75, 0.2]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#222222" />
          </mesh>

          {/* Right Eye */}
          <mesh position={[0.08, 0.75, 0.2]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
        </group>
      </RigidBody>

      {/* Floating name tag */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
        >
          {name}
        </Text>
      </Float>

      {/* [E] Talk prompt — only visible when nearby */}
      {isNearby && (
        <Float speed={3} rotationIntensity={0} floatIntensity={0.5}>
          <Text
            position={[0, 2.0, 0]}
            fontSize={0.25}
            color="#ffdd44"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#000000"
          >
            [E] Talk
          </Text>
        </Float>
      )}
    </group>
  );
}
```

### 2. NPC Placements — Update `src/App.jsx`

Import the NPC component and create 3 NPCs placed near their zone buildings.

**NPC 1: HR Vikram (TechCorp zone)**
- `npcId="hr-vikram"`
- `name="HR Vikram"`
- `color="#cc4444"` (red — corporate/authority feel)
- `position={[10, 0.5, 8]}` (in front of TechCorp building, facing south toward player spawn)

**NPC 2: Shady Ravi (Scam Park zone)**
- `npcId="shady-ravi"`
- `name="Shady Ravi"`
- `color="#8844aa"` (purple — mysterious/suspicious feel)
- `position={[1, 0.5, -8]}` (near the front of Scam Park, near a bench)

**NPC 3: Fund Manager Priya (MF Tower zone)**
- `npcId="fm-priya"`
- `name="FM Priya"`
- `color="#44aa44"` (green — money/finance feel)
- `position={[-10, 0.5, 8]}` (in front of MF Tower, facing south)

Add import:
```jsx
import NPC from './components/npcs/NPC';
```

Add inside `<Physics>` (after zone buildings):
```jsx
<NPC npcId="hr-vikram" name="HR Vikram" color="#cc4444" position={[10, 0.5, 8]} />
<NPC npcId="shady-ravi" name="Shady Ravi" color="#8844aa" position={[1, 0.5, -8]} />
<NPC npcId="fm-priya" name="FM Priya" color="#44aa44" position={[-10, 0.5, 8]} />
```

### 3. InteractionHandler Hook — `src/hooks/useInteraction.js`

Create a custom hook that listens for the "E" key press and triggers interaction with the nearby NPC. This hook bridges the keyboard input with the game store.

```js
import { useEffect } from 'react';
import { useKeyboardControls } from '@react-three/drei';
import useGameStore from '../stores/gameStore';

export default function useInteraction() {
  const interactPressed = useKeyboardControls((state) => state.interact);
  const nearbyNPC = useGameStore((s) => s.nearbyNPC);
  const activeDialogue = useGameStore((s) => s.activeDialogue);

  useEffect(() => {
    if (interactPressed && nearbyNPC && !activeDialogue) {
      // For now, just log the interaction. Phase 2 (UI/Dialogue) will
      // implement actual dialogue opening.
      console.log(`[Interact] Talking to ${nearbyNPC.name} (${nearbyNPC.npcId})`);
      // Future: useGameStore.getState().setDialogue(dialogueFor(nearbyNPC.npcId));
    }
  }, [interactPressed, nearbyNPC, activeDialogue]);
}
```

**IMPORTANT:** This hook must be called inside a component that is within both the `<KeyboardControls>` and `<Canvas>` context. Create a small wrapper component:

### 4. InteractionManager Component — `src/components/world/InteractionManager.jsx`

A thin component that calls the useInteraction hook. Must be rendered inside the Canvas.

```jsx
import useInteraction from '../../hooks/useInteraction';

export default function InteractionManager() {
  useInteraction();
  return null; // Renders nothing, just runs the hook
}
```

Add to App.jsx inside the Canvas (can be outside Physics since it has no physics bodies):
```jsx
import InteractionManager from './components/world/InteractionManager';
```

Place it inside the Canvas:
```jsx
<Canvas ...>
  <Atmosphere />
  <InteractionManager />
  <Physics timeStep="vary" debug={false}>
    ...
  </Physics>
</Canvas>
```

### 5. Final App.jsx Structure

After this task, App.jsx should have these imports and this render tree:

```jsx
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import Island from './components/world/Island';
import Ocean from './components/world/Ocean';
import Atmosphere from './components/world/Atmosphere';
import Player from './components/world/Player';
import TechCorpBuilding from './components/world/TechCorpBuilding';
import ScamPark from './components/world/ScamPark';
import MFTower from './components/world/MFTower';
import NPC from './components/npcs/NPC';
import InteractionManager from './components/world/InteractionManager';

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'run', keys: ['ShiftLeft'] },
  { name: 'interact', keys: ['KeyE'] },
];

export default function App() {
  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas
        shadows
        camera={{ position: [0, 15, 30], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Atmosphere />
        <InteractionManager />
        <Physics timeStep="vary" debug={false}>
          <Island />
          <Ocean />
          <Player />
          <TechCorpBuilding />
          <ScamPark />
          <MFTower />
          <NPC npcId="hr-vikram" name="HR Vikram" color="#cc4444" position={[10, 0.5, 8]} />
          <NPC npcId="shady-ravi" name="Shady Ravi" color="#8844aa" position={[1, 0.5, -8]} />
          <NPC npcId="fm-priya" name="FM Priya" color="#44aa44" position={[-10, 0.5, 8]} />
        </Physics>
      </Canvas>
    </KeyboardControls>
  );
}
```

## Code Patterns & References

### NPC Dialogue Trigger with Rapier Sensor (from resources.md)
```jsx
<RigidBody type="fixed" colliders={false}>
  <CuboidCollider args={[3, 3, 3]} sensor
    onIntersectionEnter={() => setNearbyNPC(npcData)}
    onIntersectionExit={() => setNearbyNPC(null)}
  />
  <NPCModel />
</RigidBody>
```

### drei Float for bobbing animation
```jsx
import { Float } from '@react-three/drei';

<Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
  <Text ... />
</Float>
```

### drei Text for labels
```jsx
import { Text } from '@react-three/drei';

<Text
  position={[0, 2, 0]}
  fontSize={0.3}
  color="#ffffff"
  anchorX="center"
  anchorY="middle"
  outlineWidth={0.03}
  outlineColor="#000000"
>
  Label Text
</Text>
```

### Zustand store access patterns
```js
// Inside component (reactive — re-renders on change):
const nearbyNPC = useGameStore((s) => s.nearbyNPC);

// Outside component / in callbacks (non-reactive):
useGameStore.getState().setNearbyNPC({ npcId, name });
```

### useKeyboardControls from drei
```js
import { useKeyboardControls } from '@react-three/drei';

// Subscribes to the named key state:
const interactPressed = useKeyboardControls((state) => state.interact);
```

## Files to Create/Modify

| Action | File Path |
|--------|-----------|
| Create | `src/components/npcs/NPC.jsx` |
| Create | `src/hooks/useInteraction.js` |
| Create | `src/components/world/InteractionManager.jsx` |
| Modify | `src/App.jsx` (add NPC imports/renders, add InteractionManager) |

## Acceptance Criteria

- [ ] `src/components/npcs/NPC.jsx` exists and renders a capsule character with custom color, floating name tag, and sensor collider
- [ ] 3 NPCs are placed in the world: HR Vikram (red, near TechCorp), Shady Ravi (purple, near Scam Park), FM Priya (green, near MF Tower)
- [ ] Each NPC has a floating name tag that gently bobs (drei Float)
- [ ] Each NPC body has a subtle idle bobbing animation (useFrame sine wave)
- [ ] Walking near an NPC shows "[E] Talk" prompt above their head (yellow text)
- [ ] Walking away from an NPC hides the "[E] Talk" prompt
- [ ] Proximity detection uses Rapier sensor colliders (CuboidCollider with `sensor` prop), NOT frame-by-frame distance checks
- [ ] The `nearbyNPC` field in the Zustand game store updates correctly (set on enter, cleared on exit)
- [ ] Pressing E near an NPC logs to console: `[Interact] Talking to <name> (<npcId>)` (actual dialogue is Phase 2)
- [ ] Only ONE NPC can be marked as nearby at a time (the exit handler checks npcId before clearing)
- [ ] `src/hooks/useInteraction.js` exists and listens for the E key from KeyboardControls
- [ ] `src/components/world/InteractionManager.jsx` exists and mounts the useInteraction hook
- [ ] No console errors

## Technical Notes

- **Sensor colliders** in Rapier do not cause physics collisions — they only detect overlaps. The player can walk through the sensor zone without being blocked. The NPC's visual body is not a collision obstacle by default because we set `colliders={false}` on the RigidBody. If you want the player to NOT walk through NPCs, add a separate `<CapsuleCollider args={[0.35, 0.3]} />` (non-sensor) alongside the sensor collider.
- **`onIntersectionEnter` / `onIntersectionExit`** fire when ANY physics body enters/exits the sensor. The player's ecctrl capsule collider will trigger these. Other NPC sensors should NOT trigger each other because `type="fixed"` bodies don't move and shouldn't intersect.
- **Float component** from drei wraps children in a group that oscillates position/rotation over time. Set `rotationIntensity={0}` to prevent spinning — we only want vertical float.
- **useKeyboardControls** returns the current state of the mapped key. It returns `true` when the key is held down and `false` when released. The `useEffect` watching `interactPressed` will fire on both press and release. Check for `interactPressed === true` in the condition.
- **NPC Y position** should be `0.5` (the island surface). The NPC's capsule geometry is centered at origin, so the feet will be at roughly `y = 0.5 - 0.35 - 0.3 = -0.15` relative to the NPC position. You may need to adjust to `position={[x, 1.0, z]}` if NPCs appear to float or sink. Test and adjust.
- The `useInteraction` hook currently only logs to console. The actual dialogue system (setting `activeDialogue` in the store and rendering a dialogue UI) is implemented in Phase 2 (UI Layer). This hook will be extended at that point.

## Estimated Complexity
Complex
