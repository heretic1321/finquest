# TASK 03: Zone Buildings + NPCs with Proximity Detection

## Phase
Phase 1c -- 3D World Foundation

## Priority
P0

## Prerequisites
- TASK_00 (project setup)
- TASK_01 (island terrain -- buildings sit on the island)
- TASK_02 (player controller -- needed for proximity collision)
- TASK_04 (game store -- setNearbyNPC, setDialogue actions)

## Goal
Add 3 distinct zone buildings (TechCorp, Scam Park, MF Tower) as simple colored geometry on the island, plus 3-4 NPC capsules at fixed positions with floating name tags and Rapier sensor-based proximity detection that shows "[E] Talk" when the player is near.

## Detailed Requirements

### 1. Zone Buildings -- `src/components/world/ZoneBuildings.jsx`

Simple colored box/cylinder geometry with RigidBody colliders. No GLB models needed.

**TechCorp Office (glass-blue box):**
- Position: `[10, 2, -8]` (northeast area of island)
- Geometry: `boxGeometry args={[4, 4, 4]}`
- Color: `#4FC3F7` (light blue, glass-like)
- Add a roof: `boxGeometry args={[4.5, 0.3, 4.5]}` at y offset +2.15, color `#0288D1`
- RigidBody type="fixed" colliders="cuboid"

**Scam Park Area (park with benches):**
- Position: `[-10, 1.5, -6]` (northwest area)
- Visual: 2-3 tree groups (cylinder trunk + sphere canopy) + 1-2 bench meshes (boxes)
- Trees: trunk `cylinderGeometry args={[0.15, 0.2, 2, 8]}` color `#8B4513`, canopy `sphereGeometry args={[1.2, 8, 8]}` color `#2E7D32`
- Benches: `boxGeometry args={[1.5, 0.3, 0.5]}` at y=0.65, color `#795548`
- No single building collider needed; individual tree trunks can have colliders or skip them

**MF Tower (tall grey building):**
- Position: `[8, 3, 8]` (southeast area)
- Geometry: `boxGeometry args={[3, 6, 3]}`
- Color: `#78909C` (blue-grey)
- Add a roof accent: `boxGeometry args={[1, 1, 1]}` at y offset +3.5, color `#546E7A`
- RigidBody type="fixed" colliders="cuboid"

```jsx
import { RigidBody } from '@react-three/rapier'

export default function ZoneBuildings() {
  return (
    <group>
      {/* TechCorp Office */}
      <group position={[10, 2, -8]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh castShadow>
            <boxGeometry args={[4, 4, 4]} />
            <meshStandardMaterial color="#4FC3F7" roughness={0.3} metalness={0.1} />
          </mesh>
        </RigidBody>
        <mesh castShadow position={[0, 2.15, 0]}>
          <boxGeometry args={[4.5, 0.3, 4.5]} />
          <meshStandardMaterial color="#0288D1" />
        </mesh>
      </group>

      {/* Scam Park area -- trees and benches */}
      <group position={[-10, 0.5, -6]}>
        {/* Tree 1 */}
        <group position={[0, 1, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.15, 0.2, 2, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh castShadow position={[0, 1.5, 0]}>
            <sphereGeometry args={[1.2, 8, 8]} />
            <meshStandardMaterial color="#2E7D32" />
          </mesh>
        </group>
        {/* Tree 2 */}
        <group position={[3, 1, 1]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.15, 0.2, 2, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh castShadow position={[0, 1.5, 0]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color="#388E3C" />
          </mesh>
        </group>
        {/* Bench */}
        <mesh castShadow position={[1.5, 0.65, 2]}>
          <boxGeometry args={[1.5, 0.3, 0.5]} />
          <meshStandardMaterial color="#795548" />
        </mesh>
      </group>

      {/* MF Tower */}
      <group position={[8, 3, 8]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh castShadow>
            <boxGeometry args={[3, 6, 3]} />
            <meshStandardMaterial color="#78909C" roughness={0.5} />
          </mesh>
        </RigidBody>
        <mesh castShadow position={[0, 3.5, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#546E7A" />
        </mesh>
      </group>
    </group>
  )
}
```

### 2. NPC Data -- `src/data/npcs.js`

Static data file defining all NPCs:

```js
export const NPC_DATA = [
  {
    id: 'hr-vikram',
    name: 'HR Vikram',
    position: [8, 1.5, -5],
    color: '#4FC3F7',
    zone: 'techcorp',
    greeting: "Welcome to TechCorp! Ready to start your career?",
  },
  {
    id: 'scam-alert',
    name: 'Friendly Stranger',
    position: [-8, 1.5, -4],
    color: '#EF5350',
    zone: 'scampark',
    greeting: "Hey! Got a minute? I have something interesting for you...",
  },
  {
    id: 'mf-advisor',
    name: 'MF Advisor Priya',
    position: [6, 1.5, 6],
    color: '#66BB6A',
    zone: 'mftower',
    greeting: "Hello! Ready to learn about the power of compounding?",
  },
  {
    id: 'didi',
    name: 'Didi',
    position: [0, 1.5, 3],
    color: '#AB47BC',
    zone: 'spawn',
    greeting: "Welcome to FinQuest Island! I'm Didi, your guide. Walk around and explore -- talk to people at each zone to learn about money!",
  },
]
```

### 3. NPC Component -- `src/components/npcs/NPC.jsx`

Each NPC is a colored capsule with a floating name tag and a Rapier sensor collider for proximity detection.

```jsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import useGameStore from '../../stores/gameStore'

export default function NPC({ id, name, position, color, zone, greeting }) {
  const groupRef = useRef()
  const setNearbyNPC = useGameStore((s) => s.setNearbyNPC)
  const nearbyNPC = useGameStore((s) => s.nearbyNPC)
  const isNearby = nearbyNPC?.id === id

  // Idle bobbing animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        position[1] + Math.sin(clock.getElapsedTime() * 2 + position[0]) * 0.08
    }
  })

  const handleEnter = () => {
    setNearbyNPC({ id, name, color, zone, greeting })
  }

  const handleExit = () => {
    // Only clear if this NPC is the current nearby one
    const current = useGameStore.getState().nearbyNPC
    if (current?.id === id) {
      setNearbyNPC(null)
    }
  }

  return (
    <group ref={groupRef} position={position}>
      {/* Proximity sensor -- invisible, triggers enter/exit */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[3, 3, 3]}
          sensor
          onIntersectionEnter={handleEnter}
          onIntersectionExit={handleExit}
        />
      </RigidBody>

      {/* NPC Body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.35, 0.7, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>

      {/* Head */}
      <mesh castShadow position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#fde68a" roughness={0.5} />
      </mesh>

      {/* Name tag */}
      <Float speed={2} floatIntensity={0.15}>
        <Text
          position={[0, 1.6, 0]}
          fontSize={0.22}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000"
          font={undefined}
        >
          {name}
        </Text>
      </Float>

      {/* [E] Talk prompt -- only when nearby */}
      {isNearby && (
        <Float speed={3} floatIntensity={0.25}>
          <Text
            position={[0, 2.1, 0]}
            fontSize={0.18}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#000"
          >
            [E] Talk
          </Text>
        </Float>
      )}

      {/* Glow point light */}
      <pointLight
        position={[0, 1, 0]}
        color={color}
        intensity={isNearby ? 2 : 0.5}
        distance={4}
      />
    </group>
  )
}
```

### 4. NPC List Renderer -- `src/components/npcs/NPCList.jsx`

Renders all NPCs from the data file:

```jsx
import NPC from './NPC'
import { NPC_DATA } from '../../data/npcs'

export default function NPCList() {
  return (
    <>
      {NPC_DATA.map((npc) => (
        <NPC key={npc.id} {...npc} />
      ))}
    </>
  )
}
```

### 5. E Key Interaction Hook -- `src/hooks/useInteraction.js`

A hook that listens for the E key press and triggers dialogue when near an NPC:

```js
import { useEffect } from 'react'
import useGameStore from '../stores/gameStore'

export default function useInteraction() {
  const nearbyNPC = useGameStore((s) => s.nearbyNPC)
  const activeDialogue = useGameStore((s) => s.activeDialogue)
  const setDialogue = useGameStore((s) => s.setDialogue)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyE' && nearbyNPC && !activeDialogue) {
        // For now, set a simple single-step dialogue with the greeting
        // Quest-specific dialogues will override this in TASK_08+
        setDialogue({
          npcName: nearbyNPC.name,
          npcColor: nearbyNPC.color,
          steps: [
            {
              text: nearbyNPC.greeting,
              choices: [
                { label: 'Thanks!', action: null, nextStep: null }
              ]
            }
          ]
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nearbyNPC, activeDialogue, setDialogue])
}
```

### 6. Update `src/App.jsx`

Add ZoneBuildings, NPCList, and the useInteraction hook:

```jsx
import ZoneBuildings from './components/world/ZoneBuildings'
import NPCList from './components/npcs/NPCList'
import useInteraction from './hooks/useInteraction'

// Inside App component, call the hook:
// useInteraction()

// Inside <Physics>:
// <ZoneBuildings />
// <NPCList />
```

Note: `useInteraction()` must be called inside the App component body (it's a React hook). It registers a global keydown listener.

## Code Patterns from resources.md

### NPC Dialogue Trigger (Rapier sensor)
```jsx
<RigidBody type="fixed" colliders={false}>
  <CuboidCollider args={[3, 3, 3]} sensor
    onIntersectionEnter={() => setNearbyNPC(npcData)}
    onIntersectionExit={() => setNearbyNPC(null)}
  />
  <NPCModel />
</RigidBody>
```

### drei Text + Float
```jsx
import { Float, Text } from '@react-three/drei'

<Float speed={2} floatIntensity={0.2}>
  <Text
    position={[0, 1.5, 0]}
    fontSize={0.25}
    color={color}
    anchorX="center"
    anchorY="middle"
    outlineWidth={0.02}
    outlineColor="#000"
  >
    {name}
  </Text>
</Float>
```

## Data/Constants

### NPC Positions (on island surface, y=1.5 for standing height):
| NPC | Position | Zone |
|-----|----------|------|
| HR Vikram | [8, 1.5, -5] | TechCorp (near blue building) |
| Friendly Stranger | [-8, 1.5, -4] | Scam Park (near trees) |
| MF Advisor Priya | [6, 1.5, 6] | MF Tower (near grey building) |
| Didi | [0, 1.5, 3] | Spawn (island center) |

### Building Positions:
| Building | Position | Size |
|----------|----------|------|
| TechCorp | [10, 2, -8] | 4x4x4 |
| Scam Park | [-10, 0.5, -6] | Organic (trees/benches) |
| MF Tower | [8, 3, 8] | 3x6x3 |

## Files to Create/Modify

| Action | File Path |
|--------|-----------|
| Create | `src/components/world/ZoneBuildings.jsx` |
| Create | `src/data/npcs.js` |
| Create | `src/components/npcs/NPC.jsx` |
| Create | `src/components/npcs/NPCList.jsx` |
| Create | `src/hooks/useInteraction.js` |
| Modify | `src/App.jsx` (add ZoneBuildings, NPCList, useInteraction) |

## Acceptance Criteria

- [ ] Three distinct zone buildings visible on the island (blue TechCorp, park area, grey MF Tower)
- [ ] Buildings have physics colliders (player can't walk through them)
- [ ] 4 NPC capsules visible at their positions with colored bodies and floating name tags
- [ ] NPCs have idle bobbing animation
- [ ] Walking near an NPC shows "[E] Talk" floating text
- [ ] Walking away from NPC hides the "[E] Talk" text
- [ ] Pressing E near an NPC opens a simple greeting dialogue (stored in activeDialogue)
- [ ] NPC glow intensifies when player is nearby
- [ ] No console errors

## What NOT to Do

- Do NOT add fancy 3D models (capsules and boxes are fine for MVP)
- Do NOT add NPC walking/pathfinding
- Do NOT implement full quest dialogues here (just greeting -- quests come in TASK_08+)
- Do NOT add decorative trees/rocks beyond the Scam Park area
- Do NOT add zone labels or signs

## Estimated Complexity
Medium
