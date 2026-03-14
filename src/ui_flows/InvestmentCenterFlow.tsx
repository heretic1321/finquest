import { useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { FaCoins } from 'react-icons/fa'

import { formatRupees, useGameStore } from '@client/stores/gameStore'

type StockProfile = {
  id: string
  name: string
  sector: string
  risk: 'Low' | 'Medium' | 'High'
  latestPrice: number
  oneYearReturn: number
  peRatio: number
  volatility: string
  suggestedStake: number
  trend: number[]
  summary: string
}

type OutcomePattern = {
  kind: 'gain' | 'loss'
  multiplier: number
  title: string
  advice: string
  healthDelta: number
}

type StockAttemptMap = Record<string, number>

type ModalState = {
  open: boolean
  title: string
  primaryStatement: string
  totalStatement: string
  advice: string
  tone: 'neutral' | 'success' | 'danger'
}

type PendingOutcome = {
  kind: 'gain' | 'loss'
  amount: number
  title: string
  advice: string
  healthDelta: number
}

type StockSimulation = {
  status: 'idle' | 'running' | 'ready'
  endsAt: number | null
  pending: PendingOutcome | null
}

const INVESTMENT_STORY_KEY = 'finquest_investment_story_by_stock'
const SIMULATION_DURATION_MS = 8000

const STOCKS: StockProfile[] = [
  {
    id: 'steady-grid',
    name: 'Steady Grid Power',
    sector: 'Utilities',
    risk: 'Low',
    latestPrice: 418,
    oneYearReturn: 11,
    peRatio: 16.2,
    volatility: 'Low',
    suggestedStake: 4000,
    trend: [120, 124, 128, 132, 139, 143, 150, 158],
    summary: 'Stable compounding style stock with slow, consistent appreciation.',
  },
  {
    id: 'rocket-retail',
    name: 'Rocket Retail Tech',
    sector: 'Consumer Tech',
    risk: 'High',
    latestPrice: 1220,
    oneYearReturn: 61,
    peRatio: 48.4,
    volatility: 'Very High',
    suggestedStake: 6000,
    trend: [70, 88, 110, 150, 205, 280, 360, 470],
    summary: 'Explosive top-line growth, but valuation is already stretched.',
  },
  {
    id: 'monsoon-motors',
    name: 'Monsoon Motors',
    sector: 'Auto',
    risk: 'Medium',
    latestPrice: 690,
    oneYearReturn: -9,
    peRatio: 22.6,
    volatility: 'Medium',
    suggestedStake: 5000,
    trend: [260, 255, 248, 245, 234, 220, 214, 206],
    summary: 'Cyclical business facing demand slowdown and margin pressure.',
  },
  {
    id: 'saver-health',
    name: 'Saver Health Labs',
    sector: 'Healthcare',
    risk: 'Medium',
    latestPrice: 532,
    oneYearReturn: 18,
    peRatio: 24.8,
    volatility: 'Medium',
    suggestedStake: 4500,
    trend: [180, 176, 183, 192, 196, 208, 214, 223],
    summary: 'Resilient earnings profile with decent growth and manageable risk.',
  },
  {
    id: 'flash-fin',
    name: 'Flash Fin Capital',
    sector: 'NBFC',
    risk: 'High',
    latestPrice: 311,
    oneYearReturn: 27,
    peRatio: 31.1,
    volatility: 'High',
    suggestedStake: 5500,
    trend: [210, 240, 220, 260, 230, 290, 250, 300],
    summary: 'Sharp rallies, sharp drawdowns — momentum without stability.',
  },
]

const STOCK_PATTERNS: Record<string, OutcomePattern[]> = {
  'steady-grid': [
    {
      kind: 'gain',
      multiplier: 2.0,
      title: 'Compounding reward',
      advice: 'Strong result. Still, invest in phases and track fundamentals regularly.',
      healthDelta: 8,
    },
    {
      kind: 'gain',
      multiplier: 0.85,
      title: 'Measured success',
      advice: 'Moderate gains are healthy. Consistency often beats impulsive bets.',
      healthDelta: 4,
    },
    {
      kind: 'loss',
      multiplier: 0.45,
      title: 'Valuation pullback',
      advice: 'Even quality names can correct. Keep emergency savings before aggressive investing.',
      healthDelta: -4,
    },
  ],
  'rocket-retail': [
    {
      kind: 'gain',
      multiplier: 2.2,
      title: 'Momentum jackpot',
      advice: 'High upside came with high risk. Don\'t assume this happens every time.',
      healthDelta: 8,
    },
    {
      kind: 'loss',
      multiplier: 1.7,
      title: 'Overconfidence penalty',
      advice: 'You should not invest blindly just because initially you got success.',
      healthDelta: -12,
    },
    {
      kind: 'loss',
      multiplier: 0.9,
      title: 'Volatility shock',
      advice: 'High-growth stocks need strict risk control and position sizing.',
      healthDelta: -7,
    },
  ],
  'monsoon-motors': [
    {
      kind: 'loss',
      multiplier: 1.0,
      title: 'Cycle downturn',
      advice: 'Cyclical sectors can stay weak for long periods. Study demand and margins before entry.',
      healthDelta: -8,
    },
    {
      kind: 'gain',
      multiplier: 0.6,
      title: 'Recovery bounce',
      advice: 'Turnarounds can pay, but require patience and clear entry rules.',
      healthDelta: 3,
    },
    {
      kind: 'loss',
      multiplier: 0.7,
      title: 'False breakout',
      advice: 'Price spikes without fundamentals can fail. Diversify to protect your portfolio.',
      healthDelta: -5,
    },
  ],
  'saver-health': [
    {
      kind: 'gain',
      multiplier: 1.4,
      title: 'Defensive winner',
      advice: 'Defensive sectors can reduce risk during uncertain cycles.',
      healthDelta: 6,
    },
    {
      kind: 'gain',
      multiplier: 0.75,
      title: 'Steady compounding',
      advice: 'Moderate but consistent gains are powerful for long-term wealth.',
      healthDelta: 4,
    },
    {
      kind: 'loss',
      multiplier: 0.35,
      title: 'Regulatory hit',
      advice: 'Sector-specific risks matter. Review policy and compliance exposure.',
      healthDelta: -3,
    },
  ],
  'flash-fin': [
    {
      kind: 'gain',
      multiplier: 1.3,
      title: 'Quick rally',
      advice: 'Short-term rallies can be profitable, but timing risk is high.',
      healthDelta: 5,
    },
    {
      kind: 'loss',
      multiplier: 1.25,
      title: 'Liquidity crunch',
      advice: 'Financial stocks can drop sharply when credit risk perception rises.',
      healthDelta: -9,
    },
    {
      kind: 'gain',
      multiplier: 0.55,
      title: 'Selective rebound',
      advice: 'Recovery came, but returns were smaller than expected. Avoid all-in decisions.',
      healthDelta: 2,
    },
  ],
}

const getStoredAttempts = (): StockAttemptMap => {
  const rawValue = window.localStorage.getItem(INVESTMENT_STORY_KEY)
  if (!rawValue) return {}

  try {
    const parsed = JSON.parse(rawValue) as Record<string, unknown>
    return Object.fromEntries(
      Object.entries(parsed).map(([key, value]) => {
        const parsedValue = Number(value)
        return [key, Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : 0]
      }),
    )
  } catch {
    return {}
  }
}

const setStoredAttempts = (value: StockAttemptMap) => {
  window.localStorage.setItem(INVESTMENT_STORY_KEY, JSON.stringify(value))
}

const buildChartPoints = (values: number[]) => {
  const width = 240
  const height = 90
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const spread = Math.max(maxValue - minValue, 1)

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width
      const y = height - ((value - minValue) / spread) * height
      return `${x},${y}`
    })
    .join(' ')
}

const pickOutcome = (
  stock: StockProfile,
  stockAttemptCount: number,
): OutcomePattern => {
  const patterns = STOCK_PATTERNS[stock.id] ?? STOCK_PATTERNS['flash-fin']
  return patterns[stockAttemptCount % patterns.length]
}

export default function InvestmentCenterFlow() {
  const [attemptByStock, setAttemptByStock] = useState<StockAttemptMap>(() => getStoredAttempts())
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [simulationByStock, setSimulationByStock] = useState<Record<string, StockSimulation>>(() =>
    Object.fromEntries(
      STOCKS.map((stock) => [
        stock.id,
        {
          status: 'idle',
          endsAt: null,
          pending: null,
        },
      ]),
    ) as Record<string, StockSimulation>,
  )
  const [modal, setModal] = useState<ModalState>({
    open: false,
    title: '',
    primaryStatement: '',
    totalStatement: '',
    advice: '',
    tone: 'neutral',
  })
  const timerRefMap = useRef<Record<string, number>>({})

  const { balance, addMoney, spendMoney, updateHealth } = useGameStore(
    useShallow((state) => ({
      balance: state.balance,
      addMoney: state.addMoney,
      spendMoney: state.spendMoney,
      updateHealth: state.updateHealth,
    })),
  )

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    return () => {
      Object.values(timerRefMap.current).forEach((timeoutId) => {
        window.clearTimeout(timeoutId)
      })
    }
  }, [])

  const totalSimulations = useMemo(
    () => Object.values(attemptByStock).reduce((sum, value) => sum + value, 0),
    [attemptByStock],
  )

  const settleOutcome = (
    selectedStock: StockProfile,
    pending: PendingOutcome,
    amountToApply: number,
    soldEarly: boolean,
  ) => {
    const safeAmount = Math.max(0, Math.round(amountToApply))

    if (pending.kind === 'gain') {
      addMoney(safeAmount, `Investment Center profit on ${selectedStock.name}`, 'investment')
      const updatedBalance = useGameStore.getState().balance

      setModal({
        open: true,
        title: soldEarly ? 'Early sell executed' : pending.title,
        primaryStatement: `You earned a profit of ${formatRupees(safeAmount)}.`,
        totalStatement: `Total amount in your account is ${formatRupees(updatedBalance)}.`,
        advice: soldEarly
          ? 'You booked profit before analysis completion. Early exits can protect gains, but can also reduce upside.'
          : pending.advice,
        tone: 'success',
      })
    } else {
      const availableBalance = useGameStore.getState().balance
      const debitAmount = Math.min(availableBalance, safeAmount)

      if (debitAmount > 0) {
        spendMoney(debitAmount, `Investment Center loss on ${selectedStock.name}`, 'investment')
      }

      const updatedBalance = useGameStore.getState().balance

      setModal({
        open: true,
        title: soldEarly ? 'Stop-loss executed' : 'High risk outcome',
        primaryStatement: `You made a loss of ${formatRupees(debitAmount)}.`,
        totalStatement: `Total amount in your account is ${formatRupees(updatedBalance)}.`,
        advice: soldEarly
          ? 'You reduced damage by selling early. Having a stop-loss plan is a key investing discipline.'
          : pending.advice,
        tone: 'danger',
      })
    }

    updateHealth(pending.healthDelta)
  }

  const handleInvestNow = (selectedStock: StockProfile) => {
    const simulation = simulationByStock[selectedStock.id]
    if (simulation?.status === 'running' || simulation?.status === 'ready') return

    const currentStockAttempt = attemptByStock[selectedStock.id] ?? 0
    const outcome = pickOutcome(selectedStock, currentStockAttempt)
    const targetAmount = Math.max(
      500,
      Math.round(selectedStock.suggestedStake * outcome.multiplier),
    )
    const endsAt = Date.now() + SIMULATION_DURATION_MS
    const pending: PendingOutcome = {
      kind: outcome.kind,
      amount: targetAmount,
      title: outcome.title,
      advice: outcome.advice,
      healthDelta: outcome.healthDelta,
    }

    const nextAttempts = {
      ...attemptByStock,
      [selectedStock.id]: currentStockAttempt + 1,
    }
    setAttemptByStock(nextAttempts)
    setStoredAttempts(nextAttempts)

    setSimulationByStock((prev) => ({
      ...prev,
      [selectedStock.id]: {
        status: 'running',
        endsAt,
        pending,
      },
    }))

    timerRefMap.current[selectedStock.id] = window.setTimeout(() => {
      setSimulationByStock((prev) => ({
        ...prev,
        [selectedStock.id]: {
          status: 'ready',
          endsAt: prev[selectedStock.id]?.endsAt ?? null,
          pending: prev[selectedStock.id]?.pending ?? null,
        },
      }))
    }, SIMULATION_DURATION_MS)
  }

  const handleSellStock = (selectedStock: StockProfile) => {
    const simulation = simulationByStock[selectedStock.id]
    if (!simulation || simulation.status !== 'running' || !simulation.pending) return

    const timerId = timerRefMap.current[selectedStock.id]
    if (timerId) {
      window.clearTimeout(timerId)
      delete timerRefMap.current[selectedStock.id]
    }

    const sellAmount =
      simulation.pending.kind === 'gain'
        ? Math.max(300, Math.round(simulation.pending.amount * 0.45))
        : Math.max(300, Math.round(simulation.pending.amount * 0.4))

    settleOutcome(selectedStock, simulation.pending, sellAmount, true)

    setSimulationByStock((prev) => ({
      ...prev,
      [selectedStock.id]: {
        status: 'idle',
        endsAt: null,
        pending: null,
      },
    }))
  }

  const handleCheckResults = (selectedStock: StockProfile) => {
    const simulation = simulationByStock[selectedStock.id]
    if (!simulation || simulation.status !== 'ready' || !simulation.pending) return

    settleOutcome(selectedStock, simulation.pending, simulation.pending.amount, false)

    setSimulationByStock((prev) => ({
      ...prev,
      [selectedStock.id]: {
        status: 'idle',
        endsAt: null,
        pending: null,
      },
    }))
  }

  return (
    <div className='space-y-4 bg-[#0a0a0a] p-3'>
      <div className='border-2 border-[#00ff88] bg-black p-4'>
        <p className='uppercase tracking-[0.2em] text-xs text-[#00ff88] font-mono'>Investment Center</p>
        <h3 className='mt-2 text-2xl font-black uppercase tracking-tight text-white'>Choose a stock and invest thoughtfully</h3>
        <p className='mt-2 text-sm leading-6 text-neutral-400 font-mono'>
          Compare historical trends, risk, and valuation metrics before taking action.
          Strong outcomes are possible, but disciplined decision-making matters most.
        </p>
        <p className='mt-2 font-mono text-xs text-neutral-500'>Current bank balance: {formatRupees(balance)}</p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {STOCKS.map((stock) => (
          <article
            key={stock.id}
            className='bg-[#111] border-2 border-neutral-700 p-4'
          >
            <div className='flex items-start justify-between gap-3'>
              <div>
                <p className='text-sm font-bold text-white font-mono'>{stock.name}</p>
                <p className='mt-1 text-xs text-neutral-500 font-mono uppercase tracking-wider'>{stock.sector}</p>
              </div>
              <span className={`px-2 py-1 text-[11px] font-mono font-bold uppercase border-2 ${
                stock.risk === 'Low'
                  ? 'border-[#00ff88] text-[#00ff88]'
                  : stock.risk === 'Medium'
                    ? 'border-[#ffcc00] text-[#ffcc00]'
                    : 'border-[#ff3366] text-[#ff3366]'
              }`}>
                {stock.risk} risk
              </span>
            </div>

            <svg viewBox='0 0 240 90' className='mt-4 h-24 w-full overflow-visible'>
              <polyline
                fill='none'
                stroke='#00ff88'
                strokeWidth='3'
                strokeLinecap='round'
                strokeLinejoin='round'
                points={buildChartPoints(stock.trend)}
              />
            </svg>

            <div className='mt-3 grid grid-cols-2 gap-2 text-xs'>
              <div className='bg-black border border-neutral-800 p-2'>
                <p className='text-neutral-500 font-mono uppercase tracking-wider text-[10px]'>1Y return</p>
                <p className={`font-mono font-bold ${stock.oneYearReturn >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                  {stock.oneYearReturn >= 0 ? '+' : ''}{stock.oneYearReturn}%
                </p>
              </div>
              <div className='bg-black border border-neutral-800 p-2'>
                <p className='text-neutral-500 font-mono uppercase tracking-wider text-[10px]'>P/E ratio</p>
                <p className='text-white font-mono font-bold'>{stock.peRatio}</p>
              </div>
              <div className='bg-black border border-neutral-800 p-2'>
                <p className='text-neutral-500 font-mono uppercase tracking-wider text-[10px]'>Volatility</p>
                <p className='text-white font-mono font-bold'>{stock.volatility}</p>
              </div>
              <div className='bg-black border border-neutral-800 p-2'>
                <p className='text-neutral-500 font-mono uppercase tracking-wider text-[10px]'>Stake</p>
                <p className='text-white font-mono font-bold'>{formatRupees(stock.suggestedStake)}</p>
              </div>
            </div>

            <p className='mt-3 text-xs leading-5 text-neutral-400 font-mono'>{stock.summary}</p>

            {simulationByStock[stock.id]?.status === 'idle' && (
              <button
                type='button'
                onClick={() => handleInvestNow(stock)}
                className='mt-4 w-full bg-[#00ff88] text-black font-bold uppercase tracking-wider text-sm border-2 border-[#00ff88] px-4 py-2.5 rounded-none shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all'
              >
                Invest now
              </button>
            )}

            {simulationByStock[stock.id]?.status === 'running' && (
              <div className='mt-4 border-2 border-[#ffcc00] bg-black p-3'>
                <div className='flex items-center gap-2 text-sm text-[#ffcc00] font-mono'>
                  <span className='inline-block h-2.5 w-2.5 animate-pulse bg-[#ffcc00]' />
                  Let's wait for the results...
                </div>
                <p className='mt-2 text-xs text-neutral-500 font-mono'>
                  Time left:{' '}
                  {Math.max(
                    0,
                    Math.ceil(
                      ((simulationByStock[stock.id]?.endsAt ?? currentTime) - currentTime) /
                        1000,
                    ),
                  )}
                  s
                </p>
                <button
                  type='button'
                  onClick={() => handleSellStock(stock)}
                  className='mt-3 w-full bg-[#ff3366] text-white font-bold uppercase tracking-wider text-sm border-2 border-[#ff3366] px-3 py-2 rounded-none shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all'
                >
                  Sell stock
                </button>
              </div>
            )}

            {simulationByStock[stock.id]?.status === 'ready' && (
              <div className='mt-4 border-2 border-[#00ff88] bg-black p-3'>
                <p className='text-sm font-bold text-[#00ff88] font-mono uppercase'>Analysis completed</p>
                <button
                  type='button'
                  onClick={() => handleCheckResults(stock)}
                  className='mt-3 w-full bg-[#00ff88] text-black font-bold uppercase tracking-wider text-sm border-2 border-[#00ff88] px-3 py-2 rounded-none shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all'
                >
                  Check results
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      <p className='text-xs text-neutral-600 font-mono uppercase tracking-wider'>
        Total investment simulations: {totalSimulations}
      </p>

      {modal.open && (
        <div className='fixed inset-0 z-[140] flex items-center justify-center bg-black/80 px-4'>
          <div className={`w-full max-w-lg border-2 p-5 ${
            modal.tone === 'success'
              ? 'border-[#00ff88] bg-black shadow-[6px_6px_0_#00ff88]'
              : modal.tone === 'danger'
                ? 'border-[#ff3366] bg-black shadow-[6px_6px_0_#ff3366]'
                : 'border-neutral-700 bg-black shadow-[6px_6px_0_white]'
          }`}>
            <div>
              <div className='flex items-center gap-3'>
                <div className='border-2 border-[#ffcc00] p-2.5 text-[#ffcc00]'>
                  <FaCoins className='h-7 w-7' />
                </div>
                <h4 className='text-2xl font-black uppercase tracking-tight text-white'>{modal.title}</h4>
              </div>

              <p className='mt-5 text-2xl font-bold leading-9 text-white font-mono'>{modal.primaryStatement}</p>
              <p className='mt-2 text-lg font-medium text-neutral-300 font-mono'>{modal.totalStatement}</p>

              <div className='mt-5 border-2 border-[#00ff88] bg-[#111] p-4'>
                <p className='text-xs font-bold uppercase tracking-[0.2em] text-[#00ff88] font-mono'>Advice</p>
                <p className='mt-2 text-base leading-7 text-neutral-300 font-mono'>{modal.advice}</p>
              </div>

              <button
                type='button'
                onClick={() => setModal((prev) => ({ ...prev, open: false }))}
                className='mt-5 w-full bg-[#00ff88] text-black font-bold uppercase tracking-wider text-base border-2 border-[#00ff88] px-4 py-3 rounded-none shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all'
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
