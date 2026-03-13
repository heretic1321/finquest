# TASK 00: Project Foundation & Setup

## Phase
Phase 0 — Project Foundation

## Prerequisites
- None — this is the very first task. Start here.

## Goal
Transform the empty Vite+React scaffold into a running 3D application with React Three Fiber Canvas, Rapier physics, KeyboardControls, and the correct folder structure. After this task, `npm run dev` shows a blank 3D canvas with physics ready.

## Detailed Requirements

### 1. Install Missing Dependencies

The project `package.json` already has these installed:
- `react`, `react-dom` (v19)
- `three` (v0.183)
- `@react-three/fiber` (v9)
- `@react-three/drei` (v10)
- `@react-three/rapier` (v2)
- `@react-three/postprocessing` (v3)
- `zustand` (v5)
- `leva` (v0.10)
- `howler` (v2)

**Install ONLY these missing packages:**
```bash
cd /home/heretic/Documents/Projects/iiitd-hackathon/finquest
pnpm add ecctrl three-custom-shader-material
pnpm add -D vite-plugin-glsl
```

- `ecctrl` — Third-person character controller from pmndrs
- `three-custom-shader-material` — For stylized water shader (optional, but install now)
- `vite-plugin-glsl` — Vite plugin for importing .glsl/.vert/.frag files

**DO NOT reinstall packages already in package.json. DO NOT add any other packages.**

### 2. Update vite.config.js

Add the GLSL plugin so `.glsl` files can be imported:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  plugins: [react(), glsl()],
})
```

### 3. Create Folder Structure

Create these directories (all under `src/`):
```
src/
├── components/
│   ├── world/       # 3D world components (Island, Ocean, Sky, etc.)
│   ├── ui/          # 2D HTML overlay components (HUD, Dialogue, etc.)
│   ├── quests/      # Quest-specific components (TechCorp, ScamPark, etc.)
│   └── minigames/   # Full-screen mini-game overlays (Budget, SIP calc)
├── stores/          # Zustand stores (useGameStore.js)
├── data/            # Static data (NPC definitions, dialogue trees, financial constants)
├── hooks/           # Custom React hooks
└── utils/           # Utility functions (formatting, calculations)
```

Create each directory with an empty `.gitkeep` file so they are tracked by git.

### 4. Update index.css

The current `index.css` is already correct for a full-screen 3D app. Verify it has:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: #0a0a0a;
  color: #fff;
}

#root {
  position: relative;
}
```

No changes needed if it already looks like this.

### 5. Create the Keyboard Map — `src/data/keyboardMap.js`

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

### 6. Rewrite App.jsx — Minimal R3F Canvas Shell

Replace `src/App.jsx` with:

```jsx
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { keyboardMap } from './data/keyboardMap';

function App() {
  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <Physics timeStep="vary">
            {/* World components go here in later tasks */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={0.5} />
            <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[10, 10]} />
              <meshStandardMaterial color="#4a8c5c" />
            </mesh>
          </Physics>
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
}

export default App;
```

Key points:
- `KeyboardControls` wraps everything (required by ecctrl)
- `Canvas` has `shadows` enabled
- `Physics` with `timeStep="vary"` for smooth simulation
- `Suspense` wraps physics content (required for async loading)
- A simple green plane as a placeholder so you can verify the 3D scene renders
- Camera at [0, 5, 10] looking toward origin

### 7. Keep main.jsx As-Is

The current `main.jsx` is fine:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

No changes needed.

## File Structure

Files to create/modify:
```
MODIFY: package.json (via pnpm add — adds ecctrl, three-custom-shader-material, vite-plugin-glsl)
MODIFY: vite.config.js (add glsl plugin)
MODIFY: src/App.jsx (rewrite with R3F Canvas + Physics)
CREATE: src/data/keyboardMap.js
CREATE: src/components/world/.gitkeep
CREATE: src/components/ui/.gitkeep
CREATE: src/components/quests/.gitkeep
CREATE: src/components/minigames/.gitkeep
CREATE: src/stores/.gitkeep
CREATE: src/data/ (already created by keyboardMap.js)
CREATE: src/hooks/.gitkeep
CREATE: src/utils/.gitkeep
```

## Acceptance Criteria

- [ ] `pnpm install` completes without errors
- [ ] `pnpm run dev` starts the dev server
- [ ] Browser shows a green plane in a 3D canvas (not a blank page, not the old "Ready for development" text)
- [ ] No console errors related to missing imports or failed physics init
- [ ] All directories under `src/` exist: `components/world`, `components/ui`, `components/quests`, `components/minigames`, `stores`, `data`, `hooks`, `utils`
- [ ] `keyboardMap.js` exports the keyboard mapping array
- [ ] GLSL files can be imported (verified by vite config, actual shader usage comes in later tasks)

## What NOT to Do

- Do NOT add any game content (island, ocean, NPCs, HUD) — that's for later tasks
- Do NOT create the Zustand store yet — that's TASK_04 (UI Layer)
- Do NOT install packages already in package.json
- Do NOT add a loading screen
- Do NOT add post-processing effects
- Do NOT add sound/music setup
- Do NOT modify index.html (it's fine as-is)

## Estimated Complexity
Simple — ~15 minutes of work. Mostly file creation and one dependency install.
