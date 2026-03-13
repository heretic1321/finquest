import { Detailed, Gltf } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import { FrontSide, Vector3, VideoTexture } from 'three'
import { useControls } from 'leva'
import { create } from 'zustand'

import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { MapStore } from '@client/contexts/MapContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { MyPositionalAudio } from './shared/MyPositionalAudio'
import { SoundsStore } from './Sounds'

interface AudioConfigState {
  distance: number
}

const AudioConfigStore = create<AudioConfigState>(() => ({
  distance: 64.5
}))

const HorizontalScreening = () => {
  const isDebugMode = genericStore(state => state.isDebugMode)
  const details = MapStore(state => state.horizontalScreenDetails)
  const meshRef = useRef<THREE.Mesh>(null)
  const mainScreenDetailedRef = SoundsStore(state => state.mainScreenDetailedRef)

  // const texture0 = useTexture(staticResourcePaths.horizontalScreening[0])
  // const texture1 = useTexture(staticResourcePaths.horizontalScreening[1])
  // const texture2 = useTexture(staticResourcePaths.horizontalScreening[2])
  // const texture3 = useTexture(staticResourcePaths.horizontalScreening[3])
  // const texture4 = useTexture(staticResourcePaths.horizontalScreening[4])
  // const texture5 = useTexture(staticResourcePaths.horizontalScreening[5])

  // const [activeTexture, setActiveTexture] = useState<Texture | null>(null)
  // useEffect(() => {
  //   let interval: any = null
  //   if (
  //     texture0 != null &&
  //     texture1 != null &&
  //     texture2 != null &&
  //     texture3 != null &&
  //     texture4 != null &&
  //     texture5 != null
  //   ) {
  //     // all textures have been loaded.
  //     const textures = [texture0, texture1, texture2, texture3, texture4, texture5]

  //     const pickAnyRandomTextureAndApply = (textures: Texture[]) => {
  //       if (meshRef.current !== null && meshRef.current.visible) {
  //         const randomTexture = textures[Math.floor(Math.random() * textures.length)]
  //         randomTexture.wrapS = RepeatWrapping
  //         randomTexture.wrapT = RepeatWrapping
  //         randomTexture.repeat.y = 5
  //         randomTexture.needsUpdate = true
  
  //         if (activeTexture) {
  //           activeTexture.dispose()
  //         }
  //         setActiveTexture(randomTexture)
  //       } 
  //     }

  //     pickAnyRandomTextureAndApply(textures)
  //     interval = setInterval(() => {
  //       pickAnyRandomTextureAndApply(textures)
  //     }, 5000)
  //   }

  //   return () => {
  //     if (activeTexture) {
  //       activeTexture.dispose()
  //     }

  //     if (interval) {
  //       clearInterval(interval)
  //     }
  //   }
  // }, [
  //   texture0,
  //   texture1,
  //   texture2,
  //   texture3,
  //   texture4,
  //   texture5
  // ])

  const [videoTexture, setVideoTexture] = useState<
    VideoTexture | null
  >(null);
  const mainScreenVideoRef = SoundsStore(state => state.mainScreenVideoRef)
  const mainScreenAudioRef = SoundsStore(state => state.mainScreenAudioRef)

  useEffect(() => {
    const video = document.createElement('video');
    video.src = staticResourcePaths.bigScreenVideo;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.preload = 'auto';
    mainScreenVideoRef.current = video;
    
    video.oncanplaythrough = () => {
      const texture = new VideoTexture(video);
      texture.flipY = true;
      setVideoTexture(texture);
    };

    return () => {
      video.pause();
      video.src = '';
      video.load();
    };
  }, []);

  const previousVisibility = useRef<boolean>(false)
  const previousIsInsideStore = useRef<boolean>(false)
  

  useEffect(() => {
    const checkVisibility = () => {
      if (meshRef.current) {
        const isVisible = mainScreenDetailedRef.current?.getCurrentLevel() === 0;
        const isInsideStore = genericStore.getState().insideStore !== null;
        if (
          genericStore.getState().isAparupaVideoEnabled &&
          !genericStore.getState().isAparupaVideoPopupVisible &&
          (isVisible !== previousVisibility.current ||
            isInsideStore !== previousIsInsideStore.current)
        ) {
          if (isVisible && !isInsideStore) { 
            if(mainScreenVideoRef.current) {
              mainScreenVideoRef.current?.play().catch(console.error);
              mainScreenVideoRef.current!.muted = true;
              if (mainScreenAudioRef.current) {
                mainScreenAudioRef.current.play()
                SoundsStore.getState().stopBackgroundMusic()
              }
            }
            const material = meshRef.current.material as THREE.MeshBasicMaterial;
            material.opacity = 1;
            material.transparent = false;
          } else {
            mainScreenVideoRef.current?.pause();
            const material = meshRef.current.material as THREE.MeshBasicMaterial;
            material.opacity = 0;
            material.transparent = true;
            if (mainScreenAudioRef.current) {
              mainScreenAudioRef.current.pause();
              SoundsStore.getState().playBackgroundMusic()
            }
          }
        }
        if (
          !mainScreenAudioRef.current?.isPlaying &&
          !SoundsStore.getState().backgroundSoundRef.current?.playing() &&
          !genericStore.getState().isAparupaVideoPopupVisible &&
          document.hasFocus()
        ) {
          SoundsStore.getState().playBackgroundMusic()
        }
        previousVisibility.current = isVisible;
        previousIsInsideStore.current = isInsideStore;
      }
    };

    // Check periodically
    const interval = setInterval(checkVisibility, 500);
    return () => {
      clearInterval(interval);
      mainScreenVideoRef.current?.pause();
      mainScreenVideoRef.current!.src = '';
      mainScreenVideoRef.current?.load();
      if (mainScreenAudioRef.current && mainScreenAudioRef.current.isPlaying) {
        mainScreenAudioRef.current.stop();
      }
    };
  }, []);

  // useEffect(() => {
  //   if (
  //     isAparupaVideoEnabled
  //   ) {
  //     if (isAparupaVideoPopupVisible) {
  //       mainScreenVideoRef.current?.pause();
  //     } else {
  //       console.log('playing video')
  //       mainScreenVideoRef.current?.play();
  //       mainScreenVideoRef.current!.muted = false
  //     }
  //   }
  // }, [isAparupaVideoEnabled, isAparupaVideoPopupVisible]);
  
  const [position, setPosition] = useState<Vector3>()
  useEffect(() => {
    if (details.screenTransform !== null) {
      setPosition(
        details.screenTransform.position.multiplyScalar(MapStore.getState().mapScale)
      )
    }
    
  }, [details])

  useControls('Bigscreen Audio', () => ({
    distance: {
      value: AudioConfigStore.getState().distance,
      min: 0.0001,
      max: 100,
      step: 0.0001,
      onChange: (value: number) => {
        AudioConfigStore.setState({ distance: value })
      }
    }
  }), {
    collapsed: true,
    render: () => {
      return isDebugMode || false
    }
  })

  const audioDistance = AudioConfigStore(state => state.distance)
  // Debugging useEffect
  // useEffect(() => {
  //   const checkDetailLevel = () => {
  //     if (mainScreenDetailedRef.current) {
  //       console.log('Current detail level:', mainScreenDetailedRef.current.getCurrentLevel())
  //     }
  //   }
    
  //   const interval = setInterval(checkDetailLevel, 1000)
  //   return () => clearInterval(interval)
  // }, [])

  return (
    details.screenGeometry && (
      <Detailed
        ref={mainScreenDetailedRef}
        distances={[100, 250]}
        objects={null}
        position={position}
        rotation={details.screenTransform?.rotation}
      >
        <group>
          <mesh 
            scale={[1, -1, 1]}
            geometry={details.screenGeometry}
            ref={meshRef}
          >
            <meshBasicMaterial 
              map={videoTexture} 
              toneMapped={false} 
              side={FrontSide}
              transparent
            />
            <MyPositionalAudio
              url={staticResourcePaths.bigScreenAudio}
              distance={audioDistance}
              loop={true}
              autoplay={false}
              ref={mainScreenAudioRef}
            />
          </mesh>
        </group>
        <Gltf src={staticResourcePaths.dummyTriGltf} visible={false} />
      </Detailed>
    )
  )
}

export default HorizontalScreening
