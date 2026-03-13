import { useEffect, useRef, useState } from "react"
import { CharacterRef, PlayerConfigStore } from "./Character"
import JewelleryShowcaseTriggerArea from "./JewelleryShowcaseTriggerArea"

const UnderfloorRespawnTrigger = (
  props: {
    characterRef: React.MutableRefObject<CharacterRef | null>
  }
) => {

  const [isRoundedBoxRefAvailable, setIsRoundedBoxRefAvailable] = useState(false)
  const intervalRef = useRef<NodeJS.Timer | null>(null)
  useEffect(() => {
    const checkIfRoundedBoxRefAvailable = () => {
      if (props.characterRef.current?.roundedBoxRef.current) {
        setIsRoundedBoxRefAvailable(true)
        clearInterval(intervalRef.current as NodeJS.Timer)
      }
    }

    intervalRef.current = setInterval(checkIfRoundedBoxRefAvailable, 10)
  }, [])

  return (
    <>
      {
        isRoundedBoxRefAvailable && 
        <JewelleryShowcaseTriggerArea
            // _id={props._id}
            target={
              props.characterRef.current?.roundedBoxRef.current
                ? props.characterRef.current?.roundedBoxRef.current
                : null
            }
            name={'gettingStuckTrigger'}
            radiusX={4}
            radiusY={4}
            rotationY={0}
            position={
              [
                -3.5444862890009694,
                0.9134667166851052,
                64.71945640785457
              ]
            }
            // position={
            //   [
            //     -3.5444862890009694,
            //     1.174325890549364, // below
            //     // 1.374325890549364, // above
            //     64.71945640785457
            //   ]
            // }
            scale={
              [
                6.25860636036636,
                10.236938594264979,
                6.25860636036636
              ]
            }
            onInside={() => {
              // console.log('inside')
              PlayerConfigStore.getState().resetFn?.()
            }}
            onOutside={() => {
              // console.log('outside')
  
            }}  
            // for dev mode to adjust the triggger areas
  
            // areTransformControlsShown={true}
            // transformControlsMode={'translate'}
            // transformControlsSelectionId={'gettingStuckTrigger'}
            // tempPositionReference={tempPositionReference}
            // tempRadiusXReference={tempRadiusXReference}
            // tempRadiusYReference={tempRadiusYReference}
            // tempRotationYReference={tempRotationYReference}
          />
      }
    </>
  )
}

export default UnderfloorRespawnTrigger