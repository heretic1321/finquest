# FinQuest — Hackathon Resources Master Document

Everything needed to build the 3D island financial education RPG in 24 hours.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Asset Packs (Downloaded)](#asset-packs-downloaded)
- [Reference Repos (Cloned)](#reference-repos-cloned)
- [Key Code Patterns](#key-code-patterns)
- [Articles & Tutorials](#articles--tutorials)
- [Tools](#tools)
- [External APIs](#external-apis)

---

## Tech Stack

### Frontend (3D Game)

| Layer | Package | Why |
|---|---|---|
| Build | **Vite 6** | Sub-1s cold start, R3F team uses it. Next.js SSR breaks Three.js |
| Framework | **React 19 + React Three Fiber 9** | 90x adoption over alternatives, richest ecosystem |
| Helpers | **@react-three/drei 10** | Sky, Environment, Float, Text, useGLTF, useAnimations, KeyboardControls |
| Physics | **@react-three/rapier 2** | WASM+SIMD, sensors, trimesh terrain, raycasting. Cannon is dead, Jolt pre-alpha |
| Character Controller | **ecctrl** (pmndrs) | Drop-in 3rd person: camera, animations, joystick, gamepad in ~10 lines |
| Post-Processing | **@react-three/postprocessing** | Bloom, vignette, depth-of-field, color grading |
| Water Shader | **three-custom-shader-material** | Extend MeshStandardMaterial with custom GLSL |
| State | **Zustand** | Lightweight, no boilerplate, works great with R3F |
| Pkg Manager | **pnpm** | 2x faster than npm, reliable with R3F ecosystem |

### Backend (AI + Data)

| Layer | Package | Why |
|---|---|---|
| Runtime | **Bun** | 8ms cold start, native TypeScript, AI SDKs work |
| Framework | **Hono** | Express-like syntax, 3x faster, deploys anywhere |
| Database | **Supabase** | Postgres + pgvector + Auth + Realtime, one free service |
| RAG Vector Store | **Supabase pgvector** | Same DB as relational data, one SQL command to enable |
| Embeddings | **OpenAI text-embedding-3-small** | $0.02/1M tokens, best quality/cost |

### AI (NPC Dialogue + Voice)

| Layer | Package | Why |
|---|---|---|
| LLM (primary) | **Groq** (Llama 3 70B) | 0.22s TTFT, 300+ tok/s — NPCs feel real-time |
| LLM (fallback) | **OpenAI GPT-4o-mini** | Better quality for complex financial concepts |
| STT | **Web Speech API** | Free, zero setup, built into Chrome |
| TTS | **Groq Orpheus TTS** | Fast, expressive, keeps entire pipeline on Groq |

### Deploy

| Layer | Choice |
|---|---|
| Frontend | **Vercel** (one git push) |
| Backend | **Vercel Edge Functions** or **Railway** ($5 free) |
| DB | **Supabase** (already hosted) |

---

## Asset Packs (Downloaded)

All stored in `/assets/` directory. All CC0 licensed (public domain).

### Kenney — `/assets/kenney/`

| Pack | Folder | Count | Contents | URL |
|---|---|---|---|---|
| Nature Kit | `nature-kit/` | 3,618 files | Trees, rocks, bushes, grass, plants (GLB/FBX/OBJ) | https://kenney.nl/assets/nature-kit |
| Pirate Kit | `pirate-kit/` | 370 files | Ships, palm trees, treasure, island pieces, fortress | https://kenney.nl/assets/pirate-kit |
| Fantasy Town Kit | `fantasy-town-kit/` | 847 files | Modular buildings, walls, roofs, props | https://kenney.nl/assets/fantasy-town-kit |
| Watercraft Kit | `watercraft-kit/` | 239 files | Boats, ships, sails, flags | https://kenney.nl/assets/watercraft-kit |
| UI Pack | `ui-pack/` | 1,315 files | Buttons, sliders, panels, icons (PNG + spritesheet) | https://kenney.nl/assets/ui-pack |
| UI Pack RPG | `ui-pack-rpg-expansion/` | 94 files | Inventory slots, stat bars, portraits | https://kenney.nl/assets/ui-pack-rpg-expansion |

### Quaternius — `/assets/quaternius/`

| Pack | Folder | Count | Contents | URL |
|---|---|---|---|---|
| Stylized Nature MegaKit | `stylized-nature/` | 454 files | 110+ Ghibli-style trees, plants, rocks (FBX/glTF/OBJ) | https://quaternius.itch.io/stylized-nature-megakit |
| Fantasy Props MegaKit | `fantasy-props/` | 517 files | Chests, books, potions, market stalls, furniture | https://quaternius.itch.io/fantasy-props-megakit |
| Animated Fish | `animated-fish/` | 29 files | 7 species with swimming animations | https://quaternius.itch.io/lowpoly-animated-fish |

### KayKit — `/assets/kaykit/`

| Pack | Folder | Count | Contents | URL |
|---|---|---|---|---|
| Forest Nature Pack | `forest/` | 641 files | Trees, rocks, bushes, grass, terrain (FBX/glTF/OBJ) | https://kaylousberg.itch.io/kaykit-forest |
| Adventurers | `adventurers/` | 250 files | 4 rigged+animated characters, 75 animations, 25+ weapons (FBX/glTF) | https://kaylousberg.itch.io/kaykit-adventurers |

### Additional Asset Sources (not downloaded, bookmark)

| Source | URL | Notes |
|---|---|---|
| Kenney All-in-1 Bundle | https://kenney.itch.io/kenney-game-assets | 60,000+ assets, CC0, free |
| Poly.pizza | https://poly.pizza/ | Free low-poly model aggregator |
| Poly.pizza Island Models | https://poly.pizza/search/island | Island-themed search |
| Mixamo | https://www.mixamo.com/ | Free character animations, export FBX → convert to GLTF |
| OpenGameArt CC0 3D | https://opengameart.org/content/cc0-assets-3d-low-poly | Aggregated CC0 collection |
| Sketchfab Pirate Island | https://sketchfab.com/3d-models/stylized-pirate-island-pack-low-poly-3d-assets-77d8d91e3fb14ef289850bc59d8683d6 | Modular pirate island assets |

---

## Reference Repos (Cloned)

All stored in `/references/` directory.

### 1. ecctrl — Character Controller
- **Path:** `references/ecctrl/`
- **Repo:** https://github.com/pmndrs/ecctrl
- **License:** MIT
- **Summary:** `references/controllers-summary.md`
- **What it gives us:** Drop-in 3rd person floating capsule controller. 50+ props for camera, movement, animations, slopes, platforms. Built-in joystick + gamepad support.
- **Key file:** `src/Ecctrl.tsx` (~1700 lines)
- **Integration:**
  ```jsx
  <Physics><KeyboardControls map={keyboardMap}>
    <Ecctrl animated><EcctrlAnimation characterURL={url} animationSet={animSet}>
      <CharacterModel />
    </EcctrlAnimation></Ecctrl>
  </KeyboardControls></Physics>
  ```
- **Modes:** Default (3rd person), `"FixedCamera"` (Coastal World style), `"CameraBasedMovement"` (1st person), `"PointToMove"` (click-to-walk)

### 2. react-three-npc — NPC Pathfinding
- **Path:** `references/react-three-npc/`
- **Repo:** https://github.com/ssethsara/react-three-npc
- **License:** MIT
- **Summary:** `references/controllers-summary.md`
- **What it gives us:** Navmesh-based NPC patrol + player-following via yuka.js. BallCollider sensors for player detection. Waypoint cycling.
- **Requires:** Pre-generated navmesh (.glb) from https://navmesh.isaacmason.com/
- **Integration:** `<Manager><NavMeshAgent name="Enemy" agentId="npc1" navPoints={[...]}><NPCModel /></NavMeshAgent></Manager>`

### 3. fintech-world — Financial Education Game
- **Path:** `references/fintech-world/`
- **Repo:** https://github.com/michaelkolesidis/fintech-world
- **License:** AGPL-3.0 (copyleft — derivative must be open-sourced)
- **Summary:** `references/controllers-summary.md`
- **What it gives us:** Reference for NPC dialogue pattern (proximity → chat button → click-to-advance text array), phone UI overlay for payments, Zustand game state structure, GLSL sea water shader.
- **Key patterns:**
  - NPC proximity: `playerPosition.distanceTo(npcPosition) < 5` every frame
  - Dialogue: Array of strings, advance on click, auto-close after last line
  - Phone UI: React overlay simulating QR scan → payment flow
- **Financial topics:** Digital wallets, QR payments, browser-based payments, cashless transactions

### 4. wawa-coastal-aesthetics — Coastal Visual Style
- **Path:** `references/wawa-coastal-aesthetics/`
- **Repo:** https://github.com/wass08/wawa-coastal-aesthetics
- **Summary:** `references/wawa-summary.md`
- **What it gives us:** Fog setup (`near=20, far=50`), `Environment preset="sunset"`, directional light at 0.42 intensity, GLB loading with animations via `useGLTF` + `useAnimations`.
- **Key pattern:** Fog color matches background color for seamless depth fade

### 5. r3f-vite-starter — Clean Project Template
- **Path:** `references/r3f-vite-starter/`
- **Repo:** https://github.com/wass08/r3f-vite-starter
- **License:** CC0 (public domain)
- **Summary:** `references/wawa-summary.md`
- **What it gives us:** Latest deps (React 19, R3F 9, drei 10, Three.js 0.173, Vite 6). Clean starting point.

### 6. stylized-water — Cartoon Water Shader
- **Path:** `references/stylized-water/`
- **Repo:** https://github.com/thaslle/stylized-water
- **Demo:** https://stylized-water.vercel.app/
- **License:** MIT
- **Summary:** `references/effects-summary.md`
- **What it gives us:**
  - Custom GLSL water shader via `three-custom-shader-material` (extends MeshStandardMaterial)
  - Vertex: Simple sine-based whole-plane bobbing
  - Fragment: 2D simplex noise for foam speckles + wave contour lines + distance gradient
  - Terrain foam lines: White stripe synced to water level on land/rock geometry
  - Requires: `three-custom-shader-material`, `vite-plugin-glsl`
- **Key uniforms:** `uTime`, `uColorFar`, `uWaveSpeed`, `uWaveAmplitude`, `uTextureSize`

### 7. r3f-sims-online — Multiplayer Click-to-Move
- **Path:** `references/r3f-sims-online/`
- **Repo:** https://github.com/wass08/r3f-sims-online
- **Summary:** `references/effects-summary.md`
- **What it gives us:** Socket.IO + Jotai pattern for multiplayer, `SkeletonUtils.clone()` for multiple character instances, smooth movement interpolation (lerp toward target), animation crossfade (idle/run).

### 8. ecctrl-sample — Full Character Controller Demo
- **Path:** `references/ecctrl-sample/`
- **Repo:** https://github.com/icurtis1/character-controller-sample-project
- **Demo:** https://character-sample-project.netlify.app/
- **License:** MIT
- **Summary:** `references/effects-summary.md`
- **What it gives us:**
  - Custom character controller (NOT ecctrl npm — built from scratch)
  - **Mobile virtual joystick** with deadzone, smoothing, multi-touch
  - **Full post-processing pipeline:** Bloom, ChromaticAberration, Vignette, DoF, BrightnessContrast, HueSaturation, SMAA — all togglable via Leva
  - Animation state machine (IDLE/RUN/FALL) with crossfade
  - Toon shader for physics objects
  - Multi-ray ground detection (5 rays)
  - Zod schemas for character state validation

---

## Key Code Patterns

### Character Controller Setup (ecctrl)
```jsx
import Ecctrl, { EcctrlAnimation } from "ecctrl";

<Physics timeStep="vary">
  <KeyboardControls map={[
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
    { name: 'run', keys: ['ShiftLeft'] },
  ]}>
    <Ecctrl animated camInitDis={-5} mode="FixedCamera">
      <EcctrlAnimation characterURL="/models/character.glb" animationSet={{
        idle: "Idle", walk: "Walk", run: "Run",
        jump: "Jump_Start", jumpIdle: "Jump_Idle", jumpLand: "Jump_Land", fall: "Climbing",
      }}>
        <CharacterModel />
      </EcctrlAnimation>
    </Ecctrl>
  </KeyboardControls>
</Physics>
```

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

### Coastal Atmosphere
```jsx
<fog attach="fog" args={["#eeeeff", 20, 50]} />
<Environment preset="sunset" environmentIntensity={0.3} />
<Sky sunPosition={[100, 20, 100]} turbidity={0.5} rayleigh={0.5} />
<directionalLight castShadow position={[3, 1, 3]} intensity={0.42} shadow-normalBias={0.06} />
```

### GLB Model Loading
```jsx
import { useGLTF, useAnimations } from "@react-three/drei";
const { scene, animations } = useGLTF("/models/island.glb");
const { actions } = useAnimations(animations, scene);
useEffect(() => { actions["Idle"]?.play(); }, []);
// Preload: useGLTF.preload("/models/island.glb");
```

### Terrain with Trimesh Collider
```jsx
<RigidBody type="fixed" colliders="trimesh" restitution={0.2} friction={1}>
  <IslandModel />
</RigidBody>
```

---

## Articles & Tutorials

| Resource | URL | Key Takeaway |
|---|---|---|
| Merci-Michel Coastal World Case Study | https://mercimichel.medium.com/coastal-world-8f23b945823b | Full technical architecture: heightmap terrain, splat maps, physics in web worker, octree collisions, chunk-based loading, dynamic quality |
| Wawa Sensei Coastal Aesthetics Tutorial | https://wawasensei.dev/tuto/coastal-world-aesthetics-react-three-fiber | How to recreate Coastal World look in R3F: fog, environment preset, gradient texturing |
| Wawa Sensei Third Person Controller | https://wawasensei.dev/tuto/third-person-controller-react-three-fiber-tutorial | Character movement in R3F |
| Codrops Stylized Water Tutorial | https://tympanus.net/codrops/2025/03/04/creating-stylized-water-effects-with-react-three-fiber/ | Custom water shader with foam, wave lines, transparency |
| Three.js Journey — Physics with R3F | https://threejs-journey.com/lessons/physics-with-r3f | Rapier physics integration patterns |
| American Banker — Coastal World | https://www.americanbanker.com/news/coastal-community-bank-launches-virtual-world | Business context: banking gamification |
| Navmesh Editor | https://navmesh.isaacmason.com/ | Online navmesh generation tool |

---

## Tools

| Tool | URL | Purpose |
|---|---|---|
| **gltfjsx** | https://gltf.pmnd.rs/ | Convert GLB → React Three Fiber JSX component |
| **PolyPack** | https://polypack.mint.gg/ | Compress GLB files by up to 97% (DRACO) |
| **Navmesh Editor** | https://navmesh.isaacmason.com/ | Generate navigation meshes for NPC pathfinding |
| **Leva** | https://github.com/pmndrs/leva | Debug UI for tweaking values in real-time |
| **R3F-Perf** | https://github.com/utsuboco/r3f-perf | Performance monitor for R3F scenes |
| **Mixamo** | https://www.mixamo.com/ | Free character rigging + animations |

---

## External APIs

| Service | Purpose | Free Tier | URL |
|---|---|---|---|
| **Groq** | LLM inference (Llama 3 70B) + Orpheus TTS | Generous free tier | https://console.groq.com/ |
| **OpenAI** | Embeddings (text-embedding-3-small) + GPT-4o-mini fallback | $5 credit | https://platform.openai.com/ |
| **Supabase** | Postgres + pgvector + Auth + Realtime | 500MB DB, 1GB storage | https://supabase.com/ |
| **Vercel** | Frontend deployment | Hobby plan (free) | https://vercel.com/ |
| **Railway** | Backend deployment | $5 credit | https://railway.app/ |
| **Web Speech API** | Browser-native STT | Free (built-in) | MDN docs |

---

## Detailed Summaries

For deep technical details on each reference repo, see:
- `references/wawa-summary.md` — Coastal aesthetics + R3F starter
- `references/controllers-summary.md` — ecctrl API, NPC pathfinding, fintech-world game loop
- `references/effects-summary.md` — Water shader GLSL, multiplayer patterns, post-processing pipeline
- `references/coastal-world-analysis.md` — Coastal World deep dive (459 lines): architecture, terrain splatting, water system, NPC AI, asset pipeline, performance optimization, game design patterns
