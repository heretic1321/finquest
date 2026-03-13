import { Html, TransformControls } from '@react-three/drei'
import { MeshProps, useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { BufferGeometry, Matrix4, Mesh } from 'three'


import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'

export type TPrompt<K extends keyof DocumentEventMap> = {
  isPromptShown?: boolean
  prompt: {
    display: {
      icon: React.ReactNode
      actionText: React.ReactNode
      objectText: string
    }
    events: { type: K; callback: (e: DocumentEventMap[K]) => void }[]
    onTouchStart?: React.TouchEventHandler<HTMLDivElement>
    onTouchEnd?: React.TouchEventHandler<HTMLDivElement>
    onClick?: React.MouseEventHandler<HTMLDivElement>
  }
}

export type TTriggerAreaProps = {
  /**
   * The target object that the trigger area will be checking for intersections with.
   */
  target: THREE.Object3D | null
  /**
   * Callback to trigger when the intersection begins
   */
  onEnter?: () => void
  /**
   * Callback to trigger when the intersection ends
   */
  onExit?: () => void
  /**
   * Callback to trigger when the intersection is active
   */
  onTrigger?: () => void
  /**
   * Boolean to enable or disable the trigger area
   */
  enabled?: boolean
  /**
   * Shape of the trigger area. We can also provide a custom geometry
   */
  type?: 'sphere' | 'box' | 'customGeometry'
  setIsTriggerEnabled?: (value: boolean) => void
  showTransformControls?: boolean
  setShowTransformControls?: (value: boolean) => void
  isWireframeShown?: boolean
  // the dimensions of the box geometry which makes up the trigger area.
  // Valid only if type is 'box'
  _boxHeight?: number
  _boxWidth?: number
  _boxDepth?: number

  // the color of the wireframe trigger area to show when in debug mode
  color?: string

  // the custom geometry of the trigger area
  geometry?: BufferGeometry
} & MeshProps

const TriggerArea = <K extends keyof DocumentEventMap>({
  target,
  onTrigger,
  onEnter,
  onExit,
  prompt,
  enabled = true,
  setIsTriggerEnabled,
  showTransformControls = false,
  setShowTransformControls,
  isPromptShown,
  type = 'box',
  isWireframeShown = false,
  _boxHeight = 1,
  _boxWidth = 1,
  _boxDepth = 1,
  color = 'red',
  geometry,
  ...meshProps
}: TTriggerAreaProps &
  (TPrompt<K> | { isPromptShown?: never; prompt?: never })) => {
  const triggerAreaRef = useRef<THREE.Mesh>(null)
  const isDebugMode = genericStore((state) => state.isDebugMode)
  const hasStartButtonBeenPressed = HUDStore((state) => state.hasStartButtonBeenPressed)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const breakpoint = GesturesAndDeviceStore((state) => state.breakpoint)

  // a dummy matrix which is used in intersection calculations
  const dummyMatrix = new Matrix4()

  const calculatePromptDistanceFactor = () => {
    switch (breakpoint) {
      case 'xxs':
        return 5
      case 'xs':
        return 7
      case 'sm':
        return 9
      case 'md':
        return 11
      case 'lg':
        return 13
      case 'xl':
        return 15
      default:
        return 17
    }
  }

  const [promptDistanceFactor, setPromptDistanceFactor] = useState(
    calculatePromptDistanceFactor(),
  )

  useEffect(() => {
    setPromptDistanceFactor(calculatePromptDistanceFactor())
  }, [breakpoint])

  // const [isVisible, setIsVisible] = useState(false)

  const [boxWidth, setBoxWidth] = useState<number>(_boxWidth)
  const [boxHeight, setBoxHeight] = useState<number>(_boxHeight)
  const [boxDepth, setBoxDepth] = useState<number>(_boxDepth)

  // const [, , triggerAreaControls] = useControls(
  //   `${meshProps.name} Trigger Area`,
  //   () => ({
  //     enabled: {
  //       value: enabled,
  //       onChange: (value: boolean) => {
  //         setIsTriggerEnabled && setIsTriggerEnabled(value)
  //       },
  //     },
  //     isVisible: {
  //       value: isVisible,
  //       onChange: (value: boolean) => {
  //         setIsVisible && setIsVisible(value)
  //       },
  //     },
  //     isWireframeMode: {
  //       value: isWireframeShown,
  //     },
  //     showTransformControls: {
  //       value: showTransformControls,
  //       onChange: (value: boolean) => {
  //         setShowTransformControls && setShowTransformControls(value)
  //       },
  //     },
  //     transformControlsMode: {
  //       value: 'translate',
  //       options: ['translate', 'rotate', 'scale'],
  //       onChange: (value: 'translate' | 'rotate' | 'scale') => {
  //         setTransformControlsMode(value)
  //       },
  //     },
  //     promptDistanceFactor: {
  //       value: promptDistanceFactor,
  //       min: 0,
  //       max: 100,
  //       step: 0.1,
  //       onChange: (value: number) => {
  //         setPromptDistanceFactor(value)
  //       },
  //     },
  //     boxWidth: {
  //       value: boxWidth,
  //       min: 0,
  //       max: 50,
  //       step: 0.1,
  //       onChange: (value: number) => {
  //         setBoxWidth(value)
  //       },
  //     },
  //     boxHeight: {
  //       value: boxHeight,
  //       min: 0,
  //       max: 50,
  //       step: 0.1,
  //       onChange: (value: number) => {
  //         setBoxHeight(value)
  //       },
  //     },
  //     boxDepth: {
  //       value: boxDepth,
  //       min: 0,
  //       max: 50,
  //       step: 0.1,
  //       onChange: (value: number) => {
  //         setBoxDepth(value)
  //       },
  //     },
  //   }),
  //   {
  //     collapsed: true,
  //     render: () => {
  //       // render the controls only if we are in debug mode
  //       return isDebugMode || false
  //     },
  //   },
  // )

  // If any properties of the trigger area change, we need to recalculate and set a bunch of stuff for
  // intersection calculations to work properly
  useEffect(() => {
    if (!triggerAreaRef.current) return

    setBoxHeight(boxHeight)
    setBoxDepth(boxDepth)
    setBoxWidth(boxWidth)
    triggerAreaRef.current.geometry.computeBoundingBox()
    triggerAreaRef.current.geometry.computeBoundingSphere()
    triggerAreaRef.current.geometry.computeBoundsTree()
    triggerAreaRef.current.updateMatrixWorld()
  }, [triggerAreaRef, meshProps, boxHeight, boxWidth, boxDepth])

  useEffect(() => {
    if (!prompt) return

    /**
     * This function processes a given list of events, adding event listeners for each
     * event type and invoking their respective callback functions when an event
     * intersects the target element.
     *
     * For each event, it adds an event listener on the document and stores a tuple
     * with the event type and event listener function in the eventHandlers array.
     * It also returns a cleanup function that removes all registered event listeners
     * from the document when called.
     */
    const eventHandlers: [K, (e: DocumentEventMap[K]) => void][] = []

    prompt.events.forEach((event, index) => {
      // Add an event listener for the current event type
      eventHandlers.push([
        event.type,
        (e: DocumentEventMap[K]) => {
          // Check if the target element is intersecting with the trigger area
          // and invoke the event's callback function if it is
          if (isIntersecting) event.callback(e)
        },
      ])
      // Add the event listener to the document
      document.addEventListener(event.type, eventHandlers[index][1])
    })

    // Return a cleanup function to remove event listeners
    return () => {
      // Iterate over the eventHandlers array
      eventHandlers.forEach((eventHandler) => {
        // Remove the event listener from the document
        document.removeEventListener(eventHandler[0], eventHandler[1])
      })
    }
  }, [isIntersecting, prompt])

  useFrame(() => {
    if (!genericStore.getState().isTabFocused) return
    if (!enabled) return
    if (!triggerAreaRef.current) return
    if (!triggerAreaRef.current.geometry.boundingBox) return
    if (!target) return
    if (!hasStartButtonBeenPressed) return

    // update both the boxes so we can start checking for intersection
    target.updateMatrixWorld()

    // picked up from here
    // - https://github.com/gkjohnson/three-mesh-bvh/blob/master/example/shapecast.js
    // - https://gkjohnson.github.io/three-mesh-bvh/example/bundle/shapecast.html
    const transformMatrix = dummyMatrix
      .copy(target.matrixWorld)
      .invert()
      .multiply(triggerAreaRef.current.matrixWorld)
    const hit = (target as Mesh).geometry.boundsTree?.intersectsGeometry(
      triggerAreaRef.current.geometry,
      transformMatrix,
    )

    if (hit) {
      if (!isIntersecting) {
        setIsIntersecting(true)
        if (onEnter) onEnter()
      }
      if (onTrigger) onTrigger()
    } else {
      if (isIntersecting) {
        setIsIntersecting(false)
        if (onExit) onExit()
      }
    }
  })

  const [
    transformControlsMode, 
    // setTransformControlsMode
  ] = useState<
    'translate' | 'rotate' | 'scale'
  >('translate')

  return (
    <>
      {showTransformControls && (
        <TransformControls
          object={triggerAreaRef.current ? triggerAreaRef.current : undefined}
          mode={transformControlsMode}
          onMouseUp={() => {
            if (transformControlsMode === 'translate') {
              console.log(triggerAreaRef.current?.position.toArray())
            } else if (transformControlsMode === 'rotate') {
              console.log(triggerAreaRef.current?.rotation.toArray())
            } else if (transformControlsMode === 'scale') {
              console.log(triggerAreaRef.current?.scale.toArray())
            }
          }}
        />
      )}
      <mesh ref={triggerAreaRef} geometry={geometry} {...meshProps}>
        {type === 'box' ? (
          <boxGeometry args={[boxWidth, boxHeight, boxDepth]} />
        ) : type === 'sphere' ? (
          <sphereGeometry />
        ) : type === 'customGeometry' ? null : null}
        <meshBasicMaterial
          color={color}
          wireframe
          visible={isDebugMode}
        />
        {isIntersecting && prompt && isPromptShown && (
          <Html
            distanceFactor={promptDistanceFactor}
            center
            zIndexRange={[0, 0]}
          >
            <div
              className='w-max-content cursor-pointer select-none rounded-md border border-[#C599FFCF] bg-[#17082FB2] p-1 '
              onTouchStart={prompt.onTouchStart}
              onTouchEnd={prompt.onTouchEnd}
              onClick={prompt.onClick}
            >
              <div className='flex items-center gap-2'>
                <div className='flex h-10 w-10 items-center justify-center rounded-md border border-[#C599FFCF]  bg-[#8A2EFF] bg-radialGradient'>
                  <p className='font-bold text-white'>{prompt.display.icon}</p>
                </div>
                <div className='flex flex-col items-start'>
                  {/* <p className='text-xs leading-tight text-gray-400'>
                    {prompt.display.objectText}
                  </p> */}
                  <p className='px-3 pr-5 text-sm font-semibold leading-tight text-white'>
                    {prompt.display.actionText}
                  </p>
                </div>
              </div>
            </div>
          </Html>
        )}
      </mesh>
    </>
  )
}

export default TriggerArea
