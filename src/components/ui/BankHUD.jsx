import { useState, useEffect, useRef } from 'react';
import useGameStore, { formatRupees } from '../../stores/gameStore';
import './BankHUD.css';

const TOTAL_MONTHS = 12;

function getHealthColor(health) {
  if (health >= 80) return '#4caf50';  // Green — excellent
  if (health >= 60) return '#8bc34a';  // Light green — good
  if (health >= 40) return '#ffc107';  // Yellow — warning
  if (health >= 20) return '#ff9800';  // Orange — danger
  return '#f44336';                     // Red — critical
}

export function BankHUD() {
  const balance = useGameStore((s) => s.balance);
  const financialHealth = useGameStore((s) => s.financialHealth);
  const month = useGameStore((s) => s.month);

  const [flashType, setFlashType] = useState(null);
  const prevBalance = useRef(balance);

  useEffect(() => {
    if (balance > prevBalance.current) {
      setFlashType('income');
    } else if (balance < prevBalance.current) {
      setFlashType('expense');
    }
    prevBalance.current = balance;

    const timeout = setTimeout(() => setFlashType(null), 600);
    return () => clearTimeout(timeout);
  }, [balance]);

  return (
    <div className="bank-hud">
      <div className="bank-hud__balance">
        <span className="bank-hud__label">Balance</span>
        <span className="bank-hud__amount" data-flash={flashType}>
          {formatRupees(balance)}
        </span>
      </div>
      <div className="bank-hud__health">
        <span className="bank-hud__label">Financial Health</span>
        <div className="bank-hud__health-bar">
          <div
            className="bank-hud__health-fill"
            style={{
              width: `${financialHealth}%`,
              backgroundColor: getHealthColor(financialHealth),
            }}
          />
        </div>
        <span className="bank-hud__health-value">{financialHealth}/100</span>
      </div>
      <div className="bank-hud__month">
        Month {month}/{TOTAL_MONTHS}
      </div>
    </div>
  );
}

export default BankHUD;
