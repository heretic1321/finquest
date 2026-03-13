import { CharacterRef } from "./components/Character";
import { GizmoHelper, GizmoViewport } from "@react-three/drei";
import DebugCube from "./utils/DebugCube";
import { genericStore } from "./contexts/GlobalStateContext";

function DebugEntities(props: {
  characterRef:  React.MutableRefObject<CharacterRef | null>
}) {
  const isDebugMode = genericStore((state) => state.isDebugMode)

  if (!isDebugMode) return null
  return (
    <>
      <GizmoHelper // taken from https://github.com/pmndrs/drei#gizmohelper
        alignment='bottom-right' // widget alignment within scene
        margin={[80, 80]} // widget margins (X, Y)
      >
        <GizmoViewport
          axisColors={['red', 'green', 'blue']}
          labelColor='black'
        />
      </GizmoHelper>
      <DebugCube characterRef={props.characterRef} />
    </>
  )
}

export default DebugEntities