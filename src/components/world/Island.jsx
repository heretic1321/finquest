import { RigidBody } from '@react-three/rapier'

export default function Island() {
  return (
    <RigidBody type="fixed" colliders="trimesh" restitution={0.2} friction={1}>
      <group>
        {/* Main green plateau — radius 40, height 2 */}
        <mesh receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[40, 40, 2, 64]} />
          <meshStandardMaterial color="#4a8c5c" />
        </mesh>

        {/* Sandy beach ring — radius 48 */}
        <mesh receiveShadow position={[0, -0.3, 0]}>
          <cylinderGeometry args={[48, 48, 1.5, 64]} />
          <meshStandardMaterial color="#e8d5a3" />
        </mesh>

        {/* Underwater tapered base — radius 44 top, 30 bottom */}
        <mesh position={[0, -4, 0]}>
          <cylinderGeometry args={[44, 30, 6, 64]} />
          <meshStandardMaterial color="#3d6b4e" />
        </mesh>

        {/* Elevated hill for MF Tower zone — position [25, 2, 25] */}
        <mesh receiveShadow position={[25, 1.5, 25]}>
          <cylinderGeometry args={[10, 14, 3, 32]} />
          <meshStandardMaterial color="#4a8c5c" />
        </mesh>

        {/* Gentle slope ring around the MF hill */}
        <mesh receiveShadow position={[25, 0.6, 25]}>
          <cylinderGeometry args={[14, 18, 1.2, 32]} />
          <meshStandardMaterial color="#5a9a6a" />
        </mesh>

        {/* Slight terrain bump near TechCorp — subtle elevation */}
        <mesh receiveShadow position={[30, 0.4, -25]}>
          <cylinderGeometry args={[8, 12, 0.8, 24]} />
          <meshStandardMaterial color="#4e8f60" />
        </mesh>
      </group>
    </RigidBody>
  )
}
