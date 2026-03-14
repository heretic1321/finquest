import { useMemo, useState, useEffect } from 'react'
import { GoMute, GoUnmute } from 'react-icons/go'
import { BsFullscreen, BsFullscreenExit } from 'react-icons/bs'
import { GiCrossedSwords } from 'react-icons/gi'

import JumpButton from '@client/components/HUD/JumpButton'
import LoginScreen from '@client/components/HUD/LoginScreen'
import StartButton from '@client/components/HUD/StartButton'
import ZoneUI from '@client/components/HUD/ZoneUI'
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
import { UIFlowStore, UIFlowsOverlay } from '@client/ui_flows'
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
    <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between bg-black border-b-2 border-[#00ff88] px-4 py-2">
      {/* Left: Player info */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 border-2 border-[#00ff88] bg-black flex items-center justify-center text-[#00ff88] font-mono font-bold">
            {initials}
          </div>
          {/* Level badge */}
          <div className="absolute -bottom-1 -right-1 bg-[#00ff88] text-[10px] font-mono font-bold text-black w-5 h-5 flex items-center justify-center border-2 border-black">
            {level}
          </div>
        </div>

        {/* Name + title */}
        <div className="leading-tight">
          <div className="font-bold uppercase tracking-wider text-white text-sm">{playerName}</div>
          <div className="text-[#00ff88] text-xs uppercase tracking-widest font-mono">{title}</div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-neutral-700" />

        {/* Balance */}
        <div className="leading-tight">
          <div className="text-xs uppercase tracking-wider text-neutral-500">Balance</div>
          <div className="font-mono text-[#00ff88] text-lg tabular-nums">{formatRupees(balance)}</div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-neutral-700" />

        {/* Points + Level bar */}
        <div className="leading-tight min-w-[90px]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-neutral-500">XP</span>
            <span className="text-xs text-[#ffcc00] font-mono font-bold tabular-nums">{points}</span>
          </div>
          <div className="w-full h-1 bg-neutral-800 mt-1 overflow-hidden">
            <div
              className="h-full bg-[#ffcc00] transition-all duration-500"
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
          className="border-2 border-neutral-600 bg-black p-2 hover:border-[#00ff88] hover:text-[#00ff88] transition-colors"
          title="Launch Dungeon Game"
        >
          <GiCrossedSwords className="h-4 w-4 fill-purple-400" />
        </button>

        {/* Mute */}
        <button
          onClick={() => SoundsStore.getState().toggleMuted()}
          className="border-2 border-neutral-600 bg-black p-2 hover:border-[#00ff88] hover:text-[#00ff88] transition-colors"
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
            className="border-2 border-neutral-600 bg-black p-2 hover:border-[#00ff88] hover:text-[#00ff88] transition-colors"
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
    isExitStorePromptShown,
    exitStorePromptStoreName,
  } = HUDStore(
    useShallow((state) => ({
      hasStartButtonBeenPressed: state.hasStartButtonBeenPressed,
      showDialogScreen: state.showDialogScreen,
      isEnterStorePromptShown: state.isEnterStorePromptShown,
      enterStorePromptStoreName: state.enterStorePromptStoreName,
      isExitStorePromptShown: state.isExitStorePromptShown,
      exitStorePromptStoreName: state.exitStorePromptStoreName,
    })),
  )

  const loading_initialSpawn = genericStore((s) => s.loading_initialSpawn)
  const oldManNearby = useOldManStore((s) => s.isNearby)
  const oldManUIOpen = useOldManStore((s) => s.isUIOpen)
  const isUIFlowOpen = UIFlowStore((state) => state.isOpen)

  // Loader with smooth fade-out: stays mounted while fading, then unmounts
  const [loaderMounted, setLoaderMounted] = useState(false)
  const [loaderFading, setLoaderFading] = useState(false)

  useEffect(() => {
    if (hasStartButtonBeenPressed && loading_initialSpawn) {
      setLoaderMounted(true)
      setLoaderFading(false)
    } else if (loaderMounted && !loading_initialSpawn) {
      // Stabilization done → start fade-out
      setLoaderFading(true)
    }
  }, [hasStartButtonBeenPressed, loading_initialSpawn, loaderMounted])

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

      {loaderMounted && (
        <CustomLoader
          fadingOut={loaderFading}
          onFadeComplete={() => setLoaderMounted(false)}
        />
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
            <div className="bg-black border-2 border-[#00ff88] shadow-[4px_4px_0_#00ff88] px-10 py-5">
              <p className="font-black uppercase tracking-tight text-white text-lg mb-1">{zone.name}</p>
              <p className="text-neutral-400 text-sm font-mono mb-3">{zone.description}</p>
              <div className="flex items-center justify-center gap-2 text-[#00ff88]">
                <kbd className="border-2 border-[#00ff88] bg-[#00ff88] text-black font-mono font-bold px-3 py-1">E</kbd>
                <span className="text-sm font-mono uppercase tracking-wider">to enter</span>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Old man proximity prompt */}
      {hasStartButtonBeenPressed && !loading_initialSpawn && oldManNearby && !oldManUIOpen && !isEnterStorePromptShown && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 text-center">
          <div className="bg-black border-2 border-[#ffcc00] shadow-[4px_4px_0_#ffcc00] px-10 py-5">
            <p className="font-black uppercase tracking-tight text-white text-lg mb-1">The Wise Elder</p>
            <p className="text-neutral-400 text-sm font-mono mb-3">He seems to have something to say...</p>
            <div className="flex items-center justify-center gap-2 text-[#ffcc00]">
              <kbd className="border-2 border-[#ffcc00] bg-[#ffcc00] text-black font-mono font-bold px-3 py-1">E</kbd>
              <span className="text-sm font-mono uppercase tracking-wider">to talk</span>
            </div>
          </div>
        </div>
      )}

      {/* Zone exit prompt */}
      {hasStartButtonBeenPressed && isExitStorePromptShown && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 text-center">
          <div className="bg-black border-2 border-[#ff3366] shadow-[4px_4px_0_#ff3366] px-8 py-4">
            <p className="text-[#ff3366] text-lg font-mono font-bold uppercase tracking-wider">
              Press <kbd className="border-2 border-[#ff3366] bg-[#ff3366] text-black font-mono font-bold px-2 py-0.5 mx-1">E</kbd> to exit {getZoneByStoreKey(exitStorePromptStoreName)?.name || exitStorePromptStoreName}
            </p>
          </div>
        </div>
      )}

      {/* Zone full-page UI */}
      <ZoneUI />

      {/* UI Flows pipeline overlay */}
      {isUIFlowOpen && <UIFlowsOverlay />}
    </>
  )
}
