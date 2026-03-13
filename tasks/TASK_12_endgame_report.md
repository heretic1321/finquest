# TASK 12: End-Game Summary Report

## Phase
Phase 7 -- End-Game Report

## Priority
P0

## Prerequisites
- TASK_04 (game store -- all state: balance, transactions, investments, completedZones, playerChoices)
- TASK_07 (overlay system -- full-screen overlay)
- Ideally TASK_08, 09, 10, 11 are done (so there is data to report), but this task works with whatever data exists

## Goal
Build an end-game summary report overlay showing the player's net worth, spending breakdown, 20-year projection, zone completion status, and a one-liner verdict. Triggered by a "View Report" button in the HUD or after visiting 3+ zones.

## Detailed Requirements

### 1. Report Component -- `src/components/minigames/EndGameReport.jsx`

Full-screen overlay showing the complete financial summary of the player's journey.

### 2. Report Sections

#### Section 1: Net Worth
```
YOUR NET WORTH: Rs XX,XXX

Balance:        Rs XX,XXX
Emergency Fund: Rs XX,XXX
SIP Portfolio:  Rs XX,XXX
Debt:          -Rs XX,XXX
─────────────────────────
NET WORTH:      Rs XX,XXX
```

Calculated from store:
```js
const netWorth = balance + investments.emergencyFund + investments.sipTotal - investments.debt
```

#### Section 2: Income & Spending Breakdown
```
FINANCIAL SUMMARY (X months)

Total Income:    Rs X,XX,XXX
Total Spending:  Rs X,XX,XXX
Total Invested:  Rs XX,XXX
Lost to Scams:   Rs XX,XXX

Top Expenses:
  1. Rent                 Rs XX,XXX
  2. Food                 Rs XX,XXX
  3. Education Loan EMI   Rs XX,XXX
```

Calculated by filtering transactions:
```js
const totalIncome = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
const totalSpending = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)
const scamLosses = transactions.filter(t => t.description.toLowerCase().includes('scam')).reduce((s, t) => s + t.amount, 0)
```

#### Section 3: 20-Year Projection
```
20-YEAR PROJECTION
"If you continue these habits..."

Monthly SIP: Rs X,XXX
Expected Return: 12% p.a.

Projected Value: Rs XX,XX,XXX

That's enough for:
  - Down payment on a 2BHK
  - A car without EMI
  - Your child's education
```

Calculated using the SIP formula:
```js
function project20Years(sipAmount) {
  if (sipAmount === 0) return 0
  const r = 12 / 12 / 100 // 12% annual, monthly
  const n = 20 * 12
  return Math.round(sipAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r))
}
```

If no SIP started:
```
"You didn't start any SIP. In 20 years, you'd have Rs 0 in investments.
If you had invested just Rs 5,000/month: Rs 49,95,740."
```

#### Section 4: The PS5 Opportunity Cost (if player bought PS5)
```
Remember that PS5 from Month 2?
You paid Rs 50,000 (or Rs 68,000 with interest).

If you had invested that Rs 50,000 instead:
In 20 years at 12%: Rs 4,82,315

That PS5 actually cost you Rs 4.8 Lakhs.
```

Only show this section if playerChoices.budgetSelections includes 'ps5'.

#### Section 5: Zone Completion
```
ZONES COMPLETED: X/4

[checkmark] TechCorp - Salary & CTC
[checkmark] Budget - Allocation
[x] Scam Park - Fraud Awareness
[checkmark] MF Tower - SIP & Compounding
```

#### Section 6: Verdict

Based on financial health score and choices:

```js
function getVerdict(financialHealth, netWorth, investments) {
  if (financialHealth >= 70 && investments.sipAmount > 0 && investments.insuranceBought) {
    return { emoji: '', label: 'Financially Free', color: '#4ade80' }
  } else if (financialHealth >= 40 && (investments.sipAmount > 0 || netWorth > 20000)) {
    return { emoji: '', label: 'On the Right Track', color: '#fbbf24' }
  } else if (financialHealth >= 20) {
    return { emoji: '', label: 'Paycheck to Paycheck', color: '#fb923c' }
  } else {
    return { emoji: '', label: 'Drowning in Debt', color: '#ef4444' }
  }
}
```

### 3. Component Code

```jsx
import { useMemo } from 'react'
import useGameStore from '../../stores/gameStore'
import { formatRupees, getNetWorth } from '../../stores/gameStore'

export default function EndGameReport() {
  const balance = useGameStore((s) => s.balance)
  const investments = useGameStore((s) => s.investments)
  const transactions = useGameStore((s) => s.transactions)
  const completedZones = useGameStore((s) => s.completedZones)
  const playerChoices = useGameStore((s) => s.playerChoices)
  const financialHealth = useGameStore((s) => s.financialHealth)
  const month = useGameStore((s) => s.month)

  const netWorth = useMemo(() => getNetWorth(), [balance, investments])

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
    const spending = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)
    const scamLoss = transactions
      .filter(t => t.description && t.description.toLowerCase().includes('scam'))
      .reduce((s, t) => s + t.amount, 0)
    return { income, spending, scamLoss }
  }, [transactions])

  const projection = useMemo(() => {
    if (investments.sipAmount === 0) return 0
    const r = 12 / 12 / 100
    const n = 20 * 12
    return Math.round(investments.sipAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r))
  }, [investments.sipAmount])

  const verdict = useMemo(() => {
    if (financialHealth >= 70 && investments.sipAmount > 0 && investments.insuranceBought) {
      return { label: 'Financially Free', color: '#4ade80', description: 'You made smart choices. Keep it up and you\'ll retire early.' }
    } else if (financialHealth >= 40 && (investments.sipAmount > 0 || netWorth > 20000)) {
      return { label: 'On the Right Track', color: '#fbbf24', description: 'Good start, but there\'s room to improve. Increase your SIP and get insured.' }
    } else if (financialHealth >= 20) {
      return { label: 'Paycheck to Paycheck', color: '#fb923c', description: 'You\'re surviving but not building wealth. Start a SIP, even if it\'s small.' }
    } else {
      return { label: 'Drowning in Debt', color: '#ef4444', description: 'Debt is eating your future. Focus on clearing debt before anything else.' }
    }
  }, [financialHealth, investments, netWorth])

  const zones = [
    { id: 'techcorp', label: 'TechCorp - Salary & CTC' },
    { id: 'budget', label: 'Budget Allocation' },
    { id: 'scampark', label: 'Scam Park - Fraud Awareness' },
    { id: 'mftower', label: 'MF Tower - SIP & Compounding' },
  ]

  const boughtPS5 = playerChoices.budgetSelections?.includes('ps5')

  return (
    <div className="report">
      {/* Verdict Banner */}
      <div className="report-verdict" style={{ borderColor: verdict.color }}>
        <div className="report-verdict-label" style={{ color: verdict.color }}>
          {verdict.label}
        </div>
        <div className="report-verdict-desc">{verdict.description}</div>
      </div>

      {/* Net Worth */}
      <div className="report-section">
        <h3>Net Worth</h3>
        <div className="report-networth">{formatRupees(netWorth)}</div>
        <div className="report-breakdown">
          <div className="report-row"><span>Bank Balance</span><span>{formatRupees(balance)}</span></div>
          <div className="report-row"><span>Emergency Fund</span><span>{formatRupees(investments.emergencyFund)}</span></div>
          <div className="report-row"><span>SIP Portfolio</span><span>{formatRupees(investments.sipTotal)}</span></div>
          {investments.debt > 0 && (
            <div className="report-row debt"><span>Debt</span><span>-{formatRupees(investments.debt)}</span></div>
          )}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="report-section">
        <h3>Financial Summary ({month} months)</h3>
        <div className="report-row"><span>Total Income</span><span className="green">{formatRupees(stats.income)}</span></div>
        <div className="report-row"><span>Total Spending</span><span className="red">{formatRupees(stats.spending)}</span></div>
        {stats.scamLoss > 0 && (
          <div className="report-row"><span>Lost to Scams</span><span className="red">{formatRupees(stats.scamLoss)}</span></div>
        )}
      </div>

      {/* 20-Year Projection */}
      <div className="report-section">
        <h3>20-Year Projection</h3>
        {investments.sipAmount > 0 ? (
          <>
            <p className="report-text">
              If you continue your {formatRupees(investments.sipAmount)}/month SIP at 12% returns:
            </p>
            <div className="report-projection">{formatRupees(projection)}</div>
            <p className="report-text-small">
              That's enough for a 2BHK down payment, a car without EMI, or your child's entire education.
            </p>
          </>
        ) : (
          <p className="report-text">
            You didn't start any SIP. In 20 years: {formatRupees(0)} in investments.
            If you had invested just {formatRupees(5000)}/month: {formatRupees(4995740)}.
          </p>
        )}
      </div>

      {/* PS5 Opportunity Cost */}
      {boughtPS5 && (
        <div className="report-section highlight-red">
          <h3>The PS5 Reality Check</h3>
          <p className="report-text">
            You paid {formatRupees(50000)} for a PS5
            {investments.debt > 0 ? ` (plus interest -- total ${formatRupees(68000)})` : ''}.
          </p>
          <p className="report-text">
            If invested at 12% for 20 years, that {formatRupees(50000)} would become {formatRupees(482315)}.
          </p>
          <p className="report-text" style={{ fontWeight: 700 }}>
            That PS5 actually cost you {formatRupees(482315)}.
          </p>
        </div>
      )}

      {/* Zone Completion */}
      <div className="report-section">
        <h3>Zones Completed ({completedZones.length}/{zones.length})</h3>
        <div className="report-zones">
          {zones.map(z => (
            <div key={z.id} className={`report-zone ${completedZones.includes(z.id) ? 'done' : ''}`}>
              <span className="report-zone-check">{completedZones.includes(z.id) ? 'V' : 'X'}</span>
              <span>{z.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### 4. CSS -- `src/components/minigames/EndGameReport.css`

```css
.report { color: #fff; }

.report-verdict {
  border: 2px solid;
  border-radius: 14px;
  padding: 20px;
  text-align: center;
  margin-bottom: 24px;
  background: rgba(255,255,255,0.03);
}

.report-verdict-label {
  font-size: 24px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.report-verdict-desc {
  font-size: 14px;
  color: rgba(255,255,255,0.6);
  margin-top: 8px;
}

.report-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.report-section h3 {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255,255,255,0.5);
  margin-bottom: 12px;
}

.report-networth {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 12px;
}

.report-breakdown { margin-top: 8px; }

.report-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
  color: rgba(255,255,255,0.7);
}

.report-row .green { color: #4ade80; }
.report-row .red { color: #ef4444; }
.report-row.debt span:last-child { color: #ef4444; }

.report-projection {
  font-size: 32px;
  font-weight: 800;
  color: #4ade80;
  margin: 12px 0;
}

.report-text {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255,255,255,0.7);
}

.report-text-small {
  font-size: 12px;
  color: rgba(255,255,255,0.45);
  margin-top: 8px;
}

.report-section.highlight-red {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  padding: 16px;
}

.report-zones { display: flex; flex-direction: column; gap: 8px; }

.report-zone {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: rgba(255,255,255,0.5);
}

.report-zone.done { color: #4ade80; }

.report-zone-check {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.15);
}

.report-zone.done .report-zone-check {
  background: rgba(74, 222, 128, 0.15);
  border-color: #4ade80;
  color: #4ade80;
}
```

### 5. Integration

**Trigger 1: "View Report" button in HUD (BankHUD.jsx)**

Add a small button to the BankHUD that opens the report. Only show it after 3+ zones completed:

```jsx
{completedZones.length >= 3 && (
  <button className="hud-report-btn" onClick={() => setShowReport(true)}>
    View Report
  </button>
)}
```

**Trigger 2: Auto-trigger after visiting all 4 zones**

In App.jsx, watch completedZones and auto-show report when all 4 are done.

Wrap in Overlay:
```jsx
<Overlay isOpen={showReport} onClose={() => setShowReport(false)} title="FinQuest Report Card">
  <EndGameReport />
</Overlay>
```

## Files to Create/Modify

| Action | File Path |
|--------|-----------|
| Create | `src/components/minigames/EndGameReport.jsx` |
| Create | `src/components/minigames/EndGameReport.css` |
| Modify | `src/components/ui/BankHUD.jsx` (add "View Report" button) |
| Modify | `src/App.jsx` (add report overlay trigger) |

## Acceptance Criteria

- [ ] Report shows correct net worth (balance + emergency + SIP - debt)
- [ ] Income and spending totals match transaction history
- [ ] Scam losses highlighted if any
- [ ] 20-year projection calculated correctly for player's SIP amount
- [ ] If no SIP, shows what they missed out on
- [ ] PS5 opportunity cost section appears only if PS5 was bought
- [ ] Zone completion shows checkmarks for completed zones
- [ ] Verdict reflects financial health + choices (4 tiers)
- [ ] "View Report" button appears in HUD after 3+ zones
- [ ] Report renders cleanly inside the Overlay component
- [ ] Numbers formatted in Indian rupee style
- [ ] No console errors

## What NOT to Do

- Do NOT add animated charts or graphs
- Do NOT add a "play again" button (page refresh handles that)
- Do NOT add social sharing features
- Do NOT add downloadable PDF export
- Do NOT add leaderboard comparison

## Estimated Complexity
Medium
