import { create } from 'zustand';

/**
 * Control mode store for switching between keyboard and point-to-move navigation.
 *
 * Modes:
 *   - "keyboard"    : Default WASD/arrow key movement with free camera orbit
 *   - "pointToMove" : Click on the ground to move the character toward the clicked point.
 *                     Uses ecctrl's built-in PointToMove mode. Keyboard still works as override.
 *
 * Usage:
 *   const mode = useControlMode((s) => s.mode);
 *   const toggleMode = useControlMode((s) => s.toggleMode);
 *
 * In Player.jsx, pass `mode="PointToMove"` to <Ecctrl> when mode === "pointToMove".
 *
 * For PointToMove to function, something in the scene must raycast clicks
 * onto the ground plane and call:
 *   import { useGame } from "ecctrl";
 *   const setMoveToPoint = useGame((state) => state.setMoveToPoint);
 *   setMoveToPoint(clickedWorldPosition); // THREE.Vector3
 */
const useControlMode = create((set, get) => ({
  mode: 'keyboard', // 'keyboard' | 'pointToMove'

  toggleMode: () =>
    set({ mode: get().mode === 'keyboard' ? 'pointToMove' : 'keyboard' }),

  setMode: (mode) => set({ mode }),
}));

export default useControlMode;
