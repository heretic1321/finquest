import { create } from 'zustand'

export const useGameStore = create((set, get) => ({
  // Player state
  playerName: 'Explorer',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  coins: 0,
  financialHealth: 50, // 0-100

  // Game state
  isLoaded: false,
  isPaused: false,

  // Dialogue
  activeDialogue: null,
  dialogueHistory: [],

  // Quests
  quests: [],
  activeQuest: null,

  // NPC interaction
  nearbyNPC: null,

  // Actions
  setLoaded: () => set({ isLoaded: true }),
  setPaused: (isPaused) => set({ isPaused }),

  addXP: (amount) => {
    const { xp, xpToNextLevel, level } = get()
    const newXP = xp + amount
    if (newXP >= xpToNextLevel) {
      set({
        xp: newXP - xpToNextLevel,
        level: level + 1,
        xpToNextLevel: Math.floor(xpToNextLevel * 1.5),
      })
    } else {
      set({ xp: newXP })
    }
  },

  addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),

  updateFinancialHealth: (delta) =>
    set((s) => ({
      financialHealth: Math.max(0, Math.min(100, s.financialHealth + delta)),
    })),

  setActiveDialogue: (dialogue) => set({ activeDialogue: dialogue }),
  clearDialogue: () => set({ activeDialogue: null }),

  setNearbyNPC: (npc) => set({ nearbyNPC: npc }),

  addQuest: (quest) =>
    set((s) => ({ quests: [...s.quests, { ...quest, completed: false }] })),

  completeQuest: (questId) =>
    set((s) => ({
      quests: s.quests.map((q) =>
        q.id === questId ? { ...q, completed: true } : q
      ),
    })),
}))
