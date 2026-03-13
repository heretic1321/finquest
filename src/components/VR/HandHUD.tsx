import {
  useXRControllerButtonEvent,
  useXRInputSourceState,
} from '@react-three/xr'

import { useShallow } from 'zustand/react/shallow'

import { HUDStore } from '@client/contexts/HUDContext'
import { vrStore } from '@client/contexts/VRStateContext'

import HandMenu from './HandMenu'
import HandStorePromptUI from './HandStorePromptUI'

function HandHud() {
  const { isVRHudVisible, setIsVRHudVisible } = vrStore(
    useShallow((state) => ({
      isVRHudVisible: state.isVRHudVisible,
      setIsVRHudVisible: state.setIsVRHudVisible,
    })),
  )

  const {
    setStoreRequestedToEnter,
    setIsEnterStorePromptShown,
    setEnterStorePromptStoreName,
    enterStorePromptStoreName,
    isEnterStorePromptShown,
    isExitStorePromptShown,
    setIsExitStorePromptShown,
    setExitStorePromptStoreName,
    exitStorePromptStoreName,
    setStoreRequestedToExit,
  } = HUDStore(
    useShallow((state) => ({
      setStoreRequestedToEnter: state.setStoreRequestedToEnter,
      setIsEnterStorePromptShown: state.setIsEnterStorePromptShown,
      setEnterStorePromptStoreName: state.setEnterStorePromptStoreName,
      enterStorePromptStoreName: state.enterStorePromptStoreName,
      isEnterStorePromptShown: state.isEnterStorePromptShown,
      isExitStorePromptShown: state.isExitStorePromptShown,
      setIsExitStorePromptShown: state.setIsExitStorePromptShown,
      setExitStorePromptStoreName: state.setExitStorePromptStoreName,
      exitStorePromptStoreName: state.exitStorePromptStoreName,
      setStoreRequestedToExit: state.setStoreRequestedToExit,
    })),
  )

  const controllerRight = useXRInputSourceState('controller', 'right')
  const controllerLeft = useXRInputSourceState('controller', 'left')

  useXRControllerButtonEvent(controllerRight, 'a-button', (state) => {
    if (state === 'pressed') {
      if (isEnterStorePromptShown) {
        setStoreRequestedToEnter(enterStorePromptStoreName)
        setIsEnterStorePromptShown(false)
        setEnterStorePromptStoreName('')
      } else if (isExitStorePromptShown) {
        setStoreRequestedToExit({
          nameOfStoreToExit: exitStorePromptStoreName,
          exitingVia: 'gate',
        })
        setIsExitStorePromptShown(false)
        setExitStorePromptStoreName('')
      }
    }
  })

  useXRControllerButtonEvent(controllerLeft, 'x-button', (state) => {
    if (state === 'pressed') {
      setIsVRHudVisible(!isVRHudVisible)
    }
  })

  return (
    <>
      <HandStorePromptUI />
      <HandMenu />
    </>
  )
}

export default HandHud
