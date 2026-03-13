import { CharacterRef } from "../Character"
import MeteorManager from "./MeteorManager"

const MiningManager = (props: {
  characterRef:  React.MutableRefObject<CharacterRef | null>
}) => {
  return <>
    <MeteorManager characterRef={props.characterRef} />
  </>
}

export default MiningManager