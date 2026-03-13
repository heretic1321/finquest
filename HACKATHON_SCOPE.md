# FinQuest — 24-Hour Hackathon Scope (Realistic)

## Starting Point: ZERO

The current scaffold doesn't run. We are building from scratch. Every hour counts.

**Team assumption:** 3-4 people, varying skill levels in React/Three.js.

---

## The Honest Time Budget

```
24 hours total
 - 2 hrs  sleep/rest (minimum, people will crash)
 - 2 hrs  eating, breaks, context switching
 - 2 hrs  presentation prep + demo rehearsal
 - 1 hr   debugging/deployment/last-minute fires
─────────────────
17 hrs  actual coding time

If 3 people working in parallel: ~50 person-hours
If 2 effective coders + 1 on content/design: ~40 person-hours
```

---

## What Wins This Hackathon

Judges spend 5-7 minutes per demo. They care about:

1. **Working demo** — not slides, not figma, PLAYABLE
2. **Does it solve the PS?** — Gamified financial education, clearly
3. **Creativity** — Is this different from a quiz app?
4. **"Oh shit" moment** — One thing that makes the judge go "wow"
5. **Polish** — Does it feel like a product or a homework assignment?

**Our "oh shit" moment:** The UPI scam simulation where real virtual money vanishes from your account. Every Indian judge has either been scammed or knows someone who has. It's visceral and immediately proves the concept works.

---

## Scope Decision: What We BUILD vs What We TALK ABOUT

### BUILD (in the game, playable)

| Feature | Why it makes the cut |
|---------|---------------------|
| 3D island world with player movement | The visual hook. "It's a 3D game" is instantly impressive at a hackathon. |
| Virtual bank account HUD (always visible) | The differentiator. This is the CORE MECHANIC. |
| TechCorp zone: CTC vs in-hand salary lesson + salary credited | Sets up the money system. Without income, nothing works. |
| Budget allocation mini-game (PS5/Goa/SIP choices) | The fun part. Relatable, funny, teaches budgeting. |
| Scam Park: UPI collect request encounter | The "oh shit" moment. ₹5,000 vanishes from HUD in real-time. |
| SIP calculator with compounding visual | Proves educational value. Visual, interactive, impressive. |
| End-game summary (net worth + 20-year projection) | Ties it all together. "Here's what your choices led to." |

### TALK ABOUT (in pitch, show in user story doc)

| Feature | One-line pitch |
|---------|---------------|
| Hospital zone + insurance | "We simulate a ₹2.5L medical emergency — insured players pay ₹0, uninsured go bankrupt" |
| Tax filing (Section 80C, ITR) | "Players learn old vs new regime through an interactive tax calculator" |
| Credit/CIBIL zone | "Every EMI and loan payment affects your credit score in real-time" |
| Random life events | "Diwali spending pressure, market crashes, laptop breaking — life happens" |
| AI NPC conversations | "NPCs powered by LLMs give personalized financial advice" |
| Personalization | "Game adapts based on your age, income, and knowledge level" |
| Latte factor tracker | "Small daily spending tracked silently, revealed as ₹1.13 Cr opportunity cost" |

### DO NOT EVEN MENTION

| Feature | Why |
|---------|-----|
| Multiplayer/leaderboard | Out of scope, doesn't add to pitch |
| Mobile responsive | Demo on laptop, mention "mobile-first" if asked |
| Sound/music | Nice but not worth the time investment |
| Stock market trading sim | Too complex for the value it adds |

---

## P0 — MUST SHIP (The Minimum Playable Demo)

Everything below this line MUST work for us to have a submittable demo. If any of these aren't done, the demo fails.

### Task 1: 3D World Foundation
**Time: 3-4 hours | Owner: Whoever knows Three.js best**

What to build:
- React + Vite + Three.js + React Three Fiber + Rapier setup (WORKING, verified)
- Island terrain (green cylinder + sandy edge)
- Ocean plane with wave animation
- Sky + lighting + fog
- Player capsule with WASD movement + sprint
- Third-person camera follow
- 3-4 NPC capsules at fixed positions with name tags
- Proximity detection (walk near NPC → "[E] Talk" prompt appears)
- 3 distinct zone buildings: TechCorp (glass-blue box), Scam Park area (trees + benches), MF Tower (tall grey box)

What to SKIP:
- Fancy models (capsules + boxes are fine)
- Trees/rocks decoration (add later if time)
- Jump mechanic (unnecessary)
- Post-processing effects

**Done when:** Player can walk around island, see zone buildings, see NPC names, and [E] prompt appears near NPCs.

---

### Task 2: UI Layer + Dialogue System
**Time: 3-4 hours | Owner: Strongest React dev**

What to build:
- **FinQuest Bank HUD** (persistent, top-right corner):
  - Balance: ₹XX,XXX (large, always visible)
  - Financial Health bar (0-100)
  - Month indicator (Month X/12)
  - Minimalist, semi-transparent dark background

- **Dialogue Box** (bottom-center, appears when talking to NPC):
  - NPC name + avatar color dot
  - Text content (can be multi-step)
  - 2-4 choice buttons
  - Click choice → triggers next dialogue step or action
  - "Close" / auto-close on last step

- **Zustand Store** (game state):
  - `balance` (number)
  - `financialHealth` (0-100)
  - `month` (1-12)
  - `transactions[]` (log of income/expenses)
  - `activeDialogue` (current NPC conversation)
  - `completedZones[]` (which zones are done)
  - `investments` (SIP amount, insurance bought, etc.)
  - Actions: `addMoney()`, `spendMoney()`, `setDialogue()`, `advanceMonth()`

- **Full-screen overlay system** for mini-games (budget allocation, SIP calculator)
  - A simple overlay component that takes children and dims the 3D world behind it

What to SKIP:
- Loading screen (just show the 3D world loading naturally)
- Quest tracker UI (track internally, show in end-game report)
- Animations on HUD (static updates are fine)

**Done when:** HUD shows ₹0, dialogue box appears/disappears when talking to NPC, choices trigger callbacks, overlays work.

---

### Task 3: TechCorp Zone — First Salary
**Time: 2-3 hours | Can start after Tasks 1+2 are partially done**

The quest flow:
1. Player walks to TechCorp building, talks to NPC "HR Vikram"
2. Dialogue: "Congrats! You're hired at TechCorp. CTC: ₹8,00,000/year"
3. Dialogue: "Quick question — how much will you get in-hand monthly?"
4. **Choice buttons:** ₹66,667 | ₹55,000 | ₹48,000 | ₹42,000
5. If wrong (most will pick ₹66,667): "Haha, classic mistake! CTC ≠ in-hand. Let me explain..."
6. Show **offer letter breakdown panel** (CTC components → deductions → actual in-hand ₹45,000)
7. **₹45,000 credited to bank** → HUD updates live with a green flash
8. Auto-deduction: ₹26,500 for rent/food/transport/loan → HUD shows ₹18,500 remaining
9. Dialogue: "You have ₹18,500 left. How you spend this... that's up to you."
10. Mark TechCorp zone complete, advance to Month 2

**Done when:** Player talks to NPC → goes through dialogue → bank balance goes 0 → 45K → 18.5K with visual feedback.

---

### Task 4: Budget Allocation Mini-Game
**Time: 3-4 hours | The hardest P0 task**

Triggered after TechCorp quest (or by talking to a "Budget" NPC). Opens full-screen overlay:

UI:
```
YOUR SALARY: ₹18,500 remaining    BANK: ₹18,500

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  🎮 PS5  │ │ ✈️ Goa   │ │ 👟 Shoes │ │ 📱iPhone │
│  ₹50,000 │ │ ₹25,000  │ │ ₹15,000  │ │₹5,000/mo │
│ [SELECT] │ │ [SELECT] │ │ [SELECT] │ │ [SELECT] │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 💰 SIP   │ │ 🏠Parents│ │ 🛡️Insure │ │ 💳 Save  │
│₹5,000/mo │ │ ₹10,000  │ │₹1,000/mo │ │ ₹5,000   │
│ [SELECT] │ │ [SELECT] │ │ [SELECT] │ │ [SELECT] │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

TOTAL SELECTED: ₹_____    [CONFIRM CHOICES]
```

- Toggle cards on/off. Total updates live.
- If total > ₹18,500 → show "OVERSPENT! ₹X will be credit card debt at 36% interest"
- If PS5 selected → "That's more than your entire salary!"
- After confirm → deduct from bank → show quick outcome text:
  - SIP chosen: "Your ₹5,000 starts growing from this month 📈"
  - Insurance chosen: "You're now protected against medical emergencies 🛡️"
  - PS5 on credit: "You now owe ₹50,000 at 36% interest. That's ₹68,000 over 12 months."
  - Nothing saved: "No emergency fund. Hope nothing goes wrong..."
- Teach 50/30/20 rule briefly. Advance month.

**Done when:** Player selects spending choices → bank balance updates → consequences shown → month advances.

---

### Task 5: Scam Park — UPI Encounter
**Time: 2-3 hours**

Player walks to park area, talks to NPC. Instead of normal dialogue, a **fake phone notification** appears:

```
┌─────────────────────────────────┐
│ 📱 UPI NOTIFICATION             │
│                                 │
│ COLLECT REQUEST                 │
│ From: RajeshK****@oksbi        │
│ Amount: ₹5,000                 │
│ Note: "Refund — sent by mistake"│
│                                 │
│   [✅ PAY]      [❌ DECLINE]    │
└─────────────────────────────────┘
```

- **PAY:** ₹5,000 instantly deducted from bank. HUD flashes red. Scam explanation shown.
- **DECLINE:** "Smart! That was a collect request scam." +₹2,000 bonus.

Then 1-2 more quick scams (just dialogue choices, no fancy UI needed):
- KYC call: "Share your Aadhaar and UPI PIN?" → correct answer = hang up
- Too-good offer: "₹10,000 → ₹1,00,000 in 30 days?" → correct answer = walk away

End with Scam Survival Score (X/3 avoided).

**Done when:** UPI notification appears → player choice → money deducted/saved → bank updates instantly.

---

### Task 6: SIP Calculator
**Time: 2 hours**

Accessed by talking to NPC at MF Tower. Full-screen overlay:

- 3 sliders: Monthly amount (₹1K-₹15K), Return % (8-15%), Years (5-30)
- Live updating result: Total invested vs Total value
- Simple bar chart or number comparison showing growth
- "What if you started 5 years later?" comparison line
- "Start SIP" button → deducts from bank monthly going forward

Keep it SIMPLE. Three sliders, big numbers, one comparison. No animated charts (waste of time to build).

**Done when:** Sliders work, numbers update live, "start SIP" adds to investments in store.

---

### Task 7: End-Game Summary
**Time: 1.5 hours**

Triggered by button in HUD ("View Report") or after visiting 3+ zones. Full-screen overlay:

- **Net Worth** = Balance + Emergency Fund + SIP portfolio value - Debt
- **Breakdown:** What you earned, what you spent, what you invested, what you lost to scams
- **20-year projection:** "If you continue this habit: ₹XX,XX,XXX" (simple compound interest calc)
- **Zone completion:** checkmarks for zones visited
- **One-liner verdict:** "Financially Free ✅" / "Paycheck to Paycheck ⚠️" / "Drowning in Debt ❌"

**Done when:** Report pulls all data from store, shows net worth, shows projection, looks clean.

---

## P0 Summary

| Task | Hours | Dependency |
|------|-------|------------|
| 1. 3D World | 3-4 | None (start immediately) |
| 2. UI + Dialogue + Store | 3-4 | None (start in parallel with Task 1) |
| 3. TechCorp Quest | 2-3 | Needs Task 1 (NPC) + Task 2 (dialogue) |
| 4. Budget Game | 3-4 | Needs Task 2 (overlay) + Task 3 (salary in bank) |
| 5. Scam Park | 2-3 | Needs Task 2 (dialogue + bank) |
| 6. SIP Calculator | 2 | Needs Task 2 (overlay + bank) |
| 7. End-Game Report | 1.5 | Needs Task 2 (overlay + store data) |

**Critical path:** Task 1 + Task 2 (parallel, 4 hrs) → Task 3 (2.5 hrs) → Task 4 (3.5 hrs) = **10 hrs minimum**

**Parallel work:** Tasks 5, 6, 7 can be built by a second person once Task 2 is done.

```
Timeline with 2 developers:

Dev A (3D + Quests):    [Task 1: 4hrs][Task 3: 2.5hrs][Task 4: 3.5hrs][Task 5: 2.5hrs]
Dev B (UI + Tools):     [Task 2: 4hrs][Task 6: 2hrs  ][Task 7: 1.5hrs][Polish: 2hrs  ]
                        ├─────────────┼──────────────┼──────────────┼──────────────┤
                        0             4              8              12            16 hrs
```

With 2 devs: **all P0 done in ~14-15 hours**, leaving 3-4 hours for polish and presentation.

---

## If P0 Is Done Early — What Next (in order)

| Priority | Feature | Time | Bang for Buck |
|----------|---------|------|---------------|
| 1st | **Hospital zone: Meera's story + insurance option** | 2 hrs | Emotional anchor. Strong for pitch. |
| 2nd | **Onboarding form** (name, age, income before game starts) | 1 hr | Makes personalization claim credible. |
| 3rd | **Zone buildings visual variety** (different colors/shapes per zone) | 1 hr | Island looks more like a real game world. |
| 4th | **Random event: medical emergency** (insurance payoff) | 1.5 hrs | Proves consequence engine works. |
| 5th | **Better NPC visuals** (distinct colors, topic icons) | 0.5 hr | Quick polish. |

---

## What to CUT If Running Behind

If at hour 12 things are behind schedule, ruthlessly cut:

| Cut this | Replace with |
|----------|-------------|
| SIP Calculator fancy UI | Simple text: "₹5K/mo × 20 yrs = ₹49.9L" shown in dialogue |
| Budget game sliders | Simple 4-option multiple choice: "How do you spend ₹18,500?" |
| Multiple scam encounters | Just the UPI one. It's enough. |
| End-game report card | Simple dialogue: "Your net worth is ₹X. Here's what you learned." |
| 3D zone buildings | Just use NPCs standing in different spots on a flat island |

The absolute minimum demo: **Walk to NPC → get salary → make 1 budget choice → encounter 1 scam → see bank balance. That's 8-10 hours and still tells the full story.**

---

## The Demo Script (5 minutes)

```
[0:00] "FinQuest is a 3D island where you live through your first
        financial year — and every decision costs real virtual money."

[0:30]  Walk to TechCorp → Get hired → Show CTC vs in-hand trap
        Judge sees: ₹0 → ₹45,000 → ₹18,500 in the bank HUD

[1:30]  Budget allocation → Pick some fun + some smart options
        Judge sees: Bank balance drain as choices are made

[2:30]  Walk to Scam Park → UPI collect request appears
        Judge sees: Either ₹5,000 vanishes or gets saved

[3:30]  SIP Calculator → Show ₹5,000/mo becoming ₹50L in 20 years
        Judge sees: Compounding visualized

[4:00]  End-game report → Net worth, choices summary, 20-year projection
        Judge sees: "Your PS5 actually cost you ₹6.25 lakh"

[4:30]  "Every Indian college student needs this. Nobody teaches
         salary structure, UPI scam detection, or SIP compounding
         in any college curriculum. We teach it by making you LIVE it."

[5:00]  Q&A
```

---

## The Pitch Angle

**One-liner:** "FinQuest is a 3D island game where every financial decision costs you real virtual money."

**The hook:** "We don't quiz you on insurance. We let you skip it, then hit you with a ₹2.5 lakh hospital bill."

**For judges who ask 'how is this different':** "Coastal World is a marketing tool for US fintechs. Quiz apps test memorization. FinQuest is a LIFE SIMULATOR — you feel the consequences of bad decisions before you make them in real life. And everything is Indian — CTC, UPI scams, Section 80C, SIP, CIBIL."
