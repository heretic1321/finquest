import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext';
import { HUDStore } from '@client/contexts/HUDContext';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerConfigStore } from '../Character';
import { MeteorManagerStore, RewardMachineMode } from './MeteorManager';

interface LeaderboardMachineAdaptiveScreenProps {
  targetCameraPosition: THREE.Vector3 | [number, number, number];
  targetCameraRotation: THREE.Euler | [number, number, number];
  planeDistance: number;
  fov: number;
  coveragePercent?: number;
  transitionDuration?: number;
  model: THREE.Group;
}

const LeaderboardMachineAdaptiveScreen: React.FC<LeaderboardMachineAdaptiveScreenProps> = ({
  targetCameraPosition,
  targetCameraRotation,
  planeDistance,
  fov,
  transitionDuration = 1,
  model
}) => {
  const [coveragePercent, setCoveragePercent] = useState(0.45)

  const breakpoint = GesturesAndDeviceStore((state) => state.breakpoint)
  useEffect(() => {
    if (breakpoint === 'xs' || breakpoint === 'sm' || breakpoint === 'md') {
      setCoveragePercent(0.55)
    } else {
      setCoveragePercent(0.45)
    }
  }, [breakpoint])

  const planeRef = useRef<THREE.Mesh>(null)
  const { camera, viewport } = useThree()
  const [transitionProgress, setTransitionProgress] = useState(0)
  const leaderboardMachineMode = MeteorManagerStore((state) => state.leaderboardMachineMode)
  const initialCameraPositionRef = useRef(new THREE.Vector3())
  const initialCameraRotationRef = useRef(new THREE.Euler())
  const previousModeRef = useRef(leaderboardMachineMode)

  const targetPosition = new THREE.Vector3().copy(targetCameraPosition instanceof THREE.Vector3 ? targetCameraPosition : new THREE.Vector3(...targetCameraPosition))
  const targetRotation = new THREE.Euler().copy(targetCameraRotation instanceof THREE.Euler ? targetCameraRotation : new THREE.Euler(...targetCameraRotation))

  useEffect(() => {
    if (!planeRef.current) return;

    const direction = new THREE.Vector3(0, 0, -1).applyEuler(targetRotation)
    const planePosition = targetPosition.clone().add(direction.multiplyScalar(planeDistance))

    planeRef.current.position.copy(planePosition)
    planeRef.current.rotation.copy(targetRotation)

    const aspectRatio = viewport.width / viewport.height
    const planeHeight = 2 * Math.tan((fov * Math.PI / 360)) * planeDistance * coveragePercent
    const planeWidth = planeHeight * aspectRatio

    planeRef.current.scale.set(planeWidth, planeHeight, 1)

  }, [targetPosition, targetRotation, planeDistance, fov, viewport, coveragePercent])

  useEffect(() => {
    if (leaderboardMachineMode !== previousModeRef.current) {

      if (leaderboardMachineMode === RewardMachineMode.TRAVELLING_OUTSIDE_TO_INSIDE) {
        initialCameraPositionRef.current.copy(camera.position)
        initialCameraRotationRef.current.copy(camera.rotation)
        setTransitionProgress(0)
      } else if (leaderboardMachineMode === RewardMachineMode.TRAVELLING_INSIDE_TO_OUTSIDE) {
        setTransitionProgress(0)
      } else if (leaderboardMachineMode === RewardMachineMode.OUTSIDE) {
        HUDStore.setState({ isLeaderboardMachinePromptShown: true })
        PlayerConfigStore.getState().isPlayerParalysedRef.current = false
        HUDStore.setState({ isLeaderboardMachineScreenUIVisible: false });
      }

      previousModeRef.current = leaderboardMachineMode
    }
  }, [leaderboardMachineMode, camera])

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && leaderboardMachineMode === RewardMachineMode.INSIDE) {
        MeteorManagerStore.setState({ leaderboardMachineMode: RewardMachineMode.TRAVELLING_INSIDE_TO_OUTSIDE })
      }
    }

    window.addEventListener('keydown', handleEscapeKey)
    return () => {
      window.removeEventListener('keydown', handleEscapeKey)
    }
  }, [leaderboardMachineMode])

  useFrame((_, delta) => {
    if (leaderboardMachineMode === RewardMachineMode.TRAVELLING_OUTSIDE_TO_INSIDE ||
      leaderboardMachineMode === RewardMachineMode.TRAVELLING_INSIDE_TO_OUTSIDE) {
      const newProgress = Math.min(transitionProgress + delta / transitionDuration, 1)
      setTransitionProgress(newProgress)

      const isReturning = leaderboardMachineMode === RewardMachineMode.TRAVELLING_INSIDE_TO_OUTSIDE
      const startPos = isReturning ? targetPosition : initialCameraPositionRef.current
      const endPos = isReturning ? initialCameraPositionRef.current : targetPosition
      const startRot = isReturning ? targetRotation : initialCameraRotationRef.current
      const endRot = isReturning ? initialCameraRotationRef.current : targetRotation

      camera.position.lerpVectors(startPos, endPos, newProgress)

      const startQuaternion = new THREE.Quaternion().setFromEuler(startRot)
      const endQuaternion = new THREE.Quaternion().setFromEuler(endRot)
      const slerpedQuaternion = startQuaternion.slerp(endQuaternion, newProgress)
      camera.setRotationFromQuaternion(slerpedQuaternion)


      if (newProgress === 1) {
        MeteorManagerStore.setState({ leaderboardMachineMode: isReturning ? RewardMachineMode.OUTSIDE : RewardMachineMode.INSIDE })
      }
    }
  })

  return <>
    <primitive object={model} ref={planeRef} />

  </>
}

export default LeaderboardMachineAdaptiveScreen