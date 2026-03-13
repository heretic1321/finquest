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

  // Health bar color based on value
  const healthColor =
    financialHealth >= 70
      ? 'bg-emerald-500'
      : financialHealth >= 40
        ? 'bg-yellow-500'
        : 'bg-red-500'

  return (
    <div
      className="absolute left-4 top-4 z-40 cursor-pointer select-none"
      onClick={() => setExpanded((prev) => !prev)}
    >
      <div className="rounded-xl bg-black/70 backdrop-blur-sm border border-emerald-500/30 transition-all duration-300">
        {/* Compact view - always visible */}
        <div className="px-4 py-3 flex items-center gap-4">
          <div className="text-emerald-400 font-bold text-sm tracking-wide">
            FINQUEST BANK
          </div>
          <div className="text-white font-semibold text-sm">
            {formatRupees(balance)}
          </div>
          <div className="text-slate-400 text-xs">
            Month {month}/{maxMonth}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${healthColor} rounded-full transition-all duration-500`}
                style={{ width: `${financialHealth}%` }}
              />
            </div>
            <span className="text-xs text-slate-400">{financialHealth}</span>
          </div>
        </div>

        {/* Expanded breakdown */}
        {expanded && (
          <div className="border-t border-emerald-500/20 px-4 py-3 space-y-2 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Savings</span>
              <span className="text-white">{formatRupees(balance)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Emergency Fund</span>
              <span className="text-white">{formatRupees(emergencyFund)}</span>
            </div>
            {sipAmount > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>SIP ({formatRupees(sipAmount)}/mo)</span>
                <span className="text-white">{formatRupees(sipTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-300">
              <span>Insurance</span>
              <span className={insuranceBought ? 'text-emerald-400' : 'text-red-400'}>
                {insuranceBought ? 'Active' : 'None'}
              </span>
            </div>
            {debt > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>Debt</span>
                <span className="text-red-400">{formatRupees(debt)}</span>
              </div>
            )}
            <div className="border-t border-slate-600 pt-2 flex justify-between text-slate-300">
              <span>Net Worth</span>
              <span className="text-emerald-400 font-semibold">{formatRupees(getNetWorth())}</span>
            </div>
            <div className="border-t border-slate-600 pt-2 space-y-1 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Monthly Salary</span>
                <span>{formatRupees(monthlySalary)}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Expenses</span>
                <span>{formatRupees(getTotalMonthlyExpenses())}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
