import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { canvasConfig } from './config/canvas'
import Experience from './Experience'
import Effects from './components/Effects'
import EnvironmentSetup from './components/EnvironmentSetup'

export default function App() {
  return (
    <Canvas {...canvasConfig} dpr={0.8} style={{ width: '100%', height: '100%' }}>
      <Suspense fallback={null}>
        <EnvironmentSetup />
        <Experience />
        <Effects />
      </Suspense>
    </Canvas>
  )
}
