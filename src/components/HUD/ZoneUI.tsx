import { HUDStore } from '@client/contexts/HUDContext'
import { getZoneByStoreKey } from '@client/config/ZoneConfig'
import { useShallow } from 'zustand/react/shallow'

export default function ZoneUI() {
  const { storeRequestedToEnter, setStoreRequestedToEnter } = HUDStore(
    useShallow((state) => ({
      storeRequestedToEnter: state.storeRequestedToEnter,
      setStoreRequestedToEnter: state.setStoreRequestedToEnter,
    }))
  )

  if (!storeRequestedToEnter) return null

  const zone = getZoneByStoreKey(storeRequestedToEnter)
  if (!zone) return null

  const handleClose = () => {
    setStoreRequestedToEnter('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-white/10 p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition text-xl"
        >
          ✕
        </button>

        {/* Zone header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{zone.name}</h1>
          <p className="text-slate-400">{zone.description}</p>
        </div>

        {/* NPC greeting */}
        <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl flex-shrink-0">
              👤
            </div>
            <div>
              <p className="text-emerald-400 font-semibold mb-1">{zone.npcName}</p>
              <p className="text-slate-300 text-sm leading-relaxed">{zone.npcGreeting}</p>
            </div>
          </div>
        </div>

        {/* Action buttons placeholder */}
        <div className="flex gap-3">
          <button
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-emerald-500/25"
            onClick={() => {
              // TODO: Start zone quest
              console.log(`Starting quest in ${zone.name}`)
            }}
          >
            Start Quest
          </button>
          <button
            onClick={handleClose}
            className="px-6 bg-white/5 hover:bg-white/10 text-slate-300 font-medium py-3 rounded-xl transition border border-white/10"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  )
}
