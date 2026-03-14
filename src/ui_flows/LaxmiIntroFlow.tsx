import { useEffect, useMemo, useState } from 'react'

import { UIFlowStore } from './store'
import './laxmiIntroFlow.css'

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

export default function LaxmiIntroFlow() {
  const { closeUIFlow } = UIFlowStore((state) => ({
    closeUIFlow: state.closeUIFlow,
  }))

  const playerName = useMemo(() => getPlayerName(), [])
  const [lineIndex, setLineIndex] = useState(0)
  const [selectedReadyOption, setSelectedReadyOption] = useState<string | null>(null)
  const [typedText, setTypedText] = useState('')

  const lines = useMemo(
    () => [
      `Welcome to FinQuest, ${playerName}! I am Laxmi, your financial companion.`,
      'I will stay with you throughout your journey and explain money concepts in a simple, practical way.',
      'Inside the world, you will meet experts across domains like investment, banking, insurance, and blockchain.',
      'Whenever needed, I will step in and guide you before and after each mission.',
    ] as const,
    [playerName],
  )

  const isQuestionStage = lineIndex >= lines.length
  const currentLine = !isQuestionStage ? lines[lineIndex] : ''

  useEffect(() => {
    if (isQuestionStage) {
      setTypedText('')
      return
    }
    const line = currentLine
    setTypedText('')
    let i = 0
    const timer = window.setInterval(() => {
      i += 1
      setTypedText(line.slice(0, i))
      if (i >= line.length) window.clearInterval(timer)
    }, 16)
    return () => window.clearInterval(timer)
  }, [isQuestionStage, currentLine])

  const handleContinue = () => {
    setLineIndex((prev) => prev + 1)
  }

  const handleReadyChoice = (choice: 'yes' | 'absolutely-yes') => {
    setSelectedReadyOption(choice)
    try {
      localStorage.setItem('finquest_laxmi_intro_done', 'true')
    } catch {
      // Ignore localStorage write issues.
    }
    window.setTimeout(() => {
      closeUIFlow()
    }, 350)
  }

  return (
    <div className='laxmi-intro-screen'>
      <div className='laxmi-intro-row'>
        <img
          src='/assets/ui/companions/laxmi.png'
          alt='Laxmi'
          className='laxmi-intro-portrait'
        />

        <div className='laxmi-intro-dialogue'>
          <p className='laxmi-intro-tag'>Your Companion</p>
          <h3 className='laxmi-intro-title'>Hi, I am Laxmi 👋</h3>

          {!isQuestionStage && (
            <p className='laxmi-intro-text'>
              {typedText}
              <span className='laxmi-type-cursor'>|</span>
            </p>
          )}

          {!isQuestionStage && (
            <div className='laxmi-intro-actions'>
              <button type='button' className='laxmi-intro-btn' onClick={handleContinue}>
                Continue →
              </button>
            </div>
          )}

          {isQuestionStage && (
            <>
              <p className='laxmi-intro-text'>Are you ready to enter the FinQuest world?</p>
              <div className='laxmi-intro-actions'>
                <button
                  type='button'
                  className='laxmi-intro-btn'
                  onClick={() => handleReadyChoice('yes')}
                  disabled={!!selectedReadyOption}
                >
                  Yes
                </button>
                <button
                  type='button'
                  className='laxmi-intro-btn secondary'
                  onClick={() => handleReadyChoice('absolutely-yes')}
                  disabled={!!selectedReadyOption}
                >
                  Absolutely Yes
                </button>
              </div>

              {selectedReadyOption && (
                <p className='laxmi-intro-entering'>Great! Entering the virtual world...</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
