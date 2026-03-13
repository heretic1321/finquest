export type ZoneId = 'bank' | 'hospital' | 'stockexchange'

export type ZoneConfig = {
  id: ZoneId
  name: string
  description: string
  storeKey: string
  npcName: string
  npcGreeting: string
  questCompleted: boolean
  themeColor: string
  accentColor: string
  labelYOffset: number
}

export const ZONE_CONFIGS: Record<ZoneId, ZoneConfig> = {
  bank: {
    id: 'bank',
    name: 'FinQuest Bank',
    description: 'Your financial hub - manage accounts, start SIPs, buy insurance',
    storeKey: 'cylinderstore',
    npcName: 'Didi',
    npcGreeting: "Welcome to FinQuest Bank! I'm Didi, your financial guide. Let me show you around.",
    questCompleted: false,
    themeColor: '#93a4ba',
    accentColor: '#c8d6e5',
    labelYOffset: 20,
  },
  hospital: {
    id: 'hospital',
    name: 'City Hospital',
    description: 'What happens when you skip health insurance?',
    storeKey: 'tallstore',
    npcName: 'Dr. Sharma',
    npcGreeting: "I see patients every day who could've avoided financial ruin with a simple insurance policy...",
    questCompleted: false,
    themeColor: '#c4c4c4',
    accentColor: '#ffffff',
    labelYOffset: 30,
  },
  stockexchange: {
    id: 'stockexchange',
    name: 'Stock Exchange',
    description: 'The bustling world of stocks and markets',
    storeKey: 'domestore',
    npcName: 'Broker Raj',
    npcGreeting: "Welcome to Dalal Street! I'm Raj. Want to try your hand at the market?",
    questCompleted: false,
    themeColor: '#969696',
    accentColor: '#d4d4d4',
    labelYOffset: 25,
  },
}

// Stores to SKIP (not render as zones)
export const IGNORED_STORES = new Set(['ogstore', 'hub'])

export const STORE_TO_ZONE: Record<string, ZoneId> = Object.fromEntries(
  Object.values(ZONE_CONFIGS).map(z => [z.storeKey, z.id])
) as Record<string, ZoneId>

export function getZoneByStoreKey(storeKey: string): ZoneConfig | undefined {
  const zoneId = STORE_TO_ZONE[storeKey]
  return zoneId ? ZONE_CONFIGS[zoneId] : undefined
}
