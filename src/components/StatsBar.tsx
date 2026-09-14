import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Activity,
  AlertCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  Briefcase,
} from 'lucide-react';

export const StatsBar: React.FC = () => {
  const {
    activeTab,
    stats,
    t,
    quickPreset,
    setQuickPreset,
    theme,
    formatMoney,
  } = useApp();
  const isLight = theme === 'light';

  const isDealsTab = activeTab === 'deals';

  return (
    <section
      className={`px-4 sm:px-6 lg:px-8 py-3 border-b shrink-0 select-none transition-colors duration-150 ${
        isLight
          ? 'bg-[#F8F9FA] border-black/[0.06]'
          : 'bg-[#0C0C0E] border-white/[0.04]'
      }`}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {isDealsTab ? (
          <>
            {/* Deals Tab - Metric 1: Total Deals */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                isLight
                  ? 'bg-white border-black/[0.06] hover:border-black/[0.12] shadow-xs'
                  : 'bg-[#111113]/80 border-white/[0.04] hover:border-white/[0.08]'
              }`}
            >
              <div>
                <div
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isLight ? 'text-zinc-500' : 'text-white/40'
                  }`}
                >
                  {t.statTotalDeals || 'Всего сделок'}
                </div>
                <div
                  className={`text-base font-bold font-mono mt-0.5 ${
                    isLight ? 'text-[#1A1A1E]' : 'text-white'
                  }`}
                >
                  {stats.totalDeals}
                </div>
              </div>
              <div
                className={`p-1.5 rounded-lg border ${
                  isLight
                    ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                }`}
              >
                <Briefcase className={`w-3.5 h-3.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
              </div>
            </div>

            {/* Deals Tab - Metric 2: Win Rate / Conversion */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                isLight
                  ? 'bg-white border-black/[0.06] hover:border-black/[0.12] shadow-xs'
                  : 'bg-[#111113]/80 border-white/[0.04] hover:border-white/[0.08]'
              }`}
            >
              <div>
                <div
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isLight ? 'text-zinc-500' : 'text-white/40'
                  }`}
                >
                  {t.statWinRate || 'Конверсия (Win Rate)'}
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span
                    className={`text-base font-bold font-mono ${
                      isLight ? 'text-emerald-700' : 'text-emerald-400'
                    }`}
                  >
                    {stats.dealsWinRate}%
                  </span>
                  <span
                    className={`text-[10px] font-mono ${
                      isLight ? 'text-zinc-400' : 'text-white/30'
                    }`}
                  >
                    ({stats.dealsClosedCount})
                  </span>
                </div>
              </div>
              <div
                className={`p-1.5 rounded-lg border ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Deals Tab - Metric 3: Overdue Deals (Clickable filter) */}
            <button
              type="button"
              onClick={() =>
                setQuickPreset(quickPreset === 'deals_overdue' ? 'all' : 'deals_overdue')
              }
              className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                stats.overdueDealsCount > 0
                  ? isLight
                    ? 'bg-red-50 border-red-200 hover:bg-red-100/70 text-red-900 shadow-xs ring-1 ring-red-300'
                    : 'bg-red-950/20 border-red-500/30 hover:bg-red-950/30 text-red-300 shadow-sm'
                  : isLight
                  ? 'bg-white border-black/[0.06] text-zinc-700 hover:border-black/[0.12] shadow-xs'
                  : 'bg-[#111113]/80 border-white/[0.04] text-white/60 hover:border-white/[0.08]'
              } ${quickPreset === 'deals_overdue' ? 'ring-2 ring-red-500' : ''}`}
            >
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <span>{t.statDealsOverdue || t.statOverdue}</span>
                  {stats.overdueDealsCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  )}
                </div>
                <div
                  className={`text-base font-bold font-mono mt-0.5 ${
                    stats.overdueDealsCount > 0
                      ? isLight
                        ? 'text-red-700 font-black'
                        : 'text-red-400'
                      : isLight
                      ? 'text-[#1A1A1E]'
                      : 'text-white'
                  }`}
                >
                  {stats.overdueDealsCount}
                </div>
              </div>
              <div
                className={`p-1.5 rounded-lg border ${
                  stats.overdueDealsCount > 0
                    ? isLight
                      ? 'bg-red-100 text-red-700 border-red-200'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                    : isLight
                    ? 'bg-black/[0.03] text-zinc-400 border-black/[0.04]'
                    : 'bg-white/[0.03] text-white/40 border-white/[0.04]'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Deals Tab - Metric 4: Deals Due Today */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                isLight
                  ? 'bg-white border-black/[0.06] hover:border-black/[0.12] shadow-xs'
                  : 'bg-[#111113]/80 border-white/[0.04] hover:border-white/[0.08]'
              }`}
            >
              <div>
                <div
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isLight ? 'text-zinc-500' : 'text-white/40'
                  }`}
                >
                  {t.statDealsToday || t.statTodayFollowups}
                </div>
                <div
                  className={`text-base font-bold font-mono mt-0.5 ${
                    isLight ? 'text-amber-800' : 'text-amber-300'
                  }`}
                >
                  {stats.todayDealsCount}
                </div>
              </div>
              <div
                className={`p-1.5 rounded-lg border ${
                  isLight
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Deals Tab - Metric 5: Pipeline Revenue */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                isLight
                  ? 'bg-white border-black/[0.06] hover:border-black/[0.12] shadow-xs'
                  : 'bg-[#111113]/80 border-white/[0.04] hover:border-white/[0.08]'
              }`}
            >
              <div>
                <div
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isLight ? 'text-zinc-500' : 'text-white/40'
                  }`}
                >
                  {t.statPipelineRevenue}
                </div>
                <div
                  className={`text-base font-bold font-mono mt-0.5 ${
                    isLight ? 'text-cyan-800' : 'text-cyan-400'
                  }`}
                >
                  {formatMoney(stats.pipelineRevenue)}
                </div>
              </div>
              <div
                className={`p-1.5 rounded-lg border ${
                  isLight
                    ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Deals Tab - Metric 6: Closed Won Revenue */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                isLight
                  ? 'bg-white border-black/[0.06] hover:border-black/[0.12] shadow-xs'
                  : 'bg-[#111113]/80 border-white/[0.04] hover:border-white/[0.08]'
              }`}
            >
              <div>
                <div
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isLight ? 'text-zinc-500' : 'text-white/40'
                  }`}
                >
                  {t.statClosedRevenue}
                </div>
                <div
                  className={`text-base font-bold font-mono mt-0.5 ${
                    isLight ? 'text-emerald-800' : 'text-emerald-300'
                  }`}
                >
                  {formatMoney(stats.closedRevenue)}
                </div>
              </div>
              <div
                className={`p-1.5 rounded-lg border ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Artists Tab - Metric 1: Total Artists */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                isLight
                  ? 'bg-white border-black/[0.06] hover:border-black/[0.12] shadow-xs'
                  : 'bg-[#111113]/80 border-white/[0.04] hover:border-white/[0.08]'
              }`}
            >
              <div>
                <div
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isLight ? 'text-zinc-500' : 'text-white/40'
                  }`}
                >
                  {t.statArtists}
                </div>
                <div
                  className={`text-base font-bold font-mono mt-0.5 ${
                    isLight ? 'text-[#1A1A1E]' : 'text-white'
                  }`}
                >
                  {stats.totalArtists}
                </div>
              </div>
              <div
                className={`p-1.5 rounded-lg border ${
                  isLight
                    ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                    : 'bg-white/[0.03] text-white/60 border border-white/[0.04]'
                }`}
              >
                <Users className={`w-3.5 h-3.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
              </div>
            </div>

            {/* Artists Tab - Metric 2: Connect Rate */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                isLight
                  ? 'bg-white border-black/[0.06] hover:border-black/[0.12] shadow-xs'
                  : 'bg-[#111113]/80 border-white/[0.04] hover:border-white/[0.08]'
              }`}
            >
              <div>
                <div
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isLight ? 'text-zinc-500' : 'text-white/40'
                  }`}
                >
                  {t.statConnectRate}
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span
                    className={`text-base font-bold font-mono ${
                      isLight ? 'text-emerald-700' : 'text-emerald-400'
                    }`}
                  >
                    {stats.connectRate}%
                  </span>
                  <span
                    className={`text-[10px] font-mono ${
                      isLight ? 'text-zinc-400' : 'text-white/30'
                    }`}
                  >
                    ({stats.connectCount})
                  </span>
                </div>
              </div>
              <div
                className={`p-1.5 rounded-lg border ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Artists Tab - Metric 3: Overdue Followups (Clickable quick filter) */}
            <button
              onClick={() => setQuickPreset(quickPreset === 'followup_due' ? 'all' : 'followup_due')}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                stats.overdueFollowups > 0
                  ? isLight
                    ? 'bg-red-50 border-red-200 hover:bg-red-100/70 text-red-900 shadow-xs ring-1 ring-red-300'
                    : 'bg-red-950/20 border-red-500/30 hover:bg-red-950/30 text-red-300 shadow-sm'
                  : isLight
                  ? 'bg-white border-black/[0.06] text-zinc-700 hover:border-black/[0.12] shadow-xs'
                  : 'bg-[#111113]/80 border-white/[0.04] text-white/60 hover:border-white/[0.08]'
              } ${quickPreset === 'followup_due' ? 'ring-2 ring-red-500' : ''}`}
            >
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <span>{t.statOverdue}</span>
                  {stats.overdueFollowups > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  )}
                </div>
                <div
                  className={`text-base font-bold font-mono mt-0.5 ${
                    stats.overdueFollowups > 0
                      ? isLight
                        ? 'text-red-700 font-black'
                        : 'text-red-400'
                      : isLight
                      ? 'text-[#1A1A1E]'
                      : 'text-white'
                  }`}
                >
                  {stats.overdueFollowups}
                </div>
              </div>
              <div
                className={`p-1.5 rounded-lg border ${
                  stats.overdueFollowups > 0
                    ? isLight
                      ? 'bg-red-100 text-red-700 border-red-200'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                    : isLight
                    ? 'bg-black/[0.03] text-zinc-400 border-black/[0.04]'
                    : 'bg-white/[0.03] text-white/40 border-white/[0.04]'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Artists Tab - Metric 4: Due Today */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                isLight
                  ? 'bg-white border-black/[0.06] hover:border-black/[0.12] shadow-xs'
                  : 'bg-[#111113]/80 border-white/[0.04] hover:border-white/[0.08]'
              }`}
            >
              <div>
                <div
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isLight ? 'text-zinc-500' : 'text-white/40'
                  }`}
                >
                  {t.statTodayFollowups}
                </div>
                <div
                  className={`text-base font-bold font-mono mt-0.5 ${
                    isLight ? 'text-amber-800' : 'text-amber-300'
                  }`}
                >
                  {stats.todayFollowups}
                </div>
              </div>
              <div
                className={`p-1.5 rounded-lg border ${
                  isLight
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Artists Tab - Metric 5: Active Deals Pipeline */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                isLight
                  ? 'bg-white border-black/[0.06] hover:border-black/[0.12] shadow-xs'
                  : 'bg-[#111113]/80 border-white/[0.04] hover:border-white/[0.08]'
              }`}
            >
              <div>
                <div
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isLight ? 'text-zinc-500' : 'text-white/40'
                  }`}
                >
                  {t.statPipelineRevenue}
                </div>
                <div
                  className={`text-base font-bold font-mono mt-0.5 ${
                    isLight ? 'text-cyan-800' : 'text-cyan-400'
                  }`}
                >
                  {formatMoney(stats.pipelineRevenue)}
                </div>
              </div>
              <div
                className={`p-1.5 rounded-lg border ${
                  isLight
                    ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Artists Tab - Metric 6: Closed Won Revenue */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                isLight
                  ? 'bg-white border-black/[0.06] hover:border-black/[0.12] shadow-xs'
                  : 'bg-[#111113]/80 border-white/[0.04] hover:border-white/[0.08]'
              }`}
            >
              <div>
                <div
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isLight ? 'text-zinc-500' : 'text-white/40'
                  }`}
                >
                  {t.statClosedRevenue}
                </div>
                <div
                  className={`text-base font-bold font-mono mt-0.5 ${
                    isLight ? 'text-emerald-800' : 'text-emerald-300'
                  }`}
                >
                  {formatMoney(stats.closedRevenue)}
                </div>
              </div>
              <div
                className={`p-1.5 rounded-lg border ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
