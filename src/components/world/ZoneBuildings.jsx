import { useGLTF, Clone } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

function BuildingModel({ url, position, rotation, scale }) {
  const { scene } = useGLTF(url)
  return (
    <Clone
      object={scene}
      position={position}
      rotation={rotation}
      scale={typeof scale === 'number' ? [scale, scale, scale] : scale}
      castShadow
      receiveShadow
    />
  )
}

export default function ZoneBuildings() {
  return (
    <group>
      {/* ================================================================
          TechCorp Office — northeast [30, 1, -25]
          Corporate building: walls + door + roof, scaled up
          ================================================================ */}
      <group position={[30, 1, -25]}>
        <RigidBody type="fixed" colliders="trimesh">
          <group>
            {/* Back wall */}
            <BuildingModel url="/models/buildings/wall.glb" position={[0, 0, -2]} rotation={[0, 0, 0]} scale={3} />
            {/* Left wall */}
            <BuildingModel url="/models/buildings/wall.glb" position={[-2, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={3} />
            {/* Right wall */}
            <BuildingModel url="/models/buildings/wall.glb" position={[2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} scale={3} />
            {/* Front wall with door */}
            <BuildingModel url="/models/buildings/wall-door.glb" position={[0, 0, 2]} rotation={[0, Math.PI, 0]} scale={3} />
            {/* Roof */}
            <BuildingModel url="/models/buildings/roof.glb" position={[0, 3, 0]} rotation={[0, 0, 0]} scale={3} />
          </group>
        </RigidBody>
      </group>

      {/* ================================================================
          Scam Park — northwest [-30, 1, -18]
          Shady area: tent, with surrounding atmosphere
          ================================================================ */}
      <group position={[-30, 1, -18]}>
        <RigidBody type="fixed" colliders="trimesh">
          <group>
            {/* Main tent */}
            <BuildingModel url="/models/props/tent_smallOpen.glb" position={[0, 0, 0]} rotation={[0, 0.5, 0]} scale={2.5} />
          </group>
        </RigidBody>
      </group>

      {/* ================================================================
          MF Tower — east [25, 3, 25]  (on the elevated hill)
          Tall tower: stacked walls + roof on top
          ================================================================ */}
      <group position={[25, 3, 25]}>
        <RigidBody type="fixed" colliders="trimesh">
          <group>
            {/* Ground floor walls */}
            <BuildingModel url="/models/buildings/wall.glb" position={[0, 0, -1.5]} rotation={[0, 0, 0]} scale={2.5} />
            <BuildingModel url="/models/buildings/wall.glb" position={[-1.5, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={2.5} />
            <BuildingModel url="/models/buildings/wall.glb" position={[1.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]} scale={2.5} />
            <BuildingModel url="/models/buildings/wall-door.glb" position={[0, 0, 1.5]} rotation={[0, Math.PI, 0]} scale={2.5} />
            {/* Second floor walls (stacked higher) */}
            <BuildingModel url="/models/buildings/wall.glb" position={[0, 2.5, -1.5]} rotation={[0, 0, 0]} scale={2.5} />
            <BuildingModel url="/models/buildings/wall.glb" position={[-1.5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} scale={2.5} />
            <BuildingModel url="/models/buildings/wall.glb" position={[1.5, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} scale={2.5} />
            <BuildingModel url="/models/buildings/wall.glb" position={[0, 2.5, 1.5]} rotation={[0, Math.PI, 0]} scale={2.5} />
            {/* Roof on top */}
            <BuildingModel url="/models/buildings/roof.glb" position={[0, 5, 0]} rotation={[0, 0, 0]} scale={2.5} />
          </group>
        </RigidBody>
      </group>
    </group>
  )
}

// Preload building models
useGLTF.preload('/models/buildings/wall.glb')
useGLTF.preload('/models/buildings/wall-door.glb')
useGLTF.preload('/models/buildings/roof.glb')
useGLTF.preload('/models/props/tent_smallOpen.glb')
