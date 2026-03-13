import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { SoundsStore } from '../Sounds'

const StartButton = () => {
  const setHasStartButtonBeenPressed = HUDStore(
    (state) => state.setHasStartButtonBeenPressed,
  )
  const toggleFullscreen = GesturesAndDeviceStore(
    (state) => state.toggleFullscreen,
  )
  const isDebugMode = genericStore((state) => state.isDebugMode)

  const buttonClickHandler = () => {
    setHasStartButtonBeenPressed(true)
    if (toggleFullscreen && !isDebugMode) toggleFullscreen()
    setTimeout(() => {
      SoundsStore.getState().setupAndPlayBackgroundMusic(true)
    }, 2000)
  }

  // Read player name from localStorage
  const playerData = (() => {
    try {
      return JSON.parse(localStorage.getItem('finquest_player') || '{}')
    } catch { return {} }
  })()
  const playerName = playerData.name || 'Explorer'

  return (
    <div className='flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#0a1628]'>
      <div className='text-center'>
        <h1 className='text-6xl font-bold tracking-tight md:text-8xl'>
          <span className='text-emerald-400'>Fin</span>
          <span className='text-white'>Quest</span>
        </h1>
        <p className='mt-4 text-lg text-slate-300'>
          Welcome, <span className='font-semibold text-emerald-300'>{playerName}</span>
        </p>
        <p className='mt-1 text-sm text-slate-500'>
          Your financial literacy adventure awaits
        </p>

        <button
          className='mt-10 rounded-xl bg-emerald-500 px-12 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 hover:shadow-emerald-400/40 active:scale-95'
          onClick={buttonClickHandler}
        >
          Enter FinQuest
        </button>
      </div>
    </div>
  )
}

export default StartButton
