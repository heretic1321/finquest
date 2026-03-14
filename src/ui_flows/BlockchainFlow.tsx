import { useEffect, useMemo, useState } from 'react'

import { FaCoins, FaExclamationTriangle, FaLink, FaLock } from 'react-icons/fa'
import { GLOBAL_COMPANION } from '@client/config/CompanionConfig'
import {
  BLOCKCHAIN_QUIZ,
  GENESIS_HASH,
  MINIGAME_REWARD_COINS,
  PENDING_TRANSACTIONS,
  UNCLE_CHUNK_DIALOGUES,
  makeVisualHash,
} from './blockchainStoryEngine'
import { launchUnityGame } from '@client/utils/unityLauncher'
import { useGameStore } from '@client/stores/gameStore'

type Stage = 'intro' | 'quiz' | 'quiz-feedback' | 'minigame-intro' | 'minigame' | 'complete'

type ChainBlock = {
  blockNum: number
  transaction: string
  hash: string
  prevHash: string
  tampered: boolean
}

const getPlayerName = () => {
  try {
    const raw = localStorage.getItem('finquest_player')
    if (!raw) return 'You'
    const parsed = JSON.parse(raw) as { name?: string }
    return parsed?.name?.trim() || 'You'
  } catch {
    return 'You'
  }
}

const getPlayerAvatar = () => {
  try {
    const raw = localStorage.getItem('finquest_player')
    if (!raw) return '/assets/ui/avatars/player_avatar_male.png'
    const parsed = JSON.parse(raw) as { avatarPath?: string }
    return parsed?.avatarPath || '/assets/ui/avatars/player_avatar_male.png'
  } catch {
    return '/assets/ui/avatars/player_avatar_male.png'
  }
}

const MINIGAME_INTRO_LINE =
  "Now beta, let me show you something fun. We will BUILD a blockchain together! Validate each pending transaction and add it to the chain. Try pressing 'Tamper' on any block to see what happens to the whole chain!"

export default function BlockchainFlow() {
  const [stage, setStage] = useState<Stage>('intro')
  const [dialogueIndex, setDialogueIndex] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [totalCoins, setTotalCoins] = useState(0)

  // Mini-game state
  const [chain, setChain] = useState<ChainBlock[]>([
    {
      blockNum: 0,
      transaction: 'Genesis Block — The chain begins here',
      hash: GENESIS_HASH,
      prevHash: '—',
      tampered: false,
    },
  ])
  const [pendingIndex, setPendingIndex] = useState(0)
  const [tamperedBlockNum, setTamperedBlockNum] = useState<number | null>(null)
  const [showTamperWarning, setShowTamperWarning] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)

  const playerName = useMemo(() => getPlayerName(), [])
  const playerAvatar = useMemo(() => getPlayerAvatar(), [])
  const currentDialogue = UNCLE_CHUNK_DIALOGUES[dialogueIndex]

  // Laxmi narrates during mini-game intro, Uncle Chunk handles everything else
  const isLaxmiSpeaking = stage === 'minigame-intro'
  const topSpeakerName = isLaxmiSpeaking ? GLOBAL_COMPANION.name : 'Uncle Chunk'
  const topSpeakerImage = isLaxmiSpeaking
    ? GLOBAL_COMPANION.imagePath
    : '/assets/ui/blockchain/sharma_ji.png'

  // Compute what the top speaker says for typewriter
  const speakerLine = useMemo(() => {
    if (stage === 'intro') return currentDialogue.text
    if (stage === 'quiz') return BLOCKCHAIN_QUIZ.question
    if (stage === 'quiz-feedback') {
      return isCorrect
        ? `Exactly right, beta! ${BLOCKCHAIN_QUIZ.explanation}`
        : `Hmm, not quite. ${BLOCKCHAIN_QUIZ.explanation}`
    }
    if (stage === 'minigame-intro') return MINIGAME_INTRO_LINE
    if (stage === 'complete')
      return `Shabash beta! You have built a blockchain with ${chain.length} blocks! You have seen immutability in action — once data is added, changing any block breaks the entire chain. That is the power of blockchain technology!`
    return ''
  }, [stage, currentDialogue, isCorrect, chain.length])

  // Typewriter effect
  useEffect(() => {
    if (!speakerLine) {
      setTypedText('')
      return
    }
    setTypedText('')
    let i = 0
    const t = window.setInterval(() => {
      i += 1
      setTypedText(speakerLine.slice(0, i))
      if (i >= speakerLine.length) window.clearInterval(t)
    }, 16)
    return () => window.clearInterval(t)
  }, [speakerLine])

  const goNextDialogue = () => {
    if (dialogueIndex < UNCLE_CHUNK_DIALOGUES.length - 1) {
      setDialogueIndex((prev) => prev + 1)
    } else {
      setStage('quiz')
    }
  }

  const handleAnswer = (optionId: string) => {
    if (selectedAnswer) return
    const correct = optionId === BLOCKCHAIN_QUIZ.correctId
    setSelectedAnswer(optionId)
    setIsCorrect(correct)
    if (correct) {
      setTotalCoins((prev) => prev + BLOCKCHAIN_QUIZ.rewardCoins)
      useGameStore.getState().addPoints(BLOCKCHAIN_QUIZ.rewardCoins)
    }
    setStage('quiz-feedback')
  }

  // Mini-game: validate & add pending block
  const handleValidateBlock = () => {
    if (pendingIndex >= PENDING_TRANSACTIONS.length) return
    const pending = PENDING_TRANSACTIONS[pendingIndex]
    const prevBlock = chain[chain.length - 1]
    const rawHash = makeVisualHash(pending.transaction + prevBlock.hash + String(chain.length))
    const newBlock: ChainBlock = {
      blockNum: chain.length,
      transaction: pending.transaction,
      hash: rawHash.slice(0, 16).toUpperCase(),
      prevHash: prevBlock.hash,
      tampered: false,
    }
    const newChain = [...chain, newBlock]
    setChain(newChain)
    const nextIndex = pendingIndex + 1
    setPendingIndex(nextIndex)
    if (nextIndex >= PENDING_TRANSACTIONS.length) {
      setTotalCoins((prev) => prev + MINIGAME_REWARD_COINS)
      setGameComplete(true)
    }
  }

  // Mini-game: tamper demo
  const handleTamper = (blockNum: number) => {
    if (blockNum === 0) return
    setTamperedBlockNum(blockNum)
    setShowTamperWarning(true)
    setChain((prev) => prev.map((b) => ({ ...b, tampered: b.blockNum >= blockNum })))
  }

  // Repair the chain
  const handleRepair = () => {
    setChain((prev) => prev.map((b) => ({ ...b, tampered: false })))
    setTamperedBlockNum(null)
    setShowTamperWarning(false)
  }

  return (
    <div className='bg-[#0a0a0a] min-h-[80vh] p-4 space-y-4'>
      {/* -- Header -- */}
      <div className='flex items-center justify-between border-b-2 border-neutral-700 pb-4'>
        <div>
          <p className='uppercase tracking-[0.2em] text-xs text-[#00ff88] font-mono'>Blockchain Domain</p>
          <h3 className='mt-1 text-2xl font-black uppercase tracking-tight text-white'>
            Learn Blockchain with Uncle Chunk
          </h3>
        </div>
        <div className='flex items-center gap-2 border-2 border-[#ffcc00] bg-black px-3 py-1.5'>
          <FaCoins className='text-[#ffcc00]' />
          <span className='text-lg font-bold text-[#ffcc00] font-mono'>{totalCoins}</span>
          <span className='text-xs text-neutral-500 uppercase tracking-wider font-mono'>coins</span>
        </div>
      </div>

      {/* -- NPC / Companion dialogue row (hidden during mini-game) -- */}
      {stage !== 'minigame' && (
        <div className='flex gap-4 items-start'>
          <img
            src={topSpeakerImage}
            alt={topSpeakerName}
            className='w-20 h-20 object-cover border-2 border-[#00ff88] rounded-none flex-shrink-0'
          />

          <div className='bg-black border-2 border-neutral-700 p-4 flex-1'>
            <span className='bg-[#ffcc00] text-black font-mono font-bold text-xs uppercase px-2 py-1 inline-block'>{topSpeakerName}</span>
            <p className='font-mono text-sm text-neutral-300 mt-3 leading-relaxed'>
              {typedText}
              <span className='inline-block w-0.5 h-4 bg-[#00ff88] ml-0.5 animate-pulse' />
            </p>

            {stage === 'intro' && (
              <button type='button' onClick={goNextDialogue} className='mt-4 bg-[#00ff88] text-black font-bold uppercase tracking-wider text-sm border-2 border-[#00ff88] px-4 py-2 rounded-none shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all'>
                Continue
              </button>
            )}

            {stage === 'quiz-feedback' && (
              <button
                type='button'
                onClick={() => {
                  launchUnityGame()
                  setStage('complete')
                }}
                className='mt-4 bg-[#00ff88] text-black font-bold uppercase tracking-wider text-sm border-2 border-[#00ff88] px-4 py-2 rounded-none shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all'
              >
                Play the Dungeon Game
              </button>
            )}

            {stage === 'complete' && (
              <div className='mt-4 flex items-center gap-3 border-2 border-[#ffcc00] bg-black p-3'>
                <span className='text-3xl'>&#x26D3;&#xFE0F;</span>
                <div>
                  <span className='font-mono font-bold text-[#ffcc00]'>+{MINIGAME_REWARD_COINS} coins</span>
                  <p className='text-xs text-neutral-500 font-mono mt-0.5'>Mini-game complete!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -- Player row (hidden during mini-game) -- */}
      {stage !== 'minigame' && (
        <div className='flex gap-4 items-start flex-row-reverse'>
          <img
            src={playerAvatar}
            alt={playerName}
            className='w-16 h-16 object-cover border-2 border-neutral-700 rounded-none flex-shrink-0'
          />

          <div className='bg-[#111] border-2 border-neutral-700 p-4 flex-1'>
            <span className='bg-neutral-700 text-white font-mono font-bold text-xs uppercase px-2 py-1 inline-block'>{playerName}</span>

            {stage === 'intro' && (
              <p className='text-sm text-neutral-400 italic mt-3 font-mono'>
                Tell me more, Uncle Chunk! I want to understand.
              </p>
            )}

            {stage === 'quiz' && (
              <div className='mt-3 space-y-2'>
                {BLOCKCHAIN_QUIZ.options.map((option) => {
                  let borderColor = 'border-neutral-700'
                  let bgColor = 'bg-black'
                  if (selectedAnswer) {
                    if (option.id === BLOCKCHAIN_QUIZ.correctId) {
                      borderColor = 'border-[#00ff88]'
                      bgColor = 'bg-[#00ff88]/10'
                    } else if (option.id === selectedAnswer) {
                      borderColor = 'border-[#ff3366]'
                      bgColor = 'bg-[#ff3366]/10'
                    }
                  }
                  return (
                    <button
                      key={option.id}
                      type='button'
                      disabled={!!selectedAnswer}
                      onClick={() => handleAnswer(option.id)}
                      className={`w-full text-left border-2 ${borderColor} ${bgColor} p-3 font-mono text-sm text-white cursor-pointer hover:border-[#00ff88] transition-all`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            )}

            {stage === 'quiz-feedback' && (
              <p className='text-sm text-neutral-400 italic mt-3 font-mono'>
                {isCorrect ? 'Oh that makes perfect sense!' : 'Ah, I understand now. Thank you!'}
              </p>
            )}

            {stage === 'complete' && (
              <p className='text-sm text-[#00ff88] italic font-mono font-medium mt-3'>
                I can see why tampering is impossible -- the whole chain breaks!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Mini-game replaced by Unity dungeon game — launched via button above */}
    </div>
  )
}
