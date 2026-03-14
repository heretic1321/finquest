import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useGameStore, formatRupees, getTotalMonthlyExpenses, getNetWorth } from '@client/stores/gameStore'

export default function BankHUD() {
  const [expanded, setExpanded] = useState(false)

  const {
    balance,
    month,
    maxMonth,
    financialHealth,
    sipAmount,
    sipTotal,
    insuranceBought,
    emergencyFund,
    debt,
    monthlySalary,
  } = useGameStore(
    useShallow((state) => ({
      balance: state.balance,
      month: state.month,
      maxMonth: state.maxMonth,
      financialHealth: state.financialHealth,
      sipAmount: state.sipAmount,
      sipTotal: state.sipTotal,
      insuranceBought: state.insuranceBought,
      emergencyFund: state.emergencyFund,
      debt: state.debt,
      monthlySalary: state.monthlySalary,
    })),
  )

  const healthColor =
    financialHealth >= 70
      ? 'bg-[#00ff88]'
      : financialHealth >= 40
        ? 'bg-[#ffcc00]'
        : 'bg-[#ff3366]'

  return (
    <div
      className="absolute left-4 top-4 z-40 cursor-pointer select-none"
      onClick={() => setExpanded((prev) => !prev)}
    >
      <div className="bg-black border-2 border-[#00ff88] shadow-[4px_4px_0_#00ff88] transition-all duration-300">
        <div className="px-4 py-3 flex items-center gap-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[#00ff88] font-mono font-bold">
            FINQUEST BANK
          </div>
          <div className="font-mono text-[#00ff88] text-xl font-bold tabular-nums">
            {formatRupees(balance)}
          </div>
          <div className="font-mono text-neutral-500 text-xs">
            Month {month}/{maxMonth}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-neutral-800 overflow-hidden">
              <div
                className={`h-full ${healthColor} transition-all duration-500`}
                style={{ width: `${financialHealth}%` }}
              />
            </div>
            <span className="text-xs font-mono text-neutral-500 tabular-nums">{financialHealth}</span>
          </div>
        </div>

        {expanded && (
          <div className="border-t-2 border-neutral-800 px-4 py-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500 uppercase text-xs tracking-wider">Savings</span>
              <span className="font-mono text-white tabular-nums">{formatRupees(balance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 uppercase text-xs tracking-wider">Emergency Fund</span>
              <span className="font-mono text-white tabular-nums">{formatRupees(emergencyFund)}</span>
            </div>
            {sipAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase text-xs tracking-wider">SIP ({formatRupees(sipAmount)}/mo)</span>
                <span className="font-mono text-white tabular-nums">{formatRupees(sipTotal)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-500 uppercase text-xs tracking-wider">Insurance</span>
              <span className={`font-mono ${insuranceBought ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                {insuranceBought ? 'Active' : 'None'}
              </span>
            </div>
            {debt > 0 && (
              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase text-xs tracking-wider">Debt</span>
                <span className="font-mono text-[#ff3366] tabular-nums">{formatRupees(debt)}</span>
              </div>
            )}
            <div className="border-t-2 border-neutral-800 pt-2 flex justify-between">
              <span className="text-neutral-500 uppercase text-xs tracking-wider">Net Worth</span>
              <span className="text-[#00ff88] font-mono font-bold tabular-nums">{formatRupees(getNetWorth())}</span>
            </div>
            <div className="border-t-2 border-neutral-800 pt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase tracking-wider">Monthly Salary</span>
                <span className="font-mono text-white tabular-nums">{formatRupees(monthlySalary)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase tracking-wider">Monthly Expenses</span>
                <span className="font-mono text-white tabular-nums">{formatRupees(getTotalMonthlyExpenses())}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
