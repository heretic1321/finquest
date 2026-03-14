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
import './blockchainFlow.css'

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
    : '/assets/ui/blockchain/uncle_chunk.png'
  const topPortraitClass = isLaxmiSpeaking ? 'blockchain-companion-portrait' : 'blockchain-npc-portrait'

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
    if (correct) setTotalCoins((prev) => prev + BLOCKCHAIN_QUIZ.rewardCoins)
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
    <div className='blockchain-screen'>
      {/* ── Header ── */}
      <div className='blockchain-header'>
        <div>
          <p className='text-xs uppercase tracking-[0.2em] text-cyan-400'>Blockchain Domain</p>
          <h3 className='mt-1 text-2xl font-semibold text-white'>
            Learn Blockchain with Uncle Chunk
          </h3>
        </div>
        <div className='blockchain-coin-counter'>
          <FaCoins className='text-yellow-400' />
          <span className='text-lg font-bold text-yellow-100'>{totalCoins}</span>
          <span className='text-xs text-yellow-300'>coins</span>
        </div>
      </div>

      {/* ── NPC / Companion dialogue row (hidden during mini-game) ── */}
      {stage !== 'minigame' && (
        <div className='blockchain-npc-row'>
          <img src={topSpeakerImage} alt={topSpeakerName} className={topPortraitClass} />

          <div className='blockchain-dialogue-box'>
            <p className='blockchain-speaker-tag'>{topSpeakerName}</p>
            <p className='blockchain-dialogue-text'>
              {typedText}
              <span className='blockchain-type-cursor' />
            </p>

            {stage === 'intro' && (
              <button type='button' onClick={goNextDialogue} className='blockchain-continue-btn'>
                Continue →
              </button>
            )}

            {stage === 'quiz-feedback' && (
              <button
                type='button'
                onClick={() => setStage('minigame-intro')}
                className='blockchain-continue-btn'
              >
                Show me the mini-game →
              </button>
            )}

            {stage === 'minigame-intro' && (
              <button
                type='button'
                onClick={() => setStage('minigame')}
                className='blockchain-continue-btn'
              >
                Build the Blockchain! →
              </button>
            )}

            {stage === 'complete' && (
              <div className='blockchain-reward-popup'>
                <span className='text-3xl'>⛓️</span>
                <div>
                  <span className='reward-coins-big'>+{MINIGAME_REWARD_COINS} coins</span>
                  <p className='text-xs text-cyan-300 mt-0.5'>Mini-game complete!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Player row (hidden during mini-game) ── */}
      {stage !== 'minigame' && (
        <div className='blockchain-player-row'>
          <div className='blockchain-player-dialogue'>
            <p className='blockchain-player-tag'>{playerName}</p>

            {stage === 'intro' && (
              <p className='text-sm text-slate-300 italic'>
                Tell me more, Uncle Chunk! I want to understand.
              </p>
            )}

            {stage === 'quiz' && (
              <div className='blockchain-options-wrap'>
                {BLOCKCHAIN_QUIZ.options.map((option) => {
                  let cls = 'blockchain-option-btn'
                  if (selectedAnswer) {
                    if (option.id === BLOCKCHAIN_QUIZ.correctId) cls += ' correct'
                    else if (option.id === selectedAnswer) cls += ' wrong'
                  }
                  return (
                    <button
                      key={option.id}
                      type='button'
                      disabled={!!selectedAnswer}
                      onClick={() => handleAnswer(option.id)}
                      className={cls}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            )}

            {stage === 'quiz-feedback' && (
              <p className='text-sm text-slate-300 italic'>
                {isCorrect ? 'Oh that makes perfect sense! 🎉' : 'Ah, I understand now. Thank you!'}
              </p>
            )}

            {stage === 'minigame-intro' && (
              <p className='text-sm text-slate-300 italic'>
                I want to try building a blockchain myself!
              </p>
            )}

            {stage === 'complete' && (
              <p className='text-sm text-cyan-300 italic font-medium'>
                I can see why tampering is impossible — the whole chain breaks! ⛓️
              </p>
            )}
          </div>

          <img
            src={playerAvatar}
            alt={playerName}
            className='blockchain-user-portrait'
          />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MINI-GAME
      ════════════════════════════════════════════════════════════════════ */}
      {stage === 'minigame' && (
        <div className='blockchain-minigame'>
          <div className='minigame-header'>
            <p className='text-xs uppercase tracking-widest text-cyan-400'>
              Build the Blockchain — Mini Game
            </p>
            <h4 className='mt-1 text-lg font-bold text-white'>
              {gameComplete
                ? '✅ Chain Complete! All transactions validated.'
                : `Validate and add Block #${pendingIndex + 1} of ${PENDING_TRANSACTIONS.length}`}
            </h4>
            <p className='text-xs text-slate-400 mt-0.5'>
              Click <span className='text-cyan-400 font-semibold'>Validate & Add</span> to extend
              the chain · Click{' '}
              <span className='text-red-400 font-semibold'>Tamper</span> on any block to see
              immutability in action
            </p>
          </div>

          {/* Tamper warning */}
          {showTamperWarning && (
            <div className='tamper-warning'>
              <FaExclamationTriangle className='text-red-400 text-xl flex-shrink-0' />
              <div>
                <p className='font-semibold text-red-300'>Chain Broken!</p>
                <p className='text-xs text-red-200'>
                  Modifying Block #{tamperedBlockNum} invalidated{' '}
                  {chain.filter((b) => b.tampered).length} block
                  {chain.filter((b) => b.tampered).length > 1 ? 's' : ''} after it. This is why
                  blockchain data is immutable!
                </p>
              </div>
              <button type='button' onClick={handleRepair} className='repair-btn'>
                🔧 Repair Chain
              </button>
            </div>
          )}

          {/* Chain visualization */}
          <div className='chain-scroll-wrap'>
            <div className='chain-blocks'>
              {chain.map((block, idx) => (
                <div key={block.blockNum} className='chain-item'>
                  <div className={`chain-block ${block.tampered ? 'invalid' : 'valid'}`}>
                    <div className='block-top'>
                      <span className='block-num'>Block #{block.blockNum}</span>
                      {block.blockNum === 0 && (
                        <span className='genesis-badge'>Genesis</span>
                      )}
                      {block.tampered && <span className='invalid-badge'>INVALID</span>}
                    </div>

                    <div className='block-body'>
                      <p className='block-tx'>{block.transaction}</p>
                      <div className='block-hashes'>
                        <p className='hash-line'>
                          <span className='hash-label'>PREV</span>
                          <span className='hash-val'>
                            {block.prevHash === '—'
                              ? '—'
                              : `${block.prevHash.slice(0, 8)}…`}
                          </span>
                        </p>
                        <p className='hash-line'>
                          <span className='hash-label'>HASH</span>
                          <span
                            className={`hash-val ${block.tampered ? 'text-red-400' : ''}`}
                          >
                            {block.tampered ? '????????…' : `${block.hash.slice(0, 8)}…`}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Tamper button — only on non-genesis, non-tampered blocks when chain is healthy */}
                    {block.blockNum > 0 && !block.tampered && !tamperedBlockNum && !gameComplete && (
                      <button
                        type='button'
                        onClick={() => handleTamper(block.blockNum)}
                        className='tamper-btn'
                      >
                        Tamper ⚠
                      </button>
                    )}

                    {/* Lock/alert icon */}
                    <div className='lock-icon'>
                      {block.tampered ? (
                        <FaExclamationTriangle className='text-red-500' />
                      ) : (
                        <FaLock className='text-cyan-500' />
                      )}
                    </div>
                  </div>

                  {/* Chain link connector */}
                  {idx < chain.length - 1 && (
                    <div className={`chain-link ${chain[idx + 1].tampered ? 'broken' : ''}`}>
                      <FaLink />
                    </div>
                  )}
                </div>
              ))}

              {/* Pending block preview */}
              {!gameComplete &&
                pendingIndex < PENDING_TRANSACTIONS.length &&
                !showTamperWarning && (
                  <div className='chain-item'>
                    <div className='chain-link pending-link'>
                      <FaLink />
                    </div>
                    <div className='chain-block pending'>
                      <div className='block-top'>
                        <span className='block-num'>Block #{chain.length}</span>
                        <span className='pending-badge'>Pending</span>
                      </div>
                      <div className='block-body'>
                        <p className='block-tx'>
                          {PENDING_TRANSACTIONS[pendingIndex].transaction}
                        </p>
                        <p className='text-xs text-slate-400 mt-1'>
                          Awaiting your validation...
                        </p>
                      </div>
                      <button
                        type='button'
                        onClick={handleValidateBlock}
                        className='validate-btn'
                      >
                        ✓ Validate & Add
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Game complete bar */}
          {gameComplete && (
            <div className='game-complete-bar'>
              <span className='text-3xl'>🏆</span>
              <div>
                <p className='font-bold text-white'>Blockchain successfully built!</p>
                <p className='text-sm text-cyan-300'>
                  +{MINIGAME_REWARD_COINS} coins earned for completing the mini-game
                </p>
              </div>
              <button
                type='button'
                onClick={() => setStage('complete')}
                className='blockchain-continue-btn'
              >
                Finish →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
