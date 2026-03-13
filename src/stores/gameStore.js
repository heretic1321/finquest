import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  // === PLAYER FINANCES ===
  balance: 0,
  financialHealth: 50,

  // === GAME CLOCK ===
  month: 1,

  // === TRANSACTION LOG ===
  transactions: [],

  // === DIALOGUE STATE ===
  activeDialogue: null,
  nearbyNPC: null,

  // === ZONE TRACKING ===
  completedZones: [],

  // === INVESTMENTS ===
  investments: {
    sipAmount: 0,
    sipTotal: 0,
    sipMonthsActive: 0,
    insuranceBought: false,
    emergencyFund: 0,
    debt: 0,
    debtInterestRate: 0.36,
  },

  // === PLAYER CHOICES ===
  playerChoices: {},

  // === MANDATORY MONTHLY EXPENSES ===
  monthlyExpenses: {
    rent: 12000,
    food: 6000,
    transport: 2000,
    utilities: 1500,
    educationLoanEMI: 5000,
  },

  // === SALARY ===
  monthlySalary: 45000,
  salaryReceived: false,

  // === UI FLAGS ===
  gamePhase: 'exploring',
  overlayOpen: false,

  // === ACTIONS ===

  addMoney: (amount, description) => set((state) => ({
    balance: state.balance + amount,
    transactions: [...state.transactions, { type: 'credit', amount, description, month: get().month }],
  })),

  spendMoney: (amount, description) => set((state) => ({
    balance: state.balance - amount,
    transactions: [...state.transactions, { type: 'debit', amount, description, month: get().month }],
  })),

  updateHealth: (delta) => set((state) => ({
    financialHealth: Math.max(0, Math.min(100, state.financialHealth + delta)),
  })),

  setDialogue: (dialogue) => set({ activeDialogue: dialogue }),

  clearDialogue: () => set({ activeDialogue: null }),

  setNearbyNPC: (npc) => set({ nearbyNPC: npc }),

  advanceMonth: () => set((state) => {
    if (state.month >= 12) return {};

    const newMonth = state.month + 1;
    let newBalance = state.balance;
    let newTransactions = [...state.transactions];
    let newInvestments = { ...state.investments };

    // Process SIP
    if (newInvestments.sipAmount > 0) {
      newBalance -= newInvestments.sipAmount;
      newTransactions.push({
        type: 'debit',
        amount: newInvestments.sipAmount,
        description: 'SIP monthly investment',
        month: newMonth,
      });
      newInvestments.sipMonthsActive += 1;
      newInvestments.sipTotal = newInvestments.sipTotal * 1.01 + newInvestments.sipAmount;
    }

    // Process insurance premium
    if (newInvestments.insuranceBought) {
      newBalance -= 1000;
      newTransactions.push({
        type: 'debit',
        amount: 1000,
        description: 'Health insurance premium',
        month: newMonth,
      });
    }

    // Process debt interest
    if (newInvestments.debt > 0) {
      newInvestments.debt = Math.round(newInvestments.debt * (1 + newInvestments.debtInterestRate / 12));
    }

    return {
      month: newMonth,
      salaryReceived: false,
      balance: newBalance,
      transactions: newTransactions,
      investments: newInvestments,
    };
  }),

  completeZone: (zoneId) => set((state) => {
    if (state.completedZones.includes(zoneId)) return {};
    return { completedZones: [...state.completedZones, zoneId] };
  }),

  setPlayerChoice: (key, value) => set((state) => ({
    playerChoices: { ...state.playerChoices, [key]: value },
  })),

  startSIP: (amount) => set((state) => ({
    investments: { ...state.investments, sipAmount: amount },
  })),

  buyInsurance: () => set((state) => ({
    investments: { ...state.investments, insuranceBought: true },
  })),

  addToEmergencyFund: (amount) => set((state) => ({
    balance: state.balance - amount,
    investments: { ...state.investments, emergencyFund: state.investments.emergencyFund + amount },
    transactions: [...state.transactions, { type: 'debit', amount, description: 'Emergency fund deposit', month: get().month }],
  })),

  addDebt: (amount) => set((state) => ({
    balance: state.balance + amount,
    investments: { ...state.investments, debt: state.investments.debt + amount },
    transactions: [...state.transactions, { type: 'credit', amount, description: 'Credit card debt', month: get().month }],
  })),

  setOverlayOpen: (isOpen) => set({ overlayOpen: isOpen }),

  receiveSalary: () => {
    const state = get();
    if (state.salaryReceived) return;
    get().addMoney(state.monthlySalary, 'TechCorp monthly salary');
    set({ salaryReceived: true });
  },

  deductMonthlyExpenses: () => {
    const { spendMoney } = get();
    spendMoney(12000, 'Rent - shared flat');
    spendMoney(6000, 'Food & groceries');
    spendMoney(2000, 'Transport - metro pass');
    spendMoney(1500, 'Utilities - electricity, WiFi, phone');
    spendMoney(5000, 'Education loan EMI');
  },

  setGamePhase: (phase) => set({ gamePhase: phase }),
}));

// === HELPER FUNCTIONS (exported outside the store) ===

export const getTotalMonthlyExpenses = () => {
  const { monthlyExpenses } = useGameStore.getState();
  return Object.values(monthlyExpenses).reduce((sum, val) => sum + val, 0);
};

export const getDiscretionaryIncome = () => {
  const state = useGameStore.getState();
  return state.monthlySalary - getTotalMonthlyExpenses();
};

export const getNetWorth = () => {
  const { balance, investments } = useGameStore.getState();
  return balance + investments.emergencyFund + investments.sipTotal - investments.debt;
};

export const formatRupees = (amount) => {
  const absAmount = Math.abs(Math.round(amount));
  const formatted = absAmount.toLocaleString('en-IN');
  return `${amount < 0 ? '-' : ''}\u20B9${formatted}`;
};

export default useGameStore;
