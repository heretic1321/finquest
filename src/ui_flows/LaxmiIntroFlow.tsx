import { useEffect, useMemo, useState } from 'react'

import { UIFlowStore } from './store'

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
    <div className='bg-[#0a0a0a] min-h-[80vh] p-4 flex items-center justify-center'>
      <div className='flex gap-6 items-start max-w-3xl w-full'>
        <img
          src='/assets/ui/companions/laxmi.png'
          alt='Laxmi'
          className='w-28 h-28 object-cover border-2 border-[#ffcc00] rounded-none flex-shrink-0'
        />

        <div className='bg-black border-2 border-neutral-700 p-6 flex-1'>
          <span className='bg-[#ffcc00] text-black font-mono font-bold text-xs uppercase px-2 py-1 inline-block'>Your Companion</span>
          <h3 className='mt-3 text-xl font-black uppercase tracking-tight text-white'>Hi, I am Laxmi</h3>

          {!isQuestionStage && (
            <p className='mt-3 font-mono text-sm text-neutral-300 leading-relaxed'>
              {typedText}
              <span className='inline-block w-0.5 h-4 bg-[#ffcc00] ml-0.5 animate-pulse' />
            </p>
          )}

          {!isQuestionStage && (
            <div className='mt-4'>
              <button
                type='button'
                className='bg-[#00ff88] text-black font-bold uppercase tracking-wider text-sm border-2 border-[#00ff88] px-4 py-2 rounded-none shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all'
                onClick={handleContinue}
              >
                Continue
              </button>
            </div>
          )}

          {isQuestionStage && (
            <>
              <p className='mt-3 font-mono text-sm text-neutral-300'>Are you ready to enter the FinQuest world?</p>
              <div className='mt-4 flex gap-3'>
                <button
                  type='button'
                  className='bg-[#00ff88] text-black font-bold uppercase tracking-wider text-sm border-2 border-[#00ff88] px-4 py-2 rounded-none shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all'
                  onClick={() => handleReadyChoice('yes')}
                  disabled={!!selectedReadyOption}
                >
                  Yes
                </button>
                <button
                  type='button'
                  className='bg-[#ffcc00] text-black font-bold uppercase tracking-wider text-sm border-2 border-[#ffcc00] px-4 py-2 rounded-none shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all'
                  onClick={() => handleReadyChoice('absolutely-yes')}
                  disabled={!!selectedReadyOption}
                >
                  Absolutely Yes
                </button>
              </div>

              {selectedReadyOption && (
                <p className='mt-3 font-mono text-sm text-[#00ff88] font-bold uppercase tracking-wider'>Great! Entering the virtual world...</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
