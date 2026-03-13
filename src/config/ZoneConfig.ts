export type ZoneId = 'bank' | 'techcorp' | 'mftower' | 'scampark' | 'stockexchange'

export type ZoneConfig = {
  id: ZoneId
  name: string               // Display name
  description: string        // Short description shown on entry prompt
  storeKey: string           // Maps to everlite store key (hub, tallstore, etc.)
  npcName: string            // NPC at this zone
  npcGreeting: string        // First line of dialogue
  questCompleted: boolean    // Track state
  themeColor: string         // Primary color for building material override
  accentColor: string        // Secondary/accent color
}

export const ZONE_CONFIGS: Record<ZoneId, ZoneConfig> = {
  bank: {
    id: 'bank',
    name: 'FinQuest Bank',
    description: 'Your financial hub - manage accounts, start SIPs, buy insurance',
    storeKey: 'hub',
    npcName: 'Didi',
    npcGreeting: "Welcome to FinQuest Bank! I'm Didi, your financial guide. Let me show you around.",
    questCompleted: false,
    themeColor: '#1e3a5f',   // Dark navy blue (bank)
    accentColor: '#4a90d9',
  },
  techcorp: {
    id: 'techcorp',
    name: 'TechCorp HQ',
    description: 'Your new workplace - understand your salary structure',
    storeKey: 'tallstore',
    npcName: 'HR Vikram',
    npcGreeting: "Welcome to TechCorp! I'm Vikram from HR. Ready to understand your offer letter?",
    questCompleted: false,
    themeColor: '#1a2744',   // Deep slate blue (corporate)
    accentColor: '#3b82f6',
  },
  mftower: {
    id: 'mftower',
    name: 'MF Tower',
    description: 'Learn about mutual funds and the power of compounding',
    storeKey: 'domestore',
    npcName: 'MF Advisor Priya',
    npcGreeting: "Hello! I'm Priya. Ready to learn how your money can work for you?",
    questCompleted: false,
    themeColor: '#2d2b55',   // Dark indigo (investment)
    accentColor: '#818cf8',
  },
  scampark: {
    id: 'scampark',
    name: 'Scam Park',
    description: 'Beware! Not everyone here has good intentions...',
    storeKey: 'ogstore',
    npcName: 'Friendly Stranger',
    npcGreeting: "Hey! Got a minute? I have an amazing investment opportunity for you...",
    questCompleted: false,
    themeColor: '#4a1c1c',   // Dark maroon (danger)
    accentColor: '#ef4444',
  },
  stockexchange: {
    id: 'stockexchange',
    name: 'Stock Exchange',
    description: 'The bustling world of stocks and markets',
    storeKey: 'cylinderstore',
    npcName: 'Broker Raj',
    npcGreeting: "Welcome to Dalal Street! I'm Raj. Want to try your hand at the market?",
    questCompleted: false,
    themeColor: '#1c3d2e',   // Dark teal (stock market)
    accentColor: '#34d399',
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
