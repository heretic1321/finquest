// ─── Blockchain Story Engine ─────────────────────────────────────────────────
// All static data and pure logic for the FinQuest Blockchain domain.

export type UncleChunkSpeaker = 'UncleChunk' | 'Narrator'

export type BlockchainDialogue = {
  id: number
  speaker: UncleChunkSpeaker
  text: string
}

export const UNCLE_CHUNK_DIALOGUES: BlockchainDialogue[] = [
  {
    id: 0,
    speaker: 'UncleChunk',
    text: "Arre beta, welcome! People talk about Bitcoin and crypto all the time — but do they really understand what blockchain is? Sit down, let me tell you a story.",
  },
  {
    id: 1,
    speaker: 'UncleChunk',
    text: "Think of blockchain like a register — a notebook where every transaction is written down. But the magic is: instead of one shopkeeper keeping it, thousands of computers around the world each hold the exact same copy!",
  },
  {
    id: 2,
    speaker: 'UncleChunk',
    text: "Each entry is called a 'block'. Every block is linked to the previous one using a unique code called a 'hash' — like a fingerprint. Change one block, and ALL the blocks after it break. That is why it is called a CHAIN.",
  },
]

// ─── Quiz ──────────────────────────────────────────────────────────────────

export type QuizOption = { id: string; label: string }

export const BLOCKCHAIN_QUIZ: {
  question: string
  options: QuizOption[]
  correctId: string
  explanation: string
  rewardCoins: number
} = {
  question: 'What makes blockchain secure?',
  options: [
    { id: 'many-computers', label: 'Many computers store the same copy of data' },
    { id: 'one-controller', label: 'Only one person controls it' },
    { id: 'easily-edited', label: 'It can be easily edited and updated' },
  ],
  correctId: 'many-computers',
  explanation:
    'Blockchain is secure because thousands of computers (nodes) store identical copies. To tamper with any data, you would need to change every single copy simultaneously — practically impossible!',
  rewardCoins: 150,
}

// ─── Mini-game pending transactions ─────────────────────────────────────────

export type PendingTransaction = { id: number; transaction: string }

export const PENDING_TRANSACTIONS: PendingTransaction[] = [
  { id: 1, transaction: 'Rahul → Priya  ₹5,000' },
  { id: 2, transaction: 'TechCorp → Raj  ₹1,20,000 salary' },
  { id: 3, transaction: 'Anita → Hospital  ₹8,500 payment' },
  { id: 4, transaction: 'Govt → Pension  ₹3,200 transfer' },
]

// ─── Hash helper (deterministic visual hash — not cryptographic) ─────────────

export const makeVisualHash = (input: string): string => {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) - h + input.charCodeAt(i)) | 0
  }
  return (h >>> 0).toString(16).padStart(16, '0').toUpperCase()
}

export const GENESIS_HASH = '0000000000000000'
export const MINIGAME_REWARD_COINS = 200
