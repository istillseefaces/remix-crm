import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Filter,
  X,
  Plus,
  Tag,
  Clock,
  UserCheck,
  UserX,
  Flame,
  CheckCircle,
  Zap,
  ChevronDown,
  Mail,
  Copy,
  AlertCircle,
  Calendar,
  Sparkles,
  DollarSign,
  XCircle,
} from 'lucide-react';
import { QuickPreset, FilterCondition, FilterOperator, BadgeColor } from '../types';
import { copyCleanEmailList } from '../utils/exportUtils';
import { getBadgeColorClass } from '../utils/customOptions';
import { DatePicker } from './DatePicker';

export const FilterBuilder: React.FC = () => {
  const {
    t,
    lang,
    activeTab,
    quickPreset,
    setQuickPreset,
    filterConditions,
    addFilterCondition,
    removeFilterCondition,
    clearAllFilters,
    selectedTagFilter,
    setSelectedTagFilter,
    filteredArtists,
    filteredDeals,
    selectedArtistIds,
    customOptions,
    showToast,
    theme,
  } = useApp();

  const isLight = theme === 'light';

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<string>(activeTab === 'artists' ? 'connect' : 'stage');
  const [selectedOperator, setSelectedOperator] = useState<FilterOperator>('equals');
  const [filterValue, setFilterValue] = useState<any>('yes');
  const [secondaryValue, setSecondaryValue] = useState<any>('');
  const [isCopying, setIsCopying] = useState(false);

  const handleCopyEmails = async () => {
    setIsCopying(true);
    const targetArtists =
      selectedArtistIds.length > 0
        ? filteredArtists.filter((a) => selectedArtistIds.includes(a.id))
        : filteredArtists;

    const result = await copyCleanEmailList(targetArtists);
    setIsCopying(false);

    if (result.count > 0) {
      showToast(t.copiedEmailsToast(result.count), 'mail');
    } else {
      showToast(t.noEmailsToast, 'info');
    }
  };

  const hasAnyFilter =
    quickPreset !== 'all' ||
    filterConditions.length > 0 ||
    selectedTagFilter !== null;

  const artistQuickChips: { id: QuickPreset; label: string; icon: any; colorClass: string; activeClass: string }[] = [
    {
      id: 'has_connect',
      label: t.presetHasConnect,
      icon: UserCheck,
      colorClass: isLight
        ? 'text-emerald-800 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
        : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20',
      activeClass: isLight
        ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-sm'
        : 'bg-emerald-500 text-black border-emerald-400 font-semibold shadow-lg shadow-emerald-500/20',
    },
    {
      id: 'no_connect',
      label: t.presetNoConnect,
      icon: UserX,
      colorClass: isLight
        ? 'text-red-800 bg-red-50 border-red-200 hover:bg-red-100'
        : 'text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20',
      activeClass: isLight
        ? 'bg-red-600 text-white border-red-600 font-semibold shadow-sm'
        : 'bg-red-500 text-white border-red-400 font-semibold shadow-lg shadow-red-500/20',
    },
    {
      id: 'followup_due',
      label: t.presetFollowupDue,
      icon: Clock,
      colorClass: isLight
        ? 'text-amber-900 bg-amber-50 border-amber-200 hover:bg-amber-100'
        : 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20',
      activeClass: isLight
        ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-sm'
        : 'bg-amber-500 text-black border-amber-400 font-semibold shadow-lg shadow-amber-500/20',
    },
    {
      id: 'hot_deals',
      label: t.presetHotDeals,
      icon: Flame,
      colorClass: isLight
        ? 'text-amber-900 bg-amber-50 border-amber-200 hover:bg-amber-100'
        : 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20',
      activeClass: isLight
        ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-sm'
        : 'bg-amber-500 text-black border-amber-400 font-semibold shadow-lg shadow-amber-500/20',
    },
    {
      id: 'active_artists',
      label: t.presetActiveArtists,
      icon: Zap,
      colorClass: isLight
        ? 'text-purple-900 bg-purple-50 border-purple-200 hover:bg-purple-100'
        : 'text-purple-400 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20',
      activeClass: isLight
        ? 'bg-purple-600 text-white border-purple-600 font-semibold shadow-sm'
        : 'bg-purple-500 text-white border-purple-400 font-semibold shadow-lg shadow-purple-500/20',
    },
    {
      id: 'has_sales',
      label: t.presetHasSales,
      icon: CheckCircle,
      colorClass: isLight
        ? 'text-cyan-900 bg-cyan-50 border-cyan-200 hover:bg-cyan-100'
        : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20',
      activeClass: isLight
        ? 'bg-cyan-600 text-white border-cyan-600 font-semibold shadow-sm'
        : 'bg-cyan-500 text-black border-cyan-400 font-semibold shadow-lg shadow-cyan-500/20',
    },
  ];

  const dealQuickChips: { id: QuickPreset; label: string; icon: any; colorClass: string; activeClass: string }[] = [
    {
      id: 'deals_overdue',
      label: t.presetDealsOverdue || 'Просрочен платеж',
      icon: AlertCircle,
      colorClass: isLight
        ? 'text-red-800 bg-red-50 border-red-200 hover:bg-red-100'
        : 'text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20',
      activeClass: isLight
        ? 'bg-red-600 text-white border-red-600 font-semibold shadow-sm'
        : 'bg-red-500 text-white border-red-400 font-semibold shadow-lg shadow-red-500/20',
    },
    {
      id: 'deals_today',
      label: t.presetDealsToday || 'На сегодня',
      icon: Calendar,
      colorClass: isLight
        ? 'text-amber-900 bg-amber-50 border-amber-200 hover:bg-amber-100'
        : 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20',
      activeClass: isLight
        ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-sm'
        : 'bg-amber-500 text-black border-amber-400 font-semibold shadow-lg shadow-amber-500/20',
    },
    {
      id: 'deals_in_progress',
      label: t.presetDealsInProgress || 'В процессе',
      icon: Clock,
      colorClass: isLight
        ? 'text-sky-900 bg-sky-50 border-sky-200 hover:bg-sky-100'
        : 'text-sky-400 bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/20',
      activeClass: isLight
        ? 'bg-sky-600 text-white border-sky-600 font-semibold shadow-sm'
        : 'bg-sky-500 text-black border-sky-400 font-semibold shadow-lg shadow-sky-500/20',
    },
    {
      id: 'deals_interested',
      label: t.presetDealsInterested || 'Интерес',
      icon: Sparkles,
      colorClass: isLight
        ? 'text-amber-900 bg-amber-50 border-amber-200 hover:bg-amber-100'
        : 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20',
      activeClass: isLight
        ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-sm'
        : 'bg-amber-500 text-black border-amber-400 font-semibold shadow-lg shadow-amber-500/20',
    },
    {
      id: 'deals_won',
      label: t.presetDealsWon || 'Выиграна',
      icon: CheckCircle,
      colorClass: isLight
        ? 'text-emerald-800 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
        : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20',
      activeClass: isLight
        ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-sm'
        : 'bg-emerald-500 text-black border-emerald-400 font-semibold shadow-lg shadow-emerald-500/20',
    },
    {
      id: 'deals_lost',
      label: t.presetDealsLost || 'Проиграна',
      icon: XCircle,
      colorClass: isLight
        ? 'text-zinc-700 bg-zinc-100 border-zinc-200 hover:bg-zinc-200'
        : 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20 hover:bg-zinc-500/20',
      activeClass: isLight
        ? 'bg-zinc-700 text-white border-zinc-700 font-semibold shadow-sm'
        : 'bg-zinc-600 text-white border-zinc-500 font-semibold shadow-lg shadow-zinc-500/20',
    },
    {
      id: 'deals_high_value',
      label: t.presetDealsHighValue || 'Крупные сделки',
      icon: DollarSign,
      colorClass: isLight
        ? 'text-purple-900 bg-purple-50 border-purple-200 hover:bg-purple-100'
        : 'text-purple-400 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20',
      activeClass: isLight
        ? 'bg-purple-600 text-white border-purple-600 font-semibold shadow-sm'
        : 'bg-purple-500 text-white border-purple-400 font-semibold shadow-lg shadow-purple-500/20',
    },
  ];

  const quickChips = activeTab === 'artists' ? artistQuickChips : dealQuickChips;

  const handleFieldChange = (field: string) => {
    setSelectedField(field);
    if (field === 'connect' || field === 'sales') {
      setSelectedOperator('equals');
      setFilterValue('yes');
    } else if (field === 'status') {
      setSelectedOperator('equals');
      setFilterValue('active');
    } else if (field === 'demoStatus') {
      setSelectedOperator('equals');
      setFilterValue('liked');
    } else if (field === 'reaction') {
      setSelectedOperator('equals');
      setFilterValue('ready_to_buy');
    } else if (field === 'types' || field === 'notes' || field === 'name') {
      setSelectedOperator('contains');
      setFilterValue('');
    } else if (field === 'followUpDate' || field === 'date') {
      setSelectedOperator('date_preset');
      setFilterValue('today');
    } else if (field === 'stage') {
      setSelectedOperator('equals');
      setFilterValue('interested');
    } else if (field === 'platform') {
      setSelectedOperator('equals');
      setFilterValue('Instagram');
    } else if (field === 'amount') {
      setSelectedOperator('greater_than');
      setFilterValue('100');
    }
  };

  const handleCreateCondition = () => {
    if (filterValue === '' && selectedOperator !== 'date_preset') return;
    addFilterCondition({
      field: selectedField,
      operator: selectedOperator,
      value: filterValue,
      secondaryValue: secondaryValue ? Number(secondaryValue) : undefined,
    });
    setIsAddMenuOpen(false);
  };

  const getFieldLabel = (field: string) => {
    const map: Record<string, string> = {
      connect: t.fieldConnect,
      sales: t.fieldSales,
      status: t.fieldStatus,
      demoStatus: t.fieldDemo,
      reaction: t.fieldReaction,
      types: t.fieldTypes,
      notes: t.fieldNotes,
      name: t.fieldInstaName,
      followUpDate: t.fieldFollowUp,
      stage: t.fieldStage,
      platform: t.fieldPlatform,
      amount: t.fieldAmount,
      date: t.fieldDealDate,
    };
    return map[field] || field;
  };

  const getValueLabel = (field: string, val: any) => {
    // Check in customOptions first
    if (field === 'status' && customOptions?.artistStatus) {
      const match = customOptions.artistStatus.find((o) => o.id === val);
      if (match) return match.label;
    }
    if (field === 'demoStatus' && customOptions?.demoStatus) {
      const match = customOptions.demoStatus.find((o) => o.id === val);
      if (match) return match.label;
    }
    if (field === 'reaction' && customOptions?.reaction) {
      const match = customOptions.reaction.find((o) => o.id === val);
      if (match) return match.label;
    }
    if (field === 'platform' && customOptions?.platform) {
      const match = customOptions.platform.find((o) => o.id === val);
      if (match) return match.label;
    }
    if (field === 'stage' && customOptions?.dealStage) {
      const match = customOptions.dealStage.find((o) => o.id === val);
      if (match) return match.label;
    }

    if (val === 'yes') return t.salesYes;
    if (val === 'no') return t.salesNo;
    if (val === 'active') return t.statusActive;
    if (val === 'passive') return t.statusPassive;
    if (val === 'dead') return t.statusDead;
    if (val === 'liked') return t.demoLiked;
    if (val === 'sent') return t.demoSent;
    if (val === 'in_progress') return t.demoInProgress;
    if (val === 'rejected') return t.demoRejected;
    if (val === 'ready_to_buy') return t.reactionReadyToBuy;
    if (val === 'wants_more') return t.reactionWantsMore;
    if (val === 'replied') return t.reactionReplied;
    if (val === 'listening') return t.reactionListening;
    if (val === 'ignored') return t.reactionIgnored;
    if (val === 'interested') return t.stageInterested;
    if (val === 'closed') return t.stageClosed;
    if (val === 'cancelled') return t.stageCancelled;
    if (val === 'today') return t.dateToday;
    if (val === 'this_week') return t.dateThisWeek;
    if (val === 'overdue') return t.dateOverdue;
    return String(val);
  };

  const getValueColor = (field: string, val: any): BadgeColor | null => {
    if (field === 'connect' || field === 'sales') {
      return val === 'yes' ? 'emerald' : 'red';
    }
    if (field === 'status' && customOptions?.artistStatus) {
      const match = customOptions.artistStatus.find((o) => o.id === val);
      if (match) return match.color;
    }
    if (field === 'demoStatus' && customOptions?.demoStatus) {
      const match = customOptions.demoStatus.find((o) => o.id === val);
      if (match) return match.color;
    }
    if (field === 'reaction' && customOptions?.reaction) {
      const match = customOptions.reaction.find((o) => o.id === val);
      if (match) return match.color;
    }
    if (field === 'platform' && customOptions?.platform) {
      const match = customOptions.platform.find((o) => o.id === val);
      if (match) return match.color;
    }
    if (field === 'stage' && customOptions?.dealStage) {
      const match = customOptions.dealStage.find((o) => o.id === val);
      if (match) return match.color;
    }
    if (field === 'types') return 'purple';
    if (field === 'followUpDate' || field === 'date') {
      if (val === 'overdue') return 'red';
      if (val === 'today') return 'amber';
      return 'blue';
    }
    return null;
  };

  const countDisplay = activeTab === 'artists' ? filteredArtists.length : filteredDeals.length;

  return (
    <div
      className={`px-4 sm:px-6 lg:px-8 py-2.5 border-b shrink-0 select-none transition-colors duration-150 ${
        isLight
          ? 'bg-[#F8F9FA] border-black/[0.06]'
          : 'bg-[#111113]/40 border-white/[0.04]'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* Quick filters section label */}
        <span
          className={`text-[10px] font-semibold uppercase tracking-[0.15em] mr-1 ${
            isLight ? 'text-zinc-400' : 'text-white/40'
          }`}
        >
          Quick Filters:
        </span>

        {/* Preset Quick Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {quickChips.map((chip) => {
            const Icon = chip.icon;
            const isActive = quickPreset === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setQuickPreset(isActive ? 'all' : chip.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
                  isActive ? chip.activeClass : chip.colorClass
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Add Custom Filter Button & Popover */}
        <div className="relative">
          <button
            id="open-filter-builder-btn"
            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition cursor-pointer ${
              filterConditions.length > 0
                ? isLight
                  ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-300 font-semibold'
                  : 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/30 font-semibold'
                : isLight
                ? 'bg-white hover:bg-black/[0.04] text-zinc-700 hover:text-black border-black/[0.08]'
                : 'bg-[#18181C] hover:bg-[#202026] text-white/70 hover:text-white border-white/[0.06]'
            }`}
          >
            <Filter className="w-3 h-3 text-indigo-500" />
            <span>{t.addFilter}</span>
            {filterConditions.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full font-mono text-[9px] font-bold ${
                  isLight ? 'bg-indigo-200 text-indigo-900' : 'bg-indigo-500/30 text-indigo-200'
                }`}
              >
                {filterConditions.length}
              </span>
            )}
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {/* Add Filter Condition Popover */}
          {isAddMenuOpen && (
            <div
              className={`absolute left-0 top-full mt-2 w-72 p-4 rounded-2xl border shadow-2xl z-40 backdrop-blur-2xl ${
                isLight
                  ? 'bg-white border-black/[0.1] text-zinc-900'
                  : 'bg-[#141418] border-white/[0.08] text-white'
              }`}
            >
              <div
                className={`flex items-center justify-between pb-2 mb-3 border-b ${
                  isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'
                }`}
              >
                <span className={`text-xs font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  {t.addFilter}
                </span>
                <button
                  onClick={() => setIsAddMenuOpen(false)}
                  className={`transition ${isLight ? 'text-zinc-400 hover:text-black' : 'text-white/40 hover:text-white'}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Field selection */}
                <div>
                  <label
                    className={`text-[10px] uppercase tracking-wider block mb-1 font-semibold ${
                      isLight ? 'text-zinc-500' : 'text-white/40'
                    }`}
                  >
                    Field
                  </label>
                  <select
                    value={selectedField}
                    onChange={(e) => handleFieldChange(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none cursor-pointer ${
                      isLight
                        ? 'bg-[#F8F9FA] text-zinc-800 border-black/[0.1]'
                        : 'bg-[#1C1C22] text-zinc-200 border-white/[0.08]'
                    }`}
                  >
                    {activeTab === 'artists' ? (
                      <>
                        <option value="connect">{t.fieldConnect}</option>
                        <option value="sales">{t.fieldSales}</option>
                        <option value="status">{t.fieldStatus}</option>
                        <option value="types">{t.fieldTypes}</option>
                        <option value="demoStatus">{t.fieldDemo}</option>
                        <option value="reaction">{t.fieldReaction}</option>
                        <option value="followUpDate">{t.fieldFollowUp}</option>
                        <option value="name">{t.fieldInstaName}</option>
                        <option value="notes">{t.fieldNotes}</option>
                      </>
                    ) : (
                      <>
                        <option value="stage">{t.fieldStage}</option>
                        <option value="platform">{t.fieldPlatform}</option>
                        <option value="amount">{t.fieldAmount}</option>
                        <option value="date">{t.fieldDealDate}</option>
                        <option value="notes">{t.fieldDealNotes}</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Operator selection */}
                <div>
                  <label
                    className={`text-[10px] uppercase tracking-wider block mb-1 font-semibold ${
                      isLight ? 'text-zinc-500' : 'text-white/40'
                    }`}
                  >
                    Condition
                  </label>
                  <select
                    value={selectedOperator}
                    onChange={(e) => setSelectedOperator(e.target.value as FilterOperator)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none cursor-pointer ${
                      isLight
                        ? 'bg-[#F8F9FA] text-zinc-800 border-black/[0.1]'
                        : 'bg-[#1C1C22] text-zinc-200 border-white/[0.08]'
                    }`}
                  >
                    {selectedField === 'followUpDate' || selectedField === 'date' ? (
                      <>
                        <option value="date_preset">{t.opDatePreset}</option>
                        <option value="equals">{t.opEquals}</option>
                      </>
                    ) : selectedField === 'amount' ? (
                      <>
                        <option value="greater_than">{t.opGreaterThan}</option>
                        <option value="less_than">{t.opLessThan}</option>
                        <option value="between">{t.opBetween}</option>
                        <option value="equals">{t.opEquals}</option>
                      </>
                    ) : selectedField === 'types' || selectedField === 'notes' || selectedField === 'name' ? (
                      <>
                        <option value="contains">{t.opContains}</option>
                        <option value="not_contains">{t.opNotContains}</option>
                      </>
                    ) : (
                      <>
                        <option value="equals">{t.opEquals}</option>
                        <option value="not_equals">{t.opNotEquals}</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Value selection / input */}
                <div>
                  <label
                    className={`text-[10px] uppercase tracking-wider block mb-1 font-semibold ${
                      isLight ? 'text-zinc-500' : 'text-white/40'
                    }`}
                  >
                    Value
                  </label>
                  {selectedField === 'connect' || selectedField === 'sales' ? (
                    <select
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none cursor-pointer ${
                        isLight
                          ? 'bg-[#F8F9FA] text-zinc-800 border-black/[0.1]'
                          : 'bg-[#1C1C22] text-zinc-200 border-white/[0.08]'
                      }`}
                    >
                      <option value="yes">{selectedField === 'connect' ? t.connectYes : t.salesYes}</option>
                      <option value="no">{selectedField === 'connect' ? t.connectNo : t.salesNo}</option>
                    </select>
                  ) : selectedField === 'status' ? (
                    <select
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none cursor-pointer ${
                        isLight
                          ? 'bg-[#F8F9FA] text-zinc-800 border-black/[0.1]'
                          : 'bg-[#1C1C22] text-zinc-200 border-white/[0.08]'
                      }`}
                    >
                      {customOptions?.artistStatus?.length ? (
                        customOptions.artistStatus.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="active">{t.statusActive}</option>
                          <option value="passive">{t.statusPassive}</option>
                          <option value="dead">{t.statusDead}</option>
                        </>
                      )}
                    </select>
                  ) : selectedField === 'demoStatus' ? (
                    <select
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none cursor-pointer ${
                        isLight
                          ? 'bg-[#F8F9FA] text-zinc-800 border-black/[0.1]'
                          : 'bg-[#1C1C22] text-zinc-200 border-white/[0.08]'
                      }`}
                    >
                      {customOptions?.demoStatus?.length ? (
                        customOptions.demoStatus.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="liked">{t.demoLiked}</option>
                          <option value="sent">{t.demoSent}</option>
                          <option value="in_progress">{t.demoInProgress}</option>
                          <option value="rejected">{t.demoRejected}</option>
                          <option value="none">{t.demoNone}</option>
                        </>
                      )}
                    </select>
                  ) : selectedField === 'reaction' ? (
                    <select
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none cursor-pointer ${
                        isLight
                          ? 'bg-[#F8F9FA] text-zinc-800 border-black/[0.1]'
                          : 'bg-[#1C1C22] text-zinc-200 border-white/[0.08]'
                      }`}
                    >
                      {customOptions?.reaction?.length ? (
                        customOptions.reaction.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="ready_to_buy">{t.reactionReadyToBuy}</option>
                          <option value="wants_more">{t.reactionWantsMore}</option>
                          <option value="replied">{t.reactionReplied}</option>
                          <option value="listening">{t.reactionListening}</option>
                          <option value="ignored">{t.reactionIgnored}</option>
                        </>
                      )}
                    </select>
                  ) : selectedField === 'stage' ? (
                    <select
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none cursor-pointer ${
                        isLight
                          ? 'bg-[#F8F9FA] text-zinc-800 border-black/[0.1]'
                          : 'bg-[#1C1C22] text-zinc-200 border-white/[0.08]'
                      }`}
                    >
                      {customOptions?.dealStage?.length ? (
                        customOptions.dealStage.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="interested">{t.stageInterested}</option>
                          <option value="in_progress">{t.stageInProgress}</option>
                          <option value="closed">{t.stageClosed}</option>
                          <option value="cancelled">{t.stageCancelled}</option>
                        </>
                      )}
                    </select>
                  ) : selectedField === 'platform' ? (
                    <select
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none cursor-pointer ${
                        isLight
                          ? 'bg-[#F8F9FA] text-zinc-800 border-black/[0.1]'
                          : 'bg-[#1C1C22] text-zinc-200 border-white/[0.08]'
                      }`}
                    >
                      {customOptions?.platform?.length ? (
                        customOptions.platform.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Instagram">Instagram</option>
                          <option value="Telegram">Telegram</option>
                          <option value="iMessage">iMessage</option>
                          <option value="Discord">Discord</option>
                          <option value="Email">Email</option>
                        </>
                      )}
                    </select>
                  ) : selectedOperator === 'date_preset' ? (
                    <select
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none cursor-pointer ${
                        isLight
                          ? 'bg-[#F8F9FA] text-zinc-800 border-black/[0.1]'
                          : 'bg-[#1C1C22] text-zinc-200 border-white/[0.08]'
                      }`}
                    >
                      <option value="today">{t.dateToday}</option>
                      <option value="overdue">{t.dateOverdue}</option>
                      <option value="this_week">{t.dateThisWeek}</option>
                    </select>
                  ) : selectedField.includes('Date') || selectedField === 'date' ? (
                    <DatePicker
                      value={filterValue}
                      onChange={setFilterValue}
                      variant="input"
                      showShortcuts={true}
                      allowClear={true}
                      className="w-full"
                    />
                  ) : (
                    <input
                      type={selectedField === 'amount' ? 'number' : 'text'}
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      placeholder={selectedField === 'types' ? 'Ken Carson, Rage...' : 'Value...'}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none ${
                        isLight
                          ? 'bg-[#F8F9FA] text-zinc-800 border-black/[0.1]'
                          : 'bg-[#1C1C22] text-zinc-200 border-white/[0.08]'
                      }`}
                    />
                  )}

                  {selectedOperator === 'between' && selectedField === 'amount' && (
                    <div className="mt-2">
                      <label className={`text-[10px] uppercase tracking-wider block mb-1 ${isLight ? 'text-zinc-500' : 'text-white/40'}`}>
                        To
                      </label>
                      <input
                        type="number"
                        value={secondaryValue}
                        onChange={(e) => setSecondaryValue(e.target.value)}
                        placeholder="Max amount"
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none ${
                          isLight
                            ? 'bg-[#F8F9FA] text-zinc-800 border-black/[0.1]'
                            : 'bg-[#1C1C22] text-zinc-200 border-white/[0.08]'
                        }`}
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => setIsAddMenuOpen(false)}
                    className={`px-3 py-1 transition text-xs ${
                      isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleCreateCondition}
                    className={`px-3.5 py-1 font-semibold rounded-lg transition text-xs shadow-sm cursor-pointer ${
                      isLight
                        ? 'bg-black text-white hover:bg-black/90'
                        : 'bg-white text-black hover:bg-white/90'
                    }`}
                  >
                    {t.save}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Copy Emails Button (Verse Light/Dark aesthetic) */}
        {activeTab === 'artists' && (
          <button
            id="copy-emails-filterbar-btn"
            onClick={handleCopyEmails}
            disabled={isCopying}
            title={t.copyEmailsTooltip}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition shadow-xs active:scale-95 cursor-pointer ${
              isLight
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                : 'bg-white/[0.03] hover:bg-white/[0.08] text-white/80 hover:text-white border-white/[0.08]'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.copyEmailsBtn}</span>
            {selectedArtistIds.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full font-mono text-[9px] font-bold ${
                  isLight
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {selectedArtistIds.length}
              </span>
            )}
          </button>
        )}

        {/* Selected Genre Tag Pill */}
        {selectedTagFilter && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] border font-mono ${
              isLight
                ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
            }`}
          >
            <Tag className="w-3 h-3 text-indigo-600" />
            <span>Tag: {selectedTagFilter}</span>
            <button
              onClick={() => setSelectedTagFilter(null)}
              className={`ml-0.5 cursor-pointer ${isLight ? 'text-indigo-400 hover:text-indigo-900' : 'text-indigo-400 hover:text-white'}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Active Custom Filter Condition Chips */}
        {filterConditions.map((cond) => {
          const color = getValueColor(cond.field, cond.value);
          const dotClass = color ? getBadgeColorClass(color, theme, 'dot') : null;

          return (
            <div
              key={cond.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border transition-all ${
                isLight
                  ? 'bg-white text-zinc-800 border-black/[0.08] shadow-2xs'
                  : 'bg-[#18181C] text-zinc-300 border-white/[0.08] shadow-2xs'
              }`}
            >
              {dotClass && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />}
              <span className={isLight ? 'text-zinc-400' : 'text-white/40'}>{getFieldLabel(cond.field)}:</span>
              <span className={`font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                {getValueLabel(cond.field, cond.value)}
                {cond.secondaryValue !== undefined && ` - ${cond.secondaryValue}`}
              </span>
              <button
                onClick={() => removeFilterCondition(cond.id)}
                className={`cursor-pointer ${isLight ? 'text-zinc-400 hover:text-black' : 'text-white/40 hover:text-white'}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* Clear All Filters Button */}
        {hasAnyFilter && (
          <button
            id="clear-filters-btn"
            onClick={clearAllFilters}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] transition cursor-pointer ${
              isLight
                ? 'text-zinc-500 hover:text-red-600 hover:bg-red-50'
                : 'text-white/40 hover:text-red-400 hover:bg-red-500/10'
            }`}
          >
            <X className="w-3 h-3" />
            <span>{t.clearAllFilters}</span>
          </button>
        )}

        {/* Showing Records Count Indicator */}
        <div className={`ml-auto text-[11px] font-mono self-center ${isLight ? 'text-zinc-400' : 'text-white/30'}`}>
          {activeTab === 'artists' ? `Showing ${countDisplay} artists` : `Showing ${countDisplay} deals`}
        </div>
      </div>
    </div>
  );
};
