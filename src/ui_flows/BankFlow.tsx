import { useEffect, useMemo, useState } from 'react'

import { FaCoins } from 'react-icons/fa'
import { useGameStore } from '@client/stores/gameStore'
import { GLOBAL_COMPANION } from '@client/config/CompanionConfig'
import {
  BANK_TOPICS,
  TOTAL_BANK_TOPICS,
  BankTopicId,
  QuizResult,
  evaluateAnswer,
} from './bankStoryEngine'

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

    // Award coins + XP
    if (quizResult?.isCorrect) {
      setTotalCoins((prev) => prev + currentTopic.rewardCoins)
      useGameStore.getState().addPoints(currentTopic.rewardCoins)
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
    <div className='bg-[#0a0a0a] min-h-[80vh] p-4 space-y-4'>
      {/* -- Header -- */}
      <div className='flex items-center justify-between border-b-2 border-neutral-700 pb-4'>
        <div>
          <p className='uppercase tracking-[0.2em] text-xs text-[#00ff88] font-mono'>FinQuest Bank</p>
          <h3 className='mt-1 text-2xl font-black uppercase tracking-tight text-white'>Banking Education Module</h3>
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex gap-1.5' title='Topic progress'>
            {BANK_TOPICS.map((t) => (
              <div
                key={t.id}
                className={`w-3 h-3 border-2 ${completedTopics.has(t.id) ? 'bg-[#00ff88] border-[#00ff88]' : 'bg-transparent border-neutral-600'}`}
                title={t.title}
              />
            ))}
          </div>
          <div className='flex items-center gap-2 border-2 border-[#ffcc00] bg-black px-3 py-1.5'>
            <FaCoins className='text-[#ffcc00]' />
            <span className='text-lg font-bold text-[#ffcc00] font-mono'>{totalCoins}</span>
            <span className='text-xs text-neutral-500 uppercase tracking-wider font-mono'>coins</span>
          </div>
        </div>
      </div>

      {/* -- Manager / Companion dialogue row -- */}
      <div className='flex gap-4 items-start'>
        <img
          src={topSpeakerImage}
          alt={topSpeakerName}
          className='w-20 h-20 object-cover border-2 border-[#00ff88] rounded-none flex-shrink-0'
        />

        <div className='bg-black border-2 border-neutral-700 p-4 flex-1'>
          <span className='bg-[#00ff88] text-black font-mono font-bold text-xs uppercase px-2 py-1 inline-block'>{topSpeakerName}</span>
          <p className='font-mono text-sm text-neutral-300 mt-3 leading-relaxed'>
            {typedText}
            <span className='inline-block w-0.5 h-4 bg-[#00ff88] ml-0.5 animate-pulse' />
          </p>

          {/* Stage-specific content inside dialogue box */}
          {stage === 'welcome' && (
            <button
              type='button'
              onClick={() => setStage('topic-select')}
              className='mt-4 bg-[#00ff88] text-black font-bold uppercase tracking-wider text-sm border-2 border-[#00ff88] px-4 py-2 rounded-none shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all'
            >
              Let's explore
            </button>
          )}

          {stage === 'module-intro' && (
            <button
              type='button'
              onClick={() => setStage('quiz')}
              className='mt-4 bg-[#00ff88] text-black font-bold uppercase tracking-wider text-sm border-2 border-[#00ff88] px-4 py-2 rounded-none shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all'
            >
              Take the quiz
            </button>
          )}

          {stage === 'quiz-feedback' && (
            <button
              type='button'
              onClick={() => setStage('simulation')}
              className='mt-4 bg-[#00ff88] text-black font-bold uppercase tracking-wider text-sm border-2 border-[#00ff88] px-4 py-2 rounded-none shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all'
            >
              See real example
            </button>
          )}

          {stage === 'simulation' && currentTopic && (
            <>
              <div className='mt-4 border-2 border-neutral-700 bg-[#111] p-3'>
                <p className='text-sm text-neutral-300 font-mono leading-relaxed'>
                  {currentTopic.simulation.result}
                </p>
                {currentTopic.simulation.formula && (
                  <span className='inline-block mt-2 font-mono text-xs text-[#00ff88] bg-black border border-neutral-800 px-2 py-1'>{currentTopic.simulation.formula}</span>
                )}
              </div>
              <button
                type='button'
                onClick={() => setStage('topic-complete')}
                className='mt-4 bg-[#00ff88] text-black font-bold uppercase tracking-wider text-sm border-2 border-[#00ff88] px-4 py-2 rounded-none shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all'
              >
                Continue
              </button>
            </>
          )}

          {stage === 'topic-complete' && (
            <>
              {quizResult?.isCorrect && (
                <div className='mt-4 flex items-center gap-3 border-2 border-[#ffcc00] bg-black p-3'>
                  <div className='text-3xl'>&#x1FA99;</div>
                  <div className='font-mono font-bold text-[#ffcc00]'>+{currentTopic?.rewardCoins} coins!</div>
                </div>
              )}
              <button
                type='button'
                onClick={handleTopicComplete}
                className='mt-4 bg-[#00ff88] text-black font-bold uppercase tracking-wider text-sm border-2 border-[#00ff88] px-4 py-2 rounded-none shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all'
              >
                {completedTopics.size + 1 >= TOTAL_BANK_TOPICS ? 'See summary' : 'Choose another topic'}
              </button>
            </>
          )}

          {stage === 'all-done' && (
            <div className='mt-4 border-2 border-[#ffcc00] bg-black p-4 text-center space-y-2'>
              <div className='text-5xl'>&#x1F3C6;</div>
              <div className='font-mono font-bold text-[#ffcc00] text-xl'>{totalCoins} coins earned!</div>
              <p className='text-sm text-neutral-500 font-mono'>You have mastered all banking concepts.</p>
            </div>
          )}
        </div>
      </div>

      {/* -- Player dialogue row -- */}
      <div className='flex gap-4 items-start flex-row-reverse'>
        <img
          src={playerAvatar}
          alt={playerName}
          className='w-16 h-16 object-cover border-2 border-neutral-700 rounded-none flex-shrink-0'
        />

        <div className='bg-[#111] border-2 border-neutral-700 p-4 flex-1'>
          <span className='bg-neutral-700 text-white font-mono font-bold text-xs uppercase px-2 py-1 inline-block'>{playerName}</span>

          {stage === 'welcome' && (
            <p className='text-sm text-neutral-400 italic mt-3 font-mono'>
              Hello! I'd like to learn more about banking and finance.
            </p>
          )}

          {stage === 'topic-select' && (
            <div className='mt-3'>
              <p className='mb-3 text-sm text-neutral-400 font-mono'>Pick a topic to learn:</p>
              <div className='grid grid-cols-2 gap-3'>
                {BANK_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    type='button'
                    disabled={completedTopics.has(topic.id)}
                    onClick={() => handleTopicSelect(topic.id)}
                    className={`bg-black border-2 p-4 text-left uppercase tracking-wider cursor-pointer transition-all ${completedTopics.has(topic.id) ? 'border-[#00ff88] opacity-50 cursor-not-allowed' : 'border-neutral-700 text-white hover:border-[#00ff88] hover:shadow-[3px_3px_0_#00ff88]'}`}
                  >
                    <span className='text-2xl block mb-2'>{topic.icon}</span>
                    <span className='font-mono text-xs font-bold'>{topic.title}</span>
                    {completedTopics.has(topic.id) && (
                      <span className='block mt-1 text-[#00ff88] font-mono text-xs'>DONE</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {stage === 'module-intro' && (
            <p className='text-sm text-neutral-400 italic mt-3 font-mono'>
              That's really helpful! I want to know more.
            </p>
          )}

          {stage === 'quiz' && currentTopic && (
            <div className='mt-3 space-y-2'>
              {currentTopic.question.options.map((option) => {
                const isSelected = selectedAnswer === option.id
                const isCorrectOption = option.id === currentTopic.question.correctId
                let borderColor = 'border-neutral-700'
                let bgColor = 'bg-black'
                if (selectedAnswer) {
                  if (isCorrectOption) {
                    borderColor = 'border-[#00ff88]'
                    bgColor = 'bg-[#00ff88]/10'
                  } else if (isSelected) {
                    borderColor = 'border-[#ff3366]'
                    bgColor = 'bg-[#ff3366]/10'
                  }
                }
                return (
                  <button
                    key={option.id}
                    type='button'
                    disabled={!!selectedAnswer}
                    onClick={() => handleAnswerSelect(option.id)}
                    className={`w-full text-left border-2 ${borderColor} ${bgColor} p-3 font-mono text-sm text-white cursor-pointer hover:border-[#00ff88] transition-all`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          )}

          {(stage === 'quiz-feedback' || stage === 'simulation' || stage === 'topic-complete') && (
            <p className='text-sm text-neutral-400 italic mt-3 font-mono'>
              {quizResult?.isCorrect
                ? 'I got it! That makes total sense now.'
                : "I see -- I didn't know that. I'll remember it now."}
            </p>
          )}

          {stage === 'all-done' && (
            <p className='text-sm text-[#00ff88] italic font-mono font-medium mt-3'>
              I feel financially educated! Thank you so much!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
