import { useEffect, useRef, useState } from 'react'
import { Euler, ShaderMaterial, Vector3 } from 'three'

import { useControls } from 'leva'

import { CharacterRef } from '@client/components/Character'
import TriggerArea from '@client/components/TriggerArea'
import { TPortalConfig } from '@client/config/MapConfig'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { MapStore } from '@client/contexts/MapContext'
import { cleanupResources } from '@client/utils/helperFunctions'
import { useShallow } from 'zustand/react/shallow'
import { HUDStore } from '@client/contexts/HUDContext'

type TPortalEntryConfig = {
  characterRef?: React.MutableRefObject<CharacterRef | null>
  buildingName: string
  portalConfig: TPortalConfig
  portalResetTime: number
  onEnterPortal?: (
    isPortalInCooldown: boolean,
    buildingName: string,
    exitBuildingName: string,
  ) => void
  portalMat: ShaderMaterial
  uniqueIdentifier: string
}

const PortalEntry = ({
  characterRef,
  buildingName,
  portalConfig = {
    portalName: 'Default',
    position: [0, 0, 10],
    rotation: [0, 0, 0],
    scale: [2, 2, 2],
    exitPosition: [10, 10, 10],
    exitBuildingName: 'null',
  },
  portalResetTime = 5000,
  onEnterPortal,
  portalMat,
  uniqueIdentifier

}: TPortalEntryConfig) => {
  const { portalBoundaryMesh, portalCircleGeometry } = MapStore(
    useShallow((state) => ({
      portalBoundaryMesh: state.portalBoundaryMesh,
      portalCircleGeometry: state.portalCircleGeometry,
    })),
  )

  const portalRef = useRef<THREE.Mesh>(null)
  // const portalMaterial = useRef<THREE.ShaderMaterial>(null)

  const portalPos = useRef<Vector3 | null>(null)
  const portalDir = useRef<Vector3 | null>(null)

  const [portalConfiguration, setPortalConfiguration] = useState(portalConfig)
  const isDebugMode = genericStore((state) => state.isDebugMode)
  const havePortalsCooledDown = genericStore((state) => state.havePortalsCooledDown)

  const onPlayerExitCollision = () => {
    HUDStore.setState({
      showEnterPortalPrompt: null
    })
  }

  const onPlayerEnterCollision = () => {
    if (!havePortalsCooledDown || !portalRef.current || !characterRef) return

    // portal's position and direction has not been set, setting them
    if (portalDir.current == null) 

    if (!portalDir.current || !portalPos.current) {
        portalDir.current = portalRef.current.getWorldDirection(new Vector3())
        portalPos.current = portalRef.current.localToWorld(new Vector3())
    }

    const playerPos = characterRef.current?.playerRef.current?.position
    const normalizedDirectionFromPlayerToPortal = playerPos
      ? new Vector3(
          portalPos.current!.x - playerPos.x,
          portalPos.current!.y - playerPos.y,
          portalPos.current!.z - playerPos.z,
        ).normalize()
      : new Vector3()

    const isPlayerInFront =
      portalDir.current!.dot(normalizedDirectionFromPlayerToPortal) > 0
    
    if (!isPlayerInFront) return

    HUDStore.setState({
      showEnterPortalPrompt: uniqueIdentifier
    })
  }

  const actuallyTeleport = () => {
    if (!characterRef) return

    if (onEnterPortal)
      onEnterPortal(false, buildingName, portalConfig.exitBuildingName)

    if (characterRef.current?.playerRef.current) {
      const exitPortalPos = new Vector3().fromArray(
        portalConfiguration.exitPosition,
      )
      characterRef.current.playerRef.current.position.set(
        exitPortalPos.x,
        exitPortalPos.y,
        exitPortalPos.z,
      )
    }

    if (onEnterPortal) {
      setTimeout(() => {
        onEnterPortal(true, buildingName, portalConfig.exitBuildingName)
      }, portalResetTime)
    }

    cleanupResources(portalRef.current)
    // cleanupResources(portalMaterial.current)
    cleanupResources(portalMat)
    cleanupResources(clonedPortalBoundaryMesh ?? null)
    cleanupResources(portalBoundaryMesh ?? null)
  }

  const enterPortalPromptActivated = HUDStore((state) => state.enterPortalPromptActivated)
  useEffect(() => {
    if (enterPortalPromptActivated == null) return
    if (enterPortalPromptActivated != uniqueIdentifier) return

    actuallyTeleport()
    HUDStore.setState({ enterPortalPromptActivated: null })
  }, [enterPortalPromptActivated])

  
  // useFrame((_, delta) => {
  //   if (portalMaterial.current) {
  //     portalMaterial.current.uniforms.uTime.value += delta
  //     portalMaterial.current.needsUpdate = true // Ensure the material knows it needs an update
  //   }
  // })

  // useControls(
  //   'Portal Material',
  //   () => ({
  //     uColorStart: {
  //       value: '#6CCBFF',
  //       onChange: (value: string) =>
  //         portalMaterial.current?.uniforms.uColorStart.value.set(value),
  //     },
  //     uColorEnd: {
  //       value: '#ffffff',
  //       onChange: (value: string) =>
  //         portalMaterial.current?.uniforms.uColorEnd.value.set(value),
  //     },
  //   }),
  //   {
  //     collapsed: true,
  //     render: () => {
  //       return isDebugMode || false
  //     },
  //   }
  // )

  const position = useRef(new Vector3()).current
  const rotation = useRef(new Euler()).current
  const scale = useRef(new Vector3()).current

  useControls(
    `${portalConfig.portalName}`,
    () => ({
      position: {
        value: portalConfiguration.position,
        step: 0.01,
        onChange: (value: [number, number, number]) =>
          setPortalConfiguration((prevState) => ({
            ...prevState,
            position: value,
          })),
      },
      rotation: {
        value: portalConfiguration.rotation,
        onChange: (value: [number, number, number]) =>
          setPortalConfiguration((prevState) => ({
            ...prevState,
            rotation: value,
          })),
      },
      scale: {
        value: portalConfiguration.scale,
        onChange: (value: [number, number, number]) =>
          setPortalConfiguration((prevState) => ({
            ...prevState,
            scale: value,
          })),
      },
      exitPosition: {
        value: portalConfiguration.exitPosition,
        onChange: (value: [number, number, number]) =>
          setPortalConfiguration((prevState) => ({
            ...prevState,
            exitPosition: value,
          })),
      },
    }),
    {
      collapsed: true,
      render: () => {
        return isDebugMode || false
      },
    },
  )

  const [clonedPortalBoundaryMesh, setClonedPortalBoundaryMesh] =
    useState<THREE.Group>()

  useEffect(() => {
    if (portalBoundaryMesh) {
      const clonedMesh = portalBoundaryMesh.clone()
      setClonedPortalBoundaryMesh(clonedMesh)
    }
  }, [portalBoundaryMesh])

  return (
    (portalCircleGeometry && clonedPortalBoundaryMesh && (
      <>
        <group
          position={position.fromArray(portalConfiguration.position)}
          rotation={rotation.fromArray(portalConfiguration.rotation)}
          scale={scale.fromArray([
            portalConfiguration.scale[0] * 0.7, 
            portalConfiguration.scale[1] * 0.7,
            portalConfiguration.scale[2] * 0.7
          ])}
        >
          <mesh
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            geometry={portalCircleGeometry}
            material={portalMat}
          >
            {/* <shaderMaterial
              attach='material'
              args={[ColorShiftMaterial]}
              ref={portalMaterial}
            /> */}
          </mesh>
          <primitive
            position={[0, 0, 0]}
            rotation={[0, -Math.PI, 0]}
            object={clonedPortalBoundaryMesh}
          />
          <mesh
            position={[0, 2, 0]}
            scale={[2.5, 4, 0.2]}
            rotation={[0, -Math.PI, 0]}
            ref={portalRef}
          >
            <TriggerArea
              name='portal'
              type='box'
              target={
                characterRef && characterRef.current?.roundedBoxRef.current
                  ? characterRef.current?.roundedBoxRef.current
                  : null
              }
              onEnter={onPlayerEnterCollision}
              onExit={onPlayerExitCollision}
              scale={[2, 2, 2]}
            />
          </mesh>
        </group>
        {isDebugMode && (
          <mesh position={portalConfiguration.exitPosition}>
            <sphereGeometry />
            <meshStandardMaterial color={'red'} />
          </mesh>
        )}
      </>
    )) || <></>
  )
}

export default PortalEntry
