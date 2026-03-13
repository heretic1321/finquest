# Everlite-Store to FinQuest: Comprehensive Adaptation Plan

> **Purpose:** Actionable blueprint for transforming the everlite-store 3D jewelry shopping experience into FinQuest, a financial literacy game for Indian college students. Another agent should be able to pick this up and start coding immediately.

---

## Table of Contents

1. [Current State Summary](#1-current-state-summary)
2. [What to STRIP](#2-what-to-strip-from-everlite-store)
3. [What to KEEP](#3-what-to-keep-from-everlite-store)
4. [What to BUILD for FinQuest](#4-what-to-build-for-finquest)
5. [Implementation Priority](#5-implementation-priority)
6. [Assets Plan](#6-assets-plan)
7. [File-by-File Modification Guide](#7-file-by-file-modification-guide)
8. [Store Architecture](#8-store-architecture)
9. [Risk Mitigations](#9-risk-mitigations)

---

## 1. Current State Summary

### What we have right now

The entire everlite-store client has been copied into `/Users/heretic/Documents/finquest/src/`. It is a TypeScript React Three Fiber application with:

- **Package versions (current, from everlite):** React 18, Three.js 0.151, R3F 8, drei 9, three-mesh-bvh 0.6.8, zustand 4
- **Path aliases:** `@client/` maps to `./src/`, `@server/` maps to `./server/src/` (server does NOT exist in this repo)
- **Build:** Vite 4 + TypeScript
- **Entry:** `src/root.tsx` -> `src/main.tsx` (the `Main` component) -> lazy-loaded `src/Experience.tsx`

### Key architectural pattern

Everlite-store uses Zustand stores as singletons (not React context providers despite the filenames). Each "ContextProvider" component is actually a side-effect component that initializes a Zustand store, runs listeners, and returns `null`. The stores are accessed directly via `StoreName(selector)` or `StoreName.getState()`.

### Target state (from USER_STORY.md MVP table)

| Feature | Status Target |
|---------|---------------|
| 3D island world + player movement | MVP |
| Virtual Bank Account HUD | MVP |
| TechCorp: CTC vs In-Hand salary | MVP |
| Budget Allocation mini-game | MVP |
| Scam Park: UPI collect request | MVP |
| SIP Calculator with compounding | MVP |
| End-Game Report Card | MVP |

---

## 2. What to STRIP from Everlite-Store

### 2.1 Entire Files to DELETE

These files/directories serve no purpose in FinQuest and should be removed entirely:

#### Components
| Path | Reason |
|------|--------|
| `src/components/Jewellery/` | Jewelry display system |
| `src/components/JewelleryShowcaseTriggerArea.tsx` | Store trigger areas |
| `src/components/InventoryConsole/` | Inventory/collection UI |
| `src/components/DigiGold/` | DigiGold machine integration |
| `src/components/MeteorMining/` | Meteor mining mini-game |
| `src/components/VR/` | VR mode (HandHUD, VRItemShowcase, VRTeleport) |
| `src/components/DanceFloor.tsx` | Dance floor interaction |
| `src/components/DancingCharacter.tsx` | NPC dancing characters |
| `src/components/HorizontalScreening.tsx` | Horizontal display panels |
| `src/components/HoveringDisplays.tsx` | Hovering product displays |
| `src/components/LOD/` | Store building LOD system |
| `src/components/MakeshiftVideoScreen.tsx` | Video screen display |
| `src/components/OGStoreScreens.tsx` | OG store screens |
| `src/components/Portal/` | Portal shaders (could repurpose later) |
| `src/components/ReadyPlayerMe.tsx` | RPM avatar customization |
| `src/components/ScreeningAreaPanels.tsx` | Screening area UI |
| `src/components/StageLightsWithAnim.tsx` | Stage lights |
| `src/components/StoreEntryExitTriggerArea.tsx` | **KEEP** (used by TutorialNPC, rename) |
| `src/components/VideoPlayer/` | Video player component |
| `src/components/GradientBorder.tsx` | UI decoration |
| `src/components/Counter.tsx` | Dev counter |
| `src/components/water/` | Alternative water shader (keep `Water.tsx`) |
| `src/components/Grass/` | Instanced grass (cosmetic, cut for MVP) |

#### HUD Components
| Path | Reason |
|------|--------|
| `src/components/HUD/Cart/` | Shopping cart UI |
| `src/components/HUD/Showcase/` | Product showcase UI |
| `src/components/HUD/LoginScreen/` | Auth login screen |
| `src/components/HUD/Gamize/` | Gamize integration |
| `src/components/HUD/TreasureHunt/` | Treasure hunt UI |
| `src/components/HUD/AvatarSelectionMenu/` | RPM avatar selection |
| `src/components/HUD/Chatbox.tsx` | Multiplayer chatbox |
| `src/components/HUD/EnterVRButton.tsx` | VR entry button |
| `src/components/HUD/MeteorInventoryOnScreen.tsx` | Meteor inventory |
| `src/components/HUD/MeteorLoginRegister.tsx` | Meteor auth |
| `src/components/HUD/MeteorRushIntroUI.tsx` | Meteor intro |
| `src/components/HUD/LeaderboardMachineScreenUI.tsx` | Leaderboard |
| `src/components/HUD/RedeemMachineScreenUI.tsx` | Redeem machine |
| `src/components/HUD/PresentationMode.tsx` | Presentation mode |
| `src/components/HUD/BuildingManagerLoadingScreen.tsx` | Loading screen |

#### Contexts/Stores
| Path | Reason |
|------|--------|
| `src/contexts/AuthContext.tsx` | Server auth (hardcode user) |
| `src/contexts/CartContext.tsx` | Shopping cart state |
| `src/contexts/CollectionContext.tsx` | Jewelry collection loader |
| `src/contexts/DataContext.tsx` | API data fetching |
| `src/contexts/GamizeContext.tsx` | Gamize gamification platform |
| `src/contexts/InventoryConsoleHUDContext.tsx` | Inventory console state |
| `src/contexts/DigiGoldHUDContext.tsx` | DigiGold state |
| `src/contexts/MaterialContext.tsx` | Jewelry material system |
| `src/contexts/NetworkingContext.tsx` | Colyseus multiplayer |
| `src/contexts/PerformanceContext.tsx` | Adaptive DPR (optional keep) |
| `src/contexts/TreasureHuntContext.tsx` | Treasure hunt state |
| `src/contexts/VRStateContext.tsx` | VR mode state |

#### Hooks
| Path | Reason |
|------|--------|
| `src/hooks/useAuthAPIs.ts` | Server auth calls |
| `src/hooks/useCartAPIs.ts` | Cart API calls |
| `src/hooks/useCamwearaTryOn.ts` | AR try-on |
| `src/hooks/useCachingInventoryConsoleItems.ts` | Inventory caching |
| `src/hooks/useMaterials.tsx` | Jewelry material system |
| `src/hooks/useNetworking.ts` | Colyseus networking |
| `src/hooks/usePMREM.ts` | PMREM env map (jewelry-specific) |
| `src/hooks/materials/` | Material hooks directory |

#### Utils
| Path | Reason |
|------|--------|
| `src/utils/api.ts` | Server API helpers |
| `src/utils/apiDataItemBySku.ts` | SKU data helpers |
| `src/utils/axios.ts` | Axios instance |
| `src/utils/dummyData.ts` | 2.6MB of dummy jewelry data |
| `src/utils/meteorAPI.ts` | Meteor API calls |
| `src/utils/JewelleryManagement/` | Jewelry management utils |
| `src/utils/checkpoint.tsx` | Checkpoint system (Senco-specific) |

#### Config
| Path | Reason |
|------|--------|
| `src/config/GrassConfig.ts` | Grass shader config |
| `src/config/InventoryConsoleConfig.ts` | Inventory console config |
| `src/config/JewelleryGroups.ts` | Jewelry group definitions |
| `src/config/TreasureHunt.ts` | Treasure hunt config |
| `src/config/meteorPaths.ts` | Meteor path definitions |
| `src/config/ARView.ts` | AR view config |

#### Scene-level components to DELETE
| Path | Reason |
|------|--------|
| `src/OtherPlayers.tsx` | Multiplayer other players |
| `src/SendPlayerTransformToServer.tsx` | Multiplayer sync |
| `src/DebugEntities.tsx` | Debug visualization |
| `src/Layouts/` | Layout components |
| `src/scripts/` | Dev scripts |

### 2.2 Code to Strip WITHIN Kept Files

#### `src/main.tsx` -- Strip these imports and usages:
- ALL `@react-three/xr` imports (`createXRStore`, `DefaultXRController`, `DefaultXRInputSourceTeleportPointer`, `useSessionModeSupported`, `XR`)
- `CustomHandController` component
- `store = createXRStore(...)` block
- `VR` mode checks: `isVRSessionSupported`, `vrStore`, `isVRMode`, `store.enterVR()`
- `<XR store={store}>` wrapper (keep children, remove XR wrapper)
- Provider components to remove: `AuthContextProvider`, `CollectionContextProvider`, `DataContextProvider`, `CartContextProvider`, `InventoryConsoleHUDContextProvider`, `DigiGoldHUDContextProvider`, `TreasureHuntContextProvider`, `NetworkingComponent`, `GamizeContextProvider`, `MaterialContextProvider`
- `CheckpointRenderer` and `useCheckpointStore`
- `PerformanceMeterDisplay`
- `HandHud`
- `<Leva>` (keep for dev, remove for prod)
- `<Toaster>` from react-hot-toast
- `LAYER_SELECTIVE_BLOOM` export (strip or keep as constant)

#### `src/Experience.tsx` -- Strip these:
- `VRItemShowcase` and all VR mode conditionals
- `HorizontalScreening`
- `ScreeningAreaPanels`
- `HoveringDisplays`
- `OtherPlayers`
- `DancingCharacters`
- `DanceFloor`
- `StageLightsWithAnim`
- `SendPlayerTransformToServer`
- `DebugEntities`
- `UnityControls`
- `BuildingManager`
- `MiningManager`
- `DigiGoldMachineManager`
- `UnderfloorRespawnTrigger` (replace with simpler respawn in Character)
- `vrStore` usage
- `unityLikeControlsEnabled` checks

#### `src/components/Character/index.tsx` -- Strip these:
- ALL `@react-three/xr` imports and VR code (`XROrigin`, `useXRInputSourceState`, `vrStore`, `VRTeleport`)
- ALL multiplayer code (`isOtherPlayer` prop and branching, `Player` from `@server/`, `NameTag`, `NetworkingStore`, `playerObject`, `selfPlayer`)
- `MeteorManagerStore` import and usage
- `AuthAPIStore` import and usage
- `InventoryConsoleHUDStore` import and usage
- `AnimationStates` from `@server/utils/types` -- inline as: `type AnimationStates = 'idle' | 'walk' | 'run' | 'jump'`
- ALL `leva` useControls debug panels
- Dance floor logic and dance animation state
- Showcase/presentation mode logic
- First-person camera mode (keep third-person only)
- `isVRMode` prop and all VR branching

#### `src/components/Avatar.tsx` -- Strip these:
- `NetworkingStore` import and `animationServerState` useEffect
- `isOtherPlayer` branching
- Dance animation index management

#### `src/components/avatars/Generic.tsx` -- Strip these:
- `NetworkingStore` (legless avatar handling)
- `CollectionContext.loader` (replace with `useGLTF`)
- `isOtherPlayer` parameter and branching

#### `src/hooks/useMap.ts` -- MAJOR REWRITE (1500 lines -> ~80 lines):
- Strip ALL: store-specific mesh handling, LOD building setup, portal placement, display panel configuration, garden/grass area detection, Water2 handling, MaterialStore references, jewelry display logic, screen panel setup, hovering display positions
- Keep ONLY: GLB load -> scene traversal -> `StaticGeometryGenerator` + `MeshBVH` collider generation -> store collider in MapStore

#### `src/hooks/useCharacterControls.ts` -- Strip these:
- `InventoryConsoleHUDStore` import and guards
- Cart/chatbox/treasure open conditions that block movement
- `SoundsStore` usage (optional, can keep walking sound)
- Reduce to: WASD + Space + Shift key handling, jumped function, joystick handler

#### `src/hooks/useCameraControls.ts` -- Strip these:
- `InventoryConsoleHUDStore` import and conditions
- Unity-like controls mode
- First-person mode (CameraMode.FIRST_PERSON)
- ALL leva debug controls
- Presentation/showcase mode orbit disable

#### `src/hooks/useSpringArm.ts` -- Strip:
- `isTutorialEnabled` check (or adapt to FinQuest NPC interaction)
- Otherwise port as-is

#### `src/components/Effects.tsx` -- Strip:
- `SelectiveBloom` (jewelry-specific sparkle effect)
- Replace with regular `Bloom`
- Keep: `SMAA`, `DepthOfField`, basic `Bloom`

#### `src/components/Environment.tsx` -- Strip:
- ALL leva controls
- Keep: fog setup and cubemap skybox loader

#### `src/components/Water.tsx` -- Adapt:
- `sRGBEncoding` -> `SRGBColorSpace` (Three.js 0.151 deprecation)

#### `src/components/Sounds.tsx` -- Strip:
- `mainScreenDetailedRef`, `mainScreenVideoRef`, `mainScreenAudioRef` (video screen audio)
- Keep: background music, walking sound, jump sound, click sound, mute toggle, tab focus handling

#### `src/components/HUD/index.tsx` -- MAJOR REWRITE:
- Strip ALL: Showcase, Cart, Login, Meteor, Gamize, TreasureHunt, Chatbox, VR, PresentationMode, LeaderboardMachineScreenUI, RedeemMachineScreenUI, BuildingManagerLoadingScreen
- Keep: StartButton, Loader, JumpButton, HowToPlay (adapt)
- Build new: BankHUD, DialogueBox, InteractionPrompt, ZoneInfo, ReportCard

### 2.3 NPM Packages to Remove

```
colyseus.js          # Multiplayer networking
axios                # Server API calls
crypto-js            # Encryption for auth
js-cookie            # Auth cookies
@react-three/xr     # VR/AR support
@react-three/uikit   # XR UI kit
@react-three/gltfjsx # Dev tool only
lamina               # Layer material (unused in FinQuest)
minidenticons        # Avatar identicons
r3f-perf             # Performance monitor (dev only)
react-hot-toast      # Toast notifications
react-icons          # Icon library (use inline SVG)
react-inlinesvg      # SVG loader
@types/crypto-js     # Types for removed package
@types/js-cookie     # Types for removed package
```

### 2.4 Senco/Everlite Branding to Remove

- All `Senco` references in strings, comments, variable names
- All `everlite` references in package.json name, comments
- All CDN URLs (`d1izo6k8ekr0p2.cloudfront.net`, `everlite-video-assets.s3.ap-south-1.amazonaws.com`)
- All Ready Player Me avatar URLs
- All jewelry collection names (Mariposa, Rajwada, Spectra, etc.)
- All store-related copy/labels

---

## 3. What to KEEP from Everlite-Store

### 3.1 Character Controller + BVH Physics (CRITICAL)

**Files:**
- `src/components/Character/index.tsx` (stripped to ~600 lines)
- `src/hooks/useCharacterControls.ts` (stripped to ~150 lines)

**What it provides:**
- Capsule collision via BVH shapecast (radius 0.5, segment [0,0,0] to [0,-1,0])
- Fixed timestep physics (1/160 desktop, 1/60 mobile, max 10 substeps)
- Gravity (-35 default), jump (velocity.y = 15), ground detection
- WASD movement relative to camera azimuthal angle
- Smooth rotation via `damp()` from maath
- Death/respawn below `deathHeight` (-5.1)
- Animation state transitions (idle/walk/run/jump)
- `isPlayerParalysedRef` for locking movement during NPC dialogue

**Critical constants to preserve:**
```
capsuleRadius: 0.5
capsuleSegment: new THREE.Line3(new THREE.Vector3(), new THREE.Vector3(0, -1, 0))
gravity: -35
maxSpeed: 140
jumpDistance: 15
deathHeight: -5.1
playerSpawnPosition: [TBD for FinQuest island]
fixedTimeStep: 1/160 (desktop), 1/60 (mobile)
maxSubSteps: 10
```

### 3.2 Camera System

**Files:**
- `src/hooks/useCameraControls.ts` (stripped)
- `src/hooks/useSpringArm.ts`
- `src/CameraFollowCharacter.tsx`
- `src/SpringArm.tsx`
- `src/utils/modifiedOrbitControls/index.js` + `index.d.ts`

**What it provides:**
- Third-person OrbitControls (vendored/modified) following character with +2 Y offset
- Spring arm prevents camera clipping through walls via raycasting against BVH collider
- Damped camera movement for smooth feel
- Scroll zoom with min/max distance
- Touch gesture support for mobile

### 3.3 Avatar + Animation System

**Files:**
- `src/components/Avatar.tsx` (stripped)
- `src/components/avatars/Generic.tsx` (stripped)
- `src/config/Avatar.ts`

**What it provides:**
- GLTF avatar loading with `SkeletonUtils.clone()`
- Separate animation GLB loading (Idle, Walk, Run, Jump)
- Cross-fade between animation states
- Root motion cancellation (Hips position reset each frame -- CRITICAL, line ~210 in Generic.tsx)

**Available avatar models in `public/`:**
- `models/characters/feb.glb` -- Default male avatar
- `models/characters/may.glb` -- Alternative avatar
- `models/characters/Female.glb` -- Female avatar (used for NPC "Sia")
- `models/characters/guide.gltf` -- Guide character

**Available animations in `public/`:**
- `models/animations/Standing_Idle.glb`
- `models/animations/Walk.glb`
- `models/animations/Run.glb`
- `models/animations/Jump.glb`
- `models/animations/Jump_2.glb`

### 3.4 Input System

**Files:**
- `src/hooks/useCharacterControls.ts` (stripped)
- `src/components/HUD/JumpButton.tsx`

**What it provides:**
- Keyboard: WASD movement, Space jump, Shift sprint
- nipplejs mobile joystick (angle + distance -> movement direction)
- Jump button for mobile
- Movement data ref shared with Character component

**Add for FinQuest:** 'E' key for NPC interaction, 'Tab' or 'B' for bank HUD toggle

### 3.5 NPC System

**Files:**
- `src/components/tutorial/TutorialNPC.tsx`
- `src/components/tutorial/NPCChatSystem.tsx`
- `src/components/StoreEntryExitTriggerArea.tsx` (used for proximity detection)
- `src/components/TriggerArea.tsx` (BVH-based trigger detection)

**What it provides:**
- NPC with GLTF model loading, Idle/Talk animation switching
- Proximity detection via `StoreEntryExitTriggerArea` (BVH shapecast)
- NPC faces player when in range
- NPCChatSystem with branching dialogue tree, question nodes, key-press triggers
- `isTutorialNPCActive` flag in genericStore for movement lock

**Adapt for FinQuest:** Each zone gets 1-3 NPCs using this pattern. Dialogue content changes per zone.

### 3.6 Water

**File:** `src/components/Water.tsx`

Self-contained. 220x220 PlaneGeometry with sine wave vertex animation, water.jpg texture tiling. Fix `sRGBEncoding` -> `SRGBColorSpace`.

### 3.7 Environment

**File:** `src/components/Environment.tsx`

Fog (near 100, far 262.5) + cubemap skybox from 6 PNGs in `public/skybox/` (px, nx, py, ny, pz, nz).

### 3.8 Post-Processing

**File:** `src/components/Effects.tsx`

EffectComposer with SMAA + DepthOfField + Bloom. Strip SelectiveBloom (jewelry sparkle). Conditionally enabled via `areEffectsEnabled` in genericStore.

### 3.9 Sound System

**File:** `src/components/Sounds.tsx`

Howler.js-based sound manager with Zustand store. Background ambient music, walking sound, jump sound, click sound. Tab focus detection to pause/resume audio. Mute toggle.

### 3.10 Tab Focus Optimization

**In:** `src/contexts/GlobalStateContext.tsx`

`isTabFocused` flag + visibility change listeners. Used to pause rendering and audio when tab is not active. Critical for performance.

### 3.11 Gesture/Device Detection

**File:** `src/contexts/GesturesAndDeviceContext.tsx` + `src/hooks/useGesturesAndDevice.ts`

Touch device detection, pinch/scroll/drag event tracking, screen size monitoring. Used for mobile joystick display and camera controls adaptation.

### 3.12 Map/World Loading Core

**File:** `src/hooks/useMap.ts` (stripped to ~80 lines)

The core pipeline: Load GLB -> traverse scene -> collect collidable meshes -> `StaticGeometryGenerator` merge -> `MeshBVH` compute -> store collider. This is the foundation for BVH-based character collision.

### 3.13 Common Utilities

**Files:**
- `src/utils/commonMaterials.ts` -- dummyMesh, zeroVector, shared THREE objects
- `src/utils/commonTypes.ts` -- Transform, TransformLite type definitions
- `src/utils/types.ts` -- strip server types, keep any shared types
- `src/utils/ModifiedHtmlTag.tsx` -- may be useful for HUD overlays
- `src/utils/DebugCube.tsx` -- keep for dev

---

## 4. What to BUILD for FinQuest

### 4.1 Game State Store (`src/stores/gameStore.ts`)

The central Zustand store for all FinQuest game logic. This is the "virtual money system" from USER_STORY.md.

```typescript
interface GameState {
  // Player identity
  playerName: string

  // Financial state
  balance: number              // Current savings account balance
  financialHealth: number      // 0-100 score
  netWorth: number             // Computed: balance + investments - debt
  debt: number                 // Credit card / personal loan debt

  // Time
  month: number                // 1-12 game months

  // Tracking
  transactions: Transaction[]  // Full history of credits/debits
  completedZones: string[]     // Zone IDs completed
  completedQuests: string[]    // Quest IDs completed

  // Investments
  investments: {
    sipMonthly: number         // Monthly SIP amount (0 if not started)
    sipPortfolio: number       // Current SIP portfolio value
    insurance: boolean         // Has health insurance
    emergencyFund: number      // Emergency fund balance
  }

  // Scam tracking
  scamsEncountered: number
  scamsAvoided: number
  moneyLostToScams: number

  // Budget tracking
  budgetAllocations: BudgetAllocation[]
  hasCompletedBudget: boolean

  // Active UI state
  activeDialogue: DialogueTree | null
  nearbyNPC: NPCData | null
  activeZone: string | null
  showBankHUD: boolean
  showReportCard: boolean

  // Actions
  addMoney: (amount: number, label: string) => void
  spendMoney: (amount: number, label: string) => void
  setDialogue: (dialogue: DialogueTree | null) => void
  advanceMonth: () => void
  completeZone: (zoneId: string) => void
  completeQuest: (questId: string) => void
  startSIP: (amount: number) => void
  buyInsurance: () => void
  addToEmergencyFund: (amount: number) => void
  updateHealth: (delta: number) => void
  setNearbyNPC: (npc: NPCData | null) => void
  processMonthlyAutoDebits: () => void
  computeNetWorth: () => number
}
```

### 4.2 Virtual Bank Account HUD

**File to create:** `src/components/finquest/BankHUD.tsx`

Persistent on-screen widget showing:
- Current balance with rupee formatting
- Month indicator (e.g., "Month 3/12")
- Financial health bar (color-coded: red < 30, yellow 30-60, green > 60)
- Expandable panel with: savings, emergency fund, SIP portfolio, insurance status, net worth, debt
- Transaction feed (last 5 transactions with +/- and labels)
- Animated balance changes (number tween on credit/debit)

**Implementation:** HTML overlay outside Canvas (not drei `<Html>`). Reads from `gameStore`. CSS transitions for balance animations.

### 4.3 TechCorp Zone: CTC vs In-Hand Salary Quest

**Files to create:**
- `src/components/finquest/zones/TechCorpZone.tsx` -- Zone NPC placement
- `src/data/dialogues/techcorp.ts` -- Dialogue tree data
- `src/components/finquest/ui/OfferLetterPanel.tsx` -- Offer letter UI overlay
- `src/components/finquest/ui/SalaryQuiz.tsx` -- Quiz component

**Quest flow:**
1. Player approaches TechCorp building area, NPC "Neha" (receptionist) triggers
2. Neha's dialogue introduces the offer letter
3. OfferLetterPanel opens showing CTC breakdown (8 LPA)
4. Quiz: "How much will you get in hand?" -- 4 options
5. NPC "Vikram" (HR) explains deductions regardless of answer
6. Quest complete: +45,000 credited to bank, then -26,500 auto-deducted for essentials
7. BankHUD animates: 0 -> 45,000 -> 18,500
8. `gameStore.completeQuest('techcorp-ctc')` called
9. Month advances to 2

**NPC models:** Use `Female.glb` for Neha, `feb.glb` for Vikram (or `guide.gltf`)

### 4.4 Budget Allocation Mini-Game

**Files to create:**
- `src/components/finquest/ui/BudgetGame.tsx` -- Full-screen overlay
- `src/data/budgetItems.ts` -- Budget item definitions

**Game flow:**
1. Triggered after TechCorp quest completes
2. Full-screen overlay with draggable/slider budget cards:
   - PS5 (50,000), Goa Trip (25,000), SIP (5,000/mo), Insurance (1,000/mo), Emergency Fund (variable), Parents (10,000), Sneakers (15,000), iPhone EMI (5,000/mo)
3. Live balance counter at top drains as player allocates
4. If total exceeds 18,500: "INSUFFICIENT FUNDS" warning, credit card debt at 36% offered
5. NPC "Rahul" peer pressure dialogue appears for expensive items
6. On confirm: allocations applied to gameStore, recurring items (SIP, insurance, EMI) saved for auto-debit
7. 50/30/20 rule explanation panel after allocation
8. Quest complete: +2,000 bonus, financial health adjustment based on choices
9. Month advances to 3

**Key mechanic:** The balance counter must update in real-time as sliders move. Overspending is ALLOWED but creates debt.

### 4.5 Scam Park: UPI Scam Encounter

**Files to create:**
- `src/components/finquest/zones/ScamParkZone.tsx` -- Zone with multiple NPCs
- `src/data/dialogues/scampark.ts` -- Scam dialogue trees
- `src/components/finquest/ui/UPINotification.tsx` -- Fake UPI notification overlay
- `src/components/finquest/ui/PhoneCallUI.tsx` -- Fake phone call overlay
- `src/components/finquest/ui/ScamReport.tsx` -- End-of-zone report card

**Encounters (implement at least 2 for MVP):**

1. **UPI Collect Request Scam:**
   - NPC "Friendly Uncle" claims accidental transfer
   - Fake UPI notification: "COLLECT REQUEST: Rs 5,000"
   - PAY button = lose 5,000; DECLINE = avoid + bonus 2,000
   - Critical teaching: collect request = THEY want YOUR money

2. **KYC Expiry Call:**
   - Phone rings, caller claims bank KYC expiring
   - 3 choices: share details (lose money), visit branch (neutral), hang up (smart)
   - Teaching: banks never ask for PIN over phone

3. **Crypto Ponzi (optional for MVP):**
   - Flashy NPC promises 10x returns in 30 days
   - Invest 10,000 = money gone; walk away = +XP

4. **QR Code Amount Mismatch (optional for MVP):**
   - Vendor says Rs 200, QR shows Rs 2,000
   - Pay without checking = lose 2,000; catch it = +XP

**End of zone:** Scam Survival Report showing scams encountered, avoided, money lost. Rating from "Scam-Proof Legend" to "Easy Target."

### 4.6 SIP Calculator with Compounding Visualization

**Files to create:**
- `src/components/finquest/ui/SIPCalculator.tsx` -- Interactive calculator overlay
- `src/utils/financial.ts` -- SIP math functions

**Features:**
- 3 sliders: Monthly investment (1,000-15,000), Expected return (8-15%), Time period (5-30 years)
- Live-updating growth chart (canvas or SVG line chart)
- Results panel: Total invested, Wealth gained, Total value, Growth multiplier
- "5 years late" comparison: show cost of delaying
- "Start SIP" button that actually sets `gameStore.investments.sipMonthly`
- SIP vs Lump Sum comparison tab

**Math:**
```
FV = P * [((1 + r)^n - 1) / r] * (1 + r)
Where: P = monthly investment, r = monthly rate (annual/12), n = months
```

### 4.7 End-Game Report Card

**Files to create:**
- `src/components/finquest/ui/ReportCard.tsx` -- Full-screen results overlay

**Triggered when:** All MVP zones completed, or player manually triggers from bank HUD.

**Shows:**
- Net worth breakdown: savings + SIP portfolio + emergency fund - debt
- Transaction history summary (top 5 credits, top 5 debits)
- Financial health score with grade (A/B/C/D/F)
- 20-year projection: "If you continued these habits..."
  - Player's path (actual choices projected)
  - "The Spender" path (no SIP, max lifestyle)
  - "The Maximizer" path (max SIP, minimal spending)
- Scam survival stats
- Budget adherence stats
- Key lessons unlocked
- "Your money could buy..." real-world comparison (2BHK down payment, car, vacations)

### 4.8 Zone-Based Progression System

**File to create:** `src/stores/progressionStore.ts`

```typescript
interface Zone {
  id: string
  name: string
  position: [number, number, number]  // World position for NPC/trigger
  prerequisiteQuests: string[]         // Quests that must be complete to enter
  quests: Quest[]
  isUnlocked: boolean
  isComplete: boolean
}

// MVP zones:
const ZONES = [
  { id: 'spawn', name: 'Island Center', prerequisiteQuests: [], ... },
  { id: 'techcorp', name: 'TechCorp Office', prerequisiteQuests: [], ... },
  { id: 'budget', name: 'Budget Canteen', prerequisiteQuests: ['techcorp-ctc'], ... },
  { id: 'scampark', name: 'Scam Park', prerequisiteQuests: ['budget-allocation'], ... },
  { id: 'mftower', name: 'Mutual Fund Tower', prerequisiteQuests: ['techcorp-ctc'], ... },
]
```

Zone unlocking: semi-linear. TechCorp is always first (it gives salary). Budget triggers after TechCorp. Scam Park and MF Tower unlock after budget. Report Card available after all are done.

### 4.9 NPC Dialogue System

**File to create:** `src/data/dialogueTypes.ts`

Adapt from `NPCChatSystem.tsx` branching dialogue pattern. Each dialogue node:

```typescript
interface DialogueNode {
  id: string
  speaker: string           // NPC name
  text: string              // Dialogue text
  choices?: DialogueChoice[]  // Player response options
  next?: string             // Auto-advance to next node ID
  onEnter?: () => void      // Side effect when node is shown
  onComplete?: () => void   // Side effect when dialogue ends
}

interface DialogueChoice {
  text: string
  nextNodeId: string
  effect?: () => void       // gameStore mutation
}
```

Each zone has its own dialogue file in `src/data/dialogues/`.

### 4.10 Game Clock (Simplified for MVP)

Not a real-time clock. Month advances when key quests complete:
- Month 1: Arrival, onboarding
- Month 2: TechCorp salary quest -> first salary credited
- Month 3: Budget allocation -> month advances after allocation
- Month 4-5: Scam Park, MF Tower (either order)
- Month 6+: Report card available

Auto-debits (SIP, insurance, EMI) process on each month advance via `gameStore.processMonthlyAutoDebits()`.

### 4.11 Interaction Prompt

**File to create:** `src/components/finquest/ui/InteractionPrompt.tsx`

When player is near an NPC (`nearbyNPC` is set in gameStore), show a floating prompt:
- Desktop: "Press E to interact"
- Mobile: Interaction button appears

### 4.12 Zone Markers / Signposts

Use existing prop models from `public/models/props/sign.glb` placed at each zone entrance. drei `<Html>` labels showing zone name. Glow effect on signs for unlocked but incomplete zones.

---

## 5. Implementation Priority

### Phase 0: Cleanup (2-3 hours)

**Goal:** Strip everlite code to a running skeleton.

| # | Task | File(s) | Description |
|---|------|---------|-------------|
| 0.1 | Update package.json | `package.json` | Rename to "finquest", remove unused deps, keep core deps |
| 0.2 | Strip main.tsx | `src/main.tsx` | Remove all providers/imports listed in Section 2.2. Keep Canvas + core providers only |
| 0.3 | Strip Experience.tsx | `src/Experience.tsx` | Remove all components listed in Section 2.2. Keep Character + Water + TutorialNPC + camera components |
| 0.4 | Delete unused files | Listed in Section 2.1 | Delete all directories/files marked for removal |
| 0.5 | Fix @server imports | `src/components/Character/index.tsx` | Inline `AnimationStates` type, remove `Player` import |
| 0.6 | Strip Character | `src/components/Character/index.tsx` | Remove VR/multiplayer/meteor/inventory/auth code |
| 0.7 | Strip useMap | `src/hooks/useMap.ts` | Reduce to core GLB load -> BVH collider pipeline |
| 0.8 | Strip contexts | `src/contexts/*.tsx` | Remove deleted store references from kept contexts |
| 0.9 | Verify builds | Terminal | `npm run dev` should start without errors |

### Phase 1: Foundation (2-3 hours)

**Goal:** Game world loads, player walks around, camera works.

| # | Task | File(s) | Description |
|---|------|---------|-------------|
| 1.1 | Create gameStore | `src/stores/gameStore.ts` | Central FinQuest state with all financial logic |
| 1.2 | Update staticResourcePaths | `src/config/staticResourcePaths.ts` | Point to FinQuest assets: `models/world.glb` for map, correct avatar paths, remove all jewelry/meteor/store paths |
| 1.3 | Update playerSpawnPosition | `src/components/Character/index.tsx` | Set spawn for FinQuest island center (needs testing in world.glb) |
| 1.4 | Verify BVH collision | Terminal | Player should walk on island terrain without falling through |
| 1.5 | Fix Water position | `src/components/Water.tsx` | Adjust position/scale to match FinQuest island |
| 1.6 | Rename package | `package.json` | Change name to "finquest", update scripts |

### Phase 2: Core UI (3-4 hours)

**Goal:** HUD + dialogue system working.

| # | Task | File(s) | Description |
|---|------|---------|-------------|
| 2.1 | Build BankHUD | `src/components/finquest/BankHUD.tsx` | Persistent on-screen balance + month + health |
| 2.2 | Build DialogueBox | `src/components/finquest/ui/DialogueBox.tsx` | Full-screen dialogue overlay with choices |
| 2.3 | Build InteractionPrompt | `src/components/finquest/ui/InteractionPrompt.tsx` | "Press E to interact" floating prompt |
| 2.4 | Rewrite HUD index | `src/components/HUD/index.tsx` | Strip all everlite HUD, wire BankHUD + DialogueBox |
| 2.5 | Add E key interaction | `src/hooks/useCharacterControls.ts` | 'E' key triggers NPC interaction via gameStore |
| 2.6 | Wire NPC to gameStore | `src/components/tutorial/TutorialNPC.tsx` | NPC proximity sets `nearbyNPC`, 'E' triggers dialogue |

### Phase 3: TechCorp Quest (2-3 hours)

**Goal:** First complete quest playable.

| # | Task | File(s) | Description |
|---|------|---------|-------------|
| 3.1 | Place TechCorp NPCs | `src/components/finquest/zones/TechCorpZone.tsx` | 2 NPCs near a building on the island |
| 3.2 | Write dialogue tree | `src/data/dialogues/techcorp.ts` | Neha intro + Vikram CTC explanation |
| 3.3 | Build OfferLetterPanel | `src/components/finquest/ui/OfferLetterPanel.tsx` | CTC breakdown display with quiz |
| 3.4 | Wire salary credit | `gameStore` actions | +45,000 credit, -26,500 auto-deduction, month advance |
| 3.5 | Test full flow | Manual testing | Walk to NPC -> E -> dialogue -> quiz -> salary credited |

### Phase 4: Budget Game (3-4 hours)

**Goal:** Budget allocation playable with real gameStore consequences.

| # | Task | File(s) | Description |
|---|------|---------|-------------|
| 4.1 | Build BudgetGame overlay | `src/components/finquest/ui/BudgetGame.tsx` | Cards with sliders, live balance counter |
| 4.2 | Budget item data | `src/data/budgetItems.ts` | PS5, Goa, SIP, Insurance, etc. with costs |
| 4.3 | Wire to gameStore | BudgetGame.tsx | Allocations apply to balance, start recurring items |
| 4.4 | Overspend -> debt logic | gameStore | Credit card debt at 36% if over budget |
| 4.5 | Post-budget 50/30/20 | BudgetGame.tsx | Explanation panel after allocation |

### Phase 5: Scam Park (2-3 hours)

**Goal:** UPI scam encounter playable.

| # | Task | File(s) | Description |
|---|------|---------|-------------|
| 5.1 | Place ScamPark NPCs | `src/components/finquest/zones/ScamParkZone.tsx` | 2-3 NPCs in park area |
| 5.2 | Build UPI notification | `src/components/finquest/ui/UPINotification.tsx` | Fake UPI collect request overlay |
| 5.3 | Write scam dialogues | `src/data/dialogues/scampark.ts` | At least 2 scam encounters |
| 5.4 | Build ScamReport | `src/components/finquest/ui/ScamReport.tsx` | End-of-zone score card |
| 5.5 | Wire money loss | gameStore | Scam falls = real money lost from balance |

### Phase 6: SIP Calculator (2 hours)

**Goal:** Interactive SIP calculator with compounding visualization.

| # | Task | File(s) | Description |
|---|------|---------|-------------|
| 6.1 | Financial math utils | `src/utils/financial.ts` | SIP FV calculation, comparison functions |
| 6.2 | Build SIPCalculator | `src/components/finquest/ui/SIPCalculator.tsx` | 3 sliders, growth chart, results, "start SIP" button |
| 6.3 | Place MF Tower NPC | `src/components/finquest/zones/MFTowerZone.tsx` | NPC that opens calculator |
| 6.4 | Wire SIP to gameStore | gameStore | `startSIP()` action, auto-debit on month advance |

### Phase 7: Report Card + Polish (1.5-2 hours)

**Goal:** End-game summary, zone progression, polish.

| # | Task | File(s) | Description |
|---|------|---------|-------------|
| 7.1 | Build ReportCard | `src/components/finquest/ui/ReportCard.tsx` | Full results overlay with 20-year projection |
| 7.2 | 20-year projection math | `src/utils/financial.ts` | Project current habits forward |
| 7.3 | Zone progression | `src/stores/progressionStore.ts` | Zone unlock/complete tracking |
| 7.4 | Zone markers in world | Experience.tsx | Signposts or markers at zone locations |
| 7.5 | Polish BankHUD animations | BankHUD.tsx | Smooth number tweens, color transitions |
| 7.6 | Start screen | `src/components/HUD/StartButton.tsx` | Adapt to FinQuest branding |

---

## 6. Assets Plan

### 6.1 Models Already Available in `public/`

| Asset | Path | Usage in FinQuest |
|-------|------|-------------------|
| **Island world** | `public/models/world.glb` (11MB) | Main game world terrain + structures |
| **Player avatar** | `public/models/characters/feb.glb` | Default player character |
| **Female NPC** | `public/models/characters/Female.glb` | Neha (TechCorp), Didi (guide) |
| **Guide NPC** | `public/models/characters/guide.gltf` | Vikram (HR), Deepak (trader) |
| **Alternative avatar** | `public/models/characters/may.glb` | Additional NPC or player option |
| **Idle anim** | `public/models/animations/Standing_Idle.glb` | All characters idle |
| **Walk anim** | `public/models/animations/Walk.glb` | Player walking |
| **Run anim** | `public/models/animations/Run.glb` | Player running |
| **Jump anim** | `public/models/animations/Jump.glb` | Player jumping |
| **Buildings** | `public/models/buildings/*.glb` | Zone decorations (wall, roof, door, cart, fountain) |
| **Nature** | `public/models/nature/*.glb` | Trees, flowers, bushes, stones for island decoration |
| **Props** | `public/models/props/*.glb` | Signs, fences, campfire, boats, tents, paths |
| **Skybox** | `public/skybox/*.png` | 6-face cubemap skybox |
| **Water texture** | `public/textures/water.jpg` | Water surface texture |

### 6.2 Everlite Assets to REMOVE from `public/assets/`

These take up significant disk space and are not needed:

| Path | Size | Reason to Remove |
|------|------|------------------|
| `public/assets/jewelleryItemsToUploadHP/` | Large | Jewelry models |
| `public/assets/jewelleryItemsToUploadLP/` | Large | Jewelry models (low poly) |
| `public/assets/jewelleryItemsToUploadNewOctober/` | Large | More jewelry |
| `public/assets/jewelleryItemsToUploadOGSTORE/` | Large | OG store jewelry |
| `public/assets/jewelleryEnvMap.hdr` | 1.5MB | Jewelry environment map |
| `public/assets/jewelleryDefaultTemplates/` | -- | Default jewelry templates |
| `public/assets/meteor/` | -- | Meteor mining assets |
| `public/assets/sky.hdr` | 6.8MB | HDR sky (using cubemap instead) |
| `public/assets/map_store5_chains_added.glb` | 11.4MB | Everlite store map |
| `public/assets/mapwithDigigoldScreensV5.glb` | 11MB | Everlite store map v5 |
| `public/assets/Dance*.glb` (x8) | ~5MB total | Dance animations |
| `public/assets/horizontalScreeningImages/` | -- | Store screening images |
| `public/assets/videoBranding/` | -- | Store branding videos |
| `public/assets/hybridScreenUI/` | -- | Store UI assets |
| `public/assets/groupReferences/` | -- | Jewelry group refs |
| `public/assets/images/` (most) | -- | Store-specific images |
| `public/assets/inventoryConsole/` | -- | Inventory console models |
| `public/assets/portal/` | -- | Portal effects |
| `public/assets/vr/` | -- | VR-specific assets |
| `public/assets/lights_with_anim.glb` | -- | Stage lights |
| `public/assets/Screens/` | -- | TV screens |
| `public/assets/meteorTrailSprite*.png` | -- | Meteor trail sprites |
| `public/assets/meteorGroundImpactSprite.*` | -- | Meteor impact sprites |
| `public/assets/impactSprite.*` | -- | Impact sprites |

### 6.3 Assets to KEEP from `public/assets/`

| Path | Usage |
|------|-------|
| `public/assets/avatars/feb.glb` | Player avatar (duplicate of models/characters/feb.glb, consolidate) |
| `public/assets/avatars/may.glb` | NPC avatar |
| `public/assets/avatars/Female.glb` | NPC avatar |
| `public/assets/avatars/guide.gltf` | NPC avatar |
| `public/assets/animations/` | Animation GLBs (Idle, Walk, Run, Jump) |
| `public/assets/sounds/` | Ambient, walk, jump, click, shine sounds |
| `public/assets/fonts/` | Rajdhani font |
| `public/assets/skybox/` | Skybox images (check if same as public/skybox/) |
| `public/assets/dummyTri.gltf` | BVH dummy geometry |
| `public/assets/water.jpg` | Water texture |

### 6.4 Asset Consolidation Plan

The project currently has duplicate assets in both `public/models/` and `public/assets/`. Consolidate:

1. **Canonical avatar path:** `public/models/characters/` -- update `staticResourcePaths.gltfFilePaths` to point here
2. **Canonical animation path:** `public/models/animations/` -- update all animation loading to point here
3. **Canonical map:** `public/models/world.glb` -- update `staticResourcePaths.newEnvironment` to `./models/world.glb`
4. **Sounds:** Keep in `public/assets/sounds/` or move to `public/sounds/`
5. **Skybox:** Consolidate to `public/skybox/`
6. **Water:** Keep `public/textures/water.jpg`

### 6.5 New Assets Needed (Optional, for Polish)

| Asset | Source | Purpose |
|-------|--------|---------|
| FinQuest logo | Create (SVG) | Start screen branding |
| Zone signpost textures | Create | Text labels for zone markers |
| UPI notification sound | Create/find CC0 | Phone buzz for scam encounter |
| Success/failure jingles | Create/find CC0 | Quest complete/scam fallen sounds |
| Rupee icon | Create (SVG) | BankHUD currency symbol |

These are NOT required for a functional MVP. Text labels and CSS-styled UI are sufficient.

---

## 7. File-by-File Modification Guide

### Files to CREATE (new FinQuest code)

```
src/
  stores/
    gameStore.ts                    # Central financial state
    progressionStore.ts             # Zone/quest progression
  components/
    finquest/
      BankHUD.tsx                   # Persistent bank balance widget
      ui/
        DialogueBox.tsx             # NPC dialogue overlay
        InteractionPrompt.tsx       # "Press E" prompt
        OfferLetterPanel.tsx        # TechCorp offer letter
        SalaryQuiz.tsx              # CTC quiz component
        BudgetGame.tsx              # Budget allocation mini-game
        UPINotification.tsx         # Fake UPI collect request
        PhoneCallUI.tsx             # Fake phone call overlay
        ScamReport.tsx              # Scam survival report
        SIPCalculator.tsx           # Interactive SIP calculator
        ReportCard.tsx              # End-game financial report
      zones/
        TechCorpZone.tsx            # TechCorp NPC placement
        ScamParkZone.tsx            # Scam Park NPC placement
        MFTowerZone.tsx             # MF Tower NPC placement
  data/
    dialogues/
      techcorp.ts                   # TechCorp dialogue tree
      scampark.ts                   # Scam Park dialogue trees
      mftower.ts                    # MF Tower dialogue tree
      onboarding.ts                 # Didi welcome dialogue
    budgetItems.ts                  # Budget allocation items
    dialogueTypes.ts                # Dialogue system types
    zones.ts                        # Zone definitions
  utils/
    financial.ts                    # SIP math, projections, formatting
    rupeeFormat.ts                  # Indian number formatting (e.g., 1,23,456)
```

### Files to MODIFY (strip + adapt)

```
src/main.tsx                        # Strip providers, add gameStore, rewire HUD
src/Experience.tsx                  # Strip everlite components, add zone components
src/root.tsx                        # No changes needed
src/components/Character/index.tsx  # Strip VR/MP/meteor/inventory, fix @server import
src/components/Avatar.tsx           # Strip network/multiplayer
src/components/avatars/Generic.tsx  # Strip network, use useGLTF
src/components/Water.tsx            # Fix sRGBEncoding
src/components/Effects.tsx          # Strip SelectiveBloom, use regular Bloom
src/components/Environment.tsx      # Strip leva, keep fog + skybox
src/components/Sounds.tsx           # Strip video screen refs
src/components/tutorial/TutorialNPC.tsx           # Generalize for all FinQuest NPCs
src/components/tutorial/NPCChatSystem.tsx         # Adapt dialogue format
src/components/StoreEntryExitTriggerArea.tsx       # Rename to ProximityTrigger.tsx
src/components/TriggerArea.tsx                     # Keep as-is (BVH trigger)
src/components/HUD/index.tsx                       # Major rewrite for FinQuest UI
src/components/HUD/StartButton.tsx                 # Rebrand for FinQuest
src/components/HUD/Loader.tsx                      # Keep, rebrand
src/components/HUD/JumpButton.tsx                  # Keep as-is
src/hooks/useMap.ts                                # Major strip (1500 -> ~80 lines)
src/hooks/useCharacterControls.ts                  # Strip guards, add E key
src/hooks/useCameraControls.ts                     # Strip inventory/unity/leva
src/hooks/useSpringArm.ts                          # Minor strip
src/hooks/useGesturesAndDevice.ts                  # Keep as-is
src/CameraFollowCharacter.tsx                      # Keep as-is
src/SpringArm.tsx                                  # Keep as-is
src/config/staticResourcePaths.ts                  # Rewrite all paths for FinQuest
src/config/Canvas.ts                               # Keep, minor adjustments
src/config/Avatar.ts                               # Update paths
src/config/MapConfig.ts                            # Strip store configs, keep basic map config
src/config/dimensions.ts                           # Keep if used
src/contexts/GlobalStateContext.tsx                 # Strip unused state, keep tab focus + core
src/contexts/GesturesAndDeviceContext.tsx           # Keep as-is
src/contexts/CameraControlsContext.tsx              # Keep, strip inventory refs
src/contexts/AvatarAppearanceContext.tsx            # Strip RPM, keep basic avatar state
src/contexts/HUDContext.tsx                         # Major strip, keep start button + dialogue
src/contexts/MapContext.tsx                         # Strip store-specific initialization
src/contexts/NPCContext.tsx                         # Adapt for FinQuest NPC data
src/utils/commonMaterials.ts                       # Keep as-is
src/utils/commonTypes.ts                           # Keep as-is
src/utils/modifiedOrbitControls/index.js           # Keep as-is
src/utils/modifiedOrbitControls/index.d.ts         # Keep as-is
package.json                                       # Rename, strip deps
vite.config.ts                                     # Remove @server alias
tsconfig.json                                      # Remove @server path
```

### Files to DELETE (complete removal)

See Section 2.1 for the full list. Summary: ~40+ files across components, contexts, hooks, config, utils.

---

## 8. Store Architecture

### Existing Stores to KEEP (stripped)

| Store | File | Kept State |
|-------|------|------------|
| `genericStore` | `contexts/GlobalStateContext.tsx` | `isTabFocused`, `characterRef`, `isCharacterRefReady`, `loading_initialSpawn`, `areEffectsEnabled`, `dpr`, `joystickRoot`, `jumpButtonRoot`, `isTutorialNPCActive` |
| `CameraControlsStore` | `contexts/CameraControlsContext.tsx` | `orbitControlsRef`, `orbitDistance`, `makeCameraFollowCharacter`, `orbitControlsConfig`, camera movement flags |
| `GesturesAndDeviceStore` | `contexts/GesturesAndDeviceContext.tsx` | `isTouchDevice`, `isPinchOrScrollEventActive`, `isDragEventActive`, `screenSize`, `bindGestures`, `disableTouchAction` |
| `MapStore` | `contexts/MapContext.tsx` | `collider`, `mapModel`, `geometry` |
| `AvatarStore` | `contexts/AvatarAppearanceContext.tsx` | `avatarAnimationState`, `setAvatarAnimationState`, `avatarData`, `hasAvatarBeenSelected` |
| `HUDStore` | `contexts/HUDContext.tsx` | `hasStartButtonBeenPressed`, `showJoystick`, `jumpButtonTapped`, `showDialogScreen`, `isTutorialPromptShown` |
| `PlayerConfigStore` | `components/Character/index.tsx` | `maxSpeed`, `jumpDistance`, `deathHeight`, `playerSpawnPosition`, `isPlayerParalysedRef`, `resetFn`, `isPlayerAvatarVisible` |
| `SoundsStore` | `components/Sounds.tsx` | All sound refs and methods |

### New Stores to CREATE

| Store | File | Purpose |
|-------|------|---------|
| `gameStore` | `src/stores/gameStore.ts` | All FinQuest financial state, dialogue, zone progress |
| `progressionStore` | `src/stores/progressionStore.ts` | Zone unlock/complete, quest tracking |

### Store Interaction Flow

```
User walks to NPC
  -> TriggerArea detects proximity (BVH shapecast)
  -> gameStore.setNearbyNPC(npcData)
  -> InteractionPrompt renders "Press E"

User presses E
  -> useCharacterControls detects 'E' key
  -> gameStore.setDialogue(npcData.dialogueTree)
  -> PlayerConfigStore.isPlayerParalysedRef = true (freeze movement)
  -> DialogueBox renders over screen

User makes dialogue choice
  -> choice.effect() mutates gameStore (addMoney, spendMoney, etc.)
  -> BankHUD animates balance change
  -> Dialogue advances to next node

Quest completes
  -> gameStore.completeQuest(questId)
  -> progressionStore checks if zone is complete
  -> gameStore.advanceMonth()
  -> gameStore.processMonthlyAutoDebits()
  -> BankHUD updates month counter
```

---

## 9. Risk Mitigations

### 9.1 BVH Collision Compatibility

**Risk:** three-mesh-bvh 0.6.8 may have API differences with current Three.js 0.151.

**Mitigation:** The current package.json already has `three-mesh-bvh: ^0.6.8` paired with `three: ^0.151.0` -- these are the original everlite-store versions and are known to work together. Do NOT upgrade Three.js or three-mesh-bvh unless everything else is working first. The `computeBoundsTree` prototype patching in `main.tsx` is already in place.

### 9.2 @server Import Breakage

**Risk:** Character/index.tsx imports `Player` from `@server/rooms/schema/MyRoomState` and `AnimationStates` from `@server/utils/types`. The server directory does not exist.

**Mitigation:** In the very first task (Phase 0.5), inline these types:
```typescript
// Replace: import { AnimationStates } from '@server/utils/types'
type AnimationStates = 'idle' | 'walk' | 'run' | 'jump'

// Remove: import { Player } from '@server/rooms/schema/MyRoomState'
// (only used in multiplayer code that gets stripped)
```

Also remove the `@server` alias from `vite.config.ts` and `tsconfig.json`.

### 9.3 World GLB Naming Conventions

**Risk:** useMap.ts traverses the GLB scene and identifies meshes by naming conventions (e.g., meshes starting with specific prefixes for colliders vs visuals). The FinQuest `world.glb` may use different conventions.

**Mitigation:** After stripping useMap.ts, add a simple traversal that treats ALL meshes as both visual and collidable:
```javascript
const scene = gltf.scene
const colliderGroup = new THREE.Group()
scene.traverse((child) => {
  if (child.isMesh) {
    colliderGroup.add(child.clone())
  }
})
// Then generate BVH from colliderGroup
```

If performance is poor (too many collider triangles), selectively exclude meshes by name.

### 9.4 Player Falls Through Ground

**Risk:** If BVH collider is not ready before Character component starts physics, player falls into void.

**Mitigation:** everlite-store already handles this with `loading_initialSpawn` in genericStore. The Character component checks `MapStore.collider` before running physics. Preserve this guard:
```jsx
// In Experience.tsx
const collider = MapStore((s) => s.collider)
if (!collider) return null // Don't render Character until map loaded
```

Also preserve `deathHeight` respawn (-5.1) as a safety net.

### 9.5 Large Bundle Size

**Risk:** Even after stripping, public/assets/ contains ~100MB+ of everlite assets.

**Mitigation:** Delete unused assets (Section 6.2) BEFORE deploying. The jewelry GLBs alone are tens of megabytes. The FinQuest world.glb (11MB) + character models + animations should total ~15-20MB.

### 9.6 HUD/UI System Approach

**Risk:** Mixing Three.js `<Html>` tags with React DOM overlays can cause z-index and event handling conflicts.

**Mitigation:** Follow everlite-store's proven pattern: ALL UI (HUD, dialogue, menus) is rendered as React DOM **outside** the Canvas element, positioned with CSS. Only use drei `<Html>` for small in-world labels (zone names, NPC name tags). The Canvas and DOM layers are siblings, not nested:
```jsx
<div id="app">
  <Canvas> {/* 3D world */} </Canvas>
  <BankHUD />       {/* DOM overlay */}
  <DialogueBox />   {/* DOM overlay */}
  <ReportCard />    {/* DOM overlay */}
</div>
```

---

## Appendix A: Quick Reference — FinQuest Game Constants

```typescript
// Financial constants
const STARTING_BALANCE = 0
const MONTHLY_SALARY = 45000
const MANDATORY_EXPENSES = 26500  // rent + food + transport + utilities + loan EMI
const DISCRETIONARY_INCOME = 18500 // salary - mandatory
const STARTING_FINANCIAL_HEALTH = 50
const CREDIT_CARD_INTEREST_RATE = 0.36 // 36% p.a.
const SIP_ANNUAL_RETURN = 0.12 // 12% p.a.
const INSURANCE_MONTHLY_PREMIUM = 1000
const INSURANCE_COVERAGE = 500000

// Game constants
const TOTAL_MONTHS = 12
const STARTING_MONTH = 1

// Scam values
const UPI_SCAM_LOSS = 5000
const UPI_SCAM_AVOID_BONUS = 2000
const CRYPTO_SCAM_LOSS = 10000
const QR_SCAM_LOSS = 1800 // overpay of 2000 - 200

// Quest rewards
const TECHCORP_QUEST_BONUS = 0 // salary itself is the reward
const BUDGET_QUEST_BONUS = 2000
const SCAM_QUEST_BONUS = 0 // variable based on performance
const SIP_QUEST_BONUS = 3000
```

## Appendix B: Indian Rupee Formatting

All money values must use Indian number system formatting:
```typescript
function formatRupee(amount: number): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return formatter.format(amount)
}
// Examples: Rs 1,23,456   Rs 45,000   Rs 5,00,000
```

## Appendix C: Dialogue Tree Example (TechCorp)

```typescript
const techCorpDialogue: DialogueNode[] = [
  {
    id: 'neha-welcome',
    speaker: 'Neha (Receptionist)',
    text: 'Hey, congratulations! You\'ve been selected as a Software Developer at TechCorp. Here\'s your offer letter. Take a look!',
    onEnter: () => { /* show offer letter panel */ },
    next: 'neha-quiz',
  },
  {
    id: 'neha-quiz',
    speaker: 'Neha',
    text: 'Your CTC is Rs 8,00,000 per annum. How much do you think you\'ll get in hand every month?',
    choices: [
      { text: 'Rs 66,667 (CTC / 12)', nextNodeId: 'vikram-wrong' },
      { text: 'Rs 55,000', nextNodeId: 'vikram-wrong' },
      { text: 'Rs 48,000', nextNodeId: 'vikram-close' },
      { text: 'Rs 42,000-45,000', nextNodeId: 'vikram-correct' },
    ],
  },
  {
    id: 'vikram-wrong',
    speaker: 'Vikram (HR Manager)',
    text: 'Haha, I see this mistake every year! CTC is NOT your in-hand salary. Let me break it down...',
    next: 'vikram-explain',
  },
  {
    id: 'vikram-correct',
    speaker: 'Vikram (HR Manager)',
    text: 'Impressive! Most freshers get this wrong. You\'re right — after PF, tax, and other deductions, your in-hand is around Rs 45,000.',
    next: 'vikram-explain',
  },
  {
    id: 'vikram-explain',
    speaker: 'Vikram',
    text: 'PF (both shares), professional tax, and income tax are deducted. Variable pay isn\'t guaranteed. Gratuity only after 5 years. Your actual in-hand: ~Rs 42,000-45,000/month.',
    next: 'salary-credit',
  },
  {
    id: 'salary-credit',
    speaker: 'System',
    text: '',
    onEnter: () => {
      gameStore.getState().addMoney(45000, 'TechCorp Salary - Month 1')
      // Then auto-deduct
      gameStore.getState().spendMoney(26500, 'Mandatory expenses (rent, food, transport, EMI, utilities)')
    },
    next: 'vikram-advice',
  },
  {
    id: 'vikram-advice',
    speaker: 'Vikram',
    text: 'Now you have Rs 18,500 of discretionary money. Choose wisely — this is the decision that separates the financially free from the financially trapped.',
    onComplete: () => {
      gameStore.getState().completeQuest('techcorp-ctc')
      gameStore.getState().advanceMonth()
    },
  },
]
```

---

**End of plan. Start with Phase 0 (cleanup) and work sequentially through phases. Each phase produces a testable checkpoint.**
