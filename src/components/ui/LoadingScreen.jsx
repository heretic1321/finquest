import { useEffect } from 'react'
import { useGameStore } from '../../stores/gameStore'

export function LoadingScreen() {
  const isLoaded = useGameStore((s) => s.isLoaded)
  const setLoaded = useGameStore((s) => s.setLoaded)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setLoaded()
    }, 1200)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [setLoaded])

  if (isLoaded) return null

  return (
    <div className="loading-screen">
      <h1>FinQuest</h1>
      <div className="loading-bar">
        <div className="loading-bar-fill" />
      </div>
    </div>
  )
}
