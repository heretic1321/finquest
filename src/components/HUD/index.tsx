import { useMemo } from 'react'
import { GoMute, GoUnmute } from 'react-icons/go'
import { BsFullscreen, BsFullscreenExit } from 'react-icons/bs'

import JumpButton from '@client/components/HUD/JumpButton'
import BankHUD from '@client/components/HUD/BankHUD'
import LoginScreen from '@client/components/HUD/LoginScreen'
import StartButton from '@client/components/HUD/StartButton'
import ZoneUI from '@client/components/HUD/ZoneUI'
import { CustomLoader } from '@client/components/HUD/Loader'
import { SoundsStore } from '@client/components/Sounds'
import { AuthAPIStore } from '@client/contexts/AuthContext'
import { AvatarStore } from '@client/contexts/AvatarAppearanceContext'
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { getZoneByStoreKey } from '@client/config/ZoneConfig'
import { useShallow } from 'zustand/react/shallow'

export default function HUD() {
  const isTouchDevice = GesturesAndDeviceStore((state) => state.isTouchDevice)
  const hasAvatarBeenSelected = AvatarStore(
    (state) => state.hasAvatarBeenSelected,
  )

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

  const loading_initialSpawn = genericStore(
    (state) => state.loading_initialSpawn,
  )
  const isMuted = SoundsStore((state) => state.isMuted)

  // Login screen
  const showLogin = useMemo(() => {
    if (!isLoggedIn && !isGuest) return <LoginScreen />
    return null
  }, [isLoggedIn, isGuest])

  // Start button (after login, before entering world)
  const showStartBtn = useMemo(() => {
    if (
      !hasStartButtonBeenPressed &&
      hasAvatarBeenSelected &&
      (isLoggedIn || isGuest)
    )
      return <StartButton />
    return null
  }, [hasStartButtonBeenPressed, hasAvatarBeenSelected, isLoggedIn, isGuest])

  // Jump button (mobile only)
  const showJumpBtn = useMemo(() => {
    if (
      isTouchDevice &&
      !showDialogScreen &&
      hasStartButtonBeenPressed
    )
      return <JumpButton />
    return null
  }, [isTouchDevice, showDialogScreen, hasStartButtonBeenPressed])

  // Mute/unmute button
  const muteBtn = useMemo(() => {
    if (!hasStartButtonBeenPressed) return null
    return (
      <div
        onClick={() => {
          SoundsStore.getState().toggleMuted()
        }}
        className='cursor-pointer rounded-lg bg-black/40 p-2.5 backdrop-blur-sm transition hover:bg-black/60'
      >
        {isMuted ? (
          <GoMute className='h-5 w-5 fill-white' />
        ) : (
          <GoUnmute className='h-5 w-5 fill-white' />
        )}
      </div>
    )
  }, [hasStartButtonBeenPressed, isMuted])

  // Fullscreen toggle
  const fullscreenBtn = useMemo(() => {
    if (!hasStartButtonBeenPressed || isTouchDevice) return null
    const toggleFs = GesturesAndDeviceStore.getState().toggleFullscreen
    const isFs = !!document.fullscreenElement
    return (
      <div
        onClick={() => toggleFs?.()}
        className='cursor-pointer rounded-lg bg-black/40 p-2.5 backdrop-blur-sm transition hover:bg-black/60'
      >
        {isFs ? (
          <BsFullscreenExit className='h-5 w-5 fill-white' />
        ) : (
          <BsFullscreen className='h-5 w-5 fill-white' />
        )}
      </div>
    )
  }, [hasStartButtonBeenPressed, isTouchDevice])

  return (
    <>
      {/* Login */}
      {showLogin}

      {/* Start button */}
      {showStartBtn && (
        <div className='absolute inset-0 z-50'>
          {showStartBtn}
        </div>
      )}

      {/* Loading screen */}
      {hasStartButtonBeenPressed && loading_initialSpawn && (
        <CustomLoader
          containerStyles={{}}
          innerStyles={{}}
        />
      )}

      {/* In-game HUD */}
      {hasStartButtonBeenPressed && !loading_initialSpawn && (
        <>
          {/* Top-right controls */}
          <div className='absolute right-4 top-4 z-40 flex gap-2'>
            {muteBtn}
            {fullscreenBtn}
          </div>

          {/* Bank balance HUD (top-left) */}
          <BankHUD />

          {/* Jump button (mobile) */}
          {showJumpBtn}
        </>
      )}

      {/* Zone entry prompt */}
      {hasStartButtonBeenPressed && !loading_initialSpawn && isEnterStorePromptShown && (() => {
        const zone = getZoneByStoreKey(enterStorePromptStoreName)
        if (!zone) return null
        return (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 text-center animate-bounce-slow">
            <div className="bg-black/80 backdrop-blur-md rounded-2xl px-10 py-6 border border-emerald-500/40 shadow-2xl shadow-emerald-500/10">
              <p className="text-white text-xl font-bold mb-1">
                {zone.name}
              </p>
              <p className="text-slate-400 text-sm mb-4">
                {zone.description}
              </p>
              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <kbd className="bg-emerald-500/20 border border-emerald-500/40 rounded-lg px-3 py-1 text-sm font-mono font-bold">E</kbd>
                <span className="text-base font-medium">to enter</span>
              </div>
            </div>
          </div>
        )
      })()}

      <ZoneUI />
    </>
  )
}
