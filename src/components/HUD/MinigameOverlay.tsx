import { useEffect } from 'react'
import { useMinigameStore, MinigameId } from '@client/components/MinigameKiosk'
import Wordle from '@client/games/Wordle'
import { FinanceBingo } from '@client/games/financeBingo'
import { FinanceCrossword } from '@client/games/financeCrossword'
import { PlayerConfigStore } from '@client/components/Character'

function GameContent({ gameId, onClose }: { gameId: MinigameId; onClose: () => void }) {
  switch (gameId) {
    case 'wordle':
      return <Wordle onCloseGame={onClose} />
    case 'bingo':
      return <FinanceBingo onBack={onClose} />
    case 'crossword':
      return <FinanceCrossword onBack={onClose} />
    default:
      return null
  }
}

export default function MinigameOverlay() {
  const activeGame = useMinigameStore((s) => s.activeGame)

  // Freeze / unfreeze player when overlay opens / closes
  useEffect(() => {
    PlayerConfigStore.getState().isPlayerParalysedRef.current = true
    return () => {
      PlayerConfigStore.getState().isPlayerParalysedRef.current = false
    }
  }, [])

  const handleClose = () => {
    PlayerConfigStore.getState().isPlayerParalysedRef.current = false
    useMinigameStore.getState().closeGame()
  }

  if (!activeGame) return null

  return (
    <div className="fixed inset-0 z-[130] bg-[#0a0a0a] flex flex-col">
      {/* Close button */}
      <div className="absolute top-4 right-4 z-[131]">
        <button
          onClick={handleClose}
          className="border-2 border-neutral-600 bg-black text-white px-4 py-2 font-mono font-bold uppercase tracking-wider hover:border-[#00ff88] hover:text-[#00ff88] transition-colors"
        >
          ESC / CLOSE
        </button>
      </div>

      {/* Game content */}
      <div className="flex-1 overflow-auto">
        <GameContent gameId={activeGame} onClose={handleClose} />
      </div>
    </div>
  )
}
