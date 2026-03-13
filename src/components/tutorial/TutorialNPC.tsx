import { useGLTF } from '@react-three/drei'
import { GroupProps, Vector3 as TVector3, useFrame } from '@react-three/fiber'
import { MutableRefObject, useRef, useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { CharacterRef } from '@client/components/Character'
import { HUDStore } from '@client/contexts/HUDContext'
import { useShallow } from 'zustand/react/shallow'
import { genericStore } from '@client/contexts/GlobalStateContext'
import StoreEntryExitTriggerArea from '../StoreEntryExitTriggerArea'
import { BoxGeometry } from 'three'

type TTutorialNPCProps = {
  triggerButton?: string
  characterRef: MutableRefObject<CharacterRef | null>
  modelPath: string
  name?: string
  activationRadius?: TVector3
} & GroupProps

const TutorialNPC = ({
  triggerButton = 'e',
  characterRef,
  modelPath,
  name = 'Tutorial NPC',
  activationRadius = [2, 2, 2],
  ...props
}: TTutorialNPCProps) => {
  const [targetMesh, setTargetMesh] = useState<THREE.Mesh | null>(null)
  const { setIsTutorialPromptShown } = HUDStore(
    useShallow((state) => ({
      setIsTutorialPromptShown: state.setIsTutorialPromptShown,
    })),
  )
  const [lookAtPlayer, setLookAtPlayer] = useState(false)

  const npcRef = useRef<THREE.Group>(null)
  const geometry = useMemo(() => {
    return new BoxGeometry(1, 0.01, 1)
  }, [])
  // Update target when character ref changes
  useEffect(() => {
    if (characterRef.current?.roundedBoxRef.current) {
      setTargetMesh(characterRef.current.roundedBoxRef.current)
    }
  }, [characterRef.current?.roundedBoxRef.current])

  // Add this function to handle rotation
  const rotateToFaceCharacter = () => {
    if (!npcRef.current || !targetMesh) return

    const npcPosition = new THREE.Vector3()
    npcRef.current.getWorldPosition(npcPosition)

    const targetPosition = new THREE.Vector3()
    targetMesh.getWorldPosition(targetPosition)

    // Calculate direction to face
    const direction = targetPosition.sub(npcPosition)
    const angle = Math.atan2(direction.x, direction.z)

    // Apply rotation
    npcRef.current.rotation.y = angle
  }
  useFrame(() => {
    if (lookAtPlayer) {
      rotateToFaceCharacter()
    }
  })
  const npcTrigger = (enabled: boolean) => {
    if (!enabled) {
      genericStore.setState({ isTutorialNPCActive: enabled })
    }
    setIsTutorialPromptShown(enabled)
    setLookAtPlayer(enabled)
  }

  return (
    <group position={[1.0442127508526038, 1.4, 55.47191620341419]} scale={2}>
      <group>
        <StoreEntryExitTriggerArea
          keyId='rewardRedeemMachineTriggerArea'
          characterRef={characterRef}
          geometry={geometry}
          transform={{
            position: [0, 0.1, 0],
            rotation: [0, 0, 0],
            scale: [4, 1, 4],
          }}
          onInside={() => {
            npcTrigger(true)
          }}
          onOutside={() => {
            npcTrigger(false)
          }}
          transformControlsEnabled={false}
        />
        <group ref={npcRef} {...props}>
          <TestingNPC
            key={modelPath}
            modelUrl={modelPath}
            position={[0, 0, 0]}
          />
        </group>
      </group>
    </group>
  )
}
interface DancingCharacterProps {
  modelUrl: string
  position: [number, number, number]
}
const TestingNPC: React.FC<DancingCharacterProps> = ({
  modelUrl,
  position,
}) => {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF(modelUrl)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const actionsRef = useRef<{ [key: string]: THREE.AnimationAction }>({})
  const isNPCActive = genericStore((state) => state.isTutorialNPCActive)
  useEffect(() => {
    if (group.current && animations.length > 0) {
      const mixer = new THREE.AnimationMixer(group.current)
      mixerRef.current = mixer

      animations.forEach((clip) => {
        if (clip.name === 'Idle' || clip.name === 'Talk') {
          const filteredTracks = clip.tracks.filter((track) => {
            const trackName = track.name.split('.')[0]
            return scene.getObjectByName(trackName)
          })

          const filteredClip = new THREE.AnimationClip(
            clip.name,
            clip.duration,
            filteredTracks,
          )
          const action = mixer.clipAction(filteredClip)
          actionsRef.current[clip.name] = action
        }
      })

      const animateId = setInterval(() => {
        mixer.update(1 / 60)
      }, 1000 / 60)

      return () => {
        clearInterval(animateId)
        mixer.stopAllAction()
      }
    }
  }, [scene, animations])

  // Handle animation switching
  useEffect(() => {
    if (mixerRef.current && actionsRef.current) {
      // Stop all actions first
      Object.values(actionsRef.current).forEach((action) => action.stop())

      // Play the appropriate animation
      const currentAction = isNPCActive
        ? actionsRef.current['Talk']
        : actionsRef.current['Idle']

      if (currentAction) {
        currentAction.reset().play()
      }
    }
  }, [isNPCActive])

  return <primitive object={scene} ref={group} position={position} scale={1} />
}

export default TutorialNPC
