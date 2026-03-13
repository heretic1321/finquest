import { useRef, useEffect } from 'react'

// import { button, useControls } from 'leva'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

// import { useControls } from 'leva'
import Character, { CharacterRef } from '@client/components/Character'
import UnityControls from '@client/components/dev/UnityControls'
import UnderfloorRespawnTrigger from '@client/components/UnderfloorRespawnTrigger'
import ZoneManager from '@client/components/ZoneManager'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { useGameStore } from '@client/stores/gameStore'

import CameraFollowCharacter from './CameraFollowCharacter'
// import DanceFloor from './components/DanceFloor'
// import DancingCharacters from './components/DancingCharacter'
// import HoveringDisplays from './components/HoveringDisplays'
// import VRItemShowcase from './components/VR/VRItemShowcase'
import Water from './components/Water'
import { vrStore } from './contexts/VRStateContext'
// import DebugEntities from './DebugEntities'
// import OtherPlayers from './OtherPlayers'
// import SendPlayerTransformToServer from './SendPlayerTransformToServer'
// import CreateGroupNew from './utils/JewelleryManagement/CreateGroup'
// import CreateSlot from './utils/JewelleryManagement/CreateSlot'
// import UpdateGroupNew from './utils/JewelleryManagement/UpdateGroup'
// import UpdateSlot from './utils/JewelleryManagement/UpdateSlot'
import SpringArm from './SpringArm'
import TutorialNPC from './components/tutorial/TutorialNPC'
import { staticResourcePaths } from './config/staticResourcePaths'
// import DigiGoldMachineManager from './components/DigiGold/DigiGoldMachine'


interface WorldConfigZustandState {
  gravity: number
  physicsStep: number
  directionalLightColor: string
  directionalLightIntensity: number
  directionalLightPosition: [number, number, number]
  hemisphericLightColor: string
  hemisphericLightGroundColor: string
  hemisphericLightIntensity: number
}

const WorldConfigStore = create<WorldConfigZustandState>(() => ({
  gravity: -35,
  physicsStep: 5,
  directionalLightColor: '#ffffff',
  directionalLightIntensity: 0.5,
  directionalLightPosition: [1 * 50, 1.5 * 50, 1 * 50],
  hemisphericLightColor: '#ffffff',
  hemisphericLightGroundColor: '#223344',
  hemisphericLightIntensity: 0.3,
}))

function Experience() {
  const characterRef = useRef<CharacterRef | null>(null)

  // useControls(
  //   'World',
  //   () => ({
  //     gravity: {
  //       value: WorldConfigStore.getState().gravity,
  //       min: -100,
  //       max: 100,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         WorldConfigStore.setState({ gravity: value })
  //       }
  //     },
  //     physicsStep: {
  //       value: WorldConfigStore.getState().physicsStep,
  //       min: 0,
  //       max: 10,
  //       step: 1,
  //       onChange: (value: number) => {
  //         WorldConfigStore.setState({ physicsStep: value })
  //       }
  //     },
  //     directionalLightColor: {
  //       value: WorldConfigStore.getState().directionalLightColor,
  //       onChange: (value: string) => {
  //         WorldConfigStore.setState({ directionalLightColor: value })
  //       }
  //     },
  //     directionalLightIntensity: {
  //       value: WorldConfigStore.getState().directionalLightIntensity,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         WorldConfigStore.setState({ directionalLightIntensity: value })
  //       }
  //     },
  //     directionalLightPosition: {
  //       value: WorldConfigStore.getState().directionalLightPosition,
  //       onChange: (value: [number, number, number]) => {
  //         WorldConfigStore.setState({ directionalLightPosition: value })
  //       }
  //     },
  //     hemisphericLightColor: {
  //       value: WorldConfigStore.getState().hemisphericLightColor,
  //       onChange: (value: string) => {
  //         WorldConfigStore.setState({ hemisphericLightColor: value })
  //       }
  //     },
  //     hemisphericLightGroundColor: {
  //       value: WorldConfigStore.getState().hemisphericLightGroundColor,
  //       onChange: (value: string) => {
  //         WorldConfigStore.setState({ hemisphericLightGroundColor: value })
  //       }
  //     },
  //     hemisphericLightIntensity: {
  //       value: WorldConfigStore.getState().hemisphericLightIntensity,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         WorldConfigStore.setState({ hemisphericLightIntensity: value })
  //       }
  //     },
  //   }),
  //   {
  //     collapsed: true,
  //     render: () => {
  //       return isDebugMode || false
  //     },
  //   },
  // )

  const { gravity, physicsStep } = WorldConfigStore(
    useShallow((state) => ({
      gravity: state.gravity,
      physicsStep: state.physicsStep,
    })),
  )

  const isVRMode = vrStore((state) => state.isVRMode)

  const hasStartButtonBeenPressed = HUDStore(
    (state) => state.hasStartButtonBeenPressed,
  )

  // Credit first salary when the game starts (month 1)
  const month = useGameStore((state) => state.month)
  const receiveSalary = useGameStore((state) => state.receiveSalary)
  useEffect(() => {
    if (hasStartButtonBeenPressed && month === 1) {
      // Only credit if balance is 0 (first time)
      const { balance } = useGameStore.getState()
      if (balance === 0) {
        receiveSalary()
      }
    }
  }, [hasStartButtonBeenPressed, month, receiveSalary])

  if (!hasStartButtonBeenPressed) return null

  // Render the scene
  return (
    <>
      {/* <TourGuide characterRef={characterRef} /> */}
      <TutorialNPC
        characterRef={characterRef}
        modelPath={staticResourcePaths.gltfFilePaths.sia}
      />
      <Water />
      <Character
        ref={characterRef}
        gravity={gravity}
        physicsStep={physicsStep}
        isVRMode={false}
      />

      {/* Not needed anymore as we have played the video on the stage screen itself */}
      {/* <VideoScreen /> */}
      <CharacterDependentComponents />
      {/* <StageLightsWithAnim /> */}
    </>
  )
}

const CharacterDependentComponents = () => {
  const isCharacterRefReady = genericStore((state) => state.isCharacterRefReady)
  const unityLikeControlsEnabled = genericStore(
    (state) => state.unityLikeControlsEnabled,
  )
  const characterRef = genericStore((state) => state.characterRef)
  const isVRMode = vrStore((state) => state.isVRMode)

  // const [activeJewelleryManagementMode, setActiveJewelleryManagementMode] =
  //   useState<
  //     'groupCreation' | 'groupUpdate' | 'slotCreation' | 'slotUpdate' | null
  //   >(null)
  // useControls(
  //   'Jewellery Management',
  //   () => ({
  //     'Create Group': button(() => {
  //       setActiveJewelleryManagementMode('groupCreation')
  //     }),
  //     'Create Slots': button(() => {
  //       setActiveJewelleryManagementMode('slotCreation')
  //     }),
  //     'Update Group': button(() => {
  //       setActiveJewelleryManagementMode('groupUpdate')
  //     }),
  //     'Update Slots': button(() => {
  //       setActiveJewelleryManagementMode('slotUpdate')
  //     }),
  //     reset: button(() => {
  //       setActiveJewelleryManagementMode(null)
  //     }),
  //   }),
  //   {
  //     collapsed: true,
  //     render: () => {
  //       return isDebugMode || false
  //     },
  //   },
  // )

  if (!isCharacterRefReady) return null
  return (
    <>
      {!isVRMode && <SpringArm characterRef={characterRef} />}
      {unityLikeControlsEnabled || isVRMode ? null : (
        <CameraFollowCharacter characterRef={characterRef} />
      )}
      {unityLikeControlsEnabled ? <UnityControls /> : null}
      <UnderfloorRespawnTrigger characterRef={characterRef} />
      <ZoneManager characterRef={characterRef} />
    </>
  )
}

export default Experience
