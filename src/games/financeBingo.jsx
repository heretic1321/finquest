import { useEffect, useMemo, useRef, useState } from 'react'

const GRID_SIZE = 5
const BINGO_WORD = 'BINGO'

const FINANCE_QUESTIONS = [
  'Do you track your monthly spending?',
  'Do you know your credit score?',
  'Do you follow a budget regularly?',
  'Have you built an emergency fund?',
  'Do you compare prices before big purchases?',
  'Do you save part of every paycheck?',
  'Have you set a financial goal this year?',
  'Do you avoid carrying credit card debt?',
  'Do you review your bank statements?',
  'Do you know the interest rate on your loans?',
  'Have you learned about compound interest?',
  'Do you keep money aside for unexpected bills?',
  'Do you understand the difference between needs and wants?',
  'Have you checked your insurance coverage recently?',
  'Do you pay bills on time consistently?',
  'Do you know how inflation affects savings?',
  'Have you started investing for the future?',
  'Do you look for ways to reduce subscriptions?',
  'Do you know your total monthly income?',
  'Do you use a savings account regularly?',
  'Have you made a plan to repay debt?',
  'Do you know what a credit utilization ratio is?',
  'Do you review your spending habits each month?',
  'Have you learned about diversification?',
  'Do you save before you spend?',
]

function shuffle(items) {
  const nextItems = [...items]

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[nextItems[index], nextItems[randomIndex]] = [
      nextItems[randomIndex],
      nextItems[index],
    ]
  }

  return nextItems
}

function buildBoard() {
  return Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => ({
    id: index + 1,
    marked: false,
  }))
}

function buildPromptOrder() {
  return shuffle(
    FINANCE_QUESTIONS.map((question, index) => ({
      id: index + 1,
      question,
    }))
  )
}

function getCompletedLineKeys(board) {
  const completed = []

  for (let row = 0; row < GRID_SIZE; row += 1) {
    const isComplete = Array.from(
      { length: GRID_SIZE },
      (_, col) => board[row * GRID_SIZE + col].marked
    ).every(Boolean)
    if (isComplete) completed.push(`row-${row}`)
  }

  for (let col = 0; col < GRID_SIZE; col += 1) {
    const isComplete = Array.from(
      { length: GRID_SIZE },
      (_, row) => board[row * GRID_SIZE + col].marked
    ).every(Boolean)
    if (isComplete) completed.push(`col-${col}`)
  }

  return completed
}

export function FinanceBingo({ onBack }) {
  const [board, setBoard] = useState(() => buildBoard())
  const [promptOrder, setPromptOrder] = useState(() => buildPromptOrder())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [revealedLetters, setRevealedLetters] = useState(0)
  const [completedLines, setCompletedLines] = useState([])
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setSeconds((value) => value + 1)
    }, 1000)

    return () => {
      window.clearInterval(intervalRef.current)
    }
  }, [])

  const isFinished = revealedLetters >= BINGO_WORD.length
  const currentPrompt = promptOrder[currentIndex] ?? null
  const displayedWord = BINGO_WORD.slice(0, revealedLetters)

  const formattedTime = useMemo(() => `${seconds}s`, [seconds])

  const advanceTurn = (nextBoard) => {
    const nextLines = getCompletedLineKeys(nextBoard)
    const newLines = nextLines.filter(
      (lineKey) => !completedLines.includes(lineKey)
    )

    if (newLines.length > 0) {
      setCompletedLines(nextLines)
      setRevealedLetters((value) =>
        Math.min(BINGO_WORD.length, value + newLines.length)
      )
    } else {
      setCompletedLines(nextLines)
    }

    setCurrentIndex((value) => Math.min(nextBoard.length, value + 1))
  }

  const handleAnswer = (answer) => {
    if (isFinished || !currentPrompt) return

    const nextBoard = board.map((tile, index) =>
      tile.id === currentPrompt.id
        ? { ...tile, marked: answer ? true : tile.marked }
        : tile
    )

    setBoard(nextBoard)
    advanceTurn(nextBoard)
  }

  const handleRestart = () => {
    setBoard(buildBoard())
    setPromptOrder(buildPromptOrder())
    setCurrentIndex(0)
    setSeconds(0)
    setRevealedLetters(0)
    setCompletedLines([])
  }

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-50">
      <div className="w-full max-w-lg p-6 bg-[#111] border-2 border-[#00ff88] shadow-[6px_6px_0_#00ff88]">
        <div className="text-[#00ff88] font-mono text-sm mb-2">Time: {formattedTime}</div>
        <h1 className="text-white font-black text-2xl uppercase tracking-tighter mb-4 font-mono">FINANCE BINGO</h1>

        <div className="border-2 border-neutral-700 bg-black p-4 mb-4">
          <div className="text-[#00ff88] font-mono font-bold text-3xl mb-2">
            {currentPrompt ? currentPrompt.id : '--'}
          </div>
          <p className="text-neutral-300 font-mono text-sm mb-3">
            {currentPrompt ? currentPrompt.question : 'All questions completed.'}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              className="bg-[#00ff88] text-black font-bold uppercase tracking-wider border-2 border-[#00ff88] px-6 py-2 font-mono cursor-pointer disabled:opacity-50"
              onClick={() => handleAnswer(true)}
              disabled={!currentPrompt || isFinished}
            >
              Yes
            </button>
            <button
              type="button"
              className="bg-black text-white border-2 border-neutral-600 px-6 py-2 uppercase tracking-wider font-bold font-mono cursor-pointer hover:border-[#ff3366] disabled:opacity-50"
              onClick={() => handleAnswer(false)}
              disabled={!currentPrompt || isFinished}
            >
              No
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {board.map((tile) => (
            <div
              key={tile.id}
              className={[
                'aspect-square border-2 flex items-center justify-center font-mono font-bold text-sm',
                tile.marked
                  ? 'bg-[#00ff88] border-[#00ff88] text-black'
                  : 'border-neutral-700 bg-black text-white',
                currentPrompt?.id === tile.id
                  ? 'border-[#ffcc00] shadow-[2px_2px_0_#ffcc00]'
                  : '',
              ].join(' ')}
            >
              <span>{tile.id}</span>
            </div>
          ))}
        </div>

        <div
          className="flex justify-center gap-2 mb-4 font-mono text-3xl font-black"
          aria-label={`Bingo progress: ${displayedWord || 'none'}`}
        >
          {BINGO_WORD.split('').map((letter, index) => (
            <span
              key={letter}
              className={index < revealedLetters ? 'text-[#00ff88]' : 'text-neutral-700'}
            >
              {index < revealedLetters ? letter : '_'}
            </span>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            className="bg-[#00ff88] text-black font-bold uppercase tracking-wider border-2 border-[#00ff88] px-6 py-2 font-mono cursor-pointer"
            onClick={onBack}
          >
            Back
          </button>
          <button
            type="button"
            className="bg-[#00ff88] text-black font-bold uppercase tracking-wider border-2 border-[#00ff88] px-6 py-2 font-mono cursor-pointer"
            onClick={handleRestart}
          >
            Restart
          </button>
        </div>

        {isFinished && (
          <div className="border-2 border-[#ffcc00] bg-black p-6 text-center mt-4 shadow-[4px_4px_0_#ffcc00]">
            <p className="text-[#ffcc00] font-black uppercase text-xl font-mono mb-3">Congrats! you won!</p>
            <button
              type="button"
              className="bg-[#00ff88] text-black font-bold uppercase tracking-wider border-2 border-[#00ff88] px-6 py-2 font-mono cursor-pointer"
              onClick={onBack}
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
