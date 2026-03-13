# TASK 09: Budget Allocation Mini-Game

## Phase
Phase 4 -- Budget Allocation

## Priority
P0

## Prerequisites
- TASK_04 (game store -- balance at 18,500 after TechCorp quest, spendMoney, setPlayerChoice, investments)
- TASK_07 (overlay system -- full-screen overlay component)
- TASK_08 (TechCorp quest -- salary must be received first to have money to allocate)

## Goal
Build a full-screen overlay mini-game where the player allocates their ₹18,500 discretionary income across spending and saving cards. Cards are toggled on/off, total updates live, overspending triggers warnings, and choices have consequences shown after confirmation.

## Detailed Requirements

### 1. Budget Game Component -- `src/components/minigames/BudgetGame.jsx`

This component renders inside the Overlay from TASK_07. It is triggered by talking to a "Budget" NPC or automatically after TechCorp quest.

### 2. Spending Cards

8 cards in 2 rows. Top row = temptations, bottom row = smart moves.

**Temptation Cards:**

| Card | Cost | Type | Consequence |
|------|------|------|-------------|
| PS5 | ₹50,000 | one-time | "That's more than your entire salary! ₹50,000 on credit at 36% interest = ₹68,000 over 12 months." |
| Goa Trip | ₹25,000 | one-time | "Instagram-worthy but wallet-emptying. Your emergency fund is now ₹0." |
| Jordan Sneakers | ₹15,000 | one-time | "Looking fresh, but ₹15,000 lighter." |
| iPhone EMI | ₹5,000/mo | monthly | "₹5,000/month for 12 months = ₹60,000 total for a phone." |

**Smart Cards:**

| Card | Cost | Type | Consequence |
|------|------|------|-------------|
| SIP (Mutual Funds) | ₹5,000/mo | monthly | "Your ₹5,000/month starts compounding from today! In 20 years: ₹49.9L" |
| Send to Parents | ₹10,000 | one-time | "Your parents are proud. +5 Financial Health." |
| Health Insurance | ₹1,000/mo | monthly | "You're now protected against medical emergencies up to ₹5L." |
| Emergency Fund | ₹5,000 | one-time | "Smart. You now have a buffer for unexpected expenses." |

### 3. UI Layout

```
┌──────────────────────────────────────────────────┐
│  YOUR SALARY: ₹18,500 remaining    BANK: ₹XX,XXX│
│                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  │  PS5     │ │ Goa Trip │ │ Sneakers │ │ iPhone   │
│  │ ₹50,000  │ │ ₹25,000  │ │ ₹15,000  │ │₹5,000/mo │
│  │ [SELECT] │ │ [SELECT] │ │ [SELECT] │ │ [SELECT] │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘
│                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  │  SIP     │ │ Parents  │ │ Insure   │ │ Save     │
│  │₹5,000/mo │ │ ₹10,000  │ │₹1,000/mo │ │ ₹5,000   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘
│                                                    │
│  TOTAL SELECTED: ₹_____                           │
│  [OVERSPENT WARNING if applicable]                 │
│                                                    │
│  [CONFIRM CHOICES]                                 │
└──────────────────────────────────────────────────┘
```

### 4. Component Logic

```jsx
import { useState, useMemo } from 'react'
import useGameStore from '../../stores/gameStore'
import { formatRupees } from '../../stores/gameStore'

const BUDGET_CARDS = [
  // Temptations
  { id: 'ps5', label: 'PS5', cost: 50000, type: 'temptation', monthly: false, emoji: '🎮' },
  { id: 'goa', label: 'Goa Trip', cost: 25000, type: 'temptation', monthly: false, emoji: '✈️' },
  { id: 'sneakers', label: 'Sneakers', cost: 15000, type: 'temptation', monthly: false, emoji: '👟' },
  { id: 'iphone', label: 'iPhone EMI', cost: 5000, type: 'temptation', monthly: true, emoji: '📱' },
  // Smart moves
  { id: 'sip', label: 'SIP', cost: 5000, type: 'smart', monthly: true, emoji: '📈' },
  { id: 'parents', label: 'Parents', cost: 10000, type: 'smart', monthly: false, emoji: '🏠' },
  { id: 'insurance', label: 'Insurance', cost: 1000, type: 'smart', monthly: true, emoji: '🛡️' },
  { id: 'emergency', label: 'Save', cost: 5000, type: 'smart', monthly: false, emoji: '💰' },
]

export default function BudgetGame({ onComplete }) {
  const [selected, setSelected] = useState(new Set())
  const [showResults, setShowResults] = useState(false)
  const balance = useGameStore((s) => s.balance)
  const discretionary = 18500 // Fixed discretionary amount

  const totalSelected = useMemo(() => {
    return BUDGET_CARDS
      .filter(card => selected.has(card.id))
      .reduce((sum, card) => sum + card.cost, 0)
  }, [selected])

  const isOverspent = totalSelected > discretionary
  const remaining = discretionary - totalSelected

  const toggleCard = (cardId) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(cardId)) {
        next.delete(cardId)
      } else {
        next.add(cardId)
      }
      return next
    })
  }

  const handleConfirm = () => {
    const store = useGameStore.getState()
    const selectedCards = BUDGET_CARDS.filter(c => selected.has(c.id))

    selectedCards.forEach(card => {
      if (card.id === 'sip') {
        store.startSIP(card.cost)
        store.spendMoney(card.cost, 'SIP investment - Month 1')
      } else if (card.id === 'insurance') {
        store.buyInsurance()
        store.spendMoney(card.cost, 'Health insurance premium')
      } else if (card.id === 'emergency') {
        store.addToEmergencyFund(card.cost)
      } else if (card.id === 'parents') {
        store.spendMoney(card.cost, 'Sent to parents')
        store.updateHealth(5)
      } else if (card.id === 'ps5') {
        // PS5 costs more than salary -- goes to credit card debt
        store.addDebt(50000)
        store.spendMoney(50000, 'PS5 purchase (credit card)')
        store.updateHealth(-10)
      } else if (card.id === 'iphone') {
        store.addDebt(5000 * 12) // Full EMI commitment
        store.spendMoney(card.cost, 'iPhone EMI - Month 1')
      } else {
        store.spendMoney(card.cost, `${card.label} purchase`)
      }
    })

    store.setPlayerChoice('budgetSelections', Array.from(selected))
    store.completeZone('budget')
    setShowResults(true)
  }

  if (showResults) {
    return <BudgetResults selected={selected} onComplete={onComplete} />
  }

  return (
    <div className="budget-game">
      <div className="budget-header">
        <span>Discretionary: {formatRupees(discretionary)}</span>
        <span>Selected: {formatRupees(totalSelected)}</span>
        <span>Remaining: {formatRupees(remaining)}</span>
      </div>

      {isOverspent && (
        <div className="budget-warning">
          OVERSPENT! {formatRupees(totalSelected - discretionary)} will be credit card debt at 36% interest!
        </div>
      )}

      <div className="budget-cards">
        {BUDGET_CARDS.map(card => (
          <div
            key={card.id}
            className={`budget-card ${selected.has(card.id) ? 'selected' : ''} ${card.type}`}
            onClick={() => toggleCard(card.id)}
          >
            <div className="budget-card-emoji">{card.emoji}</div>
            <div className="budget-card-label">{card.label}</div>
            <div className="budget-card-cost">
              {formatRupees(card.cost)}{card.monthly ? '/mo' : ''}
            </div>
            <div className="budget-card-toggle">
              {selected.has(card.id) ? 'SELECTED' : 'SELECT'}
            </div>
          </div>
        ))}
      </div>

      <button
        className="budget-confirm"
        onClick={handleConfirm}
        disabled={selected.size === 0}
      >
        Confirm Choices
      </button>
    </div>
  )
}
```

### 5. Budget Results Component

After confirming, show consequences:

```jsx
function BudgetResults({ selected, onComplete }) {
  const results = BUDGET_CARDS.filter(c => selected.has(c.id)).map(card => {
    const consequences = {
      ps5: "Your PS5 costs ₹50,000 on credit at 36% APR. That's ₹68,000 over 12 months. In a SIP, that same money would become ₹6.25L in 20 years.",
      goa: "Epic trip! But your emergency fund just took a hit. Hope nothing goes wrong...",
      sneakers: "Looking fresh! But ₹15,000 invested for 20 years at 12% = ₹1,44,000.",
      iphone: "₹5,000/month for 12 months = ₹60,000 total. That's a month's salary for a phone.",
      sip: "Your ₹5,000/month starts growing today! At 12% returns, this becomes ₹49.9L in 20 years.",
      parents: "Your parents are proud of you. Some things are worth more than money. +5 Financial Health!",
      insurance: "Smart move! You're now covered for up to ₹5L in medical emergencies. This costs ₹12,000/year but saves lakhs.",
      emergency: "₹5,000 added to your emergency fund. Target: ₹80,000 (3 months expenses).",
    }
    return { ...card, consequence: consequences[card.id] }
  })

  // Teach 50/30/20 rule
  const rule = "The 50/30/20 Rule: 50% on needs (rent, food, bills), 30% on wants (entertainment, shopping), 20% on savings/investments. Your mandatory expenses are already ~57% of salary. The remaining ₹18,500 should ideally be 30% wants + 20% savings."

  return (
    <div className="budget-results">
      <h3>Your Choices & Consequences</h3>
      {results.map(r => (
        <div key={r.id} className={`result-item ${r.type}`}>
          <span className="result-emoji">{r.emoji}</span>
          <div>
            <strong>{r.label}</strong>
            <p>{r.consequence}</p>
          </div>
        </div>
      ))}

      {selected.size === 0 && (
        <p>You didn't select anything. Your ₹18,500 sits idle in savings. No growth, but no loss either.</p>
      )}

      <div className="budget-rule">
        <strong>Financial Tip: The 50/30/20 Rule</strong>
        <p>{rule}</p>
      </div>

      <button className="budget-continue" onClick={onComplete}>
        Continue Exploring
      </button>
    </div>
  )
}
```

### 6. CSS Styles -- `src/components/minigames/BudgetGame.css`

```css
.budget-game {
  color: #fff;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 20px;
}

.budget-warning {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 8px;
  padding: 12px;
  color: #ef4444;
  font-weight: 600;
  text-align: center;
  margin-bottom: 16px;
}

.budget-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.budget-card {
  background: rgba(255,255,255,0.05);
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.budget-card:hover {
  border-color: rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.08);
}

.budget-card.selected {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
}

.budget-card.selected.temptation {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.budget-card-emoji {
  font-size: 28px;
  margin-bottom: 8px;
}

.budget-card-label {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.budget-card-cost {
  color: rgba(255,255,255,0.6);
  font-size: 13px;
  margin-bottom: 8px;
}

.budget-card-toggle {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255,255,255,0.4);
}

.budget-card.selected .budget-card-toggle {
  color: #4ade80;
}

.budget-confirm {
  width: 100%;
  padding: 14px;
  background: #4ade80;
  color: #000;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.budget-confirm:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.budget-confirm:hover:not(:disabled) {
  opacity: 0.9;
}

.budget-results { color: #fff; }

.result-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: rgba(255,255,255,0.03);
}

.result-item.smart { border-left: 3px solid #4ade80; }
.result-item.temptation { border-left: 3px solid #ef4444; }

.result-emoji { font-size: 24px; }

.result-item p {
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  margin-top: 4px;
  line-height: 1.5;
}

.budget-rule {
  margin-top: 20px;
  padding: 16px;
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.2);
  border-radius: 10px;
}

.budget-rule p { font-size: 13px; color: rgba(255,255,255,0.7); margin-top: 8px; line-height: 1.5; }

.budget-continue {
  width: 100%;
  margin-top: 20px;
  padding: 14px;
  background: rgba(255,255,255,0.1);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 640px) {
  .budget-cards { grid-template-columns: repeat(2, 1fr); }
}
```

### 7. Integration

The BudgetGame is triggered after TechCorp quest. It can be launched from:
- A "Budget NPC" near the island center, OR
- Automatically after the TechCorp quest completes (via a state check in App.jsx)

Wrap it in the Overlay component:

```jsx
import Overlay from '../ui/Overlay'
import BudgetGame from '../minigames/BudgetGame'

// When triggered:
<Overlay isOpen={showBudget} onClose={() => setShowBudget(false)} title="Budget Allocation">
  <BudgetGame onComplete={() => setShowBudget(false)} />
</Overlay>
```

## Files to Create/Modify

| Action | File Path |
|--------|-----------|
| Create | `src/components/minigames/BudgetGame.jsx` |
| Create | `src/components/minigames/BudgetGame.css` |
| Modify | `src/App.jsx` or zone trigger component (integrate overlay trigger) |

## Acceptance Criteria

- [ ] Full-screen overlay appears with 8 budget cards in a 4x2 grid
- [ ] Cards toggle on/off on click with visual feedback (border color change)
- [ ] Total selected amount updates live as cards are toggled
- [ ] Remaining discretionary amount updates (₹18,500 - selected)
- [ ] Warning appears if total > ₹18,500 ("OVERSPENT! will be credit card debt")
- [ ] PS5 card shows special warning (costs more than entire salary)
- [ ] Confirm button triggers store actions (spendMoney, startSIP, buyInsurance, etc.)
- [ ] After confirm, results screen shows consequence for each selected card
- [ ] 50/30/20 rule explained in results
- [ ] Smart cards have green border, temptation cards have red border when selected
- [ ] Player choices stored via setPlayerChoice
- [ ] Balance in HUD updates after confirm
- [ ] Continue button closes overlay and returns to 3D world

## What NOT to Do

- Do NOT add sliders (toggle cards only -- simpler)
- Do NOT add undo after confirm
- Do NOT add multiple rounds/months of budgeting
- Do NOT add animations to the cards
- Do NOT block the player from overspending (let them, then show consequences)

## Estimated Complexity
Complex (most UI-heavy task)
