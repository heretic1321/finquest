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
    <div
      className="relative flex h-full w-full flex-col items-center justify-center bg-[#0a0a0a]"
      style={{
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.03) 2px, rgba(0,255,136,0.03) 4px)',
      }}
    >
      <div className="text-center">
        <h1 className="font-black text-7xl uppercase tracking-tighter md:text-9xl">
          <span className="text-[#00ff88]">FIN</span>
          <span className="text-white">QUEST</span>
        </h1>
        <p className="mt-4 font-mono text-sm uppercase tracking-wider text-neutral-500">
          Welcome back, <span className="font-bold text-[#00ff88]">{playerName}</span>
        </p>

        <button
          className="mt-10 rounded-none border-2 border-[#00ff88] bg-[#00ff88] px-16 py-5 text-lg font-black uppercase tracking-wider text-black shadow-[6px_6px_0_white] transition-all hover:translate-x-1.5 hover:translate-y-1.5 hover:shadow-none active:scale-95"
          onClick={handleClick}
        >
          Enter FinQuest
        </button>
      </div>
    </div>
  )
}

export default StartButton
