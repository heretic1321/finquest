export type IntroDialogue = {
  speaker: 'Narrator' | 'Woman' | 'Guide'
  text: string
}

export type QuestionOption = {
  id: string
  label: string
  isCorrect?: boolean
}

export type QuestionEvaluation = {
  isCorrect: boolean
  explanation: string
  rewardPoints: number
}

export type InsuranceDecision = 'buy-insurance' | 'skip-insurance'

export type InsuranceSimulationResult = {
  decision: InsuranceDecision
  monthlyIncome: number
  premium: number
  hospitalBill: number
  coveredByInsurance: number
  outOfPocket: number
  totalMoneyDeducted: number
  title: string
  message: string
  advice: string
}

export const INTRO_DIALOGUES: IntroDialogue[] = [
  {
    speaker: 'Narrator',
    text: 'Your avatar enters the hospital lobby. A woman is sitting on a bench, crying.',
  },
  {
    speaker: 'Woman',
    text: 'My husband had a sudden heart attack... The treatment started immediately, but now the bill is massive.',
  },
  {
    speaker: 'Woman',
    text: 'We never bought health insurance. We thought we could manage emergencies somehow. We were wrong.',
  },
  {
    speaker: 'Guide',
    text: 'This is exactly why financial planning includes health insurance. Let us test your understanding.',
  },
]

export const MISTAKE_QUESTION = {
  text: 'What was the main mistake in this situation?',
  options: [
    { id: 'expensive-treatment', label: 'Medical treatment is too expensive' },
    { id: 'no-insurance', label: 'They did not buy health insurance', isCorrect: true },
    { id: 'hospitals-unfair', label: 'Hospitals are unfair' },
  ] satisfies QuestionOption[],
}

export const INCOME_SCENARIO = {
  monthlyIncome: 40_000,
  premium: 500,
  hospitalBill: 3_00_000,
}

export function evaluateMistakeAnswer(selectedOptionId: string): QuestionEvaluation {
  const selectedOption = MISTAKE_QUESTION.options.find((option) => option.id === selectedOptionId)
  const isCorrect = Boolean(selectedOption?.isCorrect)

  if (isCorrect) {
    return {
      isCorrect: true,
      rewardPoints: 100,
      explanation:
        'Correct. The core mistake was ignoring health insurance. A small regular premium protects against catastrophic medical bills.',
    }
  }

  return {
    isCorrect: false,
    rewardPoints: 0,
    explanation:
      'Medical costs can be high, but insurance is designed for this exact risk. The key issue was being uninsured during a health emergency.',
  }
}

export function simulateInsuranceDecision(decision: InsuranceDecision): InsuranceSimulationResult {
  const { monthlyIncome, premium, hospitalBill } = INCOME_SCENARIO

  if (decision === 'buy-insurance') {
    const coveredByInsurance = 2_80_000
    const outOfPocket = hospitalBill - coveredByInsurance
    const totalMoneyDeducted = outOfPocket + premium

    return {
      decision,
      monthlyIncome,
      premium,
      hospitalBill,
      coveredByInsurance,
      outOfPocket,
      totalMoneyDeducted,
      title: 'Insurance protected your finances',
      message:
        'You paid a small premium and insurance covered most of the hospital bill. Your savings remain safer during emergencies.',
      advice:
        'Health insurance converts an unpredictable large expense into a manageable planned cost.',
    }
  }

  return {
    decision,
    monthlyIncome,
    premium,
    hospitalBill,
    coveredByInsurance: 0,
    outOfPocket: hospitalBill,
    totalMoneyDeducted: hospitalBill,
    title: 'Severe financial shock',
    message:
      'Without insurance, the full medical bill hits your pocket. This can wipe out savings and force debt.',
    advice:
      'Skipping small premiums may feel like saving today, but it can create a massive loss during emergencies.',
  }
}
