import {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import { useGraph } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTF } from 'three-stdlib'
import { SkeletonUtils } from 'three-stdlib'

import { AvatarOptions, SkinColorOptions } from '@client/config/Avatar'

type GLTFResult = GLTF & {
  nodes: {
    EyeLeft: THREE.SkinnedMesh
    EyeRight: THREE.SkinnedMesh
    Wolf3D_Body: THREE.SkinnedMesh
    Wolf3D_Hair: THREE.SkinnedMesh
    Wolf3D_Head: THREE.SkinnedMesh
    Wolf3D_Outfit_Bottom: THREE.SkinnedMesh
    Wolf3D_Outfit_Footwear: THREE.SkinnedMesh
    Wolf3D_Outfit_Top: THREE.SkinnedMesh
    Wolf3D_Teeth: THREE.SkinnedMesh
    Hips: THREE.Bone
  }
  materials: {
    ['Wolf3D_Eye.001']: THREE.MeshStandardMaterial
    ['Wolf3D_Body.001']: THREE.MeshStandardMaterial
    ['Wolf3D_Hair.001']: THREE.MeshStandardMaterial
    ['Wolf3D_Skin.001']: THREE.MeshStandardMaterial
    ['Wolf3D_Outfit_Bottom.001']: THREE.MeshStandardMaterial
    ['Wolf3D_Outfit_Footwear.001']: THREE.MeshStandardMaterial
    ['Wolf3D_Outfit_Top.001']: THREE.MeshStandardMaterial
    Wolf3D_Teeth: THREE.MeshStandardMaterial
  }
}

type nodesType = {
  [name: string]: THREE.Object3D<THREE.Event>
} & GLTFResult['nodes']

export interface AvatarModelRef {
  animationActions: Record<string, THREE.AnimationAction | null>
}
type AvatarModelProps = JSX.IntrinsicElements['group'] & { skinColor: string }

const AVATAR_CONFIG = AvatarOptions.may

const May: ForwardRefRenderFunction<AvatarModelRef, AvatarModelProps> = (
  { skinColor = SkinColorOptions.fair, ...props },
  ref,
) => {
  const group = useRef<THREE.Group | null>(null)
  const {
    scene: sceneBeforeCloning,
    materials: materials,
    animations: animations,
  } = useGLTF(AVATAR_CONFIG.gltfFilePath) as GLTFResult

  const scene = useMemo(
    () => SkeletonUtils.clone(sceneBeforeCloning),
    [sceneBeforeCloning],
  )
  const graphOutput = useGraph(scene)
  const nodes = graphOutput.nodes as nodesType
  const { actions } = useAnimations<THREE.AnimationClip>(animations, group)

  useImperativeHandle(ref, () => ({
    animationActions: actions,
  }))

  return (
    <group
      ref={group}
      {...props}
      dispose={null}
      scale={AVATAR_CONFIG.scale}
      position={AVATAR_CONFIG.position}
      rotation={AVATAR_CONFIG.rotation}
    >
      <group name='Scene'>
        <group name='Armature'>
          <primitive object={nodes.Hips} />
          <skinnedMesh
            name='EyeLeft'
            geometry={nodes.EyeLeft.geometry}
            material={materials['Wolf3D_Eye.001']}
            skeleton={nodes.EyeLeft.skeleton}
            morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
            morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
          />
          <skinnedMesh
            name='EyeRight'
            geometry={nodes.EyeRight.geometry}
            material={materials['Wolf3D_Eye.001']}
            skeleton={nodes.EyeRight.skeleton}
            morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
            morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
          />
          <skinnedMesh
            name='Wolf3D_Head'
            geometry={nodes.Wolf3D_Head.geometry}
            material={
              new THREE.MeshStandardMaterial({
                color: skinColor,
                map: materials['Wolf3D_Skin.001'].map,
              })
            }
            skeleton={nodes.Wolf3D_Head.skeleton}
            morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
            morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
          />
          <skinnedMesh
            name='Wolf3D_Body'
            geometry={nodes.Wolf3D_Body.geometry}
            material={
              new THREE.MeshStandardMaterial({
                color: skinColor,
                map: materials['Wolf3D_Body.001'].map,
              })
            }
            skeleton={nodes.Wolf3D_Body.skeleton}
          />
          <skinnedMesh
            name='Wolf3D_Hair'
            geometry={nodes.Wolf3D_Hair.geometry}
            material={materials['Wolf3D_Hair.001']}
            skeleton={nodes.Wolf3D_Hair.skeleton}
          />
          <skinnedMesh
            name='Wolf3D_Outfit_Bottom'
            geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
            material={materials['Wolf3D_Outfit_Bottom.001']}
            skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
          />
          <skinnedMesh
            name='Wolf3D_Outfit_Top'
            geometry={nodes.Wolf3D_Outfit_Top.geometry}
            material={materials['Wolf3D_Outfit_Top.001']}
            skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
          />
          <skinnedMesh
            name='Wolf3D_Teeth'
            geometry={nodes.Wolf3D_Teeth.geometry}
            material={materials.Wolf3D_Teeth}
            skeleton={nodes.Wolf3D_Teeth.skeleton}
            morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
            morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
          />
          <skinnedMesh
            name='Wolf3D_Outfit_Footwear'
            geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
            material={materials['Wolf3D_Outfit_Footwear.001']}
            skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
          />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload(AVATAR_CONFIG.gltfFilePath)

export default forwardRef(May)
