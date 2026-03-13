import { useFrame } from "@react-three/fiber";
import { CharacterRef } from "./components/Character";
import { CameraControlsStore } from "./contexts/CameraControlsContext";
import { genericStore } from "./contexts/GlobalStateContext";

function CameraFollowCharacter(props: {
  characterRef:  React.MutableRefObject<CharacterRef | null>
}) {
  const makeCameraFollowCharacter = CameraControlsStore.getState().makeCameraFollowCharacter
  
  useFrame(() => {
    if (!genericStore.getState().isTabFocused) return
    if (props.characterRef.current?.playerRef) {
      makeCameraFollowCharacter(
        props.characterRef.current?.playerRef,
      )
    }
  })
  return null
}

export default CameraFollowCharacter