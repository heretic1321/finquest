# TASK 01: Island Terrain + Ocean + Atmosphere

## Phase
Phase 1a — 3D World Foundation

## Prerequisites
- TASK_00 must be complete (R3F Canvas, Physics, KeyboardControls, folder structure)

## Goal
Build the island terrain (green cylinder + sandy beach + underwater base), an animated ocean plane with wave motion, sky/environment/fog for coastal aesthetics, and proper lighting with shadows. This creates the visual foundation — the island the player explores.

## Detailed Requirements

### 1. Island Component — `src/components/world/Island.jsx`

The island is built from simple geometric primitives (no GLB models needed):

**Main Island Platform (green):**
- `cylinderGeometry` with args `[8, 8, 2, 32]` (radiusTop=8, radiusBottom=8, height=2, segments=32)
- Position: `[0, 0, 0]` (center of the world, half-embedded)
- Color: `#4a8c5c` (rich green)
- `receiveShadow` enabled

**Beach Ring (sandy edge):**
- `cylinderGeometry` with args `[10, 10, 1.5, 32]` (slightly wider than island)
- Position: `[0, -0.3, 0]` (slightly below the green surface)
- Color: `#e8d5a3` (warm sand color)
- `receiveShadow` enabled

**Underwater Base:**
- `cylinderGeometry` with args `[9, 6, 4, 32]` (tapers downward)
- Position: `[0, -3, 0]` (extends below water level)
- Color: `#3d6b4e` (dark green/brown — underwater rock)

**Physics Collider (CRITICAL):**
The island MUST have a physics collider so the player and NPCs don't fall through. Use the Rapier trimesh collider pattern:

```jsx
import { RigidBody } from '@react-three/rapier';

export default function Island() {
  return (
    <RigidBody type="fixed" colliders="trimesh" restitution={0.2} friction={1}>
      <group>
        {/* Main platform */}
        <mesh receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[8, 8, 2, 32]} />
          <meshStandardMaterial color="#4a8c5c" />
        </mesh>
        {/* Beach ring */}
        <mesh receiveShadow position={[0, -0.3, 0]}>
          <cylinderGeometry args={[10, 10, 1.5, 32]} />
          <meshStandardMaterial color="#e8d5a3" />
        </mesh>
        {/* Underwater base */}
        <mesh position={[0, -3, 0]}>
          <cylinderGeometry args={[9, 6, 4, 32]} />
          <meshStandardMaterial color="#3d6b4e" />
        </mesh>
      </group>
    </RigidBody>
  );
}
```

### 2. Ocean Component — `src/components/world/Ocean.jsx`

**Simple Approach (USE THIS — reliable and fast):**

A large plane at water level with a gentle animated bob:

```jsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function Ocean() {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = Math.sin(t * 0.5) * 0.1 - 0.3;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial
        color="#1a6ea0"
        transparent
        opacity={0.85}
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  );
}
```

Key details:
- Plane is 200x200 (large enough to look infinite)
- Position.y bobs gently with sine wave
- Semi-transparent blue, low roughness for water sheen
- No physics collider on the ocean (player falls through and respawns)

**Advanced Approach (OPTIONAL — only if time allows):**
Use the stylized water shader from `three-custom-shader-material` with GLSL noise for foam and wave lines. This requires the `vite-plugin-glsl` from TASK_00. Reference: `../references/stylized-water/`. Only attempt this if the simple approach is done and working first.

### 3. Atmosphere — `src/components/world/Atmosphere.jsx`

This component sets up the sky, environment lighting, and fog. Use the Coastal Atmosphere pattern from resources.md:

```jsx
import { Sky, Environment } from '@react-three/drei';

export default function Atmosphere() {
  return (
    <>
      {/* Fog — creates depth, hides ocean edge */}
      <fog attach="fog" args={['#eeeeff', 20, 50]} />

      {/* Sky dome */}
      <Sky
        sunPosition={[100, 20, 100]}
        turbidity={0.5}
        rayleigh={0.5}
      />

      {/* Environment map for reflections */}
      <Environment preset="sunset" environmentIntensity={0.3} />
    </>
  );
}
```

### 4. Lighting — `src/components/world/Lighting.jsx`

```jsx
export default function Lighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        castShadow
        position={[3, 8, 3]}
        intensity={0.42}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-normalBias={0.06}
      />
    </>
  );
}
```

Key details:
- Directional light at `[3, 8, 3]` — high-ish sun angle
- Shadow map 2048x2048 for crisp shadows
- Shadow camera frustum sized to cover the island (-15 to 15)
- `shadow-normalBias={0.06}` prevents shadow acne
- Ambient light at 0.4 for fill

### 5. Update App.jsx — Wire Everything Together

Replace the placeholder content in `App.jsx` with the new world components:

```jsx
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { keyboardMap } from './data/keyboardMap';
import Island from './components/world/Island';
import Ocean from './components/world/Ocean';
import Atmosphere from './components/world/Atmosphere';
import Lighting from './components/world/Lighting';

function App() {
  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas
        shadows
        camera={{ position: [0, 8, 15], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <Physics timeStep="vary">
            <Atmosphere />
            <Lighting />
            <Island />
            <Ocean />
            {/* Player controller goes here in TASK_02 */}
            {/* NPCs go here in TASK_03 */}
          </Physics>
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
}

export default App;
```

Note: Camera position moved to `[0, 8, 15]` for a better overview of the island.

## File Structure

```
CREATE: src/components/world/Island.jsx
CREATE: src/components/world/Ocean.jsx
CREATE: src/components/world/Atmosphere.jsx
CREATE: src/components/world/Lighting.jsx
MODIFY: src/App.jsx (add world component imports and usage)
```

## Data/Constants

| Constant | Value | Notes |
|----------|-------|-------|
| Island radius (top) | 8 | Main walkable area |
| Beach radius | 10 | Sandy beach extends 2 units beyond island |
| Island height | 2 | Total height of main platform |
| Island surface Y | ~1.0 | Top of the island (player walks here) |
| Water Y | -0.3 | Ocean surface level |
| Fog near | 20 | Fog starts |
| Fog far | 50 | Fog fully opaque |
| Fog color | #eeeeff | Light blue-white |
| Island color | #4a8c5c | Rich green |
| Beach color | #e8d5a3 | Warm sand |
| Underwater color | #3d6b4e | Dark green |
| Ocean color | #1a6ea0 | Deep blue |
| Ocean opacity | 0.85 | Semi-transparent |
| Ocean size | 200x200 | Large enough to look infinite |
| Sun position | [100, 20, 100] | Low angle, warm sunset look |
| Shadow map size | 2048 | Crisp shadows |

## Code Patterns (from resources.md)

### Terrain with Trimesh Collider
```jsx
<RigidBody type="fixed" colliders="trimesh" restitution={0.2} friction={1}>
  <IslandGeometry />
</RigidBody>
```

### Coastal Atmosphere
```jsx
<fog attach="fog" args={["#eeeeff", 20, 50]} />
<Environment preset="sunset" environmentIntensity={0.3} />
<Sky sunPosition={[100, 20, 100]} turbidity={0.5} rayleigh={0.5} />
<directionalLight castShadow position={[3, 1, 3]} intensity={0.42} shadow-normalBias={0.06} />
```

## Acceptance Criteria

- [ ] Island is visible — a green circular platform with sandy beach edges
- [ ] Ocean plane surrounds the island, gently bobbing up and down
- [ ] Sky is visible with a sunset-like environment
- [ ] Fog creates depth — distant objects fade into haze
- [ ] Shadows are cast on the island surface by the directional light
- [ ] The island has a physics collider (test: drop a small sphere onto it — it should land, not fall through)
- [ ] No console errors
- [ ] Scene looks like a small tropical island surrounded by ocean

## What NOT to Do

- Do NOT add fancy models (GLB trees, rocks, decorations) — capsules and boxes are fine for MVP
- Do NOT add post-processing effects (bloom, vignette) — skip for P0
- Do NOT add terrain textures or splat maps
- Do NOT use heightmap terrain — simple cylinders are enough
- Do NOT spend time on advanced water shaders unless the simple approach is done and working
- Do NOT add the player character — that's TASK_02
- Do NOT add NPCs or buildings — that's TASK_03

## Estimated Complexity
Medium — ~45 minutes. Four new components, straightforward geometry and material work.
