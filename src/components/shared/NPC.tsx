import {
  // PerformanceMonitorApi,
  useAnimations,
  useGLTF,
} from '@react-three/drei'
import { MeshProps, Vector3 as TVector3, useFrame } from '@react-three/fiber'
import {
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import * as THREE from 'three'
import { Vector3 } from 'three'
import { GLTF, SkeletonUtils } from 'three-stdlib'

import { damp } from 'maath/easing'

import { CharacterRef } from '@client/components/Character'
import TriggerArea, { TTriggerAreaProps } from '@client/components/TriggerArea'
import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { NPCStore } from '@client/contexts/NPCContext'
import { useShallow } from 'zustand/react/shallow'

export type TNPCProps = {
  /**
   * Which button should be used to trigger the interaction
   */
  triggerButton?: string
  /**
   * The target object that the trigger area will be checking for intersections with.
   */
  characterRef: MutableRefObject<CharacterRef | null>
  /**
   * Name of the NPC
   */
  name: string
  /**
   * Trigger area related properties
   */
  triggerArea?: { activationRadius?: TVector3 } & Partial<TTriggerAreaProps>
  /**
   * If the NPC should face the user when in interaction radius
   */
  faceUser?: boolean
  /**
   * Whether the NPC should be activated when the user enters its trigger area or when the user interacts with it
   */
  interactMode?: 'prompt' | 'auto'

  modelPath?: string

  modelScale?: TVector3
  /**
   * Name of the animation to be played when the NPC is idle
   */
  animation: {
    idle: {
      name: string
      fadeIn: number
      fadeOut: number
      timeScaleFactor: number
    }
    move: {
      name: string
      fadeIn: number
      fadeOut: number
      timeScaleFactor: number
    }
    talk?: {
      name: string
      fadeIn: number
      fadeOut: number
      timeScaleFactor: number
    }
  }
  /**
   * Portrait of the NPC to be shown in the dialog
   */
  portrait?: string
  /**
   * Movement speed of the NPC
   * @default
   */
  movementSpeed?: number
} & MeshProps &
  (
    | {
        /**
         * Dialogs to be shown when the user interacts with the NPC
         */
        dialogs: TDialog[]
        onDialogStart?: () => void
        onDialog?: () => void
        onDialogEnd?: () => void
        /**
         * Path to be followed by the NPC
         */
        tour?: never
        /**
         * Whether the NPC should face the user when interacting
         */
        returnToInitialPosition?: never
      }
    | {
        /**
         * Dialogs to be shown when the user interacts with the NPC
         */
        dialogs?: never
        onDialogStart?: never
        onDialog?: never
        onDialogEnd?: never
        /**
         * Path to be followed by the NPC
         */
        tour?: TFollowPathData
        /**
         * Whether the NPC should face the user when interacting
         */
        returnToInitialPosition?: true
      }
  )

/**
 * Dialog to be shown to the user
 */
export type TDialog = {
  text: string
  name: string
  isEndOfConversation?: boolean
  onStart?: () => void
  onEnd?: () => void
  /**
   * This is a callback because we will not be updating the function everytime the value changes
   * @returns Whether the next button should be shown
   */
  // shouldShowNextButton?: () => boolean
} & (
  | { isQuestion?: false; options?: never }
  | {
      isQuestion: true
      options: {
        text: string
        callback?: () => void
        goToDialog?: TDialog['name']
      }[]
    }
)

/**
 * Data for the NPC to follow a path
 */
type TFollowPathData = {
  path: TPathPoint[]
  onFinishCallback?: () => void
} & (
  | {
      initialDialog?: TDialog[]
      onDialogStart?: () => void
      onDialog?: () => void
      onDialogEnd?: () => void
    }
  | {
      initialDialog?: never
      onDialogStart?: never
      onDialog?: never
      onDialogEnd?: never
    }
)

/**
 * A point in the path that the NPC will follow
 */
type TPathPoint = {
  position: Vector3 | [number, number, number]
  dialog: TDialog[]
  onMoveStart?: () => void
  onMove?: () => void
  onMoveEnd?: () => void
  onDialogStart?: () => void
  onDialog?: () => void
  onDialogEnd?: () => void
}

/**
 * Converts a react-three vector type to a threejs vector type
 */
const convertToVector = (position?: TVector3) => {
  if (!position) return new Vector3()
  if (typeof position === 'number') return new Vector3().setScalar(position)
  if (position instanceof Vector3) return position

  return new Vector3().fromArray(position)
}

/**
 * Interpolates between two vectors and checks if the distance between them is greater than the given epsilon
 */
function interpolateAndCheck(
  currentPos: Vector3,
  targetPos: Vector3,
  t: number,
  eps: number,
): boolean {
  const newPos = currentPos.lerp(targetPos, t)
  const distance = newPos.distanceTo(targetPos)

  return distance >= eps
}

/**
 * NPC gets its transformations applied directly to the mesh
 *
 */
const NPC = ({
  movementSpeed = 1,
  triggerButton = 'e',
  ...props
}: TNPCProps) => {
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)
  const { showDialogScreen, setShowDialogScreen } = HUDStore(
    useShallow((state) => ({
      showDialogScreen: state.showDialogScreen,
      setShowDialogScreen: state.setShowDialogScreen,
    })),
  )
  const [isFirstInteractionDone, setIsFirstInteractionDone] = useState(false)
  const [interactMode, setInteractMode] = useState<'prompt' | 'auto'>('prompt')
  const {
    setDialogs,
    activeDialogIndex,
    setActiveDialogIndex,
    setNPC,
    currentPosition,
    setCurrentPosition,
    setTotalPoints,
    interactionState,
    setInteractionState,
    totalPoints,
  } = NPCStore(
    useShallow((state) => ({
      setDialogs: state.setDialogs,
      activeDialogIndex: state.activeDialogIndex,
      setActiveDialogIndex: state.setActiveDialogIndex,
      setNPC: state.setNPC,
      currentPosition: state.currentPosition,
      setCurrentPosition: state.setCurrentPosition,
      totalPoints: state.totalPoints,
      setTotalPoints: state.setTotalPoints,
      interactionState: state.interactionState,
      setInteractionState: state.setInteractionState,
    })),
  )

  /**
   * Load NPC model
   */
  const { scene: sceneBeforeCloning, animations } = useGLTF(
    props.modelPath || staticResourcePaths.gltfFilePaths.yBot,
  ) as GLTF

  /**
   * Reference to the NPC's mesh
   */
  const npcObjectRef = useRef<THREE.Group>(null)
  const npcGroupRef = useRef<THREE.Group>(null)

  /**
   * Clone the scene so that we can have multiple instances of the same NPC
   */
  const scene = useMemo(() => {
    /**
     * We need to set frustumCulled to false for each mesh in the scene
     * otherwise the NPC will disappear when it goes out of the camera's view
     */
    sceneBeforeCloning.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.frustumCulled = false
      }
    })
    return SkeletonUtils.clone(sceneBeforeCloning)
  }, [sceneBeforeCloning])

  /**
   * Get all the animations from the gltf file
   */
  const { actions } = useAnimations<THREE.AnimationClip>(
    animations,
    npcObjectRef,
  )

  /**
   * Current animation state
   * This is used to determine which animation should be played
   * based on the current interaction state
   */
  const [currentAnimationState, setCurrentAnimationState] =
    useState<keyof TNPCProps['animation']>('idle')

  /**
   * NPC's position and scale
   */
  const [position, setPosition] = useState(convertToVector(props.position))
  // This is for the case when frame rate drops, and due to that, the animation
  // will play faster and it just looks very bad. Why does it play faster? Because
  // the animation is dependent on adjusted player speed, which is inversely dependent on
  // frame rate. So if the frame rate drops, the player speed will increase, and hence
  // the animation will play faster. To counter this, we need to adjust the animation's
  // timescale based on the current fps. This is what this state is for.
  const [fpsAdjustedTimeScaleMultiplier, ] =
    useState(1)

  // Whenever the fps changes, this will set the above factor as a ratio of the current fps to 60
  // So if the app is running on 30fps, this time scale multiplier will be 0.5 and hence the `timeScaleFactor`
  // of the animation will be multiplied by 0.5, which will slow down the animation by half.
  // usePerformanceMonitor({
  //   onChange: (api: PerformanceMonitorApi) => {
  //     setFpsAdjustedTimeScaleMultiplier(api.fps / api.refreshrate)
  //   },
  // })

  /**
   * Whether the user is in the NPC's activation radius
   * This is used to determine whether the NPC should face the user
   * and whether the user should be able to interact with the NPC
   */
  const [isUserInNPCRadius, setIsUserInNPCRadius] = useState(false)

  /**
   * NPC's activation radius
   */
  const [activationRadius] = useState(
    props.triggerArea?.activationRadius || new Vector3(1, 1, 1),
  )

  const triggerInteraction = () => {
    if (interactionState === 'inProgressMove' || showDialogScreen) return

    if (activeDialogIndex == -1) setActiveDialogIndex(0)
    setShowDialogScreen(true)
    setInteractionState('startDialog')

    /**
     * If we don't have a path to follow then we directly show the dialog
     */
    if (props.dialogs) {
      setDialogs(props.dialogs)
      setNPC({ name: props.name, portrait: props.portrait })
    }
    /**
     * Only show the initial dialog when the NPC hasn't started moving
     */
    if (props.tour && currentPosition === -1) {
      if (props.tour.initialDialog) {
        setDialogs(props.tour.initialDialog)
        setNPC({ name: props.name, portrait: props.portrait })
      } else {
        setCurrentPosition(NPCStore.getState().currentPosition + 1)
        setInteractionState('startMove')
        setIsFirstInteractionDone(true)
      }
    }
  }

  /**
   * create a debounced version of onLeaveInteractionRadius
   * so that we can cancel the timeout if the user re-enters the radius
   */
  const onLeaveInteractionRadius = () => {
    /**
     * After a few seconds of exiting we can reset the NPC's state
     * if the user re-enters before the timeout, we can cancel the timeout
     */
    setShowDialogScreen(false)
    setIsUserInNPCRadius(false)

    if (interactionState !== 'inProgressMove') setInteractionState('idle')
  }

  /**
   * Holds the position of the NPC
   */
  const posVector = new Vector3()
  /**
   * Holds the target vector for the NPC to look at
   */
  const targetVector = new Vector3()
  const directionVector = new Vector3()
  /**
   * Holds a dummy mesh to calculate the rotation of the NPC
   */
  // const dummyMesh = new THREE.Group()
  let isLerping = false

  useFrame((_state, delta) => {
    /**
     * if the NPC is following a path, move it along the path
     */
    if (props.tour && currentPosition !== -1) {
      if (interactionState === 'inProgressMove') {
        posVector.copy(position)

        if (props.returnToInitialPosition && currentPosition === totalPoints) {
          directionVector.subVectors(convertToVector(props.position), posVector)
          isLerping = interpolateAndCheck(
            posVector,
            convertToVector(props.position),
            movementSpeed * delta,
            1,
          )
        } else {
          directionVector.subVectors(
            convertToVector(props.tour.path[currentPosition].position),
            posVector,
          )
          isLerping = interpolateAndCheck(
            posVector,
            convertToVector(props.tour.path[currentPosition].position),
            movementSpeed * delta,
            3,
          )
        }

        setPosition(posVector)

        if (npcGroupRef.current) {
          const rotationY = Math.atan2(directionVector.x, directionVector.z)

          damp(npcGroupRef.current.rotation, 'y', rotationY, 0.1, delta)
          // npcGroupRef.current.rotation.y = rotationY;
        }
      }

      if (!isLerping && interactionState === 'inProgressMove') {
        /**
         * if the NPC has reached the current point, we update the dialogs
         *
         * current position will only be equal to total points if we have returned to the initial position
         * and in that case we don't want to show any dialogs
         */
        if (currentPosition !== totalPoints) {
          setDialogs(props.tour.path[currentPosition].dialog)
        }
        setInteractionState('endMove')
      }
    }

    /**
     * rotate the NPC to face the user
     */
    if (
      props.faceUser &&
      isUserInNPCRadius &&
      interactionState !== 'inProgressMove'
    ) {
      targetVector.copy(
        convertToVector(
          props.characterRef.current?.playerRef.current?.position,
        ),
      )

      if (npcGroupRef.current) {
        directionVector.subVectors(targetVector, npcGroupRef.current.position)
        const rotationY = Math.atan2(directionVector.x, directionVector.z)
        damp(npcGroupRef.current.rotation, 'y', rotationY, 0.1, delta)
      }
    }
  })

  /**
   * This effect is responsible for playing the animations based on the current animation state
   */
  useEffect(() => {
    const currentAnimation = props.animation[currentAnimationState]
    if (!currentAnimation) return

    const a = actions[currentAnimation.name]
    if (!a) return

    const fadeInValue = currentAnimation.fadeIn
    const fadeOutValue = currentAnimation.fadeOut

    a.reset().fadeIn(fadeInValue).play()

    return () => {
      a.fadeOut(fadeOutValue)
    }
  }, [currentAnimationState])

  // This effect is responsible for adjusting the timescale property of each playing animation.
  // We don't want it to seem that the charachter is gliding on the ground when they are walking or running.
  // We wanna have a close match between the avatar's animation and the player's overall translation. Timescale helps us with that
  useEffect(() => {
    const currentAnimation = props.animation[currentAnimationState]
    if (!actions || currentAnimationState === null || !currentAnimation) return

    const a = actions[currentAnimationState]
    if (!a) return
    const fpsAdjustedTimeScaleValue =
      1 +
      currentAnimation.timeScaleFactor *
        movementSpeed *
        Math.pow(fpsAdjustedTimeScaleMultiplier, 2)

    // we're damping this because if we don't, the walking/running animation's speed
    // changes too abruptly.
    damp(a, 'timeScale', fpsAdjustedTimeScaleValue, 0.25)
  }, [
    movementSpeed,
    currentAnimationState,
    fpsAdjustedTimeScaleMultiplier,
    props.animation,
  ])

  /**
   * Set initial animation and interaction state
   */
  useEffect(() => {
    setCurrentAnimationState('idle')
    setInteractionState('idle')
  }, [])

  useEffect(() => {
    /**
     * If we have a path to follow, we set the total points to the length of the path
     */
    setTotalPoints(props.tour?.path.length || 0)
  }, [props.tour])

  useEffect(() => {
    const mode = props.tour ? 'tour' : 'dialog'

    /**
     * whenever the interaction state is updated we trigger a callback based on the current interaction state
     * this is useful for triggering events when the NPC starts moving, starts talking, etc.
     *
     * if the current mode is tour then we have to check which point the user is at in the tour and trigger callback based on that
     * but if the current point is -1 then we trigger the callback on the initial dialog
     *
     * if the current mode is dialog then we trigger the callback on the dialog
     */
    switch (interactionState) {
      case 'startDialog':
        setCurrentAnimationState('talk')

        if (mode === 'tour')
          if (currentPosition === -1) props.tour?.onDialogStart?.()
          else props.tour?.path[currentPosition].onDialogStart?.()
        else props.onDialogStart?.()

        setInteractionState('inProgressDialog')
        break

      case 'startMove':
        setCurrentAnimationState('move')

        if (mode === 'tour') {
          if (currentPosition === -1)
            props.tour?.path[currentPosition].onMoveStart?.()
          setInteractionState('inProgressMove')
        }
        break

      case 'inProgressDialog':

        if (mode === 'tour')
          if (currentPosition === -1) props.tour?.onDialog?.()
          else props.tour?.path[currentPosition].onDialog?.()
        else props.onDialogStart?.()
        break

      case 'inProgressMove':

        if (mode === 'tour')
          if (currentPosition === -1)
            props.tour?.path[currentPosition].onMoveStart?.()
        break

      case 'endDialog':
        setCurrentAnimationState('idle')

        if (mode === 'tour') {
          if (currentPosition === -1) props.tour?.onDialogEnd?.()
          else props.tour?.path[currentPosition].onDialogEnd?.()

          if (
            currentPosition < totalPoints - 1 ||
            (props.returnToInitialPosition &&
              currentPosition === totalPoints - 1)
          ) {
            setCurrentPosition(NPCStore.getState().currentPosition + 1)
            setInteractionState('startMove')
            setIsFirstInteractionDone(true)
          }
        } else props.onDialogEnd?.()
        break

      case 'endMove':
        setCurrentAnimationState('idle')
        if (isFirstInteractionDone) {
          if (isUserInNPCRadius) {
            triggerInteraction()
          } else {
            // If not inside the triggerArea, set interactMode to auto
            setInteractMode('auto')
          }
        }
        if (mode === 'tour') {
          /**
           * If we have returned to the initial position, we set the current position back to initial
           */
          if (
            props.returnToInitialPosition &&
            currentPosition === totalPoints
          ) {
            setCurrentPosition(-1)
            setIsFirstInteractionDone(false)
            setInteractMode('prompt')
          } else props.tour?.path[currentPosition].onMoveEnd?.()
        }
        setCurrentAnimationState('idle')
        break
      case 'idle':
        setCurrentAnimationState('idle')
        break
    }
  }, [interactionState])

  return (
    <group position={position} ref={npcGroupRef}>
      <TriggerArea
        name='npc'
        type='sphere'
        scale={activationRadius}
        target={
          props.characterRef.current?.roundedBoxRef.current
            ? props.characterRef.current?.roundedBoxRef.current
            : null
        }
        onEnter={() => {
          setIsUserInNPCRadius(true)
          if (interactMode === 'auto') {
            triggerInteraction()
          }
          /**
           * If the conversation has been initiated and the first dialog has been shown, going forward we enable the dialog as soon as the user enters the NPC's radius
           */
          if (
            !showDialogScreen &&
            currentPosition !== -1 &&
            interactionState === 'idle'
          ) {
            triggerInteraction()
          }
        }}
        onExit={() => {
          setIsUserInNPCRadius(false)
          if (interactionState !== 'inProgressMove') onLeaveInteractionRadius()
        }}
        isPromptShown={
          interactMode === 'prompt' &&
          interactionState !== 'inProgressMove' &&
          !showDialogScreen
        }
        prompt={{
          events: [
            {
              type: 'keypress',
              callback: (e) => {
                if (e.key.toLowerCase() === triggerButton.toLowerCase()) {
                  if (interactMode === 'prompt') {
                    triggerInteraction()
                  }
                }
              },
            },
          ],
          onClick: () => {
            if (interactMode === 'prompt') {
              triggerInteraction()
            }
          },
          onTouchStart: () => {
            if (interactMode === 'prompt') {
              triggerInteraction()
            }
          },
          display: {
            icon: isTouchDevice ? 'Tap' : triggerButton.toUpperCase(),
            actionText: 'Talk',
            objectText: props.name,
          },
        }}
        {...props.triggerArea}
      />

      <group
        position={[0, -1.5, 0]}
        scale={props.modelScale || 1}
        ref={npcObjectRef}
      >
        <primitive object={scene} />
      </group>
    </group>
  )
}
export default NPC
