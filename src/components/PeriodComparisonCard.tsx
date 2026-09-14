import React, { useState, useMemo } from 'react';
import { CalendarRange, TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, DollarSign, Briefcase, Target, Zap, Send, HelpCircle, Clock, Sparkles } from 'lucide-react';
import { Users } from './InterfaceIcons';
import { Artist, Deal } from '../types';

interface PeriodComparisonCardProps {
  isLight: boolean;
  artists: Artist[];
  deals: Deal[];
  formatMoney: (val: number) => string;
  t: any;
  currency: string;
}

type PeriodOption = 7 | 14 | 30 | 90;

export const PeriodComparisonCard: React.FC<PeriodComparisonCardProps> = ({
  isLight,
  artists,
  deals,
  formatMoney,
  t,
  currency,
}) => {
  const [periodDays, setPeriodDays] = useState<PeriodOption>(30);

  // Helper date formatter
  const formatDateRange = (dStart: Date, dEnd: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const startStr = `${pad(dStart.getDate())}.${pad(dStart.getMonth() + 1)}`;
    const endStr = `${pad(dEnd.getDate())}.${pad(dEnd.getMonth() + 1)}`;
    return `${startStr} – ${endStr}`;
  };

  // Calculate current and previous periods
  const periodData = useMemo(() => {
    const now = new Date();

    // Current period bounds
    const curEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const curStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (periodDays - 1), 0, 0, 0, 0);

    // Previous period bounds
    const prevEnd = new Date(curStart.getTime() - 1);
    const prevStart = new Date(curStart.getFullYear(), curStart.getMonth(), curStart.getDate() - periodDays, 0, 0, 0, 0);

    const curStartMs = curStart.getTime();
    const curEndMs = curEnd.getTime();
    const prevStartMs = prevStart.getTime();
    const prevEndMs = prevEnd.getTime();

    // Extract metrics for a given timestamp interval
    const extractMetrics = (startMs: number, endMs: number) => {
      // Deals in interval
      const periodDeals = deals.filter((d) => {
        const dateStr = d.date || d.createdAt;
        if (!dateStr) return false;
        const time = new Date(dateStr).getTime();
        return !isNaN(time) && time >= startMs && time <= endMs;
      });

      const closed = periodDeals.filter((d) => d.stage === 'closed');
      const closedRevenue = closed.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      const closedDealsCount = closed.length;
      const avgDealSize = closedDealsCount > 0 ? Math.round(closedRevenue / closedDealsCount) : 0;

      const pipeline = periodDeals.filter((d) => d.stage === 'interested' || d.stage === 'in_progress');
      const pipelineValue = pipeline.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      const negotiationsCount = pipeline.length;

      // Artists in interval
      const periodArtists = artists.filter((a) => {
        const dateStr = a.createdAt || a.updatedAt;
        if (!dateStr) return false;
        const time = new Date(dateStr).getTime();
        return !isNaN(time) && time >= startMs && time <= endMs;
      });

      const newArtistsCount = periodArtists.length;
      const connectedCount = periodArtists.filter((a) => a.connect === 'yes').length;
      const connectRate = newArtistsCount > 0 ? Math.round((connectedCount / newArtistsCount) * 100) : 0;
      const demosSentCount = periodArtists.filter((a) => a.demoStatus && a.demoStatus !== 'none').length;

      return {
        closedRevenue,
        closedDealsCount,
        avgDealSize,
        pipelineValue,
        negotiationsCount,
        newArtistsCount,
        connectedCount,
        connectRate,
        demosSentCount,
        totalDeals: periodDeals.length,
      };
    };

    const cur = extractMetrics(curStartMs, curEndMs);
    const prev = extractMetrics(prevStartMs, prevEndMs);

    return {
      cur,
      prev,
      curLabel: formatDateRange(curStart, curEnd),
      prevLabel: formatDateRange(prevStart, prevEnd),
    };
  }, [artists, deals, periodDays]);

  // Delta calculation helper with percentage & direction
  const calcDelta = (current: number, previous: number) => {
    if (previous === 0) {
      if (current === 0) {
        return { pct: 0, isPositive: false, isNegative: false, isZero: true, text: '0%' };
      }
      return { pct: 100, isPositive: true, isNegative: false, isZero: false, text: '+100%' };
    }

    const diff = current - previous;
    const pct = Math.round((diff / previous) * 100);

    if (pct > 0) {
      return { pct, isPositive: true, isNegative: false, isZero: false, text: `+${pct}%` };
    } else if (pct < 0) {
      return { pct, isPositive: false, isNegative: true, isZero: false, text: `${pct}%` };
    } else {
      return { pct: 0, isPositive: false, isNegative: false, isZero: true, text: '0%' };
    }
  };

  // Delta for percentage rates (shows percentage points difference)
  const calcDeltaRate = (current: number, previous: number) => {
    const diff = current - previous;
    if (diff > 0) {
      return { pct: diff, isPositive: true, isNegative: false, isZero: false, text: `+${diff}%` };
    } else if (diff < 0) {
      return { pct: diff, isPositive: false, isNegative: true, isZero: false, text: `${diff}%` };
    } else {
      return { pct: 0, isPositive: false, isNegative: false, isZero: true, text: '0%' };
    }
  };

  const { cur, prev, curLabel, prevLabel } = periodData;

  // Metric definitions
  const metrics = [
    {
      id: 'closedRevenue',
      label: t.metricClosedRevenue || 'Выручка (Закрыто)',
      icon: DollarSign,
      iconColor: 'text-emerald-500',
      iconBg: isLight ? 'bg-emerald-50' : 'bg-emerald-500/10',
      currentFormatted: formatMoney(cur.closedRevenue),
      previousFormatted: formatMoney(prev.closedRevenue),
      delta: calcDelta(cur.closedRevenue, prev.closedRevenue),
      highlightColor: isLight ? 'text-emerald-700' : 'text-emerald-400',
    },
    {
      id: 'closedDeals',
      label: t.metricClosedDeals || 'Закрыто сделок',
      icon: Briefcase,
      iconColor: 'text-blue-500',
      iconBg: isLight ? 'bg-blue-50' : 'bg-blue-500/10',
      currentFormatted: `${cur.closedDealsCount}`,
      previousFormatted: `${prev.closedDealsCount}`,
      delta: calcDelta(cur.closedDealsCount, prev.closedDealsCount),
      highlightColor: isLight ? 'text-blue-700' : 'text-blue-400',
    },
    {
      id: 'avgCheck',
      label: t.metricAvgCheck || 'Средний чек',
      icon: Target,
      iconColor: 'text-purple-500',
      iconBg: isLight ? 'bg-purple-50' : 'bg-purple-500/10',
      currentFormatted: formatMoney(cur.avgDealSize),
      previousFormatted: formatMoney(prev.avgDealSize),
      delta: calcDelta(cur.avgDealSize, prev.avgDealSize),
      highlightColor: isLight ? 'text-purple-700' : 'text-purple-400',
    },
    {
      id: 'pipelineValue',
      label: t.metricActivePipeline || 'Пайплайн в работе',
      icon: Zap,
      iconColor: 'text-cyan-500',
      iconBg: isLight ? 'bg-cyan-50' : 'bg-cyan-500/10',
      currentFormatted: formatMoney(cur.pipelineValue),
      previousFormatted: formatMoney(prev.pipelineValue),
      delta: calcDelta(cur.pipelineValue, prev.pipelineValue),
      highlightColor: isLight ? 'text-cyan-700' : 'text-cyan-400',
    },
    {
      id: 'newArtists',
      label: t.metricNewArtists || 'Новые артисты',
      icon: Users,
      iconColor: 'text-indigo-500',
      iconBg: isLight ? 'bg-indigo-50' : 'bg-indigo-500/10',
      currentFormatted: `${cur.newArtistsCount}`,
      previousFormatted: `${prev.newArtistsCount}`,
      delta: calcDelta(cur.newArtistsCount, prev.newArtistsCount),
      highlightColor: isLight ? 'text-indigo-700' : 'text-indigo-400',
    },
    {
      id: 'connectRate',
      label: t.metricConnectRate || 'Конверсия в коннект',
      icon: Target,
      iconColor: 'text-amber-500',
      iconBg: isLight ? 'bg-amber-50' : 'bg-amber-500/10',
      currentFormatted: `${cur.connectRate}%`,
      previousFormatted: `${prev.connectRate}%`,
      delta: calcDeltaRate(cur.connectRate, prev.connectRate),
      highlightColor: isLight ? 'text-amber-700' : 'text-amber-400',
    },
    {
      id: 'demosSent',
      label: t.metricDemosSent || 'Отправлено демо',
      icon: Send,
      iconColor: 'text-pink-500',
      iconBg: isLight ? 'bg-pink-50' : 'bg-pink-500/10',
      currentFormatted: `${cur.demosSentCount}`,
      previousFormatted: `${prev.demosSentCount}`,
      delta: calcDelta(cur.demosSentCount, prev.demosSentCount),
      highlightColor: isLight ? 'text-pink-700' : 'text-pink-400',
    },
    {
      id: 'negotiations',
      label: t.metricNegotiations || 'Сделок в переговорах',
      icon: Clock,
      iconColor: 'text-teal-500',
      iconBg: isLight ? 'bg-teal-50' : 'bg-teal-500/10',
      currentFormatted: `${cur.negotiationsCount}`,
      previousFormatted: `${prev.negotiationsCount}`,
      delta: calcDelta(cur.negotiationsCount, prev.negotiationsCount),
      highlightColor: isLight ? 'text-teal-700' : 'text-teal-400',
    },
  ];

  // Quick overall summary calculation
  const revDiff = cur.closedRevenue - prev.closedRevenue;
  const isRevUp = revDiff >= 0;

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
        isLight
          ? 'bg-[var(--canvas)] border-black/[0.06] shadow-xs'
          : 'bg-[#151519] border-white/[0.04]'
      }`}
    >
      {/* Header: Title & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl ${
              isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/15 text-indigo-400'
            }`}
          >
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <h4
              className={`text-sm font-semibold tracking-tight ${
                isLight ? 'text-[var(--ink)]' : 'text-white'
              }`}
            >
              {t.periodComparisonTitle || 'Сравнение периодов (Period-over-Period)'}
            </h4>
            <p className="text-[11px] text-zinc-400">
              {t.periodComparisonSubtitle ||
                'Сравнение показателей текущего и предшествующего интервалов с расчётом динамики'}
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl border self-start sm:self-auto overflow-x-auto">
          {([7, 14, 30, 90] as PeriodOption[]).map((days) => (
            <button
              key={days}
              onClick={() => setPeriodDays(days)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                periodDays === days
                  ? isLight
                    ? 'bg-white text-indigo-700 font-bold shadow-xs border border-black/[0.06]'
                    : 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 font-semibold shadow-xs'
                  : isLight
                  ? 'text-zinc-600 hover:text-black hover:bg-black/[0.03]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {days === 30
                ? t.periodDays30 || '30 дней'
                : days === 7
                ? t.periodDays7 || '7 дней'
                : days === 14
                ? t.periodDays14 || '14 дней'
                : t.periodDays90 || '90 дней'}
            </button>
          ))}
        </div>
      </div>

      {/* Date Comparison Sub-header Banner */}
      <div
        className={`p-3 rounded-xl border mb-4 flex flex-wrap items-center justify-between gap-2.5 text-xs ${
          isLight
            ? 'bg-white border-black/[0.05]'
            : 'bg-[var(--surface-secondary)] border-white/[0.04]'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="font-medium text-zinc-500">
            {periodDays === 30
              ? t.periodCurrent30d || 'Текущие 30 дней'
              : `${t.currentPeriodLabel || 'Текущий период'} (${periodDays} дн.)`}:
          </span>
          <span
            className={`font-mono font-bold px-2 py-0.5 rounded-md border ${
              isLight
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
            }`}
          >
            {curLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-400">vs</span>
          <span className="font-medium text-zinc-500">
            {periodDays === 30
              ? t.periodPrevious30d || 'Предыдущие 30 дней'
              : `${t.previousPeriodLabel || 'Предыдущие'} (${periodDays} дн.)`}:
          </span>
          <span
            className={`font-mono font-medium px-2 py-0.5 rounded-md border ${
              isLight
                ? 'bg-zinc-100 text-zinc-600 border-zinc-200'
                : 'bg-white/[0.04] text-zinc-400 border-white/[0.06]'
            }`}
          >
            {prevLabel}
          </span>
        </div>
      </div>

      {/* 8-Metric Cards Grid with Dynamic Arrows Under Each Key Number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          const { isPositive, isNegative, isZero, text } = m.delta;

          return (
            <div
              key={m.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-colors ${
                isLight
                  ? 'bg-white border-black/[0.05] hover:border-black/[0.1]'
                  : 'bg-[var(--surface-secondary)] border-white/[0.04] hover:border-white/[0.08]'
              }`}
            >
              {/* Card Header: Label & Icon */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`text-xs font-medium truncate ${
                    isLight ? 'text-zinc-600' : 'text-zinc-400'
                  }`}
                >
                  {m.label}
                </span>
                <div className={`p-1.5 rounded-lg shrink-0 ${m.iconBg} ${m.iconColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Main Metric Figure */}
              <div>
                <div
                  className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${m.highlightColor}`}
                >
                  {m.currentFormatted}
                </div>

                {/* Trend Delta with Arrow Under the Key Figure */}
                <div className="flex items-center gap-1.5 mt-2">
                  {/* Dynamics Pill */}
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border transition-colors ${
                      isZero
                        ? isLight
                          ? 'bg-zinc-100 text-zinc-500 border-zinc-200'
                          : 'bg-white/[0.04] text-zinc-400 border-white/[0.06]'
                        : isPositive
                        ? isLight
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : isLight
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {isZero ? (
                      <Minus className="w-3 h-3" />
                    ) : isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                    <span>{text}</span>
                  </div>

                  {/* Previous Period Context Label */}
                  <span className="text-[10px] text-zinc-400 truncate">
                    {t.previousPeriodValue || 'ранее'}: {m.previousFormatted}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Progress Bar & Summary Note */}
      <div
        className={`mt-4 p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
          isLight ? 'bg-white border-black/[0.05]' : 'bg-[var(--surface-secondary)] border-white/[0.04]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`p-1.5 rounded-lg shrink-0 ${
              isRevUp
                ? isLight
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-emerald-500/15 text-emerald-400'
                : isLight
                ? 'bg-rose-50 text-rose-600'
                : 'bg-rose-500/15 text-rose-400'
            }`}
          >
            {isRevUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <span
              className={`font-semibold ${
                isLight ? 'text-zinc-800' : 'text-zinc-200'
              }`}
            >
              {isRevUp
                ? t.periodSummaryPositive || 'Положительный тренд по ключевым метрикам'
                : t.periodSummaryNegative || 'Снижение показателей относительно прошлого периода'}
            </span>
            <p className="text-[11px] text-zinc-400 truncate">
              {isRevUp ? '+' : ''}
              {formatMoney(revDiff)} разницы по закрытой выручке между периодами
            </p>
          </div>
        </div>

        {/* Compact Visual Bars: Revenue (Cur vs Prev) */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto font-mono text-[11px]">
          <div className="text-right">
            <div className="text-[10px] text-zinc-400">{t.currentPeriodLabel || 'Текущий'}:</div>
            <div className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatMoney(cur.closedRevenue)}
            </div>
          </div>
          <div className="text-zinc-400">/</div>
          <div className="text-left">
            <div className="text-[10px] text-zinc-400">{t.previousPeriodLabel || 'Предыдущий'}:</div>
            <div className="font-bold text-zinc-500">
              {formatMoney(prev.closedRevenue)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
