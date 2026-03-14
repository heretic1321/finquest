import * as React from 'react'
import { useProgress } from '@react-three/drei'

interface LoaderOptions {
  containerStyles: React.CSSProperties
  innerStyles: React.CSSProperties
  barStyles: React.CSSProperties
  dataStyles: React.CSSProperties
  dataInterpolation: (p: number) => string
  initialState: (active: boolean) => boolean
}

const defaultDataInterpolation = (p: number) => `Loading ${p.toFixed(0)}%`

export function CustomLoader({
  containerStyles,
  innerStyles,
  dataInterpolation = defaultDataInterpolation,
  initialState = (active: boolean) => active,
}: Partial<LoaderOptions>) {
  const { active, progress } = useProgress()
  const progressRef = React.useRef(0)
  const rafRef = React.useRef(0)
  const progressSpanRef = React.useRef<HTMLSpanElement>(null)
  const [shown, setShown] = React.useState(initialState(active))

  React.useEffect(() => {
    let t: NodeJS.Timeout
    if (active !== shown) t = setTimeout(() => setShown(active), 1000)
    return () => clearTimeout(t)
  }, [shown, active])

  const updateProgress = React.useCallback(() => {
    if (!progressSpanRef.current) return
    progressRef.current += (progress - progressRef.current) / 2
    if (progressRef.current > 0.95 * progress || progress === 100)
      progressRef.current = progress
    progressSpanRef.current.innerText = dataInterpolation(progressRef.current)
    if (progressRef.current < progress)
      rafRef.current = requestAnimationFrame(updateProgress)
  }, [dataInterpolation, progress])

  React.useEffect(() => {
    updateProgress()
    return () => cancelAnimationFrame(rafRef.current)
  }, [updateProgress])

  return shown ? (
    <div
      style={{
        opacity: active ? 1 : 0,
        transition: 'opacity 0.8s ease-out',
        ...containerStyles,
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
  ) : null
}
