import { useEffect, useMemo, useState } from 'react'

import { FaCoins } from 'react-icons/fa'
import { GLOBAL_COMPANION } from '@client/config/CompanionConfig'
import {
  BANK_TOPICS,
  TOTAL_BANK_TOPICS,
  BankTopicId,
  QuizResult,
  evaluateAnswer,
} from './bankStoryEngine'
import './bankFlow.css'

type Stage =
  | 'welcome'
  | 'topic-select'
  | 'module-intro'
  | 'quiz'
  | 'quiz-feedback'
  | 'simulation'
  | 'topic-complete'
  | 'all-done'

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

const WELCOME_LINE =
  "Welcome to FinQuest Bank! I'm your Bank Manager. What financial topic would you like to explore today?"

export default function BankFlow() {
  const [stage, setStage] = useState<Stage>('welcome')
  const [activeTopic, setActiveTopic] = useState<BankTopicId | null>(null)
  const [completedTopics, setCompletedTopics] = useState<Set<BankTopicId>>(new Set())
  const [totalCoins, setTotalCoins] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [typedText, setTypedText] = useState('')

  const playerName = useMemo(() => getPlayerName(), [])
  const playerAvatar = useMemo(() => getPlayerAvatar(), [])
  const currentTopic = useMemo(
    () => (activeTopic ? BANK_TOPICS.find((t) => t.id === activeTopic) ?? null : null),
    [activeTopic],
  )

  // Bank Manager speaks in most stages; Laxmi narrates during topic-select overview
  const isManagerSpeaking = stage !== 'topic-select' && stage !== 'all-done'

  const topSpeakerName = isManagerSpeaking ? 'Bank Manager' : GLOBAL_COMPANION.name
  const topSpeakerImage = isManagerSpeaking
    ? '/assets/ui/bank/bank_manager.png'
    : GLOBAL_COMPANION.imagePath
  const topPortraitClass = isManagerSpeaking ? 'bank-manager-portrait' : 'bank-companion-portrait'

  // Compute what the top speaker says for typewriter
  const speakerLine = useMemo(() => {
    if (stage === 'welcome') return WELCOME_LINE
    if (stage === 'topic-select')
      return 'Great choice! Select a topic below and I will guide you through it step by step.'
    if (stage === 'module-intro' && currentTopic) return currentTopic.managerIntro
    if (stage === 'quiz' && currentTopic) return currentTopic.question.text
    if (stage === 'quiz-feedback' && quizResult) {
      return quizResult.isCorrect
        ? `Excellent! That is correct. ${quizResult.explanation}`
        : `Not quite right. ${quizResult.explanation}`
    }
    if (stage === 'simulation' && currentTopic) return currentTopic.simulation.description
    if (stage === 'topic-complete' && currentTopic) {
      return quizResult?.isCorrect
        ? `Well done! You have earned ${currentTopic.rewardCoins} coins for completing the ${currentTopic.title} module!`
        : `You have completed the ${currentTopic.title} module. Review the lesson and try again to earn coins!`
    }
    if (stage === 'all-done')
      return `Outstanding! You have completed all four modules and earned ${totalCoins} coins. You are now ready to navigate the financial world with confidence!`
    return ''
  }, [stage, currentTopic, quizResult, totalCoins])

  // Typewriter effect
  useEffect(() => {
    if (!speakerLine) {
      setTypedText('')
      return
    }
    setTypedText('')
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setTypedText(speakerLine.slice(0, index))
      if (index >= speakerLine.length) window.clearInterval(timer)
    }, 18)
    return () => window.clearInterval(timer)
  }, [speakerLine])

  const handleTopicSelect = (topicId: BankTopicId) => {
    setActiveTopic(topicId)
    setSelectedAnswer(null)
    setQuizResult(null)
    setStage('module-intro')
  }

  const handleAnswerSelect = (optionId: string) => {
    if (selectedAnswer || !activeTopic) return
    const result = evaluateAnswer(activeTopic, optionId)
    setSelectedAnswer(optionId)
    setQuizResult(result)
    setStage('quiz-feedback')
  }

  const handleTopicComplete = () => {
    if (!activeTopic || !currentTopic) return

    // Award coins
    if (quizResult?.isCorrect) {
      setTotalCoins((prev) => prev + currentTopic.rewardCoins)
    }

    // Mark topic done
    const updatedCompleted = new Set(completedTopics)
    updatedCompleted.add(activeTopic)
    setCompletedTopics(updatedCompleted)

    // Reset per-topic state
    setActiveTopic(null)
    setSelectedAnswer(null)
    setQuizResult(null)

    // Advance
    if (updatedCompleted.size >= TOTAL_BANK_TOPICS) {
      setStage('all-done')
    } else {
      setStage('topic-select')
    }
  }

  return (
    <div className='bank-screen'>
      {/* ── Header ── */}
      <div className='bank-header'>
        <div>
          <p className='text-xs uppercase tracking-[0.2em] text-emerald-700'>FinQuest Bank</p>
          <h3 className='mt-1 text-2xl font-semibold text-stone-800'>Banking Education Module</h3>
        </div>
        <div className='bank-header-meta'>
          <div className='bank-progress' title='Topic progress'>
            {BANK_TOPICS.map((t) => (
              <div
                key={t.id}
                className={`progress-pip ${completedTopics.has(t.id) ? 'done' : ''}`}
                title={t.title}
              />
            ))}
          </div>
          <div className='bank-coin-counter'>
            <FaCoins className='text-amber-600' />
            <span className='text-lg font-bold text-amber-800'>{totalCoins}</span>
            <span className='text-xs text-amber-700'>coins</span>
          </div>
        </div>
      </div>

      {/* ── Manager / Companion dialogue row ── */}
      <div className='bank-convo-row'>
        <img src={topSpeakerImage} alt={topSpeakerName} className={topPortraitClass} />

        <div className='bank-dialogue-box'>
          <p className='bank-speaker-tag'>{topSpeakerName}</p>
          <p className='bank-dialogue-text'>
            {typedText}
            <span className='bank-type-cursor' />
          </p>

          {/* Stage-specific content inside dialogue box */}
          {stage === 'welcome' && (
            <button
              type='button'
              onClick={() => setStage('topic-select')}
              className='bank-continue-btn'
            >
              Let's explore →
            </button>
          )}

          {stage === 'module-intro' && (
            <button
              type='button'
              onClick={() => setStage('quiz')}
              className='bank-continue-btn'
            >
              Take the quiz →
            </button>
          )}

          {stage === 'quiz-feedback' && (
            <button
              type='button'
              onClick={() => setStage('simulation')}
              className='bank-continue-btn'
            >
              See real example →
            </button>
          )}

          {stage === 'simulation' && currentTopic && (
            <>
              <div className='sim-box'>
                <p className='text-sm text-emerald-800 leading-relaxed'>
                  {currentTopic.simulation.result}
                </p>
                {currentTopic.simulation.formula && (
                  <span className='sim-formula'>{currentTopic.simulation.formula}</span>
                )}
              </div>
              <button
                type='button'
                onClick={() => setStage('topic-complete')}
                className='bank-continue-btn'
              >
                Continue →
              </button>
            </>
          )}

          {stage === 'topic-complete' && (
            <>
              {quizResult?.isCorrect && (
                <div className='reward-popup'>
                  <div className='text-3xl'>🪙</div>
                  <div className='reward-coins-display'>+{currentTopic?.rewardCoins} coins!</div>
                </div>
              )}
              <button
                type='button'
                onClick={handleTopicComplete}
                className='bank-continue-btn'
              >
                {completedTopics.size + 1 >= TOTAL_BANK_TOPICS ? 'See summary →' : 'Choose another topic →'}
              </button>
            </>
          )}

          {stage === 'all-done' && (
            <div className='all-done-wrap'>
              <div className='text-5xl'>🏆</div>
              <div className='all-done-total'>{totalCoins} coins earned!</div>
              <p className='text-sm text-stone-500'>You have mastered all banking concepts.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Player dialogue row ── */}
      <div className='bank-player-row'>
        <div className='bank-player-dialogue'>
          <p className='bank-player-tag'>{playerName}</p>

          {stage === 'welcome' && (
            <p className='text-sm text-stone-600 italic'>
              Hello! I'd like to learn more about banking and finance.
            </p>
          )}

          {stage === 'topic-select' && (
            <div>
              <p className='mb-3 text-sm text-stone-600'>Pick a topic to learn:</p>
              <div className='bank-topic-grid'>
                {BANK_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    type='button'
                    disabled={completedTopics.has(topic.id)}
                    onClick={() => handleTopicSelect(topic.id)}
                    className={`topic-card ${completedTopics.has(topic.id) ? 'completed' : ''}`}
                  >
                    <span className='topic-icon'>{topic.icon}</span>
                    <span className='topic-card-label'>{topic.title}</span>
                    {completedTopics.has(topic.id) && (
                      <span className='topic-done-badge'>✓ Done</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {stage === 'module-intro' && (
            <p className='text-sm text-stone-600 italic'>
              That's really helpful! I want to know more.
            </p>
          )}

          {stage === 'quiz' && currentTopic && (
            <div className='bank-options-wrap'>
              {currentTopic.question.options.map((option) => {
                const isSelected = selectedAnswer === option.id
                const isCorrectOption = option.id === currentTopic.question.correctId
                let extraClass = ''
                if (selectedAnswer) {
                  if (isCorrectOption) extraClass = 'correct'
                  else if (isSelected) extraClass = 'wrong'
                }
                return (
                  <button
                    key={option.id}
                    type='button'
                    disabled={!!selectedAnswer}
                    onClick={() => handleAnswerSelect(option.id)}
                    className={`bank-option-btn ${extraClass}`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          )}

          {(stage === 'quiz-feedback' || stage === 'simulation' || stage === 'topic-complete') && (
            <p className='text-sm text-stone-600 italic'>
              {quizResult?.isCorrect
                ? 'I got it! That makes total sense now. 🎉'
                : "I see — I didn't know that. I'll remember it now."}
            </p>
          )}

          {stage === 'all-done' && (
            <p className='text-sm text-emerald-700 italic font-medium'>
              I feel financially educated! Thank you so much! 🌟
            </p>
          )}
        </div>

        <img
          src={playerAvatar}
          alt={playerName}
          className='bank-user-portrait'
        />
      </div>
    </div>
  )
}
