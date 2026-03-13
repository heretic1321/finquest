# Task 2.1: Zustand Game Store

## Phase
Phase 2 — UI Layer + Dialogue System + Game Store

## Priority
P0

## Dependencies
- Phase 0 must be complete (directory structure exists, zustand installed in node_modules)
- No other Phase 2 tasks need to be done first — this is the foundation for all of them

## Objective
Create the centralized Zustand game store that holds ALL game state: player finances, game clock, transaction history, dialogue state, NPC proximity, zone completion, investment tracking, and player choices. Every UI component and game zone reads from and writes to this store. This is the single source of truth for the entire game.

## Detailed Requirements

### 1. File Location
- Create file: `/home/heretic/Documents/Projects/iiitd-hackathon/finquest/src/stores/gameStore.js`

### 2. Store Shape (Initial State)

```js
{
  // === PLAYER FINANCES ===
  balance: 0,                    // Current bank balance in rupees (number, can go negative for debt)
  financialHealth: 50,           // Score from 0-100, starts at neutral 50

  // === GAME CLOCK ===
  month: 1,                      // Current game month, 1-12

  // === TRANSACTION LOG ===
  transactions: [],              // Array of { type: 'credit'|'debit', amount: number, description: string, month: number }

  // === DIALOGUE STATE ===
  activeDialogue: null,          // null when no dialogue open, or a dialogue object (see structure below)
  nearbyNPC: null,               // null when no NPC in range, or { id: string, name: string, color: string, dialogue: object }

  // === ZONE TRACKING ===
  completedZones: [],            // Array of zone ID strings, e.g. ['techcorp', 'scampark']

  // === INVESTMENTS ===
  investments: {
    sipAmount: 0,                // Monthly SIP amount (auto-debited each month), 0 means no SIP
    sipTotal: 0,                 // Total value of SIP portfolio (grows with simulated returns)
    sipMonthsActive: 0,          // How many months the SIP has been running
    insuranceBought: false,      // Whether player has health insurance (₹1,000/mo)
    emergencyFund: 0,            // Amount saved in emergency fund
    debt: 0,                     // Outstanding debt (credit card at 36% p.a.)
    debtInterestRate: 0.36,      // Annual interest rate on debt (36% for credit card)
  },

  // === PLAYER CHOICES ===
  // Tracks what the player chose in each zone for the end-game report
  playerChoices: {
    // Populated dynamically as the game progresses, e.g.:
    // techcorpSalaryGuess: 66667,
    // budgetSelections: ['sip', 'parents', 'emergencyFund'],
    // scamResults: { upiScam: 'fell', kycScam: 'avoided', ponziScam: 'avoided' },
    // sipStartMonth: 2,
  },

  // === MANDATORY MONTHLY EXPENSES ===
  // These are constants — auto-deducted each month when advanceMonth() is called
  monthlyExpenses: {
    rent: 12000,
    food: 6000,
    transport: 2000,
    utilities: 1500,
    educationLoanEMI: 5000,
  },
  // Total: 26,500

  // === SALARY ===
  monthlySalary: 45000,          // In-hand salary (after CTC deductions). Changes if hike happens.
  salaryReceived: false,         // Whether salary has been received this month (prevents double-credit)

  // === UI FLAGS ===
  overlayOpen: false,            // True when a full-screen overlay (budget game, SIP calc, etc.) is active
                                 // When true, 3D controls should be disabled
}
```

### 3. Store Actions (Function Signatures & Behavior)

#### `addMoney(amount, description)`
- Adds `amount` to `balance`
- Pushes `{ type: 'credit', amount, description, month: get().month }` to `transactions`
- Example: `addMoney(45000, 'TechCorp monthly salary')`

#### `spendMoney(amount, description)`
- Subtracts `amount` from `balance`
- Pushes `{ type: 'debit', amount, description, month: get().month }` to `transactions`
- If `balance` goes below 0, the negative amount becomes implicit debt (handled by UI/zone logic)
- Example: `spendMoney(5000, 'UPI scam - collect request')`

#### `updateHealth(delta)`
- Adjusts `financialHealth` by `delta` (positive or negative)
- Clamps result to range [0, 100] using `Math.max(0, Math.min(100, newValue))`
- Example: `updateHealth(-15)` after falling for a scam, `updateHealth(10)` after smart budget choice

#### `setDialogue(dialogue)`
- Sets `activeDialogue` to the provided dialogue object
- The dialogue object structure is defined below in section 4

#### `clearDialogue()`
- Sets `activeDialogue` to `null`

#### `setNearbyNPC(npc)`
- Sets `nearbyNPC` to the provided NPC object or `null`
- NPC object shape: `{ id: string, name: string, color: string, dialogue: object }`
- `null` means player walked away from all NPCs

#### `advanceMonth()`
- Increments `month` by 1 (cap at 12 — do not go above 12)
- Resets `salaryReceived` to `false`
- If `investments.sipAmount > 0`:
  - Deduct SIP from balance: `balance -= investments.sipAmount`
  - Add transaction for SIP debit
  - Increment `sipMonthsActive` by 1
  - Update `sipTotal`: apply monthly return of 1% (12% p.a. / 12) to existing portfolio, then add new contribution
    - Formula: `sipTotal = sipTotal * 1.01 + sipAmount`
- If `investments.insuranceBought`:
  - Deduct ₹1,000 from balance
  - Add transaction for insurance premium
- If `investments.debt > 0`:
  - Apply monthly interest: `debt = debt * (1 + debtInterestRate / 12)`
  - Round to nearest rupee

#### `completeZone(zoneId)`
- Adds `zoneId` to `completedZones` array if not already present
- Example: `completeZone('techcorp')`

#### `setPlayerChoice(key, value)`
- Sets `playerChoices[key] = value`
- Uses spread to maintain immutability: `playerChoices: { ...state.playerChoices, [key]: value }`
- Example: `setPlayerChoice('budgetSelections', ['sip', 'parents'])`

#### `startSIP(amount)`
- Sets `investments.sipAmount` to `amount`
- Example: `startSIP(5000)` — player starts ₹5,000/month SIP

#### `buyInsurance()`
- Sets `investments.insuranceBought` to `true`

#### `addToEmergencyFund(amount)`
- Adds `amount` to `investments.emergencyFund`
- Deducts `amount` from `balance`
- Adds debit transaction

#### `addDebt(amount)`
- Adds `amount` to `investments.debt`
- Adds `amount` to `balance` (the loan proceeds are available to spend)
- Adds credit transaction describing the debt

#### `setOverlayOpen(isOpen)`
- Sets `overlayOpen` to the boolean `isOpen`
- Used by overlay components to signal 3D controls should freeze

#### `receiveSalary()`
- Only works if `salaryReceived` is `false`
- Calls `addMoney(get().monthlySalary, 'TechCorp monthly salary')`
- Sets `salaryReceived` to `true`

#### `deductMonthlyExpenses()`
- Deducts each expense from `monthlyExpenses` object
- Creates individual transactions for each:
  - `spendMoney(12000, 'Rent - shared flat')`
  - `spendMoney(6000, 'Food & groceries')`
  - `spendMoney(2000, 'Transport - metro pass')`
  - `spendMoney(1500, 'Utilities - electricity, WiFi, phone')`
  - `spendMoney(5000, 'Education loan EMI')`

### 4. Dialogue Object Structure

The `activeDialogue` object follows this shape:

```js
{
  npcName: "HR Vikram",          // Display name shown in dialogue box
  npcColor: "#4FC3F7",           // Color for the NPC name text and avatar dot
  steps: [
    {
      text: "Congrats! You're hired at TechCorp. CTC: ₹8,00,000/year",
      choices: [
        {
          label: "Wow, ₹66,667/month!",  // Button text
          action: () => { /* callback */ },  // Optional function called when chosen
          nextStep: 1,                       // Index of next step, or null to close dialogue
        },
        {
          label: "That sounds too good...",
          action: null,
          nextStep: 1,
        },
      ]
    },
    {
      text: "Actually, CTC ≠ in-hand salary. Let me explain...",
      choices: [
        {
          label: "Tell me more",
          action: null,
          nextStep: null,  // null = close dialogue after this choice
        }
      ]
    }
  ]
}
```

- `steps` is an array. The dialogue box shows one step at a time, starting at index 0.
- Each step has `text` (string) and `choices` (array of choice objects).
- Each choice has `label` (button text), `action` (function or null), and `nextStep` (number index or null).
- If `nextStep` is `null`, choosing that option closes the dialogue (calls `clearDialogue()`).
- If `action` is a function, it is called when the choice is clicked (before advancing to next step).

### 5. Computed/Derived Values (Helper Functions)

Export these as standalone functions that read from the store (NOT as store actions — they are computed values):

```js
// Get total mandatory monthly expenses
export const getTotalMonthlyExpenses = () => {
  const { monthlyExpenses } = useGameStore.getState();
  return Object.values(monthlyExpenses).reduce((sum, val) => sum + val, 0);
};
// Returns: 26500

// Get discretionary income (salary minus mandatory expenses)
export const getDiscretionaryIncome = () => {
  const state = useGameStore.getState();
  return state.monthlySalary - getTotalMonthlyExpenses();
};
// Returns: 18500

// Get net worth
export const getNetWorth = () => {
  const { balance, investments } = useGameStore.getState();
  return balance + investments.emergencyFund + investments.sipTotal - investments.debt;
};

// Format number as Indian rupee string
export const formatRupees = (amount) => {
  const absAmount = Math.abs(Math.round(amount));
  const formatted = absAmount.toLocaleString('en-IN');
  return `${amount < 0 ? '-' : ''}₹${formatted}`;
};
// formatRupees(45000) => "₹45,000"
// formatRupees(-5000) => "-₹5,000"
// formatRupees(800000) => "₹8,00,000"
```

### 6. Zustand Store Creation Pattern

Use Zustand v5 syntax (already installed as ^5.0.11):

```js
import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  // ... all state fields ...
  // ... all actions ...
}));

export default useGameStore;
```

Do NOT use middleware (no `persist`, no `devtools`, no `immer`). Keep it simple — plain Zustand.

## Code Patterns & References

### Zustand v5 pattern from resources.md:
```js
import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  balance: 0,
  addMoney: (amount, description) => set((state) => ({
    balance: state.balance + amount,
    transactions: [...state.transactions, { type: 'credit', amount, description, month: get().month }],
  })),
}));
```

### Reading store in React components:
```js
import useGameStore from '../stores/gameStore';

function BankHUD() {
  const balance = useGameStore((state) => state.balance);
  const month = useGameStore((state) => state.month);
  // ...
}
```

### Reading store outside React (in callbacks):
```js
import useGameStore from '../stores/gameStore';

const handleChoice = () => {
  useGameStore.getState().addMoney(45000, 'Salary');
};
```

## Files to Create/Modify
- **Create:** `src/stores/gameStore.js`

## Acceptance Criteria
- [ ] `src/stores/gameStore.js` exports `useGameStore` as default export
- [ ] Store initializes with `balance: 0`, `financialHealth: 50`, `month: 1`
- [ ] `transactions` starts as empty array
- [ ] `activeDialogue` and `nearbyNPC` start as `null`
- [ ] `completedZones` starts as empty array
- [ ] `investments` object has all fields: `sipAmount`, `sipTotal`, `sipMonthsActive`, `insuranceBought`, `emergencyFund`, `debt`, `debtInterestRate`
- [ ] `playerChoices` starts as empty object
- [ ] `monthlyExpenses` has all 5 expense categories totaling ₹26,500
- [ ] `addMoney()` increases balance and logs a credit transaction
- [ ] `spendMoney()` decreases balance and logs a debit transaction
- [ ] `updateHealth()` clamps to [0, 100]
- [ ] `setDialogue()` and `clearDialogue()` toggle `activeDialogue`
- [ ] `setNearbyNPC()` sets/clears the nearby NPC
- [ ] `advanceMonth()` increments month (max 12), processes SIP growth, insurance deduction, and debt interest
- [ ] `completeZone()` adds zone ID without duplicates
- [ ] `setPlayerChoice()` stores arbitrary key-value pairs
- [ ] `startSIP()` sets the monthly SIP amount
- [ ] `buyInsurance()` sets insurance flag to true
- [ ] `addToEmergencyFund()` moves money from balance to emergency fund
- [ ] `addDebt()` adds debt and credits balance with loan proceeds
- [ ] `setOverlayOpen()` toggles the overlay flag
- [ ] `receiveSalary()` only works once per month (checks `salaryReceived`)
- [ ] `deductMonthlyExpenses()` deducts all 5 mandatory expenses with individual transactions
- [ ] `formatRupees()` exported and formats with Indian locale (e.g., `₹8,00,000`)
- [ ] `getNetWorth()`, `getTotalMonthlyExpenses()`, `getDiscretionaryIncome()` exported as helper functions
- [ ] No TypeScript errors, no import errors, file uses ES module syntax

## Technical Notes
- Zustand v5 is already installed. Use `import { create } from 'zustand'` — NOT `'zustand/vanilla'`.
- Do NOT use `immer` middleware — use spread syntax for immutable updates.
- The store is client-side only. No persistence needed (game resets on page refresh, which is fine for a hackathon).
- The `advanceMonth` SIP growth formula (`sipTotal = sipTotal * 1.01 + sipAmount`) simulates ~12% annual returns compounded monthly. This is a simplification but good enough for the demo.
- Actions that call other actions should use `get()` to access them. For example, `deductMonthlyExpenses` should call `get().spendMoney(amount, description)` for each expense so transactions are logged properly. However, since `spendMoney` uses `set()`, you may need to call `set()` directly inside `deductMonthlyExpenses` to batch the updates efficiently. An alternative is to just do multiple `set()` calls — performance is not a concern for this hackathon.
- The `formatRupees` helper uses `toLocaleString('en-IN')` which handles Indian number formatting (lakhs/crores separators) automatically.

## Estimated Complexity
Medium
