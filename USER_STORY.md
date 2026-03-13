# FinQuest - User Story & Game Design Document

> **This document serves two purposes:**
> 1. **Vision doc** — the full game concept with all zones, quests, and systems
> 2. **Pitch doc** — for judges to understand the depth of the idea
>
> Not everything here is built in the hackathon demo. See the MVP/Roadmap guide below.

---

## MVP vs Roadmap — What's Playable Now

| Feature | Status | Notes |
|---------|--------|-------|
| 3D island world + player movement | **MVP — Built** | Walkable island with zone buildings, NPCs |
| Virtual Bank Account HUD | **MVP — Built** | Persistent balance, live updates on every action |
| TechCorp: CTC vs In-Hand salary | **MVP — Built** | Full quest with offer letter, quiz, salary credit |
| Budget Allocation mini-game | **MVP — Built** | PS5/Goa/SIP/Insurance cards, bank drains live |
| Scam Park: UPI collect request | **MVP — Built** | Fake notification, real ₹ consequence |
| SIP Calculator with compounding | **MVP — Built** | Sliders, live numbers, "5 years late" comparison |
| End-Game Report Card | **MVP — Built** | Net worth, breakdown, 20-year projection |
| Hospital: Meera's insurance story | Roadmap | Emotional story + insurance with/without comparison |
| Tax Haveli: Section 80C, ITR | Roadmap | Old vs new regime calculator, guided ITR filing |
| Dalal Street: Stock market zone | Roadmap | Mock trading, NIFTY history, portfolio building |
| Credit Chowk: CIBIL & EMI | Roadmap | Credit score simulator, EMI trap mini-game |
| Onboarding personalization | Roadmap | Age/income/goals form that adapts NPC dialogue |
| Random life events | Roadmap | Medical emergency, market crash, festival pressure |
| Latte Factor tracker | Roadmap | Silent small-expense logging, 20-year opportunity cost |
| Island Mall & Temptation shops | Roadmap | Avatar cosmetics vs investing trade-off |
| AI-powered NPC conversations | Roadmap | LLM-driven personalized financial advice |
| 12-month time simulation | Roadmap | Full year with monthly salary, auto-debits, compounding |

---

## Table of Contents

1. [The Problem: Financial Literacy Gaps in India](#1-the-problem)
2. [Our Solution: Creative Education Through Play](#2-our-solution)
3. [The Virtual Money System — The Heart of FinQuest](#3-the-virtual-money-system)
4. [Game World Overview](#4-game-world-overview)
5. [Onboarding & Personalization](#5-onboarding--personalization)
6. [Complete User Story Walkthrough](#6-complete-user-story-walkthrough)
7. [Zone Details & Quest Design](#7-zone-details--quest-design)
8. [Progression & Reward System](#8-progression--reward-system)
9. [Technical Notes](#9-technical-notes)

---

## 1. The Problem

### India's Financial Literacy Crisis

India has one of the lowest financial literacy rates among major economies. The numbers paint a grim picture:

- **Only 27% of Indian adults are financially literate** — compared to 52% in advanced economies (Source: S&P Global/WEF)
- **Youth literacy is even lower** — a large percentage of Indian youth lack even rudimentary knowledge about personal finance
- **No standardized curriculum** — most Indian schools and colleges have zero financial education in their syllabus
- **Cultural taboo** — money discussions are considered "private" in most Indian households, so kids never learn from family either

### Specific Knowledge Gaps Among Indian College Students

| Gap Area | What Students Don't Know |
|----------|------------------------|
| **Salary Structure** | What CTC, basic pay, HRA, PF, gratuity mean. Most students think CTC = in-hand salary |
| **Tax Filing** | How to file ITR, what Form 16 is, what Section 80C/80D deductions are, old vs new tax regime |
| **Insurance** | 95% of young Indians buy wrong insurance (endowment/ULIP) for "investment." Don't know difference between term and endowment |
| **Health Insurance** | Don't understand cashless claims, co-pay, waiting periods. Often realize importance only during medical emergencies |
| **Investing** | Know about FDs but not SIPs, mutual funds, or index funds. Don't understand compounding |
| **Credit & Loans** | No idea what CIBIL score is, how education loan EMI affects it, or how credit cards actually work |
| **Digital Fraud** | 13.4 lakh UPI fraud cases in FY 2023-24. Students don't know UPI PIN is only for sending money, not receiving |
| **Budgeting** | Living paycheck to paycheck. No emergency fund concept. Lifestyle inflation with first salary |
| **Emergency Fund** | Don't maintain 3-6 months expenses as buffer. One medical emergency can destroy finances |

### The Real-World Consequences

- Students who skip health insurance face devastating hospital bills during family emergencies
- Young professionals lose money to UPI scams because nobody taught them how scams work
- Starting SIP at 25 vs 35 means the difference between ₹3 crore and ₹1.5 crore by age 60 (at ₹10,000/month)
- Wrong insurance policies lock up money for 15-20 years with 5-6% returns when inflation is 6-7%
- Poor CIBIL score from missed education loan EMIs blocks future home/car loans

---

## 2. Our Solution

### Philosophy: "Learn by Living, Not by Lecturing"

FinQuest doesn't teach finance through boring slideshows or quiz questions. Instead, **the player lives through realistic Indian financial scenarios** on a 3D island and faces real consequences for their decisions. Every lesson is wrapped in a story, an emotion, or a challenge.

### Creative Education Techniques We Use

| Technique | How We Use It | Why It Works |
|-----------|--------------|--------------|
| **Emotional Storytelling** | Hospital zone — meet someone crushed by medical bills because they skipped insurance | Emotional anchoring makes lessons stick 10x better than facts |
| **Consequence Simulation** | Bad budget choices → financial health drops → can't unlock next zone | Players feel the pain of bad decisions in a safe environment |
| **Scam Role-Play** | Park zone — NPCs try to scam you with real Indian scam tactics | Pattern recognition through experience, not warnings |
| **Visual Compounding** | SIP calculator shows ₹5,000/month growing to ₹1+ crore with animated growth | Seeing numbers grow visually is more powerful than hearing "compounding is important" |
| **Decision Dilemmas** | "First salary: PS5, Goa trip, or SIP?" — funny but teaches prioritization | Humor + relatability = engagement + retention |
| **Personalization** | Game adapts based on user's age, income, goals entered during onboarding | Relevant content = higher engagement. A 20-year-old doesn't need retirement planning yet |
| **NPC Mentors** | AI-powered NPCs who talk like real Indian financial advisors, CAs, and bankers | Conversational learning feels natural, not academic |
| **Peer Pressure Simulation** | Friend NPCs pressure you to spend on things you don't need | Mirrors real social pressure young Indians face |
| **Time-Lapse Consequences** | See how your choices play out over 5, 10, 20 years in fast-forward | Bridges the gap between "now" and "future" that young people struggle with |
| **Achievement Unlocks** | Complete insurance quest → earn "Protected" badge. Complete tax quest → "Tax Ninja" | Gamification drives completion. 45% higher engagement per research |

---

## 3. The Virtual Money System — The Heart of FinQuest

### Philosophy: "You Don't Learn Swimming by Reading About It"

The single most important design decision in FinQuest is this: **the player has a virtual bank account with real (virtual) rupees, and every financial decision in the game costs or earns actual money from that account.** This isn't a cosmetic points system. This is a full financial life simulation.

You don't just *hear* that budgeting matters — you run out of money in Month 2 because you blew it on a PS5. You don't just *learn* that SIPs compound — you watch your ₹5,000/month turn into ₹1.2L over your in-game career while your friend NPC who didn't invest still has nothing. You don't just *read* about insurance — a random medical emergency hits, and you either breeze through it or go bankrupt depending on whether you bought a policy 3 months ago.

**The virtual money IS the curriculum.**

---

### 3.1 How the Economy Works

#### The Game Clock

The game runs on an **accelerated time system**. Each major zone/quest the player completes advances the clock by ~1 month. Over a full playthrough, the player lives through **12 game-months (1 year)** of financial life. This gives enough time for:
- SIPs to show visible compounding
- Emergency events to test preparedness
- Bad decisions to snowball into consequences
- Good habits to visibly pay off

```
┌──────────────────────────────────────────────────────┐
│                  FINQUEST TIMELINE                    │
│                                                      │
│  Month 1    Arrive on island, get job at TechCorp    │
│  Month 2    First salary → Budget allocation         │
│  Month 3    Explore zones, first SIP auto-debits     │
│  Month 4    ⚡ RANDOM EVENT: Festival season          │
│  Month 5    Insurance zone, stock market zone        │
│  Month 6    ⚡ RANDOM EVENT: Medical emergency        │
│  Month 7    Tax filing season, mid-year review       │
│  Month 8    ⚡ RANDOM EVENT: Market crash (-20%)      │
│  Month 9    Credit zone, SIP continues growing       │
│  Month 10   ⚡ RANDOM EVENT: Salary hike! +15%       │
│  Month 11   Market recovers, investments show gains  │
│  Month 12   FINALE: Full financial health report     │
│                                                      │
│  Each quest = ~1 month of game time advancing        │
└──────────────────────────────────────────────────────┘
```

#### The Virtual Bank Account

Every player has a **FinQuest Bank Account** visible as a persistent HUD element on screen. This is their real-time financial dashboard:

```
╔═══════════════════════════════════════════════════════════╗
║  📱 FINQUEST BANK                          Month: 6/12   ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  💰 Savings Account         ₹28,400    (4% p.a.)        ║
║  🏦 Emergency Fund          ₹15,000    (target: ₹1.35L) ║
║  📈 SIP Portfolio           ₹32,800    (invested: ₹30K) ║
║  📊 Stock Portfolio         ₹12,600    (invested: ₹10K) ║
║  🛡️  Insurance              Active     (₹5L health)     ║
║  ─────────────────────────────────────────────────────── ║
║  📋 NET WORTH:              ₹88,800                      ║
║  💳 DEBT:                   ₹0                           ║
║  ─────────────────────────────────────────────────────── ║
║  🏷️  CIBIL Score:           720                          ║
║  ❤️  Financial Health:       72/100                       ║
║                                                           ║
║  📅 This Month:                                          ║
║  Income:   +₹45,000 (salary)                            ║
║  Expenses: -₹27,000 (rent, food, bills)                 ║
║  SIP:      -₹5,000  (auto-debit)                        ║
║  Insurance:-₹1,000  (auto-debit)                        ║
║  Remaining: ₹12,000                                     ║
╚═══════════════════════════════════════════════════════════╝
```

This dashboard is **always visible** (minimized on screen, expandable on click). Every financial action the player takes — buying something, investing, paying a bill, getting scammed — immediately reflects here. The player watches their net worth grow or shrink in real-time.

---

### 3.2 Income Sources

| Source | Amount | Frequency | How It Works |
|--------|--------|-----------|-------------|
| **TechCorp Salary** | ₹45,000/month | Every game-month | Auto-credited after tax deductions. This is the player's primary income throughout the game. |
| **Quest Bonuses** | ₹500 - ₹5,000 | Per quest | Smart decisions in quests earn cash rewards (e.g., correctly avoiding a scam = ₹2,000 bonus) |
| **Investment Returns** | Variable | Monthly | SIP grows at simulated 12% p.a., stocks fluctuate, FD gives 7% — all calculated in real-time |
| **Tax Refund** | Up to ₹14,400 | Once (Month 7) | If player files ITR correctly and chose old regime with deductions, they get a real refund deposited |
| **Salary Hike** | +15% of salary | Month 10 event | Performance bonus / appraisal — rewards players who did well at TechCorp quests |
| **Referral Bonus** | ₹2,000 | Optional | Helping another NPC with financial advice earns a thank-you payment |

---

### 3.3 Mandatory Expenses (Auto-Deducted Monthly)

These represent the non-negotiable cost of living. They're automatically deducted each game-month to teach players that expenses are constant and unavoidable.

| Expense | Amount | Notes |
|---------|--------|-------|
| **Rent** | ₹12,000 | Shared flat in city. Can't skip. |
| **Food & Groceries** | ₹6,000 | Basic cooking + occasional eating out |
| **Transport** | ₹2,000 | Metro/bus pass |
| **Utilities** | ₹1,500 | Electricity, WiFi, phone recharge |
| **Education Loan EMI** | ₹5,000 | Pre-existing student loan (CIBIL impact!) |
| **TOTAL** | **₹26,500** | Leaves ₹18,500 discretionary from ₹45,000 |

The player sees this deduction happen automatically every month. They quickly realize: **"I don't have ₹45,000 to spend. I have ₹18,500."** This alone is a massive lesson most young Indians learn the hard way.

---

### 3.4 Voluntary Spending (Player Chooses)

This is where the magic happens. With ₹18,500 left after essentials, the player must decide:

#### Smart Money Moves (available anytime from the FinQuest Bank app)

| Action | Cost | Effect |
|--------|------|--------|
| **Start/Increase SIP** | ₹1,000 - ₹10,000/mo | Auto-debits monthly. Compounds at ~12% p.a. in-game. Visible growth in portfolio. |
| **Buy Health Insurance** | ₹1,000/month | ₹5L cover. If medical emergency event triggers, you pay ₹0. Without it, you pay ₹2-4.5L. |
| **Buy Term Insurance** | ₹500/month | ₹50L cover. Protects dependents. Unlocks "Responsible Adult" badge. |
| **Add to Emergency Fund** | Any amount | Liquid savings. Needed for random expense events. Target: 3 months expenses (₹80,000). |
| **Invest in Stocks** | Any amount | Buy/sell from 10 Indian stocks. Prices fluctuate each game-month. Higher risk, higher reward. |
| **Open FD** | Min ₹5,000 | Locked for 6 months game-time. Guaranteed 7% return. Safe but slow. |
| **ELSS Tax Saver** | Any amount | Same as SIP but with 80C tax benefit. 3-month lock-in (in game-time). |
| **PPF Deposit** | Up to ₹1.5L/year | Long-term safe investment. 7.1% guaranteed. Tax-free. |
| **Send Money to Parents** | ₹5,000 - ₹15,000 | No financial return, but +5 Financial Health and +emotional satisfaction |

#### Temptation Spending (NPCs and shops constantly offer these)

| Item | Cost | Consequence |
|------|------|-------------|
| **PS5** | ₹50,000 (or ₹4,200/mo EMI) | Fun but eats budget for months. If on EMI, adds to monthly drain. |
| **Goa Trip** | ₹25,000 | One-time splurge. Colleague Rahul pressures you. Instagram clout but empty wallet. |
| **Jordan Sneakers** | ₹15,000 | Peer pressure purchase. Looks cool but ₹15K gone. |
| **iPhone 16 EMI** | ₹5,000/month for 12 months | Adds ₹5,000 to mandatory expenses. ₹60,000 total for a phone. |
| **Fancy Dinner** | ₹3,000 | Colleague birthday. Social obligation. Frequent if you don't learn to say no. |
| **Online Shopping Spree** | ₹8,000 | Late-night impulse. Amazon sale NPC tempts you. |
| **Crypto "Investment"** | ₹10,000 | Scam Park offer. Money gone forever (Ponzi scheme). |
| **Subscription Stack** | ₹2,000/month | Netflix + Spotify + gym + cloud storage. Small amounts add up! |

**Key Design:** The game NEVER says "don't buy the PS5." It lets you buy it. Then it shows you what that ₹50,000 could have become in a SIP over 20 years (₹1.9 lakh at 12%). The player feels the opportunity cost viscerally.

---

### 3.5 Random Events (The Curveballs of Life)

These are the game-changers. Every few game-months, a random event fires. Whether the player survives financially depends entirely on their past decisions.

```
╔══════════════════════════════════════════════════════════╗
║                    ⚡ RANDOM EVENTS                      ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  MONTH 4: 🎉 FESTIVAL SEASON                            ║
║  ┌──────────────────────────────────────────────────┐   ║
║  │ It's Diwali! Social pressure is at an all-time   │   ║
║  │ high. Gifts for family, new clothes, sweets,     │   ║
║  │ decorations, crackers...                         │   ║
║  │                                                  │   ║
║  │ Minimum social obligation: ₹8,000                │   ║
║  │ "Full celebration" mode:   ₹25,000               │   ║
║  │ Didi's advice:             ₹10,000 (budgeted)    │   ║
║  │                                                  │   ║
║  │ How much do you spend?  [₹_____ slider]          │   ║
║  └──────────────────────────────────────────────────┘   ║
║                                                          ║
║  MONTH 6: 🏥 MEDICAL EMERGENCY                          ║
║  ┌──────────────────────────────────────────────────┐   ║
║  │ Your mother is hospitalized. Bill: ₹2,50,000     │   ║
║  │                                                  │   ║
║  │ IF you have health insurance:                    │   ║
║  │   → Cashless claim. You pay: ₹0.                 │   ║
║  │   → "Thank god you listened to Dr. Sharma."      │   ║
║  │                                                  │   ║
║  │ IF you DON'T have insurance:                     │   ║
║  │   → Emergency fund emptied: -₹____              │   ║
║  │   → Still short? Personal loan at 18%: -₹____   │   ║
║  │   → No emergency fund either? GAME CRISIS MODE.  │   ║
║  │     Salary garnished 30% for 6 months.           │   ║
║  │   → Financial Health: -25                        │   ║
║  └──────────────────────────────────────────────────┘   ║
║                                                          ║
║  MONTH 8: 📉 MARKET CRASH                               ║
║  ┌──────────────────────────────────────────────────┐   ║
║  │ Breaking News: NIFTY crashes 20%!                │   ║
║  │ Your stock portfolio: ₹12,600 → ₹10,080 (-20%) │   ║
║  │ Your SIP portfolio:   ₹32,800 → ₹26,240 (-20%) │   ║
║  │                                                  │   ║
║  │ What do you do?                                  │   ║
║  │ 🔴 PANIC SELL everything (lock in losses)        │   ║
║  │ 🟡 Stop SIP (pause investing)                    │   ║
║  │ 🟢 Continue SIP (buy more at lower prices!)      │   ║
║  │ 🟢 Increase SIP (smart: more units cheaper!)     │   ║
║  │                                                  │   ║
║  │ [Next month: Market recovers 15%]                │   ║
║  │ Players who stayed invested: portfolio rebounds   │   ║
║  │ Players who panic sold: locked in losses forever  │   ║
║  └──────────────────────────────────────────────────┘   ║
║                                                          ║
║  MONTH 10: 🎉 SALARY HIKE                               ║
║  ┌──────────────────────────────────────────────────┐   ║
║  │ Performance review! Your salary is now ₹51,750   │   ║
║  │ (+15%). What do you do with the extra ₹6,750?    │   ║
║  │                                                  │   ║
║  │ 🔴 Lifestyle upgrade! Better flat, eat out more  │   ║
║  │ 🟡 Split: half lifestyle, half increase SIP      │   ║
║  │ 🟢 Increase SIP by ₹5,000 (invest the raise!)   │   ║
║  │                                                  │   ║
║  │ Lesson: "Lifestyle inflation" is the silent      │   ║
║  │ killer of wealth. Your expenses should NOT        │   ║
║  │ grow at the same rate as your income.             │   ║
║  └──────────────────────────────────────────────────┘   ║
║                                                          ║
║  OTHER POSSIBLE EVENTS:                                  ║
║  • 🔧 Laptop breaks: ₹30,000 repair/replace            ║
║  • 🏍️  Bike accident: ₹15,000 (no vehicle insurance?)   ║
║  • 👔 Wedding invitation: ₹5,000 - ₹20,000 gift        ║
║  • 📱 Phone stolen: ₹25,000 replacement                 ║
║  • 🎓 Skill course opportunity: ₹15,000 (boosts career) ║
║  • 💼 Freelance gig: +₹20,000 (reward for side hustle)  ║
╚══════════════════════════════════════════════════════════╝
```

---

### 3.6 The In-Game Shop & Temptation Economy

Scattered across the island are **shops, vendors, and NPCs** who constantly tempt the player to spend. This mirrors real life — you're always one click away from an impulse purchase.

#### The Island Mall (Physical Location on Map)

A small marketplace area where players can browse and buy:

| Shop | Items | Price Range | Purpose |
|------|-------|-------------|---------|
| **Drip Store** | Avatar outfits, sneakers, accessories | ₹2,000 - ₹20,000 | Cosmetic. Teaches: wants vs needs |
| **Gadget Zone** | Phone, laptop, PS5, headphones | ₹10,000 - ₹60,000 | High-ticket. Teaches: EMI traps |
| **Chai Stall** | Snacks, socializing with NPCs | ₹200 - ₹500 | Small frequent expenses. Teaches: latte factor |
| **Travel Desk** | Goa trip, Manali trip, weekend getaway | ₹5,000 - ₹30,000 | Social pressure spending |
| **Skill Academy** | Online courses, certifications | ₹5,000 - ₹15,000 | Good investment in yourself. Unlocks salary hike earlier |

**Brilliant twist:** Items bought at the Drip Store make your avatar look cooler, but items bought at Skill Academy increase your salary. The game subtly shows that **investing in yourself > investing in appearances.**

#### The "Latte Factor" Tracker

A special UI element that tracks all small purchases:

```
┌───────────────────────────────────────────┐
│  ☕ THE LATTE FACTOR                       │
│                                           │
│  Your small daily expenses this month:    │
│                                           │
│  Chai + samosa (x12):           ₹1,800   │
│  Auto instead of metro (x8):    ₹1,600   │
│  Online food delivery (x6):     ₹3,600   │
│  Impulse Amazon purchase:        ₹2,400   │
│  Subscription services:          ₹2,000   │
│  ─────────────────────────────────────    │
│  TOTAL "invisible" spending:    ₹11,400   │
│                                           │
│  💡 If you SIP'd this instead:            │
│  ₹11,400/month for 20 years =            │
│                  ₹1,13,52,000 (₹1.13 Cr!)│
│                                           │
│  "It's not the big expenses that          │
│   kill you. It's the small ones           │
│   you don't even notice."                 │
└───────────────────────────────────────────┘
```

---

### 3.7 Investment Simulation Engine

The game runs a simplified but realistic simulation of Indian financial instruments:

#### SIP Simulation
- Player sets amount (₹1,000 - ₹15,000/month)
- Auto-debited each game-month from savings account
- Returns simulated at ~12% p.a. with monthly volatility (±3% randomness)
- NAV shown as units purchased × current unit price
- **Visual:** A plant on the player's island hut that literally grows bigger as SIP grows
- If player stops SIP mid-game, the plant stops growing (visual guilt!)

#### Stock Market Simulation
- 10 stocks available: Reliance, TCS, Infosys, HDFC Bank, Asian Paints, Tata Motors, Zomato, Adani Ports, ITC, Bajaj Finance
- Prices update each game-month based on simplified patterns + random events
- News ticker affects prices ("Reliance announces new energy deal → +8%")
- Player can buy/sell anytime at current price
- Teaches: volatility, diversification, long-term holding

#### Fixed Deposit
- Lock ₹5,000+ for minimum 3 game-months
- Guaranteed 7% p.a. returns
- Penalty for early withdrawal (-1%)
- Boring but safe — game shows this is good for emergency fund overflow

#### The Portfolio Comparison Screen (End of Game)

At the end, the game shows **parallel universes** — what your money would look like under different strategies:

```
╔════════════════════════════════════════════════════════════╗
║            🔮 WHAT-IF MACHINE: 20-YEAR PROJECTION         ║
║                                                            ║
║  Based on your 12-month behavior, here's where you'd be   ║
║  in 20 years if you continued these habits:                ║
║                                                            ║
║  YOUR PATH (current habits):                               ║
║  Monthly SIP: ₹5,000 | Spending: Moderate | Insured: Yes  ║
║  ┌────────────────────────────────────────────────┐       ║
║  │ Net Worth at 42: ₹78,40,000                   │       ║
║  │ Passive Income:   ₹39,200/month               │       ║
║  │ Debt: ₹0                                      │       ║
║  │ Status: FINANCIALLY FREE ✅                    │       ║
║  └────────────────────────────────────────────────┘       ║
║                                                            ║
║  THE SPENDER (no SIP, max lifestyle):                      ║
║  Monthly SIP: ₹0 | Spending: High | Insured: No           ║
║  ┌────────────────────────────────────────────────┐       ║
║  │ Net Worth at 42: ₹3,20,000                    │       ║
║  │ Passive Income:   ₹0/month                    │       ║
║  │ Debt: ₹4,50,000 (credit card + personal loan) │       ║
║  │ Status: PAYCHECK TO PAYCHECK ❌                │       ║
║  └────────────────────────────────────────────────┘       ║
║                                                            ║
║  THE MAXIMIZER (₹15K SIP, minimal spending):               ║
║  Monthly SIP: ₹15,000 | Spending: Low | Insured: Yes      ║
║  ┌────────────────────────────────────────────────┐       ║
║  │ Net Worth at 42: ₹2,35,20,000 (₹2.35 Cr!)    │       ║
║  │ Passive Income:   ₹1,17,600/month             │       ║
║  │ Debt: ₹0                                      │       ║
║  │ Status: CROREPATI 🏆                           │       ║
║  └────────────────────────────────────────────────┘       ║
║                                                            ║
║  💡 The difference between "broke at 42" and               ║
║  "crorepati at 42" is just ₹15,000/month                  ║
║  starting at age 22.                                       ║
╚════════════════════════════════════════════════════════════╝
```

---

### 3.8 How Virtual Money Integrates With Each Zone

| Zone | Money Flows IN | Money Flows OUT | Key Lesson |
|------|---------------|-----------------|------------|
| **TechCorp** | ₹45,000 salary credited | Tax + PF deducted automatically | CTC ≠ in-hand; deductions are real |
| **Budget Canteen** | — | Player allocates salary to categories | You MUST budget or you'll overshoot |
| **Hospital** | Insurance claim (₹0 cost) if insured | ₹1,000/mo premium OR ₹2.5L medical bill | Insurance = tiny cost vs catastrophic loss |
| **Scam Park** | ₹2,000 bonus for avoiding scams | ₹5,000 - ₹10,000 lost per scam fallen for | Real money gone = real lesson learned |
| **Dalal Street** | Stock gains/dividends | Stock purchases, brokerage | Investing grows money; trading ≠ gambling |
| **MF Tower** | SIP returns compound monthly | SIP auto-debit from account | Compounding is visible when it's your money |
| **Tax Haveli** | Tax refund ₹14,400 (if filed right) | ELSS/PPF investments for 80C | Tax planning SAVES real money |
| **Credit Chowk** | — | EMI payments drain monthly income | EMIs add up; debt is a trap |
| **Island Mall** | — | Impulse purchases, lifestyle spending | Every rupee spent is a rupee not invested |

---

### 3.9 The Emotional Hook: "Your Money Has a Face"

The killer feature: at the finale, the game doesn't just show numbers. It shows **what your money could have bought in real life:**

```
┌─────────────────────────────────────────────────────┐
│  💰 YOUR FINQUEST NET WORTH: ₹88,800               │
│                                                     │
│  In 20 years (projected), this becomes:             │
│                                                     │
│  ₹78,40,000                                        │
│                                                     │
│  That's enough to:                                  │
│  🏠 Down payment on a 2BHK in Bangalore             │
│  🚗 Buy a car outright (no EMI!)                    │
│  ✈️  10 international vacations                      │
│  🎓 Fund your child's entire education              │
│  🏖️  OR retire 5 years early                        │
│                                                     │
│  Remember: this started with just ₹5,000/month.     │
│                                                     │
│  Meanwhile, the PS5 you wanted in Month 2?          │
│  That ₹50,000, if invested, would be ₹6,25,000    │
│  in 20 years. That PS5 actually cost you ₹6.25L.   │
│                                                     │
│  🧠 "The real price of anything is the future       │
│      value of the money you gave up for it."        │
└─────────────────────────────────────────────────────┘
```

---

### 3.10 Anti-Patterns the Virtual Money System Teaches

Through EXPERIENCE, not lectures, the player learns to avoid:

| Anti-Pattern | How the Game Teaches It |
|-------------|------------------------|
| **"CTC is my salary"** | First paycheck is ₹45K not ₹67K. Shock. |
| **"I'll start investing later"** | End-game shows 5-year delay costs ₹25L+ |
| **"Insurance is waste of money"** | Medical emergency wipes out 6 months of savings |
| **"EMI means I can afford it"** | 3 EMIs stack to ₹19K/month, choking cash flow |
| **"Small expenses don't matter"** | Latte Factor shows ₹11K/month = ₹1.13Cr in 20 years |
| **"Market crashed, sell everything!"** | Panic sellers lock losses; SIP players buy low, win big |
| **"I don't need to file taxes"** | Miss ₹14,400 refund. Literally lose free money. |
| **"Credit score? What's that?"** | Missed EMIs tank CIBIL → can't get home loan later |
| **"Lifestyle upgrade with every hike"** | Salary goes up 15% but so do expenses → net zero growth |
| **"I'll never get scammed"** | Lose ₹5,000 to a collect request. Lesson: yes you can. |

---

## 4. Game World Overview

### The Island of FinQuest

The game is set on a vibrant 3D island divided into distinct zones. Each zone represents a critical area of personal finance. The player progresses through zones in a semi-linear fashion — some zones unlock after completing prerequisite quests, while others are freely explorable.

```
                    ╔══════════════════╗
                    ║   FINQUEST MAP   ║
                    ╚══════════════════╝

                     [Scam Park]  🌳
                    /    (Park)     \
                   /                 \
    [MedCare      /                   \    [Dalal Street]
     Hospital] 🏥 ─────── ISLAND ────── 📈  (NSE Building)
                  \      CENTER      /
                   \    (Spawn)     /
                    \              /
       [TechCorp] 💼 ──────────── 🏦 [Mutual Fund
        (Office)                       Tower]
                         |
                    [Tax Haveli] 🏛️
                    (Govt Building)

    ── Paths connecting zones
    Each zone has its own quests, NPCs, and mini-games
```

### Zone Summary

| # | Zone | Theme | Visual Style | Core Teaching |
|---|------|-------|-------------|---------------|
| 1 | **Island Center** (Spawn) | Home Base | Peaceful beach, player's small hut | Onboarding, personalization, tutorial |
| 2 | **TechCorp Office** | First Job | Modern glass office building | Salary structure, CTC breakdown, offer letter reading |
| 3 | **Tax Haveli** | Taxation | Government-style Indian building | ITR filing, 80C/80D, old vs new regime |
| 4 | **MedCare Hospital** | Insurance | Hospital with worried NPCs outside | Health & life insurance, emergency fund |
| 5 | **Scam Park** | Fraud Awareness | Beautiful park with shady characters | UPI scams, phishing, Ponzi schemes |
| 6 | **Dalal Street Exchange** | Stock Market | NSE-style building, ticker screens | How stock market works, NIFTY, investing basics |
| 7 | **Mutual Fund Tower** | Mutual Funds & SIP | Modern financial tower | MF types, SIP calculator, compounding, ELSS |
| 8 | **Credit Chowk** | Credit & Loans | Marketplace/bazaar area | CIBIL score, education loans, credit cards, EMI |

---

## 5. Onboarding & Personalization

### First-Time User Flow

When a player first arrives on the island, they wash ashore (shipwreck intro — "you've arrived on FinQuest Island with nothing but your potential!"). Before they can explore, a friendly NPC guide named **"Didi"** (elder sister figure) greets them and asks a few questions to personalize the experience.

### Personalization Questions

```
┌─────────────────────────────────────────────┐
│         WELCOME TO FINQUEST ISLAND          │
│                                             │
│  "Hey! I'm Didi, your guide on this island. │
│   Tell me a bit about yourself so I can     │
│   help you navigate this place!"            │
│                                             │
│  1. What's your name?                       │
│     [_______________]                       │
│                                             │
│  2. How old are you?                        │
│     ○ 16-18 (School student)               │
│     ○ 18-22 (College student)              │
│     ○ 22-25 (Fresh graduate / First job)   │
│     ○ 25-30 (Working professional)         │
│                                             │
│  3. What's your monthly income/allowance?   │
│     ○ Less than ₹5,000                     │
│     ○ ₹5,000 - ₹15,000                    │
│     ○ ₹15,000 - ₹50,000                   │
│     ○ ₹50,000+                             │
│                                             │
│  4. What do you know about finance?         │
│     ○ "What's a mutual fund?" (Beginner)   │
│     ○ "I know basics" (Intermediate)       │
│     ○ "I invest already" (Advanced)        │
│                                             │
│  5. What do you want to learn most?         │
│     □ How to save money                    │
│     □ How to invest                        │
│     □ How taxes work                       │
│     □ How to avoid scams                   │
│     □ Everything!                          │
│                                             │
└─────────────────────────────────────────────┘
```

### How Personalization Affects Gameplay

- **Age group** determines which zones are highlighted first (college student → budgeting first; working professional → salary/tax first)
- **Income level** adjusts all monetary examples to be relatable (₹500 SIP examples for students, ₹5,000 for professionals)
- **Knowledge level** adjusts NPC dialogue complexity (beginner gets simpler analogies, advanced gets deeper concepts)
- **Interest areas** determines which quest markers glow on the map, guiding the player toward what they want to learn first

---

## 6. Complete User Story Walkthrough

> **Player Profile:** Arjun, 21-year-old college student from Delhi, just got his first internship offer. Knows UPI but nothing about investing, taxes, or insurance.

---

### Act 1: Arrival & Onboarding (Island Center) `MVP`

**[SCENE: Arjun's avatar washes up on a beautiful island beach. Gentle waves, a few palm trees, and a small hut nearby.]**

Arjun fills out the personalization form with Didi's help. Didi explains:

> *"This island might look peaceful, but it's full of challenges — just like real life! Each area teaches you something about money that nobody taught you in college. Your choices here have consequences. Make smart ones, and you'll thrive. Make bad ones... well, you'll learn the hard way. Let's start!"*

Didi gives Arjun his **Financial Health Score: 50/100** (neutral starting point) and opens his **FinQuest Bank Account** with **₹0 balance**.

> *"Right now your bank account is empty. But don't worry — you're about to start your career. Every rupee you earn, spend, save, or invest on this island is tracked in your FinQuest Bank. Think of it as a year-long financial life simulation. Your choices will decide whether you end up financially free... or drowning in debt. Let's find out who you really are with money!"*

**[The FinQuest Bank HUD appears in the bottom-right corner — a minimized widget showing: ₹0 Balance | Month 1/12]**

**Arjun sees glowing quest markers on different parts of the island. The nearest one points toward a modern-looking office building...**

---

### Act 2: The First Job (TechCorp Office) 💼 `MVP`

**[SCENE: Arjun walks toward a sleek glass building with a sign: "TechCorp India Pvt. Ltd." There's a receptionist NPC at the entrance.]**

**Receptionist Neha:** *"Hey, congratulations! You've been selected as a Software Developer at TechCorp. Here's your offer letter. Take a look!"*

**[A UI panel opens showing an offer letter:]**

```
╔═══════════════════════════════════════════════╗
║          TECHCORP INDIA PVT. LTD.            ║
║              OFFER LETTER                     ║
║                                               ║
║  Role: Software Developer                     ║
║  CTC: ₹8,00,000 per annum                   ║
║                                               ║
║  Breakdown:                                   ║
║  ┌───────────────────┬───────────┐           ║
║  │ Component         │ Annual    │           ║
║  ├───────────────────┼───────────┤           ║
║  │ Basic Pay         │ ₹3,60,000│           ║
║  │ HRA               │ ₹1,44,000│           ║
║  │ Special Allowance │ ₹1,00,000│           ║
║  │ PF (Employer)     │ ₹43,200  │           ║
║  │ Gratuity          │ ₹17,308  │           ║
║  │ Insurance         │ ₹15,000  │           ║
║  │ Variable Pay      │ ₹1,20,492│           ║
║  ├───────────────────┼───────────┤           ║
║  │ TOTAL CTC         │ ₹8,00,000│           ║
║  └───────────────────┴───────────┘           ║
║                                               ║
║  "How much do you think you'll get in hand    ║
║   every month?"                               ║
║                                               ║
║  ○ ₹66,667 (CTC ÷ 12)                      ║
║  ○ ₹55,000                                  ║
║  ○ ₹48,000                                  ║
║  ○ ₹42,000                                  ║
╚═══════════════════════════════════════════════╝
```

**Most players will pick ₹66,667** (because that's what 8 LPA ÷ 12 is). The game reveals the truth:

**HR Manager Vikram (NPC):** *"Haha, I see this mistake every year! Let me break it down for you..."*

He explains:
- CTC ≠ In-hand salary
- PF (both employee + employer share), professional tax, and income tax are deducted
- Variable pay isn't guaranteed — it depends on performance
- Gratuity only kicks in after 5 years
- **Actual in-hand: ~₹42,000-45,000/month**

**[Quest Complete: "The CTC Trap" — +50 XP]**
**[₹45,000 DEPOSITED to FinQuest Bank! 💰]**
**[But wait... ₹26,500 auto-deducted for rent, food, transport, loan EMI, utilities]**
**[Available to spend/save/invest: ₹18,500]**
**[New knowledge unlocked: "Salary Structure 101" added to player's Financial Journal]**

The FinQuest Bank HUD updates in real-time. Arjun watches his balance go from ₹0 → ₹45,000 → ₹18,500 within seconds. The mandatory deductions flash red briefly to drive home the point.

**Vikram:** *"Now that you have your first salary... what will you do with it? You've got ₹18,500 of discretionary money. Choose wisely — this is the decision that separates the financially free from the financially trapped."*

---

### Act 3: The Budget Dilemma (TechCorp Canteen) 🍕 `MVP`

**[SCENE: Inside TechCorp's fun canteen. Arjun's colleagues are hanging out. A UI panel pops up:]**

```
╔═══════════════════════════════════════════════════╗
║         🎉 FIRST SALARY: ₹45,000! 🎉            ║
║                                                   ║
║  "Your first salary just hit your account!        ║
║   How do you want to spend it?"                   ║
║                                                   ║
║  Choose where your money goes:                    ║
║                                                   ║
║  🎮 Buy a PS5                          ₹50,000   ║
║     (Bro, you deserve it!)                        ║
║                                                   ║
║  ✈️  Goa trip with friends              ₹25,000   ║
║     (YOLO! Instagram needs content!)              ║
║                                                   ║
║  👟 New Jordan sneakers                 ₹15,000   ║
║     (Drip is important)                           ║
║                                                   ║
║  📱 iPhone 16 EMI                       ₹5,000/mo ║
║     (The old phone works but... it's an iPhone)   ║
║                                                   ║
║  💰 Start a SIP                         ₹5,000/mo ║
║     (Boring but Didi said it's important?)        ║
║                                                   ║
║  🏠 Give some to parents                ₹10,000   ║
║     (They sacrificed a lot)                       ║
║                                                   ║
║  🍕 Rent + Food + Essentials            ₹18,000   ║
║     (The non-negotiables)                         ║
║                                                   ║
║  💳 Emergency Fund                      ₹5,000    ║
║     (For a rainy day)                             ║
║                                                   ║
║  BUDGET: ₹45,000  |  SPENT: ₹_____              ║
║  [Allocate your salary using the sliders above]   ║
╚═══════════════════════════════════════════════════╝
```

**The twist:** This isn't a hypothetical exercise. **The money actually leaves your FinQuest Bank account.** Every slider the player moves drains their real virtual balance.

```
╔════════════════════════════════════════════════════╗
║  📱 FINQUEST BANK — LIVE BALANCE                   ║
║                                                    ║
║  Starting balance:     ₹18,500                    ║
║                                                    ║
║  PS5 EMI locked in:    -₹4,200/mo  → ₹14,300     ║
║  Goa trip booked:      -₹25,000   → ₹-10,700 ⚠️ ║
║                                                    ║
║  ❌ INSUFFICIENT FUNDS!                            ║
║  "You're ₹10,700 in the red. The game will       ║
║   issue a credit card with 36% interest to        ║
║   cover the shortfall. This debt carries forward  ║
║   to next month... with interest."                ║
╚════════════════════════════════════════════════════╝
```

**The player watches their bank balance change in real-time as they allocate.** Overshoot ₹18,500 and the game doesn't stop you — it just puts you in debt. The debt accrues 36% p.a. credit card interest, eating into next month's salary. A few bad months and the spiral becomes visible.

**Colleague NPC Rahul** (the peer pressure friend): *"Bro, everyone in the office is going to Goa. You're really going to miss it for a SIP? Who even does SIPs at 22?"*

**[The player must decide: give in to peer pressure or stick to the budget]**

If the player chooses wisely (e.g., ₹5,000 SIP + ₹5,000 emergency fund + ₹5,000 parents + ₹3,500 fun money):
- Bank balance stays healthy
- SIP appears in portfolio (the plant on their hut starts growing!)
- Emergency fund buffer begins building
- Financial Health +10

**After the allocation, the game fast-forwards to Month 2.** Another ₹45,000 salary arrives. Another ₹26,500 auto-deducted. Any EMIs from last month also auto-deduct. The SIP auto-debits. The player sees their **recurring commitments** stack up — and suddenly understands why budgeting matters.

**Budget Buddy NPC** then teaches the **50/30/20 Rule** using the player's own numbers:
- **50% Needs:** Already auto-deducted (₹26,500 = 59% — "see, you're already over on needs alone!")
- **30% Wants:** ₹13,500 max for shopping, eating out, entertainment
- **20% Savings/Investments:** ₹9,000 for SIP, emergency fund, insurance

**[Quest Complete: "Adulting 101: The Budget Game" — +75 XP, +₹2,000 quest bonus]**
**[Unlocked: Budget Tracker tool in player's Financial Journal]**
**[FinQuest Bank balance updated. Month advances to 3/12.]**

---

### Act 4: The Hospital Wake-Up Call (MedCare Hospital) 🏥 `ROADMAP`

**[SCENE: Arjun walks toward a building that looks like a typical Indian hospital — a "MedCare Multi-Speciality Hospital" sign, an ambulance parked outside, and a few worried-looking NPCs sitting on benches near the entrance.]**

As Arjun approaches, he notices a woman sitting on a bench outside, head in her hands, clearly distressed. A quest marker glows above her.

**[Arjun presses E to interact]**

**Meera (NPC, voice trembling):** *"I don't know what to do... My mother had a heart attack last week. The hospital bill is already ₹4,50,000 and they're saying she needs another surgery..."*

**[Dialogue options:]**
- "That's terrible. Do you have health insurance?"
- "Can your family help with the money?"
- "What happened?"

**Meera:** *"Insurance? I always thought insurance was a waste of money. 'We're healthy, why pay ₹15,000 a year for nothing?' That's what I told myself. Now look at me..."*

*"My salary is ₹35,000 a month. The hospital wants ₹4,50,000. I've emptied my savings, borrowed from relatives, and I'm still short. I might have to take a personal loan at 18% interest. That's going to take me years to pay off."*

*"The worst part? My colleague has the same salary as me, and she had a ₹5 lakh health insurance policy. She paid ₹12,000/year for it. When her father was hospitalized, she paid almost nothing out of pocket. Cashless claim. I didn't even know that was a thing."*

**[The game shows a side-by-side comparison panel:]**

```
╔══════════════════════════════════════════════════════╗
║            WITH vs WITHOUT HEALTH INSURANCE          ║
║                                                      ║
║  ┌─── WITHOUT (Meera) ───┐  ┌─── WITH (Colleague) ─┐║
║  │                       │  │                       │║
║  │ Premium/yr:  ₹0       │  │ Premium/yr:  ₹12,000 │║
║  │ Hospital bill: ₹4.5L  │  │ Hospital bill: ₹4.5L │║
║  │ Paid from pocket: ₹4.5L│ │ Paid from pocket: ₹0 │║
║  │ Personal loan: ₹3L    │  │ Personal loan: ₹0    │║
║  │ Interest (18%, 3yr):   │  │                      │║
║  │   ₹97,000             │  │                      │║
║  │                       │  │                      │║
║  │ TOTAL COST: ₹5.47L   │  │ TOTAL COST: ₹12,000  │║
║  │ Stress level: 💀💀💀  │  │ Stress level: 😌     │║
║  │ Recovery time: Years   │  │ Recovery time: None   │║
║  └───────────────────────┘  └───────────────────────┘║
╚══════════════════════════════════════════════════════╝
```

**[A doctor NPC, Dr. Sharma, walks over]**

**Dr. Sharma:** *"I see this every single day. Young people think they're invincible. But health insurance isn't about YOU — it's about protecting your family from financial ruin."*

Dr. Sharma then teaches:
- **Term Insurance vs Endowment Plans** — "Never mix insurance with investment. 95% of Indians make this mistake."
- **Health Insurance basics** — Sum insured, cashless network, co-pay, waiting period, pre-existing conditions
- **Super Top-Up plans** — Affordable way to get ₹50L coverage on top of basic plan
- **Company insurance isn't enough** — It disappears when you switch jobs. Always have personal cover.
- **When to buy** — "The best time is when you're young and healthy. Premiums are cheapest at 22-25."

**[Interactive Mini-Game: "Insurance Advisor"]**
The game presents 3 fictional people with different life situations. Arjun must recommend the right insurance type for each:
1. A 23-year-old bachelor starting first job → Term insurance + basic health cover
2. A 30-year-old with spouse and child → Higher term cover + family floater health plan
3. A 55-year-old with existing diabetes → Super top-up plan + critical illness rider

**[Quest Complete: "The Insurance Wake-Up Call" — +100 XP, +₹3,000 quest bonus]**
**[Financial Health +10 — "You now understand the importance of insurance"]**
**[Unlocked: Insurance Calculator in Financial Journal]**
**[NEW OPTION in FinQuest Bank: "Buy Health Insurance — ₹1,000/month for ₹5L cover"]**

If the player buys insurance now, ₹1,000 auto-debits every game-month. If they skip it... the Month 6 medical emergency will destroy them financially.

**Meera (grateful):** *"Thank you for listening. Please don't make the same mistake I did. It takes just ₹1,000/month to avoid a ₹5 lakh nightmare."*

---

### Act 5: The Danger Zone (Scam Park) 🌳 `MVP`

**[SCENE: A beautiful park in the middle of the island. Families walking around, kids playing, food stalls — looks completely harmless. But hidden among the friendly NPCs are scammers.]**

**Didi (over comms):** *"Be careful in this park, Arjun. Not everyone here is who they seem. Trust your instincts and remember — if something sounds too good to be true, it probably is."*

**Arjun enters the park and encounters various NPCs. Some are genuinely friendly. Some are scammers. The player must figure out who's who.**

#### Encounter 1: The UPI Collect Request Scam

**"Friendly" Uncle (NPC):** *"Beta, I accidentally sent you ₹5,000 through UPI. Can you check? I'm sending a request to get it back."*

**[Player's phone buzzes — a UPI notification appears:]**

```
┌───────────────────────────────────┐
│  📱 UPI Notification              │
│                                   │
│  COLLECT REQUEST                  │
│  From: RajeshK****@oksbi         │
│  Amount: ₹5,000                  │
│  Note: "Refund — sent by mistake" │
│                                   │
│  [✅ PAY]     [❌ DECLINE]        │
│                                   │
│  ⚠️ Remember: Collect request     │
│  means THEY are asking for YOUR   │
│  money!                           │
└───────────────────────────────────┘
```

- **If player clicks PAY:** **₹5,000 instantly deducted from FinQuest Bank!** Balance drops in the HUD. The money is gone — no undo.
  - *"You just paid ₹5,000 to a scammer! In a collect request, YOU are sending money, not receiving. Always remember: you NEVER need to enter your PIN to RECEIVE money."*
  - Financial Health -15. The ₹5,000 is permanently lost. That was a month's SIP gone.
- **If player clicks DECLINE:** Scam avoided! +30 XP, +₹2,000 awareness bonus to bank account.
  - *"Smart! That was a classic collect request scam. The scammer never sent you money — they were asking you to send them yours."*

#### Encounter 2: The "KYC Expiry" Call

**[Phone rings. Player answers.]**

**Caller (NPC):** *"Hello sir, this is calling from your bank. Your KYC is expiring today. If you don't update it immediately, your account will be frozen. Please share your Aadhaar number and UPI PIN so we can update it over the phone."*

**[Dialogue options:]**
- 🔴 Share the details (it's urgent!)
- 🟡 "Can I visit the branch instead?"
- 🟢 "Banks never ask for PIN over phone. This is a scam." [Hang up]

#### Encounter 3: The Crypto "Investment" Scheme

**Cool-looking NPC at a flashy stall:** *"Hey! Want to turn ₹10,000 into ₹1,00,000 in just 30 days? My crypto trading bot has a 100% success rate. Early investors are already millionaires. Limited slots available — join my WhatsApp group now!"*

**[Dialogue options:]**
- 🔴 "Wow, sign me up!" (Lose ₹10,000, Ponzi scheme collapses in Month 3)
- 🟡 "What's the guarantee?" (Scammer shows fake screenshots of profits)
- 🟢 "No legitimate investment guarantees 10x returns in 30 days." (Walk away, +XP)

#### Encounter 4: The QR Code Trap

**Street vendor NPC:** *"I'm selling this phone cover for just ₹200. Scan this QR code to pay!"*

**[The QR code scan shows: "Pay ₹2,000 to VendorXYZ@upi"]**

- **If player pays without checking amount:** ₹2,000 deducted instead of ₹200!
- **If player catches the mismatch:** *"Good eye! Always verify the amount on screen before confirming any QR payment."*

**[After navigating the park, players get a SCAM SURVIVAL SCORE:]**

```
╔══════════════════════════════════════╗
║       🛡️ SCAM SURVIVAL REPORT       ║
║                                      ║
║  Scams encountered:     4            ║
║  Scams avoided:         ?/4          ║
║  Money lost to scams:   ₹____       ║
║                                      ║
║  Your Rating:                        ║
║  4/4 → "Scam-Proof Legend" 🏆       ║
║  3/4 → "Street Smart" 🧠            ║
║  2/4 → "Needs Practice" ⚠️          ║
║  1/4 → "Easy Target" 🎯             ║
║  0/4 → "Professional Victim" 💀     ║
║                                      ║
║  KEY RULES TO REMEMBER:              ║
║  1. Never share UPI PIN/OTP          ║
║  2. PIN is only for SENDING money    ║
║  3. Banks never call asking for PIN  ║
║  4. If returns sound unreal, run     ║
║  5. Always check amount before pay   ║
╚══════════════════════════════════════╝
```

**[Quest Complete: "Scam Survivor" — +150 XP]**
**[FinQuest Bank Summary: Money lost to scams: ₹_____ | Money saved by being smart: ₹_____]**
**[Scam losses are PERMANENT. No refund. Just like real life.]**

---

### Act 6: Understanding the Market (Dalal Street Exchange) 📈 `ROADMAP`

**[SCENE: A grand building modeled after the NSE/BSE. A large electronic ticker runs across the front displaying stock names and prices — RELIANCE, TCS, INFOSYS, HDFC. The entrance has a bronze bull statue (inspired by the real Dalal Street bull).]**

**Inside, the building is a bustling trading floor. Screens everywhere showing green and red numbers. An NPC named "Trader Deepak" stands near the entrance.**

**Trader Deepak:** *"Welcome to Dalal Street Exchange! I can see from your face you think this place is only for rich people with suits. That's the biggest myth about the stock market. Let me show you around."*

#### Floor 1: "What Even IS the Stock Market?"

Deepak uses a simple analogy:

> *"Imagine your friend Priya opens a chai stall. She needs ₹1,00,000 to start but only has ₹50,000. She offers you a deal: give me ₹50,000 and you own 50% of the stall. Every month, you get 50% of profits. That's basically what a stock is — you own a tiny piece of a company."*

**[Interactive Demo: "Build-a-Company"]**
- Player creates a fictional company (e.g., "Arjun's Momos")
- Sets share price at ₹10, issues 1000 shares
- NPCs "buy" shares, price goes up/down based on how the business does
- Player sees how supply/demand affects stock prices in real-time

#### Floor 2: "Meet NIFTY and SENSEX"

**Market Analyst Priyanka (NPC):** *"NIFTY 50 is like a report card for the Indian stock market. It tracks the top 50 companies. If NIFTY goes up, most of the market is doing well."*

**[Interactive: Historical NIFTY chart from 2000 to 2025]**
- Shows how ₹1 lakh invested in NIFTY in 2000 became ₹15+ lakh by 2025
- Shows market crashes (2008, 2020 COVID) and recoveries
- Key lesson: "The market always recovered. Patience is the real skill."

#### Floor 3: "How to Actually Invest"

**Deepak:** *"You don't need lakhs to start. You can buy stocks worth ₹100. Here's how:"*

Interactive walkthrough of:
- Opening a Demat account (Zerodha/Groww style)
- Difference between Demat, trading, and bank account
- How to place a buy/sell order
- What is a portfolio

**[Mini-Game: "Mock Trading"]**
Player gets ₹1,00,000 in virtual money and must build a portfolio:
- Choose from 10 real Indian companies (simplified)
- Game simulates 1 year of market movement
- Player sees their returns vs NIFTY
- Lesson: Diversification matters. Don't put everything in one stock.

**[Quest Complete: "Dalal Street Graduate" — +125 XP, +₹2,000 quest bonus]**
**[NEW OPTION in FinQuest Bank: "Stock Trading" — Buy/sell Indian stocks with your virtual ₹]**
**[Unlocked: Stock Portfolio tracker in FinQuest Bank HUD]**

From this point on, the player can allocate part of their monthly discretionary money to stocks. Prices update each game-month. The stock portfolio value is always visible in the bank HUD — green when up, red when down.

---

### Act 7: The Power of Compounding (Mutual Fund Tower) 🏦 `MVP — SIP Calculator only`

**[SCENE: A tall, modern building with glass walls — "Mutual Fund Sahi Hai Tower" (a nod to the famous AMFI tagline). Inside, the ground floor looks like a friendly bank branch with helpful NPCs.]**

**Fund Manager Kavya (NPC):** *"Not everyone has time to pick individual stocks. That's why mutual funds exist. Think of it as a group investment — lots of people pool their money, and an expert invests it for them."*

#### Section 1: "What Are Mutual Funds?"

Kavya explains using a pizza analogy:

> *"Imagine 10 friends want to eat at a fancy restaurant but can't afford it alone. So they pool ₹500 each (₹5,000 total) and hire a chef (fund manager) to cook a feast. Everyone gets a share of the meal proportional to what they put in. That's a mutual fund."*

**[Interactive: "Where Does Your Money Go?"]**

A visual breakdown showing:
```
Your SIP of ₹5,000/month
        │
        ▼
┌─────────────────────────────┐
│     MUTUAL FUND POOL        │
│     (₹500 Crore total)      │
│                              │
│   Managed by: Fund Manager   │
│                              │
│   Invested in:               │
│   ├── 40% Large-cap stocks   │ → Reliance, TCS, HDFC
│   │   (Stable, lower risk)   │
│   ├── 30% Mid-cap stocks     │ → Trent, Persistent
│   │   (Growth potential)     │
│   ├── 20% Government bonds   │ → Safe, fixed returns
│   │   (Safety net)           │
│   └── 10% Cash               │ → For quick opportunities
│       (Flexibility)          │
└─────────────────────────────┘
```

#### Section 2: "Types of Mutual Funds"

Interactive quiz where player matches fund types to investor profiles:

| Fund Type | Risk | Best For | Example |
|-----------|------|----------|---------|
| Large Cap | Low-Medium | Conservative investors | NIFTY 50 index fund |
| Mid Cap | Medium-High | Growth seekers | Mid-cap 150 fund |
| Small Cap | High | Aggressive investors | Small-cap fund |
| ELSS | Medium | Tax savers (80C) | Tax saver fund (3yr lock-in) |
| Debt Fund | Low | Short-term parking | Liquid fund |
| Index Fund | Low-Medium | Passive investors | NIFTY index fund |

#### Section 3: "The SIP Calculator — See Compounding in Action" 🧮

**Kavya:** *"Let me show you the most powerful force in finance — compounding. Einstein supposedly called it the 8th wonder of the world. Let me prove it."*

**[Interactive SIP Calculator opens:]**

```
╔══════════════════════════════════════════════════════╗
║              💰 SIP CALCULATOR 💰                    ║
║                                                      ║
║  Monthly Investment:  [₹5,000  ]  ← drag slider     ║
║  Expected Return:     [12% p.a.]  ← drag slider     ║
║  Time Period:         [20 years ]  ← drag slider     ║
║                                                      ║
║  ┌──────────────────────────────────────────┐        ║
║  │                                          │        ║
║  │              📈 GROWTH CHART              │        ║
║  │                                          │        ║
║  │    ₹49.9L ──────────────── *            │        ║
║  │                          **             │        ║
║  │                        **               │        ║
║  │    ₹30L ─────────── **                  │        ║
║  │                    **                    │        ║
║  │                  **                      │        ║
║  │    ₹12L ──── **  (Your investment: ₹12L)│        ║
║  │            **                            │        ║
║  │          *                               │        ║
║  │        *                                 │        ║
║  │      *                                   │        ║
║  │    *                                     │        ║
║  │───┬─────┬─────┬─────┬─────┬────         │        ║
║  │   0     5    10    15    20  years       │        ║
║  └──────────────────────────────────────────┘        ║
║                                                      ║
║  📊 RESULTS:                                         ║
║  ┌───────────────────────────────────────┐           ║
║  │ Total Invested:     ₹12,00,000       │           ║
║  │ Wealth Gained:      ₹37,95,000       │           ║
║  │ Total Value:        ₹49,95,000       │           ║
║  │                                       │           ║
║  │ 🤯 Your money grew 4.16x!            │           ║
║  │                                       │           ║
║  │ What if you started 5 years later?    │           ║
║  │ Total Value (15yr): ₹25,22,000       │           ║
║  │                                       │           ║
║  │ ⚡ 5 years of delay cost you          │           ║
║  │    ₹24,73,000 — almost 25 LAKH!      │           ║
║  └───────────────────────────────────────┘           ║
║                                                      ║
║  [Try Different Amounts]  [Compare SIP vs Lump Sum]  ║
╚══════════════════════════════════════════════════════╝
```

**[The "Compare" button shows:]**
- SIP of ₹5,000/month for 20 years vs Lump sum of ₹12,00,000 invested once
- SIP wins through rupee cost averaging in volatile markets
- Visual animation showing SIP buying more units when prices are low

#### Section 4: "The ELSS Tax Saver"

**Kavya:** *"Here's a bonus — ELSS mutual funds give you tax deduction under Section 80C! You save tax AND grow wealth. Two birds, one stone."*

Quick comparison:
- PPF: Safe but 7% returns, 15-year lock-in
- ELSS: 12%+ potential returns, only 3-year lock-in, same 80C benefit
- FD Tax Saver: 6-7% returns, 5-year lock-in, interest is taxable

**[Quest Complete: "The Compounding Wizard" — +150 XP, +₹3,000 quest bonus]**
**[Unlocked: Personal SIP Calculator tool in Financial Journal]**

**The real payoff:** If the player started a SIP back in Month 2-3, by now (Month 7-8) their SIP portfolio is already showing positive returns in the FinQuest Bank HUD. They can SEE their own money compounding. Meanwhile, the ₹15,000 they may have spent on sneakers is... gone. The contrast hits hard without a single lecture.

---

### Act 8: Tax Doesn't Have to Be Taxing (Tax Haveli) 🏛️ `ROADMAP`

**[SCENE: A building styled like a government office — think a mix of an old Indian sarkari building with modern digital kiosks inside. Sign reads "Tax Haveli — Kara Bhavan." A friendly CA (Chartered Accountant) NPC waits inside.]**

**CA Arjun (NPC):** *"Ah, fresh from TechCorp, right? Let me guess — you have no idea how much tax you owe or how to reduce it. Don't worry, 90% of first-jobbers are in the same boat."*

#### Lesson 1: "How Indian Income Tax Works"

**[Interactive Tax Slab Visual — Old vs New Regime:]**

```
╔═══════════════════════════════════════════════════════════╗
║                  INCOME TAX SLABS (FY 2025-26)           ║
║                                                           ║
║  ┌─── NEW REGIME ─────────┐  ┌─── OLD REGIME ──────────┐║
║  │ ₹0 - ₹4L      : 0%    │  │ ₹0 - ₹2.5L    : 0%     │║
║  │ ₹4L - ₹8L     : 5%    │  │ ₹2.5L - ₹5L   : 5%     │║
║  │ ₹8L - ₹12L    : 10%   │  │ ₹5L - ₹10L    : 20%    │║
║  │ ₹12L - ₹16L   : 15%   │  │ ₹10L+         : 30%    │║
║  │ ₹16L - ₹20L   : 20%   │  │                         │║
║  │ ₹20L - ₹24L   : 25%   │  │ BUT you get deductions: │║
║  │ ₹24L+         : 30%   │  │ 80C: ₹1.5L              │║
║  │                        │  │ 80D: ₹25K-₹1L           │║
║  │ Standard deduction:    │  │ HRA: Varies              │║
║  │ ₹75,000                │  │ Standard: ₹50,000       │║
║  │                        │  │                         │║
║  │ Simpler. Fewer savings.│  │ Complex. More savings.  │║
║  └────────────────────────┘  └─────────────────────────┘║
╚═══════════════════════════════════════════════════════════╝
```

#### Lesson 2: "Old vs New — Which is Better FOR YOU?"

**[Interactive Calculator: Player inputs their CTC and the game computes tax under both regimes]**

For Arjun's ₹8 LPA:
- **New regime:** Tax ≈ ₹30,000/year (simpler, no deductions needed)
- **Old regime with smart deductions:** Tax ≈ ₹15,600/year (if using 80C + 80D + HRA)
- **Savings by choosing old regime:** ₹14,400/year

**CA Arjun:** *"See? At your salary, old regime saves you ₹14,000+ if you invest in ELSS and have health insurance. But as your salary grows above ₹15L, new regime might become better. There's no one-size-fits-all."*

#### Lesson 3: "Section 80C — Your Best Friend"

Interactive allocation game: player has ₹1,50,000 to allocate across 80C instruments:

- EPF contribution (already deducted from salary): ~₹43,200
- ELSS mutual fund SIP: ₹60,000
- Life insurance premium: ₹15,000
- PPF contribution: ₹31,800
- **Total: ₹1,50,000 — Maximum 80C utilized!**

**[Mini-Game: "File Your ITR"]**
A simplified, guided walkthrough of ITR filing:
1. Collect Form 16 from employer
2. Check AIS (Annual Information Statement) for other income
3. Choose old/new regime
4. Declare deductions
5. Calculate tax
6. File and verify with Aadhaar OTP

**[Quest Complete: "Tax Ninja" — +125 XP, "Tax Ninja" badge unlocked]**
**[₹14,400 TAX REFUND deposited to FinQuest Bank! 🎉]**
**[Players who skipped this zone get NO refund. They literally left ₹14,400 on the table.]**

---

### Act 9: Building Your Credit (Credit Chowk) 🏪 `ROADMAP`

**[SCENE: A bustling Indian marketplace — shops, vendors, a small bank branch. This zone teaches credit, loans, and the CIBIL score.]**

**Banker Priya (NPC at bank branch):** *"Do you have a credit score?"*

**[Player options:]**
- "What's a credit score?"
- "I think so?"
- "Yes, I check it regularly."

**Banker Priya:** *"Your CIBIL score is like your financial reputation — a 3-digit number between 300-900. Every bank checks it before giving you any loan. And here's the thing most young people don't realize: your education loan is already building (or destroying) your score right now."*

#### Interactive: "Your CIBIL Simulator"

The game simulates credit score changes based on player actions:

| Action | CIBIL Impact |
|--------|-------------|
| Pay education loan EMI on time every month | +15 points over 6 months |
| Miss 2 EMI payments | -100 points instantly |
| Get a credit card, use 30% of limit, pay full bill | +20 over 3 months |
| Max out credit card, pay only minimum due | -50 points, debt spiral begins |
| Apply for 5 credit cards in one month | -30 points (multiple hard inquiries) |
| Have no credit history at all | Stuck at low score, can't get loans |

**[Mini-Game: "The EMI Trap"]**
Player is tempted with purchases on EMI:
- iPhone on 12-month no-cost EMI: ₹6,000/month
- Laptop on 6-month EMI: ₹8,000/month
- Bike on 24-month loan: ₹5,000/month

Game shows: if player takes all three, ₹19,000/month goes to EMIs from a ₹45,000 salary. Only ₹26,000 left for everything else.

**[Quest Complete: "Credit Conscious" — +100 XP, +₹2,000 quest bonus]**
**[CIBIL Score tracker now visible in FinQuest Bank HUD]**
**[Every EMI payment, loan EMI, and credit action now affects your score in real-time]**

---

### Act 10: The Financial Health Check (Island Center — Finale) `MVP`

**[SCENE: After completing all zones, Arjun returns to the Island Center. Didi is waiting with a final assessment.]**

**Didi:** *"You've explored the entire island! Let's see how your financial journey shaped up..."*

**[Final Report Card appears — a full financial statement of the player's 12-month journey:]**

```
╔════════════════════════════════════════════════════════════╗
║               🏆 FINQUEST REPORT CARD 🏆                  ║
║                    Month 12/12 — GAME COMPLETE             ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Player: Arjun  |  Level: 8  |  Health: ██████████░ 82    ║
║                                                            ║
║  ═══════════════════════════════════════════════════════   ║
║  💰 YOUR FINANCIAL POSITION AFTER 12 MONTHS               ║
║  ═══════════════════════════════════════════════════════   ║
║                                                            ║
║  📊 BALANCE SHEET                                         ║
║  ┌─ ASSETS ──────────────────────────────────────────┐    ║
║  │ Savings Account:          ₹42,300                 │    ║
║  │ Emergency Fund:           ₹35,000                 │    ║
║  │ SIP Portfolio (10 months):₹58,200 (invested: ₹50K)│   ║
║  │ Stock Portfolio:          ₹14,800 (invested: ₹10K)│   ║
║  │ ELSS (Tax Saver):        ₹18,600 (invested: ₹15K)│   ║
║  │ PPF Balance:              ₹12,000                 │   ║
║  │ ──────────────────────────────────────────────     │   ║
║  │ TOTAL ASSETS:             ₹1,80,900               │   ║
║  └───────────────────────────────────────────────────┘    ║
║  ┌─ LIABILITIES ─────────────────────────────────────┐    ║
║  │ Education Loan Remaining: ₹3,40,000               │   ║
║  │ Credit Card Debt:         ₹0                      │   ║
║  │ EMI Obligations:          ₹0                      │   ║
║  │ ──────────────────────────────────────────────     │   ║
║  │ TOTAL LIABILITIES:        ₹3,40,000               │   ║
║  └───────────────────────────────────────────────────┘    ║
║                                                            ║
║  📋 NET WORTH:               ₹-1,59,100                  ║
║  (Don't worry — education loan is normal at 22!           ║
║   Your investments are growing faster than your debt.)     ║
║                                                            ║
║  🛡️  INSURANCE:               ✅ Health (₹5L)            ║
║  💳 CIBIL SCORE:              745 (Good!)                 ║
║  📈 INVESTMENT RETURN:        +16.2% overall              ║
║                                                            ║
║  ═══════════════════════════════════════════════════════   ║
║  📊 YOUR MONEY FLOW (12-MONTH SUMMARY)                    ║
║  ═══════════════════════════════════════════════════════   ║
║                                                            ║
║  Total Earned:        ₹5,57,250 (salary + hike + bonus)  ║
║  Total Mandatory:     ₹3,24,750 (rent, food, loan, etc.) ║
║  Total Invested:      ₹75,000  (SIP + ELSS + stocks)     ║
║  Total Insurance:     ₹12,000  (health premium)          ║
║  Total Spent (wants): ₹98,200  (shopping, trips, fun)    ║
║  Total Lost (scams):  ₹0       (scam-proof!)             ║
║  Tax Refund Received: ₹14,400  (filed ITR correctly!)    ║
║  Emergency Fund:      ₹35,000  (40% of target)          ║
║                                                            ║
║  💡 Savings Rate:     22% — ABOVE AVERAGE! 👏             ║
║                                                            ║
║  ═══════════════════════════════════════════════════════   ║
║  🎯 ZONE SCORES                                          ║
║  ═══════════════════════════════════════════════════════   ║
║                                                            ║
║  💼 Salary Knowledge      ████████░░ 85%                  ║
║  📊 Budgeting Skills      ███████░░░ 70%                  ║
║  🏥 Insurance Awareness   █████████░ 90%                  ║
║  🛡️ Scam Detection        ██████████ 100%                 ║
║  📈 Stock Market Basics   ███████░░░ 75%                  ║
║  💰 Mutual Fund/SIP       ████████░░ 80%                  ║
║  🏛️ Tax Knowledge         ██████░░░░ 65%                  ║
║  💳 Credit Awareness      ███████░░░ 78%                  ║
║                                                            ║
║  ═══════════════════════════════════════════════════════   ║
║  🔮 20-YEAR PROJECTION (if you continue these habits)     ║
║  ═══════════════════════════════════════════════════════   ║
║                                                            ║
║  Your ₹7,500/month investment habit, continued for        ║
║  20 years at 12% returns:                                  ║
║                                                            ║
║  Total Invested:    ₹18,00,000                            ║
║  Portfolio Value:   ₹74,95,000                            ║
║  Wealth Created:    ₹56,95,000 (pure compounding magic)  ║
║                                                            ║
║  That's enough to:                                         ║
║  🏠 2BHK down payment in Bangalore                        ║
║  🚗 Buy a car without EMI                                 ║
║  🎓 Fund your child's education                           ║
║  🏖️  OR retire 5 years early                              ║
║                                                            ║
║  ═══════════════════════════════════════════════════════   ║
║  🏅 BADGES EARNED                                         ║
║  ═══════════════════════════════════════════════════════   ║
║  🛡️ Scam-Proof Legend    🧮 Compounding Wizard            ║
║  🏛️ Tax Ninja            💰 Budget Master                 ║
║                                                            ║
║  ═══════════════════════════════════════════════════════   ║
║  📋 PERSONALIZED REAL-WORLD ACTION PLAN                   ║
║  ═══════════════════════════════════════════════════════   ║
║  Based on your profile (21, first job, ₹8 LPA):          ║
║                                                            ║
║  ✅ Open a Demat account this week                        ║
║  ✅ Start a ₹2,000 SIP in a NIFTY index fund             ║
║  ✅ Get ₹5L health insurance for family                   ║
║  ✅ Build emergency fund: ₹1,35,000 (3 months expenses)  ║
║  ✅ File ITR before July 31st (try Old Regime)            ║
║  ✅ Check your CIBIL score at cibil.com                   ║
║                                                            ║
║  [📤 Share Score]  [🔄 Play Again]  [👥 Challenge Friend] ║
╚════════════════════════════════════════════════════════════╝
```

**Didi (final words):** *"Look at that! In just 12 months you built ₹1.8 lakh in assets, protected your family with insurance, dodged every scam, and even got a tax refund. Most 22-year-olds in India have done none of these things."*

*"But here's the real magic — everything you did with virtual money today, you can do with real money tomorrow. The SIP is real. The insurance is real. The tax savings are real. The only difference is: now you know how."*

*"Remember — financial literacy isn't about being rich. It's about making smart decisions so money never becomes a source of stress. Now go, make your future self proud!"*

**[The game shows Arjun's avatar standing on the beach, looking at a sunset over the ocean. The FinQuest Bank HUD shows one final animation: the 20-year projection number counting up from ₹0 to ₹74,95,000, with the text: "This started with ₹5,000/month."]**

---

## 7. Zone Details & Quest Design

### Complete Quest List

| # | Quest Name | Zone | Type | XP | ₹ Reward | ₹ At Risk | Time |
|---|-----------|------|------|-----|----------|-----------|------|
| 1 | Welcome to FinQuest | Spawn | Tutorial | 25 | — | — | 2 min |
| 2 | The CTC Trap | TechCorp | Interactive Lesson | 50 | ₹45,000 (first salary!) | ₹26,500 (auto-deducted) | 3 min |
| 3 | Adulting 101: Budget Game | TechCorp | Simulation | 75 | ₹2,000 bonus | Up to ₹50,000 (overspend) | 5 min |
| 4 | The Insurance Wake-Up Call | Hospital | Story + Quiz | 100 | ₹3,000 bonus | — | 5 min |
| 5 | Insurance Advisor | Hospital | Mini-Game | 50 | ₹1,500 bonus | ₹1,000/mo premium | 3 min |
| 6 | Scam Survivor | Scam Park | Role-Play | 150 | ₹2,000/scam avoided | ₹5K-₹10K per scam | 7 min |
| 7 | Dalal Street Graduate | Exchange | Interactive Lesson | 125 | ₹2,000 bonus | — | 6 min |
| 8 | Mock Trading | Exchange | Simulation | 75 | Gains from trades | Losses from bad trades | 5 min |
| 9 | The Compounding Wizard | MF Tower | Calculator | 150 | ₹3,000 bonus | — | 5 min |
| 10 | ELSS Tax Saver | MF Tower | Comparison | 50 | Tax savings unlocked | ELSS lock-in cost | 3 min |
| 11 | Tax Ninja | Tax Haveli | Interactive Lesson | 125 | ₹14,400 refund! | — | 6 min |
| 12 | File Your ITR | Tax Haveli | Guided Walkthrough | 75 | Refund deposited | ₹14,400 missed if skipped | 5 min |
| 13 | Credit Conscious | Credit Chowk | Simulation | 100 | ₹2,000 bonus | CIBIL damage if careless | 5 min |
| 14 | The EMI Trap | Credit Chowk | Mini-Game | 50 | — | ₹19,000/mo in EMIs! | 3 min |
| 15 | Financial Health Check | Spawn | Assessment | 200 | Full net worth report | — | 5 min |

**Total estimated playtime: 60-75 minutes**

**Total virtual money flowing through a playthrough: ~₹5.5L+ earned, various amounts spent/invested/lost depending on player choices. The final net worth can range from negative (debt spiral) to ₹1.8L+ (smart player).**

### Side Quests (Optional, Bonus Content)

| Quest | Zone | Teaching |
|-------|------|----------|
| "The FD vs RD Debate" | MF Tower | Fixed vs recurring deposits |
| "Rent vs Buy: The Great Indian Question" | Credit Chowk | EMI calculation, home loan |
| "Startup Founder Sim" | TechCorp | Equity, angel investment, burn rate |
| "Gold vs Gold ETF" | Exchange | Physical vs digital gold investing |
| "The PF Withdrawal Drama" | Tax Haveli | EPF rules, premature withdrawal tax |

---

## 8. Progression & Reward System

### XP & Leveling

| Level | XP Required | Title | Unlock |
|-------|------------|-------|--------|
| 1 | 0 | "Financial Noob" | Tutorial zone |
| 2 | 100 | "Curious Learner" | TechCorp + Hospital |
| 3 | 250 | "Money Aware" | Scam Park |
| 4 | 500 | "Finance Student" | Dalal Street |
| 5 | 800 | "Smart Investor" | MF Tower |
| 6 | 1200 | "Tax Aware" | Tax Haveli |
| 7 | 1700 | "Credit Conscious" | Credit Chowk |
| 8 | 2300 | "Financial Guru" | Final Assessment |
| 9 | 3000 | "Money Master" | All side quests |
| 10 | 4000 | "FinQuest Legend" | Leaderboard + bragging rights |

### Financial Health Score (0-100)

This is the core metric. It changes based on decisions:

- Good decisions (budgeting, insurance, investing): +5 to +15
- Bad decisions (overspending, falling for scams, no insurance): -10 to -20
- Completing quests: +5 each
- Score determines the ending narrative and personalized advice

### Badges

| Badge | How to Earn |
|-------|------------|
| 🛡️ Scam-Proof Legend | Avoid all scams in Scam Park |
| 🧮 Compounding Wizard | Use SIP calculator and answer bonus questions |
| 🏛️ Tax Ninja | Complete both tax quests correctly |
| 💰 Budget Master | Survive 3-month budget simulation with positive balance |
| 📈 Bull Run | Earn 15%+ return in mock trading |
| 💳 Credit King | Achieve 750+ in CIBIL simulator |
| 🏥 Protected | Buy correct insurance for all 3 NPC scenarios |
| 🎓 FinQuest Scholar | Complete all 15 main quests |

### Virtual Money Economy (replaces simple "coins")

The virtual rupee system is the primary engagement and teaching mechanism. See **Section 3** for the complete breakdown. Key points:

- **No separate "coins" currency.** Everything runs on virtual ₹ (rupees). This mirrors real life — you have one bank account, not "fun money" and "serious money."
- **Earning:** Salary (₹45,000/month), quest bonuses, investment returns, tax refunds
- **Spending:** Mandatory expenses (auto-deducted), lifestyle purchases at the Island Mall, insurance premiums, SIP investments
- **Losing:** Scam losses, emergency events without insurance, market crashes (if panic sold), credit card interest
- **The "latte factor" tracker** silently logs small purchases and shows their 20-year opportunity cost
- **Avatar cosmetics** are purchased with real virtual ₹ at the Drip Store — so buying a fancy hat means NOT investing that money. The trade-off is always visible.
- **Net worth at game end** is the ultimate score — not XP, not badges, but how well you managed your financial life

---

## 9. Technical Notes

### Architecture
- **Frontend:** React + Three.js + React Three Fiber
- **3D Engine:** Three.js with Rapier physics
- **State Management:** Zustand
- **AI NPCs:** Voice AI + RAG system for personalized financial advice
- **Calculations:** All financial calculations (SIP, tax, EMI) done client-side with real Indian formulas

### Key Design Principles
1. **Mobile-first but Desktop-ready** — most Indian students access via phone
2. **Works on low-end devices** — optimize for budget Android phones
3. **Offline-capable** — pre-load educational content, only AI NPC needs internet
4. **Hindi + English** — bilingual NPC dialogues for wider reach
5. **Accessible** — clear fonts, high contrast, screen reader support for UI panels

### Data & Privacy
- Personalization data stored locally (localStorage)
- No real financial data collected
- No real money transactions
- Anonymous leaderboard (display name only)

---

## Summary

FinQuest transforms the daunting world of Indian personal finance into a living, breathing 3D island adventure. Unlike Coastal World (which markets fintech products) or traditional financial literacy apps (which use quizzes), FinQuest **makes you live through a simulated financial year with real virtual money on the line.**

**What makes us different:**

| Feature | Coastal World | Quiz-Based Apps | **FinQuest** |
|---------|-------------|----------------|--------------|
| Teaching method | Product marketing | Multiple choice questions | **Full financial life simulation** |
| Money system | Points for cosmetics | Score/stars | **Virtual ₹ bank account with salary, expenses, investments, debt** |
| Consequences | None | Wrong answer = try again | **Bad decisions snowball — debt, no insurance, lost money** |
| Emotional engagement | Low (it's an ad) | Low (it's a quiz) | **High — you feel the loss when scammed, the joy when SIP grows** |
| India-specific | No (US-only) | Partially | **100% — CTC, UPI scams, Section 80C, CIBIL, SIP, NIFTY** |
| Personalization | None | Basic difficulty levels | **Adapts content based on age, income, goals, knowledge level** |
| Retention metric | Time on platform | Quiz completion | **Net worth at end of game — how rich/broke did you end up?** |

**The core promise:** A player who completes FinQuest will walk away knowing how to read their salary slip, budget their first paycheck, avoid UPI scams, understand insurance, start a SIP, file their ITR, and build a good credit score — things that no Indian college ever taught them.

**The virtual money guarantee:** Every concept taught in FinQuest is backed by a financial consequence the player personally experienced. Not "insurance is important" — but "I lost ₹2.5 lakh because I didn't buy a ₹1,000/month policy." Not "SIPs compound" — but "my ₹50,000 became ₹58,200 in 10 months while my Goa trip money became Instagram photos."

**That's the difference between education and experience. FinQuest gives you the experience without the real-world price tag.**

---

*Document Version: 2.0*
*Created for: IIITD Hackathon — Gamifying Finance & Financial Education Track*
*Team: FinQuest*
