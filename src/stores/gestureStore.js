import { create } from 'zustand'

const useGestureStore = create((set) => ({
  isTouchDevice: false,
  isPinchOrScrollEventActive: false,
  isDragEventActive: false,
  screenSize: { width: window.innerWidth, height: window.innerHeight },

  setIsTouchDevice: (v) => set({ isTouchDevice: v }),
  setScreenSize: (size) => set({ screenSize: size }),
}))

// Detect touch device
if (typeof window !== 'undefined') {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  useGestureStore.setState({ isTouchDevice })

  window.addEventListener('resize', () => {
    useGestureStore.setState({
      screenSize: { width: window.innerWidth, height: window.innerHeight }
    })
  })
}

export default useGestureStore
