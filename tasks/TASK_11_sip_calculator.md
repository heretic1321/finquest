# TASK 11: SIP Calculator

## Phase
Phase 6 -- SIP Calculator

## Priority
P0

## Prerequisites
- TASK_04 (game store -- startSIP, investments state)
- TASK_07 (overlay system -- full-screen overlay)
- TASK_03 (NPCs -- MF Advisor Priya NPC at MF Tower)

## Goal
Build a full-screen overlay SIP calculator with 3 sliders (monthly amount, return %, years), live-updating result numbers, a "what if you started 5 years later" comparison, and a "Start SIP" button that commits the investment to the game store.

## Detailed Requirements

### 1. SIP Calculator Component -- `src/components/minigames/SIPCalculator.jsx`

Rendered inside the Overlay from TASK_07. Triggered by talking to MF Advisor Priya.

### 2. Three Sliders

| Slider | Min | Max | Default | Step | Label |
|--------|-----|-----|---------|------|-------|
| Monthly Amount | 1,000 | 15,000 | 5,000 | 500 | Monthly SIP Amount |
| Expected Return | 8 | 15 | 12 | 0.5 | Expected Annual Return (%) |
| Investment Duration | 5 | 30 | 20 | 1 | Years |

### 3. SIP Calculation Formula

Future Value of SIP:
```
FV = P * [(1 + r)^n - 1] / r * (1 + r)

Where:
  P = monthly investment amount
  r = monthly rate of return (annual rate / 12 / 100)
  n = total number of months (years * 12)
```

```js
function calculateSIP(monthly, annualReturn, years) {
  const r = annualReturn / 12 / 100
  const n = years * 12
  const totalInvested = monthly * n
  const futureValue = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
  const wealthGained = futureValue - totalInvested

  return {
    totalInvested: Math.round(totalInvested),
    futureValue: Math.round(futureValue),
    wealthGained: Math.round(wealthGained),
  }
}
```

### 4. UI Layout

```
┌────────────────────────────────────────────────────┐
│  SIP CALCULATOR                                     │
│                                                      │
│  Monthly Amount: [====o==========] Rs 5,000         │
│  Expected Return: [========o======] 12% p.a.        │
│  Duration: [===========o===] 20 years               │
│                                                      │
│  ┌─────────────────────┐ ┌─────────────────────┐   │
│  │  TOTAL INVESTED     │ │  FUTURE VALUE        │   │
│  │  Rs 12,00,000       │ │  Rs 49,95,740        │   │
│  │                     │ │                       │   │
│  │  (Rs 5,000 x 240    │ │  Wealth Gained:       │   │
│  │   months)           │ │  Rs 37,95,740         │   │
│  └─────────────────────┘ └─────────────────────┘   │
│                                                      │
│  WHAT IF YOU STARTED 5 YEARS LATER?                  │
│  ┌─────────────────────────────────────────────┐   │
│  │  Start now (20 yrs):  Rs 49,95,740          │   │
│  │  Start 5 yrs late (15 yrs): Rs 25,22,577   │   │
│  │                                              │   │
│  │  COST OF DELAY: Rs 24,73,163                │   │
│  │  "5 years of waiting costs you Rs 24.7L"    │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  [START SIP - Rs 5,000/month]                       │
└────────────────────────────────────────────────────┘
```

### 5. Component Code

```jsx
import { useState, useMemo } from 'react'
import useGameStore from '../../stores/gameStore'
import { formatRupees } from '../../stores/gameStore' // or from utils/formatINR

function calculateSIP(monthly, annualReturn, years) {
  const r = annualReturn / 12 / 100
  const n = years * 12
  if (r === 0) return { totalInvested: monthly * n, futureValue: monthly * n, wealthGained: 0 }
  const totalInvested = monthly * n
  const futureValue = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
  return {
    totalInvested: Math.round(totalInvested),
    futureValue: Math.round(futureValue),
    wealthGained: Math.round(futureValue - totalInvested),
  }
}

export default function SIPCalculator({ onComplete }) {
  const [monthly, setMonthly] = useState(5000)
  const [returnRate, setReturnRate] = useState(12)
  const [years, setYears] = useState(20)

  const result = useMemo(() => calculateSIP(monthly, returnRate, years), [monthly, returnRate, years])
  const delayedResult = useMemo(() => calculateSIP(monthly, returnRate, Math.max(1, years - 5)), [monthly, returnRate, years])
  const costOfDelay = result.futureValue - delayedResult.futureValue

  const handleStartSIP = () => {
    const store = useGameStore.getState()
    store.startSIP(monthly)
    store.spendMoney(monthly, `SIP investment - first month (${formatRupees(monthly)}/mo)`)
    store.setPlayerChoice('sipAmount', monthly)
    store.setPlayerChoice('sipStartMonth', store.month)
    store.completeZone('mftower')
    store.updateHealth(10)
    if (onComplete) onComplete()
  }

  return (
    <div className="sip-calc">
      {/* Sliders */}
      <div className="sip-slider-group">
        <label className="sip-slider-label">
          <span>Monthly SIP Amount</span>
          <span className="sip-slider-value">{formatRupees(monthly)}</span>
        </label>
        <input
          type="range"
          min={1000} max={15000} step={500}
          value={monthly}
          onChange={(e) => setMonthly(Number(e.target.value))}
          className="sip-slider"
        />
      </div>

      <div className="sip-slider-group">
        <label className="sip-slider-label">
          <span>Expected Annual Return</span>
          <span className="sip-slider-value">{returnRate}% p.a.</span>
        </label>
        <input
          type="range"
          min={8} max={15} step={0.5}
          value={returnRate}
          onChange={(e) => setReturnRate(Number(e.target.value))}
          className="sip-slider"
        />
      </div>

      <div className="sip-slider-group">
        <label className="sip-slider-label">
          <span>Investment Duration</span>
          <span className="sip-slider-value">{years} years</span>
        </label>
        <input
          type="range"
          min={5} max={30} step={1}
          value={years}
          onChange={(e) => setYears(Number(e.target.value))}
          className="sip-slider"
        />
      </div>

      {/* Results */}
      <div className="sip-results">
        <div className="sip-result-card">
          <div className="sip-result-label">Total Invested</div>
          <div className="sip-result-amount">{formatRupees(result.totalInvested)}</div>
          <div className="sip-result-sub">{formatRupees(monthly)} x {years * 12} months</div>
        </div>
        <div className="sip-result-card highlight">
          <div className="sip-result-label">Future Value</div>
          <div className="sip-result-amount">{formatRupees(result.futureValue)}</div>
          <div className="sip-result-sub">Wealth gained: {formatRupees(result.wealthGained)}</div>
        </div>
      </div>

      {/* Delay comparison */}
      <div className="sip-delay">
        <div className="sip-delay-title">What if you started 5 years later?</div>
        <div className="sip-delay-row">
          <span>Start now ({years} yrs):</span>
          <span>{formatRupees(result.futureValue)}</span>
        </div>
        <div className="sip-delay-row">
          <span>Start 5 yrs late ({Math.max(1, years - 5)} yrs):</span>
          <span>{formatRupees(delayedResult.futureValue)}</span>
        </div>
        <div className="sip-delay-cost">
          Cost of delay: {formatRupees(costOfDelay)}
        </div>
      </div>

      {/* Start button */}
      <button className="sip-start-btn" onClick={handleStartSIP}>
        Start SIP -- {formatRupees(monthly)}/month
      </button>
    </div>
  )
}
```

### 6. CSS -- `src/components/minigames/SIPCalculator.css`

```css
.sip-calc { color: #fff; }

.sip-slider-group {
  margin-bottom: 20px;
}

.sip-slider-label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 8px;
  color: rgba(255,255,255,0.7);
}

.sip-slider-value {
  font-weight: 700;
  color: #fff;
}

.sip-slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255,255,255,0.15);
  border-radius: 3px;
  outline: none;
}

.sip-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4ade80;
  cursor: pointer;
  border: 2px solid #fff;
}

.sip-results {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 24px 0;
}

.sip-result-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.sip-result-card.highlight {
  border-color: rgba(74, 222, 128, 0.3);
  background: rgba(74, 222, 128, 0.05);
}

.sip-result-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255,255,255,0.5);
  margin-bottom: 6px;
}

.sip-result-amount {
  font-size: 24px;
  font-weight: 700;
}

.sip-result-sub {
  font-size: 12px;
  color: rgba(255,255,255,0.4);
  margin-top: 4px;
}

.sip-delay {
  background: rgba(251, 191, 36, 0.08);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.sip-delay-title {
  font-size: 14px;
  font-weight: 700;
  color: #fbbf24;
  margin-bottom: 12px;
}

.sip-delay-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 4px 0;
  color: rgba(255,255,255,0.7);
}

.sip-delay-cost {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(251, 191, 36, 0.2);
  font-size: 16px;
  font-weight: 700;
  color: #EF5350;
  text-align: center;
}

.sip-start-btn {
  width: 100%;
  padding: 16px;
  background: #4ade80;
  color: #000;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.sip-start-btn:hover { opacity: 0.9; }
```

### 7. Integration

Triggered by MF Advisor Priya NPC. The NPC dialogue should offer to open the SIP calculator:

```js
// In MF Advisor's dialogue data:
{
  text: "Want to see how your money can grow with the power of compounding?",
  choices: [
    {
      label: "Show me the SIP Calculator",
      action: () => { /* trigger overlay open */ },
      nextStep: null // Close dialogue, open overlay
    }
  ]
}
```

Wrap in Overlay:
```jsx
<Overlay isOpen={showSIP} onClose={() => setShowSIP(false)} title="SIP Calculator">
  <SIPCalculator onComplete={() => setShowSIP(false)} />
</Overlay>
```

## Financial Data

| Default | Value |
|---------|-------|
| SIP default | Rs 5,000/month |
| Return rate | 12% p.a. |
| Duration | 20 years |
| FV at defaults | Rs 49,95,740 |
| FV at 15 years (5yr delay) | Rs 25,22,577 |
| Cost of 5yr delay | Rs 24,73,163 |

## Files to Create/Modify

| Action | File Path |
|--------|-----------|
| Create | `src/components/minigames/SIPCalculator.jsx` |
| Create | `src/components/minigames/SIPCalculator.css` |
| Create | `src/data/dialogues/mfTowerDialogue.js` |
| Modify | `src/data/npcs.js` (update MF Advisor Priya with dialogue) |
| Modify | `src/App.jsx` (add SIP overlay trigger) |

## Acceptance Criteria

- [ ] 3 sliders work smoothly (monthly amount, return %, years)
- [ ] Result numbers update live as sliders move
- [ ] Total invested and future value shown side-by-side
- [ ] "5 years later" comparison shows cost of delay
- [ ] Numbers formatted in Indian rupee style (lakhs/crores)
- [ ] "Start SIP" button commits to game store (startSIP, spendMoney, completeZone)
- [ ] MF Tower zone marked complete after starting SIP
- [ ] Financial health increases by 10
- [ ] Overlay closes after starting SIP
- [ ] No console errors

## What NOT to Do

- Do NOT add animated charts or graphs (just numbers)
- Do NOT add multiple fund type options (just one SIP)
- Do NOT add NAV or unit tracking (too complex)
- Do NOT add a "compare funds" feature

## Estimated Complexity
Medium
