import { Detailed, Gltf, useAnimations, useGLTF } from '@react-three/drei'
import { useEffect, useMemo, useRef } from "react"
import * as THREE from 'three'
import { staticResourcePaths } from "../config/staticResourcePaths"


interface DancingCharacterProps {
  avatarUrl: string;
  position: [number, number, number];
  animationUrl: string;
}

const DancingCharacters: React.FC = () => {
  const paramsForAvatar = "?quality=low&lod=2&textureSizeLimit=256&textureQuality=low&textureAtlas=256&textureFormat=webp&textureChannels=baseColor&useDracoMeshCompression=true"

  // Combine and shuffle avatar lists
  const allAvatars: string[] = [...staticResourcePaths.listOfMaleAvatars, ...staticResourcePaths.listOfFemaleAvatars]
  const shuffledAvatars = allAvatars.sort(() => Math.random() - 0.5).slice(0, 8)

  // Shuffle dance animations
  const shuffledAnimations = useMemo(() => {
    return [...staticResourcePaths.danceAnims].sort(() => Math.random() - 0.5)
  }, [])

  // Predefined positions for the characters with more space between them
  const positions: [number, number, number][] = [
    [-12, 0, 4],   // Left front
    [-4, 0, 4],    // Left middle front
    [4, 0, 4],     // Right middle front
    [12, 0, 4],    // Right front
    [-8, 0, -4],   // Left back
    [0, 0, -4],    // Middle back
    [8, 0, -4],    // Right back
    [0, 0, 8],     // Center front
  ]

  const groupRef = useRef<THREE.Group>(null)

  return (
    <>
      <Detailed
        distances={[100, 150]}
        objects={null}
        position={[
          -147.20270412380646,
          5.4608541173695695,
          -114.60062966167037
        ]}
        rotation={[0, 0.5779992706287995, 0]}
      >
        <group
          ref={groupRef}
        >
          {shuffledAvatars.map((avatarUrl, index) => (
            <DancingCharacter
              key={avatarUrl}
              avatarUrl={`${avatarUrl}${paramsForAvatar}`}
              position={positions[index]}
              animationUrl={shuffledAnimations[index]}
            />
          ))}
        </group>
        <Gltf src={staticResourcePaths.dummyTriGltf} visible={false} />
      </Detailed>
    </>
  )
}

const DancingCharacter: React.FC<DancingCharacterProps> = ({ avatarUrl, position, animationUrl }) => {
  const group = useRef<THREE.Group>(null)
  const { scene } = useGLTF(avatarUrl)

  const { animations } = useGLTF(animationUrl)
  useAnimations(animations, group)

  useEffect(() => {
    if (group.current && animations.length > 0) {
      const mixer = new THREE.AnimationMixer(group.current)

      animations.forEach(clip => {
        const filteredTracks = clip.tracks.filter(track => {
          const trackName = track.name.split('.')[0]
          return scene.getObjectByName(trackName)
        })

        const filteredClip = new THREE.AnimationClip(clip.name, clip.duration, filteredTracks)
        const action = mixer.clipAction(filteredClip)
        action.play()
      })

      const animateId = setInterval(() => mixer.update(1 / 60), 1000 / 60)

      return () => {
        clearInterval(animateId)
        mixer.stopAllAction()
      }
    }
  }, [scene, animations])

  return (
    <primitive
      object={scene}
      ref={group}
      position={position}
      scale={2}
    />
  )
}

export default DancingCharacters
