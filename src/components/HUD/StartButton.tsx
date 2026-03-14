import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { SoundsStore } from '../Sounds'

const StartButton = () => {
  const setHasStartButtonBeenPressed = HUDStore((s) => s.setHasStartButtonBeenPressed)
  const toggleFullscreen = GesturesAndDeviceStore((s) => s.toggleFullscreen)
  const isDebugMode = genericStore((s) => s.isDebugMode)

  const playerData = (() => {
    try { return JSON.parse(localStorage.getItem('finquest_player') || '{}') }
    catch { return {} }
  })()
  const playerName = playerData.name || 'Explorer'

  const handleClick = () => {
    // Set loading BEFORE triggering canvas render to avoid uncovered frames
    genericStore.setState({ loading_initialSpawn: true })
    setHasStartButtonBeenPressed(true)
    if (toggleFullscreen && !isDebugMode) toggleFullscreen()
    setTimeout(() => SoundsStore.getState().setupAndPlayBackgroundMusic(true), 2000)
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#0a0f1a]">
      <div className="text-center">
        <h1 className="text-7xl font-extrabold tracking-tight md:text-8xl">
          <span className="text-emerald-400">Fin</span>
          <span className="text-white">Quest</span>
        </h1>
        <p className="mt-4 text-lg text-slate-400">
          Welcome back, <span className="font-semibold text-emerald-400">{playerName}</span>
        </p>

        <button
          className="mt-10 rounded-xl bg-emerald-500 px-14 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-95"
          onClick={handleClick}
        >
          Enter FinQuest
        </button>
      </div>
    </div>
  )
}

export default StartButton
