import * as React from 'react'
import { useProgress } from '@react-three/drei'

interface LoaderProps {
  /** When true, loader fades out and unmounts after transition */
  fadingOut?: boolean
  onFadeComplete?: () => void
}

export function CustomLoader({ fadingOut = false, onFadeComplete }: LoaderProps) {
  const { progress } = useProgress()
  const progressRef = React.useRef(0)
  const rafRef = React.useRef(0)
  const progressSpanRef = React.useRef<HTMLSpanElement>(null)

  const updateProgress = React.useCallback(() => {
    if (!progressSpanRef.current) return
    progressRef.current += (progress - progressRef.current) / 2
    if (progressRef.current > 0.95 * progress || progress === 100)
      progressRef.current = progress
    progressSpanRef.current.innerText = `Loading ${progressRef.current.toFixed(0)}%`
    if (progressRef.current < progress)
      rafRef.current = requestAnimationFrame(updateProgress)
  }, [progress])

  React.useEffect(() => {
    updateProgress()
    return () => cancelAnimationFrame(rafRef.current)
  }, [updateProgress])

  return (
    <div
      style={{
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.8s ease-out',
      }}
      onTransitionEnd={() => {
        if (fadingOut && onFadeComplete) onFadeComplete()
      }}
      className='absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-[#0a0f1a]'
    >
      <h1 className='text-5xl font-bold tracking-tight md:text-7xl'>
        <span className='text-emerald-400'>Fin</span>
        <span className='text-white'>Quest</span>
      </h1>

      <p className='mt-6 text-lg text-slate-300'>
        Preparing your island...
      </p>

      <div className='mt-8 w-64'>
        <div className='h-1.5 w-full overflow-hidden rounded-full bg-white/10'>
          <div
            className='h-full rounded-full bg-emerald-400 transition-all duration-300'
            style={{ width: `${progress}%` }}
          />
        </div>
        <span
          ref={progressSpanRef}
          className='mt-2 block text-center text-sm text-slate-400'
        />
      </div>
    </div>
  )
}
