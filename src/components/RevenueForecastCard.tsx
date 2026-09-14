import React, { useMemo } from 'react';
import { TrendingUp, Zap, HelpCircle, CheckCircle2, Clock } from 'lucide-react';
import { Deal } from '../types';

interface RevenueForecastCardProps {
  isLight: boolean;
  deals: Deal[];
  formatMoney: (val: number) => string;
  t: any;
  currency: string;
}

export const RevenueForecastCard: React.FC<RevenueForecastCardProps> = ({
  isLight,
  deals,
  formatMoney,
  t,
  currency,
}) => {
  const forecast = useMemo(() => {
    const closedDeals = deals.filter((d) => d.stage === 'closed');
    const closedRevenue = closedDeals.reduce(
      (sum, d) => sum + (Number(d.amount) || 0),
      0
    );

    const inProgressDeals = deals.filter((d) => d.stage === 'in_progress');
    const interestedDeals = deals.filter((d) => d.stage === 'interested');

    const inProgressSum = inProgressDeals.reduce(
      (sum, d) => sum + (Number(d.amount) || 0),
      0
    );
    const interestedSum = interestedDeals.reduce(
      (sum, d) => sum + (Number(d.amount) || 0),
      0
    );

    // Probability weights:
    // In Progress: 70% probability
    // Interested: 30% probability
    const weightedInProgress = Math.round(inProgressSum * 0.7);
    const weightedInterested = Math.round(interestedSum * 0.3);
    const weightedPipeline = weightedInProgress + weightedInterested;
    const totalPipeline = inProgressSum + interestedSum;

    const totalExpected = closedRevenue + weightedPipeline;

    return {
      closedRevenue,
      closedCount: closedDeals.length,
      inProgressSum,
      inProgressCount: inProgressDeals.length,
      interestedSum,
      interestedCount: interestedDeals.length,
      totalPipeline,
      weightedPipeline,
      totalExpected,
    };
  }, [deals]);

  // Proportions for visual bar
  const totalMax = Math.max(1, forecast.closedRevenue + forecast.totalPipeline);
  const closedPct = Math.round((forecast.closedRevenue / totalMax) * 100);
  const weightedPct = Math.round((forecast.weightedPipeline / totalMax) * 100);
  const remainingPipelinePct = Math.max(0, 100 - closedPct - weightedPct);

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between relative transition-all duration-200 ${
        isLight
          ? 'bg-[#F8F9FA] border-black/[0.06] shadow-xs'
          : 'bg-[#151519] border-white/[0.04]'
      }`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-lg ${
                isLight ? 'bg-cyan-50 text-cyan-600' : 'bg-cyan-500/15 text-cyan-400'
              }`}
            >
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4
                className={`text-sm font-semibold tracking-tight ${
                  isLight ? 'text-[#1A1A1E]' : 'text-white'
                }`}
              >
                {t.revenueForecastTitle || 'Прогноз выручки (Revenue Forecast)'}
              </h4>
              <p className="text-[10px] text-zinc-400">
                {t.probabilityWeightHint || 'Взвешенный расчёт: Интерес (30%) + В процессе (70%)'}
              </p>
            </div>
          </div>
        </div>

        {/* Big Forecast Metrics Row */}
        <div className="grid grid-cols-2 gap-2 my-2">
          <div
            className={`p-2.5 rounded-xl border ${
              isLight ? 'bg-white border-black/[0.05]' : 'bg-[#18181C] border-white/[0.04]'
            }`}
          >
            <div className="text-[10px] text-zinc-400 font-medium flex items-center gap-1 mb-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>{t.actualClosed || 'Факт (Закрыто)'}</span>
            </div>
            <div
              className={`text-lg sm:text-xl font-bold font-mono tracking-tight ${
                isLight ? 'text-emerald-700' : 'text-emerald-400'
              }`}
            >
              {formatMoney(forecast.closedRevenue)}
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">
              {forecast.closedCount} {t.closedDeals || 'сделок'}
            </div>
          </div>

          <div
            className={`p-2.5 rounded-xl border ${
              isLight ? 'bg-white border-black/[0.05]' : 'bg-[#18181C] border-white/[0.04]'
            }`}
          >
            <div className="text-[10px] text-zinc-400 font-medium flex items-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-cyan-500" />
              <span>{t.weightedForecast || 'Взвешенный прогноз'}</span>
            </div>
            <div
              className={`text-lg sm:text-xl font-bold font-mono tracking-tight ${
                isLight ? 'text-cyan-700' : 'text-cyan-400'
              }`}
            >
              {formatMoney(forecast.weightedPipeline)}
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">
              из {formatMoney(forecast.totalPipeline)}
            </div>
          </div>
        </div>

        {/* Visual Stacked Bar: Actual vs Weighted Forecast vs Remaining Potential */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium">
            <span className={isLight ? 'text-zinc-600' : 'text-zinc-400'}>
              {t.forecastVsActual || 'Сравнение: Факт vs Прогноз'}
            </span>
            <span className="font-mono text-[11px] font-bold text-indigo-500">
              {formatMoney(forecast.totalExpected)} {t.totalExpectedRevenue ? `(Итого)` : ''}
            </span>
          </div>

          <div
            className={`w-full h-3 rounded-full overflow-hidden flex p-0.5 border ${
              isLight
                ? 'bg-zinc-200/80 border-black/[0.04]'
                : 'bg-white/[0.06] border-white/[0.04]'
            }`}
          >
            {/* Closed Actual */}
            <div
              title={`Факт: ${formatMoney(forecast.closedRevenue)}`}
              style={{ width: `${closedPct}%` }}
              className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
            />
            {/* Weighted Pipeline */}
            <div
              title={`Взвешенный прогноз: ${formatMoney(forecast.weightedPipeline)}`}
              style={{ width: `${weightedPct}%` }}
              className="bg-cyan-500 h-full transition-all duration-500"
            />
            {/* Unweighted Remaining Potential */}
            <div
              title={`Остаток потенциала: ${formatMoney(forecast.totalPipeline - forecast.weightedPipeline)}`}
              style={{ width: `${remainingPipelinePct}%` }}
              className="bg-zinc-400/40 h-full rounded-r-full transition-all duration-500"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>{t.actualClosed || 'Факт'} ({closedPct}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
              <span>{t.weightedForecast || 'Прогноз'} ({weightedPct}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-zinc-400/60 inline-block" />
              <span>{t.pipelinePotential || 'Потенциал'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Stage Breakdown */}
      <div className="mt-3 pt-2.5 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
          <span>{t.inProgressStage || 'В процессе'} (70%):</span>
          <span className="font-bold">{formatMoney(forecast.inProgressSum)}</span>
        </div>
        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
          <span>{t.interestedStage || 'Интерес'} (30%):</span>
          <span className="font-bold">{formatMoney(forecast.interestedSum)}</span>
        </div>
      </div>
    </div>
  );
};
