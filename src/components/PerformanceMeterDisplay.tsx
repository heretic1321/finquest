import { genericStore } from "@client/contexts/GlobalStateContext"
import { useFrame } from "@react-three/fiber"
import { Perf } from "r3f-perf"
import { useEffect, useState } from "react"
import Stats from 'three/examples/jsm/libs/stats.module.js'

export const PerformanceMeterDisplay = () => {
  const isDebugMode = genericStore((state) => state.isDebugMode)

  const [memoryStatsPanel, setMemoryStatsPanel] = useState<Stats | null>(null)
  useEffect(() => {
    if (memoryStatsPanel === null && isDebugMode) {
      // @ts-ignore
      const memoryStats = new Stats()
      memoryStats.showPanel(2)
      document.body.appendChild(memoryStats.dom)
      setMemoryStatsPanel(memoryStats)
    }
  }, [isDebugMode, memoryStatsPanel])
  useFrame(() => {
    if (!genericStore.getState().isTabFocused) return
    if (memoryStatsPanel) {
      // @ts-ignore
      memoryStatsPanel.update()
    }
  })

  if (!isDebugMode) return null
  return (
    <Perf
      deepAnalyse={true}
      overClock={true}
      matrixUpdate={true}
      position='top-left'
      logsPerSecond={5}
      style={{
        position: 'absolute',
        left: '30%',
      }}
    />
  )
}