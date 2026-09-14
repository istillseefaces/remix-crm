import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowUpRight } from 'lucide-react';

export const StatsBar: React.FC = () => {
  const { activeTab, stats, t, quickPreset, setQuickPreset, formatMoney } = useApp();
  const isDeals = activeTab === 'deals';
  const preset = isDeals ? 'deals_overdue' : 'followup_due';
  const metrics = [
    { label: isDeals ? t.statTotalDeals : t.statArtists, value: isDeals ? stats.totalDeals : stats.totalArtists },
    { label: isDeals ? t.statWinRate : t.statConnectRate, value: `${isDeals ? stats.dealsWinRate : stats.connectRate}%`, detail: `(${isDeals ? stats.dealsClosedCount : stats.connectCount})` },
    { label: isDeals ? t.statDealsOverdue : t.statOverdue, value: isDeals ? stats.overdueDealsCount : stats.overdueFollowups, interactive: true },
    { label: isDeals ? t.statDealsToday : t.statTodayFollowups, value: isDeals ? stats.todayDealsCount : stats.todayFollowups },
    { label: t.statPipelineRevenue, value: formatMoney(stats.pipelineRevenue) },
    { label: t.statClosedRevenue, value: formatMoney(stats.closedRevenue), revenue: true },
  ];
  return <section className="studio-metrics">{metrics.map((metric, i) => {
    const content = <><span className="metric-label">{metric.label}</span><div className="metric-value">{metric.value}{metric.detail && <small>{metric.detail}</small>}</div>{metric.revenue && <ArrowUpRight size={17} className="metric-arrow" />}{metric.interactive && Number(metric.value) > 0 && <span className="metric-notice" />}</>;
    const className = `studio-metric ${metric.revenue ? 'metric-revenue' : ''} ${metric.interactive && quickPreset === preset ? 'is-selected' : ''}`;
    return metric.interactive ? <button key={i} className={className} aria-pressed={quickPreset === preset} onClick={() => setQuickPreset(quickPreset === preset ? 'all' : preset)}>{content}</button> : <div key={i} className={className}>{content}</div>;
  })}</section>;
};
