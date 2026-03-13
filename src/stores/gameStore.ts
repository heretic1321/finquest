import { create } from 'zustand'
import type { ZoneId } from '@client/config/ZoneConfig'

// ---- Types ----

export type Transaction = {
  id: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  month: number
  category: 'salary' | 'expense' | 'investment' | 'scam' | 'bonus' | 'insurance' | 'sip' | 'emergency'
}

export type DialogueState = {
  npcName: string
  lines: string[]
  currentLine: number
} | null

// ---- Monthly expense breakdown ----

const MONTHLY_EXPENSES = {
  rent: 12_000,
  food: 6_000,
  transport: 2_000,
  utilities: 1_500,
  loanEMI: 5_000,
} as const

const TOTAL_MONTHLY_EXPENSES = Object.values(MONTHLY_EXPENSES).reduce((a, b) => a + b, 0) // 26,500

const MONTHLY_SALARY = 45_000

// ---- Store interface ----

interface GameState {
  // Player finances
  balance: number
  financialHealth: number // 0-100

  // Game clock
  month: number // 1-12
  maxMonth: number

  // Transaction log
  transactions: Transaction[]

  // Dialogue
  activeDialogue: DialogueState
  nearbyNPC: string | null

  // Zone progress
  completedZones: ZoneId[]

  // Points & level
  points: number           // XP earned from quests/games

  // Investments & financial products
  sipAmount: number        // monthly SIP amount (0 if not started)
  sipTotal: number         // total invested in SIP so far
  sipMonthsActive: number  // how many months SIP has been running
  insuranceBought: boolean
  emergencyFund: number
  debt: number

  // Monthly
  monthlySalary: number
  monthlyExpenses: typeof MONTHLY_EXPENSES

  // ---- Actions ----
  addMoney: (amount: number, description: string, category: Transaction['category']) => void
  spendMoney: (amount: number, description: string, category: Transaction['category']) => boolean
  updateHealth: (delta: number) => void
  setDialogue: (dialogue: DialogueState) => void
  clearDialogue: () => void
  setNearbyNPC: (npc: string | null) => void
  advanceMonth: () => void
  completeZone: (zoneId: ZoneId) => void
  startSIP: (amount: number) => void
  buyInsurance: () => void
  addToEmergencyFund: (amount: number) => boolean
  receiveSalary: () => void
  deductMonthlyExpenses: () => void
  addPoints: (amount: number) => void
}

// ---- Helper: generate transaction id ----

let txCounter = 0
function nextTxId(): string {
  txCounter += 1
  return `tx_${Date.now()}_${txCounter}`
}

// ---- Store ----

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  balance: 0,
  financialHealth: 50,
  month: 1,
  maxMonth: 12,
  transactions: [],
  activeDialogue: null,
  nearbyNPC: null,
  completedZones: [],
  points: 0,
  sipAmount: 0,
  sipTotal: 0,
  sipMonthsActive: 0,
  insuranceBought: false,
  emergencyFund: 0,
  debt: 0,
  monthlySalary: MONTHLY_SALARY,
  monthlyExpenses: MONTHLY_EXPENSES,

  // ---- Actions ----

  addMoney: (amount, description, category) => {
    const state = get()
    const tx: Transaction = {
      id: nextTxId(),
      type: 'credit',
      amount,
      description,
      month: state.month,
      category,
    }
    set({
      balance: state.balance + amount,
      transactions: [...state.transactions, tx],
    })
  },

  spendMoney: (amount, description, category) => {
    const state = get()
    if (state.balance < amount) return false
    const tx: Transaction = {
      id: nextTxId(),
      type: 'debit',
      amount,
      description,
      month: state.month,
      category,
    }
    set({
      balance: state.balance - amount,
      transactions: [...state.transactions, tx],
    })
    return true
  },

  updateHealth: (delta) => {
    const state = get()
    const newHealth = Math.max(0, Math.min(100, state.financialHealth + delta))
    set({ financialHealth: newHealth })
  },

  setDialogue: (dialogue) => {
    set({ activeDialogue: dialogue })
  },

  clearDialogue: () => {
    set({ activeDialogue: null })
  },

  setNearbyNPC: (npc) => {
    set({ nearbyNPC: npc })
  },

  advanceMonth: () => {
    const state = get()
    if (state.month >= state.maxMonth) return
    const newMonth = state.month + 1

    // Process SIP auto-debit if active
    let newBalance = state.balance
    let newSipTotal = state.sipTotal
    let newSipMonths = state.sipMonthsActive
    const newTransactions = [...state.transactions]

    if (state.sipAmount > 0 && newBalance >= state.sipAmount) {
      newBalance -= state.sipAmount
      newSipTotal += state.sipAmount
      newSipMonths += 1
      newTransactions.push({
        id: nextTxId(),
        type: 'debit',
        amount: state.sipAmount,
        description: `SIP auto-debit (Month ${newMonth})`,
        month: newMonth,
        category: 'sip',
      })
    }

    // Process insurance premium if bought
    if (state.insuranceBought && newBalance >= 1_000) {
      newBalance -= 1_000
      newTransactions.push({
        id: nextTxId(),
        type: 'debit',
        amount: 1_000,
        description: `Health insurance premium (Month ${newMonth})`,
        month: newMonth,
        category: 'insurance',
      })
    }

    set({
      month: newMonth,
      balance: newBalance,
      sipTotal: newSipTotal,
      sipMonthsActive: newSipMonths,
      transactions: newTransactions,
    })
  },

  completeZone: (zoneId) => {
    const state = get()
    if (state.completedZones.includes(zoneId)) return
    set({ completedZones: [...state.completedZones, zoneId] })
  },

  startSIP: (amount) => {
    set({ sipAmount: amount })
  },

  buyInsurance: () => {
    const state = get()
    if (state.insuranceBought) return
    if (state.balance < 1_000) return
    const tx: Transaction = {
      id: nextTxId(),
      type: 'debit',
      amount: 1_000,
      description: 'Health insurance - first premium',
      month: state.month,
      category: 'insurance',
    }
    set({
      insuranceBought: true,
      balance: state.balance - 1_000,
      transactions: [...state.transactions, tx],
    })
  },

  addToEmergencyFund: (amount) => {
    const state = get()
    if (state.balance < amount) return false
    const tx: Transaction = {
      id: nextTxId(),
      type: 'debit',
      amount,
      description: 'Added to emergency fund',
      month: state.month,
      category: 'emergency',
    }
    set({
      balance: state.balance - amount,
      emergencyFund: state.emergencyFund + amount,
      transactions: [...state.transactions, tx],
    })
    return true
  },

  receiveSalary: () => {
    const state = get()
    const tx: Transaction = {
      id: nextTxId(),
      type: 'credit',
      amount: state.monthlySalary,
      description: `Salary for Month ${state.month}`,
      month: state.month,
      category: 'salary',
    }
    set({
      balance: state.balance + state.monthlySalary,
      transactions: [...state.transactions, tx],
    })
  },

  deductMonthlyExpenses: () => {
    const state = get()
    const total = TOTAL_MONTHLY_EXPENSES
    const tx: Transaction = {
      id: nextTxId(),
      type: 'debit',
      amount: total,
      description: `Monthly expenses (rent, food, transport, utilities, loan EMI) - Month ${state.month}`,
      month: state.month,
      category: 'expense',
    }
    set({
      balance: state.balance - total,
      transactions: [...state.transactions, tx],
    })
    // If balance goes negative, add to debt
    if (state.balance - total < 0) {
      const debtAmount = Math.abs(state.balance - total)
      set((s) => ({
        debt: s.debt + debtAmount,
        balance: 0,
      }))
    }
  },

  addPoints: (amount) => {
    set((s) => ({ points: s.points + amount }))
  },
}))

// ---- Helper exports ----

export function getPlayerLevel(points: number): { level: number; title: string; nextLevelAt: number; progress: number } {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500]
  const titles = ['Rookie', 'Beginner', 'Learner', 'Saver', 'Investor', 'Advisor', 'Expert', 'Master', 'Guru', 'Legend']
  let level = 1
  for (let i = 1; i < thresholds.length; i++) {
    if (points >= thresholds[i]) level = i + 1
    else break
  }
  const currentThreshold = thresholds[Math.min(level - 1, thresholds.length - 1)]
  const nextThreshold = thresholds[Math.min(level, thresholds.length - 1)] || currentThreshold + 1000
  const progress = Math.min(1, (points - currentThreshold) / (nextThreshold - currentThreshold))
  return { level, title: titles[Math.min(level - 1, titles.length - 1)], nextLevelAt: nextThreshold, progress }
}

export function getTotalMonthlyExpenses(): number {
  return TOTAL_MONTHLY_EXPENSES
}

export function getDiscretionaryIncome(): number {
  const state = useGameStore.getState()
  return state.monthlySalary - TOTAL_MONTHLY_EXPENSES - state.sipAmount - (state.insuranceBought ? 1_000 : 0)
}

export function getNetWorth(): number {
  const state = useGameStore.getState()
  // Simple net worth: balance + emergency fund + SIP value (with rough 12% p.a. appreciation) - debt
  const sipValue = state.sipTotal * (1 + (0.12 / 12) * state.sipMonthsActive)
  return state.balance + state.emergencyFund + sipValue - state.debt
}

export function formatRupees(amount: number): string {
  const absAmount = Math.abs(amount)
  const formatted = absAmount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'INR',
  })
  return amount < 0 ? `-${formatted}` : formatted
}
