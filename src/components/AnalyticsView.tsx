import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AnalyticsSubTab, AnalyticsTimeRange, DealPlatform, Deal } from '../types';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Layers,
  ArrowRightLeft,
  DollarSign,
  Users,
  Target,
  Clock,
  Sparkles,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
  Briefcase,
  ArrowUpRight,
  TrendingDown,
  CalendarDays,
  ListFilter,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
} from 'recharts';
import { FinancialGoalsCard } from './FinancialGoalsCard';
import { RevenueForecastCard } from './RevenueForecastCard';
import { LtvScoreCard } from './LtvScoreCard';
import { PeriodComparisonCard } from './PeriodComparisonCard';

export const AnalyticsView: React.FC = () => {
  const {
    artists,
    deals,
    t,
    lang,
    theme,
    currency,
    formatMoney,
    resetToSampleData,
    setIsNewArtistModalOpen,
    setIsNewDealModalOpen,
  } = useApp();

  const isLight = theme === 'light';

  // Sub-tabs: overview | deals_analytics | revenue | distribution | genres | comparison
  const [subTab, setSubTab] = useState<AnalyticsSubTab>('overview');

  // Filters
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  // Deals analytics grouping: daily or weekly
  const [dealsGrouping, setDealsGrouping] = useState<'daily' | 'weekly'>('daily');

  // Comparison selectors
  const [compareA, setCompareA] = useState<string>('Instagram');
  const [compareB, setCompareB] = useState<string>('Telegram');

  // Color palette for charts
  const COLORS = {
    indigo: isLight ? '#4F46E5' : '#6366F1',
    cyan: isLight ? '#0891B2' : '#06B6D4',
    emerald: isLight ? '#059669' : '#10B981',
    amber: isLight ? '#D97706' : '#F59E0B',
    pink: isLight ? '#DB2777' : '#EC4899',
    purple: isLight ? '#9333EA' : '#A855F7',
    red: isLight ? '#DC2626' : '#EF4444',
    blue: isLight ? '#2563EB' : '#3B82F6',
    zinc: isLight ? '#9CA3AF' : '#71717A',
  };

  const PIE_PALETTE = ['#6366F1', '#10B981', '#06B6D4', '#F59E0B', '#EC4899', '#A855F7', '#EF4444'];

  // Filter cutoff date
  const dateCutoff = useMemo(() => {
    if (timeRange === 'all') return null;
    const d = new Date();
    let days = 0;
    if (timeRange === '3d') days = 3;
    else if (timeRange === '7d') days = 7;
    else if (timeRange === '14d') days = 14;
    else if (timeRange === '30d') days = 30;
    else if (timeRange === '90d') days = 90;

    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  }, [timeRange]);

  // Filtered Deals by Date & Platform
  const filteredDeals = useMemo(() => {
    return deals.filter((d) => {
      const dealDate = d.date || d.createdAt;
      if (dateCutoff && dealDate && dealDate < dateCutoff) return false;
      if (platformFilter !== 'all' && d.platform !== platformFilter) return false;
      return true;
    });
  }, [deals, dateCutoff, platformFilter]);

  // Filtered Artists by Date & Platform
  const filteredArtists = useMemo(() => {
    return artists.filter((a) => {
      const artistDate = a.updatedAt || a.createdAt;
      if (dateCutoff && artistDate && artistDate < dateCutoff) return false;
      if (platformFilter !== 'all') {
        if (platformFilter === 'Instagram' && !a.instagram) return false;
        if (platformFilter === 'Telegram' && !a.telegram) return false;
        if (platformFilter === 'Email' && !a.email) return false;
        if (platformFilter === 'Discord' && !a.discord) return false;
        if (platformFilter === 'iMessage' && !a.phone) return false;
      }
      return true;
    });
  }, [artists, dateCutoff, platformFilter]);

  // Overall KPIs for current period
  const totalRevenue = useMemo(() => {
    return filteredDeals
      .filter((d) => d.stage === 'closed')
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  }, [filteredDeals]);

  const pipelineValue = useMemo(() => {
    return filteredDeals
      .filter((d) => d.stage === 'interested' || d.stage === 'in_progress')
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  }, [filteredDeals]);

  const closedDeals = useMemo(() => {
    return filteredDeals.filter((d) => d.stage === 'closed');
  }, [filteredDeals]);

  const avgDealSize = useMemo(() => {
    return closedDeals.length > 0 ? Math.round(totalRevenue / closedDeals.length) : 0;
  }, [closedDeals, totalRevenue]);

  const dealWinRate = useMemo(() => {
    const closed = closedDeals.length;
    const cancelled = filteredDeals.filter((d) => d.stage === 'cancelled').length;
    const resolved = closed + cancelled;
    return resolved > 0 ? Math.round((closed / resolved) * 100) : closed > 0 ? 100 : 0;
  }, [closedDeals, filteredDeals]);

  // Funnel calculations
  const funnelData = useMemo(() => {
    const total = filteredArtists.length;
    const connected = filteredArtists.filter((a) => a.connect === 'yes').length;
    const demoSent = filteredArtists.filter((a) => a.demoStatus !== 'none').length;
    const demoLiked = filteredArtists.filter(
      (a) => a.demoStatus === 'liked' || a.demoStatus === 'in_progress'
    ).length;
    const inPipeline = filteredDeals.filter(
      (d) => d.stage === 'interested' || d.stage === 'in_progress'
    ).length;
    const closedWon = closedDeals.length;

    return [
      { step: t.funnelFound, count: total, pct: 100, color: COLORS.indigo },
      {
        step: t.funnelConnected,
        count: connected,
        pct: total ? Math.round((connected / total) * 100) : 0,
        color: COLORS.cyan,
      },
      {
        step: t.funnelDemoSent,
        count: demoSent,
        pct: total ? Math.round((demoSent / total) * 100) : 0,
        color: COLORS.blue,
      },
      {
        step: t.funnelDemoLiked,
        count: demoLiked,
        pct: total ? Math.round((demoLiked / total) * 100) : 0,
        color: COLORS.purple,
      },
      {
        step: t.funnelInPipeline,
        count: inPipeline,
        pct: total ? Math.round((inPipeline / total) * 100) : 0,
        color: COLORS.amber,
      },
      {
        step: t.funnelClosedWon,
        count: closedWon,
        pct: total ? Math.round((closedWon / total) * 100) : 0,
        color: COLORS.emerald,
      },
    ];
  }, [filteredArtists, filteredDeals, closedDeals, t, COLORS]);

  // Deals Velocity & Dynamics (Daily / Weekly aggregation for Deals Analytics)
  const dealsVelocityTimeline = useMemo(() => {
    const map: Record<
      string,
      {
        date: string;
        label: string;
        revenue: number;
        closedCount: number;
        pipeline: number;
        totalDeals: number;
      }
    > = {};

    const sorted = [...filteredDeals].sort((a, b) => {
      const dateA = a.date || a.createdAt || '';
      const dateB = b.date || b.createdAt || '';
      return dateA.localeCompare(dateB);
    });

    sorted.forEach((d) => {
      const fullDate = d.date || d.createdAt || new Date().toISOString().split('T')[0];
      let key = fullDate;

      if (dealsGrouping === 'weekly') {
        const dateObj = new Date(fullDate);
        if (!isNaN(dateObj.getTime())) {
          const day = dateObj.getDay();
          const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1);
          const monday = new Date(dateObj.setDate(diff));
          key = `W-${monday.toISOString().split('T')[0]}`;
        }
      }

      if (!map[key]) {
        const displayLabel = dealsGrouping === 'weekly' ? key.replace('W-', 'Неделя ') : key;
        map[key] = {
          date: key,
          label: displayLabel,
          revenue: 0,
          closedCount: 0,
          pipeline: 0,
          totalDeals: 0,
        };
      }

      map[key].totalDeals += 1;
      const amt = Number(d.amount) || 0;
      if (d.stage === 'closed') {
        map[key].revenue += amt;
        map[key].closedCount += 1;
      } else if (d.stage === 'interested' || d.stage === 'in_progress') {
        map[key].pipeline += amt;
      }
    });

    const entries = Object.values(map);
    if (entries.length === 0) {
      return [
        {
          date: '—',
          label: 'Нет данных',
          revenue: 0,
          closedCount: 0,
          pipeline: 0,
          totalDeals: 0,
        },
      ];
    }
    return entries;
  }, [filteredDeals, dealsGrouping]);

  // Revenue Timeline Data for monthly / general view
  const revenueTimeline = useMemo(() => {
    const map: Record<
      string,
      { date: string; revenue: number; pipeline: number; dealCount: number }
    > = {};

    const sorted = [...filteredDeals].sort((a, b) =>
      (a.date || '').localeCompare(b.date || '')
    );

    sorted.forEach((d) => {
      const dateVal = d.date || d.createdAt || '';
      const periodKey =
        timeRange === '3d' || timeRange === '7d' || timeRange === '14d'
          ? dateVal
          : dateVal
          ? dateVal.substring(0, 7)
          : '2026-08';

      if (!map[periodKey]) {
        map[periodKey] = { date: periodKey, revenue: 0, pipeline: 0, dealCount: 0 };
      }
      if (d.stage === 'closed') {
        map[periodKey].revenue += Number(d.amount) || 0;
      } else if (d.stage === 'interested' || d.stage === 'in_progress') {
        map[periodKey].pipeline += Number(d.amount) || 0;
      }
      map[periodKey].dealCount += 1;
    });

    const result = Object.values(map);
    if (result.length === 0) {
      return [
        { date: '2026-05', revenue: 0, pipeline: 0, dealCount: 0 },
        { date: '2026-06', revenue: 0, pipeline: 0, dealCount: 0 },
        { date: '2026-07', revenue: 0, pipeline: 0, dealCount: 0 },
        { date: '2026-08', revenue: 0, pipeline: 0, dealCount: 0 },
      ];
    }
    return result;
  }, [filteredDeals, timeRange]);

  // Revenue by Platform Data
  const platformRevenueData = useMemo(() => {
    const platforms: DealPlatform[] = [
      'Instagram',
      'Telegram',
      'iMessage',
      'Discord',
      'Email',
      'Other',
    ];
    return platforms.map((p) => {
      const pDeals = filteredDeals.filter((d) => d.platform === p);
      const closedRev = pDeals
        .filter((d) => d.stage === 'closed')
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      const pipeRev = pDeals
        .filter((d) => d.stage === 'interested' || d.stage === 'in_progress')
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      const closedCount = pDeals.filter((d) => d.stage === 'closed').length;
      return {
        name: p,
        closed: closedRev,
        pipeline: pipeRev,
        deals: pDeals.length,
        closedCount,
        avgCheck: closedCount > 0 ? Math.round(closedRev / closedCount) : 0,
      };
    });
  }, [filteredDeals]);

  // Pie chart datasets
  const artistStatusData = useMemo(() => {
    const active = filteredArtists.filter((a) => a.status === 'active').length;
    const passive = filteredArtists.filter((a) => a.status === 'passive').length;
    const dead = filteredArtists.filter((a) => a.status === 'dead').length;
    return [
      { name: t.statusActive, value: active, color: COLORS.emerald },
      { name: t.statusPassive, value: passive, color: COLORS.amber },
      { name: t.statusDead, value: dead, color: COLORS.zinc },
    ].filter((x) => x.value > 0);
  }, [filteredArtists, t, COLORS]);

  const demoStatusData = useMemo(() => {
    const counts: Record<string, number> = {
      [t.demoLiked]: 0,
      [t.demoInProgress]: 0,
      [t.demoSent]: 0,
      [t.demoNone]: 0,
      [t.demoRejected]: 0,
    };
    filteredArtists.forEach((a) => {
      if (a.demoStatus === 'liked') counts[t.demoLiked]++;
      else if (a.demoStatus === 'in_progress') counts[t.demoInProgress]++;
      else if (a.demoStatus === 'sent') counts[t.demoSent]++;
      else if (a.demoStatus === 'rejected') counts[t.demoRejected]++;
      else counts[t.demoNone]++;
    });
    return Object.entries(counts)
      .map(([name, value], idx) => ({
        name,
        value,
        color: PIE_PALETTE[idx % PIE_PALETTE.length],
      }))
      .filter((x) => x.value > 0);
  }, [filteredArtists, t, PIE_PALETTE]);

  const dealStageData = useMemo(() => {
    const counts: Record<string, number> = {
      [t.stageClosed]: 0,
      [t.stageInProgress]: 0,
      [t.stageInterested]: 0,
      [t.stageCancelled]: 0,
    };
    filteredDeals.forEach((d) => {
      if (d.stage === 'closed') counts[t.stageClosed]++;
      else if (d.stage === 'in_progress') counts[t.stageInProgress]++;
      else if (d.stage === 'interested') counts[t.stageInterested]++;
      else if (d.stage === 'cancelled') counts[t.stageCancelled]++;
    });
    return [
      { name: t.stageClosed, value: counts[t.stageClosed], color: COLORS.emerald },
      { name: t.stageInProgress, value: counts[t.stageInProgress], color: COLORS.cyan },
      { name: t.stageInterested, value: counts[t.stageInterested], color: COLORS.amber },
      { name: t.stageCancelled, value: counts[t.stageCancelled], color: COLORS.red },
    ].filter((x) => x.value > 0);
  }, [filteredDeals, t, COLORS]);

  const reactionsData = useMemo(() => {
    const counts: Record<string, number> = {
      [t.reactionReadyToBuy]: 0,
      [t.reactionWantsMore]: 0,
      [t.reactionReplied]: 0,
      [t.reactionListening]: 0,
      [t.reactionIgnored]: 0,
      [t.reactionNone]: 0,
    };
    filteredArtists.forEach((a) => {
      if (a.reaction === 'ready_to_buy') counts[t.reactionReadyToBuy]++;
      else if (a.reaction === 'wants_more') counts[t.reactionWantsMore]++;
      else if (a.reaction === 'replied') counts[t.reactionReplied]++;
      else if (a.reaction === 'listening') counts[t.reactionListening]++;
      else if (a.reaction === 'ignored') counts[t.reactionIgnored]++;
      else counts[t.reactionNone]++;
    });
    return Object.entries(counts)
      .map(([name, value], idx) => ({
        name,
        value,
        color: PIE_PALETTE[idx % PIE_PALETTE.length],
      }))
      .filter((x) => x.value > 0);
  }, [filteredArtists, t, PIE_PALETTE]);

  // Genre / Sound Tag Analytics
  const genreStats = useMemo(() => {
    const map: Record<
      string,
      {
        tag: string;
        count: number;
        connectYes: number;
        salesYes: number;
        revenue: number;
      }
    > = {};
    filteredArtists.forEach((a) => {
      (a.types || []).forEach((tName) => {
        const clean = tName.trim();
        if (!clean) return;
        if (!map[clean]) {
          map[clean] = { tag: clean, count: 0, connectYes: 0, salesYes: 0, revenue: 0 };
        }
        map[clean].count++;
        if (a.connect === 'yes') map[clean].connectYes++;
        if (a.sales === 'yes') map[clean].salesYes++;
      });
    });

    filteredDeals.forEach((d) => {
      const artist = filteredArtists.find(
        (a) => a.name.toLowerCase().trim() === d.artistName.toLowerCase().trim()
      );
      if (artist && artist.types) {
        artist.types.forEach((tName) => {
          const clean = tName.trim();
          if (map[clean] && d.stage === 'closed') {
            map[clean].revenue += Number(d.amount) || 0;
          }
        });
      }
    });

    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [filteredArtists, filteredDeals]);

  // Comparison helper stats
  const getChannelMetrics = (platform: string) => {
    const matchingDeals = filteredDeals.filter(
      (d) => d.platform.toLowerCase() === platform.toLowerCase()
    );
    const closed = matchingDeals.filter((d) => d.stage === 'closed');
    const revenue = closed.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const avgDeal = closed.length > 0 ? Math.round(revenue / closed.length) : 0;

    const matchingArtists = filteredArtists.filter((a) => {
      if (platform.toLowerCase() === 'instagram') return !!a.instagram;
      if (platform.toLowerCase() === 'telegram') return !!a.telegram;
      if (platform.toLowerCase() === 'email') return !!a.email;
      if (platform.toLowerCase() === 'discord') return !!a.discord;
      if (platform.toLowerCase() === 'imessage') return !!a.phone;
      return false;
    });

    const connected = matchingArtists.filter((a) => a.connect === 'yes').length;
    const connectRate =
      matchingArtists.length > 0
        ? Math.round((connected / matchingArtists.length) * 100)
        : 0;
    const totalTouches = matchingArtists.reduce((acc, a) => acc + (a.touches || 0), 0);
    const avgTouches =
      matchingArtists.length > 0
        ? (totalTouches / matchingArtists.length).toFixed(1)
        : '0';

    return {
      name: platform,
      artistCount: matchingArtists.length,
      connectRate,
      dealsCount: matchingDeals.length,
      closedCount: closed.length,
      revenue,
      avgDeal,
      avgTouches,
    };
  };

  const compDataA = useMemo(
    () => getChannelMetrics(compareA),
    [compareA, filteredArtists, filteredDeals]
  );
  const compDataB = useMemo(
    () => getChannelMetrics(compareB),
    [compareB, filteredArtists, filteredDeals]
  );

  const isDatabaseEmpty = artists.length === 0 && deals.length === 0;

  const timeframeButtons: { id: AnalyticsTimeRange; label: string }[] = [
    { id: '3d', label: t.timeFilter3d },
    { id: '7d', label: t.timeFilter7d },
    { id: '14d', label: t.timeFilter14d },
    { id: '30d', label: t.timeFilter30d },
    { id: '90d', label: t.timeFilter90d },
    { id: 'all', label: t.timeFilterAll },
  ];

  return (
    <div
      className={`flex-1 overflow-hidden p-3 sm:p-4 lg:p-6 flex flex-col min-h-0 relative transition-colors duration-150 ${
        isLight ? 'bg-[#F8F9FA]' : 'bg-[#0C0C0E]'
      }`}
    >
      <div
        className={`h-full border rounded-2xl overflow-hidden flex flex-col relative transition-colors duration-150 ${
          isLight
            ? 'bg-white border-black/[0.06] shadow-xs'
            : 'bg-[#111113]/60 border-white/[0.04] backdrop-blur-sm shadow-2xl'
        }`}
      >
        {/* Top Analytics Header & Navigation */}
        <div
          className={`p-3.5 lg:p-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            isLight
              ? 'bg-[#F8F9FA] border-black/[0.06]'
              : 'bg-[#141418]/90 backdrop-blur-md border-white/[0.04]'
          }`}
        >
          {/* Sub-Tabs Pills */}
          <div
            className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto ${
              isLight
                ? 'bg-[#F1F3F5] border-black/[0.06]'
                : 'bg-[#18181C] border-white/[0.04]'
            }`}
          >
            <button
              onClick={() => setSubTab('overview')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                subTab === 'overview'
                  ? isLight
                    ? 'bg-white text-indigo-700 font-bold shadow-xs border border-black/[0.06]'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold shadow-xs'
                  : isLight
                  ? 'text-zinc-600 hover:text-black hover:bg-black/[0.03]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t.analyticsOverview}</span>
            </button>

            {/* Dedicated Deals Analytics Sub-Tab */}
            <button
              onClick={() => setSubTab('deals_analytics')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                subTab === 'deals_analytics'
                  ? isLight
                    ? 'bg-white text-emerald-800 font-bold shadow-xs border border-black/[0.06]'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold shadow-xs'
                  : isLight
                  ? 'text-zinc-600 hover:text-black hover:bg-black/[0.03]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{t.analyticsDealsTab}</span>
            </button>

            <button
              onClick={() => setSubTab('revenue')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                subTab === 'revenue'
                  ? isLight
                    ? 'bg-white text-amber-800 font-bold shadow-xs border border-black/[0.06]'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold shadow-xs'
                  : isLight
                  ? 'text-zinc-600 hover:text-black hover:bg-black/[0.03]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>{t.analyticsRevenue}</span>
            </button>

            <button
              onClick={() => setSubTab('distribution')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                subTab === 'distribution'
                  ? isLight
                    ? 'bg-white text-cyan-800 font-bold shadow-xs border border-black/[0.06]'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold shadow-xs'
                  : isLight
                  ? 'text-zinc-600 hover:text-black hover:bg-black/[0.03]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>{t.analyticsDistribution}</span>
            </button>

            <button
              onClick={() => setSubTab('genres')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                subTab === 'genres'
                  ? isLight
                    ? 'bg-white text-purple-800 font-bold shadow-xs border border-black/[0.06]'
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold shadow-xs'
                  : isLight
                  ? 'text-zinc-600 hover:text-black hover:bg-black/[0.03]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t.analyticsGenres}</span>
            </button>

            <button
              onClick={() => setSubTab('comparison')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                subTab === 'comparison'
                  ? isLight
                    ? 'bg-white text-pink-800 font-bold shadow-xs border border-black/[0.06]'
                    : 'bg-pink-500/20 text-pink-300 border border-pink-500/30 font-semibold shadow-xs'
                  : isLight
                  ? 'text-zinc-600 hover:text-black hover:bg-black/[0.03]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{t.analyticsComparison}</span>
            </button>
          </div>

          {/* Quick Interactive Filters Bar: Timeframe & Platform */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Timeframe Selector Button Group */}
            <div
              className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto ${
                isLight
                  ? 'bg-[#F1F3F5] border-black/[0.06]'
                  : 'bg-[#18181C] border-white/[0.06]'
              }`}
            >
              <div
                className={`flex items-center gap-1 text-[11px] px-2 font-medium shrink-0 ${
                  isLight ? 'text-zinc-500' : 'text-zinc-400'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">{t.timeframeSelector}:</span>
              </div>
              {timeframeButtons.map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setTimeRange(tf.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap active:scale-95 ${
                    timeRange === tf.id
                      ? isLight
                        ? 'bg-white text-indigo-700 font-bold shadow-xs border border-black/[0.06]'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-xs font-semibold'
                      : isLight
                      ? 'text-zinc-600 hover:text-black hover:bg-black/[0.03]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Platform Filter */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs ${
                isLight
                  ? 'bg-[#F1F3F5] border-black/[0.06] text-zinc-800'
                  : 'bg-[#18181C] border-white/[0.06] text-zinc-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="bg-transparent text-xs focus:outline-none cursor-pointer"
              >
                <option value="all" className={isLight ? 'bg-white text-zinc-800' : 'bg-[#18181C]'}>
                  {t.allPlatforms}
                </option>
                <option value="Instagram" className={isLight ? 'bg-white text-zinc-800' : 'bg-[#18181C]'}>
                  Instagram
                </option>
                <option value="Telegram" className={isLight ? 'bg-white text-zinc-800' : 'bg-[#18181C]'}>
                  Telegram
                </option>
                <option value="iMessage" className={isLight ? 'bg-white text-zinc-800' : 'bg-[#18181C]'}>
                  iMessage
                </option>
                <option value="Discord" className={isLight ? 'bg-white text-zinc-800' : 'bg-[#18181C]'}>
                  Discord
                </option>
                <option value="Email" className={isLight ? 'bg-white text-zinc-800' : 'bg-[#18181C]'}>
                  Email
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Analytics Workspace Body */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {isDatabaseEmpty ? (
            <div
              className={`h-96 flex flex-col items-center justify-center p-8 text-center border rounded-2xl ${
                isLight
                  ? 'bg-[#F8F9FA] border-black/[0.06]'
                  : 'bg-[#141418]/40 border-white/[0.04]'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 shadow-sm ${
                  isLight
                    ? 'bg-white border-black/[0.06] text-pink-600'
                    : 'bg-[#18181C] border-white/[0.08] text-pink-400'
                }`}
              >
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className={`text-base font-semibold mb-1.5 ${isLight ? 'text-[#1A1A1E]' : 'text-white'}`}>
                {t.emptyAnalyticsTitle}
              </h3>
              <p className={`text-xs max-w-md mb-6 leading-relaxed ${isLight ? 'text-zinc-500' : 'text-white/50'}`}>
                {t.emptyAnalyticsDesc}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={resetToSampleData}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-semibold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.loadDemoDataAction}</span>
                </button>
                <button
                  onClick={() => setIsNewArtistModalOpen(true)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                    isLight
                      ? 'bg-[#F1F3F5] hover:bg-black/[0.06] text-zinc-800 border-black/[0.06]'
                      : 'bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border-white/[0.06]'
                  }`}
                >
                  + {t.addArtist}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 1. OVERVIEW & FUNNEL SUB-TAB */}
              {subTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Top KPI Cards Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                    {/* Card 1: Total Artists */}
                    <div
                      className={`p-4 rounded-xl border relative overflow-hidden transition-colors ${
                        isLight
                          ? 'bg-[#F8F9FA] border-black/[0.06]'
                          : 'bg-[#151519] border-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[11px] font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                          {t.statArtists}
                        </span>
                        <Users className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className={`text-2xl font-bold font-mono tracking-tight ${isLight ? 'text-[#1A1A1E]' : 'text-white'}`}>
                        {filteredArtists.length}
                      </div>
                      <div className="mt-1 text-[10px] text-zinc-500 flex items-center gap-1">
                        <span className="text-emerald-600 font-semibold font-mono">
                          {filteredArtists.filter((a) => a.connect === 'yes').length}
                        </span>
                        <span>connected</span>
                      </div>
                    </div>

                    {/* Card 2: Revenue Won */}
                    <div
                      className={`p-4 rounded-xl border relative overflow-hidden transition-colors ${
                        isLight
                          ? 'bg-[#F8F9FA] border-black/[0.06]'
                          : 'bg-[#151519] border-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[11px] font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                          {t.statClosedRevenue}
                        </span>
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className={`text-2xl font-bold font-mono tracking-tight ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                        {formatMoney(totalRevenue)}
                      </div>
                      <div className="mt-1 text-[10px] text-zinc-500 flex items-center gap-1">
                        <span>Avg check:</span>
                        <span className={`font-mono font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                          {formatMoney(avgDealSize)}
                        </span>
                      </div>
                    </div>

                    {/* Card 3: Pipeline Value */}
                    <div
                      className={`p-4 rounded-xl border relative overflow-hidden transition-colors ${
                        isLight
                          ? 'bg-[#F8F9FA] border-black/[0.06]'
                          : 'bg-[#151519] border-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[11px] font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                          {t.statPipelineRevenue}
                        </span>
                        <Zap className="w-4 h-4 text-cyan-500" />
                      </div>
                      <div className={`text-2xl font-bold font-mono tracking-tight ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
                        {formatMoney(pipelineValue)}
                      </div>
                      <div className="mt-1 text-[10px] text-zinc-500 flex items-center gap-1">
                        <span className="text-cyan-600 font-mono font-semibold">
                          {
                            filteredDeals.filter(
                              (d) => d.stage === 'interested' || d.stage === 'in_progress'
                            ).length
                          }
                        </span>
                        <span>active negotiations</span>
                      </div>
                    </div>

                    {/* Card 4: Connect & Win Rate */}
                    <div
                      className={`p-4 rounded-xl border relative overflow-hidden transition-colors ${
                        isLight
                          ? 'bg-[#F8F9FA] border-black/[0.06]'
                          : 'bg-[#151519] border-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[11px] font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                          {t.conversionRate}
                        </span>
                        <Target className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className={`text-2xl font-bold font-mono tracking-tight ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
                        {filteredArtists.length > 0
                          ? Math.round((closedDeals.length / filteredArtists.length) * 100)
                          : 0}
                        %
                      </div>
                      <div className="mt-1 text-[10px] text-zinc-500 flex items-center gap-1">
                        <span>Outreach to closed sale</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Goals & Revenue Forecast & LTV Score Modules */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <FinancialGoalsCard
                      isLight={isLight}
                      deals={deals}
                      formatMoney={formatMoney}
                      t={t}
                      currency={currency}
                    />
                    <RevenueForecastCard
                      isLight={isLight}
                      deals={filteredDeals}
                      formatMoney={formatMoney}
                      t={t}
                      currency={currency}
                    />
                  </div>

                  {/* LTV Score Card: Top Clients by Revenue & Repeat Deals */}
                  <LtvScoreCard
                    isLight={isLight}
                    artists={artists}
                    deals={deals}
                    formatMoney={formatMoney}
                    t={t}
                  />

                  {/* Outreach & Sales Funnel Visualization */}
                  <div
                    className={`p-5 rounded-2xl border space-y-4 ${
                      isLight
                        ? 'bg-[#F8F9FA] border-black/[0.06]'
                        : 'bg-[#151519] border-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`text-sm font-semibold flex items-center gap-2 ${isLight ? 'text-[#1A1A1E]' : 'text-white'}`}>
                          <Target className="w-4 h-4 text-indigo-500" />
                          <span>{t.outreachFunnel}</span>
                        </h4>
                        <p className={`text-[11px] mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          Step-by-step conversion from cold outreach to signed exclusive & lease deals
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      {funnelData.map((item, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-zinc-400">0{idx + 1}</span>
                              <span className={`font-medium ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>
                                {item.step}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 font-mono">
                              <span className={isLight ? 'text-zinc-500' : 'text-zinc-400'}>
                                {item.count} items
                              </span>
                              <span className={`font-semibold w-12 text-right ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                                {item.pct}%
                              </span>
                            </div>
                          </div>
                          <div
                            className={`h-2.5 w-full rounded-full overflow-hidden p-0.5 border ${
                              isLight
                                ? 'bg-zinc-200/80 border-black/[0.04]'
                                : 'bg-[#1A1A20] border-white/[0.02]'
                            }`}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.max(item.pct, 2)}%`,
                                backgroundColor: item.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ISOLATED DEALS ANALYTICS SUB-TAB */}
              {subTab === 'deals_analytics' && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Deals Header Stats Block */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* KPI: Total Revenue */}
                    <div
                      className={`p-4 rounded-2xl border relative overflow-hidden transition ${
                        isLight
                          ? 'bg-[#F8F9FA] border-emerald-600/30'
                          : 'bg-[#151519] border-emerald-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4" />
                          {t.totalRevenue}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                            isLight
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          }`}
                        >
                          {timeframeButtons.find((x) => x.id === timeRange)?.label}
                        </span>
                      </div>
                      <div className={`text-3xl font-bold font-mono tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                        {formatMoney(totalRevenue)}
                      </div>
                      <div className="mt-2 text-[11px] text-zinc-500 flex items-center justify-between">
                        <span>Закрыто сделок:</span>
                        <span className="font-mono font-semibold text-emerald-600">{closedDeals.length}</span>
                      </div>
                    </div>

                    {/* KPI: Average Deal Size */}
                    <div
                      className={`p-4 rounded-2xl border relative overflow-hidden transition ${
                        isLight
                          ? 'bg-[#F8F9FA] border-indigo-600/30'
                          : 'bg-[#151519] border-indigo-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1.5">
                          <Target className="w-4 h-4" />
                          {t.avgDealSize}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                            isLight
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                          }`}
                        >
                          на сделку
                        </span>
                      </div>
                      <div className={`text-3xl font-bold font-mono tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                        {formatMoney(avgDealSize)}
                      </div>
                      <div className="mt-2 text-[11px] text-zinc-500 flex items-center justify-between">
                        <span>Win Rate:</span>
                        <span className="font-mono font-semibold text-indigo-600">{dealWinRate}%</span>
                      </div>
                    </div>

                    {/* KPI: Closed Deals Count */}
                    <div
                      className={`p-4 rounded-2xl border relative overflow-hidden transition ${
                        isLight
                          ? 'bg-[#F8F9FA] border-cyan-600/30'
                          : 'bg-[#151519] border-cyan-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-cyan-600 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          {t.closedDealsCount}
                        </span>
                      </div>
                      <div className={`text-3xl font-bold font-mono tracking-tight ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
                        {closedDeals.length}
                      </div>
                      <div className="mt-2 text-[11px] text-zinc-500 flex items-center justify-between">
                        <span>Всего в выборке:</span>
                        <span className={`font-mono ${isLight ? 'text-zinc-700' : 'text-zinc-200'}`}>{filteredDeals.length}</span>
                      </div>
                    </div>

                    {/* KPI: Active Pipeline Volume */}
                    <div
                      className={`p-4 rounded-2xl border relative overflow-hidden transition ${
                        isLight
                          ? 'bg-[#F8F9FA] border-amber-600/30'
                          : 'bg-[#151519] border-amber-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-amber-600 flex items-center gap-1.5">
                          <Zap className="w-4 h-4" />
                          {t.pipelineVolume}
                        </span>
                      </div>
                      <div className={`text-3xl font-bold font-mono tracking-tight ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                        {formatMoney(pipelineValue)}
                      </div>
                      <div className="mt-2 text-[11px] text-zinc-500 flex items-center justify-between">
                        <span>В процессе:</span>
                        <span className="font-mono text-amber-600 font-bold">
                          {
                            filteredDeals.filter(
                              (d) => d.stage === 'interested' || d.stage === 'in_progress'
                            ).length
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamics & Velocity Chart Block */}
                  <div
                    className={`p-5 rounded-2xl border space-y-4 ${
                      isLight
                        ? 'bg-[#F8F9FA] border-black/[0.06] shadow-xs'
                        : 'bg-[#151519] border-white/[0.04] shadow-xl'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className={`text-sm font-semibold flex items-center gap-2 ${isLight ? 'text-[#1A1A1E]' : 'text-white'}`}>
                          <Activity className="w-4 h-4 text-emerald-500" />
                          <span>{t.dealsDynamicsTitle}</span>
                        </h4>
                        <p className={`text-[11px] mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          {t.dealsDynamicsDesc}
                        </p>
                      </div>

                      {/* Grouping switch: Daily vs Weekly */}
                      <div
                        className={`flex items-center gap-1 p-1 rounded-xl border text-xs ${
                          isLight
                            ? 'bg-[#F1F3F5] border-black/[0.06]'
                            : 'bg-[#18181C] border-white/[0.06]'
                        }`}
                      >
                        <button
                          onClick={() => setDealsGrouping('daily')}
                          className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                            dealsGrouping === 'daily'
                              ? isLight
                                ? 'bg-white text-emerald-800 font-bold shadow-xs border border-black/[0.06]'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                              : isLight
                              ? 'text-zinc-600 hover:text-black'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {t.groupByDays}
                        </button>
                        <button
                          onClick={() => setDealsGrouping('weekly')}
                          className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                            dealsGrouping === 'weekly'
                              ? isLight
                                ? 'bg-white text-emerald-800 font-bold shadow-xs border border-black/[0.06]'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                              : isLight
                              ? 'text-zinc-600 hover:text-black'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {t.groupByWeeks}
                        </button>
                      </div>
                    </div>

                    <div className="h-72 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={dealsVelocityTimeline}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="dealRevGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.4} />
                              <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={isLight ? '#E5E7EB' : '#25252D'}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="label"
                            stroke={isLight ? '#6B7280' : '#71717A'}
                            fontSize={11}
                            tickLine={false}
                          />
                          <YAxis
                            yAxisId="left"
                            stroke={isLight ? '#6B7280' : '#71717A'}
                            fontSize={11}
                            tickLine={false}
                            tickFormatter={(v) => (currency === 'KZT' ? `${Math.round(v * (useApp().exchangeRate || 500) / 1000)}k₸` : `$${v}`)}
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke={isLight ? '#6B7280' : '#71717A'}
                            fontSize={11}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: isLight ? '#FFFFFF' : '#18181C',
                              borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
                              borderRadius: '12px',
                              fontSize: '11px',
                              color: isLight ? '#1A1A1E' : '#FFFFFF',
                              boxShadow: isLight ? '0 4px 20px rgba(0,0,0,0.08)' : '0 10px 25px -5px rgba(0,0,0,0.5)',
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                          <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="revenue"
                            name={`Выручка (${currency === 'KZT' ? '₸' : '$'})`}
                            stroke={COLORS.emerald}
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#dealRevGrad)"
                          />
                          <Bar
                            yAxisId="right"
                            dataKey="closedCount"
                            name="Закрытые сделки (шт)"
                            fill={COLORS.cyan}
                            radius={[4, 4, 0, 0]}
                            barSize={16}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Deals Platform Breakdown and Recent Deals Table */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Platform Performance */}
                    <div
                      className={`p-5 rounded-2xl border space-y-4 ${
                        isLight
                          ? 'bg-[#F8F9FA] border-black/[0.06]'
                          : 'bg-[#151519] border-white/[0.04]'
                      }`}
                    >
                      <h4 className={`text-xs font-semibold flex items-center gap-2 ${isLight ? 'text-[#1A1A1E]' : 'text-white'}`}>
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        <span>Выручка по платформам</span>
                      </h4>

                      <div className="space-y-3">
                        {platformRevenueData.map((plat) => (
                          <div
                            key={plat.name}
                            className={`p-3 rounded-xl border flex items-center justify-between ${
                              isLight
                                ? 'bg-white border-black/[0.06]'
                                : 'bg-[#18181C] border-white/[0.04]'
                            }`}
                          >
                            <div>
                              <div className={`font-semibold text-xs ${isLight ? 'text-[#1A1A1E]' : 'text-white'}`}>
                                {plat.name}
                              </div>
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                {plat.closedCount} закрытых • Ср. чек: {formatMoney(plat.avgCheck)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-mono font-bold text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                                {formatMoney(plat.closed)}
                              </div>
                              {plat.pipeline > 0 && (
                                <div className="text-[10px] text-cyan-600 font-mono">
                                  +{formatMoney(plat.pipeline)} пайплайн
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Table of deals in current period */}
                    <div
                      className={`lg:col-span-2 p-5 rounded-2xl border space-y-4 ${
                        isLight
                          ? 'bg-[#F8F9FA] border-black/[0.06]'
                          : 'bg-[#151519] border-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-semibold flex items-center gap-2 ${isLight ? 'text-[#1A1A1E]' : 'text-white'}`}>
                          <ListFilter className="w-4 h-4 text-indigo-500" />
                          <span>Сделки за выбранный период ({filteredDeals.length})</span>
                        </h4>
                        <button
                          onClick={() => setIsNewDealModalOpen(true)}
                          className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                        >
                          + {t.addDeal}
                        </button>
                      </div>

                      {filteredDeals.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500 text-xs">
                          {t.noResults}
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr
                                className={`border-b uppercase tracking-wider text-[10px] ${
                                  isLight
                                    ? 'border-black/[0.06] text-zinc-500'
                                    : 'border-white/[0.06] text-white/40'
                                }`}
                              >
                                <th className="py-2.5 px-3">{t.fieldArtist}</th>
                                <th className="py-2.5 px-3">{t.fieldPlatform}</th>
                                <th className="py-2.5 px-3">{t.fieldStage}</th>
                                <th className="py-2.5 px-3">{t.fieldDealDate}</th>
                                <th className="py-2.5 px-3 text-right">{t.fieldAmount}</th>
                              </tr>
                            </thead>
                            <tbody
                              className={`divide-y ${
                                isLight ? 'divide-black/[0.04]' : 'divide-white/[0.02]'
                              }`}
                            >
                              {filteredDeals.slice(0, 10).map((deal) => (
                                <tr
                                  key={deal.id}
                                  className={`transition ${
                                    isLight ? 'hover:bg-black/[0.02]' : 'hover:bg-white/[0.02]'
                                  }`}
                                >
                                  <td className={`py-2.5 px-3 font-semibold ${isLight ? 'text-[#1A1A1E]' : 'text-white'}`}>
                                    {deal.artistName}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] border ${
                                        isLight
                                          ? 'bg-white text-zinc-700 border-black/[0.06]'
                                          : 'bg-[#18181C] text-zinc-300 border-white/[0.04]'
                                      }`}
                                    >
                                      {deal.platform}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                                        deal.stage === 'closed'
                                          ? isLight
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
                                          : deal.stage === 'in_progress'
                                          ? isLight
                                            ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                                            : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20'
                                          : deal.stage === 'interested'
                                          ? isLight
                                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                                            : 'bg-amber-500/15 text-amber-300 border-amber-500/20'
                                          : isLight
                                          ? 'bg-red-50 text-red-800 border-red-200'
                                          : 'bg-red-500/15 text-red-300 border-red-500/20'
                                      }`}
                                    >
                                      {deal.stage === 'closed'
                                        ? t.stageClosed
                                        : deal.stage === 'in_progress'
                                        ? t.stageInProgress
                                        : deal.stage === 'interested'
                                        ? t.stageInterested
                                        : t.stageCancelled}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-500">
                                    {deal.date || deal.createdAt}
                                  </td>
                                  <td className={`py-2.5 px-3 text-right font-mono font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                                    {formatMoney(deal.amount)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. REVENUE & LINE CHART SUB-TAB */}
              {subTab === 'revenue' && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Financial Goals & Revenue Forecast */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <FinancialGoalsCard
                      isLight={isLight}
                      deals={deals}
                      formatMoney={formatMoney}
                      t={t}
                      currency={currency}
                    />
                    <RevenueForecastCard
                      isLight={isLight}
                      deals={filteredDeals}
                      formatMoney={formatMoney}
                      t={t}
                      currency={currency}
                    />
                  </div>

                  {/* LTV Ranking */}
                  <LtvScoreCard
                    isLight={isLight}
                    artists={artists}
                    deals={deals}
                    formatMoney={formatMoney}
                    t={t}
                  />

                  {/* Big Interactive Line/Area Chart */}
                  <div
                    className={`p-5 rounded-2xl border space-y-4 ${
                      isLight
                        ? 'bg-[#F8F9FA] border-black/[0.06]'
                        : 'bg-[#151519] border-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`text-sm font-semibold flex items-center gap-2 ${isLight ? 'text-[#1A1A1E]' : 'text-white'}`}>
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                          <span>{t.revenueGrowth}</span>
                        </h4>
                        <p className={`text-[11px] mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          Closed earnings vs Projected pipeline value over time
                        </p>
                      </div>
                    </div>

                    <div className="h-72 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={revenueTimeline}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.4} />
                              <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="pipelineGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={isLight ? '#E5E7EB' : '#25252D'}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="date"
                            stroke={isLight ? '#6B7280' : '#71717A'}
                            fontSize={11}
                            tickLine={false}
                          />
                          <YAxis
                            stroke={isLight ? '#6B7280' : '#71717A'}
                            fontSize={11}
                            tickLine={false}
                            tickFormatter={(v) => (currency === 'KZT' ? `${Math.round(v * (useApp().exchangeRate || 500) / 1000)}k₸` : `$${v}`)}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: isLight ? '#FFFFFF' : '#18181C',
                              borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
                              borderRadius: '12px',
                              fontSize: '11px',
                              boxShadow: isLight ? '0 4px 20px rgba(0,0,0,0.08)' : '0 10px 25px -5px rgba(0,0,0,0.5)',
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            name={`Closed Revenue (${currency === 'KZT' ? '₸' : '$'})`}
                            stroke={COLORS.emerald}
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#revenueGrad)"
                          />
                          <Area
                            type="monotone"
                            dataKey="pipeline"
                            name={`Active Pipeline (${currency === 'KZT' ? '₸' : '$'})`}
                            stroke={COLORS.cyan}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#pipelineGrad)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Revenue & Deals by Platform Bar Chart */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div
                      className={`p-5 rounded-2xl border space-y-4 ${
                        isLight
                          ? 'bg-[#F8F9FA] border-black/[0.06]'
                          : 'bg-[#151519] border-white/[0.04]'
                      }`}
                    >
                      <h4 className={`text-sm font-semibold flex items-center gap-2 ${isLight ? 'text-[#1A1A1E]' : 'text-white'}`}>
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        <span>{t.revenueByPlatformChart}</span>
                      </h4>

                      <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={platformRevenueData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke={isLight ? '#E5E7EB' : '#25252D'}
                              vertical={false}
                            />
                            <XAxis
                              dataKey="name"
                              stroke={isLight ? '#6B7280' : '#71717A'}
                              fontSize={11}
                              tickLine={false}
                            />
                            <YAxis
                              stroke={isLight ? '#6B7280' : '#71717A'}
                              fontSize={11}
                              tickLine={false}
                              tickFormatter={(v) => (currency === 'KZT' ? `${Math.round(v * (useApp().exchangeRate || 500) / 1000)}k₸` : `$${v}`)}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: isLight ? '#FFFFFF' : '#18181C',
                                borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
                                borderRadius: '12px',
                                fontSize: '11px',
                              }}
                            />
                            <Bar
                              dataKey="closed"
                              name={`Closed (${currency === 'KZT' ? '₸' : '$'})`}
                              fill={COLORS.emerald}
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar
                              dataKey="pipeline"
                              name={`Pipeline (${currency === 'KZT' ? '₸' : '$'})`}
                              fill={COLORS.cyan}
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div
                      className={`p-5 rounded-2xl border space-y-4 ${
                        isLight
                          ? 'bg-[#F8F9FA] border-black/[0.06]'
                          : 'bg-[#151519] border-white/[0.04]'
                      }`}
                    >
                      <h4 className={`text-sm font-semibold flex items-center gap-2 ${isLight ? 'text-[#1A1A1E]' : 'text-white'}`}>
                        <BarChart3 className="w-4 h-4 text-indigo-500" />
                        <span>{t.dealsByPlatformChart}</span>
                      </h4>

                      <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={platformRevenueData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke={isLight ? '#E5E7EB' : '#25252D'}
                              vertical={false}
                            />
                            <XAxis
                              dataKey="name"
                              stroke={isLight ? '#6B7280' : '#71717A'}
                              fontSize={11}
                              tickLine={false}
                            />
                            <YAxis
                              stroke={isLight ? '#6B7280' : '#71717A'}
                              fontSize={11}
                              tickLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: isLight ? '#FFFFFF' : '#18181C',
                                borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
                                borderRadius: '12px',
                                fontSize: '11px',
                              }}
                            />
                            <Bar
                              dataKey="deals"
                              name="Deals Count"
                              fill={COLORS.indigo}
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. DISTRIBUTION & PIE CHARTS SUB-TAB */}
              {subTab === 'distribution' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Pie 1: Artist Status */}
                    <div
                      className={`p-5 rounded-2xl border space-y-3 ${
                        isLight
                          ? 'bg-[#F8F9FA] border-black/[0.06]'
                          : 'bg-[#151519] border-white/[0.04]'
                      }`}
                    >
                      <h4 className={`text-xs font-semibold flex items-center gap-2 ${isLight ? 'text-[#1A1A1E]' : 'text-white'}`}>
                        <PieIcon className="w-4 h-4 text-emerald-500" />
                        <span>{t.artistStatusDist}</span>
                      </h4>
                      <div className="h-52 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={artistStatusData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={75}
                              paddingAngle={4}
                            >
                              {artistStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: isLight ? '#FFFFFF' : '#18181C',
                                borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
                                borderRadius: '8px',
                                fontSize: '11px',
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Pie 2: Demo Status */}
                    <div
                      className={`p-5 rounded-2xl border space-y-3 ${
                        isLight
                          ? 'bg-[#F8F9FA] border-black/[0.06]'
                          : 'bg-[#151519] border-white/[0.04]'
                      }`}
                    >
                      <h4 className={`text-xs font-semibold flex items-center gap-2 ${isLight ? 'text-[#1A1A1E]' : 'text-white'}`}>
                        <PieIcon className="w-4 h-4 text-cyan-500" />
                        <span>{t.demoStatusDist}</span>
                      </h4>
                      <div className="h-52 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={demoStatusData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={75}
                              paddingAngle={4}
                            >
                              {demoStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: isLight ? '#FFFFFF' : '#18181C',
                                borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
                                borderRadius: '8px',
                                fontSize: '11px',
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Pie 3: Deal Stage */}
                    <div
                      className={`p-5 rounded-2xl border space-y-3 ${
                        isLight
                          ? 'bg-[#F8F9FA] border-black/[0.06]'
                          : 'bg-[#151519] border-white/[0.04]'
                      }`}
                    >
                      <h4 className={`text-xs font-semibold flex items-center gap-2 ${isLight ? 'text-[#1A1A1E]' : 'text-white'}`}>
                        <PieIcon className="w-4 h-4 text-purple-500" />
                        <span>{t.dealStageDist}</span>
                      </h4>
                      <div className="h-52 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={dealStageData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={75}
                              paddingAngle={4}
                            >
                              {dealStageData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: isLight ? '#FFFFFF' : '#18181C',
                                borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
                                borderRadius: '8px',
                                fontSize: '11px',
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Pie 4: Reactions */}
                    <div
                      className={`p-5 rounded-2xl border space-y-3 ${
                        isLight
                          ? 'bg-[#F8F9FA] border-black/[0.06]'
                          : 'bg-[#151519] border-white/[0.04]'
                      }`}
                    >
                      <h4 className={`text-xs font-semibold flex items-center gap-2 ${isLight ? 'text-[#1A1A1E]' : 'text-white'}`}>
                        <PieIcon className="w-4 h-4 text-pink-500" />
                        <span>{t.reactionDist}</span>
                      </h4>
                      <div className="h-52 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={reactionsData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={75}
                              paddingAngle={4}
                            >
                              {reactionsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: isLight ? '#FFFFFF' : '#18181C',
                                borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
                                borderRadius: '8px',
                                fontSize: '11px',
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. GENRES & TYPES SUB-TAB */}
              {subTab === 'genres' && (
                <div className="space-y-6 animate-in fade-in">
                  <div
                    className={`p-5 rounded-2xl border space-y-4 ${
                      isLight
                        ? 'bg-[#F8F9FA] border-black/[0.06]'
                        : 'bg-[#151519] border-white/[0.04]'
                    }`}
                  >
                    <div>
                      <h4 className={`text-sm font-semibold flex items-center gap-2 ${isLight ? 'text-[#1A1A1E]' : 'text-white'}`}>
                        <Layers className="w-4 h-4 text-purple-500" />
                        <span>{t.topTypesTitle}</span>
                      </h4>
                      <p className={`text-[11px] mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {t.topTypesDesc}
                      </p>
                    </div>

                    {genreStats.length === 0 ? (
                      <div className="p-8 text-center text-zinc-500 text-xs">
                        No sound types or tags recorded yet. Add tags like "Ken Carson", "Rage", "Guitar", etc. to artists.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr
                              className={`border-b uppercase tracking-wider text-[10px] ${
                                isLight
                                  ? 'border-black/[0.06] text-zinc-500'
                                  : 'border-white/[0.06] text-white/40'
                              }`}
                            >
                              <th className="py-2.5 px-3">Sound Type / Genre</th>
                              <th className="py-2.5 px-3 text-center">Artists</th>
                              <th className="py-2.5 px-3 text-center">Connected</th>
                              <th className="py-2.5 px-3 text-center">Connect Rate</th>
                              <th className="py-2.5 px-3 text-right">Closed Revenue</th>
                            </tr>
                          </thead>
                          <tbody
                            className={`divide-y ${
                              isLight ? 'divide-black/[0.04]' : 'divide-white/[0.02]'
                            }`}
                          >
                            {genreStats.map((item, idx) => (
                              <tr
                                key={idx}
                                className={`transition ${
                                  isLight ? 'hover:bg-black/[0.02]' : 'hover:bg-white/[0.02]'
                                }`}
                              >
                                <td className="py-3 px-3">
                                  <span
                                    className={`px-2.5 py-1 rounded-md font-mono text-[11px] border ${
                                      isLight
                                        ? 'bg-white text-indigo-700 border-black/[0.06]'
                                        : 'bg-[#18181C] text-indigo-300 border-white/[0.04]'
                                    }`}
                                  >
                                    {item.tag}
                                  </span>
                                </td>
                                <td className={`py-3 px-3 text-center font-mono ${isLight ? 'text-zinc-800' : 'text-zinc-300'}`}>
                                  {item.count}
                                </td>
                                <td className="py-3 px-3 text-center font-mono text-emerald-600 font-semibold">
                                  {item.connectYes}
                                </td>
                                <td className={`py-3 px-3 text-center font-mono ${isLight ? 'text-zinc-700' : 'text-zinc-200'}`}>
                                  {item.count > 0
                                    ? Math.round((item.connectYes / item.count) * 100)
                                    : 0}
                                  %
                                </td>
                                <td className={`py-3 px-3 text-right font-mono font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                                  {formatMoney(item.revenue)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 6. COMPARISON & BENCHMARKS SUB-TAB */}
              {subTab === 'comparison' && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Period-over-Period Comparison */}
                  <PeriodComparisonCard
                    isLight={isLight}
                    artists={artists}
                    deals={deals}
                    formatMoney={formatMoney}
                    t={t}
                    currency={currency}
                  />

                  <div
                    className={`p-5 rounded-2xl border space-y-5 ${
                      isLight
                        ? 'bg-[#F8F9FA] border-black/[0.06]'
                        : 'bg-[#151519] border-white/[0.04]'
                    }`}
                  >
                    <div>
                      <h4 className={`text-sm font-semibold flex items-center gap-2 ${isLight ? 'text-[#1A1A1E]' : 'text-white'}`}>
                        <ArrowRightLeft className="w-4 h-4 text-pink-500" />
                        <span>{t.comparisonTitle}</span>
                      </h4>
                      <p className={`text-[11px] mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        Side-by-side performance benchmarking across outreach channels
                      </p>
                    </div>

                    {/* Selector Selectors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={`p-4 rounded-xl border space-y-2 ${
                          isLight
                            ? 'bg-white border-indigo-200'
                            : 'bg-[#18181C] border-indigo-500/20'
                        }`}
                      >
                        <label className="text-[11px] text-indigo-600 font-semibold block">
                          {t.comparisonSelectA}
                        </label>
                        <select
                          value={compareA}
                          onChange={(e) => setCompareA(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-xs font-semibold focus:outline-none cursor-pointer ${
                            isLight
                              ? 'bg-[#F8F9FA] text-zinc-900 border-black/[0.08]'
                              : 'bg-[#121215] text-white border-white/[0.06]'
                          }`}
                        >
                          <option value="Instagram">Instagram</option>
                          <option value="Telegram">Telegram</option>
                          <option value="iMessage">iMessage</option>
                          <option value="Discord">Discord</option>
                          <option value="Email">Email</option>
                        </select>
                      </div>

                      <div
                        className={`p-4 rounded-xl border space-y-2 ${
                          isLight
                            ? 'bg-white border-pink-200'
                            : 'bg-[#18181C] border-pink-500/20'
                        }`}
                      >
                        <label className="text-[11px] text-pink-600 font-semibold block">
                          {t.comparisonSelectB}
                        </label>
                        <select
                          value={compareB}
                          onChange={(e) => setCompareB(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-xs font-semibold focus:outline-none cursor-pointer ${
                            isLight
                              ? 'bg-[#F8F9FA] text-zinc-900 border-black/[0.08]'
                              : 'bg-[#121215] text-white border-white/[0.06]'
                          }`}
                        >
                          <option value="Instagram">Instagram</option>
                          <option value="Telegram">Telegram</option>
                          <option value="iMessage">iMessage</option>
                          <option value="Discord">Discord</option>
                          <option value="Email">Email</option>
                        </select>
                      </div>
                    </div>

                    {/* Comparison Side by Side Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      {/* Column A */}
                      <div
                        className={`p-4 rounded-xl border space-y-3 text-xs ${
                          isLight
                            ? 'bg-white border-black/[0.06]'
                            : 'bg-[#121215] border-white/[0.04]'
                        }`}
                      >
                        <div className={`text-sm font-bold border-b pb-2 ${isLight ? 'text-indigo-700 border-black/[0.06]' : 'text-indigo-300 border-white/[0.06]'}`}>
                          {compDataA.name}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Total Artists:</span>
                          <span className={`font-mono font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                            {compDataA.artistCount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Connect Rate:</span>
                          <span className="font-mono text-emerald-600 font-semibold">
                            {compDataA.connectRate}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Closed Deals:</span>
                          <span className={`font-mono font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                            {compDataA.closedCount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Total Revenue:</span>
                          <span className={`font-mono font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                            {formatMoney(compDataA.revenue)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Avg Deal Size:</span>
                          <span className={`font-mono ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>
                            {formatMoney(compDataA.avgDeal)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Avg Touches / Artist:</span>
                          <span className={`font-mono ${isLight ? 'text-zinc-800' : 'text-zinc-300'}`}>
                            {compDataA.avgTouches}
                          </span>
                        </div>
                      </div>

                      {/* Column B */}
                      <div
                        className={`p-4 rounded-xl border space-y-3 text-xs ${
                          isLight
                            ? 'bg-white border-black/[0.06]'
                            : 'bg-[#121215] border-white/[0.04]'
                        }`}
                      >
                        <div className={`text-sm font-bold border-b pb-2 ${isLight ? 'text-pink-700 border-black/[0.06]' : 'text-pink-300 border-white/[0.06]'}`}>
                          {compDataB.name}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Total Artists:</span>
                          <span className={`font-mono font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                            {compDataB.artistCount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Connect Rate:</span>
                          <span className="font-mono text-emerald-600 font-semibold">
                            {compDataB.connectRate}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Closed Deals:</span>
                          <span className={`font-mono font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                            {compDataB.closedCount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Total Revenue:</span>
                          <span className={`font-mono font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                            {formatMoney(compDataB.revenue)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Avg Deal Size:</span>
                          <span className={`font-mono ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>
                            {formatMoney(compDataB.avgDeal)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Avg Touches / Artist:</span>
                          <span className={`font-mono ${isLight ? 'text-zinc-800' : 'text-zinc-300'}`}>
                            {compDataB.avgTouches}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
