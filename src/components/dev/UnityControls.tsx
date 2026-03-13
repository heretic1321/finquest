import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { genericStore } from '@client/contexts/GlobalStateContext';

const UnityControls: React.FC = () => {
  const { camera, gl } = useThree();
  const mouseSensitivity = 0.002;
  const rollSensitivity = 0.02; // New: Sensitivity for camera roll

  const keysPressed = useRef({ w: false, s: false, a: false, d: false, q: false, e: false, z: false, x: false });
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const isLocked = useRef(false);
  
  // Get the control states from the genericStore
  const unityLikeControlsEnabled = genericStore((state) => state.unityLikeControlsEnabled);
  const cameraSpeed = genericStore((state) => state.unityLikeControlsCameraSpeed);

  useEffect(() => {
    const canvas = gl.domElement;

    const onMouseMove = (event: MouseEvent) => {
      if (!isLocked.current) return;

      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      euler.current.y -= movementX * mouseSensitivity;
      euler.current.x -= movementY * mouseSensitivity;

      euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));

      camera.quaternion.setFromEuler(euler.current);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (['w', 's', 'a', 'd', 'q', 'e', 'z', 'x'].includes(event.key.toLowerCase())) {
        keysPressed.current[event.key.toLowerCase() as keyof typeof keysPressed.current] = true;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (['w', 's', 'a', 'd', 'q', 'e', 'z', 'x'].includes(event.key.toLowerCase())) {
        keysPressed.current[event.key.toLowerCase() as keyof typeof keysPressed.current] = false;
      }
    };

    const onPointerLockChange = () => {
      isLocked.current = document.pointerLockElement === canvas;
    };

    const onPointerLockError = () => {
      console.error('Pointer lock error');
    };

    const lockPointer = () => {
      if (genericStore.getState().unityLikeControlsEnabled) {
        canvas.requestPointerLock();
      }
    };

    if (genericStore.getState().unityLikeControlsEnabled) {
      canvas.addEventListener('click', lockPointer);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('keydown', onKeyDown);
      document.addEventListener('keyup', onKeyUp);
      document.addEventListener('pointerlockchange', onPointerLockChange);
      document.addEventListener('pointerlockerror', onPointerLockError);
    }

    return () => {
      canvas.removeEventListener('click', lockPointer);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('pointerlockerror', onPointerLockError);

      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      }
    };
  }, [camera, gl, mouseSensitivity, unityLikeControlsEnabled]);

  useFrame(() => {
    if (!isLocked.current || !unityLikeControlsEnabled) return;

    const moveVector = new THREE.Vector3();

    if (keysPressed.current.w || keysPressed.current.s) {
      moveVector.z = keysPressed.current.s ? cameraSpeed : -cameraSpeed;
    }
    if (keysPressed.current.a || keysPressed.current.d) {
      moveVector.x = keysPressed.current.d ? cameraSpeed : -cameraSpeed;
    }
    if (keysPressed.current.q || keysPressed.current.e) {
      moveVector.y = keysPressed.current.e ? cameraSpeed : -cameraSpeed;
    }

    moveVector.applyQuaternion(camera.quaternion);
    camera.position.add(moveVector);

    // New: Handle camera roll
    if (keysPressed.current.z || keysPressed.current.x) {
      const rollAngle = keysPressed.current.z ? rollSensitivity : -rollSensitivity;
      const rollQuaternion = new THREE.Quaternion().setFromAxisAngle(camera.getWorldDirection(new THREE.Vector3()), rollAngle);
      camera.quaternion.multiply(rollQuaternion);
    }
  });

  return null;
};

export default UnityControls;