import { MutableRefObject, useEffect } from 'react'

import nipple, {
  EventData,
  JoystickManager,
  JoystickManagerOptions,
  JoystickOutputData,
} from 'nipplejs'

import { PlayerConfigStore } from '@client/components/Character'
import { SoundsStore } from '@client/components/Sounds'
import { AvatarStore } from '@client/contexts/AvatarAppearanceContext'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { InventoryConsoleHUDStore } from '@client/contexts/InventoryConsoleHUDContext'
import { useShallow } from 'zustand/react/shallow'
import { genericStore } from '@client/contexts/GlobalStateContext'

// NOTE -- this will be needed when we decide to enable the follow along functionality of joystick
// This is the position the joystick starts from
// and where the joystick should return to when the user releases the joystick
// const JOYSTICK_DEFAULT_POSITION: Position = {
//   "x": 95.1953125,
//   "y": 792.8046875
// }

// Define keys and their corresponding actions
export const keys = {
  KeyW: 'forward',
  KeyS: 'backward',
  KeyA: 'left',
  KeyD: 'right',
  Space: 'jump',
  ShiftLeft: 'sprint',
  ShiftRight: 'sprint',
} as const
export type Keys = typeof keys

// Function to map key to its corresponding action
const moveFieldByKey = (key: string) => keys[key as keyof Keys]

// Define the Movement type
/**
 * Movement controls
 * direction - This tell us which direction the player is moving in (plus jumping).
 *              All properties of direction object can toggle between true/false according to the controller input
 *
 * joystick.ngle - The angle of the joystick in radians. This is adjusted angle not the original one recorded by the joystick.
 *                 For this adjusted angle, we measure all the angles from the Y axis and not the X axis.
 *                 You can assume that the joystick is rotated by 90 degrees in the X axis.
 *                 All angles on left side of the joystick are positive and all angles on the right side of the joystick are negative
 *
 * joystick.distance - The distance of the joystick tap circle from the center. This is a value between 0 and 1
 * joystick.direction.x - The direction of the joystick tap circle in the X axis. This can be either "left" or "right"
 * joystick.direction.y - The direction of the joystick tap circle in the Y axis. This can be either "up" or "down"
 *                      This and joystickDirectionX can be used to determine the quadrant in which the joystick is in
 * joystick.quadrant - The quadrant in which the joystick is in. Quadrants go from 1 to 4, anticlockwise
 */
export type Movement = {
  direction: Record<Keys[keyof Keys], boolean>
  joystick: {
    angle: number | null
    distance: number | null
    direction: {
      x: string | null
      y: string | null
    }
    quadrant: number | null
  }
}

// This is to compute the quadrant in which the joystick is in. Quadrants go from 1 to 4, anticlockwise
const computeJoystickQuadrant = (
  joystickDirectionX: string,
  joystickDirectionY: string,
): number => {
  if (joystickDirectionX === 'right' && joystickDirectionY === 'up') return 1
  if (joystickDirectionX === 'left' && joystickDirectionY === 'up') return 2
  if (joystickDirectionX === 'left' && joystickDirectionY === 'down') return 3
  return 4
}

const useCharacterControls = (
  // joystickDefaultPosition: Position = JOYSTICK_DEFAULT_POSITION
  movementDataRef: MutableRefObject<Movement>,
  isPlayerOnGround: MutableRefObject<boolean>,
  playerVelocity: MutableRefObject<THREE.Vector3>,
  isOtherPlayer: boolean
) => {
  if (isOtherPlayer) return

  const {
    showChatbox,
    showTreasureHuntScreen,
    jumpButtonTapped,
    hasStartButtonBeenPressed,
    isPresentationMode,
    showDialogScreen,
    isMobileMenuOpen,
    showCart,
    showHowToPlayScreen,
    showNotLoggedInModal,
  } = HUDStore(
    useShallow((state) => ({
      showChatbox: state.showChatbox,
      showTreasureHuntScreen: state.showTreasureHuntScreen,
      jumpButtonTapped: state.jumpButtonTapped,
      hasStartButtonBeenPressed: state.hasStartButtonBeenPressed,
      isPresentationMode: state.isPresentationMode,
      showDialogScreen: state.showDialogScreen,
      isMobileMenuOpen: state.isMobileMenuOpen,
      showCart: state.showCart,
      showHowToPlayScreen: state.showHowToPlayScreen,
      showNotLoggedInModal: state.showNotLoggedInModal,
    }))
  )

  const inventoryConsoleHUDContext = InventoryConsoleHUDStore(
    useShallow((state) => ({
      isPresentationMode: state.isPresentationMode,
    }))
  )
  const isTutorialEnabled = genericStore((state) => state.isTutorialEnabled)
  const screenSize = GesturesAndDeviceStore((state) => state.screenSize)
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)

  let joystickSize = 0
  let joystickPosition = {
    left: '',
    bottom: '',
  }  

  // NOTE -- This is to make sure that the joystick is always a square
  // and that the joystick is always a certain percentage of the screen size
  // Along with that, the joystick should be positioned in the bottom left corner of the screen
  // with the circumference of the joystick touching the bottom left corner of the screen
  if (screenSize !== undefined && screenSize !== null) {
    if (screenSize.dynamicHeight >= screenSize.dynamicWidth)
      joystickSize = screenSize.dynamicHeight * 0.2
    else joystickSize = screenSize.dynamicWidth * 0.2

    joystickPosition = {
      left: `${(joystickSize / 2 / screenSize.dynamicWidth) * 100}vw`,
      bottom: `${(joystickSize / 2 / screenSize.dynamicHeight) * 100}vh`,
    }
  }

  const jumped = () => {
    if (isPlayerOnGround.current) {
      playerVelocity.current.y = PlayerConfigStore.getState().jumpDistance
      isPlayerOnGround.current = false
      if (AvatarStore.getState().avatarAnimationState !== 'jump') {
        AvatarStore.getState().setAvatarAnimationState('jump')
      }

      SoundsStore.getState().playJumpSoundOnce()
      SoundsStore.getState().stopWalkingSound()
      setTimeout(() => {
        if (
          movementDataRef.current.direction.forward === true || 
          movementDataRef.current.direction.backward === true ||
          movementDataRef.current.direction.left === true ||
          movementDataRef.current.direction.right === true
        ) SoundsStore.getState().playWalkingSound()
      }, 1000)
    }
  }

  // setup for keyboard
  useEffect(() => {
    // Function to handle key events
    const handleKey = (e: KeyboardEvent, isKeyDown: boolean) => {
      if (isKeyDown && PlayerConfigStore.getState().isPlayerParalysedRef.current) return
      if (e.repeat) return
      if (Object.keys(keys).includes(e.code)) {
        movementDataRef.current.direction[moveFieldByKey(e.code)] = isKeyDown

        // handle jumping
        if (e.code.toLowerCase() == 'space' && isKeyDown) jumped()

        if (
          e.code == "KeyA" || 
          e.code == "KeyD" || 
          e.code == "KeyW" || 
          e.code == "KeyS"
        ) {
          if (isKeyDown) {
            SoundsStore.getState().playWalkingSound()
          } else {
            if (
              movementDataRef.current.direction.forward === true || 
              movementDataRef.current.direction.backward === true ||
              movementDataRef.current.direction.left === true ||
              movementDataRef.current.direction.right === true
            ) return

            SoundsStore.getState().stopWalkingSound()
          }
        }

        if (movementDataRef.current.direction.sprint) {
          SoundsStore.getState().walkingSoundRef.current?.rate(1)
        } else {
          SoundsStore.getState().walkingSoundRef.current?.rate(0.75)
        }
      }
    }

    // Handle keydown and keyup events
    const handleKeyDown = (e: KeyboardEvent) => handleKey(e, true)
    const handleKeyUp = (e: KeyboardEvent) => handleKey(e, false)

    // Add event listeners for key events
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    // Cleanup event listeners on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // update the movement state whenever jump button is active or inactive
  useEffect(() => {
    if (jumpButtonTapped === true) {
      jumped()
    }
  }, [jumpButtonTapped])

  // setup for joystick
  useEffect(() => {
    if (
      isTouchDevice === undefined ||
      isTouchDevice === null ||
      isTouchDevice === false ||
      showCart === true ||
      showChatbox === true ||
      showDialogScreen === true ||
      showTreasureHuntScreen === true ||
      hasStartButtonBeenPressed === false ||
      isPresentationMode === true ||
      inventoryConsoleHUDContext.isPresentationMode === true ||
      isMobileMenuOpen === true ||
      showHowToPlayScreen === true ||
      showNotLoggedInModal === true
    )
      return

    const options: JoystickManagerOptions = {
      position: isTutorialEnabled
        ? {
            left: joystickPosition.left,
            bottom: `${(joystickSize / 2 / screenSize.dynamicHeight) * 400}vh`,
          }
        : joystickPosition,
      zone: document.getElementById('joystick') || undefined,
      mode: 'static',
      restJoystick: true,
      size: joystickSize,
      follow: false, // NOTE -- Make this true when we want to enable the follow along functionality of joystick
    }

    const joystickCollection: JoystickManager = nipple.create(options)

    // Visually changing the joystick to look like a ring
    // encircling the inner joystick button

    // NOTE -- adding ts-ignore here because nipplejs API doesn't have `options` as a property of JoystickManager
    // eslint-disable-next-line
    // @ts-ignore
    const backDiv = joystickCollection.options.zone.querySelector('.back')
    // eslint-disable-next-line
    // @ts-ignore
    const frontDiv = joystickCollection.options.zone.querySelector('.front')
    backDiv.style.backgroundColor = 'rgba(0, 0, 0, 0)'
    backDiv.style.border = '5px solid rgba(111, 0, 255, 1)'
    frontDiv.style.backgroundColor = 'rgba(99, 14, 185, 1)'

    genericStore.setState({ joystickRoot: frontDiv.parentElement.parentElement })

    // positioning the joystick to return to the starting position after
    // the user leaves the touch on joystick.
    // NOTE -- currently this is not being used as the joystick is fixed.
    // const repositionJoystickToOriginalPosition = () => {
    //   joystickInstance.position = JSON.parse(JSON.stringify(joystickDefaultPosition))
    //   joystickInstance.ui.el.style.removeProperty('top')
    //   joystickInstance.ui.el.style.left = "10vh"
    //   joystickInstance.ui.el.style.bottom = "10vh"
    //   joystickInstance.ui.front.style.removeProperty('transition')
    // }


    // Handle joystick move event
    const handleMove = (_evt: EventData, data: JoystickOutputData) => {
      if (!data.direction) return

      // Calculate angle based on joystick data
      let angle = 0
      // Normalizing the recorded angle to be between 0 and PI on the left side
      // and between 0 and -PI on the right side
      if (data.direction.x === 'right' && data.direction.y === 'up') {
        angle = data.angle.radian + (3 * Math.PI) / 2
      } else {
        angle = data.angle.radian - Math.PI / 2
      }
      const distance = data.distance / (joystickSize / 2)
      // Update movement state with new direction, angle, and distance
      movementDataRef.current.joystick = {
        angle: angle,
        distance: distance,
        direction: {
          x: data.direction.x,
          y: data.direction.y,
        },
        quadrant: computeJoystickQuadrant(data.direction.x, data.direction.y),
      }

      SoundsStore.getState().playWalkingSound()

      const sprint = distance > 0.3
      if (sprint) {
        SoundsStore.getState().walkingSoundRef.current?.rate(1)
      } else {
        SoundsStore.getState().walkingSoundRef.current?.rate(0.75)
      }
    }

    // Handle joystick release event
    const handleRelease = () => {
      movementDataRef.current.direction = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: movementDataRef.current.direction.jump,
        sprint: false,
      }

      movementDataRef.current.joystick = {
        angle: null,
        distance: null,
        direction: {
          x: null,
          y: null,
        },
        quadrant: null,
      }

      SoundsStore.getState().stopWalkingSound()
      // NOTE - uncomment below line when we want to enable the follow along functionality of joystick
      // repositionJoystickToOriginalPosition()
    }

    // Add event listeners for joystick events
    joystickCollection.on('move', handleMove)
    joystickCollection.on('end', handleRelease)

    // Cleanup event listeners and destroy joystick manager on unmount
    return () => {
      // setting the movement related data to null
      handleRelease()
      joystickCollection.off('move', handleMove)
      joystickCollection.off('end', handleRelease)
      joystickCollection.destroy()
    }
  }, [
    showChatbox,
    showCart,
    screenSize,
    isMobileMenuOpen,
    isTouchDevice,
    hasStartButtonBeenPressed,
    isPresentationMode,
    inventoryConsoleHUDContext.isPresentationMode,
    showDialogScreen,
    showTreasureHuntScreen,
    showHowToPlayScreen,
    showNotLoggedInModal,
    isTutorialEnabled,
  ])

}

export default useCharacterControls
