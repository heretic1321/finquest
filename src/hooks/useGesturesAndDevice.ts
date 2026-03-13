import { useEffect } from 'react'

import { TBreakpointKeys } from '@client/utils/types'

import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { useGesture } from '@use-gesture/react'

// took these values from MUI https://mui.com/material-ui/customization/breakpoints/
export const breakpoints = {
  xxs: 0,
  xs: 300,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const satisfies Record<TBreakpointKeys, number>


const useGesturesAndDevice = () => {
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)
  const setIsTouchDevice = GesturesAndDeviceStore((state) => state.setIsTouchDevice)
  const screenSize = GesturesAndDeviceStore((state) => state.screenSize)
  const setScreenSize = GesturesAndDeviceStore((state) => state.setScreenSize)
  const setIsDebugMode = genericStore((state) => state.setIsDebugMode)
  const urlParams = GesturesAndDeviceStore((state) => state.urlParams)
  const setIsMobileScreen = GesturesAndDeviceStore((state) => state.setIsMobileScreen)

  // Set `isDebugMode` state based on the URL query parameter
  useEffect(() => {
    setIsDebugMode(urlParams.has('debug') && urlParams.get('debug')?.toLowerCase() === 'true')
  }, [urlParams])

  // to calculate `isMobileScreen`///////////////////////////////
  useEffect(() => {
    if (window.innerWidth < 768) setIsMobileScreen(true)
    else setIsMobileScreen(false)
  }, [setIsMobileScreen])

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) setIsMobileScreen(true)
      else setIsMobileScreen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  ////////////////////////////////////////////////////////////////

  // Update `isTouchDevice` state when the user changes their device
  useEffect(() => {
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsTouchDevice(e.matches)
    }

    const mediaQuery = window.matchMedia('(pointer: coarse)')
    mediaQuery.addEventListener('change', handleMediaChange)

    // Clean up the listener when the component is unmounted
    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange)
    }
  }, [])

  // We want to record if the user is currently using the mouse wheel / finger pinching to zoom in/out
  const setIsPinchOrScrollEventActive = GesturesAndDeviceStore((state) => state.setIsPinchOrScrollEventActive)
  const setIsDragEventActive = GesturesAndDeviceStore((state) => state.setIsDragEventActive)

  // We want to detect if the user's screen is in landscape mode or not
  const isLandscape = GesturesAndDeviceStore((state) => state.isLandscape)
  const setIsLandscape = GesturesAndDeviceStore((state) => state.setIsLandscape)
    
  // We want to record if the user is currently using dragging the orbit controls around
  // Bind drag, pinch and wheel events to the canvas
  // And update the state accordingly
  const setBindGestures = GesturesAndDeviceStore((state) => state.setBindGestures)
  const bind = useGesture(
    {
      onDragStart: () => {
        GesturesAndDeviceStore.getState().isDragging.current = true
        setIsDragEventActive(true)
      },
      onDragEnd: () => {
        GesturesAndDeviceStore.getState().isDragging.current = false
        setIsDragEventActive(false)
      },
      onWheelStart: () => setIsPinchOrScrollEventActive(true),
      onWheelEnd: () => setIsPinchOrScrollEventActive(false),
      onPinchStart: () => setIsPinchOrScrollEventActive(true),
      onPinchEnd: () => setIsPinchOrScrollEventActive(false),
      onDrag: ({delta: [x, y]}) => {
        GesturesAndDeviceStore.getState().dragDeltaX.current = x
        GesturesAndDeviceStore.getState().dragDeltaY.current = y
      },
    },
    {
      pinch: { enabled: isTouchDevice },
      wheel: { enabled: !isTouchDevice },
    },
  )
  useEffect(() => {
    setBindGestures(bind)
  }, [setBindGestures, bind])

  const setDimension = () => {
    setScreenSize({
      dynamicWidth: window.innerWidth,
      dynamicHeight: window.innerHeight,
    })
  }

  const setBreakpoint = GesturesAndDeviceStore((state) => state.setBreakpoint)

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = screenSize.dynamicWidth
      const breakpoint = Object.keys(breakpoints)
        .reverse()
        .find((key) => width > breakpoints[key as keyof typeof breakpoints]) as
        | keyof typeof breakpoints
        | undefined
      setBreakpoint(breakpoint)
    }
    updateBreakpoint()
  }, [screenSize])

  // Update `isLandscape` state when the user changes their device size
  useEffect(() => {
    if (screenSize.dynamicWidth > screenSize.dynamicHeight && !isLandscape) {
      setIsLandscape(true)
    } else if (
      screenSize.dynamicWidth <= screenSize.dynamicHeight &&
      isLandscape
    ) {
      setIsLandscape(false)
    }

    window.addEventListener('resize', setDimension)

    return () => {
      window.removeEventListener('resize', setDimension)
    }
  }, [screenSize])

  return {
  }
}

export default useGesturesAndDevice
