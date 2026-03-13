import { useEffect, useRef, useState, useCallback } from 'react'

import { BsChevronDoubleUp } from 'react-icons/bs'

import Button from '@client/components/shared/Button'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { useShallow } from 'zustand/react/shallow'
import { genericStore } from '@client/contexts/GlobalStateContext'

const JumpButton = () => {
  const screenSize = GesturesAndDeviceStore((state) => state.screenSize)
  const { jumpButtonTapped, setJumpButtonTapped } = HUDStore(
    useShallow((state) => ({
      jumpButtonTapped: state.jumpButtonTapped,
      setJumpButtonTapped: state.setJumpButtonTapped,
    }))
  )
  // size of the jump button div in px
  const [size, setSize] = useState(0)
  // position of the jump button div in vw and vh units
  const [position, setPosition] = useState({ right: 0, bottom: 0 })

  // whenever screen size changes, recalculate the size and position of the jump button
  useEffect(() => {
    if (screenSize !== undefined && screenSize !== null) {
      let newButtonSize = 0
      if (screenSize.dynamicHeight >= screenSize.dynamicWidth) {
        newButtonSize = screenSize.dynamicHeight * 0.2
      } else {
        newButtonSize = screenSize.dynamicWidth * 0.2
      }
      setSize(newButtonSize)

      setPosition({
        right: (newButtonSize / 2 / screenSize.dynamicWidth) * 100,
        bottom: (newButtonSize / 2 / screenSize.dynamicHeight) * 100,
      })
    }
  }, [screenSize])

  // whenever jump button is tapped, set `jumpButtonTapped` back to false after 100ms
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (jumpButtonTapped === true) {
      timer = setTimeout(() => {
        setJumpButtonTapped(false)
      }, 100)
    }
    return () => {
      clearTimeout(timer)
    }
  }, [jumpButtonTapped])

  const jumpButtonRoot = useRef<HTMLButtonElement | null>(null)
  const jumpButtonRef = useCallback((el: HTMLButtonElement | null) => {
    if (el) {
      jumpButtonRoot.current = el
      genericStore.setState({ jumpButtonRoot: el })
    } else {
      jumpButtonRoot.current = null
      genericStore.setState({ jumpButtonRoot: null })
    }
  }, [])

  // Render the Button component with the calculated styles and properties
  return (
    <Button
      className='absolute block rounded-full border border-[#6f00ffcf] bg-[#17082FB2] p-2 '
      style={{
        right: `${position.right}vw`,
        bottom: `${position.bottom}vh`,
        width: `${size / 2.5}px`,
        height: `${size / 2.5}px`,
        marginRight: `-${size / 4}px`,
        marginBottom: `-${size / 4}px`,
      }}
      onTouchStart={() => setJumpButtonTapped(true)}
      ref={jumpButtonRef}
    >
      <BsChevronDoubleUp className='mx-auto my-auto h-5/6 w-5/6 fill-[#C599FF] stroke-[#C599FF]  opacity-70' />
    </Button>
  )
}
export default JumpButton
