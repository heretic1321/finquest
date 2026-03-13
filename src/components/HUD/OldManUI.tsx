import { useOldManStore } from '@client/components/OldManNPC'

export default function OldManUI() {
  const isUIOpen = useOldManStore((s) => s.isUIOpen)
  const setUIOpen = useOldManStore((s) => s.setUIOpen)

  if (!isUIOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-3xl border border-white/10 p-8 shadow-2xl">
        {/* Close */}
        <button
          onClick={() => setUIOpen(false)}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition text-xl"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🧘</div>
          <h1 className="text-3xl font-bold text-white">The Wise Elder</h1>
          <p className="text-slate-400 mt-1">Guardian of Financial Wisdom</p>
        </div>

        {/* Dialogue */}
        <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/5">
          <p className="text-slate-300 text-base leading-relaxed italic">
            "Young one, I have traveled far and seen fortunes built and lost.
            The greatest wealth is not in gold, but in knowledge. Let me share
            what I have learned in my years..."
          </p>
          <p className="text-slate-300 text-base leading-relaxed mt-4 italic">
            "Each building on this island holds a lesson. Visit them all, and
            you will leave this place wiser than any merchant or king."
          </p>
        </div>

        {/* Wisdom tips */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <p className="text-emerald-400 font-semibold text-sm">💡 Tip</p>
            <p className="text-slate-300 text-xs mt-1">Start a SIP early — even ₹5,000/month grows to ₹1 Crore in 20 years.</p>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
            <p className="text-amber-400 font-semibold text-sm">⚠️ Warning</p>
            <p className="text-slate-300 text-xs mt-1">Never share your UPI PIN with anyone. It's only for sending money, never receiving.</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
            <p className="text-blue-400 font-semibold text-sm">🏦 Wisdom</p>
            <p className="text-slate-300 text-xs mt-1">Health insurance isn't an expense — it's protection against losing everything.</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <p className="text-purple-400 font-semibold text-sm">📈 Secret</p>
            <p className="text-slate-300 text-xs mt-1">The stock market rewards patience. Time in the market beats timing the market.</p>
          </div>
        </div>

        <button
          onClick={() => setUIOpen(false)}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-emerald-500/25"
        >
          Thank you, Elder
        </button>
      </div>
    </div>
  )
}
