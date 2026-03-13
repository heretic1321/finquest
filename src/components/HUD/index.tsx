import { useMemo } from 'react'
import { GoMute, GoUnmute } from 'react-icons/go'
import { BsFullscreen, BsFullscreenExit } from 'react-icons/bs'
import { GiCrossedSwords } from 'react-icons/gi'

import JumpButton from '@client/components/HUD/JumpButton'
import LoginScreen from '@client/components/HUD/LoginScreen'
import StartButton from '@client/components/HUD/StartButton'
import ZoneUI from '@client/components/HUD/ZoneUI'
import OldManUI from '@client/components/HUD/OldManUI'
import { useOldManStore } from '@client/components/OldManNPC'
import { CustomLoader } from '@client/components/HUD/Loader'
import { SoundsStore } from '@client/components/Sounds'
import { AuthAPIStore } from '@client/contexts/AuthContext'
import { AvatarStore } from '@client/contexts/AvatarAppearanceContext'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { getZoneByStoreKey } from '@client/config/ZoneConfig'
import { useGameStore, getPlayerLevel } from '@client/stores/gameStore'
import { launchUnityGame } from '@client/utils/unityLauncher'
import { useShallow } from 'zustand/react/shallow'

function formatRupees(amount: number): string {
  const abs = Math.abs(Math.round(amount))
  const formatted = abs.toLocaleString('en-IN')
  return `${amount < 0 ? '-' : ''}₹${formatted}`
}

function PlayerHUD() {
  const balance = useGameStore((s) => s.balance)
  const points = useGameStore((s) => s.points)
  const isMuted = SoundsStore((s) => s.isMuted)
  const isTouchDevice = GesturesAndDeviceStore((s) => s.isTouchDevice)

  const playerData = (() => {
    try { return JSON.parse(localStorage.getItem('finquest_player') || '{}') }
    catch { return {} }
  })()
  const playerName = playerData.name || 'Explorer'
  const initials = playerName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  const { level, title, progress } = getPlayerLevel(points)

  return (
    <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-2">
      {/* Left: Player info */}
      <div className="flex items-center gap-4 rounded-2xl bg-black/60 backdrop-blur-md px-5 py-3 border border-white/[0.08] shadow-lg">
        {/* Avatar */}
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 text-base font-bold">
            {initials}
          </div>
          {/* Level badge */}
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-[10px] font-bold text-white rounded-full w-5 h-5 flex items-center justify-center border-2 border-black/40">
            {level}
          </div>
        </div>

        {/* Name + title */}
        <div className="leading-tight">
          <div className="text-white text-base font-semibold">{playerName}</div>
          <div className="text-emerald-400/80 text-xs font-medium">{title}</div>
        </div>

        {/* Divider */}
        <div className="w-px h-9 bg-white/10" />

        {/* Balance */}
        <div className="leading-tight">
          <div className="text-xs text-slate-400 font-medium">Balance</div>
          <div className="text-white text-lg font-bold tabular-nums">{formatRupees(balance)}</div>
        </div>

        {/* Divider */}
        <div className="w-px h-9 bg-white/10" />

        {/* Points + Level bar */}
        <div className="leading-tight min-w-[90px]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">XP</span>
            <span className="text-xs text-amber-400 font-bold tabular-nums">{points}</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-1.5">
        {/* Unity game */}
        <button
          onClick={() => launchUnityGame()}
          className="rounded-lg bg-black/50 backdrop-blur-md p-2 border border-white/5 hover:bg-white/10 transition"
          title="Launch Dungeon Game"
        >
          <GiCrossedSwords className="h-4 w-4 fill-purple-400" />
        </button>

        {/* Mute */}
        <button
          onClick={() => SoundsStore.getState().toggleMuted()}
          className="rounded-lg bg-black/50 backdrop-blur-md p-2 border border-white/5 hover:bg-white/10 transition"
        >
          {isMuted
            ? <GoMute className="h-4 w-4 fill-white" />
            : <GoUnmute className="h-4 w-4 fill-white" />
          }
        </button>

        {/* Fullscreen (desktop only) */}
        {!isTouchDevice && (
          <button
            onClick={() => GesturesAndDeviceStore.getState().toggleFullscreen?.()}
            className="rounded-lg bg-black/50 backdrop-blur-md p-2 border border-white/5 hover:bg-white/10 transition"
          >
            {document.fullscreenElement
              ? <BsFullscreenExit className="h-4 w-4 fill-white" />
              : <BsFullscreen className="h-4 w-4 fill-white" />
            }
          </button>
        )}
      </div>
    </div>
  )
}

export default function HUD() {
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)
  const hasAvatarBeenSelected = AvatarStore((state) => state.hasAvatarBeenSelected)

  const { isLoggedIn, isGuest } = AuthAPIStore(
    useShallow((state) => ({
      isLoggedIn: state.isLoggedIn,
      isGuest: state.isGuest,
    })),
  )

  const {
    hasStartButtonBeenPressed,
    showDialogScreen,
    isEnterStorePromptShown,
    enterStorePromptStoreName,
  } = HUDStore(
    useShallow((state) => ({
      hasStartButtonBeenPressed: state.hasStartButtonBeenPressed,
      showDialogScreen: state.showDialogScreen,
      isEnterStorePromptShown: state.isEnterStorePromptShown,
      enterStorePromptStoreName: state.enterStorePromptStoreName,
    })),
  )

  const loading_initialSpawn = genericStore((s) => s.loading_initialSpawn)
  const oldManNearby = useOldManStore((s) => s.isNearby)
  const oldManUIOpen = useOldManStore((s) => s.isUIOpen)

  // Login screen
  const showLogin = useMemo(() => {
    if (!isLoggedIn && !isGuest) return <LoginScreen />
    return null
  }, [isLoggedIn, isGuest])

  // Start button
  const showStartBtn = useMemo(() => {
    if (!hasStartButtonBeenPressed && hasAvatarBeenSelected && (isLoggedIn || isGuest))
      return <StartButton />
    return null
  }, [hasStartButtonBeenPressed, hasAvatarBeenSelected, isLoggedIn, isGuest])

  // Jump button (mobile)
  const showJumpBtn = useMemo(() => {
    if (isTouchDevice && !showDialogScreen && hasStartButtonBeenPressed)
      return <JumpButton />
    return null
  }, [isTouchDevice, showDialogScreen, hasStartButtonBeenPressed])

  return (
    <>
      {showLogin}

      {showStartBtn && (
        <div className="absolute inset-0 z-50">{showStartBtn}</div>
      )}

      {hasStartButtonBeenPressed && loading_initialSpawn && (
        <CustomLoader containerStyles={{}} innerStyles={{}} />
      )}

      {/* In-game HUD */}
      {hasStartButtonBeenPressed && !loading_initialSpawn && (
        <>
          <PlayerHUD />
          {showJumpBtn}
        </>
      )}

      {/* Zone entry prompt */}
      {hasStartButtonBeenPressed && !loading_initialSpawn && isEnterStorePromptShown && (() => {
        const zone = getZoneByStoreKey(enterStorePromptStoreName)
        if (!zone) return null
        return (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 text-center">
            <div className="bg-black/70 backdrop-blur-md rounded-2xl px-10 py-5 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10">
              <p className="text-white text-lg font-bold mb-1">{zone.name}</p>
              <p className="text-slate-400 text-sm mb-3">{zone.description}</p>
              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <kbd className="bg-emerald-500/20 border border-emerald-500/40 rounded-lg px-3 py-1 text-sm font-mono font-bold">E</kbd>
                <span className="text-sm font-medium">to enter</span>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Old man proximity prompt */}
      {hasStartButtonBeenPressed && !loading_initialSpawn && oldManNearby && !oldManUIOpen && !isEnterStorePromptShown && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 text-center">
          <div className="bg-black/70 backdrop-blur-md rounded-2xl px-10 py-5 border border-amber-500/30 shadow-2xl shadow-amber-500/10">
            <p className="text-white text-lg font-bold mb-1">🧘 The Wise Elder</p>
            <p className="text-slate-400 text-sm mb-3">He seems to have something to say...</p>
            <div className="flex items-center justify-center gap-2 text-amber-400">
              <kbd className="bg-amber-500/20 border border-amber-500/40 rounded-lg px-3 py-1 text-sm font-mono font-bold">E</kbd>
              <span className="text-sm font-medium">to talk</span>
            </div>
          </div>
        </div>
      )}

      {/* Zone full-page UI */}
      <ZoneUI />
      <OldManUI />
    </>
  )
}
