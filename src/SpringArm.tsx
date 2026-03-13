import useSpringArm from "./hooks/useSpringArm";
import { useFrame } from "@react-three/fiber";
import { CharacterRef } from "./components/Character";
import { genericStore } from "./contexts/GlobalStateContext";

function SpringArm(props: {
  characterRef:  React.MutableRefObject<CharacterRef | null>
}) {
  const { avoidEnvironmentCollisions } = useSpringArm({character: props.characterRef.current?.playerRef })
  useFrame(() => {
    if (!genericStore.getState().isTabFocused) return
    if(genericStore.getState().isTutorialEnabled) return
    avoidEnvironmentCollisions()
  })
  return null
}

export default SpringArm