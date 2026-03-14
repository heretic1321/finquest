import { useEffect, useMemo, useRef, useState } from 'react'

import {
  INTRO_DIALOGUES,
  MISTAKE_QUESTION,
  InsuranceDecision,
  evaluateMistakeAnswer,
  simulateInsuranceDecision,
} from './insuranceStoryEngine'
import { formatRupees } from '@client/stores/gameStore'
import { GLOBAL_COMPANION } from '@client/config/CompanionConfig'
import './hospitalInsurance.css'

type Stage = 'intro' | 'question-1' | 'feedback-1' | 'question-2' | 'simulating' | 'result' | 'summary'

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

export default function HospitalInsuranceFlow() {
  const [stage, setStage] = useState<Stage>('intro')
  const [dialogueIndex, setDialogueIndex] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [selectedMistakeOption, setSelectedMistakeOption] = useState<string | null>(null)
  const [mistakeFeedback, setMistakeFeedback] = useState('')
  const [rewardPoints, setRewardPoints] = useState(0)
  const [playerMoney, setPlayerMoney] = useState(120000)
  const [scenarioResult, setScenarioResult] = useState<{
    title: string
    message: string
    advice: string
    moneyDeducted: number
    insuranceCover: number
  } | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playerName = useMemo(() => getPlayerName(), [])
  const playerAvatar = useMemo(() => getPlayerAvatar(), [])
  const introDialogue = INTRO_DIALOGUES[dialogueIndex]

  const isReenaSpeaking = useMemo(
    () => stage === 'intro' && introDialogue.speaker === 'Woman',
    [stage, introDialogue.speaker],
  )

  const topSpeakerName = isReenaSpeaking ? 'Reena' : GLOBAL_COMPANION.name
  const topSpeakerImage = isReenaSpeaking
    ? '/assets/ui/insurance/reena_crying.png'
    : GLOBAL_COMPANION.imagePath

  const reenaLine = useMemo(() => {
    if (stage === 'intro') return introDialogue.text
    if (stage === 'feedback-1') return mistakeFeedback
    if (stage === 'simulating') return 'Let me quickly simulate what happens in this medical emergency...'
    if (stage === 'result' && scenarioResult) {
      return `${scenarioResult.title}. ${scenarioResult.message}`
    }
    if (stage === 'summary' && scenarioResult) {
      return `Final lesson: ${scenarioResult.advice}`
    }
    if (stage === 'question-1') return 'Can you tell me where we went wrong?'
    if (stage === 'question-2') return 'Now decide what you would do with monthly income of ₹40,000.'
    return ''
  }, [stage, introDialogue.text, mistakeFeedback, scenarioResult])

  useEffect(() => {
    if (!reenaLine) {
      setTypedText('')
      return
    }

    setTypedText('')
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setTypedText(reenaLine.slice(0, index))
      if (index >= reenaLine.length) {
        window.clearInterval(timer)
      }
    }, 18)

    return () => window.clearInterval(timer)
  }, [reenaLine])

  // Background ambient sound — hospital crowd
  useEffect(() => {
    const audio = new Audio('/assets/soundEffect/crowdTalking.mp3')
    audio.loop = true
    audio.volume = 0.25
    audioRef.current = audio
    audio.play().catch(() => {
      // Autoplay blocked – user interaction will not restart it; acceptable
    })
    return () => {
      audio.pause()
      audio.currentTime = 0
      audioRef.current = null
    }
  }, [])

  const goNextDialogue = () => {
    if (dialogueIndex < INTRO_DIALOGUES.length - 1) {
      setDialogueIndex((prev) => prev + 1)
      return
    }

    setStage('question-1')
  }

  const handleFirstQuestionAnswer = (optionId: string) => {
    const evaluation = evaluateMistakeAnswer(optionId)
    setSelectedMistakeOption(optionId)
    setMistakeFeedback(evaluation.explanation)
    setRewardPoints((prev) => prev + evaluation.rewardPoints)

    setStage('feedback-1')
  }

  const handleScenarioDecision = (decision: InsuranceDecision) => {
    setStage('simulating')

    window.setTimeout(() => {
      const simulation = simulateInsuranceDecision(decision)
      const nextMoney = Math.max(0, playerMoney - simulation.totalMoneyDeducted)
      const actualDeduction = playerMoney - nextMoney

      setPlayerMoney(nextMoney)
      setScenarioResult({
        title: simulation.title,
        message: simulation.message,
        advice: simulation.advice,
        moneyDeducted: actualDeduction,
        insuranceCover: simulation.coveredByInsurance,
      })

      setStage('result')
    }, 1800)
  }

  return (
    <div className='insurance-convo-screen'>
      <div className='insurance-convo-wrap'>
        <div className='conversation-header'>
          <div>
            <p className='text-xs uppercase tracking-[0.2em] text-rose-200'>Hospital Insurance Domain</p>
            <h3 className='mt-2 text-2xl font-semibold text-white'>Reena’s Story</h3>
          </div>
          <div className='rounded-xl border border-yellow-300/30 bg-yellow-400/10 px-4 py-2 text-right'>
            <p className='text-xs text-yellow-200'>Reward points</p>
            <p className='text-xl font-bold text-yellow-100'>+{rewardPoints}</p>
          </div>
        </div>

        <div className='reena-row'>
          <img
            src={topSpeakerImage}
            alt={topSpeakerName}
            className={isReenaSpeaking ? 'reena-portrait' : 'companion-portrait'}
          />

          <div className='reena-dialogue-box'>
            <p className='speaker-tag'>{topSpeakerName}</p>
            <p className='reena-text'>
              {typedText}
              <span className='type-cursor'>|</span>
            </p>

            {stage === 'intro' && (
              <button
                type='button'
                onClick={goNextDialogue}
                className='mt-4 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400'
              >
                Continue
              </button>
            )}

            {stage === 'feedback-1' && (
              <button
                type='button'
                onClick={() => setStage('question-2')}
                className='mt-4 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400'
              >
                Continue
              </button>
            )}

            {stage === 'result' && (
              <button
                type='button'
                onClick={() => setStage('summary')}
                className='mt-4 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400'
              >
                Continue
              </button>
            )}

            {stage === 'summary' && (
              <div className='summary-money-pill'>
                <span className='inline-flex items-center gap-2'>
                  <span className='coin-dot'>🪙</span> Money left: {formatRupees(playerMoney)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className='user-row'>
          <img
            src={playerAvatar}
            alt={playerName}
            className='user-portrait'
          />

          <div className='user-dialogue-box'>
            <p className='speaker-tag'>{playerName}</p>

            {stage === 'intro' && (
              <p className='empty-user-line'>...</p>
            )}

            {stage === 'question-1' && (
              <div className='options-wrap'>
                <p className='user-question'>{MISTAKE_QUESTION.text}</p>
                {MISTAKE_QUESTION.options.map((option) => (
                  <button
                    key={option.id}
                    type='button'
                    onClick={() => handleFirstQuestionAnswer(option.id)}
                    className='option-btn'
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {stage === 'feedback-1' && (
              <p className='empty-user-line'>...</p>
            )}

            {stage === 'question-2' && (
              <div className='options-wrap'>
                <p className='user-question'>What will you choose?</p>
                <button
                  type='button'
                  onClick={() => handleScenarioDecision('buy-insurance')}
                  className='option-btn success'
                >
                  Buy health insurance (₹500 per month)
                </button>
                <button
                  type='button'
                  onClick={() => handleScenarioDecision('skip-insurance')}
                  className='option-btn danger'
                >
                  Skip insurance and save money
                </button>
              </div>
            )}

            {stage === 'simulating' && (
              <div className='sim-wait'>
                <div className='spinner' />
                <p>Thinking through outcomes...</p>
              </div>
            )}

            {stage === 'result' && scenarioResult && (
              <div className='result-chips'>
                <div className='chip'>Money impact: -{formatRupees(scenarioResult.moneyDeducted)}</div>
                <div className='chip'>Insurance covered: {formatRupees(scenarioResult.insuranceCover)}</div>
              </div>
            )}

            {stage === 'summary' && (
              <p className='empty-user-line'>I understand. I will plan for health insurance.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
