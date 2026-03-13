# PHASE 0: Cleanup (Run First, Before Any Agent)

This phase must be completed before Agent 1 or Agent 2 start.

## Delete Files

```bash
# Remove entire old 3D layer
rm -rf src/components/world/
rm -rf src/components/npcs/
rm -rf src/components/ui/
rm -rf src/components/minigames/
rm -rf src/components/quests/

# Remove old hooks
rm -f src/hooks/useControlMode.js
rm -f src/hooks/useInteract.js
rm -f src/hooks/useInteraction.js

# Remove old data files
rm -f src/data/keyboardMap.js
rm -f src/data/assetRegistry.js

# Remove old App.jsx (will be rewritten)
rm -f src/App.jsx
```

## Update package.json

```bash
# Remove old packages
npm uninstall @react-three/rapier ecctrl three-custom-shader-material

# Add new packages
npm install three-mesh-bvh maath postprocessing three-stdlib nipplejs @use-gesture/react
```

## Copy Assets (if not already done)

```bash
# World GLB should already be at public/models/world.glb
# Water texture should be at public/textures/water.jpg
# Skybox PNGs at public/skybox/
# Character GLBs at public/models/characters/
# Animation GLBs at public/models/animations/
```

## Patch main.jsx

Add BVH prototype patching to `src/main.jsx`:

```js
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh'
import * as THREE from 'three'

THREE.Mesh.prototype.raycast = acceleratedRaycast
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
```

## Create Directory Structure

```bash
mkdir -p src/stores
mkdir -p src/config
mkdir -p src/utils/modifiedOrbitControls
mkdir -p src/components/Character
mkdir -p src/components/avatars
mkdir -p src/hooks
```
