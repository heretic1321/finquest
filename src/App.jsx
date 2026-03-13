import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { GameWorld } from './components/world/GameWorld'
import { GameUI } from './components/ui/GameUI'
import { LoadingScreen } from './components/ui/LoadingScreen'
import './App.css'

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'interact', keys: ['KeyE'] },
  { name: 'sprint', keys: ['ShiftLeft'] },
]

function App() {
  return (
    <>
      <KeyboardControls map={keyboardMap}>
        <Canvas
          shadows
          camera={{ position: [0, 8, 12], fov: 55 }}
          gl={{ antialias: true }}
        >
          <Suspense fallback={null}>
            <Physics debug={false}>
              <GameWorld />
            </Physics>
          </Suspense>
        </Canvas>
        <GameUI />
      </KeyboardControls>
      <LoadingScreen />
    </>
  )
}

export default App
