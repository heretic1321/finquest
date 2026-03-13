# Task 2.4: Full-Screen Overlay System

## Phase
Phase 2 — UI Layer + Dialogue System + Game Store

## Priority
P0

## Dependencies
- Task 2.1 (Zustand Game Store) must be complete — this component sets `overlayOpen` in the store to disable 3D controls
- Phase 0 must be complete (directory structure exists)

## Objective
Build a reusable full-screen overlay component that dims the 3D world behind it and renders arbitrary children in a centered container. This overlay is used by the Budget allocation mini-game, the SIP calculator, and the End-game report. When open, it sets a flag in the store so the 3D player controls freeze (no walking/camera while interacting with a 2D overlay). Includes a close button, a title, and smooth fade-in/out transitions.

## Detailed Requirements

### 1. File Location
- Create file: `/home/heretic/Documents/Projects/iiitd-hackathon/finquest/src/components/ui/Overlay.jsx`

### 2. Component Props

```jsx
Overlay.propTypes = {
  isOpen: bool,       // Whether the overlay is visible
  onClose: func,      // Callback when the user closes the overlay (X button or Escape)
  title: string,      // Title text shown at the top of the overlay content area
  children: node,     // The content to render inside the overlay (budget game, SIP calc, etc.)
};
```

Do NOT use PropTypes library — just document the expected props. This is a hackathon; skip runtime type checking.

### 3. Component Behavior

#### Opening:
- When `isOpen` transitions from `false` to `true`:
  - Render the backdrop + content container
  - Set `overlayOpen: true` in the Zustand store (so Player component can check this flag and freeze movement)
  - Play fade-in animation (200ms)

#### Closing:
- When the user clicks the X button or presses Escape:
  - Call `onClose()` callback (the parent component is responsible for changing `isOpen` to false)
  - Set `overlayOpen: false` in the store

#### While Open:
- The backdrop captures all pointer events (prevents clicking on the 3D world behind)
- The content area is scrollable if content overflows vertically
- Escape key listener closes the overlay

### 4. Store Integration

```jsx
import useGameStore from '../../stores/gameStore';

function Overlay({ isOpen, onClose, title, children }) {
  const setOverlayOpen = useGameStore((s) => s.setOverlayOpen);

  useEffect(() => {
    setOverlayOpen(isOpen);
    return () => setOverlayOpen(false); // Cleanup on unmount
  }, [isOpen, setOverlayOpen]);

  // ...
}
```

### 5. Component JSX Structure

```jsx
if (!isOpen) return null;

return (
  <div className="overlay">
    {/* Dark backdrop */}
    <div className="overlay__backdrop" onClick={onClose} />

    {/* Content container */}
    <div className="overlay__content">
      {/* Header with title and close button */}
      <div className="overlay__header">
        <h2 className="overlay__title">{title}</h2>
        <button className="overlay__close" onClick={onClose}>
          &times;
        </button>
      </div>

      {/* Scrollable body */}
      <div className="overlay__body">
        {children}
      </div>
    </div>
  </div>
);
```

### 6. Escape Key Handler

```jsx
useEffect(() => {
  if (!isOpen) return;

  const handleKeyDown = (e) => {
    if (e.code === 'Escape') {
      onClose();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isOpen, onClose]);
```

### 7. CSS Styling (inline styles or embedded in component)

Use inline styles or a `<style>` tag within the component file. Do NOT create a separate CSS file.

#### Overlay Root (.overlay)
- `position: fixed`
- `inset: 0` (shorthand for top/right/bottom/left: 0)
- `z-index: 3000` (above BankHUD at 1000 and DialogueBox at 2000)
- `display: flex`
- `align-items: center`
- `justify-content: center`
- `animation: overlay-fade-in 0.2s ease-out`

#### Fade-in Animation
```css
@keyframes overlay-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

#### Backdrop (.overlay__backdrop)
- `position: absolute`
- `inset: 0`
- `background: rgba(0, 0, 0, 0.7)`
- `cursor: pointer` (clicking backdrop closes the overlay)

#### Content Container (.overlay__content)
- `position: relative` (so it sits above the backdrop in stacking context)
- `width: min(800px, 90vw)` — responsive, max 800px wide
- `max-height: 85vh`
- `background: rgba(15, 15, 35, 0.95)`
- `backdrop-filter: blur(20px)`
- `-webkit-backdrop-filter: blur(20px)`
- `border-radius: 20px`
- `border: 1px solid rgba(255, 255, 255, 0.1)`
- `color: #ffffff`
- `font-family: 'Inter', system-ui, -apple-system, sans-serif`
- `display: flex`
- `flex-direction: column`
- `overflow: hidden`
- `animation: overlay-content-scale 0.2s ease-out`

#### Content Scale Animation
```css
@keyframes overlay-content-scale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

#### Header (.overlay__header)
- `display: flex`
- `justify-content: space-between`
- `align-items: center`
- `padding: 20px 24px`
- `border-bottom: 1px solid rgba(255, 255, 255, 0.1)`
- `flex-shrink: 0` (don't compress header when content overflows)

#### Title (.overlay__title)
- `font-size: 20px`
- `font-weight: 700`
- `margin: 0`
- `color: #ffffff`

#### Close Button (.overlay__close)
- `background: rgba(255, 255, 255, 0.1)`
- `border: none`
- `color: rgba(255, 255, 255, 0.7)`
- `font-size: 24px`
- `width: 36px`
- `height: 36px`
- `border-radius: 50%`
- `cursor: pointer`
- `display: flex`
- `align-items: center`
- `justify-content: center`
- `line-height: 1`
- `padding: 0`
- `transition: background 0.15s ease, color 0.15s ease`
- On hover:
  - `background: rgba(255, 255, 255, 0.2)`
  - `color: #ffffff`

#### Body (.overlay__body)
- `padding: 24px`
- `overflow-y: auto`
- `flex: 1` (takes remaining space in the flex column)

#### Scrollbar styling for .overlay__body:
```css
.overlay__body::-webkit-scrollbar {
  width: 6px;
}
.overlay__body::-webkit-scrollbar-track {
  background: transparent;
}
.overlay__body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
```

### 8. Preventing Background Scroll/Interaction

When the overlay is open:
- The backdrop covers the full viewport and captures all clicks (prevents interacting with the 3D world)
- The `overlayOpen` flag in the store is set to `true` — the Player component in Phase 1 should check this flag and skip movement updates when it's true

### 9. Component Export

```jsx
export default Overlay;
```

## Code Patterns & References

### Store integration:
```jsx
const setOverlayOpen = useGameStore((s) => s.setOverlayOpen);

useEffect(() => {
  setOverlayOpen(isOpen);
  return () => setOverlayOpen(false);
}, [isOpen, setOverlayOpen]);
```

### Usage example (how Budget game will use this):
```jsx
import Overlay from '../ui/Overlay';

function BudgetGame() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Overlay isOpen={isOpen} onClose={() => setIsOpen(false)} title="Budget Allocation">
      <div>
        {/* Budget game content goes here */}
        <p>Your salary: ₹18,500 remaining</p>
        {/* ... spending cards, confirm button, etc. */}
      </div>
    </Overlay>
  );
}
```

### From HACKATHON_SCOPE.md:
> Full-screen overlay system for mini-games (budget allocation, SIP calculator)
> A simple overlay component that takes children and dims the 3D world behind it

## Files to Create/Modify
- **Create:** `src/components/ui/Overlay.jsx`

## Acceptance Criteria
- [ ] `Overlay.jsx` exists at `src/components/ui/Overlay.jsx`
- [ ] Component accepts props: `isOpen`, `onClose`, `title`, `children`
- [ ] Returns `null` when `isOpen` is `false`
- [ ] Renders a dark semi-transparent backdrop when `isOpen` is `true`
- [ ] Renders children inside a centered content container
- [ ] Shows the `title` in a header bar
- [ ] Close button (X) in top-right of content area calls `onClose`
- [ ] Clicking the backdrop calls `onClose`
- [ ] Pressing Escape key calls `onClose`
- [ ] Sets `overlayOpen: true` in the store when opening
- [ ] Sets `overlayOpen: false` in the store when closing or unmounting
- [ ] Content area is scrollable if content overflows vertically
- [ ] Fade-in animation plays on open (200ms)
- [ ] Content container has scale-up entrance animation
- [ ] z-index is 3000 (above BankHUD and DialogueBox)
- [ ] Content container max width is 800px, max height is 85vh
- [ ] Component exported as default export
- [ ] No console errors

## Technical Notes
- Like BankHUD and DialogueBox, this is an HTML overlay rendered OUTSIDE the `<Canvas>`.
- The `z-index: 3000` ensures it renders above everything else. The stacking order is: Canvas (0) < BankHUD (1000) < DialogueBox (2000) < Overlay (3000).
- There is intentionally no exit animation. The component simply unmounts (returns `null`) when `isOpen` becomes false. Exit animations require keeping the DOM alive during the transition (e.g., framer-motion's `AnimatePresence`), which adds complexity not worth the time.
- The `onClose` prop is called for ALL close triggers (X button, backdrop click, Escape key). The parent component decides what to do — typically sets its own `isOpen` state to false.
- The store flag `overlayOpen` is used by the 3D Player component (from Phase 1) to freeze movement. The Player should check `useGameStore(s => s.overlayOpen)` and return early from its movement logic when true.
- Content inside the overlay can be any React components — the Budget game, SIP calculator, and End-game report will each pass their own UI as children.

## Estimated Complexity
Simple
