import { createContext, createRef, MutableRefObject } from 'react'

import { create } from 'zustand'

import useGesturesAndDevice, {
  breakpoints,
} from '@client/hooks/useGesturesAndDevice'

import { ReactDOMAttributes } from '@use-gesture/react/dist/declarations/src/types'

export type GesturesAndDeviceContextType = {}

export const GesturesAndDeviceContext =
  createContext<GesturesAndDeviceContextType>({})

interface GesturesAndDeviceZustandState {
  isTouchDevice: boolean
  setIsTouchDevice: (x: boolean) => void
  isPinchOrScrollEventActive: boolean
  setIsPinchOrScrollEventActive: (x: boolean) => void
  isDragEventActive: boolean
  setIsDragEventActive: (x: boolean) => void
  bindGestures: (...args: any[]) => ReactDOMAttributes
  setBindGestures: (x: (...args: any[]) => ReactDOMAttributes) => void
  disableTouchAction: (x: HTMLElement) => void
  screenSize: { dynamicWidth: number; dynamicHeight: number }
  setScreenSize: (x: { dynamicWidth: number; dynamicHeight: number }) => void
  isLandscape: boolean
  setIsLandscape: (x: boolean) => void
  toggleFullscreen: () => void
  isInFullscreen: boolean
  breakpoint: keyof typeof breakpoints | undefined
  setBreakpoint: (x: keyof typeof breakpoints | undefined) => void
  urlParams: URLSearchParams
  isMobileScreen: boolean
  setIsMobileScreen: (x: boolean) => void

  dragDeltaX: MutableRefObject<number>
  dragDeltaY: MutableRefObject<number>
  isDragging: MutableRefObject<boolean>
}

const dragDeltaX = createRef<number>() as MutableRefObject<number>
dragDeltaX.current = 0

const dragDeltaY = createRef<number>() as MutableRefObject<number>
dragDeltaY.current = 0

const isDragging = createRef<boolean>() as MutableRefObject<boolean>
isDragging.current = false

export const GesturesAndDeviceStore = create<GesturesAndDeviceZustandState>(
  (set) => ({
    isTouchDevice:
      'ontouchstart' in window ||
      window.matchMedia('(pointer: coarse)').matches,
    setIsTouchDevice: (x: boolean) => set({ isTouchDevice: x }),
    isPinchOrScrollEventActive: false,
    setIsPinchOrScrollEventActive: (x: boolean) =>
      set({ isPinchOrScrollEventActive: x }),
    isDragEventActive: false,
    setIsDragEventActive: (x: boolean) => set({ isDragEventActive: x }),
    bindGestures: () => ({}),
    setBindGestures: (x: (...args: any[]) => ReactDOMAttributes) =>
      set({ bindGestures: x }),
    disableTouchAction: (domElement: HTMLElement) => {
      domElement.style.touchAction = 'none'
    },
    screenSize: {
      dynamicWidth: window.innerWidth,
      dynamicHeight: window.innerHeight,
    },
    setScreenSize: (x: { dynamicWidth: number; dynamicHeight: number }) =>
      set({ screenSize: x }),
    isLandscape: false,
    setIsLandscape: (x: boolean) => set({ isLandscape: x }),
    toggleFullscreen: () => {
      const document = window.document
      const isInFullScreen = document.fullscreenElement

      const methodToRequestFullscreen =
        document.documentElement.requestFullscreen

      const methodToExitFullscreen = document.exitFullscreen

      if (!isInFullScreen) {
        methodToRequestFullscreen.call(document.documentElement)
        set({ isInFullscreen: true })
      } else {
        methodToExitFullscreen.call(document)
        set({ isInFullscreen: false })
      }
    },
    isInFullscreen: false,
    breakpoint: undefined,
    setBreakpoint: (x: keyof typeof breakpoints | undefined) =>
      set({ breakpoint: x }),
    urlParams: new URLSearchParams(window.location.search),
    isMobileScreen: false,
    setIsMobileScreen: (x: boolean) => set({ isMobileScreen: x }),

    dragDeltaX,
    dragDeltaY,
    isDragging,
  }),
)

export const GesturesAndDeviceContextProvider = ({
  children,
}: React.PropsWithChildren) => {
  useGesturesAndDevice()
  return (
    <GesturesAndDeviceContext.Provider value={{}}>
      {children}
    </GesturesAndDeviceContext.Provider>
  )
}
