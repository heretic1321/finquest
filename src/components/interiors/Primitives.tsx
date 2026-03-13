import * as THREE from 'three'

// Colors
const WOOD_DARK = '#3d2b1f'
const WOOD_LIGHT = '#8b6914'
const METAL_GRAY = '#5a5a5a'
const METAL_DARK = '#2a2a2a'
const SCREEN_OFF = '#1a1a2e'
const SCREEN_ON = '#0f3460'
const WHITE = '#e8e8e8'
const CHAIR_BLACK = '#1c1c1c'
const GREEN_FELT = '#1a4a2e'

// ═══════════════════════════════════════
// RECEPTION DESK - L-shaped counter
// ═══════════════════════════════════════
export function ReceptionDesk() {
  return (
    <group>
      {/* Main counter front */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 1.1, 0.6]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.7} />
      </mesh>
      {/* Counter top */}
      <mesh position={[0, 1.12, 0]} castShadow>
        <boxGeometry args={[3.1, 0.06, 0.7]} />
        <meshStandardMaterial color={WOOD_LIGHT} roughness={0.5} />
      </mesh>
      {/* Side wing */}
      <mesh position={[1.3, 0.55, -0.8]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 1.1, 1.0]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.7} />
      </mesh>
      {/* Side wing top */}
      <mesh position={[1.3, 1.12, -0.8]} castShadow>
        <boxGeometry args={[0.7, 0.06, 1.1]} />
        <meshStandardMaterial color={WOOD_LIGHT} roughness={0.5} />
      </mesh>
      {/* Monitor on desk */}
      <Monitor position={[0.5, 1.15, -0.15]} />
      {/* Keyboard */}
      <mesh position={[0.5, 1.15, 0.15]} castShadow>
        <boxGeometry args={[0.4, 0.02, 0.15]} />
        <meshStandardMaterial color={METAL_DARK} roughness={0.6} />
      </mesh>
    </group>
  )
}

// ═══════════════════════════════════════
// COMPUTER TABLE + CHAIR
// ═══════════════════════════════════════
export function ComputerDesk() {
  return (
    <group>
      {/* Desk surface */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.05, 0.6]} />
        <meshStandardMaterial color={WOOD_LIGHT} roughness={0.5} />
      </mesh>
      {/* Legs */}
      {[[-0.55, 0.375, -0.25], [0.55, 0.375, -0.25], [-0.55, 0.375, 0.25], [0.55, 0.375, 0.25]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.05, 0.75, 0.05]} />
          <meshStandardMaterial color={METAL_GRAY} roughness={0.4} metalness={0.3} />
        </mesh>
      ))}
      {/* Monitor */}
      <Monitor position={[0, 0.78, -0.15]} />
      {/* Keyboard */}
      <mesh position={[0, 0.78, 0.12]} castShadow>
        <boxGeometry args={[0.35, 0.015, 0.12]} />
        <meshStandardMaterial color={METAL_DARK} roughness={0.6} />
      </mesh>
      {/* Chair */}
      <OfficeChair position={[0, 0, 0.6]} />
    </group>
  )
}

// ═══════════════════════════════════════
// MONITOR
// ═══════════════════════════════════════
export function Monitor({ position = [0, 0, 0] as [number, number, number] }) {
  return (
    <group position={position}>
      {/* Screen */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.45, 0.3, 0.02]} />
        <meshStandardMaterial color={SCREEN_OFF} roughness={0.3} />
      </mesh>
      {/* Screen glow face */}
      <mesh position={[0, 0.22, 0.011]}>
        <planeGeometry args={[0.42, 0.27]} />
        <meshStandardMaterial color={SCREEN_ON} emissive={SCREEN_ON} emissiveIntensity={0.3} />
      </mesh>
      {/* Stand */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.04, 0.1, 0.04]} />
        <meshStandardMaterial color={METAL_GRAY} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.02, 8]} />
        <meshStandardMaterial color={METAL_GRAY} metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  )
}

// ═══════════════════════════════════════
// OFFICE CHAIR
// ═══════════════════════════════════════
export function OfficeChair({ position = [0, 0, 0] as [number, number, number] }) {
  return (
    <group position={position}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.45, 0.06, 0.45]} />
        <meshStandardMaterial color={CHAIR_BLACK} roughness={0.8} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.72, -0.2]} castShadow>
        <boxGeometry args={[0.42, 0.5, 0.04]} />
        <meshStandardMaterial color={CHAIR_BLACK} roughness={0.8} />
      </mesh>
      {/* Center pole */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.44, 8]} />
        <meshStandardMaterial color={METAL_GRAY} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Base star (simplified as cylinder) */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.04, 5]} />
        <meshStandardMaterial color={METAL_GRAY} metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

// ═══════════════════════════════════════
// TRADING DESK (long table with multiple monitors)
// ═══════════════════════════════════════
export function TradingDesk() {
  return (
    <group>
      {/* Long desk surface */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.0, 0.05, 0.8]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[[-1.4, 0.375, -0.35], [1.4, 0.375, -0.35], [-1.4, 0.375, 0.35], [1.4, 0.375, 0.35]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.05, 0.75, 0.05]} />
          <meshStandardMaterial color={METAL_GRAY} metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
      {/* 3 monitors */}
      <Monitor position={[-0.9, 0.78, -0.2]} />
      <Monitor position={[0, 0.78, -0.2]} />
      <Monitor position={[0.9, 0.78, -0.2]} />
      {/* Green felt strip (ticker feel) */}
      <mesh position={[0, 0.76, 0.2]}>
        <boxGeometry args={[2.8, 0.01, 0.15]} />
        <meshStandardMaterial color={GREEN_FELT} roughness={0.9} />
      </mesh>
      {/* Chairs */}
      <OfficeChair position={[-0.9, 0, 0.7]} />
      <OfficeChair position={[0, 0, 0.7]} />
      <OfficeChair position={[0.9, 0, 0.7]} />
    </group>
  )
}

// ═══════════════════════════════════════
// TICKER BOARD (wall-mounted stock display)
// ═══════════════════════════════════════
export function TickerBoard() {
  return (
    <group>
      {/* Board frame */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[3.0, 1.2, 0.08]} />
        <meshStandardMaterial color={METAL_DARK} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0, 0.041]}>
        <planeGeometry args={[2.85, 1.05]} />
        <meshStandardMaterial color={'#001a00'} emissive={'#003300'} emissiveIntensity={0.5} />
      </mesh>
      {/* Ticker lines (green bars simulating scrolling data) */}
      {[-0.35, -0.1, 0.15, 0.4].map((y, i) => (
        <mesh key={i} position={[0, y, 0.045]}>
          <planeGeometry args={[2.6, 0.08]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#00ff44' : '#ff3333'}
            emissive={i % 2 === 0 ? '#00ff44' : '#ff3333'}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

// ═══════════════════════════════════════
// BANK COUNTER (teller window style)
// ═══════════════════════════════════════
export function BankCounter() {
  return (
    <group>
      {/* Main counter */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 1.2, 0.5]} />
        <meshStandardMaterial color={'#2c1810'} roughness={0.7} />
      </mesh>
      {/* Counter top (marble feel) */}
      <mesh position={[0, 1.22, 0]} castShadow>
        <boxGeometry args={[2.6, 0.06, 0.6]} />
        <meshStandardMaterial color={WHITE} roughness={0.2} metalness={0.1} />
      </mesh>
      {/* Glass dividers */}
      {[-0.7, 0, 0.7].map((x, i) => (
        <mesh key={i} position={[x, 1.65, 0]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.02]} />
          <meshStandardMaterial color={'#88ccff'} transparent opacity={0.3} roughness={0.1} metalness={0.1} />
        </mesh>
      ))}
      {/* Divider frames */}
      {[-1.0, -0.35, 0.35, 1.0].map((x, i) => (
        <mesh key={i} position={[x, 1.65, 0]} castShadow>
          <boxGeometry args={[0.03, 0.85, 0.06]} />
          <meshStandardMaterial color={METAL_GRAY} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}
