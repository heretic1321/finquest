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
    <div className='bg-[#0a0a0a] min-h-[80vh] p-4'>
      <div className='space-y-4'>
        <div className='flex items-center justify-between border-b-2 border-neutral-700 pb-4'>
          <div>
            <p className='uppercase tracking-[0.2em] text-xs text-[#ff3366] font-mono'>Hospital Insurance Domain</p>
            <h3 className='mt-1 text-2xl font-black uppercase tracking-tight text-white'>Reena's Story</h3>
          </div>
          <div className='border-2 border-[#ffcc00] bg-black px-4 py-2 text-right'>
            <p className='text-xs text-neutral-500 uppercase tracking-wider font-mono'>Reward points</p>
            <p className='text-xl font-bold text-[#ffcc00] font-mono'>+{rewardPoints}</p>
          </div>
        </div>

        <div className='flex gap-4 items-start'>
          <img
            src={topSpeakerImage}
            alt={topSpeakerName}
            className='w-20 h-20 object-cover border-2 border-[#00ff88] rounded-none flex-shrink-0'
          />

          <div className='bg-black border-2 border-neutral-700 p-4 flex-1'>
            <span className='bg-[#ff3366] text-white font-mono font-bold text-xs uppercase px-2 py-1 inline-block'>{topSpeakerName}</span>
            <p className='font-mono text-sm text-neutral-300 mt-3 leading-relaxed'>
              {typedText}
              <span className='inline-block w-0.5 h-4 bg-[#00ff88] ml-0.5 animate-pulse' />
            </p>

            {stage === 'intro' && (
              <button
                type='button'
                onClick={goNextDialogue}
                className='mt-4 bg-[#00ff88] text-black font-bold uppercase tracking-wider text-sm border-2 border-[#00ff88] px-4 py-2 rounded-none shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all'
              >
                Continue
              </button>
            )}

            {stage === 'feedback-1' && (
              <button
                type='button'
                onClick={() => setStage('question-2')}
                className='mt-4 bg-[#00ff88] text-black font-bold uppercase tracking-wider text-sm border-2 border-[#00ff88] px-4 py-2 rounded-none shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all'
              >
                Continue
              </button>
            )}

            {stage === 'result' && (
              <button
                type='button'
                onClick={() => setStage('summary')}
                className='mt-4 bg-[#00ff88] text-black font-bold uppercase tracking-wider text-sm border-2 border-[#00ff88] px-4 py-2 rounded-none shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all'
              >
                Continue
              </button>
            )}

            {stage === 'summary' && (
              <div className='mt-4 border-2 border-[#ffcc00] bg-black p-3 flex items-center gap-2'>
                <span className='text-lg'>&#x1FA99;</span>
                <span className='font-mono font-bold text-[#ffcc00]'>Money left: {formatRupees(playerMoney)}</span>
              </div>
            )}
          </div>
        </div>

        <div className='flex gap-4 items-start flex-row-reverse'>
          <img
            src={playerAvatar}
            alt={playerName}
            className='w-16 h-16 object-cover border-2 border-neutral-700 rounded-none flex-shrink-0'
          />

          <div className='bg-[#111] border-2 border-neutral-700 p-4 flex-1'>
            <span className='bg-neutral-700 text-white font-mono font-bold text-xs uppercase px-2 py-1 inline-block'>{playerName}</span>

            {stage === 'intro' && (
              <p className='text-sm text-neutral-500 font-mono mt-3'>...</p>
            )}

            {stage === 'question-1' && (
              <div className='mt-3 space-y-2'>
                <p className='font-mono text-sm text-neutral-300'>{MISTAKE_QUESTION.text}</p>
                {MISTAKE_QUESTION.options.map((option) => (
                  <button
                    key={option.id}
                    type='button'
                    onClick={() => handleFirstQuestionAnswer(option.id)}
                    className='w-full text-left border-2 border-neutral-700 bg-black p-3 font-mono text-sm text-white cursor-pointer hover:border-[#00ff88] hover:shadow-[3px_3px_0_#00ff88] transition-all'
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {stage === 'feedback-1' && (
              <p className='text-sm text-neutral-500 font-mono mt-3'>...</p>
            )}

            {stage === 'question-2' && (
              <div className='mt-3 space-y-2'>
                <p className='font-mono text-sm text-neutral-300'>What will you choose?</p>
                <button
                  type='button'
                  onClick={() => handleScenarioDecision('buy-insurance')}
                  className='w-full text-left border-2 border-neutral-700 bg-black p-4 font-mono text-sm text-white cursor-pointer hover:border-[#00ff88] hover:shadow-[3px_3px_0_#00ff88] transition-all'
                >
                  Buy health insurance (&#x20B9;500 per month)
                </button>
                <button
                  type='button'
                  onClick={() => handleScenarioDecision('skip-insurance')}
                  className='w-full text-left border-2 border-neutral-700 bg-black p-4 font-mono text-sm text-white cursor-pointer hover:border-[#ff3366] hover:shadow-[3px_3px_0_#ff3366] transition-all'
                >
                  Skip insurance and save money
                </button>
              </div>
            )}

            {stage === 'simulating' && (
              <div className='mt-3 flex items-center gap-3'>
                <div className='w-4 h-4 border-2 border-[#00ff88] border-t-transparent animate-spin' />
                <p className='font-mono text-sm text-neutral-400'>Thinking through outcomes...</p>
              </div>
            )}

            {stage === 'result' && scenarioResult && (
              <div className='mt-3 flex gap-3'>
                <div className='border-2 border-[#ff3366] bg-black p-3 flex-1'>
                  <p className='font-mono text-xs text-neutral-500 uppercase tracking-wider'>Money impact</p>
                  <p className='font-mono text-[#ff3366] font-bold'>-{formatRupees(scenarioResult.moneyDeducted)}</p>
                </div>
                <div className='border-2 border-[#00ff88] bg-black p-3 flex-1'>
                  <p className='font-mono text-xs text-neutral-500 uppercase tracking-wider'>Insurance covered</p>
                  <p className='font-mono text-[#00ff88] font-bold'>{formatRupees(scenarioResult.insuranceCover)}</p>
                </div>
              </div>
            )}

            {stage === 'summary' && (
              <p className='text-sm text-neutral-400 font-mono mt-3'>I understand. I will plan for health insurance.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
