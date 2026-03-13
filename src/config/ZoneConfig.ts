export type ZoneId = 'bank' | 'hospital' | 'stockexchange' | 'scampark' | 'mftower'

export type ZoneConfig = {
  id: ZoneId
  name: string
  description: string
  storeKey: string           // Maps to everlite store key
  npcName: string
  npcGreeting: string
  questCompleted: boolean
  themeColor: string
  accentColor: string
  labelYOffset: number       // Height offset for floating label above building
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
    themeColor: '#1e3a5f',
    accentColor: '#4a90d9',
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
    themeColor: '#1c3d2e',
    accentColor: '#34d399',
    labelYOffset: 25,
  },
  scampark: {
    id: 'scampark',
    name: 'Scam Park',
    description: 'Beware! Not everyone here has good intentions...',
    storeKey: 'ogstore',
    npcName: 'Friendly Stranger',
    npcGreeting: "Hey! Got a minute? I have an amazing investment opportunity for you...",
    questCompleted: false,
    themeColor: '#4a1c1c',
    accentColor: '#ef4444',
    labelYOffset: 20,
  },
  mftower: {
    id: 'mftower',
    name: 'MF Tower',
    description: 'Learn about mutual funds and the power of compounding',
    storeKey: 'hub',
    npcName: 'MF Advisor Priya',
    npcGreeting: "Hello! I'm Priya. Ready to learn how your money can work for you?",
    questCompleted: false,
    themeColor: '#2d2b55',
    accentColor: '#818cf8',
    labelYOffset: 20,
  },
}

// Reverse lookup: everlite store key -> zone id
export const STORE_TO_ZONE: Record<string, ZoneId> = Object.fromEntries(
  Object.values(ZONE_CONFIGS).map(z => [z.storeKey, z.id])
) as Record<string, ZoneId>

// Get zone config by everlite store key
export function getZoneByStoreKey(storeKey: string): ZoneConfig | undefined {
  const zoneId = STORE_TO_ZONE[storeKey]
  return zoneId ? ZONE_CONFIGS[zoneId] : undefined
}
