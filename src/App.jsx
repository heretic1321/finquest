import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { keyboardMap } from './data/keyboardMap';

// 3D World components
import Atmosphere from './components/world/Atmosphere';
import Lighting from './components/world/Lighting';
import GameWorld from './components/world/GameWorld';
import Water from './components/world/Water';
import Player from './components/world/Player';
import NPCList from './components/npcs/NPCList';

// DOM UI components
import BankHUD from './components/ui/BankHUD';
import DialogueBox from './components/ui/DialogueBox';
import InteractionPrompt from './components/ui/InteractionPrompt';

// Hooks
import useInteraction from './hooks/useInteraction';

function GameUI() {
  useInteraction();
  return (
    <>
      <BankHUD />
      <DialogueBox />
      <InteractionPrompt />
    </>
  );
}

function App() {
  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas
        shadows
        camera={{ position: [0, 8, 15], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <Physics timeStep="vary">
            <Atmosphere />
            <Lighting />
            <GameWorld />
            <Water />
            <Player />
            <NPCList />
          </Physics>
        </Suspense>
      </Canvas>
      {/* DOM overlay layer — outside Canvas */}
      <GameUI />
    </KeyboardControls>
  );
}

export default App;
