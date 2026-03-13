import useWorldStore from './stores/worldStore'
import useMap from './hooks/useMap'
import Water from './components/Water'
// Agent 2 components — stubbed until Agent 2 creates them
// import Character from './components/Character'
// import CameraFollowCharacter from './components/CameraFollowCharacter'
// import SpringArm from './components/SpringArm'

function MapLoader() {
  useMap()
  return null
}

function CharacterDependentComponents() {
  const isReady = useWorldStore((s) => s.isCharacterRefReady)
  if (!isReady) return null

  return (
    <>
      {/* <SpringArm /> */}
      {/* <CameraFollowCharacter /> */}
    </>
  )
}

export default function Experience() {
  const collider = useWorldStore((s) => s.collider)

  return (
    <>
      <MapLoader />
      <Water />
      {collider && (
        <>
          {/* <Character /> — Agent 2 will provide this */}
          <CharacterDependentComponents />
        </>
      )}
    </>
  )
}
