import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  useXRControllerButtonEvent,
  useXRInputSourceState,
} from '@react-three/xr'
import * as THREE from 'three'

import { CharacterRef } from '@client/components/Character'
import StoreEntryExitTriggerArea from '@client/components/StoreEntryExitTriggerArea'
import { useShallow } from 'zustand/react/shallow'

import { vrStore } from '@client/contexts/VRStateContext'

import JewelleryDescription from './JewelleryDescription'
import JewelleryPromptUI from './JewelleryPromptUI'

type GroupWrapperProps = {
  position?: [number, number, number]
  rotation?: [number, number, number]
  children: React.ReactNode
  characterRef: React.MutableRefObject<CharacterRef | null>
}

function VRShowcaseHandler({
  children,
  position,
  rotation,
  characterRef,
}: GroupWrapperProps) {
  const groupRef = useRef<THREE.Group>(null)
  const triggerUIRef = useRef<THREE.Group>(null)
  const jewelleryDescriptionRef = useRef<THREE.Group>(null)
  const controllerRight = useXRInputSourceState('controller', 'right')
  const controllerLeft = useXRInputSourceState('controller', 'left')
  const [isResetTimerActivated, setIsResetTimerActivated] = useState(false)

  const rightThumbStick = controllerRight?.gamepad['xr-standard-thumbstick']
  const leftThumbStick = controllerLeft?.gamepad['xr-standard-thumbstick']

  const [isInsideTriggerArea, setIsInsideTriggerArea] = useState(false)
  const [isShowcaseMode, setIsShowcaseMode] = useState(false)

  const triggerPosition = useRef(new THREE.Vector3()).current
  const direction = useRef(new THREE.Vector3()).current

  const lastInputTimeRef = useRef(Date.now())
  const RESET_ITEM_TIME = 2000

  const rotationSpeed = 0.5
  const scalingSpeed = 0.4
  const maxScale = 5.0

  useXRControllerButtonEvent(controllerRight, 'b-button', (state) => {
    if (state === 'pressed') {
      if (isInsideTriggerArea) {
        setIsShowcaseMode(!isShowcaseMode)
        setUseVRLocomotion(!useVRLocomotion)
        setUseVRTeleportation(!useVRTeleportation)
      }
    }
  })

  const {
    isVRMode,
    useVRLocomotion,
    setUseVRLocomotion,
    useVRTeleportation,
    setUseVRTeleportation,
  } = vrStore(
    useShallow((state) => ({
      isVRMode: state.isVRMode,
      useVRLocomotion: state.useVRLocomotion,
      setUseVRLocomotion: state.setUseVRLocomotion,
      useVRTeleportation: state.useVRTeleportation,
      setUseVRTeleportation: state.setUseVRTeleportation,
    })),
  )

  const onInside = () => {
    setIsInsideTriggerArea(true)
  }

  const onOutside = () => {
    setIsInsideTriggerArea(false)
  }

  // Handles all the events during showcase mode, it includes scaling and rotation of jewellery
  const handleShowcaseModeInput = (delta: number) => {
    if (!groupRef.current) return
    if (rightThumbStick && (rightThumbStick.xAxis || rightThumbStick.yAxis)) {
      const deltaAngleX = delta * rightThumbStick.xAxis * rotationSpeed
      const deltaAngleY = -delta * rightThumbStick.yAxis * rotationSpeed

      const quaternionY = new THREE.Quaternion()
      quaternionY.setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaAngleX)

      const quaternionX = new THREE.Quaternion()
      quaternionX.setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaAngleY)

      groupRef.current.quaternion.premultiply(quaternionY)
      groupRef.current.quaternion.premultiply(quaternionX)
    }

    if (leftThumbStick) {
      const groupScale = groupRef.current.scale
      if (groupScale.x < 1) {
        groupRef.current.scale.set(1, 1, 1)
      } else if (groupScale.x < maxScale && leftThumbStick.yAxis) {
        const leftThumbStickY = -leftThumbStick.yAxis * delta
        groupRef.current.scale.set(
          groupScale.x + leftThumbStickY * scalingSpeed,
          groupScale.y + leftThumbStickY * scalingSpeed,
          groupScale.z + leftThumbStickY * scalingSpeed,
        )
      }
    }
  }

  // Resets the item to its original state if player havent interact for some time.
  const handleResetItem = (currentTime: number) => {
    if (!groupRef.current) return
    if (
      rightThumbStick?.xAxis !== 0 ||
      rightThumbStick?.yAxis !== 0 ||
      leftThumbStick?.yAxis !== 0
    ) {
      if (!isResetTimerActivated) {
        setIsResetTimerActivated(true)
      }
      lastInputTimeRef.current = currentTime
    } else if (
      isResetTimerActivated &&
      currentTime - lastInputTimeRef.current > RESET_ITEM_TIME
    ) {
      groupRef.current.rotation.set(0, 0, 0)
      groupRef.current.scale.set(1, 1, 1)
      lastInputTimeRef.current = currentTime
    }
  }

  useFrame((_, delta) => {
    if (!controllerRight) return

    if (isShowcaseMode && groupRef.current) {
      const currentTime = Date.now()
      handleShowcaseModeInput(delta)
      handleResetItem(currentTime)
    }

    // To rotate the UI so it will face the player directly.
    if (
      isInsideTriggerArea &&
      triggerUIRef.current &&
      jewelleryDescriptionRef.current &&
      characterRef.current
    ) {
      const characterPosition = characterRef.current.playerRef.current?.position
      triggerPosition.set(position?.[0] ?? 0, 0, position?.[2] ?? 0)
      direction.subVectors(
        characterPosition ?? new THREE.Vector3(),
        triggerPosition,
      )
      const angle = Math.atan2(direction.x, direction.z)

      if (!isShowcaseMode) {
        triggerUIRef.current.rotation.y = angle
      } else {
        jewelleryDescriptionRef.current.rotation.y = angle
      }
    }
  })

  if (!isVRMode) return null

  return (
    <>
      <group position={position} rotation={rotation} ref={groupRef}>
        {children}
      </group>
      <group
        position={position}
        visible={!isShowcaseMode && isInsideTriggerArea}
        ref={triggerUIRef}
      >
        <JewelleryPromptUI offset={[0, 1, 0]} />
      </group>
      <group
        visible={isShowcaseMode}
        position={position}
        ref={jewelleryDescriptionRef}
      >
        <JewelleryDescription offset={[-1, 0, -1]} />
      </group>
      <StoreEntryExitTriggerArea
        onInside={onInside}
        onOutside={onOutside}
        characterRef={characterRef}
        geometry={new THREE.CircleGeometry(10, 32)}
        transform={{
          position: [position?.[0] ?? 0, 2, position?.[2] ?? 0],
          rotation: [-Math.PI / 2, 0, 0],
          scale: [0.7, 0.7, 0.7],
        }}
        isVisible={false}
        keyId='VRShowcase'
      />
    </>
  )
}

export default VRShowcaseHandler
