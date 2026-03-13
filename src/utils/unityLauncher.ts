/**
 * Unity Game Launcher
 * Opens the Unity WebGL game in a new browser window
 */

export interface UnityLaunchOptions {
  /** URL to return to after game completion (defaults to current origin) */
  returnUrl?: string;
  /** Whether to open in fullscreen (default: true for new window) */
  fullscreen?: boolean;
  /** Custom window features for window.open */
  windowFeatures?: string;
}

/**
 * Launch the Unity game (Shadow Monarx Path) in a new browser window
 */
export function launchUnityGame(options: UnityLaunchOptions = {}): Window | null {
  const {
    returnUrl = window.location.origin,
    fullscreen = true,
    windowFeatures,
  } = options;

  // Build the Unity game URL with return URL parameter
  const unityUrl = new URL('/unity/index.html', window.location.origin);
  unityUrl.searchParams.set('returnUrl', returnUrl);

  // Default window features for fullscreen-ish experience
  const defaultFeatures = fullscreen
    ? 'width=' + screen.width + ',height=' + screen.height + ',menubar=no,toolbar=no,location=no,status=no'
    : undefined;

  const features = windowFeatures ?? defaultFeatures;

  console.log('[UnityLauncher] Opening Unity game:', unityUrl.toString());

  const unityWindow = window.open(unityUrl.toString(), 'UnityGame', features);

  if (!unityWindow) {
    console.error('[UnityLauncher] Failed to open Unity window - popup may be blocked');
  }

  return unityWindow;
}

/**
 * Check if the Unity game files are available
 */
export async function checkUnityAvailable(): Promise<boolean> {
  try {
    const response = await fetch('/unity/index.html', { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Parse Unity game completion data from URL parameters
 * (used when Unity redirects back to FinQuest)
 */
export interface UnityGameResult {
  gameCompleted: boolean;
  playerDied: boolean;
  exitedManually: boolean;
  completionTime?: number;
  enemiesDefeated?: number;
  bossDefeated?: boolean;
  lootCollected?: number;
  deathCount?: number;
  survivalTime?: number;
  deathPhase?: string;
  checkpointsReached?: number;
}

export function parseUnityGameResult(): UnityGameResult | null {
  const params = new URLSearchParams(window.location.search);

  const gameCompleted = params.get('gameCompleted') === 'true';
  const playerDied = params.get('playerDied') === 'true';
  const exitedManually = params.get('exitFromUnity') === 'true';

  // No Unity result data in URL
  if (!gameCompleted && !playerDied && !exitedManually) {
    return null;
  }

  return {
    gameCompleted,
    playerDied,
    exitedManually,
    completionTime: params.get('completionTime') ? Number(params.get('completionTime')) : undefined,
    enemiesDefeated: params.get('enemiesDefeated') ? Number(params.get('enemiesDefeated')) : undefined,
    bossDefeated: params.get('bossDefeated') === 'true',
    lootCollected: params.get('lootCollected') ? Number(params.get('lootCollected')) : undefined,
    deathCount: params.get('deathCount') ? Number(params.get('deathCount')) : undefined,
    survivalTime: params.get('survivalTime') ? Number(params.get('survivalTime')) : undefined,
    deathPhase: params.get('deathPhase') ?? undefined,
    checkpointsReached: params.get('checkpointsReached') ? Number(params.get('checkpointsReached')) : undefined,
  };
}

/**
 * Clear Unity game result parameters from the URL
 */
export function clearUnityResultFromUrl(): void {
  const url = new URL(window.location.href);
  const keysToRemove = [
    'gameCompleted', 'playerDied', 'exitFromUnity',
    'completionTime', 'enemiesDefeated', 'bossDefeated',
    'lootCollected', 'deathCount', 'survivalTime',
    'deathPhase', 'checkpointsReached'
  ];

  keysToRemove.forEach(key => url.searchParams.delete(key));

  window.history.replaceState({}, '', url.toString());
}
