import { FinanceBingo } from '../../games/financeBingo'
import { useGameStore } from '../../stores/gameStore'

function Hud() {
  const level = useGameStore((s) => s.level)
  const xp = useGameStore((s) => s.xp)
  const xpToNextLevel = useGameStore((s) => s.xpToNextLevel)
  const coins = useGameStore((s) => s.coins)
  const financialHealth = useGameStore((s) => s.financialHealth)

  return (
    <div className="hud">
      <div className="hud-bar">
        <span className="label">Level</span>
        <span>{level}</span>
      </div>
      <div className="hud-bar">
        <span className="label">XP</span>
        <div className="bar">
          <div className="bar-fill xp" style={{ width: `${(xp / xpToNextLevel) * 100}%` }} />
        </div>
        <span>{xp}/{xpToNextLevel}</span>
      </div>
      <div className="hud-bar">
        <span className="label">Coins</span>
        <span>{coins}</span>
      </div>
      <div className="hud-bar">
        <span className="label">Health</span>
        <div className="bar">
          <div className="bar-fill xp" style={{ width: `${financialHealth}%` }} />
        </div>
        <span>{financialHealth}%</span>
      </div>
    </div>
  )
}

function DialogueBox() {
  const activeDialogue = useGameStore((s) => s.activeDialogue)
  const clearDialogue = useGameStore((s) => s.clearDialogue)
  const openMinigame = useGameStore((s) => s.openMinigame)

  if (!activeDialogue) return null

  return (
    <div className="dialogue-box">
      <div className="npc-name">{activeDialogue.npcName}</div>
      <div className="dialogue-text">{activeDialogue.text}</div>
      <div className="dialogue-actions">
        <button type="button" className="primary" onClick={() => openMinigame('financeBingo')}>
          Play Finance Bingo
        </button>
        <button type="button" onClick={clearDialogue}>
          Close
        </button>
      </div>
    </div>
  )
}

export function GameUI() {
  const activeMinigame = useGameStore((s) => s.activeMinigame)
  const closeMinigame = useGameStore((s) => s.closeMinigame)

  return (
    <div className="game-ui">
      <Hud />
      <DialogueBox />
      {activeMinigame === 'financeBingo' && <FinanceBingo onBack={closeMinigame} />}
    </div>
  )
}
