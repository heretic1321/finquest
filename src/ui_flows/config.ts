export type UIFlowId = 'login-flow-gallery' | 'investment-center' | 'hospital-insurance' | 'bank-flow' | 'blockchain-flow' | 'laxmi-intro'

export type UIFlowDefinition = {
  id: UIFlowId
  title: string
  description: string
  status: 'planned' | 'in-progress' | 'ready'
}

export const UI_FLOW_DEFINITIONS: UIFlowDefinition[] = [
  {
    id: 'investment-center',
    title: 'Investment Center Flow',
    description: 'Interactive investing lesson with dummy stocks, trend graphs, and guided outcomes.',
    status: 'ready',
  },
  {
    id: 'hospital-insurance',
    title: 'Hospital Insurance Domain',
    description: 'Story-based health insurance learning module with branching decisions and money impact simulation.',
    status: 'ready',
  },
  {
    id: 'bank-flow',
    title: 'Bank Education Module',
    description: 'Interactive banking education with KYC, Interest & Savings, Bank Loans, and Credit Score modules.',
    status: 'ready',
  },
  {
    id: 'blockchain-flow',
    title: 'Blockchain Domain',
    description: 'Learn blockchain fundamentals with Uncle Chunk — dialogue, quiz, and an interactive Build the Blockchain mini-game.',
    status: 'ready',
  },
  {
    id: 'laxmi-intro',
    title: 'Companion Introduction',
    description: 'Introductory flow where Laxmi is introduced as the player’s global financial companion.',
    status: 'ready',
  },
]

// Future mapping for world -> UI route handoff.
// Example when asset/store key exists:
// investmentcenter: 'investment-center'
export const STORE_TO_UI_FLOW: Partial<Record<string, UIFlowId>> = {}

export const getUIFlowForStore = (storeKey: string): UIFlowId | undefined =>
  STORE_TO_UI_FLOW[storeKey]

export const getFlowMeta = (flowId: UIFlowId) =>
  UI_FLOW_DEFINITIONS.find((flow) => flow.id === flowId)
