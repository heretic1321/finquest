# TASK 05: FinQuest Bank HUD Overlay

## Phase
Phase 2b — Persistent UI Layer

## Priority
P0 (Core mechanic — visible during entire gameplay)

## Prerequisites
- TASK_04 (Zustand Game Store) must be complete — HUD reads from `useGameStore`
- Project setup complete (React, Vite running)

## Goal
Build a persistent HTML overlay (outside the Canvas, in React DOM) in the top-right corner showing the player's bank balance, financial health bar, and current month. Balance changes trigger a color flash animation.

## Detailed Requirements

### 1. Files to Create

```
src/components/ui/BankHUD.jsx       <-- The HUD component
src/components/ui/BankHUD.css       <-- Styles for the HUD
src/utils/formatINR.js              <-- Indian rupee formatting utility
```

### 2. BankHUD Component

This is a **React DOM component** rendered OUTSIDE the `<Canvas>`. It sits on top of the 3D world as an HTML overlay.

#### Structure
```jsx
<div className="bank-hud">
  <div className="bank-hud__balance">
    <span className="bank-hud__label">Balance</span>
    <span className="bank-hud__amount" data-flash={flashType}>
      ₹{formatINR(balance)}
    </span>
  </div>
  <div className="bank-hud__health">
    <span className="bank-hud__label">Financial Health</span>
    <div className="bank-hud__health-bar">
      <div className="bank-hud__health-fill" style={{ width: `${financialHealth}%` }} />
    </div>
    <span className="bank-hud__health-value">{financialHealth}/100</span>
  </div>
  <div className="bank-hud__month">
    Month {month}/{FINANCIAL_CONSTANTS.TOTAL_MONTHS}
  </div>
</div>
```

#### State Reads (from Zustand)
```js
const balance = useGameStore((s) => s.balance);
const financialHealth = useGameStore((s) => s.financialHealth);
const month = useGameStore((s) => s.month);
```

#### Balance Flash Animation

When `balance` changes, detect if it went up (income) or down (expense) and trigger a CSS animation:

```jsx
const [flashType, setFlashType] = useState(null);
const prevBalance = useRef(balance);

useEffect(() => {
  if (balance > prevBalance.current) {
    setFlashType('income');
  } else if (balance < prevBalance.current) {
    setFlashType('expense');
  }
  prevBalance.current = balance;

  const timeout = setTimeout(() => setFlashType(null), 600);
  return () => clearTimeout(timeout);
}, [balance]);
```

### 3. formatINR Utility

Indian number formatting with comma separators (lakh/crore system):

```js
// src/utils/formatINR.js
export function formatINR(amount) {
  const isNegative = amount < 0;
  const abs = Math.abs(Math.round(amount));
  const str = abs.toString();

  if (str.length <= 3) return (isNegative ? '-' : '') + str;

  // Indian system: last 3 digits, then groups of 2
  let result = str.slice(-3);
  let remaining = str.slice(0, -3);
  while (remaining.length > 0) {
    result = remaining.slice(-2) + ',' + result;
    remaining = remaining.slice(0, -2);
  }

  return (isNegative ? '-' : '') + result;
}
```

Examples:
- `formatINR(45000)` → `"45,000"`
- `formatINR(800000)` → `"8,00,000"`
- `formatINR(18500)` → `"18,500"`
- `formatINR(-5000)` → `"-5,000"`
- `formatINR(0)` → `"0"`

### 4. CSS Styling

```css
/* src/components/ui/BankHUD.css */

.bank-hud {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;

  background: rgba(10, 10, 10, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px 20px;

  min-width: 200px;
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;

  pointer-events: auto;
}

/* Parent overlay container should have pointer-events: none
   so clicks pass through to the 3D canvas.
   The HUD itself has pointer-events: auto. */

.bank-hud__label {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 2px;
}

.bank-hud__amount {
  display: block;
  font-size: 28px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

/* Flash animations */
.bank-hud__amount[data-flash="income"] {
  animation: flash-income 0.6s ease-out;
}

.bank-hud__amount[data-flash="expense"] {
  animation: flash-expense 0.6s ease-out;
}

@keyframes flash-income {
  0%   { color: #4caf50; text-shadow: 0 0 12px rgba(76, 175, 80, 0.6); }
  100% { color: #fff; text-shadow: none; }
}

@keyframes flash-expense {
  0%   { color: #f44336; text-shadow: 0 0 12px rgba(244, 67, 54, 0.6); }
  100% { color: #fff; text-shadow: none; }
}

/* Financial health bar */
.bank-hud__health {
  margin-top: 12px;
}

.bank-hud__health-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;
}

.bank-hud__health-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease, background-color 0.5s ease;
}

/* Health bar color based on value — set via inline style or dynamic class */

.bank-hud__health-value {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.bank-hud__month {
  margin-top: 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
```

#### Health Bar Color Gradient

Compute the fill color based on the health value in the component:

```js
function getHealthColor(health) {
  if (health >= 80) return '#4caf50';  // Green — excellent
  if (health >= 60) return '#8bc34a';  // Light green — good
  if (health >= 40) return '#ffc107';  // Yellow — warning
  if (health >= 20) return '#ff9800';  // Orange — danger
  return '#f44336';                     // Red — critical
}
```

Apply as inline style: `backgroundColor: getHealthColor(financialHealth)`

### 5. Integration with App

The HUD must be rendered OUTSIDE the Canvas in App.jsx. The layout pattern:

```jsx
// In App.jsx
import { BankHUD } from './components/ui/BankHUD';

function App() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* UI Overlay Layer — pointer-events: none, HUD children are auto */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
        <BankHUD />
      </div>

      {/* 3D Canvas */}
      <Canvas ...>
        {/* ... 3D world ... */}
      </Canvas>
    </div>
  );
}
```

**IMPORTANT:** The BankHUD is placed in a fixed overlay div with `pointer-events: none`. The `.bank-hud` class itself has `pointer-events: auto` so it can be interacted with if needed, but the surrounding overlay doesn't block Canvas mouse events.

### 6. Key Implementation Details

- Use `useRef` to track previous balance for flash direction detection
- Use `data-flash` attribute + CSS animation (not JS animation) for the flash effect
- Reset the flash animation by setting `flashType` to null after 600ms timeout
- To re-trigger CSS animation on same type (e.g., two incomes in a row), briefly set to null between: the `useEffect` cleanup handles this via the timeout
- The health bar fill div uses `transition` for smooth width changes
- All font sizes use px for consistent rendering
- Use `font-variant-numeric: tabular-nums` on the balance so digits don't shift

## File Structure

```
src/
  components/
    ui/
      BankHUD.jsx          <-- CREATE
      BankHUD.css          <-- CREATE
  utils/
    formatINR.js           <-- CREATE
```

## Acceptance Criteria

- [ ] `BankHUD.jsx` renders outside the Canvas as a DOM overlay
- [ ] Shows balance formatted in Indian rupee style (e.g., "45,000", "8,00,000")
- [ ] Shows financial health bar with color gradient (red to green based on 0-100)
- [ ] Shows month indicator (e.g., "Month 1/12")
- [ ] Balance flashes green on income (balance increase)
- [ ] Balance flashes red on expense (balance decrease)
- [ ] Flash animation lasts ~600ms and fades back to white
- [ ] Semi-transparent dark background with backdrop blur
- [ ] Does NOT block click events on the 3D Canvas (pointer-events handled correctly)
- [ ] Reads state from `useGameStore` using selectors (not full store subscription)
- [ ] `formatINR()` utility correctly handles Indian comma placement: last 3 digits, then groups of 2
- [ ] `formatINR()` handles 0, negative numbers, and large numbers (lakhs, crores)

## What NOT to Do

- Do NOT render inside the Canvas (no `<Html>` from drei) — this is a DOM overlay
- Do NOT add expandable/collapsible sections (keep it simple for hackathon)
- Do NOT show transaction history in the HUD (that's for the end-game report)
- Do NOT add click handlers or interactivity beyond visual display
- Do NOT use any animation library (CSS keyframes are sufficient)
- Do NOT add a "View Report" button (that will be added in a later task)
- Do NOT import Three.js or R3F in this component — it's pure React DOM

## Estimated Complexity
Simple — one presentational component, one utility function, CSS styling.
