import { useEffect, useMemo, useRef, useState } from 'react'

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

const cellStatusClasses = {
  correct: 'bg-[#00ff88] border-[#00ff88] text-black',
  present: 'bg-[#ffcc00] border-[#ffcc00] text-black',
  absent: 'bg-neutral-700 border-neutral-700',
}

const keyStatusClasses = {
  correct: 'bg-[#00ff88] border-[#00ff88] text-black',
  present: 'bg-[#ffcc00] border-[#ffcc00] text-black',
  absent: 'bg-neutral-700 border-neutral-700',
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
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Keyframe animations */}
      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes shake-row {
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
          100% { transform: translateX(0); }
        }
        @keyframes dance-row {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-8px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(-4px); }
        }
        @keyframes win-glow {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.35); }
          100% { filter: brightness(1); }
        }
        @keyframes coin-pop {
          0% { transform: translateY(0) scale(0.7); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(calc(-140px - (var(--stack) * 8px))) scale(1.05); opacity: 0; }
        }
        @keyframes confetti-fall {
          100% { transform: translateY(110vh) rotate(540deg); opacity: 0.9; }
        }
        .wordle-shake { animation: shake-row 0.35s ease; }
        .wordle-dance { animation: dance-row 0.55s ease; }
        .wordle-win { animation: win-glow 0.8s ease; }
        .wordle-flip { animation: none; }
      `}</style>

      <div className="absolute top-3 left-5 right-5 flex items-center justify-between z-10">
        <div className="text-white font-black text-sm uppercase tracking-wider">Wordle Street</div>
      </div>

      <button
        type="button"
        className="absolute left-5 bottom-5 z-10 border-2 border-neutral-600 bg-black px-5 py-3 text-white font-mono uppercase tracking-wider text-sm cursor-pointer hover:border-[#00ff88]"
        onClick={() => setShowHowToPlay(true)}
      >
        How to Play
      </button>

      <div className="min-h-screen flex flex-col items-center justify-center pt-16 px-4 pb-4">
        <h1 className="text-[#00ff88] text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
          Guess the word
        </h1>

        <div
          className="outline-none"
          role="application"
          aria-label="Wordle game"
          onClick={focusInput}
        >
          <input
            ref={inputRef}
            className="absolute opacity-0 pointer-events-none"
            onKeyDown={handleKeyDown}
            inputMode="none"
            readOnly
            tabIndex={-1}
            autoFocus
          />

          <div className="w-full max-w-[640px] p-5 bg-[#111] border-2 border-[#00ff88] shadow-[4px_4px_0_#00ff88]">
            <div className="grid gap-1.5 justify-center mb-4">
              {grid.map((row, rowIdx) => (
                <div
                  className={`grid grid-cols-5 gap-1.5 ${
                    rowAnimation[rowIdx] === 'shake'
                      ? 'wordle-shake'
                      : rowAnimation[rowIdx] === 'dance'
                        ? 'wordle-dance'
                        : rowAnimation[rowIdx] === 'win'
                          ? 'wordle-win'
                          : ''
                  }`}
                  key={rowIdx}
                  onAnimationEnd={() =>
                    setRowAnimation((prev) => ({ ...prev, [rowIdx]: '' }))
                  }
                >
                  {row.map((cell, colIdx) => (
                    <div
                      className={`w-[52px] h-[52px] border-2 border-neutral-600 bg-black text-white grid place-items-center text-2xl font-bold font-mono relative uppercase ${
                        statusGrid[rowIdx][colIdx]
                          ? cellStatusClasses[statusGrid[rowIdx][colIdx]] || ''
                          : ''
                      }`}
                      key={colIdx}
                    >
                      {cell}
                      {rowIdx === currentRow &&
                        colIdx === currentCol &&
                        currentCol < 5 &&
                        !finished && (
                          <span
                            className="bg-[#00ff88]"
                            style={{
                              position: 'absolute',
                              bottom: 9,
                              width: 18,
                              height: 3,
                              animation: 'blink 1s infinite',
                            }}
                          />
                        )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 items-center">
              {QWERTY_ROWS.map((row, rowIndex) => (
                <div className="flex gap-2 justify-center" key={rowIndex}>
                  {rowIndex === 2 && (
                    <button
                      type="button"
                      className="min-w-[68px] h-[46px] border-2 border-neutral-700 bg-black text-white text-xs font-bold font-mono cursor-pointer hover:border-[#00ff88] px-1.5"
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
                      className={`min-w-[44px] h-[46px] border-2 border-neutral-700 bg-black text-white text-sm font-bold font-mono cursor-pointer hover:border-[#00ff88] px-1.5 ${
                        keyboardStatus[key]
                          ? keyStatusClasses[keyboardStatus[key]] || ''
                          : ''
                      }`}
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
                      className="min-w-[68px] h-[46px] border-2 border-neutral-700 bg-black text-white text-xs font-bold font-mono cursor-pointer hover:border-[#00ff88] px-1.5"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleKeyboardClick('BACKSPACE')}
                    >
                      DEL
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-center gap-1 text-[#00ff88] text-xl font-mono tabular-nums">
              <span>{timerParts.m}</span>
              <span>:</span>
              <span>{timerParts.s}</span>
              <span>:</span>
              <span>{timerParts.ms}</span>
            </div>
          </div>
        </div>
      </div>

      {message && !finished && (
        <div className="fixed left-1/2 bottom-28 -translate-x-1/2 px-5 py-3 border-2 border-neutral-600 bg-black text-white font-mono z-10">
          {message}
        </div>
      )}

      {finished && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-20 p-6">
          <div
            className={`max-w-lg w-full p-7 bg-[#0a0a0a] text-center text-white font-mono ${
              message.startsWith('Congratulations!')
                ? 'border-2 border-[#00ff88] shadow-[6px_6px_0_#00ff88]'
                : 'border-2 border-[#ff3366] shadow-[6px_6px_0_#ff3366]'
            }`}
          >
            {message.split('\n').map((line) => (
              <div key={line}>{line}</div>
            ))}
            <button
              type="button"
              className="mt-6 bg-[#00ff88] text-black font-bold uppercase tracking-wider text-base border-2 border-[#00ff88] px-5 py-3 cursor-pointer shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              onClick={() => {
                onCloseGame?.()
                restartGame()
              }}
            >
              Go Back Home
            </button>
          </div>
        </div>
      )}

      {showHowToPlay && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-20 p-6"
          onClick={() => setShowHowToPlay(false)}
        >
          <div
            className="max-w-lg w-full bg-[#0a0a0a] border-2 border-[#00ff88] p-7 font-mono text-white"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-[#00ff88] text-2xl font-bold mb-4">How to Play</h2>
            <p className="mb-2.5 leading-relaxed">Guess the 5-letter finance-themed word in 6 tries.</p>
            <p className="mb-2.5 leading-relaxed">Green means the letter is in the correct place.</p>
            <p className="mb-2.5 leading-relaxed">Yellow means the letter is in the word but in a different spot.</p>
            <p className="mb-2.5 leading-relaxed">Gray means the letter is not in the word.</p>
            <button
              type="button"
              className="mt-6 bg-[#00ff88] text-black font-bold uppercase tracking-wider text-base border-2 border-[#00ff88] px-5 py-3 cursor-pointer shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              onClick={() => setShowHowToPlay(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {coins.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[25]">
          {coins.map((coin) => (
            <div
              key={coin.id}
              className="absolute text-[22px]"
              style={{
                left: `calc(50% + (${coin.stack} * 14px) - 42px)`,
                bottom: 110,
                animation: 'coin-pop 1.8s ease-out forwards',
                animationDelay: `${coin.delay}ms`,
                '--stack': coin.stack,
              }}
            >
              $
            </div>
          ))}
        </div>
      )}

      {confetti.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[25]" aria-hidden="true">
          {confetti.map((piece) => (
            <span
              key={piece.id}
              className={`absolute top-[-20px] w-2.5 h-[18px] ${
                piece.left > 50 ? 'bg-[#00ff88]' : 'bg-[#ffcc00]'
              }`}
              style={{
                left: `${piece.left}%`,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                transform: `rotate(${piece.rotation}deg)`,
                animation: `confetti-fall ${piece.duration}s linear ${piece.delay}s forwards`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Wordle
