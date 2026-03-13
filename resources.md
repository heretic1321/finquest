# FinQuest — Hackathon Resources Master Document

Everything needed to build the 3D island financial education game in 24 hours.

> **See also:**
> - [`HACKATHON_SCOPE.md`](./HACKATHON_SCOPE.md) — Realistic 24hr scope, P0 task breakdown, demo script, cut list
> - [`USER_STORY.md`](./USER_STORY.md) — Full game vision, virtual money system, zone designs, quest list, pitch doc for judges

---

## Table of Contents

- [Hackathon Scope Summary](#hackathon-scope-summary)
- [Tech Stack](#tech-stack)
- [Asset Packs (Downloaded)](#asset-packs-downloaded)
- [Reference Repos (Cloned)](#reference-repos-cloned)
- [Key Code Patterns](#key-code-patterns)
- [Articles & Tutorials](#articles--tutorials)
- [Tools](#tools)
- [Deploy](#deploy)

---

## Hackathon Scope Summary

From [`HACKATHON_SCOPE.md`](./HACKATHON_SCOPE.md):

### What We BUILD (P0 — Must Ship)

| # | Task | Hours | What |
|---|------|-------|------|
| 1 | 3D World Foundation | 3-4 | Island terrain, ocean, sky, player WASD, camera follow, NPCs with proximity |
| 2 | UI Layer + Dialogue + Zustand Store | 3-4 | Bank HUD (₹ balance, health, month), dialogue box with choices, overlay system |
| 3 | TechCorp Zone: First Salary | 2-3 | CTC vs in-hand quiz, offer letter breakdown, ₹45K credited, auto-deductions |
| 4 | Budget Allocation Mini-Game | 3-4 | PS5/Goa/SIP/Insurance cards, overspend = credit card debt, 50/30/20 rule |
| 5 | Scam Park: UPI Encounter | 2-3 | Fake UPI collect request, ₹5K vanishes or saved, KYC scam, too-good offer |
| 6 | SIP Calculator | 2 | 3 sliders, live compounding, "5 years late" comparison, start SIP button |
| 7 | End-Game Report | 1.5 | Net worth, breakdown, 20-year projection, verdict |

### The "Oh Shit" Moment
UPI scam simulation where real virtual money vanishes from your bank HUD. Every Indian judge has either been scammed or knows someone who has.

### What We SKIP
- No backend / no server
- No AI / LLM / RAG NPCs (talk about it in pitch, don't build it)
- No database (all state in Zustand, client-side)
- No multiplayer / leaderboard
- No mobile responsive
- No sound/music
- No loading screen polish

### Critical Path (2 devs)
```
Dev A (3D + Quests):  [Task 1: 4hrs][Task 3: 2.5hrs][Task 4: 3.5hrs][Task 5: 2.5hrs]
Dev B (UI + Tools):   [Task 2: 4hrs][Task 6: 2hrs  ][Task 7: 1.5hrs][Polish: 2hrs  ]
                      ├─────────────┼──────────────┼──────────────┼──────────────┤
                      0             4              8              12            16 hrs
```

---

## Tech Stack

**This is a pure client-side game. No backend. No database. No external APIs needed for the MVP.**

| Layer | Package | Why |
|---|---|---|
| Build | **Vite 6** | Sub-1s cold start, R3F team uses it. Next.js SSR breaks Three.js |
| Framework | **React 19 + React Three Fiber 9** | 90x adoption over alternatives, richest ecosystem |
| Helpers | **@react-three/drei 10** | Sky, Environment, Float, Text, useGLTF, useAnimations, KeyboardControls, Html |
| Physics | **@react-three/rapier 2** | WASM+SIMD, sensors for NPC triggers, trimesh for terrain collision |
| Character Controller | **ecctrl** (pmndrs) | Drop-in 3rd person: camera, animations, input in ~10 lines of JSX |
| State | **Zustand** | Game state: balance, health, month, transactions, quests, dialogue |
| Pkg Manager | **pnpm** | 2x faster than npm, reliable with R3F ecosystem |

### Optional (if time permits)
| Layer | Package | Why |
|---|---|---|
| Water Shader | **three-custom-shader-material** + **vite-plugin-glsl** | Stylized water with foam (see stylized-water reference) |
| Post-Processing | **@react-three/postprocessing** | Bloom, vignette for polish |
| Debug | **leva** | Tweak values in real-time during dev |

### Install Command
```bash
pnpm create vite finquest --template react
cd finquest
pnpm add three @react-three/fiber @react-three/drei @react-three/rapier ecctrl zustand
pnpm dev
```

---

## Asset Packs (Downloaded)

All stored in `../assets/` directory (outside repo). All CC0 licensed (public domain).

### Kenney — `../assets/kenney/`

| Pack | Folder | Count | Contents | URL |
|---|---|---|---|---|
| Nature Kit | `nature-kit/` | 3,618 files | Trees, rocks, bushes, grass, plants (GLB/FBX/OBJ) | https://kenney.nl/assets/nature-kit |
| Pirate Kit | `pirate-kit/` | 370 files | Ships, palm trees, treasure, island pieces, fortress | https://kenney.nl/assets/pirate-kit |
| Fantasy Town Kit | `fantasy-town-kit/` | 847 files | Modular buildings, walls, roofs, props | https://kenney.nl/assets/fantasy-town-kit |
| Watercraft Kit | `watercraft-kit/` | 239 files | Boats, ships, sails, flags | https://kenney.nl/assets/watercraft-kit |
| UI Pack | `ui-pack/` | 1,315 files | Buttons, sliders, panels, icons (PNG + spritesheet) | https://kenney.nl/assets/ui-pack |
| UI Pack RPG | `ui-pack-rpg-expansion/` | 94 files | Inventory slots, stat bars, portraits | https://kenney.nl/assets/ui-pack-rpg-expansion |

### Quaternius — `../assets/quaternius/`

| Pack | Folder | Count | Contents | URL |
|---|---|---|---|---|
| Stylized Nature MegaKit | `stylized-nature/` | 454 files | 110+ Ghibli-style trees, plants, rocks (FBX/glTF/OBJ) | https://quaternius.itch.io/stylized-nature-megakit |
| Fantasy Props MegaKit | `fantasy-props/` | 517 files | Chests, books, potions, market stalls, furniture | https://quaternius.itch.io/fantasy-props-megakit |
| Animated Fish | `animated-fish/` | 29 files | 7 species with swimming animations | https://quaternius.itch.io/lowpoly-animated-fish |

### KayKit — `../assets/kaykit/`

| Pack | Folder | Count | Contents | URL |
|---|---|---|---|---|
| Forest Nature Pack | `forest/` | 641 files | Trees, rocks, bushes, grass, terrain (FBX/glTF/OBJ) | https://kaylousberg.itch.io/kaykit-forest |
| Adventurers | `adventurers/` | 250 files | 4 rigged+animated characters, 75 animations, 25+ weapons (FBX/glTF) | https://kaylousberg.itch.io/kaykit-adventurers |

### Additional Asset Sources (bookmark)

| Source | URL | Notes |
|---|---|---|
| Kenney All-in-1 Bundle | https://kenney.itch.io/kenney-game-assets | 60,000+ assets, CC0, free |
| Poly.pizza | https://poly.pizza/ | Free low-poly model aggregator |
| Poly.pizza Island Models | https://poly.pizza/search/island | Island-themed search |
| Mixamo | https://www.mixamo.com/ | Free character animations, export FBX → convert to GLTF |
| OpenGameArt CC0 3D | https://opengameart.org/content/cc0-assets-3d-low-poly | Aggregated CC0 collection |

---

## Reference Repos (Cloned)

All stored in `../references/` directory (outside repo).

### 1. ecctrl — Character Controller
- **Path:** `../references/ecctrl/`
- **Repo:** https://github.com/pmndrs/ecctrl
- **License:** MIT
- **Summary:** `../references/controllers-summary.md`
- **What it gives us:** Drop-in 3rd person floating capsule controller. 50+ props for camera, movement, animations, slopes, platforms. Built-in joystick + gamepad.
- **Key file:** `src/Ecctrl.tsx` (~1700 lines)
- **Modes:** Default (3rd person), `"FixedCamera"` (Coastal World style auto-rotate behind player)

### 2. fintech-world — Financial Education Game Reference
- **Path:** `../references/fintech-world/`
- **Repo:** https://github.com/michaelkolesidis/fintech-world
- **License:** AGPL-3.0 (copyleft)
- **Summary:** `../references/controllers-summary.md`
- **Relevant patterns:**
  - NPC proximity: `playerPosition.distanceTo(npcPosition) < 5` every frame
  - Dialogue: Array of strings, click to advance, auto-close after last line
  - Phone UI overlay: React overlay simulating payment flow
  - Zustand game store structure
  - GLSL sea water shader

### 3. wawa-coastal-aesthetics — Coastal Visual Style
- **Path:** `../references/wawa-coastal-aesthetics/`
- **Repo:** https://github.com/wass08/wawa-coastal-aesthetics
- **Summary:** `../references/wawa-summary.md`
- **Relevant patterns:** Fog (`near=20, far=50` matching background), `Environment preset="sunset"`, directional light at 0.42, GLB loading + animations

### 4. r3f-vite-starter — Clean Template
- **Path:** `../references/r3f-vite-starter/`
- **Repo:** https://github.com/wass08/r3f-vite-starter
- **License:** CC0 (public domain)
- **Latest deps:** React 19, R3F 9, drei 10, Three.js 0.173, Vite 6

### 5. stylized-water — Cartoon Water Shader
- **Path:** `../references/stylized-water/`
- **Repo:** https://github.com/thaslle/stylized-water
- **Demo:** https://stylized-water.vercel.app/
- **License:** MIT
- **Summary:** `../references/effects-summary.md`
- **Key tech:** `three-custom-shader-material` extends MeshStandardMaterial, 2D simplex noise for foam + wave lines, terrain foam stripe synced to water level

### 6. ecctrl-sample — Character Controller + Post-Processing Demo
- **Path:** `../references/ecctrl-sample/`
- **Repo:** https://github.com/icurtis1/character-controller-sample-project
- **Demo:** https://character-sample-project.netlify.app/
- **License:** MIT
- **Summary:** `../references/effects-summary.md`
- **Relevant patterns:** Mobile virtual joystick, post-processing pipeline (Bloom, Vignette, DoF, SMAA), animation state machine (IDLE/RUN/FALL), toon shader

### 7. react-three-npc — NPC Pathfinding (roadmap, not P0)
- **Path:** `../references/react-three-npc/`
- **Repo:** https://github.com/ssethsara/react-three-npc
- **Notes:** Navmesh-based NPC patrol via yuka.js. Not needed for P0 (our NPCs are stationary), but useful if adding walking NPCs later.

### 8. r3f-sims-online — Multiplayer Reference (roadmap, not P0)
- **Path:** `../references/r3f-sims-online/`
- **Repo:** https://github.com/wass08/r3f-sims-online
- **Notes:** Socket.IO multiplayer pattern, `SkeletonUtils.clone()` for multiple characters. Not needed for P0.

### 9. everlite-store — Our Own Three.js Game (HIGH PRIORITY REFERENCE)
- **Path:** `../references/everlite-store/`
- **Repo:** https://github.com/IndieVerseStudio/everlite-store
- **Summary:** `../references/everlite-summary.md`
- **Our own project.** Monorepo (client + server), R3F + Vite + Tailwind + Zustand.
- **Key reusable systems:**
  - **NPC Chat System** (`client/src/components/tutorial/NPCChatSystem.tsx`) — Full branching dialogue tree with question nodes, key-press triggers, checkpoint integration. Directly applicable for financial NPCs.
  - **HUD / UI Overlay** (`client/src/components/HUD/`) — All UI is HTML outside Canvas, controlled by Zustand booleans. Loading screen, start screen, mobile joystick, modals.
  - **Camera System** (`client/src/hooks/useCameraControls.ts`, `CameraFollowCharacter.tsx`, `useSpringArm.ts`) — Third-person OrbitControls following player with spring arm wall avoidance.
  - **Input Handling** (`client/src/hooks/useCharacterControls.ts`) — WASD + nipplejs mobile joystick with sprint/jump.
  - **Post-Processing** (`client/src/components/Effects.tsx`) — SMAA + SelectiveBloom + DepthOfField pipeline.
  - **Sound Manager** (`client/src/components/Sounds.tsx`) — Howler.js + Zustand, tab focus handling, mute toggle.
  - **Portal Shader** (`client/src/components/Portal/PortalShader.tsx`) — Animated Perlin noise shader, could be repurposed for zone entry effects.
  - **Instanced Grass** (`client/src/components/Grass/GrassMaterial.tsx`) — Custom grass shader for island vegetation.
  - **Zustand Store Pattern** — 15+ standalone stores with `useShallow` optimization, `getState()` for access outside React.
- **Key difference:** Uses BVH collision (no physics engine), not Rapier. Character controller and trigger systems will need adaptation.

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

### Zustand Game Store (from HACKATHON_SCOPE.md)
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

### Terrain with Trimesh Collider
```jsx
<RigidBody type="fixed" colliders="trimesh" restitution={0.2} friction={1}>
  <IslandModel />
</RigidBody>
```

### GLB Model Loading
```jsx
import { useGLTF, useAnimations } from "@react-three/drei";
const { scene, animations } = useGLTF("/models/island.glb");
const { actions } = useAnimations(animations, scene);
useEffect(() => { actions["Idle"]?.play(); }, []);
useGLTF.preload("/models/island.glb");
```

---

## Articles & Tutorials

| Resource | URL | Key Takeaway |
|---|---|---|
| Merci-Michel Coastal World Case Study | https://mercimichel.medium.com/coastal-world-8f23b945823b | Architecture: heightmap terrain, splat maps, physics in web worker, chunk loading, dynamic quality |
| Wawa Sensei Coastal Aesthetics Tutorial | https://wawasensei.dev/tuto/coastal-world-aesthetics-react-three-fiber | How to recreate Coastal World look in R3F: fog, environment, gradient texturing |
| Wawa Sensei Third Person Controller | https://wawasensei.dev/tuto/third-person-controller-react-three-fiber-tutorial | Character movement in R3F |
| Codrops Stylized Water Tutorial | https://tympanus.net/codrops/2025/03/04/creating-stylized-water-effects-with-react-three-fiber/ | Custom water shader: foam, wave lines, transparency |
| Three.js Journey — Physics with R3F | https://threejs-journey.com/lessons/physics-with-r3f | Rapier physics integration |

---

## Tools

| Tool | URL | Purpose |
|---|---|---|
| **gltfjsx** | https://gltf.pmnd.rs/ | Convert GLB → React Three Fiber JSX component |
| **PolyPack** | https://polypack.mint.gg/ | Compress GLB files by up to 97% (DRACO) |
| **Leva** | https://github.com/pmndrs/leva | Debug UI for tweaking values in real-time |
| **Mixamo** | https://www.mixamo.com/ | Free character rigging + animations |

---

## Deploy

For the hackathon demo, **localhost is fine**. If deploying:

| Platform | URL | Notes |
|---|---|---|
| **Vercel** | https://vercel.com/ | One `git push`, free hobby plan. Best for static Vite apps |
| **Netlify** | https://netlify.com/ | Alternative to Vercel, also free |

**Do NOT rely on WiFi at the venue.** Have a local build ready: `pnpm build && pnpm preview`

---

## Detailed Summaries

For deep technical details on each reference repo, see:
- `../references/wawa-summary.md` — Coastal aesthetics + R3F starter
- `../references/controllers-summary.md` — ecctrl API (50+ props), NPC pathfinding, fintech-world game loop
- `../references/effects-summary.md` — Water shader GLSL, post-processing pipeline, mobile controls
- `../references/coastal-world-analysis.md` — Coastal World deep dive (459 lines): architecture, terrain splatting, water system, NPC AI, asset pipeline, game design
- `../references/everlite-summary.md` — Everlite Store (our own project): NPC chat system, HUD, camera, input, post-processing, shaders, Zustand patterns

---

## Roadmap Features (Post-Hackathon / Pitch Only)

These are documented in [`USER_STORY.md`](./USER_STORY.md) for judges but **not built in the 24hr demo**:

| Feature | Section in USER_STORY.md |
|---|---|
| Hospital zone + insurance simulation | Zone Details |
| Tax Haveli: Section 80C, ITR filing | Zone Details |
| Dalal Street: Stock market trading | Zone Details |
| Credit Chowk: CIBIL + EMI trap | Zone Details |
| AI-powered NPC conversations (LLM + RAG) | Technical Notes |
| 12-month time simulation with random events | Virtual Money System |
| Latte factor tracker | Progression & Reward |
| Island Mall + avatar cosmetics | Progression & Reward |
| Personalization based on age/income/goals | Onboarding & Personalization |
