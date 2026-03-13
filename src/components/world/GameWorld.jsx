import { Environment, Sky, Cloud, Float } from '@react-three/drei'
import { Island } from './Island'
import { Ocean } from './Ocean'
import { Player } from './Player'
import { NPC } from '../npcs/NPC'

const npcs = [
  {
    id: 'banker',
    name: 'Banker Priya',
    position: [6, 1.5, -3],
    color: '#4ade80',
    topic: 'savings',
    greeting: "Welcome! I'm Priya, your guide to smart saving. Did you know the 50/30/20 rule can transform your finances?",
  },
  {
    id: 'investor',
    name: 'Investor Raj',
    position: [-5, 1.5, -6],
    color: '#22d3ee',
    topic: 'investing',
    greeting: "Hey there! I'm Raj. Ready to learn about compound interest? It's the 8th wonder of the world!",
  },
  {
    id: 'insurance',
    name: 'Advisor Maya',
    position: [8, 1.5, 5],
    color: '#fbbf24',
    topic: 'insurance',
    greeting: "Hello! I'm Maya. Let me tell you why insurance isn't an expense — it's a safety net for your future.",
  },
  {
    id: 'tax',
    name: 'CA Arjun',
    position: [-7, 1.5, 4],
    color: '#f472b6',
    topic: 'taxation',
    greeting: "Namaste! I'm CA Arjun. Taxes don't have to be scary. Let me show you how to save legally!",
  },
]

export function GameWorld() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        castShadow
        position={[10, 20, 10]}
        intensity={1.2}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Sky and Environment */}
      <Sky
        sunPosition={[100, 20, 100]}
        turbidity={0.5}
        rayleigh={0.5}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      <Environment preset="sunset" environmentIntensity={0.3} />
      <fog attach="fog" args={['#87CEEB', 30, 80]} />

      {/* Clouds */}
      <Float speed={0.5} floatIntensity={0.3}>
        <Cloud position={[15, 15, -10]} opacity={0.6} speed={0.2} width={10} />
        <Cloud position={[-10, 12, -15]} opacity={0.4} speed={0.3} width={8} />
        <Cloud position={[0, 18, -20]} opacity={0.5} speed={0.15} width={12} />
      </Float>

      {/* World */}
      <Ocean />
      <Island />

      {/* Player */}
      <Player />

      {/* NPCs */}
      {npcs.map((npc) => (
        <NPC key={npc.id} {...npc} />
      ))}
    </>
  )
}
