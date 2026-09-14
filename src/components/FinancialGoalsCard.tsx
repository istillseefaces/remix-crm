import React, { useState, useMemo, useEffect } from 'react';
import { Target, Edit3, Check, Calendar, TrendingUp } from 'lucide-react';
import { Deal } from '../types';

interface FinancialGoalsCardProps {
  isLight: boolean;
  deals: Deal[];
  formatMoney: (val: number) => string;
  t: any;
  currency: string;
}

export const FinancialGoalsCard: React.FC<FinancialGoalsCardProps> = ({
  isLight,
  deals,
  formatMoney,
  t,
  currency,
}) => {
  const [targetAmount, setTargetAmount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('crm_financial_goal');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.targetAmount === 'number' && parsed.targetAmount > 0) {
          return parsed.targetAmount;
        }
      }
    } catch {
      // ignore
    }
    return 10000;
  });

  const [period, setPeriod] = useState<'month' | 'quarter' | 'all'>(() => {
    try {
      const saved = localStorage.getItem('crm_financial_goal');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.period) return parsed.period;
      }
    } catch {
      // ignore
    }
    return 'month';
  });

  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState(targetAmount.toString());

  useEffect(() => {
    try {
      localStorage.setItem(
        'crm_financial_goal',
        JSON.stringify({ targetAmount, period })
      );
    } catch {
      // ignore
    }
  }, [targetAmount, period]);

  // Calculate actual closed revenue for the chosen period
  const actualRevenue = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);

    return deals
      .filter((d) => {
        if (d.stage !== 'closed') return false;
        if (period === 'all') return true;

        const dateStr = d.date || d.createdAt;
        if (!dateStr) return false;
        const dDate = new Date(dateStr);
        if (isNaN(dDate.getTime())) return false;

        if (period === 'month') {
          return (
            dDate.getFullYear() === currentYear && dDate.getMonth() === currentMonth
          );
        } else if (period === 'quarter') {
          const dQuarter = Math.floor(dDate.getMonth() / 3);
          return (
            dDate.getFullYear() === currentYear && dQuarter === currentQuarter
          );
        }
        return true;
      })
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  }, [deals, period]);

  const percentage =
    targetAmount > 0 ? Math.round((actualRevenue / targetAmount) * 100) : 0;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const remaining = Math.max(0, targetAmount - actualRevenue);
  const isCompleted = actualRevenue >= targetAmount && targetAmount > 0;

  const handleSave = () => {
    const val = parseFloat(inputVal);
    if (!isNaN(val) && val > 0) {
      setTargetAmount(val);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between relative transition-all duration-200 ${
        isLight
          ? 'bg-[var(--canvas)] border-black/[0.06] shadow-xs'
          : 'bg-[#151519] border-white/[0.04]'
      }`}
    >
      <div>
        {/* Header: Title & Period Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-lg ${
                isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/15 text-indigo-400'
              }`}
            >
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4
                className={`text-sm font-semibold tracking-tight ${
                  isLight ? 'text-[var(--ink)]' : 'text-white'
                }`}
              >
                {t.financialGoalsTitle || 'Финансовые цели'}
              </h4>
              <p className="text-[10px] text-zinc-400">
                {t.financialGoalsSubtitle || 'Трекинг плановой выручки'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Period Pills */}
            <div
              className={`flex items-center p-0.5 rounded-lg border text-[10px] font-medium ${
                isLight
                  ? 'bg-white border-black/[0.06]'
                  : 'bg-[var(--surface-secondary)] border-white/[0.06]'
              }`}
            >
              <button
                type="button"
                onClick={() => setPeriod('month')}
                className={`px-2 py-0.5 rounded transition cursor-pointer ${
                  period === 'month'
                    ? isLight
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'bg-indigo-500 text-white font-semibold shadow-xs'
                    : 'text-zinc-500 hover:text-black dark:hover:text-white'
                }`}
              >
                {t.goalPeriodMonth || 'Месяц'}
              </button>
              <button
                type="button"
                onClick={() => setPeriod('quarter')}
                className={`px-2 py-0.5 rounded transition cursor-pointer ${
                  period === 'quarter'
                    ? isLight
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'bg-indigo-500 text-white font-semibold shadow-xs'
                    : 'text-zinc-500 hover:text-black dark:hover:text-white'
                }`}
              >
                {t.goalPeriodQuarter || 'Квартал'}
              </button>
              <button
                type="button"
                onClick={() => setPeriod('all')}
                className={`px-2 py-0.5 rounded transition cursor-pointer ${
                  period === 'all'
                    ? isLight
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'bg-indigo-500 text-white font-semibold shadow-xs'
                    : 'text-zinc-500 hover:text-black dark:hover:text-white'
                }`}
              >
                {t.goalPeriodAll || 'Все'}
              </button>
            </div>

            {/* Edit Goal Button */}
            <button
              type="button"
              onClick={() => {
                setInputVal(targetAmount.toString());
                setIsEditing(!isEditing);
              }}
              title={t.editGoalBtn || 'Изменить цель'}
              className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-black/[0.04] text-zinc-600 border-black/[0.06]'
                  : 'bg-[var(--surface-secondary)] hover:bg-white/[0.06] text-zinc-400 border-white/[0.06]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Inline Goal Editor */}
        {isEditing && (
          <div
            className={`mb-4 p-3 rounded-xl border flex flex-col gap-2 ${
              isLight
                ? 'bg-white border-indigo-200'
                : 'bg-[var(--surface-secondary)] border-indigo-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-indigo-500">
                {t.goalTargetAmount || 'Целевая сумма'}:
              </label>
              <div className="flex gap-1">
                {[1000, 3000, 5000, 10000, 20000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setInputVal(preset.toString())}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                      isLight
                        ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] text-zinc-300'
                    }`}
                  >
                    {preset / 1000}k
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="10000"
                className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold focus:outline-none ${
                  isLight
                    ? 'bg-zinc-50 border-black/[0.1] text-zinc-900 focus:border-indigo-500'
                    : 'bg-[var(--surface)] border-white/[0.08] text-white focus:border-indigo-500'
                }`}
              />
              <button
                type="button"
                onClick={handleSave}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t.saveGoalBtn || 'Сохранить'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Big Ratio Display: Fact / Target — Percentage */}
        <div className="my-2">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${
                  isCompleted
                    ? 'text-emerald-500'
                    : isLight
                    ? 'text-[var(--ink)]'
                    : 'text-white'
                }`}
              >
                {formatMoney(actualRevenue)}
              </span>
              <span className="text-zinc-400 font-mono text-sm font-medium">
                / {formatMoney(targetAmount)}
              </span>
            </div>
            <span
              className={`text-lg sm:text-xl font-bold font-mono ${
                isCompleted
                  ? 'text-emerald-500'
                  : percentage >= 70
                  ? 'text-indigo-500'
                  : isLight
                  ? 'text-zinc-700'
                  : 'text-zinc-300'
              }`}
            >
              {percentage}%
            </span>
          </div>

          {/* Progress Bar Container */}
          <div
            className={`w-full h-3 rounded-full overflow-hidden mt-2.5 p-0.5 border ${
              isLight
                ? 'bg-zinc-200/80 border-black/[0.04]'
                : 'bg-white/[0.06] border-white/[0.04]'
            }`}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm'
                  : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
              }`}
              style={{ width: `${clampedPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer: Milestone Status */}
      <div className="mt-3 pt-2.5 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between text-xs">
        {isCompleted ? (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>{t.goalCompleted || 'Цель достигнута! 🎉'}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-zinc-500">
            <span>{t.goalRemaining || 'Осталось'}:</span>
            <span
              className={`font-mono font-semibold ${
                isLight ? 'text-zinc-800' : 'text-zinc-200'
              }`}
            >
              {formatMoney(remaining)}
            </span>
          </div>
        )}

        <div className="text-[11px] text-zinc-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>
            {period === 'month'
              ? t.goalPeriodMonth || 'Текущий месяц'
              : period === 'quarter'
              ? t.goalPeriodQuarter || 'Квартал'
              : t.goalPeriodAll || 'За все время'}
          </span>
        </div>
      </div>
    </div>
  );
};
