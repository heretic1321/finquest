# TASK 10: Scam Park -- UPI Encounter

## Phase
Phase 5 -- Scam Park

## Priority
P0

## Prerequisites
- TASK_03 (NPCs -- "Friendly Stranger" NPC at Scam Park)
- TASK_04 (game store -- spendMoney, addMoney, updateHealth, setPlayerChoice)
- TASK_06 (dialogue system -- multi-step dialogue with choices)

## Goal
Implement the Scam Park encounter: a fake UPI collect request notification that tricks the player into paying Rs 5,000, followed by 2 more quick scam scenarios (KYC call, too-good offer). Track scam survival score (X/3 avoided). This is the "oh shit" moment of the demo.

## Detailed Requirements

### 1. Scam Encounter Flow

When the player talks to "Friendly Stranger" NPC at Scam Park, instead of a normal dialogue, the quest triggers a sequence of 3 scam encounters.

### 2. Scam 1: UPI Collect Request (The Big One)

A fake phone notification overlay appears on screen (NOT the normal dialogue box -- a custom UI that looks like a real UPI notification).

**UPI Notification Component -- `src/components/minigames/UPIScamNotification.jsx`**

```jsx
export default function UPIScamNotification({ onPay, onDecline }) {
  return (
    <div className="upi-notification">
      <div className="upi-notification-header">
        <span className="upi-icon">UPI</span>
        <span>Payment Request</span>
      </div>

      <div className="upi-notification-body">
        <div className="upi-type">COLLECT REQUEST</div>
        <div className="upi-from">From: RajeshK****@oksbi</div>
        <div className="upi-amount">Rs 5,000</div>
        <div className="upi-note">"Refund - sent by mistake, please return"</div>
      </div>

      <div className="upi-actions">
        <button className="upi-pay" onClick={onPay}>PAY</button>
        <button className="upi-decline" onClick={onDecline}>DECLINE</button>
      </div>
    </div>
  )
}
```

**CSS -- `src/components/minigames/UPIScamNotification.css`**

```css
.upi-notification {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5000;
  width: 340px;
  background: #1a1a2e;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 16px;
  overflow: hidden;
  font-family: 'Inter', system-ui, sans-serif;
  animation: upi-slide-in 0.3s ease-out;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

@keyframes upi-slide-in {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

.upi-notification-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.upi-icon {
  background: #5C6BC0;
  color: #fff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.upi-notification-body {
  padding: 20px 18px;
  text-align: center;
}

.upi-type {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #EF5350;
  margin-bottom: 12px;
}

.upi-from {
  font-size: 14px;
  color: rgba(255,255,255,0.6);
  margin-bottom: 8px;
}

.upi-amount {
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.upi-note {
  font-size: 13px;
  color: rgba(255,255,255,0.5);
  font-style: italic;
}

.upi-actions {
  display: flex;
  gap: 0;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.upi-pay, .upi-decline {
  flex: 1;
  padding: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  font-family: 'Inter', system-ui, sans-serif;
  transition: background 0.2s;
}

.upi-pay {
  background: #4CAF50;
  color: #fff;
}

.upi-pay:hover {
  background: #43A047;
}

.upi-decline {
  background: rgba(255,255,255,0.08);
  color: #EF5350;
}

.upi-decline:hover {
  background: rgba(255,255,255,0.12);
}
```

**PAY outcome:**
- `spendMoney(5000, 'UPI scam - collect request')` -- Rs 5,000 instantly gone
- HUD flashes red
- Dialogue: "You just paid Rs 5,000 to a scammer! A COLLECT request means THEY are asking YOU for money. Never pay a collect request from strangers. The 'refund sent by mistake' is the most common UPI scam in India -- 13.4 lakh cases in FY 2023-24."
- `updateHealth(-15)`
- Store: `setPlayerChoice('scamUPI', 'fell')`

**DECLINE outcome:**
- Dialogue: "Smart! That was a COLLECT REQUEST scam. The scammer claims to have sent money 'by mistake' and asks you to 'return' it. But a collect request actually takes money FROM you. You saved Rs 5,000!"
- `addMoney(2000, 'Scam awareness bonus')` -- Bonus for being smart
- `updateHealth(5)`
- Store: `setPlayerChoice('scamUPI', 'avoided')`

### 3. Scam 2: KYC Phone Call (Dialogue-based)

After UPI scam resolution, continues as normal dialogue:

**Step:** "Your phone rings... 'Hello sir, I'm calling from your bank. Your KYC is expiring today. Please share your Aadhaar number and UPI PIN to verify your identity, or your account will be blocked.'"

Choices:
- **"Share details"** -> "You just gave a scammer your identity and UPI PIN! Banks NEVER ask for UPI PIN over phone. Your PIN is only for authorizing payments, not for verification." (`setPlayerChoice('scamKYC', 'fell')`, `updateHealth(-10)`)
- **"Hang up"** -> "Correct! Banks never ask for Aadhaar or UPI PIN over the phone. If someone calls claiming to be from your bank, hang up and call the official bank number yourself." (`setPlayerChoice('scamKYC', 'avoided')`, `updateHealth(3)`)

### 4. Scam 3: Investment Scam (Dialogue-based)

**Step:** "A message appears: 'GUARANTEED RETURNS! Invest Rs 10,000 today, get Rs 1,00,000 in just 30 days! Limited slots! Join our WhatsApp group now!'"

Choices:
- **"Invest Rs 10,000"** -> "That was a Ponzi scheme. Your Rs 10,000 is gone forever. No legitimate investment gives 10x returns in 30 days. If it sounds too good to be true, it IS." (`spendMoney(10000, 'Ponzi scheme scam')`, `setPlayerChoice('scamPonzi', 'fell')`, `updateHealth(-10)`)
- **"Ignore it"** -> "Smart! Any investment promising unrealistic returns (10x in 30 days!) is a scam. Legitimate investments like SIPs give 12-15% per YEAR, not 900% per month." (`setPlayerChoice('scamPonzi', 'avoided')`, `updateHealth(3)`)

### 5. Scam Survival Score

After all 3 scams, show a summary:

```
SCAM SURVIVAL SCORE: X/3

[check/x] UPI Collect Request - [Avoided/Fell for it]
[check/x] KYC Phone Call - [Avoided/Fell for it]
[check/x] Investment Scam - [Avoided/Fell for it]

"In real life, 13.4 lakh UPI fraud cases were reported in FY 2023-24.
Now you know how to spot them."
```

- `completeZone('scampark')`
- `advanceMonth()`

### 6. Dialogue Data -- `src/data/dialogues/scamParkDialogue.js`

The full quest is orchestrated as a sequence:
1. Friendly Stranger triggers the UPI notification (custom component, not dialogue)
2. After UPI resolution, remaining scams proceed as dialogue steps
3. Final summary as last dialogue step

```js
import useGameStore from '../../stores/gameStore'

export function createScamParkQuest() {
  // This returns an object with a special flag indicating it uses
  // the UPI notification component first, then continues as dialogue
  return {
    type: 'scam-quest', // Special type checked by the dialogue trigger
    npcName: 'Scam Awareness',
    npcColor: '#EF5350',
    // Phase 1: UPI notification (handled by ScamParkController)
    // Phase 2: KYC + Ponzi as dialogue steps
    dialogueAfterUPI: {
      npcName: 'Scam Awareness',
      npcColor: '#EF5350',
      steps: [
        // KYC Scam
        {
          text: "Your phone rings... 'Hello sir, I'm calling from your bank. Your KYC is expiring today. Please share your Aadhaar number and UPI PIN to verify, or your account will be blocked immediately.'",
          choices: [
            {
              label: 'Share my details',
              action: () => {
                useGameStore.getState().setPlayerChoice('scamKYC', 'fell')
                useGameStore.getState().updateHealth(-10)
              },
              nextStep: 1
            },
            {
              label: 'Hang up immediately',
              action: () => {
                useGameStore.getState().setPlayerChoice('scamKYC', 'avoided')
                useGameStore.getState().updateHealth(3)
              },
              nextStep: 2
            }
          ]
        },
        // KYC fell response
        {
          text: "You just gave a scammer your identity and UPI PIN! Banks NEVER ask for UPI PIN over the phone. Your PIN is only for authorizing payments, not for 'verification'. Always hang up and call the official bank number.",
          choices: [{ label: 'I\'ll remember that', action: null, nextStep: 3 }]
        },
        // KYC avoided response
        {
          text: "Correct! Banks never ask for Aadhaar or UPI PIN over the phone. If someone claims to be from your bank, hang up and call the official number yourself. Well done!",
          choices: [{ label: 'Got it', action: null, nextStep: 3 }]
        },
        // Ponzi scam
        {
          text: "A WhatsApp message appears: 'GUARANTEED RETURNS! Invest Rs 10,000 today, get Rs 1,00,000 in just 30 days! Limited slots available! Join now!'",
          choices: [
            {
              label: 'Invest Rs 10,000',
              action: () => {
                useGameStore.getState().spendMoney(10000, 'Ponzi scheme scam')
                useGameStore.getState().setPlayerChoice('scamPonzi', 'fell')
                useGameStore.getState().updateHealth(-10)
              },
              nextStep: 4
            },
            {
              label: 'Ignore it',
              action: () => {
                useGameStore.getState().setPlayerChoice('scamPonzi', 'avoided')
                useGameStore.getState().updateHealth(3)
              },
              nextStep: 5
            }
          ]
        },
        // Ponzi fell
        {
          text: "That was a Ponzi scheme. Your Rs 10,000 is gone forever. No legitimate investment gives 10x returns in 30 days. If it sounds too good to be true, it IS.",
          choices: [{ label: 'Lesson learned', action: null, nextStep: 6 }]
        },
        // Ponzi avoided
        {
          text: "Smart! Any 'investment' promising unrealistic returns (10x in 30 days!) is a scam. Legitimate investments like SIPs give 12-15% per year, not 900% per month.",
          choices: [{ label: 'Makes sense', action: null, nextStep: 6 }]
        },
        // Summary
        {
          text: "--- SCAM SURVIVAL SCORE ---\n\nYou've completed the Scam Awareness zone. In real life, 13.4 lakh UPI fraud cases were reported in India in FY 2023-24. Young people are the most targeted group.\n\nRemember:\n- COLLECT requests take money FROM you\n- Banks never ask for UPI PIN on phone\n- If returns sound too good, it's a scam\n\nStay alert. Stay safe.",
          choices: [
            {
              label: 'Back to island',
              action: () => {
                useGameStore.getState().completeZone('scampark')
                useGameStore.getState().advanceMonth()
              },
              nextStep: null
            }
          ]
        }
      ]
    }
  }
}
```

### 7. Scam Park Controller -- `src/components/zones/ScamParkController.jsx`

A component that manages the scam quest flow (UPI notification first, then dialogue):

```jsx
import { useState } from 'react'
import useGameStore from '../../stores/gameStore'
import UPIScamNotification from '../minigames/UPIScamNotification'

export default function ScamParkController({ onComplete }) {
  const [phase, setPhase] = useState('upi') // 'upi' | 'dialogue' | 'done'

  const handlePay = () => {
    useGameStore.getState().spendMoney(5000, 'UPI scam - collect request')
    useGameStore.getState().setPlayerChoice('scamUPI', 'fell')
    useGameStore.getState().updateHealth(-15)
    setPhase('dialogue')
    // Set the remaining scam dialogue
    // ... trigger dialogue for KYC + Ponzi
  }

  const handleDecline = () => {
    useGameStore.getState().addMoney(2000, 'Scam awareness bonus')
    useGameStore.getState().setPlayerChoice('scamUPI', 'avoided')
    useGameStore.getState().updateHealth(5)
    setPhase('dialogue')
  }

  if (phase === 'upi') {
    return <UPIScamNotification onPay={handlePay} onDecline={handleDecline} />
  }

  // After UPI, the remaining scams proceed via the normal dialogue system
  // The parent should set the dialogue in the store
  return null
}
```

## Files to Create/Modify

| Action | File Path |
|--------|-----------|
| Create | `src/components/minigames/UPIScamNotification.jsx` |
| Create | `src/components/minigames/UPIScamNotification.css` |
| Create | `src/components/zones/ScamParkController.jsx` |
| Create | `src/data/dialogues/scamParkDialogue.js` |
| Modify | `src/data/npcs.js` (update Friendly Stranger with scam dialogue) |
| Modify | `src/App.jsx` (add ScamParkController rendering logic) |

## Acceptance Criteria

- [ ] Walking to Scam Park NPC and pressing E triggers the UPI scam notification
- [ ] UPI notification looks like a real phone payment request (centered overlay)
- [ ] Pressing PAY deducts Rs 5,000 from balance (HUD flashes red)
- [ ] Pressing DECLINE earns Rs 2,000 bonus (HUD flashes green)
- [ ] After UPI resolution, KYC phone call scam appears as dialogue
- [ ] KYC scam has 2 choices: share details (lose health) or hang up (gain health)
- [ ] After KYC, Ponzi scam appears as dialogue
- [ ] Ponzi scam: investing loses Rs 10,000, ignoring gains health
- [ ] Final summary shows Scam Survival Score (X/3)
- [ ] All 3 scam results stored in playerChoices
- [ ] Scam Park zone marked complete
- [ ] Month advances
- [ ] No console errors

## What NOT to Do

- Do NOT make more than 3 scam encounters (keep it quick for the demo)
- Do NOT add actual UPI integration or payment APIs
- Do NOT add phone vibration or sound effects
- Do NOT make the UPI notification dismissible without choosing (force PAY or DECLINE)

## Estimated Complexity
Medium-Complex
