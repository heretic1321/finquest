# TASK 08: TechCorp Zone -- First Salary Quest

## Phase
Phase 3 -- TechCorp Quest

## Priority
P0

## Prerequisites
- TASK_03 (zone buildings + NPCs -- HR Vikram NPC exists at TechCorp)
- TASK_04 (game store -- addMoney, spendMoney, completeZone, setPlayerChoice)
- TASK_06 (dialogue system -- multi-step dialogue with choices)

## Goal
Implement the TechCorp salary quest: player talks to HR Vikram, takes a CTC vs in-hand salary quiz, sees an offer letter breakdown panel, receives their first salary (balance 0 -> 45,000 -> 18,500 after mandatory deductions), and completes the TechCorp zone.

## Detailed Requirements

### 1. Quest Flow (10 Steps)

The entire quest is a dialogue tree with action callbacks that modify the game store.

**Step 1:** "Welcome to TechCorp! Congratulations, you've been selected. Your CTC package is Rs 8,00,000 per year!"

**Step 2:** "Quick question -- how much do you think you'll get in-hand every month?"
- Choices:
  - "Rs 66,667" (CTC / 12) -- WRONG
  - "Rs 55,000" -- WRONG
  - "Rs 48,000" -- WRONG
  - "Rs 42,000" -- CLOSEST (correct answer is ~45,000)

**Step 3 (if wrong -- most will pick 66,667):** "Haha, classic mistake! Almost everyone thinks CTC = in-hand salary. Let me show you the reality..."

**Step 3 (if correct/closest):** "Impressive! Most freshers get this wrong. But let me show you exactly how it works..."

**Step 4:** Show the **Offer Letter Breakdown** -- this is a special dialogue step with a formatted panel:

```
CTC BREAKDOWN: Rs 8,00,000 / year

Gross Salary:                 Rs 8,00,000
  Basic Pay (40%):            Rs 3,20,000
  HRA (20%):                  Rs 1,60,000
  Special Allowance:          Rs 2,24,000
  PF (Employer 12% of Basic): Rs   38,400
  Gratuity:                   Rs   15,385
  Insurance (Company):        Rs   42,215

DEDUCTIONS (Monthly):
  PF (Employee 12%):          Rs  3,200
  Professional Tax:           Rs    200
  Income Tax (est):           Rs  5,600
  ---------------------------------
  Total Deductions:           Rs  9,000

IN-HAND SALARY:               Rs 45,000 / month
  (That's Rs 5,40,000 / year -- NOT Rs 8,00,000!)
```

**Step 5:** "Your actual in-hand salary is Rs 45,000 per month. That's a 33% difference from what you thought!"
- Action: `addMoney(45000, 'TechCorp monthly salary - Month 1')`
- HUD flashes green, balance goes 0 -> 45,000

**Step 6:** "But wait -- you have mandatory expenses. Rent, food, transport, utilities, and your education loan EMI."

**Step 7:** Show **Monthly Expenses Breakdown**:
```
MONTHLY MANDATORY EXPENSES:
  Rent (shared flat):         Rs 12,000
  Food & groceries:           Rs  6,000
  Transport (metro pass):     Rs  2,000
  Utilities (WiFi, phone):    Rs  1,500
  Education Loan EMI:         Rs  5,000
  ---------------------------------
  TOTAL:                      Rs 26,500
```
- Action: `deductMonthlyExpenses()` (calls spendMoney for each expense)
- HUD flashes red multiple times, balance goes 45,000 -> 18,500

**Step 8:** "You have Rs 18,500 left. This is your discretionary income -- how you spend this will determine your financial future."

**Step 9:** "Head over to the Budget zone to decide how to allocate your remaining money. Choose wisely!"
- Action: `completeZone('techcorp')`, `advanceMonth()`, `updateHealth(5)`

**Step 10:** "Oh, and one more thing -- that Rs 42,000 salary guess? The real answer depends on your company. Always read your offer letter carefully!"
- Choice: "Got it!" -> close dialogue

### 2. Dialogue Data File -- `src/data/dialogues/techcorpDialogue.js`

```js
import useGameStore from '../../stores/gameStore'

export function createTechCorpDialogue() {
  return {
    npcName: 'HR Vikram',
    npcColor: '#4FC3F7',
    steps: [
      {
        text: "Welcome to TechCorp! Congratulations on being selected. Your CTC package is ₹8,00,000 per year. Exciting, right?",
        choices: [
          { label: "That's amazing!", action: null, nextStep: 1 },
        ]
      },
      {
        text: "Quick question -- how much do you think you'll get in-hand every month?",
        choices: [
          {
            label: '₹66,667',
            action: () => useGameStore.getState().setPlayerChoice('techcorpGuess', 66667),
            nextStep: 2
          },
          {
            label: '₹55,000',
            action: () => useGameStore.getState().setPlayerChoice('techcorpGuess', 55000),
            nextStep: 2
          },
          {
            label: '₹48,000',
            action: () => useGameStore.getState().setPlayerChoice('techcorpGuess', 48000),
            nextStep: 2
          },
          {
            label: '₹42,000',
            action: () => useGameStore.getState().setPlayerChoice('techcorpGuess', 42000),
            nextStep: 3
          },
        ]
      },
      {
        // Wrong answer path
        text: "Haha, classic mistake! Almost everyone thinks CTC = in-hand salary. Let me show you the reality...",
        choices: [
          { label: 'Show me', action: null, nextStep: 4 }
        ]
      },
      {
        // Correct/closest answer path
        text: "Impressive! Most freshers get this completely wrong. But let me show you exactly how the math works...",
        choices: [
          { label: 'Show me the breakdown', action: null, nextStep: 4 }
        ]
      },
      {
        // Offer letter breakdown
        text: "--- CTC BREAKDOWN: ₹8,00,000/year ---\n\nGross Salary: ₹8,00,000\n  Basic Pay (40%): ₹3,20,000\n  HRA (20%): ₹1,60,000\n  Special Allowance: ₹2,24,000\n  PF Employer (12%): ₹38,400\n  Gratuity: ₹15,385\n  Insurance: ₹42,215\n\nMONTHLY DEDUCTIONS:\n  PF Employee (12%): -₹3,200\n  Professional Tax: -₹200\n  Income Tax (est): -₹5,600\n  Total Deductions: -₹9,000\n\nIN-HAND SALARY: ₹45,000/month\n(That's ₹5,40,000/year -- NOT ₹8,00,000!)",
        choices: [
          { label: 'Wow, that\'s a big difference!', action: null, nextStep: 5 }
        ]
      },
      {
        text: "Your first month's salary of ₹45,000 has been credited to your FinQuest Bank account!",
        choices: [
          {
            label: 'Check my balance',
            action: () => {
              useGameStore.getState().addMoney(45000, 'TechCorp salary - Month 1')
              useGameStore.getState().receiveSalary()
            },
            nextStep: 6
          }
        ]
      },
      {
        text: "But wait -- you have mandatory expenses every month. Rent, food, transport, utilities, and your education loan EMI. Let me show you...",
        choices: [
          { label: 'Show expenses', action: null, nextStep: 7 }
        ]
      },
      {
        text: "--- MONTHLY EXPENSES ---\n\nRent (shared flat): -₹12,000\nFood & groceries: -₹6,000\nTransport (metro): -₹2,000\nUtilities (WiFi, phone): -₹1,500\nEducation Loan EMI: -₹5,000\n\nTOTAL: -₹26,500\n\nRemaining: ₹18,500",
        choices: [
          {
            label: 'Deduct expenses',
            action: () => {
              useGameStore.getState().deductMonthlyExpenses()
            },
            nextStep: 8
          }
        ]
      },
      {
        text: "You have ₹18,500 left. This is your DISCRETIONARY income. How you spend or invest this money will shape your entire financial future. Choose wisely!",
        choices: [
          {
            label: "I'll be smart about it!",
            action: () => {
              useGameStore.getState().completeZone('techcorp')
              useGameStore.getState().advanceMonth()
              useGameStore.getState().updateHealth(5)
            },
            nextStep: 9
          }
        ]
      },
      {
        text: "Head to the other zones on the island to decide how to allocate your money. You can invest, save, insure yourself, or... spend it all on a PS5. Your choice!",
        choices: [
          { label: 'Let\'s go!', action: null, nextStep: null }
        ]
      },
    ]
  }
}
```

### 3. Update NPC Data -- `src/data/npcs.js`

Modify the HR Vikram NPC entry to include the dialogue data:

```js
import { createTechCorpDialogue } from './dialogues/techcorpDialogue'

// In the NPC_DATA array, update HR Vikram:
{
  id: 'hr-vikram',
  name: 'HR Vikram',
  position: [8, 1.5, -5],
  color: '#4FC3F7',
  zone: 'techcorp',
  greeting: "Welcome to TechCorp! Ready to start your career?",
  dialogue: createTechCorpDialogue(),
}
```

### 4. Zone Completion Guard

If the player has already completed the TechCorp zone (completedZones includes 'techcorp'), HR Vikram should show a different dialogue:

```js
export function createTechCorpCompletedDialogue() {
  return {
    npcName: 'HR Vikram',
    npcColor: '#4FC3F7',
    steps: [
      {
        text: "You've already received your salary this month! Go explore the other zones and decide how to spend your ₹18,500.",
        choices: [
          { label: 'Will do!', action: null, nextStep: null }
        ]
      }
    ]
  }
}
```

The NPC data should check completedZones and return the appropriate dialogue. This can be done by making the dialogue a function that reads the store:

```js
// In npcs.js or in the NPC component's E key handler:
const completedZones = useGameStore.getState().completedZones
const dialogue = completedZones.includes('techcorp')
  ? createTechCorpCompletedDialogue()
  : createTechCorpDialogue()
```

## Financial Data/Constants

| Item | Value |
|------|-------|
| CTC | ₹8,00,000/year |
| In-hand salary | ₹45,000/month |
| Basic Pay | ₹3,20,000/year (40% of CTC) |
| HRA | ₹1,60,000/year (20%) |
| PF (Employee) | ₹3,200/month |
| Professional Tax | ₹200/month |
| Income Tax (est) | ₹5,600/month |
| Total deductions | ₹9,000/month |
| Rent | ₹12,000/month |
| Food | ₹6,000/month |
| Transport | ₹2,000/month |
| Utilities | ₹1,500/month |
| Education Loan EMI | ₹5,000/month |
| Total mandatory expenses | ₹26,500/month |
| Discretionary income | ₹18,500/month |

## Files to Create/Modify

| Action | File Path |
|--------|-----------|
| Create | `src/data/dialogues/techcorpDialogue.js` |
| Modify | `src/data/npcs.js` (add dialogue to HR Vikram) |

## Acceptance Criteria

- [ ] Walking to HR Vikram and pressing E starts the TechCorp quest dialogue
- [ ] CTC quiz presents 4 salary guesses as choice buttons
- [ ] Player's guess is stored via setPlayerChoice
- [ ] Offer letter breakdown is displayed as formatted text in dialogue
- [ ] After "Check my balance" choice, ₹45,000 is added to balance (HUD flashes green)
- [ ] After "Deduct expenses" choice, ₹26,500 is deducted (HUD flashes red)
- [ ] Balance goes: 0 -> 45,000 -> 18,500 through the quest
- [ ] TechCorp zone is marked complete after quest
- [ ] Month advances from 1 to 2
- [ ] Financial health increases by 5
- [ ] If TechCorp already completed, shows a different "already done" dialogue
- [ ] No double salary credit (receiveSalary guard)
- [ ] No console errors

## What NOT to Do

- Do NOT create a separate visual panel component for the offer letter (dialogue text is sufficient)
- Do NOT add animations to the salary numbers
- Do NOT modify the dialogue system component (TASK_06) -- just provide dialogue data
- Do NOT block access to other zones based on TechCorp completion (player can explore freely)

## Estimated Complexity
Medium
