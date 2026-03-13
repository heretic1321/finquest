import {
  createRef,
  forwardRef,
  ForwardRefRenderFunction,
  MutableRefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { RoundedBox } from '@react-three/drei'
import { GroupProps, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls as OrbitControlsType } from 'three-stdlib'

import Avatar from '@client/components/Avatar'
import { MeteorManagerStore } from '@client/components/MeteorMining/MeteorManager'
import { button, useControls } from 'leva'
import { damp } from 'maath/easing'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import { Player } from '@server/rooms/schema/MyRoomState'
import { AnimationStates } from '@server/utils/types'

import NameTag from '@client/components/Character/NameTag'
import { AuthAPIStore } from '@client/contexts/AuthContext'
import {
  AvatarStore,
  TAvatarData,
} from '@client/contexts/AvatarAppearanceContext'
import { CameraControlsStore } from '@client/contexts/CameraControlsContext'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { InventoryConsoleHUDStore } from '@client/contexts/InventoryConsoleHUDContext'
import { MapStore } from '@client/contexts/MapContext'
import { NetworkingStore } from '@client/contexts/NetworkingContext'
import { CameraMode } from '@client/hooks/useCameraControls'
import useCharacterControls, {
  Movement,
} from '@client/hooks/useCharacterControls'

interface PlayerConfigZustandState {
  maxSpeed: number
  jumpDistance: number
  deathHeight: number
  playerSpawnPosition: [number, number, number]
  nameTagOccludeSphereRadius: number
  isNameTagOccludeSphereVisible: boolean
  isInnerRaycastMeshVisible: boolean
  isOuterRaycastMeshVisible: boolean
  toggleForPrintingPlayerPosition: boolean
  isCharacterRoundedBoxVisible: boolean
  resetFn: (() => void) | null
  isPlayerParalysedRef: MutableRefObject<boolean>
  isPlayerAvatarVisible: boolean
}

const isPlayerParalysedRef = createRef<boolean>() as MutableRefObject<boolean>
isPlayerParalysedRef.current = false

export const PlayerConfigStore = create<PlayerConfigZustandState>(() => ({
  // maxSpeed: 0.02,
  maxSpeed: 140,
  jumpDistance: 15,
  deathHeight: -5.1,
  // OG
  playerSpawnPosition: [-2.6, 10, 64.72],
  // near OAT
  // playerSpawnPosition: [
  //   -108.90103100141795, 5.8609145596367407, -53.83296920507591,
  // ],
  // near og store
  // playerSpawnPosition: [
  //   3.022554560580811, 3.6842875616455077, -101.69505931748174,
  // ],
  //near dome store
  // playerSpawnPosition: [
  //   -117.18054276482314, 2.9839561212210812, -12.517055374810994,
  // ],
  // near cylinder store
  // playerSpawnPosition: [
  //   98.33594052830824,
  //   2.88500470348439,
  //   -5.474102476833126
  // ],
  nameTagOccludeSphereRadius: 15,
  isNameTagOccludeSphereVisible: false,
  isInnerRaycastMeshVisible: false,
  isOuterRaycastMeshVisible: false,
  toggleForPrintingPlayerPosition: false,
  isCharacterRoundedBoxVisible: false,
  resetFn: null,
  isPlayerParalysedRef,
  isPlayerAvatarVisible: true,
}))

type TCharacter = {
  playerName?: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  gravity: number
  avatarData?: TAvatarData
  avatarAnimationState?: AnimationStates
  // if the current instance of this component is for another player, joined using multiplayer
  // or if it is for the current player, on which this code is being executed
  isOtherPlayer?: boolean
  physicsStep?: number
  playerObject?: Player
  playerUserId?: string
  paramsForAvatar?: string
  selfPlayer?: Player | null
} & GroupProps

export interface CharacterRef {
  updatePlayer: (delta: number) => void
  playerRef: MutableRefObject<THREE.Group | null>
  roundedBoxRef: MutableRefObject<THREE.Mesh | null>
  teleportPlayer: (position: [number, number, number]) => void
}

const OuterRaycastMesh = ({
  meshRef,
}: {
  meshRef: MutableRefObject<THREE.Mesh<
    THREE.SphereGeometry,
    THREE.MeshBasicMaterial
  > | null>
}) => {
  const orbitDistance = CameraControlsStore((state) => state.orbitDistance)

  return (
    <mesh
      // This mesh is invisible and used to detect rays
      // originating from the camera and pointed towards this mesh.
      // This mesh acts like an outer boundary for the spring arm.
      // Detecting raycasts against this mesh will allow the spring
      // arm to extend to its original size (as set by the user when they zoomed in/out).
      position={[0, 1, 0]}
      name='outerRaycastBox'
      visible={false}
      ref={meshRef}
    >
      <sphereGeometry
        args={
          // Making sure the sphere is always a little farther away from the camera.
          // This sphere adjusts its size based on the zoom distance set by the user.
          // (inspired from roblox)
          [
            orbitDistance === undefined || orbitDistance === null
              ? 2
              : orbitDistance + 0.5,
          ]
        }
      />
      <meshStandardMaterial
        transparent={true}
        opacity={0.1}
        side={THREE.DoubleSide}
        color={'#00FF00'}
      />
    </mesh>
  )
}

const Character: ForwardRefRenderFunction<CharacterRef, TCharacter> = (
  props,
  ref,
) => {
  const {
    position,
    rotation,
    gravity,
    avatarData: avatarDataProp,
    avatarAnimationState: avatarAnimationStateProp,
    playerName: playerNameProp,
    physicsStep: physicsStepProp,
    isOtherPlayer = false,
    paramsForAvatar = '',
    selfPlayer,
    playerObject,
    ...groupProps
  } = props
  const inventoryConsoleHUDContext = InventoryConsoleHUDStore(
    useShallow((state) => ({
      isPresentationMode: state.isPresentationMode,
      isPresentationModeShuttingDown: state.isPresentationModeShuttingDown,
      isPresentationModeStartingUp: state.isPresentationModeStartingUp,
    })),
  )

  const cameraMode = CameraControlsStore((state) => state.cameraMode)

  const { collider, mapModel, geometry } = MapStore(
    useShallow((state) => ({
      collider: state.collider,
      mapModel: state.mapModel,
      geometry: state.geometry,
    })),
  )
  const avatarDataGlobal = AvatarStore((state) => state.avatarData)

  const playerNameGlobal = AuthAPIStore((state) => state.userDisplayName)
  const isDebugMode = genericStore((state) => state.isDebugMode)
  const room = NetworkingStore((state) => state.room)
  const nameTagsEnabled = NetworkingStore((state) => state.nameTagsEnabled)

  // const [physicsStep, setPhysicsStep] = useState<number>(5)
  // useEffect(() => {
  //   if (physicsStepProp) {
  //     setPhysicsStep(physicsStepProp)
  //   } else setPhysicsStep(5)
  // }, [physicsStepProp])

  const [avatarData, setAvatarData] = useState<TAvatarData | null>(null)
  useEffect(() => {
    if (avatarDataProp) {
      setAvatarData(avatarDataProp)
    } else {
      setAvatarData(avatarDataGlobal)
      if (room?.sessionId) {
        NetworkingStore.getState().addOrUpdateAvatarData(
          NetworkingStore.getState().room!.sessionId,
          avatarDataGlobal,
        )
      }
    }
  }, [avatarDataProp, avatarDataGlobal, room])

  const [playerName, setPlayerName] = useState<string>('')
  useEffect(() => {
    if (playerNameProp) {
      setPlayerName(playerNameProp)
    } else {
      setPlayerName(playerNameGlobal)
    }
  }, [playerNameProp, playerNameGlobal])

  // Presentation mode is when the user is interacting with some 3D item or group of items of interest
  // For more context, please see the HUDContext file
  const {
    isPresentationMode,
    isPresentationModeShuttingDown,
    isPresentationModeStartingUp,
    hasStartButtonBeenPressed,
    isShowcaseMode,
    isShowcaseModeShuttingDown,
    isShowcaseModeStartingUp,
  } = HUDStore(
    useShallow((state) => ({
      isPresentationMode: state.isPresentationMode,
      isPresentationModeShuttingDown: state.isPresentationModeShuttingDown,
      isPresentationModeStartingUp: state.isPresentationModeStartingUp,
      hasStartButtonBeenPressed: state.hasStartButtonBeenPressed,
      isShowcaseMode: state.isShowcaseMode,
      isShowcaseModeShuttingDown: state.isShowcaseModeShuttingDown,
      isShowcaseModeStartingUp: state.isShowcaseModeStartingUp,
    })),
  )

  const movementDataRef = useRef<Movement>({
    direction: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      sprint: false,
    },
    joystick: {
      angle: null,
      distance: null,
      direction: { x: null, y: null },
      quadrant: null,
    },
  })

  const isPlayerOnGround = useRef(false)
  const playerVelocity = useRef(new THREE.Vector3(0, 0, 0))

  // Ref to keep track of how many times the player has made a full rotation
  // For every rotation done in the +ve direction, we need to keep offsetting the player's rotation
  // by 2 * PI radians. And for every rotation in -ve direction, we need to keep offsetting the player's
  // rotation by -2 * PI radians
  const roundsMade = useRef<number>(0)

  const tempVector = useRef(new THREE.Vector3()).current
  const tempVector2 = useRef(new THREE.Vector3()).current
  const tempMat = useRef(new THREE.Matrix4()).current
  const tempBox = useRef(new THREE.Box3()).current
  const tempSegment = useRef(new THREE.Line3()).current
  const upVector = useRef(new THREE.Vector3(0, 1, 0)).current

  useCharacterControls(
    movementDataRef,
    isPlayerOnGround,
    playerVelocity,
    isOtherPlayer,
  )

  const playerSpeed = useRef<number>(0)

  const isReady = genericStore((state) => state.isCharacterRefReady)
  const avatarRef = useRef<THREE.Group | null>(null)

  useEffect(() => {
    if (avatarRef.current && ref !== null) {
      const newCharacterRef =
        createRef<CharacterRef>() as MutableRefObject<CharacterRef | null>
      newCharacterRef.current = {
        updatePlayer: updatePlayer,
        playerRef: avatarRef,
        roundedBoxRef: roundedBoxRef,
        teleportPlayer: teleportPlayer,
      }

      genericStore.setState({
        isCharacterRefReady: true,
        characterRef: newCharacterRef,
      })
    }
  }, [avatarRef.current])

  const innerRaycastMeshRef = useRef<THREE.Mesh<
    THREE.SphereGeometry,
    THREE.MeshStandardMaterial
  > | null>(null)
  const outerRaycastMeshRef = useRef<THREE.Mesh<
    THREE.SphereGeometry,
    THREE.MeshBasicMaterial
  > | null>(null)
  //This is the mesh that is used to occlude the name tag of the player after a certain distance
  const nameTagOccludeSphereMesh = useRef<THREE.Mesh<
    THREE.SphereGeometry,
    THREE.MeshBasicMaterial
  > | null>(null)
  const roundedBoxRef = useRef<THREE.Mesh | null>(null)
  const [, setAmIGonnaDance] = useState<boolean>(false)

  // todo
  // // this is a check which is run when the user has spawned. This is used as a proxy to only run the
  // // force reset of player's position once. Sometimes the user gets stuck in the ground and hence this is needed
  // const isSpawnCheckComplete = useRef(false)
  // const [
  //   hasSpawnCheckCompleteTimeoutBegan,
  //   setHasSpawnCheckCompleteTimeoutBegan,
  // ] = useState<boolean>(false)

  // useEffect(() => {
  //   if (
  //     avatarRef.current == null ||
  //     collider == null ||
  //     isSpawnCheckComplete.current
  //   )
  //     return

  //   // this is to make sure that this custom check doesn't run after some time has passed. As there might be a
  //   // depression in the map and if this check kept running, the player would reset without any reason.
  //   if (!hasSpawnCheckCompleteTimeoutBegan) {
  //     setHasSpawnCheckCompleteTimeoutBegan(true)
  //     setTimeout(() => {
  //       isSpawnCheckComplete.current = true
  //     }, 5000)
  //   }

  //   // 2 is the number as of now which signifies if the feet of the user are inside the ground.
  //   // the position, if less than 2, means that the user is inside the ground and we need to reset.
  //   // this marks our spawn check as complete
  //   if (
  //     isPlayerOnGround.current &&
  //     !isSpawnCheckComplete.current &&
  //     avatarRef.current.position.y < 2
  //   ) {
  //     reset()
  //     isSpawnCheckComplete.current = true
  //   }
  // }, [isPlayerOnGround.current])

  // temporary variables to store joystick quadrants.
  // This is to handle the case where the joystick is moved from one quadrant to another
  // and keep track of what the previous quadrant was and what the current quadrant is
  const tempJoystickQuadrant = useRef<number | null>(null)
  const previousJoystickQuadrant = useRef<number | null>(null)

  // The player can be thought of as a capsule. The collision detection for the player
  // is then done assuming this capsule shape. This object is store the capsule's information
  const capsuleInfo = {
    radius: 0.5,
    segment: new THREE.Line3(
      new THREE.Vector3(),
      new THREE.Vector3(0, -1.0, 0.0),
    ),
  }

  // leva controls for the player
  useControls(
    'Player',
    () => ({
      maxSpeed: {
        value: PlayerConfigStore.getState().maxSpeed,
        min: 0,
        max: 100,
        step: 0.01,
        onChange: (value: number) => {
          PlayerConfigStore.setState({ maxSpeed: value })
        },
      },
      jumpDistance: {
        value: PlayerConfigStore.getState().jumpDistance,
        min: 0,
        max: 100,
        step: 0.01,
        onChange: (value: number) => {
          PlayerConfigStore.setState({ jumpDistance: value })
        },
      },
      deathHeight: {
        value: PlayerConfigStore.getState().deathHeight,
        min: -100,
        max: 100,
        step: 0.01,
        onChange: (value: number) => {
          PlayerConfigStore.setState({ deathHeight: value })
        },
      },
      playerSpawnPosition: {
        value: PlayerConfigStore.getState().playerSpawnPosition,
        onChange: (value: [number, number, number]) => {
          PlayerConfigStore.setState({ playerSpawnPosition: value })
          if (avatarRef.current) {
            avatarRef.current.position.set(value[0], value[1], value[2])
          }
        },
        joystick: true,
      },

      nameTagOccludeSphereRadius: {
        value: PlayerConfigStore.getState().nameTagOccludeSphereRadius,
        min: 1, // minimum value
        max: 50, // maximum value
        step: 0.1, // step value (optional)
        onChange: (value: number) => {
          PlayerConfigStore.setState({ nameTagOccludeSphereRadius: value })
          if (nameTagOccludeSphereMesh.current) {
            nameTagOccludeSphereMesh.current.scale.set(value, value, value)
          }
        },
      },
      isNameTagOccludeSphereVisible: {
        value: PlayerConfigStore.getState().isNameTagOccludeSphereVisible,
        onChange: (value: boolean) => {
          PlayerConfigStore.setState({ isNameTagOccludeSphereVisible: value })
          if (!nameTagOccludeSphereMesh.current) return
          if (value) {
            nameTagOccludeSphereMesh.current.visible = true
            nameTagOccludeSphereMesh.current.material.transparent = true
            nameTagOccludeSphereMesh.current.material.opacity = 0.5
          } else {
            nameTagOccludeSphereMesh.current.visible = false
            nameTagOccludeSphereMesh.current.material.transparent = false
          }
        },
      },
      // This config option lets the user toggle the visibility of the inner raycast mesh.
      // The inner raycast mesh is a sphere wrapped around the player's head. This mesh is used
      // to detect raycast hitpoints with the player's head
      isInnerRaycastMeshVisible: {
        value: PlayerConfigStore.getState().isInnerRaycastMeshVisible,
        onChange: (value: boolean) => {
          PlayerConfigStore.setState({ isInnerRaycastMeshVisible: value })
          if (!innerRaycastMeshRef.current) return
          if (value) {
            innerRaycastMeshRef.current.visible = true
            innerRaycastMeshRef.current.material.transparent = true
            innerRaycastMeshRef.current.material.opacity = 0.5
          } else {
            innerRaycastMeshRef.current.visible = false
            innerRaycastMeshRef.current.material.transparent = false
          }
        },
      },
      // This config option lets the user toggle the visibility of the outer raycast mesh.
      // The outer raycast mesh is a sphere with a radius just a little bit more than the orbit distance.
      // You can assume it to be wrapped around the camera and the player.
      // This mesh is used to detect raycast hitpoints from the camera away from the player
      isOuterRaycastMeshVisible: {
        value: PlayerConfigStore.getState().isOuterRaycastMeshVisible,
        onChange: (value: boolean) => {
          PlayerConfigStore.setState({ isOuterRaycastMeshVisible: value })
          if (!outerRaycastMeshRef.current) return
          if (value) {
            outerRaycastMeshRef.current.visible = true
            outerRaycastMeshRef.current.material.transparent = true
            outerRaycastMeshRef.current.material.opacity = 0.5
          } else {
            outerRaycastMeshRef.current.visible = false
            outerRaycastMeshRef.current.material.transparent = false
          }
        },
      },
      // This is a hack to get the player's position in the console
      toggleForPrintingPlayerPosition: button(() => {
        if (avatarRef.current) {
          console.log(avatarRef.current?.position.toArray())
        }
      }),
      toggleForPrintingPlayerForwardVector: button(() => {
        if (avatarRef.current) {
          console.log(avatarRef.current?.getWorldDirection(upVector).toArray())
        }
      }),
      isCharacterRoundedBoxVisible: {
        value: PlayerConfigStore.getState().isCharacterRoundedBoxVisible,
        onChange: (value: boolean) => {
          PlayerConfigStore.setState({ isCharacterRoundedBoxVisible: value })
          if (!roundedBoxRef.current) return
          roundedBoxRef.current.visible = value
        },
      },
      isPlayerAvatarVisible: {
        value: PlayerConfigStore.getState().isPlayerAvatarVisible,
        onChange: (value: boolean) => {
          PlayerConfigStore.setState({ isPlayerAvatarVisible: value })
        },
      },
    }),
    {
      collapsed: true,
      render: () => {
        return isDebugMode || false
      },
    },
  )

  // Reset the player's position
  const reset = () => {
    if (!avatarRef.current) return
    playerVelocity.current.set(0, 0, 0)
    avatarRef.current.position.set(
      avatarRef.current.position.x,
      avatarRef.current.position.y + 10,
      avatarRef.current.position.z,
    )
  }
  useEffect(() => {
    if (PlayerConfigStore.getState().resetFn === null) {
      PlayerConfigStore.setState({ resetFn: reset })
    }
  }, [])

  // This is to keep track of how many times the player has made a full rotation using the joystick
  // The rotations can be in the anti-clockwise or clockwise direction (positive or negative)
  const updateRoundsMadeByJoystick = (
    direction: 'clockwise' | 'anticlockwise',
  ) => {
    if (direction === 'anticlockwise') roundsMade.current++
    else roundsMade.current--
  }

  // This is to keep track of how many times the player has made a full rotation using the keyboard
  // The rounds made are calculated using the player's current y rotation.
  const updateRoundsMadeByKeyboard = (currentPlayerRotation: number) => {
    roundsMade.current = Math.floor(currentPlayerRotation / (2 * Math.PI))
  }

  // Initialize the player
  useEffect(() => {
    if (!avatarRef.current || collider === null) return

    const player = avatarRef.current
    playerVelocity.current.set(0, 0, 0)

    // This is to solve the issue when rest of the players,
    // who joined before the current player, do not move and stay in the air
    // at the playerStartingPosition.
    if (
      props.isOtherPlayer === undefined ||
      props.isOtherPlayer === null ||
      props.isOtherPlayer === false
    )
      player.position.fromArray(
        PlayerConfigStore.getState().playerSpawnPosition,
      )
    else {
      if (props.position !== undefined && props.position !== null) {
        const newPosition = new THREE.Vector3().fromArray(props.position)

        // if the props.position is [0, 0, 0], it means that the player has not yet
        // been initialized. If we don't do anything, the player will spawn inside the floor at 0,0,0.
        // So we need to set the player's position to the playerSpawnPosition and adjust it vertically
        // so it looks like the player is on the ground
        if (
          props.position[0] === 0 &&
          props.position[1] === 0 &&
          props.position[2] === 0
        ) {
          newPosition.fromArray(
            PlayerConfigStore.getState().playerSpawnPosition,
          )
          newPosition.y = 1.37
        }

        player.position.set(newPosition.x, newPosition.y, newPosition.z)
      }
    }

    player.receiveShadow = true
    player.traverse((child) => {
      if (child instanceof THREE.Mesh) child.geometry.computeBoundsTree()
    })
  }, [avatarRef, collider])

  // If presentation mode is active,
  // hide the player and set the player's animation state to idle
  useEffect(() => {
    if (
      (inventoryConsoleHUDContext.isPresentationMode &&
        !inventoryConsoleHUDContext.isPresentationModeShuttingDown) ||
      (isPresentationMode && !isPresentationModeShuttingDown) ||
      isShowcaseMode ||
      isShowcaseModeShuttingDown ||
      isShowcaseModeStartingUp
    ) {
      AvatarStore.getState().setAvatarAnimationState('idle')
      if (avatarRef.current) avatarRef.current.visible = false
    } else {
      // we don't wanna make the self avatar visible if the player was in first person mode
      // but we also wanna make sure all the other avatars are visible no matter what
      if (
        CameraControlsStore.getState().cameraMode === CameraMode.FIRST_PERSON &&
        !props.isOtherPlayer
      )
        return
      if (avatarRef.current) avatarRef.current.visible = true
    }
  }, [
    isPresentationMode,
    isPresentationModeShuttingDown,
    isShowcaseMode,
    isShowcaseModeShuttingDown,
    isShowcaseModeStartingUp,
    inventoryConsoleHUDContext.isPresentationMode,
    inventoryConsoleHUDContext.isPresentationModeShuttingDown,
  ])

  useEffect(() => {
    //IC - inventory console
    const ic_startingUp =
      inventoryConsoleHUDContext.isPresentationModeStartingUp &&
      !inventoryConsoleHUDContext.isPresentationMode &&
      !inventoryConsoleHUDContext.isPresentationModeShuttingDown
    const ic_up =
      inventoryConsoleHUDContext.isPresentationMode &&
      !inventoryConsoleHUDContext.isPresentationModeShuttingDown &&
      !inventoryConsoleHUDContext.isPresentationModeStartingUp
    const ic_shuttingDown =
      inventoryConsoleHUDContext.isPresentationModeShuttingDown &&
      inventoryConsoleHUDContext.isPresentationMode &&
      !inventoryConsoleHUDContext.isPresentationModeStartingUp
    const ic_down =
      !inventoryConsoleHUDContext.isPresentationMode &&
      !inventoryConsoleHUDContext.isPresentationModeShuttingDown &&
      !inventoryConsoleHUDContext.isPresentationModeStartingUp

    // S - showcase
    const s_startingUp =
      isPresentationModeStartingUp && !isPresentationModeShuttingDown
    const s_up =
      isPresentationMode &&
      !isPresentationModeShuttingDown &&
      !isPresentationModeStartingUp
    const s_shuttingDown =
      isPresentationModeShuttingDown &&
      isPresentationMode &&
      !isPresentationModeStartingUp
    const s_down =
      !isPresentationMode &&
      !isPresentationModeShuttingDown &&
      !isPresentationModeStartingUp

    const hideAvatar = () => {
      AvatarStore.getState().setAvatarAnimationState('idle')
      if (avatarRef.current) avatarRef.current.visible = false
    }
    const showAvatar = () => {
      // we don't wanna make the self avatar visible if the player was in first person mode
      // but we also wanna make sure all the other avatars are visible no matter what
      if (
        CameraControlsStore.getState().cameraMode === CameraMode.FIRST_PERSON &&
        !props.isOtherPlayer
      )
        return
      if (avatarRef.current) avatarRef.current.visible = true
    }

    if (ic_startingUp || ic_up || s_startingUp || s_up) hideAvatar()
    else if (ic_shuttingDown || ic_down || s_shuttingDown || s_down)
      showAvatar()
  }, [
    inventoryConsoleHUDContext.isPresentationMode,
    inventoryConsoleHUDContext.isPresentationModeShuttingDown,
    inventoryConsoleHUDContext.isPresentationModeStartingUp,
    isPresentationMode,
    isPresentationModeShuttingDown,
    isPresentationModeStartingUp,
  ])

  // Hide/Unhide the player's avatar based on the camera mode changes
  useEffect(() => {
    if (!avatarRef.current || props.isOtherPlayer === true) return
    if (cameraMode === CameraMode.FIRST_PERSON)
      avatarRef.current.visible = false
    else avatarRef.current.visible = true
  }, [cameraMode])

  const teleportPlayer = (position: [number, number, number]) => {
    if (avatarRef.current) {
      avatarRef.current.position.set(position[0], position[1], position[2])
    }
  }

  // Constants for fixed time step
  const FIXED_TIME_STEP = GesturesAndDeviceStore.getState().isTouchDevice
    ? 1 / 60
    : 1 / 160
  const MAX_SUBSTEPS = 10 // Prevent spiraling in case of large delta times
  let accumulatedTime = 0
  const playerIntendedMovement = useRef(new THREE.Vector3(0, 0, 0))

  // Update the player's position, rotation and velocity using collisions and user input
  const updatePlayer = (delta: number) => {
    // if a building loading process is going on, we don't wanna update the player's position
    if (!genericStore.getState().isTabFocused) return
    if (
      genericStore.getState().loading_FetchingGroupDataFromFastapi ||
      genericStore.getState().loading_FetchingProductsBySKU ||
      genericStore.getState().loading_FetchingDataForInventoryConsole
    )
      return

    const _orbitControlsRef = CameraControlsStore.getState().orbitControlsRef
    if (_orbitControlsRef.current === null) return

    const _collider = MapStore.getState().collider
    if (_collider === null) return

    if (!avatarRef.current) return
    if (isPresentationMode || inventoryConsoleHUDContext.isPresentationMode)
      return
    const player = avatarRef.current

    handlePlayerInput(
      delta,
      _collider,
      player,
      _orbitControlsRef as MutableRefObject<OrbitControlsType>,
    )

    // Accumulate time and clamp delta
    accumulatedTime += Math.min(delta, 0.1) // Clamp delta to 100ms

    // Calculate number of steps, respecting MAX_SUBSTEPS
    const numSubsteps = Math.min(
      Math.floor(accumulatedTime / FIXED_TIME_STEP),
      MAX_SUBSTEPS,
    )

    // Perform fixed-step updates
    // while (accumulatedTime >= FIXED_TIME_STEP) {
    for (let i = 0; i < numSubsteps; i++) {
      performFixedUpdate(FIXED_TIME_STEP, _collider, player)
      accumulatedTime -= FIXED_TIME_STEP
    }

    // If we hit MAX_SUBSTEPS, we might have leftover time. Drain it gradually.
    if (numSubsteps === MAX_SUBSTEPS && accumulatedTime > FIXED_TIME_STEP) {
      accumulatedTime -= FIXED_TIME_STEP
    }

    // Update player's matrix
    player.updateMatrixWorld()
  }

  const handlePlayerInput = (
    delta: number,
    _collider: THREE.Mesh,
    player: THREE.Group,
    _orbitControlsRef: MutableRefObject<OrbitControlsType>,
  ) => {
    if (isPlayerParalysedRef.current && AvatarStore.getState().avatarAnimationState !== 'idle') {
      // Force idle animation when paralyzed
      AvatarStore.getState().setAvatarAnimationState('idle')
      return
    }

    // Azimuthal angle of the camera. To understand what this angle is, take a look at this. https://kiriproject.files.wordpress.com/2015/08/pascal3d_pose_modified.png
    const cameraAzAngle = _orbitControlsRef.current.getAzimuthalAngle()
    const isOnDanceFloor = genericStore.getState().isOnDanceFloor
    const joystick = movementDataRef.current.joystick
    const { forward, backward, left, right, sprint } =
      movementDataRef.current.direction

    // Check if there's any movement input
    let isMoving = false
    if (GesturesAndDeviceStore.getState().isTouchDevice) {
      if (joystick.distance !== null) {
        isMoving = joystick.distance > 0
      }
    } else {
      isMoving = forward || backward || left || right
    }

    if (isOnDanceFloor) {
      if (isMoving) {
        AvatarStore.getState().setAvatarAnimationState('idle')
        AvatarStore.setState({ currentDanceAnimationIndex: null })
      } else {
        AvatarStore.getState().setAvatarAnimationState('dance')
        AvatarStore.setState({ currentDanceAnimationIndex: 0 })
      }
    }

    if (
      // Handle movement and rotation of the player if the joystick is being used
      GesturesAndDeviceStore.getState().isTouchDevice === true &&
      joystick.angle &&
      joystick.distance &&
      joystick.direction.x &&
      joystick.direction.y
    ) {
      /// handle rotation of the player model ///

      // Modified joystick angle to account for the camera's azimuthal angle
      let adjustedJoystickAngle = joystick.angle
      if (joystick.quadrant === null) return
      // We need to keep track of whenever the joystick needle changes quadrants.
      // The two variables `tempJoystickQuadrant` and `previousJoystickQuadrant` are used for this purpose.
      if (tempJoystickQuadrant.current === null)
        tempJoystickQuadrant.current = joystick.quadrant
      if (previousJoystickQuadrant.current === null)
        previousJoystickQuadrant.current = joystick.quadrant
      // If the joystick needle has changed quadrants,
      // we need to update the number of rounds made by the player if the quadrant shift has happened between 1 and 2
      // And we need to update the helper variables with new state of quadrant.
      if (
        tempJoystickQuadrant.current !== null &&
        tempJoystickQuadrant.current !== joystick.quadrant
      ) {
        if (tempJoystickQuadrant.current === 1 && joystick.quadrant === 2)
          updateRoundsMadeByJoystick('anticlockwise')
        else if (tempJoystickQuadrant.current === 2 && joystick.quadrant === 1)
          updateRoundsMadeByJoystick('clockwise')
        previousJoystickQuadrant.current = tempJoystickQuadrant.current
        tempJoystickQuadrant.current = joystick.quadrant
      }
      // This will run for every frame where the current quadrant is different than the previous quadrant
      if (
        previousJoystickQuadrant.current != null &&
        previousJoystickQuadrant.current != joystick.quadrant
      ) {
        adjustedJoystickAngle =
          joystick.angle + roundsMade.current * 2 * Math.PI
      }

      // This is done to avoid the player rotate from 30 degress to -30 degrees in the other way round.
      // If we don't do this, the player will rotate through the LONGER path rather than the shortest path.
      if (
        Math.abs(player.rotation.y - (adjustedJoystickAngle + cameraAzAngle)) >
        Math.PI
      )
        adjustedJoystickAngle -= 2 * Math.PI

      // this is the lerping of the player's rotation from the current value to the desired value
      damp(
        player.rotation,
        'y',
        adjustedJoystickAngle + cameraAzAngle,
        0.1,
        delta,
      )

      /// handle movement of the player model ///
      // Speed of the player is some fraction of the maximum speed of the player
      // and is dependent on the joystick distance
      // const adjustedSpeed = PlayerConfigStore.getState().maxSpeed * delta * Math.pow(joystick.distance, 3)
      const adjustedSpeed =
        PlayerConfigStore.getState().maxSpeed *
        joystick.distance *
        (joystick.distance < 0.3 ? 6 : 3)
      playerSpeed.current = adjustedSpeed

      tempVector
        .set(0, 0, -1)
        .applyAxisAngle(upVector, adjustedJoystickAngle + cameraAzAngle)
      // set avatar's animation state
      movementDataRef.current.direction.sprint = joystick.distance > 0.5

      // const speed = 0.03
      const speed = 0.15
      player.position.addScaledVector(tempVector, sprint ? speed * 3 : speed)
      CameraControlsStore.getState().isCameraMovingByUserMove.current = true
    } else if (forward || backward || left || right) {
      /// handle movement and rotation of the player when using a keyboard and cursor ///

      // update rounds made by player
      updateRoundsMadeByKeyboard(player.rotation.y)

      // Speed of the player is half the max speed by default
      // and is doubled if the player is sprinting by pressing SHIFT key
      let adjustedSpeed = PlayerConfigStore.getState().maxSpeed
      adjustedSpeed *= sprint ? 3 : 1
      playerSpeed.current = adjustedSpeed

      // for rotating the player model, we will calculate the desired rotation angle
      // using what keys are pressed and where the camera is looking
      let desiredRotationAngle = 0

      // the tempVector is used to calculate the direction in which the player should move

      // if both forward and backward or left and right are pressed, the player should not move
      if ((forward && backward) || (left && right)) {
        tempVector.set(0, 0, 0)
      } else if (forward && left && !right && !backward) {
        tempVector.set(-1, 0, -1).normalize()
        desiredRotationAngle =
          cameraAzAngle + Math.PI * 2 * roundsMade.current + Math.PI / 4
      } else if (forward && right && !left && !backward) {
        tempVector.set(1, 0, -1).normalize()
        desiredRotationAngle =
          cameraAzAngle + Math.PI * 2 * roundsMade.current - Math.PI / 4
      } else if (backward && left && !right && !forward) {
        tempVector.set(-1, 0, 1).normalize()
        desiredRotationAngle =
          cameraAzAngle + Math.PI * 2 * roundsMade.current + (Math.PI * 3) / 4
      } else if (backward && right && !left && !forward) {
        tempVector.set(1, 0, 1).normalize()
        desiredRotationAngle =
          cameraAzAngle + Math.PI * 2 * roundsMade.current - (Math.PI * 3) / 4
      } else if (forward && !left && !right && !backward) {
        tempVector.set(0, 0, -1).normalize()
        desiredRotationAngle = cameraAzAngle + Math.PI * 2 * roundsMade.current
      } else if (backward && !left && !right && !forward) {
        tempVector.set(0, 0, 1).normalize()
        desiredRotationAngle = cameraAzAngle + Math.PI * 2 * roundsMade.current
        desiredRotationAngle =
          player.rotation.y <= 0
            ? desiredRotationAngle - Math.PI
            : desiredRotationAngle + Math.PI
      } else if (left && !forward && !backward && !right) {
        tempVector.set(-1, 0, 0).normalize()
        desiredRotationAngle =
          cameraAzAngle + Math.PI * 2 * roundsMade.current + Math.PI / 2
      } else if (right && !forward && !backward && !left) {
        tempVector.set(1, 0, 0).normalize()
        desiredRotationAngle =
          cameraAzAngle + Math.PI * 2 * roundsMade.current - Math.PI / 2
      }

      // tempVector is pointing towards N, E, S, W, NE, NW, SE, SW depending on the keys pressed
      // and now we need to rotate it by the cameraAzAngle so that it points in the direction
      // the camera is looking
      tempVector.applyAxisAngle(upVector, cameraAzAngle)

      // now we can move the player in the direction tempVector is pointing
      // const speed = 0.03
      const speed = 0.15
      player.position.addScaledVector(tempVector, sprint ? speed * 3 : speed)

      // This is done to avoid the player rotate (for example) from 30 degress to -30 degrees in the other way round.
      // If we don't do this, the player will rotate through the LONGER path rather than the shortest path.
      if (Math.abs(desiredRotationAngle - player.rotation.y) > Math.PI)
        desiredRotationAngle += 2 * Math.PI

      // this is the lerping of the player's rotation from the current value to the desired value
      damp(player.rotation, 'y', desiredRotationAngle, 0.1, delta)

      CameraControlsStore.getState().isCameraMovingByUserMove.current = true
    } else {
      // This is to reset the temp variables and player's rotation when touch events
      // are not being detected on the joystick
      if (
        GesturesAndDeviceStore.getState().isTouchDevice &&
        joystick.direction.x === null &&
        joystick.direction.y === null
      ) {
        tempJoystickQuadrant.current = null
        previousJoystickQuadrant.current = null
        // Player's rotation.y value is inflated with the number of rounds made * 2 * PI.
        // This will cause problems if the user (somehow) went from joystick to keyboard.
        // So we need to reset the player's rotation to the original value which should lie between 0 and 2 * PI
        player.rotation.y += -roundsMade.current * Math.PI * 2
        roundsMade.current = 0
      }
      // set player's speed and animation state. // Reset player speed and animation state when not moving
      if (playerSpeed.current !== 0) {
        playerSpeed.current = 0
        if (!isOnDanceFloor) {
          AvatarStore.getState().setAvatarAnimationState('idle')
        }
      }
      // setCurrentAvatarAnimationState(amIGonnaDance ? 'dance' : 'idle')
      CameraControlsStore.getState().isCameraMovingByUserMove.current = false
    }

    // applying animations
    // jump animation is handled by the keydown button listener
    if (isPlayerOnGround.current) {
      if (playerSpeed.current > 0) {
        if (sprint && AvatarStore.getState().avatarAnimationState !== 'run')
          AvatarStore.getState().setAvatarAnimationState('run')
        else if (
          !sprint &&
          AvatarStore.getState().avatarAnimationState !== 'walk'
        )
          AvatarStore.getState().setAvatarAnimationState('walk')
      } else {
        if (
          AvatarStore.getState().avatarAnimationState !== 'idle' &&
          !isOnDanceFloor
        )
          AvatarStore.getState().setAvatarAnimationState('idle')
      }
    }

    // Store the intended movement for use in the physics update
    playerIntendedMovement.current = tempVector.clone()
  }

  const performFixedUpdate = (
    delta: number,
    _collider: THREE.Mesh,
    player: THREE.Group,
  ) => {
    // handle jumping. Applies gravity to the player's y velocity if player is in the air
    if (isPlayerOnGround.current === true) {
      playerVelocity.current.y = delta * gravity
    } else {
      playerVelocity.current.y += delta * gravity
    }
    player.position.addScaledVector(playerVelocity.current, delta)

    player.updateMatrixWorld()

    // const capsuleInfo = mesh.
    // adjust player position based on collisions
    tempBox.makeEmpty()
    tempMat.copy(_collider.matrixWorld).invert()

    tempSegment.copy(capsuleInfo.segment)

    // get the position of the capsule in the local space of the collider
    tempSegment.start.applyMatrix4(player.matrixWorld).applyMatrix4(tempMat)
    tempSegment.end.applyMatrix4(player.matrixWorld).applyMatrix4(tempMat)

    // get the axis aligned bounding box of the capsule
    tempBox.expandByPoint(tempSegment.start)
    tempBox.expandByPoint(tempSegment.end)

    tempBox.min.addScalar(-capsuleInfo.radius)
    tempBox.max.addScalar(capsuleInfo.radius)

    // Function to check collisions with a single collider
    const checkCollisions = (collider: THREE.Mesh) => {
      if (collider.geometry.boundsTree) {
        collider.geometry.boundsTree.shapecast({
          intersectsBounds: (box) => box.intersectsBox(tempBox),
          intersectsTriangle: (tri) => {
            // check if the triangle is intersecting the capsule and adjust the
            // capsule position if it is.
            const triPoint = playerIntendedMovement.current
            const capsulePoint = tempVector2

            const distance = tri.closestPointToSegment(
              tempSegment,
              triPoint,
              capsulePoint,
            )
            if (distance < capsuleInfo.radius) {
              const depth = capsuleInfo.radius - distance
              const direction = capsulePoint.sub(triPoint).normalize()

              tempSegment.start.addScaledVector(direction, depth)
              tempSegment.end.addScaledVector(direction, depth)
            }
          },
        })
      }
    }

    // Check collisions with the main map collider
    checkCollisions(_collider)

    // Check collisions with all meteor colliders
    MeteorManagerStore.getState().meteorColliders.forEach((collider) => {
      if (collider) {
        checkCollisions(collider)
      }
    })

    // get the adjusted position of the capsule collider in world space after checking
    // triangle collisions and moving it. capsuleInfo.segment.start is assumed to be
    // the origin of the player model.
    const newPosition = playerIntendedMovement.current
    newPosition.copy(tempSegment.start).applyMatrix4(_collider.matrixWorld)

    const deltaVector = tempVector2
    deltaVector.subVectors(newPosition, player.position)

    // if the player was primarily adjusted vertically we assume it's on something we should consider ground
    isPlayerOnGround.current =
      deltaVector.y > Math.abs(delta * playerVelocity.current.y * 0.25)

    const offset = Math.max(0.0, deltaVector.length() - 1e-5)
    deltaVector.normalize().multiplyScalar(offset)

    // adjust the player model
    player.position.add(deltaVector)

    if (!isPlayerOnGround.current) {
      deltaVector.normalize()
      playerVelocity.current.addScaledVector(
        deltaVector,
        -deltaVector.dot(playerVelocity.current),
      )
    } else {
      playerVelocity.current.set(0, 0, 0)

      // stabilized is when the user has spawned and has been stationary for a while
      // this is when turn off the loading screen
      if (!hasStabilized.current) {
        stabilizationCheckFrameCount.current++
        if (stabilizationCheckFrameCount.current > 10) {
          hasStabilized.current = true
          genericStore.setState({ loading_initialSpawn: false })
        }
      }
    }

    // if the player has fallen too far below the level reset their position to the start
    if (player.position.y < PlayerConfigStore.getState().deathHeight) {
      reset()
    }
  }

  // pass these values to the parent component
  useImperativeHandle(
    ref,
    () => ({
      updatePlayer,
      playerRef: avatarRef,
      roundedBoxRef,
      teleportPlayer,
    }),
    [isReady],
  )

  const hasStabilized = useRef(false)
  const stabilizationCheckFrameCount = useRef(0)

  useEffect(() => {
    const chance = Math.random() * Math.random()
    if (chance > 0.999) setAmIGonnaDance(true)
  }, [])

  // We wanna pre compiling the shaders before rendering the first frame
  // We do this because if our map colliders are not loaded, but player physics begin,
  // the player will fall through the map. If we render the first frame when all shaders are compiled
  // and ready to be drawn on the screen, the player will not fall through the map
  const { gl, camera, scene } = useThree()
  const [isShaderCompilationDone, setShaderCompilationDone] = useState(false)
  useEffect(() => {
    gl.compile(scene, camera)
    setShaderCompilationDone(true)
  }, [])

  useFrame((_state, delta) => {
    if (!genericStore.getState().isTabFocused) return
    if (props.isOtherPlayer != null && props.isOtherPlayer === true) return
    if (AvatarStore.getState().hasAvatarBeenSelected === false) return
    if (!isShaderCompilationDone) return
    if (!collider || !mapModel || !geometry) return
    if (!avatarRef.current) return
    // for (let i = 0; i < physicsStep; i++) {
    // update player's position wrt collisions and input
    // updatePlayer(delta / physicsStep)
    // }
    updatePlayer(delta)
  })

  const dummyQuaternion = useRef(new THREE.Quaternion()).current

  useFrame(() => {
    if (!genericStore.getState().isTabFocused) return
    if (
      avatarRef.current &&
      props.isOtherPlayer != null &&
      props.isOtherPlayer == true
    ) {
      avatarRef.current.position.lerp(
        new THREE.Vector3(
          props.playerObject?.position.x ?? 0,
          props.playerObject?.position.y ?? 0,
          props.playerObject?.position.z ?? 0,
        ),
        0.5,
      )
      avatarRef.current.quaternion.slerp(
        dummyQuaternion.setFromEuler(
          new THREE.Euler(
            props.playerObject?.rotation.x ?? 0,
            props.playerObject?.rotation.y ?? 0,
            props.playerObject?.rotation.z ?? 0,
          ),
        ),
        0.5,
      )
    }
  })

  const [el] = useState(() => document.createElement('div'))
  useEffect(() => {
    if (!nameTagsEnabled) return
    if (!isOtherPlayer) return
    if (!playerObject || !selfPlayer) return

    const interval = setInterval(() => {
      // we have the position of selfPlayer as `selfPlayer.position` and the position of the other player as `position`.
      // we want to calculate the distance between the two players.
      const dist =
        Math.pow(playerObject.position.x - selfPlayer.position.x, 2) +
        Math.pow(playerObject.position.y - selfPlayer.position.y, 2) +
        Math.pow(playerObject.position.z - selfPlayer.position.z, 2)

      if (dist > 500) {
        el.style.display = 'none'
      } else {
        el.style.display = 'block'
      }

      if (dist > 2000) {
        // if the distance between the two players is greater than 1000 units, we want to hide the other player's avatar
        if (avatarRef.current) avatarRef.current.visible = false
      } else {
        if (avatarRef.current) avatarRef.current.visible = true
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [playerObject, selfPlayer, nameTagsEnabled])

  const isPlayerAvatarVisible = PlayerConfigStore(
    (state) => state.isPlayerAvatarVisible,
  )
  useEffect(() => {
    if (isPlayerAvatarVisible) {
      if (avatarRef.current) avatarRef.current.visible = true
    } else {
      if (avatarRef.current) avatarRef.current.visible = false
    }
  }, [isPlayerAvatarVisible])

  return (
    <>
      <group
        ref={avatarRef}
        name='characterGroup'
        position={position}
        rotation={rotation}
        {...groupProps}
      >
        {!props.isOtherPlayer && (
          <>
            <mesh
              // This mesh is just for the direction reference,
              // where the character is facing
              position={[0, 0.5, -0.2]}
              name='characterDirectionMesh'
              visible={false}
            >
              <boxGeometry args={[0.1, 0.1, 0.5]} />
              <meshStandardMaterial />
            </mesh>
            <mesh
              // This mesh is invisible and used to detect rays from the
              // camera raycaster for spring arm functionality
              position={[0, -0.5, 0]}
              name='raycastBox'
              visible={false}
              ref={innerRaycastMeshRef}
            >
              <sphereGeometry args={[1]} />
              <meshStandardMaterial color={'#00FF00'} />
            </mesh>
            <OuterRaycastMesh meshRef={outerRaycastMeshRef} />
            <RoundedBox
              // will be replaced by the player's avatar
              castShadow
              position={[0, 0.25, 0]}
              args={[1.0, 3.75, 1.0]}
              radius={0.5}
              smoothness={10}
              name='characterRoundedBox'
              visible={false}
              ref={roundedBoxRef}
            >
              <meshBasicMaterial color={'#0000FF'}></meshBasicMaterial>
            </RoundedBox>
          </>
        )}
        {avatarData && avatarData.avatarPath && (
          <>
            {props.isOtherPlayer &&
              !isPresentationMode &&
              !inventoryConsoleHUDContext.isPresentationMode &&
              hasStartButtonBeenPressed &&
              nameTagsEnabled && <NameTag name={playerName} el={el} />}
            <Avatar
              avatarData={avatarData}
              playerSpeed={playerSpeed}
              playerUserId={
                props.isOtherPlayer && props.playerUserId
                  ? props.playerUserId
                  : room?.sessionId ?? ''
              }
              isOtherPlayer={
                props.isOtherPlayer != null && props.isOtherPlayer === true
                  ? true
                  : false
              }
              paramsForAvatar={paramsForAvatar}
            ></Avatar>
            {/* <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color={'red'} />
          </mesh> */}
          </>
        )}
        {/* Displays name tags over other players' head */}

        {/* Helper for occluding all name tags after a certain distance from camera*/}
        {!props.isOtherPlayer ? (
          <mesh
            position={[0, 1, 0]}
            name='nameTagOccludeSphere'
            ref={nameTagOccludeSphereMesh}
            visible={false}
          >
            <sphereGeometry
              args={[PlayerConfigStore.getState().nameTagOccludeSphereRadius]}
            />
            <meshStandardMaterial
              transparent={true}
              opacity={0.1}
              side={THREE.DoubleSide}
              color={'#00FF00'}
            />
          </mesh>
        ) : null}
      </group>
    </>
  )
}

export default forwardRef(Character)
