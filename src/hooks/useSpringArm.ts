import { useThree } from '@react-three/fiber'
import { MutableRefObject, useEffect, useRef } from 'react'
import * as THREE from 'three'

import { CameraControlsStore } from '@client/contexts/CameraControlsContext'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { MapStore } from '@client/contexts/MapContext'
import { CameraMode } from '@client/hooks/useCameraControls'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { AvatarStore } from '@client/contexts/AvatarAppearanceContext'

type SpringArmProps = {
  character: MutableRefObject<THREE.Group | null> | undefined
}

interface SpringArmZustandState {
  avoidEnvironmentCollisions: () => void
  setAvoidEnvironmentCollisions: (value: () => void) => void
  // isEnabled: boolean
}

export const useCameraSpringArmZustand = create<SpringArmZustandState>((set) => ({
  avoidEnvironmentCollisions: () => {},
  setAvoidEnvironmentCollisions: (value) => set(() => ({ avoidEnvironmentCollisions: value })),
  // isEnabled: false,
}))

const useSpringArm = (props: SpringArmProps) => {
  const { camera } = useThree()
  const isPinchOrScrollEventActive = GesturesAndDeviceStore((state) => state.isPinchOrScrollEventActive)
  const character = props.character
  const { collider, mapModel } = MapStore(
    useShallow((state) => ({
      collider: state.collider,
      mapModel: state.mapModel,
    })),
  )
  const raycaster = new THREE.Raycaster()
  
  // We don't wanna keep raycasting every frame as that really drains performance
  // We wanna raycast every Xms
  // So the below variables keep track of the last time we raycasted
  const lastRaycastTime = useRef<number>(Date.now())
  const rayCastingInterval = 10 //ms

  // These are the names of the meshes that are part of the character avatar
  // We're moving the camera to the last collision point of a structure that might be in
  // between the camera and the avatar.
  // We need to maintain a list of those objects which are a part of the avatar.
  // We don't wanna have the raycaster detect them as an obstacle between the camera and the avatar.
  // If it does, the camera will flicker, cause it will assume there's an obstacle between the camera and the avatar
  // whereas there is none!

  // For meshes, we're filtering them out using mesh names
  // And for other parts of avatar, we'll filter them out using skinned meshes
  const validCharacterMeshNames = [
    'characterRoundedBox',
    'characterDirectionMesh',
    'characterGroup',
    'raycastBox',
    'outerRaycastBox',
    'occludeRadiusBox',
  ]

  const areBoundsTreeComputed = useRef(false)
  const hasAvatarBeenSelected = AvatarStore((state) => state.hasAvatarBeenSelected)
  useEffect(() => {
    if (hasAvatarBeenSelected) {
      areBoundsTreeComputed.current = false
    } else {
      areBoundsTreeComputed.current = true
    }
  }, [hasAvatarBeenSelected])

  // This function is called every frame
  // It performs some basic check before starting raycasting.
  // If all checks pass, it raycasts from the camera to the avatar
  // If there's a collision with a non avatar part, it moves the camera to the last collision point
  // This way, the camera doesn't go through walls or other structures that might be in between the camera and the avatar
  const avoidEnvironmentCollisions = () => {
    // if (!useCameraSpringArmZustand.getState().isEnabled) return
    if (!props.character?.current) return
    if (Date.now() - lastRaycastTime.current <= rayCastingInterval) return

    const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
    if (_orbitControlsRef.current == null) return

    if (!CameraControlsStore.getState().isCameraMovingByAnyUserAction.current)
      return
    if (_orbitControlsRef.current.enabled === false) return
    if (
      isPinchOrScrollEventActive !== undefined &&
      isPinchOrScrollEventActive !== null &&
      isPinchOrScrollEventActive === true
    )
      return
    if (!character?.current) return
    if (!collider) return
    if (!mapModel) return
    if (CameraControlsStore.getState().cameraMode === CameraMode.FIRST_PERSON) return
    // raycast towards the avatar
    // If we find something between the camera and the avatar, we move the camera to the last collision point
    // If we don't find anything else between the camera and the avatar, we move the camera back to the
    // outer raycast mesh in a lerp fashion
    raycaster.set(
      camera.position,
      character.current.position.clone().sub(camera.position).normalize(),
    )
    raycaster.firstHitOnly = true
    let intersects = null
    let distanceFromRaycastBox = Infinity
    let newCameraPosition: THREE.Vector3 | null = null

    if (!areBoundsTreeComputed.current) {
      character.current?.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (!(child.geometry as THREE.BufferGeometry).boundsTree) {
            ;(child.geometry as THREE.BufferGeometry).computeBoundsTree()
          }
        }
      })
      areBoundsTreeComputed.current = true
    }
    
    intersects = raycaster.intersectObjects([collider, character.current], true)
    if (intersects != null && intersects.length > 0) {
      // store the distance of camera from raycast box everytime the raycaster hits the avatar
      // we'll use this to check if the camera is too close the avatar
      // and if it is, we'll hide the avatar
      for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object.name === 'raycastBox') {
          distanceFromRaycastBox = intersects[i].distance
          break
        }
        newCameraPosition = intersects[i].point
      }

      if (
        validCharacterMeshNames.indexOf(intersects[0].object.name) === -1 &&
        !(intersects[0].object instanceof THREE.SkinnedMesh)
      ) {
        // Something other than the avatar was hit, so move the camera to the last collision point
        // if (newCameraPosition) {
        //   camera.position.copy(newCameraPosition)
        // }
        camera.position.copy(intersects[0].point)

        // hide/unhide the avatar depending on whether the camera
        // is too close to the avatar or not
        if (distanceFromRaycastBox < 2) {
          props.character.current.visible = false
          if (newCameraPosition)
            newCameraPosition.y = character.current.position.y
        } else if (distanceFromRaycastBox >= 2) {
          props.character.current.visible = true
        }
      } else {
        // There is nothing else between the camera and the avatar, so move the camera back to the outer raycast box
        raycaster.set(
          camera.position,
          camera.position.clone().sub(character.current.position).normalize(),
        )
        raycaster.firstHitOnly = true
        intersects = raycaster.intersectObjects(
          [collider, character.current],
          true,
        )
        if (intersects != null && intersects.length > 0) {
          if (
            intersects[0].object.name === 'outerRaycastBox'
          ) {
            // (for some unknown reason), the camera keeps going up.
            // so while lerping we're trying to not lerp the  y direciton
            camera.position.lerp(
              new THREE.Vector3(
                intersects[0].point.x,
                camera.position.y,
                intersects[0].point.z,
              ),
              0.01,
            )
          }
        }

        // hide/unhide the avatar depending on whether the camera
        // is too close to the avatar or not
        if (distanceFromRaycastBox < 2) {
          props.character.current.visible = false
          if (newCameraPosition)
            newCameraPosition.y = character.current.position.y
        } else if (distanceFromRaycastBox >= 2) {
          props.character.current.visible = true
        }
      }
    }
    lastRaycastTime.current = Date.now()
  }

  return {
    avoidEnvironmentCollisions,
  }
}

export default useSpringArm
