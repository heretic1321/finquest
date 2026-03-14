import { useEffect, useMemo, useRef, useState } from 'react'
import './Wordle.css'

function getTodayIST() {
  const now = new Date()
  const istOffset = 330 * 60 * 1000
  const istTime = new Date(
    now.getTime() + istOffset - now.getTimezoneOffset() * 60000
  )
  return istTime.toISOString().slice(0, 10)
}

const ANSWER_WORDS = [
  'MONEY',
  'TAXES',
  'DEBIT',
  'STOCK',
  'BONDS',
  'SAVER',
  'LOANS',
  'TRADE',
  'PRICE',
  'RATIO',
]

const VALID_WORDS = new Set([
  ...ANSWER_WORDS,
  'ASSET',
  'BANKS',
  'BILLS',
  'BONUS',
  'BRAIN',
  'BREAD',
  'BUYER',
  'CARRY',
  'CENTS',
  'CHART',
  'CHECK',
  'CLAIM',
  'CLOSE',
  'COSTS',
  'COUNT',
  'COVER',
  'CREDIT',
  'EARNS',
  'FUNDS',
  'GAINS',
  'GOALS',
  'GROSS',
  'INDEX',
  'LEASE',
  'LIMIT',
  'SCORE',
  'SHARE',
  'SPEND',
  'TOTAL',
  'VALUE',
  'WORTH',
])

const QWERTY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
]

const getEmptyGrid = () => Array.from({ length: 6 }, () => Array(5).fill(''))
const getEmptyStatusGrid = () =>
  Array.from({ length: 6 }, () => Array(5).fill(''))

function getTimerParts(time) {
  const m = String(Math.floor(time / 60000)).padStart(2, '0')
  const s = String(Math.floor((time % 60000) / 1000)).padStart(2, '0')
  const ms = String(Math.floor((time % 1000) / 10)).padStart(2, '0')
  return { m, s, ms }
}

function getDailyWord() {
  const seed = Number(getTodayIST().replaceAll('-', ''))
  return ANSWER_WORDS[seed % ANSWER_WORDS.length]
}

function getRandomWord() {
  return ANSWER_WORDS[Math.floor(Math.random() * ANSWER_WORDS.length)]
}

function buildConfetti(count = 26) {
  return Array.from({ length: count }, (_, index) => ({
    id: `${Date.now()}-${index}`,
    left: Math.random() * 100,
    delay: Math.random(),
    duration: 1.8 + Math.random() * 1.4,
    rotation: Math.random() * 360,
  }))
}

const Wordle = ({
  showLeaderboard,
  user,
  gameType = 'random',
  playKeypadClick,
  soundOn = true,
  pauseTimer = false,
  onCloseGame,
}) => {
  const [grid, setGrid] = useState(getEmptyGrid())
  const [statusGrid, setStatusGrid] = useState(getEmptyStatusGrid())
  const [currentRow, setCurrentRow] = useState(0)
  const [currentCol, setCurrentCol] = useState(0)
  const [keyboardStatus, setKeyboardStatus] = useState({})
  const [message, setMessage] = useState('')
  const [timer, setTimer] = useState(0)
  const [timerActive, setTimerActive] = useState(true)
  const [wordOfTheDay, setWordOfTheDay] = useState(() =>
    gameType === 'daily' ? getDailyWord() : getRandomWord()
  )
  const [rowAnimation, setRowAnimation] = useState({})
  const [coins, setCoins] = useState([])
  const [confetti, setConfetti] = useState([])
  const [showHowToPlay, setShowHowToPlay] = useState(false)
  const inputRef = useRef(null)
  const startRef = useRef(null)

  const focusInput = () => {
    window.requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  const finished =
    message.startsWith('Congratulations!') || message.startsWith('Game Over!')
  const timerParts = useMemo(() => getTimerParts(timer), [timer])

  useEffect(() => {
    setWordOfTheDay(gameType === 'daily' ? getDailyWord() : getRandomWord())
  }, [gameType])

  useEffect(() => {
    focusInput()
  }, [currentRow, currentCol, showHowToPlay])

  useEffect(() => {
    let interval

    if (timerActive && !pauseTimer) {
      if (!startRef.current) {
        startRef.current = Date.now() - timer
      }

      interval = window.setInterval(() => {
        setTimer(Date.now() - startRef.current)
      }, 100)
    }

    return () => window.clearInterval(interval)
  }, [pauseTimer, timer, timerActive])

  useEffect(() => {
    if (finished) {
      setTimerActive(false)
    }
  }, [finished])

  useEffect(() => {
    if (confetti.length === 0) return undefined

    const timeout = window.setTimeout(() => {
      setConfetti([])
    }, 3200)

    return () => window.clearTimeout(timeout)
  }, [confetti])

  const spawnCoins = (count = 7) => {
    const arr = Array.from({ length: count }, (_, index) => ({
      id: `${Date.now()}-${index}`,
      delay: index * 120,
      stack: index,
    }))
    setCoins(arr)
    window.setTimeout(() => setCoins([]), 2200)
  }

  const restartGame = (nextType = gameType) => {
    setGrid(getEmptyGrid())
    setStatusGrid(getEmptyStatusGrid())
    setCurrentRow(0)
    setCurrentCol(0)
    setKeyboardStatus({})
    setMessage('')
    setTimer(0)
    setTimerActive(true)
    setRowAnimation({})
    setCoins([])
    setConfetti([])
    startRef.current = null
    setWordOfTheDay(nextType === 'daily' ? getDailyWord() : getRandomWord())
  }

  const checkGuess = (guess) => {
    const answerArr = wordOfTheDay.split('')
    const guessArr = guess.split('')
    const statusRow = Array(5).fill('')
    const used = Array(5).fill(false)
    const newKeyboardStatus = {}

    for (let index = 0; index < 5; index += 1) {
      if (guessArr[index] === answerArr[index]) {
        statusRow[index] = 'correct'
        used[index] = true
      }
    }

    for (let index = 0; index < 5; index += 1) {
      if (statusRow[index]) continue

      let found = false
      for (let answerIndex = 0; answerIndex < 5; answerIndex += 1) {
        if (!used[answerIndex] && guessArr[index] === answerArr[answerIndex]) {
          used[answerIndex] = true
          found = true
          break
        }
      }

      statusRow[index] = found ? 'present' : 'absent'
    }

    for (let index = 0; index < 5; index += 1) {
      const letter = guessArr[index]
      const nextStatus = statusRow[index]
      const existingStatus = keyboardStatus[letter]

      if (existingStatus === 'correct') {
        newKeyboardStatus[letter] = 'correct'
      } else if (nextStatus === 'correct') {
        newKeyboardStatus[letter] = 'correct'
      } else if (
        existingStatus !== 'correct' &&
        (existingStatus === 'present' || nextStatus === 'present')
      ) {
        newKeyboardStatus[letter] = 'present'
      } else if (!existingStatus) {
        newKeyboardStatus[letter] = 'absent'
      }
    }

    return { statusRow, newKeyboardStatus }
  }

  const handleLetter = (letter) => {
    if (currentCol >= 5 || currentRow >= 6 || finished) return

    setGrid((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === currentRow
          ? row.map((cell, colIndex) => (colIndex === currentCol ? letter : cell))
          : row
      )
    )
    setCurrentCol((prev) => prev + 1)
  }

  const handleBackspace = () => {
    if (currentCol <= 0 || finished) return

    setGrid((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === currentRow
          ? row.map((cell, colIndex) =>
              colIndex === currentCol - 1 ? '' : cell
            )
          : row
      )
    )
    setCurrentCol((prev) => prev - 1)
  }

  const handleEnter = () => {
    if (finished) return

    if (currentCol !== 5) {
      setMessage('Not enough letters')
      window.setTimeout(() => setMessage(''), 1200)
      return
    }

    const guess = grid[currentRow].join('')
    setMessage('Checking if the word exists...')

    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${guess.toLowerCase()}`)
      .then((response) => {
        if (!response.ok) return null
        return response.json()
      })
      .catch(() => {
        if (VALID_WORDS.has(guess)) return [{}]
        return null
      })
      .then((data) => {
        setMessage('')

        if (!data && !VALID_WORDS.has(guess)) {
          setMessage('Oops! Word not defined.')
          window.setTimeout(() => setMessage(''), 1500)
          return
        }

        const { statusRow, newKeyboardStatus } = checkGuess(guess)

        setStatusGrid((prev) =>
          prev.map((row, rowIndex) =>
            rowIndex === currentRow ? statusRow : row
          )
        )
        setKeyboardStatus((prev) => ({ ...prev, ...newKeyboardStatus }))

        if (guess === wordOfTheDay) {
          const { m, s, ms } = getTimerParts(timer)
          setMessage(
            `Congratulations!\nYou guessed the word correctly in ${
              currentRow + 1
            } tries and ${m}:${s}:${ms} time`
          )
          setRowAnimation((prev) => ({ ...prev, [currentRow]: 'dance' }))
          setConfetti(buildConfetti())
          spawnCoins()

          window.setTimeout(() => {
            setRowAnimation((prev) => ({ ...prev, [currentRow]: 'win' }))
          }, 650)

          if (typeof showLeaderboard === 'function') {
            showLeaderboard(
              `Solved in ${currentRow + 1} guesses and ${m}:${s}:${ms}`
            )
          }

          if (!user && gameType === 'daily') {
            localStorage.setItem(
              'wordle_last_result',
              JSON.stringify({
                userId: `anon-${getTodayIST()}`,
                name: 'You',
                date: getTodayIST(),
                tries: currentRow + 1,
                timeTaken: timer,
              })
            )
          }

          return
        }

        if (currentRow === 5) {
          setMessage(`Game Over!\nThe word was ${wordOfTheDay}.`)
          setRowAnimation((prev) => ({ ...prev, [currentRow]: 'shake' }))
          return
        }

        setCurrentRow((prev) => prev + 1)
        setCurrentCol(0)
        setRowAnimation((prev) => ({ ...prev, [currentRow]: 'shake' }))
      })
  }

  const handleKeyboardClick = (key) => {
    if (typeof playKeypadClick === 'function' && soundOn) {
      playKeypadClick()
    }

    if (key === 'ENTER') handleEnter()
    else if (key === 'BACKSPACE') handleBackspace()
    else handleLetter(key)

    focusInput()
  }

  const handleKeyDown = (event) => {
    if (showHowToPlay) return

    const key = event.key.toUpperCase()
    event.preventDefault()

    if (key === 'BACKSPACE') handleBackspace()
    else if (key === 'ENTER') handleEnter()
    else if (/^[A-Z]$/.test(key)) handleLetter(key)
  }

  return (
    <div className="wordle-page">
      <div className="wordle-topbar">
        <div className="wordle-brand">Wordle Street</div>
      </div>

      <button
        type="button"
        className="wordle-howto-button"
        onClick={() => setShowHowToPlay(true)}
      >
        How to Play
      </button>

      <div className="wordle-shell">
        <h1 className="wordle-title">Guess the word</h1>

        <div
          className="wordle-container"
          role="application"
          aria-label="Wordle game"
          onClick={focusInput}
        >
          <input
            ref={inputRef}
            className="wordle-hidden-input"
            onKeyDown={handleKeyDown}
            inputMode="none"
            readOnly
            tabIndex={-1}
            autoFocus
          />

          <div className="wordle-panel">
            <div className="wordle-grid">
              {grid.map((row, rowIdx) => (
                <div
                  className={`wordle-row ${rowAnimation[rowIdx] || ''}`}
                  key={rowIdx}
                  onAnimationEnd={() =>
                    setRowAnimation((prev) => ({ ...prev, [rowIdx]: '' }))
                  }
                >
                  {row.map((cell, colIdx) => (
                    <div
                      className={`wordle-cell ${
                        statusGrid[rowIdx][colIdx]
                          ? `flip ${statusGrid[rowIdx][colIdx]}`
                          : ''
                      }`}
                      key={colIdx}
                    >
                      {cell}
                      {rowIdx === currentRow &&
                        colIdx === currentCol &&
                        currentCol < 5 &&
                        !finished && <span className="typing-cursor" />}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="wordle-keyboard">
              {QWERTY_ROWS.map((row, rowIndex) => (
                <div className="wordle-key-row" key={rowIndex}>
                  {rowIndex === 2 && (
                    <button
                      type="button"
                      className="wordle-key special"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleKeyboardClick('ENTER')}
                    >
                      ENTER
                    </button>
                  )}

                  {row.map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={`wordle-key ${keyboardStatus[key] || ''}`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleKeyboardClick(key)}
                      disabled={finished}
                    >
                      {key}
                    </button>
                  ))}

                  {rowIndex === 2 && (
                    <button
                      type="button"
                      className="wordle-key special"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleKeyboardClick('BACKSPACE')}
                    >
                      DEL
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="wordle-timer">
              <span>{timerParts.m}</span>
              <span>:</span>
              <span>{timerParts.s}</span>
              <span>:</span>
              <span>{timerParts.ms}</span>
            </div>
          </div>
        </div>
      </div>

      {message && !finished && <div className="wordle-popup-message">{message}</div>}

      {finished && (
        <div className="wordle-result-overlay">
          <div
            className={`wordle-result-card ${
              message.startsWith('Congratulations!') ? 'success' : 'failure'
            }`}
          >
            {message.split('\n').map((line) => (
              <div key={line}>{line}</div>
            ))}
            <button
              type="button"
              className="wordle-titlepage-btn"
              onClick={() => {
                if (typeof onCloseGame === 'function') onCloseGame()
                restartGame()
              }}
            >
              Go Back Home
            </button>
          </div>
        </div>
      )}

      {showHowToPlay && (
        <div className="wordle-modal-overlay" onClick={() => setShowHowToPlay(false)}>
          <div
            className="wordle-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>How to Play</h2>
            <p>Guess the 5-letter finance-themed word in 6 tries.</p>
            <p>Green means the letter is in the correct place.</p>
            <p>Yellow means the letter is in the word but in a different spot.</p>
            <p>Gray means the letter is not in the word.</p>
            <button
              type="button"
              className="wordle-titlepage-btn"
              onClick={() => setShowHowToPlay(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {coins.length > 0 && (
        <div className="coin-layer">
          {coins.map((coin) => (
            <div
              key={coin.id}
              className="coin"
              style={{
                '--delay': `${coin.delay}ms`,
                '--stack': coin.stack,
              }}
            >
              $
            </div>
          ))}
        </div>
      )}

      {confetti.length > 0 && (
        <div className="wordle-confetti-layer" aria-hidden="true">
          {confetti.map((piece) => (
            <span
              key={piece.id}
              className="wordle-confetti"
              style={{
                left: `${piece.left}%`,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                transform: `rotate(${piece.rotation}deg)`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Wordle
