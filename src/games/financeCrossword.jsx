import { useEffect, useMemo, useState } from 'react'

const GRID_SIZE = 9
const WORDS = [
  'BUDGET',
  'SAVING',
  'INVEST',
  'EQUITY',
  'PROFIT',
  'CREDIT',
  'INSURE',
  'LOAN',
]

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, -1],
  [-1, 1],
]

function shuffle(items) {
  const next = [...items]

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }

  return next
}

function randomLetter() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return alphabet[Math.floor(Math.random() * alphabet.length)]
}

function inBounds(row, col) {
  return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE
}

function buildSelectionPath(start, end) {
  if (!start || !end) return []

  const rowDelta = end.row - start.row
  const colDelta = end.col - start.col
  const rowStep = Math.sign(rowDelta)
  const colStep = Math.sign(colDelta)

  const isStraight =
    rowDelta === 0 ||
    colDelta === 0 ||
    Math.abs(rowDelta) === Math.abs(colDelta)

  if (!isStraight) return [start]

  const steps = Math.max(Math.abs(rowDelta), Math.abs(colDelta))

  return Array.from({ length: steps + 1 }, (_, index) => ({
    row: start.row + rowStep * index,
    col: start.col + colStep * index,
  }))
}

function coordinatesToKey(cells) {
  return cells.map(({ row, col }) => `${row},${col}`).join('|')
}

function buildPuzzle() {
  const grid = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => '')
  )
  const placements = []

  for (const word of shuffle(WORDS)) {
    let placed = false

    for (let attempt = 0; attempt < 300 && !placed; attempt += 1) {
      const [rowStep, colStep] =
        DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
      const startRow = Math.floor(Math.random() * GRID_SIZE)
      const startCol = Math.floor(Math.random() * GRID_SIZE)
      const cells = []
      let valid = true

      for (let index = 0; index < word.length; index += 1) {
        const row = startRow + rowStep * index
        const col = startCol + colStep * index

        if (!inBounds(row, col)) {
          valid = false
          break
        }

        const existing = grid[row][col]
        if (existing && existing !== word[index]) {
          valid = false
          break
        }

        cells.push({ row, col })
      }

      if (!valid) continue

      cells.forEach(({ row, col }, index) => {
        grid[row][col] = word[index]
      })

      placements.push({
        word,
        cells,
        key: coordinatesToKey(cells),
        reverseKey: coordinatesToKey([...cells].reverse()),
      })
      placed = true
    }
  }

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (!grid[row][col]) {
        grid[row][col] = randomLetter()
      }
    }
  }

  return { grid, placements }
}

export function FinanceCrossword({ onBack }) {
  const [puzzle, setPuzzle] = useState(() => buildPuzzle())
  const [selectionStart, setSelectionStart] = useState(null)
  const [selectionCells, setSelectionCells] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [solvedWords, setSolvedWords] = useState([])
  const [flashWrong, setFlashWrong] = useState(false)

  useEffect(() => {
    if (!isDragging) return undefined

    const handlePointerUp = () => {
      finalizeSelection()
    }

    window.addEventListener('pointerup', handlePointerUp)
    return () => window.removeEventListener('pointerup', handlePointerUp)
  })

  const solvedSet = useMemo(() => new Set(solvedWords), [solvedWords])
  const solvedCells = useMemo(() => {
    const cellMap = new Map()

    puzzle.placements.forEach((placement) => {
      if (!solvedSet.has(placement.word)) return
      placement.cells.forEach(({ row, col }) => {
        cellMap.set(`${row},${col}`, true)
      })
    })

    return cellMap
  }, [puzzle.placements, solvedSet])

  const progressText = `${solvedWords.length}/${puzzle.placements.length} words found`
  const completed = solvedWords.length === puzzle.placements.length

  const resetGame = () => {
    setPuzzle(buildPuzzle())
    setSolvedWords([])
    setSelectionStart(null)
    setSelectionCells([])
    setIsDragging(false)
    setFlashWrong(false)
  }

  const finalizeSelection = () => {
    if (selectionCells.length === 0) {
      setIsDragging(false)
      return
    }

    const selectionKey = coordinatesToKey(selectionCells)
    const match = puzzle.placements.find(
      (placement) =>
        (placement.key === selectionKey || placement.reverseKey === selectionKey) &&
        !solvedSet.has(placement.word)
    )

    if (match) {
      setSolvedWords((prev) => [...prev, match.word])
    } else {
      setFlashWrong(true)
      window.setTimeout(() => setFlashWrong(false), 220)
    }

    setSelectionStart(null)
    setSelectionCells([])
    setIsDragging(false)
  }

  const handlePointerDown = (row, col) => {
    setSelectionStart({ row, col })
    setSelectionCells([{ row, col }])
    setIsDragging(true)
  }

  const handlePointerEnter = (row, col) => {
    if (!isDragging || !selectionStart) return
    setSelectionCells(buildSelectionPath(selectionStart, { row, col }))
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-[#0a0a0a]">
      <div className="w-full max-w-3xl flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[#00ff88] uppercase tracking-[0.12em] font-mono text-xs mb-2">Mini-Game</p>
            <h1 className="text-white font-black text-3xl md:text-4xl uppercase tracking-tighter font-mono">Finance Crossword</h1>
          </div>
          <div className="border-2 border-[#00ff88] bg-black px-4 py-2 text-[#00ff88] font-mono font-bold text-sm">{progressText}</div>
        </div>

        <div className="bg-[#111] border-2 border-[#00ff88] shadow-[4px_4px_0_#00ff88] p-4">
          <div
            className="grid grid-cols-9 gap-1"
            style={flashWrong ? { animation: 'shake 0.2s ease-in-out' } : undefined}
            onContextMenu={(event) => event.preventDefault()}
          >
            {puzzle.grid.map((row, rowIndex) =>
              row.map((letter, colIndex) => {
                const cellKey = `${rowIndex},${colIndex}`
                const isSelected = selectionCells.some(
                  (cell) => cell.row === rowIndex && cell.col === colIndex
                )
                const isSolved = solvedCells.has(cellKey)

                return (
                  <button
                    key={cellKey}
                    type="button"
                    className={[
                      'aspect-square border-2 font-bold font-mono text-base uppercase cursor-pointer transition-colors flex items-center justify-center select-none',
                      isSolved
                        ? 'bg-[#00ff88] border-[#00ff88] text-black'
                        : isSelected
                          ? 'bg-[#00ff88]/20 border-[#00ff88] text-white'
                          : 'border-neutral-700 bg-black text-white hover:border-[#00ff88]',
                    ].join(' ')}
                    onPointerDown={() => handlePointerDown(rowIndex, colIndex)}
                    onPointerEnter={() => handlePointerEnter(rowIndex, colIndex)}
                    onPointerUp={finalizeSelection}
                  >
                    {letter}
                  </button>
                )
              })
            )}
          </div>

          <div className="mt-4">
            <div className="flex gap-2.5 flex-wrap mb-4">
              {puzzle.placements.map((placement) => (
                <span
                  key={placement.word}
                  className={[
                    'px-3 py-2 border-2 font-mono font-bold text-sm uppercase',
                    solvedSet.has(placement.word)
                      ? 'text-[#00ff88] line-through border-[#00ff88] bg-black'
                      : 'border-neutral-700 bg-black text-white',
                  ].join(' ')}
                >
                  {placement.word}
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
                onClick={resetGame}
              >
                New Game
              </button>
            </div>
          </div>
        </div>

        {completed && (
          <div className="border-2 border-[#ffcc00] bg-black p-6 text-center shadow-[4px_4px_0_#ffcc00]">
            <p className="text-[#ffcc00] font-black uppercase text-2xl font-mono mb-3">Brilliant! You found every finance word.</p>
            <button
              type="button"
              className="bg-[#00ff88] text-black font-bold uppercase tracking-wider border-2 border-[#00ff88] px-6 py-2 font-mono cursor-pointer"
              onClick={resetGame}
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
}
