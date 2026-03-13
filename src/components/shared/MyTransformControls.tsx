import { CameraControlsStore } from '@client/contexts/CameraControlsContext';
import { genericStore } from '@client/contexts/GlobalStateContext';
import { TransformControls } from '@react-three/drei';
import { RefObject, useEffect, useRef, useState } from 'react';
import { TransformControls as TransformControlsType } from 'three-stdlib';

const MyTransformControls = ({ objectRef }: {
  objectRef: RefObject<any>
}) => {
  const transformControls = useRef<TransformControlsType | null>(null);
  const [mode, setMode] = useState<
    'translate' | 'rotate' | 'scale'
  >('translate');

  const [isEnabled, setIsEnabled] = useState(false);
  useEffect(() => {
    const handleEnableKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'p') {
        setIsEnabled((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleEnableKeyDown);
    return () => window.removeEventListener('keydown', handleEnableKeyDown);
  }, []);

  // Cycle through modes when 't' key is pressed
  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === 't') {
        setMode((prevMode) => {
          if (prevMode === 'translate') return 'rotate';
          if (prevMode === 'rotate') return 'scale';
          return 'translate';
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isDebugMode = genericStore((state) => state.isDebugMode);

  return (
    <>
      {
        isEnabled &&
        objectRef.current && 
        isDebugMode &&
        <TransformControls
          ref={transformControls}
          mode={mode}
          object={objectRef.current}
          onMouseDown={() => {
            CameraControlsStore.getState().orbitControlsRef.current!.enabled = false
          }}
          onMouseUp={() => {
            CameraControlsStore.getState().orbitControlsRef.current!.enabled = true

            console.log({
              position: objectRef.current?.position.toArray(),
              rotation: objectRef.current?.rotation.toArray(),
              scale: objectRef.current?.scale.toArray(),
              name: objectRef.current?.name
            })
          }}
        />
      }
    </>
  );
};

export default MyTransformControls;