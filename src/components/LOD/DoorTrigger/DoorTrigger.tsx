import { useEffect, useState } from 'react'
import { BufferGeometry } from 'three'

import { useControls } from 'leva'

import { CharacterRef } from '@client/components/Character'
import TriggerArea from '@client/components/TriggerArea'
import { TDoorTriggerTransform } from '@client/config/MapConfig'
import { TransformLite } from '@client/utils/commonTypes'
import { genericStore } from '@client/contexts/GlobalStateContext'

export type TDoorTriggerProps = {
  buildingName: string
  characterRef: React.MutableRefObject<CharacterRef | null>
  frontDoorTransform?: TDoorTriggerTransform
  backDoorTransform?: TDoorTriggerTransform
  onEnterDoor?: (buildingName: string) => void
  onExitDoor?: (buildingName: string) => void
  hasTeleportedInside: boolean
  entryGateCustomGeometry: BufferGeometry | null
  exitGateCustomGeometry: BufferGeometry | null
  entryGateTransform?: TransformLite
  exitGateTransform?: TransformLite
}

function DoorTrigger({
  buildingName = 'default',
  characterRef,
  onEnterDoor,
  onExitDoor,
  hasTeleportedInside,
  entryGateCustomGeometry,
  exitGateCustomGeometry,
  entryGateTransform = {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  },
  exitGateTransform = {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  },
}: TDoorTriggerProps) {
  const [displayEntryTrigger, setDisplayEntryTrigger] = useState(false)
  const [displayExitTrigger, setDisplayExitTrigger] = useState(false)

  //Two triggers are used to detect if a player is entering or exiting
  //If player triggers the second trigger after triggering the first trigger
  //it means they are entering inside building, if the first trigger is
  //activated after second that means player is exiting.
  //Entry Trigger
  const [passedFirstTrigger, setPassedFirstTrigger] = useState(false)
  //Exit Trigger
  const [passedSecondTrigger, setPassedSecondTrigger] = useState(false)
  //Player is Inside of building or not
  const [isInside, setIsInside] = useState(false)

  const isDebugMode = genericStore((state) => state.isDebugMode)

  function onPlayerEnterFirstGate() {
    if (passedSecondTrigger) setIsInside(false)
    setPassedFirstTrigger(true)
  }

  function onPlayerExitFirstGate() {
    setPassedSecondTrigger(false)
  }

  function onPlayerEnterSecondGate() {
    if (passedFirstTrigger) setIsInside(true)
    setPassedSecondTrigger(true)
  }

  function onPlayerExitSecondGate() {
    setPassedFirstTrigger(false)
  }

  function onPlayerEnter() {
    if (onEnterDoor) onEnterDoor(buildingName)
  }
  function onPlayerExit() {
    if (onExitDoor) onExitDoor(buildingName)
    setIsInside(false)
    setPassedSecondTrigger(false)
    setPassedFirstTrigger(false)
  }

  useEffect(() => {
    if (isInside && !hasTeleportedInside) onPlayerEnter()
    else if (!isInside) onPlayerExit()
  }, [isInside])

  useEffect(() => {
    if (!hasTeleportedInside) {
      setIsInside(false)
      return
    }
    setPassedSecondTrigger(true)
    setPassedFirstTrigger(false)
    setIsInside(true)
  }, [hasTeleportedInside])

  useControls(
    `${buildingName} Front Door`,
    () => ({
      displayEntryTrigger: {
        value: displayEntryTrigger,
        onChange: (value: boolean) => setDisplayEntryTrigger(value),
      },
    }),
    {
      collapsed: true,
      render: () => {
        return isDebugMode || false
      },
    },
  )

  useControls(
    `${buildingName} Back Door`,
    () => ({
      displayExitTrigger: {
        value: displayExitTrigger,
        onChange: (value: boolean) => setDisplayExitTrigger(value),
      },
    }),
    {
      collapsed: true,
      render: () => {
        return isDebugMode || false
      },
    },
  )

  return (
    <>
      {entryGateCustomGeometry && (
        <TriggerArea
          name={`${buildingName} interiorEntryDoor`}
          type='customGeometry'
          geometry={entryGateCustomGeometry}
          target={
            characterRef.current?.roundedBoxRef.current
              ? characterRef.current?.roundedBoxRef.current
              : null
          }
          onEnter={onPlayerEnterFirstGate}
          onExit={onPlayerExitFirstGate}
          color='green'
          position={entryGateTransform.position}
          scale={entryGateTransform.scale}
          rotation={entryGateTransform.rotation}
        />
      )}
      {exitGateCustomGeometry && (
        <TriggerArea
          name={`${buildingName} interiorExitDoor`}
          type='customGeometry'
          geometry={exitGateCustomGeometry}
          target={
            characterRef.current?.roundedBoxRef.current
              ? characterRef.current?.roundedBoxRef.current
              : null
          }
          onEnter={onPlayerEnterSecondGate}
          onExit={onPlayerExitSecondGate}
          color='red'
          position={exitGateTransform.position}
          scale={exitGateTransform.scale}
          rotation={exitGateTransform.rotation}
        />
      )}
    </>
  )
}

export default DoorTrigger
