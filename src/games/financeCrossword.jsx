import { useEffect, useMemo, useState } from 'react'
import './financeCrossword.css'

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
    <div className="finance-crossword-page">
      <div className="finance-crossword-shell">
        <div className="finance-crossword-header">
          <div>
            <p className="finance-crossword-kicker">Mini-Game</p>
            <h1>Finance Crossword</h1>
          </div>
          <div className="finance-crossword-progress">{progressText}</div>
        </div>

        <div className="finance-crossword-card">
          <div
            className={`finance-crossword-grid${flashWrong ? ' wrong' : ''}`}
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
                    className={`finance-crossword-cell${
                      isSelected ? ' selected' : ''
                    }${isSolved ? ' solved' : ''}`}
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

          <div className="finance-crossword-footer">
            <div className="finance-crossword-wordlist">
              {puzzle.placements.map((placement) => (
                <span
                  key={placement.word}
                  className={`finance-crossword-word${
                    solvedSet.has(placement.word) ? ' solved' : ''
                  }`}
                >
                  {placement.word}
                </span>
              ))}
            </div>

            <div className="finance-crossword-actions">
              <button type="button" onClick={onBack}>
                Back
              </button>
              <button type="button" onClick={resetGame}>
                New Game
              </button>
            </div>
          </div>
        </div>

        {completed && (
          <div className="finance-crossword-winbox">
            <p>Brilliant! You found every finance word.</p>
            <button type="button" onClick={resetGame}>
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
