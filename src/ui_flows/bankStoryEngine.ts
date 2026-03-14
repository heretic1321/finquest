// ─── Bank Story Engine ───────────────────────────────────────────────────────
// Modular data + logic for the FinQuest Bank learning module.
// All question content, simulations, and evaluation logic live here.

export type BankTopicId = 'kyc' | 'interest-savings' | 'bank-loans' | 'credit-score'

export type BankTopic = {
  id: BankTopicId
  title: string
  icon: string
  managerIntro: string
  question: {
    text: string
    options: { id: string; label: string }[]
    correctId: string
    explanation: string
  }
  simulation: {
    description: string
    result: string
    formula?: string
  }
  rewardCoins: number
}

export type QuizResult = {
  isCorrect: boolean
  explanation: string
  rewardCoins: number
}

export const BANK_TOPICS: BankTopic[] = [
  {
    id: 'kyc',
    title: 'KYC Verification',
    icon: '🪪',
    managerIntro:
      "KYC stands for Know Your Customer. Before opening any bank account, we verify your identity using documents like Aadhaar, PAN card, and address proof. It protects you from fraud and ensures only you can access your money.",
    question: {
      text: 'What does KYC stand for?',
      options: [
        { id: 'know-your-customer', label: 'Know Your Customer' },
        { id: 'keep-your-cash', label: 'Keep Your Cash' },
        { id: 'key-your-currency', label: 'Key Your Currency' },
      ],
      correctId: 'know-your-customer',
      explanation:
        'KYC means Know Your Customer — a mandatory process that lets banks verify who you are. Without it, you cannot open an account, transfer large amounts, or access digital banking services.',
    },
    simulation: {
      description:
        "Arjun tried to transfer ₹50,000 to a friend without completing KYC. The bank blocked it instantly.",
      result:
        'KYC verified: No daily transfer limit ✅ | Without KYC: Capped at ₹10,000/day ❌ | KYC takes only 10 minutes and protects your account for a lifetime.',
    },
    rewardCoins: 100,
  },
  {
    id: 'interest-savings',
    title: 'Interest & Savings',
    icon: '🏦',
    managerIntro:
      "When you deposit money with us, your money doesn't sit idle — it earns interest! At 5% annual interest, depositing ₹10,000 today means you'll have ₹10,500 after just one year without doing anything.",
    question: {
      text: 'You deposit ₹10,000 at 5% annual interest. How much will you have after 1 year?',
      options: [
        { id: '10500', label: '₹10,500' },
        { id: '10100', label: '₹10,100' },
        { id: '9500', label: '₹9,500' },
      ],
      correctId: '10500',
      explanation:
        'Simple Interest = Principal × Rate × Time = ₹10,000 × 5% × 1 = ₹500. Total = ₹10,000 + ₹500 = ₹10,500. Your money grows just by sitting in a bank!',
    },
    simulation: {
      description: 'Priya deposits ₹10,000 in a savings account at 5% p.a. simple interest.',
      result:
        'Year 1: ₹10,500 💰 | Year 3: ₹11,500 💰 | Year 5: ₹12,500 💰 | Year 10: ₹15,000 💰',
      formula: 'SI = (P × R × T) / 100',
    },
    rewardCoins: 150,
  },
  {
    id: 'bank-loans',
    title: 'Bank Loans',
    icon: '📋',
    managerIntro:
      "Need funds for a home, car, or education? A bank loan lets you borrow now and repay in easy monthly installments called EMI. The bank charges interest for this service — so always compare rates before choosing a loan.",
    question: {
      text: 'Rahul borrows ₹1,00,000 at 10% annual interest for 12 months. What is his approximate monthly EMI?',
      options: [
        { id: '8792', label: '₹8,792' },
        { id: '10000', label: '₹10,000' },
        { id: '5000', label: '₹5,000' },
      ],
      correctId: '8792',
      explanation:
        "EMI includes both principal and interest. For ₹1,00,000 at 10% for 12 months, EMI ≈ ₹8,792. Total repaid ≈ ₹1,05,499 — meaning ₹5,499 is paid as interest to the bank.",
    },
    simulation: {
      description:
        'Loan: ₹1,00,000 | Annual Rate: 10% | Duration: 12 months',
      result:
        'Monthly EMI: ₹8,792 💳 | Total Interest Paid: ₹5,499 | Total Repaid: ₹1,05,499 | Pro tip: Higher credit score → lower interest rate → smaller EMI!',
      formula: 'EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ − 1)',
    },
    rewardCoins: 150,
  },
  {
    id: 'credit-score',
    title: 'Credit Score',
    icon: '⭐',
    managerIntro:
      "Your credit score (300–900) is your financial report card. Banks check it before giving any loan. A score above 750 unlocks lower interest rates, faster approvals, and bigger loan limits. Build it by paying bills on time, every time.",
    question: {
      text: 'Which action will IMPROVE your credit score the most?',
      options: [
        { id: 'pay-on-time', label: 'Paying all bills and EMIs on time' },
        { id: 'miss-payments', label: 'Missing EMI payments occasionally' },
        { id: 'max-credit', label: 'Using 100% of your credit card limit' },
      ],
      correctId: 'pay-on-time',
      explanation:
        "On-time payments account for 35% of your credit score — the single biggest factor. Missed payments, high credit utilization, and defaults can tank your score by 100+ points in a single month.",
    },
    simulation: {
      description:
        'Sunita has a credit score of 620. She pays all EMIs on time for 6 consecutive months.',
      result:
        'Score: 620 → 710 (+90 points) 📈 | Home loan rate drops from 12% → 8.5% | Monthly EMI savings: ₹15,000 | Over 20-year loan: saves ₹36 lakh! 🎉',
    },
    rewardCoins: 200,
  },
]

export const evaluateAnswer = (topicId: BankTopicId, selectedOptionId: string): QuizResult => {
  const topic = BANK_TOPICS.find((t) => t.id === topicId)!
  const isCorrect = selectedOptionId === topic.question.correctId
  return {
    isCorrect,
    explanation: topic.question.explanation,
    rewardCoins: isCorrect ? topic.rewardCoins : 0,
  }
}

export const TOTAL_BANK_TOPICS = BANK_TOPICS.length
