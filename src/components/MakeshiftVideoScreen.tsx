import { useEffect, useRef, useState } from 'react';
import { staticResourcePaths } from "@client/config/staticResourcePaths";
// import { TransformControls } from "@react-three/drei";
import { VideoTexture } from 'three';
// import { CameraControlsStore } from '@client/contexts/CameraControlsContext';
import { genericStore } from '@client/contexts/GlobalStateContext';

const VideoScreen = () => {
  const [videoTexture, setVideoTexture] = useState<
    VideoTexture | null
  >(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = `${staticResourcePaths.s3_bucket_cdn}aparupa360.mp4`;
    video.crossOrigin = 'anonymous'; // This is crucial for CORS
    video.loop = true;
    video.muted = true; // Mute the video to allow autoplay
    videoRef.current = video;
    
    video.onloadeddata = () => {
      const texture = new VideoTexture(video);
      setVideoTexture(texture);
      video.play();
    };

    return () => {
      video.pause();
      video.src = '';
      video.load();
    };
  }, []);


  const isAparupaVideoEnabled = genericStore((state) => state.isAparupaVideoEnabled);
  const isAparupaVideoPopupVisible = genericStore((state) => state.isAparupaVideoPopupVisible);

  useEffect(() => {
    if (isAparupaVideoEnabled) {
      if (isAparupaVideoPopupVisible) {
        videoRef.current?.pause();
      } else {
        videoRef.current?.play();
        videoRef.current!.muted = false
      }
    }
  }, [isAparupaVideoEnabled, isAparupaVideoPopupVisible]);

  const meshRef = useRef<THREE.Mesh>(null);
  const [
    areTransformControlsEnabled, 
    // setAreTransformControlsEnabled
  ] = useState(false);

  const transformControlsRef = useRef<any>(null);
  // attach listeners to key press of 't' to toggle transform controls mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 't') {
        // cycle through translate, rotate, scale
        const modes = ['translate', 'rotate', 'scale'];
        const currentMode = transformControlsRef.current!.mode;
        const nextMode = modes[(modes.indexOf(currentMode) + 1) % modes.length];
        transformControlsRef.current.setMode(nextMode);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [areTransformControlsEnabled]);

  if (!videoTexture) return null;

  return (
    <>
    {/* {
      areTransformControlsEnabled && meshRef.current &&
      <TransformControls
        object={meshRef.current}
        mode={'translate'}
        ref={transformControlsRef}
        onMouseDown={() => {
          CameraControlsStore.getState().orbitControlsRef.current!.enabled = false
        }}
        onMouseUp={() => {
          CameraControlsStore.getState().orbitControlsRef.current!.enabled = true
          if (transformControlsRef.current.mode === 'translate') {
            console.log(meshRef.current!.position.toArray())
          } else if (transformControlsRef.current.mode === 'rotate') {
            console.log(meshRef.current!.rotation.toArray())
          } else if (transformControlsRef.current.mode === 'scale') {
            console.log(meshRef.current!.scale.toArray())
          }
        }}
      >
      </TransformControls>
    } */}
    <mesh 
     position={[
      -150.5375754372367,
      17.87094742099707,
      -131.00077559674605
  ]}
     scale={[
      2.9420733073758383,
      2.45309329651759,
      3.0237134107814176
  ]}
     ref={meshRef}
   > 
     <meshBasicMaterial map={videoTexture} toneMapped={false} />
     <planeGeometry args={[16, 9]} />
   </mesh>
    </>
  );
};

export default VideoScreen;