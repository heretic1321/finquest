# TASK 03: Zone Buildings + NPCs with Proximity Detection

## Phase
Phase 1c — Zone Buildings & NPC System

## Prerequisites
- TASK_00 must be complete (R3F Canvas, Physics, KeyboardControls, folder structure)
- TASK_01 must be complete (Island terrain — buildings sit on the island)
- TASK_02 must be complete (Player controller — player needs to walk near NPCs to trigger proximity)

## Goal
Add 3 zone buildings (TechCorp, Scam Park, MF Tower) as simple colored boxes with physics colliders, and 3-4 NPC capsules with name tags and proximity detection. When the player walks near an NPC, an "[E] Talk" prompt appears floating above the NPC.

## Detailed Requirements

### 1. NPC Data — `src/data/npcData.js`

Define all NPCs with their properties:

```js
export const NPC_DATA = [
  {
    id: 'didi',
    name: 'Didi',
    title: 'Your Guide',
    position: [0, 1.2, 3],
    color: '#ff6b9d',
    zone: 'spawn',
    description: 'Friendly island guide who welcomes you',
  },
  {
    id: 'hr-vikram',
    name: 'HR Vikram',
    title: 'TechCorp HR',
    position: [-5, 1.2, -3],
    color: '#4488cc',
    zone: 'techcorp',
    description: 'Handles your hiring and salary at TechCorp',
  },
  {
    id: 'scam-alert',
    name: 'Shady Rajesh',
    title: 'Stranger in Park',
    position: [5, 1.2, -2],
    color: '#cc4444',
    zone: 'scampark',
    description: 'Suspicious character with too-good-to-be-true offers',
  },
  {
    id: 'mf-advisor',
    name: 'MF Advisor',
    title: 'Mutual Fund Expert',
    position: [0, 1.2, -6],
    color: '#44cc88',
    zone: 'mftower',
    description: 'Teaches you about SIPs and mutual funds',
  },
];
```

**NPC Positions** are on the island surface. The island surface Y is approximately 1.0 (top of the 2-unit-tall cylinder centered at Y=0). NPCs at Y=1.2 stand just above the surface.

### 2. Zone Buildings Data — `src/data/zoneData.js`

```js
export const ZONE_DATA = [
  {
    id: 'techcorp',
    name: 'TechCorp Office',
    position: [-5, 1.5, -4],
    size: [2.5, 3, 2],
    color: '#6699cc',
    emissive: '#224466',
    emissiveIntensity: 0.15,
    description: 'Modern tech company — your first employer',
  },
  {
    id: 'scampark',
    name: 'Scam Park',
    position: [5, 1.2, -3],
    size: [3, 0.4, 3],
    color: '#66aa66',
    emissive: '#225522',
    emissiveIntensity: 0.1,
    description: 'A peaceful park... or is it?',
    // Park is a flat platform (bench area), not a tall building
  },
  {
    id: 'mftower',
    name: 'MF Tower',
    position: [0, 2.5, -7],
    size: [2, 5, 2],
    color: '#888888',
    emissive: '#333333',
    emissiveIntensity: 0.1,
    description: 'Mutual Fund advisory tower',
  },
];
```

### 3. Zone Building Component — `src/components/world/ZoneBuilding.jsx`

Each building is a simple box with a physics collider and a floating name label:

```jsx
import { RigidBody } from '@react-three/rapier';
import { Text, Float } from '@react-three/drei';

export default function ZoneBuilding({ data }) {
  const { name, position, size, color, emissive, emissiveIntensity } = data;

  return (
    <group position={position}>
      {/* Physics collider so player can't walk through */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial
            color={color}
            emissive={emissive || color}
            emissiveIntensity={emissiveIntensity || 0}
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>
      </RigidBody>

      {/* Floating name label above building */}
      <Float speed={1} floatIntensity={0.3} rotationIntensity={0}>
        <Text
          position={[0, size[1] / 2 + 1, 0]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="black"
        >
          {name}
        </Text>
      </Float>
    </group>
  );
}
```

### 4. NPC Component — `src/components/world/NPC.jsx`

Each NPC is a capsule mesh with a name tag and a Rapier CuboidCollider sensor for proximity detection:

```jsx
import { useState } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Text, Float } from '@react-three/drei';
import { useGameStore } from '../../stores/useGameStore';

export default function NPC({ data }) {
  const { id, name, title, position, color } = data;
  const [isNearby, setIsNearby] = useState(false);
  const setNearbyNPC = useGameStore((s) => s.setNearbyNPC);

  const handleEnter = () => {
    setIsNearby(true);
    setNearbyNPC(data);
  };

  const handleExit = () => {
    setIsNearby(false);
    setNearbyNPC(null);
  };

  return (
    <group position={position}>
      <RigidBody type="fixed" colliders={false}>
        {/* Proximity sensor — invisible box that detects player */}
        <CuboidCollider
          args={[3, 3, 3]}
          sensor
          onIntersectionEnter={handleEnter}
          onIntersectionExit={handleExit}
        />

        {/* NPC body — capsule */}
        <mesh castShadow position={[0, 0, 0]}>
          <capsuleGeometry args={[0.25, 0.6, 8, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* NPC head — sphere */}
        <mesh castShadow position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#ffcc88" />
        </mesh>
      </RigidBody>

      {/* Name tag — always visible */}
      <Float speed={1.5} floatIntensity={0.2} rotationIntensity={0}>
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="black"
        >
          {name}
        </Text>
        <Text
          position={[0, 0.95, 0]}
          fontSize={0.15}
          color="#aaaaaa"
          anchorX="center"
          anchorY="middle"
        >
          {title}
        </Text>
      </Float>

      {/* [E] Talk prompt — only visible when player is nearby */}
      {isNearby && (
        <Float speed={3} floatIntensity={0.5} rotationIntensity={0}>
          <Text
            position={[0, 1.6, 0]}
            fontSize={0.3}
            color="#ffdd44"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.04}
            outlineColor="black"
            font={undefined}
          >
            [E] Talk
          </Text>
        </Float>
      )}
    </group>
  );
}
```

**Critical Pattern — NPC Dialogue Trigger (from resources.md):**
```jsx
<RigidBody type="fixed" colliders={false}>
  <CuboidCollider args={[3, 3, 3]} sensor
    onIntersectionEnter={() => setNearbyNPC(npcData)}
    onIntersectionExit={() => setNearbyNPC(null)}
  />
  <NPCModel />
</RigidBody>
```

This uses Rapier's sensor collider:
- `sensor` flag means it detects overlaps but doesn't physically block
- `onIntersectionEnter` fires when the player capsule enters the sensor zone
- `onIntersectionExit` fires when the player leaves
- The `args={[3, 3, 3]}` makes a 6x6x6 detection box around the NPC

### 5. Create a Minimal Zustand Store — `src/stores/useGameStore.js`

This task needs `setNearbyNPC` and `nearbyNPC` to work. Create a minimal store that later tasks will expand:

```js
import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  // NPC proximity state
  nearbyNPC: null,
  setNearbyNPC: (npc) => set({ nearbyNPC: npc }),

  // Placeholder state — will be expanded in Phase 2 (UI/Dialogue task)
  balance: 0,
  financialHealth: 50,
  month: 1,
  transactions: [],
  completedZones: [],
  activeDialogue: null,
  investments: { sip: 0, insurance: false },

  // Placeholder actions — will be expanded in Phase 2
  addMoney: (amount, label) => set((s) => ({
    balance: s.balance + amount,
    transactions: [...s.transactions, { type: 'credit', amount, label }],
  })),
  spendMoney: (amount, label) => set((s) => ({
    balance: s.balance - amount,
    transactions: [...s.transactions, { type: 'debit', amount, label }],
  })),
  setDialogue: (dialogue) => set({ activeDialogue: dialogue }),
  clearDialogue: () => set({ activeDialogue: null }),
  advanceMonth: () => set((s) => ({ month: s.month + 1 })),
  completeZone: (zone) => set((s) => ({
    completedZones: [...s.completedZones, zone],
  })),
  updateHealth: (delta) => set((s) => ({
    financialHealth: Math.max(0, Math.min(100, s.financialHealth + delta)),
  })),
}));
```

**NOTE:** The Phase 2 UI task may overwrite/expand this store. That's fine — include the full structure now so NPC proximity works and the store shape is established.

### 6. Scam Park Decoration — Simple Props

For the Scam Park area, add a couple of simple tree and bench shapes to distinguish it from a bare zone:

```jsx
// Inside the ScamPark zone area, alongside the building:
// Simple tree — cylinder trunk + sphere canopy
function SimpleTree({ position }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 1, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh castShadow position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  );
}

// Simple bench — flat box
function SimpleBench({ position, rotation }) {
  return (
    <mesh castShadow position={position} rotation={rotation}>
      <boxGeometry args={[1.2, 0.15, 0.4]} />
      <meshStandardMaterial color="#8B6914" />
    </mesh>
  );
}
```

Place 2-3 trees and 1-2 benches around the Scam Park zone.

### 7. Update App.jsx — Wire Buildings and NPCs

```jsx
import { ZONE_DATA } from './data/zoneData';
import { NPC_DATA } from './data/npcData';
import ZoneBuilding from './components/world/ZoneBuilding';
import NPC from './components/world/NPC';

// Inside <Physics>:
{ZONE_DATA.map((zone) => (
  <ZoneBuilding key={zone.id} data={zone} />
))}
{NPC_DATA.map((npc) => (
  <NPC key={npc.id} data={npc} />
))}
```

## File Structure

```
CREATE: src/data/npcData.js
CREATE: src/data/zoneData.js
CREATE: src/components/world/ZoneBuilding.jsx
CREATE: src/components/world/NPC.jsx
CREATE: src/stores/useGameStore.js
MODIFY: src/App.jsx (add zone buildings and NPCs)
```

## Data/Constants

### NPC Positions (on island surface)

| NPC | ID | Position | Color | Zone |
|-----|----|----------|-------|------|
| Didi | didi | [0, 1.2, 3] | #ff6b9d (pink) | spawn |
| HR Vikram | hr-vikram | [-5, 1.2, -3] | #4488cc (blue) | techcorp |
| Shady Rajesh | scam-alert | [5, 1.2, -2] | #cc4444 (red) | scampark |
| MF Advisor | mf-advisor | [0, 1.2, -6] | #44cc88 (green) | mftower |

### Zone Building Positions

| Zone | ID | Position | Size (w,h,d) | Color |
|------|----|----------|--------------|-------|
| TechCorp Office | techcorp | [-5, 1.5, -4] | [2.5, 3, 2] | #6699cc (glass blue) |
| Scam Park | scampark | [5, 1.2, -3] | [3, 0.4, 3] | #66aa66 (green platform) |
| MF Tower | mftower | [0, 2.5, -7] | [2, 5, 2] | #888888 (grey) |

### Sensor Sizes
- NPC proximity sensor: `CuboidCollider args={[3, 3, 3]}` — 6x6x6 detection box
- This means the "[E] Talk" prompt appears when the player is within ~3 units of the NPC center

## Code Patterns (from resources.md)

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

### Zustand Game Store
```js
const useGameStore = create((set, get) => ({
  balance: 0,
  financialHealth: 50,
  month: 1,
  transactions: [],
  completedZones: [],
  activeDialogue: null,
  investments: { sip: 0, insurance: false },
  nearbyNPC: null,

  addMoney: (amount, label) => set(s => ({
    balance: s.balance + amount,
    transactions: [...s.transactions, { type: 'credit', amount, label }]
  })),
  spendMoney: (amount, label) => set(s => ({
    balance: s.balance - amount,
    transactions: [...s.transactions, { type: 'debit', amount, label }]
  })),
  setDialogue: (dialogue) => set({ activeDialogue: dialogue }),
  clearDialogue: () => set({ activeDialogue: null }),
  advanceMonth: () => set(s => ({ month: s.month + 1 })),
  completeZone: (zone) => set(s => ({ completedZones: [...s.completedZones, zone] })),
  setNearbyNPC: (npc) => set({ nearbyNPC: npc }),
  updateHealth: (delta) => set(s => ({
    financialHealth: Math.max(0, Math.min(100, s.financialHealth + delta))
  })),
}));
```

### Float + Text for Labels (drei)
```jsx
import { Text, Float } from '@react-three/drei';

<Float speed={1.5} floatIntensity={0.2} rotationIntensity={0}>
  <Text
    position={[0, 1.2, 0]}
    fontSize={0.25}
    color="white"
    anchorX="center"
    anchorY="middle"
    outlineWidth={0.03}
    outlineColor="black"
  >
    NPC Name
  </Text>
</Float>
```

## Acceptance Criteria

- [ ] 3 zone buildings are visible on the island at correct positions
  - TechCorp: glass-blue box on one side
  - Scam Park: green flat area with trees/benches on another side
  - MF Tower: tall grey box at another location
- [ ] Each building has a floating name label above it
- [ ] 4 NPC capsules are visible at their positions with name tags
  - Didi near spawn, HR Vikram near TechCorp, Shady Rajesh near Scam Park, MF Advisor near MF Tower
- [ ] Walking near any NPC (within ~3 units) shows the yellow "[E] Talk" prompt
- [ ] Walking away from the NPC hides the "[E] Talk" prompt
- [ ] Buildings have physics colliders — player cannot walk through them
- [ ] NPCs don't physically block the player (sensors only)
- [ ] The Zustand store has `nearbyNPC` state that updates correctly
- [ ] No console errors

## What NOT to Do

- Do NOT implement the actual dialogue system (dialogue box UI, text content, choice buttons) — that's a Phase 2 task
- Do NOT implement quest logic (talking to HR Vikram shouldn't trigger the TechCorp quest yet)
- Do NOT add fancy 3D models for buildings or NPCs — boxes and capsules are fine
- Do NOT add NPC walking/patrol behavior — stationary NPCs are enough for P0
- Do NOT add sound effects for proximity detection
- Do NOT add building interiors
- Do NOT add more than the 4 NPCs listed above

## Estimated Complexity
Medium — ~45 minutes. Several new components, NPC sensor pattern, and the Zustand store setup.
