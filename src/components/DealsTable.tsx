import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Deal, DealStage, DealPlatform } from '../types';
import { DollarSign, Instagram, Send, Mail, MessageSquare, Sparkles, ArrowUpRight, Layers, AlertCircle, Calendar, Clock, ArrowUpDown, GripVertical, Check } from 'lucide-react';
import { Edit2, Trash2, X } from './InterfaceIcons';
import { ConfirmModal } from './ConfirmModal';
import { CustomCheckbox } from './CustomCheckbox';
import { CustomDropdown } from './CustomDropdown';
import { DatePicker } from './DatePicker';
import { getFollowUpStatus } from '../utils/customOptions';

export const DealsTable: React.FC = () => {
  const {
    filteredDeals,
    t,
    theme,
    updateDeal,
    deleteDeal,
    reorderDeals,
    setActiveDealId,
    setActiveArtistId,
    artists,
    setIsNewDealModalOpen,
    formatMoney,
    selectedDealIds,
    toggleDealSelection,
    selectAllFilteredDeals,
    clearDealSelection,
    bulkUpdateDeals,
    bulkDeleteDeals,
  } = useApp();

  const isLight = theme === 'light';

  const [sortField, setSortField] = useState<keyof Deal | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Drag & drop state for manual reordering
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverDealId, setDragOverDealId] = useState<string | null>(null);

  // Close sort dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    if (isSortDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortDropdownOpen]);

  // Selection helpers
  const allFilteredSelected =
    filteredDeals.length > 0 &&
    filteredDeals.every((d) => selectedDealIds.includes(d.id));
  const someSelected =
    selectedDealIds.length > 0 &&
    filteredDeals.some((d) => selectedDealIds.includes(d.id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      clearDealSelection();
    } else {
      selectAllFilteredDeals(filteredDeals.map((d) => d.id));
    }
  };

  const selectedDealsList = useMemo(() => {
    return filteredDeals.filter((d) => selectedDealIds.includes(d.id));
  }, [filteredDeals, selectedDealIds]);

  const totalSelectedAmount = useMemo(() => {
    return selectedDealsList.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  }, [selectedDealsList]);

  const handleSort = (field: keyof Deal) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleSetSortPreset = (preset: 'oldest' | 'newest' | 'reset') => {
    if (preset === 'oldest') {
      setSortField('createdAt');
      setSortAsc(true);
    } else if (preset === 'newest') {
      setSortField('createdAt');
      setSortAsc(false);
    } else {
      setSortField(null);
      setSortAsc(true);
    }
    setIsSortDropdownOpen(false);
  };

  const sortedDeals = useMemo(() => {
    if (!sortField) return filteredDeals;

    return [...filteredDeals].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [filteredDeals, sortField, sortAsc]);

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (sortField) {
      setSortField(null);
    }
    setDraggedDealId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDealId !== id) {
      setDragOverDealId(id);
    }
  };

  const handleDragEnd = () => {
    setDraggedDealId(null);
    setDragOverDealId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = draggedDealId || e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      handleDragEnd();
      return;
    }

    const currentList = [...filteredDeals];
    const sourceIndex = currentList.findIndex((d) => d.id === sourceId);
    const targetIndex = currentList.findIndex((d) => d.id === targetId);

    if (sourceIndex !== -1 && targetIndex !== -1) {
      const updated = [...currentList];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, moved);
      reorderDeals(updated);
    }

    handleDragEnd();
  };

  const getPlatformIcon = (platform: DealPlatform) => {
    switch (platform) {
      case 'Instagram':
        return <Instagram className={`w-3.5 h-3.5 ${isLight ? 'text-pink-600' : 'text-pink-400'}`} />;
      case 'Telegram':
        return <Send className={`w-3.5 h-3.5 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />;
      case 'iMessage':
        return <MessageSquare className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />;
      case 'Discord':
        return <MessageSquare className={`w-3.5 h-3.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />;
      case 'Email':
        return <Mail className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />;
      default:
        return <ArrowUpRight className={`w-3.5 h-3.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />;
    }
  };

  const handleArtistClick = (artistName: string) => {
    const found = artists.find(
      (a) => a.name.toLowerCase().trim() === artistName.toLowerCase().trim()
    );
    if (found) {
      setActiveArtistId(found.id);
    }
  };

  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-cyan-400 via-teal-500 to-indigo-500',
      'from-indigo-500 via-purple-500 to-pink-500',
      'from-emerald-400 via-teal-500 to-cyan-500',
      'from-blue-500 via-indigo-600 to-violet-600',
      'from-amber-400 via-orange-500 to-red-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  const getInitials = (name: string) => {
    if (!name) return 'D';
    const clean = name.replace(/^@/, '').trim();
    const parts = clean.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const confirmDeleteDeal = () => {
    if (dealToDelete) {
      deleteDeal(dealToDelete.id);
      setDealToDelete(null);
    }
  };

  const confirmBulkDelete = () => {
    bulkDeleteDeals(selectedDealIds);
    setIsBulkDeleteModalOpen(false);
  };

  const renderDateBadge = (dateStr: string, stage?: DealStage) => {
    // Hide date status reminders for closed or cancelled deals
    if (stage === 'closed' || stage === 'cancelled') {
      return null;
    }

    const status = getFollowUpStatus(dateStr, t);
    if (!status) return null;

    if (status.type === 'overdue') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap border shrink-0 transition-all ${
            isLight
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-red-500/15 text-red-300 border-red-500/30'
          }`}
          title={status.label}
        >
          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span className="whitespace-nowrap">{status.label}</span>
        </span>
      );
    }

    if (status.type === 'today') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap border shrink-0 transition-all ${
            isLight
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
          }`}
          title={status.label}
        >
          <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="whitespace-nowrap">{status.label}</span>
        </span>
      );
    }

    // Future (In N days)
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap border shrink-0 transition-all ${
          isLight
            ? 'bg-sky-50 text-sky-800 border-sky-200'
            : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
        }`}
        title={status.label}
      >
        <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
        <span className="whitespace-nowrap">{status.label}</span>
      </span>
    );
  };

  return (
    <>
      <div
        className={`studio-content flex-1 overflow-hidden p-3 sm:p-4 lg:p-6 flex flex-col min-h-0 relative transition-colors duration-150 ${
          isLight ? 'bg-[var(--canvas)]' : 'bg-[var(--canvas)]'
        }`}
      >
        <div
          className={`studio-panel h-full border rounded-2xl overflow-hidden flex flex-col relative transition-colors duration-150 ${
            isLight
              ? 'bg-white border-black/[0.06] shadow-xs'
              : 'bg-[var(--surface)]/60 border-white/[0.04] backdrop-blur-sm shadow-2xl'
          }`}
        >
          {sortedDeals.length === 0 ? (
            <div className="studio-empty flex-1 flex flex-col items-center text-center">
              <div
                className={`w-12 h-12 rounded-full border flex items-center justify-center mb-3 shadow-md ${
                  isLight
                    ? 'bg-[var(--surface-secondary)] border-black/[0.06] text-zinc-400'
                    : 'bg-[var(--surface-secondary)] border-white/[0.08] text-zinc-500'
                }`}
              >
                <DollarSign className="w-6 h-6 text-cyan-400" />
              </div>
              <h3
                className={`text-sm font-semibold mb-1 ${
                  isLight ? 'text-[var(--ink)]' : 'text-white'
                }`}
              >
                {t.noResults}
              </h3>
              <p
                className={`text-xs max-w-sm mb-5 ${
                  isLight ? 'text-zinc-500' : 'text-white/40'
                }`}
              >
                {t.noResultsHint}
              </p>
              <button
                onClick={() => setIsNewDealModalOpen(true)}
                className={`px-4 py-1.5 font-semibold text-xs rounded-full transition shadow-sm cursor-pointer active:opacity-80 ${
                  isLight
                    ? 'bg-black text-white hover:bg-black/90'
                    : 'bg-white text-black hover:bg-white/90'
                }`}
              >
                {t.addDeal}
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead
                    className={`sticky top-0 z-10 border-b uppercase tracking-wider text-[10px] select-none font-semibold shadow-xs ${
                      isLight
                        ? 'bg-[var(--canvas)]/95 backdrop-blur-md border-black/[0.06] text-zinc-500'
                        : 'bg-[var(--canvas)]/95 backdrop-blur-md border-white/[0.06] text-white/40'
                    }`}
                  >
                    <tr>
                      {/* Checkbox Column */}
                      <th className="py-3 px-3 w-10 text-center">
                        <div className="flex items-center justify-center">
                          <CustomCheckbox
                            checked={allFilteredSelected}
                            indeterminate={someSelected && !allFilteredSelected}
                            onChange={handleToggleSelectAll}
                          />
                        </div>
                      </th>

                      <th
                        className={`py-3 px-4 cursor-pointer transition whitespace-nowrap ${
                          isLight ? 'hover:text-black' : 'hover:text-white'
                        }`}
                        onClick={() => handleSort('artistName')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{t.fieldArtist}</span>
                          {sortField === 'artistName' && (
                            <span className="text-cyan-400 font-mono">
                              {sortAsc ? '▲' : '▼'}
                            </span>
                          )}
                        </div>
                      </th>

                      <th
                        className={`py-3 px-4 transition whitespace-nowrap ${
                          isLight ? 'hover:text-black' : 'hover:text-white'
                        }`}
                      >
                        {t.fieldPlatform}
                      </th>

                      <th
                        className={`py-3 px-4 cursor-pointer transition whitespace-nowrap ${
                          isLight ? 'hover:text-black' : 'hover:text-white'
                        }`}
                        onClick={() => handleSort('stage')}
                      >
                        {t.fieldStage}
                      </th>

                      <th
                        className={`py-3 px-4 cursor-pointer transition whitespace-nowrap ${
                          isLight ? 'hover:text-black' : 'hover:text-white'
                        }`}
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{t.fieldAmount}</span>
                          {sortField === 'amount' && (
                            <span className="text-emerald-400 font-mono">
                              {sortAsc ? '▲' : '▼'}
                            </span>
                          )}
                        </div>
                      </th>

                      <th
                        className={`py-3 px-4 cursor-pointer transition whitespace-nowrap ${
                          isLight ? 'hover:text-black' : 'hover:text-white'
                        }`}
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{t.fieldDealDate}</span>
                          {sortField === 'date' && (
                            <span className="text-cyan-400 font-mono">
                              {sortAsc ? '▲' : '▼'}
                            </span>
                          )}
                        </div>
                      </th>

                      <th
                        className={`py-3 px-4 transition ${
                          isLight ? 'hover:text-black' : 'hover:text-white'
                        }`}
                      >
                        {t.fieldDealNotes}
                      </th>

                      {/* Actions column with Sorting Dropdown */}
                      <th className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <span>{t.fieldActions}</span>
                          <div className="relative inline-block text-left" ref={sortDropdownRef}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsSortDropdownOpen(!isSortDropdownOpen);
                              }}
                              className={`p-1 rounded-md border transition cursor-pointer flex items-center justify-center ${
                                sortField
                                  ? isLight
                                    ? 'bg-cyan-50 border-cyan-300 text-cyan-700 shadow-xs'
                                    : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-xs'
                                  : isLight
                                  ? 'bg-white border-black/[0.08] text-zinc-600 hover:text-black hover:border-black/[0.15]'
                                  : 'bg-[var(--surface-secondary)] border-white/[0.08] text-white/60 hover:text-white hover:border-white/20'
                              }`}
                              title={t.sortBy}
                            >
                              <ArrowUpDown className="w-3 h-3" />
                            </button>

                            {isSortDropdownOpen && (
                              <div
                                className={`absolute right-0 mt-1.5 w-44 rounded-xl border p-1 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 normal-case tracking-normal ${
                                  isLight
                                    ? 'bg-white border-black/[0.08] text-zinc-800'
                                    : 'bg-[var(--surface-secondary)] border-white/[0.1] text-white shadow-black/60'
                                }`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className={`px-2.5 py-1.5 text-[10px] font-semibold tracking-wider uppercase border-b mb-1 ${
                                  isLight ? 'text-zinc-400 border-black/[0.05]' : 'text-white/40 border-white/[0.06]'
                                }`}>
                                  {t.sortBy}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleSetSortPreset('newest')}
                                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                                    sortField === 'createdAt' && !sortAsc
                                      ? isLight
                                        ? 'bg-cyan-50 text-cyan-700 font-medium'
                                        : 'bg-cyan-500/15 text-cyan-300 font-medium'
                                      : isLight
                                      ? 'hover:bg-black/[0.04] text-zinc-700'
                                      : 'hover:bg-white/[0.06] text-white/80'
                                  }`}
                                >
                                  <span>{t.sortNewestFirst}</span>
                                  {sortField === 'createdAt' && !sortAsc && <Check className="w-3.5 h-3.5 text-cyan-500" />}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSetSortPreset('oldest')}
                                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                                    sortField === 'createdAt' && sortAsc
                                      ? isLight
                                        ? 'bg-cyan-50 text-cyan-700 font-medium'
                                        : 'bg-cyan-500/15 text-cyan-300 font-medium'
                                      : isLight
                                      ? 'hover:bg-black/[0.04] text-zinc-700'
                                      : 'hover:bg-white/[0.06] text-white/80'
                                  }`}
                                >
                                  <span>{t.sortOldestFirst}</span>
                                  {sortField === 'createdAt' && sortAsc && <Check className="w-3.5 h-3.5 text-cyan-500" />}
                                </button>

                                <div className={`my-1 border-t ${isLight ? 'border-black/[0.05]' : 'border-white/[0.06]'}`} />

                                <button
                                  type="button"
                                  onClick={() => handleSetSortPreset('reset')}
                                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                                    !sortField
                                      ? isLight
                                        ? 'bg-zinc-100 text-zinc-900 font-medium'
                                        : 'bg-white/10 text-white font-medium'
                                      : isLight
                                      ? 'hover:bg-black/[0.04] text-zinc-600'
                                      : 'hover:bg-white/[0.06] text-white/70'
                                  }`}
                                >
                                  <span>{t.sortReset}</span>
                                  {!sortField && <Check className="w-3.5 h-3.5 text-zinc-400" />}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody
                    className={`divide-y ${
                      isLight ? 'divide-black/[0.04]' : 'divide-white/[0.02]'
                    }`}
                  >
                    {sortedDeals.map((deal) => {
                      const isSelected = selectedDealIds.includes(deal.id);
                      const isDragged = draggedDealId === deal.id;
                      const isDragOver = dragOverDealId === deal.id;

                      return (
                        <tr
                          key={deal.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal.id)}
                          onDragOver={(e) => handleDragOver(e, deal.id)}
                          onDragEnd={handleDragEnd}
                          onDrop={(e) => handleDrop(e, deal.id)}
                          className={`group transition duration-200 cursor-pointer ${
                            isDragged
                              ? 'opacity-40'
                              : isDragOver
                              ? isLight
                                ? 'bg-cyan-100/60 border-t-2 border-cyan-500'
                                : 'bg-cyan-500/20 border-t-2 border-cyan-400'
                              : isSelected
                              ? isLight
                                ? 'bg-cyan-50/70 hover:bg-cyan-50'
                                : 'bg-cyan-500/10 hover:bg-cyan-500/15'
                              : isLight
                              ? 'hover:bg-black/[0.02]'
                              : 'hover:bg-white/[0.02]'
                          }`}
                          onClick={() => setActiveDealId(deal.id)}
                        >
                          {/* Checkbox Column */}
                          <td
                            className="py-3 px-3 text-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDealSelection(deal.id);
                            }}
                          >
                            <div className="flex items-center justify-center">
                              <CustomCheckbox
                                checked={isSelected}
                                onChange={() => toggleDealSelection(deal.id)}
                              />
                            </div>
                          </td>

                          {/* Artist Name with Avatar */}
                        <td
                          className="py-3 px-4 min-w-[200px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full studio-contact-avatar ${getAvatarGradient(
                                deal.artistName
                              )} p-[1px] flex items-center justify-center shrink-0 shadow-sm`}
                            >
                              <div
                                className={`w-full h-full rounded-full flex items-center justify-center font-bold text-[10px] ${
                                  isLight ? 'bg-white text-zinc-900' : 'bg-[var(--surface)] text-white'
                                }`}
                              >
                                {getInitials(deal.artistName)}
                              </div>
                            </div>

                            <div
                              className={`font-semibold transition cursor-pointer truncate text-xs ${
                                isLight
                                  ? 'text-[var(--ink)] hover:text-cyan-700'
                                  : 'text-white hover:text-cyan-300'
                              }`}
                              onClick={() => handleArtistClick(deal.artistName)}
                              title="Click to view artist profile"
                            >
                              <span className="truncate">{deal.artistName}</span>
                            </div>
                          </div>
                        </td>

                        {/* Platform */}
                        <td
                          className="py-3 px-4 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-1.5">
                            {getPlatformIcon(deal.platform)}
                            <CustomDropdown
                              variant="table-cell"
                              category="platform"
                              value={deal.platform}
                              onChange={(val) =>
                                updateDeal(deal.id, { platform: val as DealPlatform })
                              }
                            />
                          </div>
                        </td>

                        {/* Stage Badge */}
                        <td
                          className="py-3 px-4 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CustomDropdown
                            variant="table-cell"
                            value={deal.stage}
                            onChange={(val) =>
                              updateDeal(deal.id, { stage: val as DealStage })
                            }
                            options={[
                              { id: 'interested', label: t.stageInterested, color: 'amber' },
                              { id: 'in_progress', label: t.stageInProgress, color: 'blue' },
                              { id: 'closed', label: t.stageClosed, color: 'emerald' },
                              { id: 'cancelled', label: t.stageCancelled, color: 'red' },
                            ]}
                            allowCreate={false}
                          />
                        </td>

                        {/* Amount Formatted with Currency */}
                        <td
                          className="py-3 px-4 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-1 font-mono font-bold text-xs">
                            <span
                              className={
                                deal.stage === 'closed'
                                    ? isLight
                                      ? 'text-emerald-700 font-black'
                                      : 'text-emerald-300 font-black'
                                    : isLight
                                    ? 'text-cyan-700'
                                    : 'text-cyan-400'
                              }
                            >
                              {formatMoney(deal.amount)}
                            </span>
                          </div>
                        </td>

                        {/* Deal Date */}
                        <td
                          className="py-3 px-4 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2">
                            <DatePicker
                              value={deal.date || ''}
                              onChange={(val) => updateDeal(deal.id, { date: val })}
                              variant="table-cell"
                              showShortcuts={true}
                              allowClear={true}
                            />
                            {deal.date && renderDateBadge(deal.date, deal.stage)}
                          </div>
                        </td>

                        {/* Notes / Terms */}
                        <td
                          className={`py-3 px-4 max-w-xs truncate text-[11px] ${
                            isLight ? 'text-zinc-500' : 'text-white/50'
                          }`}
                        >
                          {deal.notes || <span className="text-zinc-400">—</span>}
                        </td>

                        {/* Actions */}
                        <td
                          className="py-3 px-4 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            {/* Drag-and-drop Handle */}
                            <div
                              className={`p-1 rounded-md transition cursor-grab active:cursor-grabbing ${
                                isLight
                                  ? 'text-zinc-400 hover:text-zinc-700 hover:bg-black/[0.06]'
                                  : 'text-white/30 hover:text-white/80 hover:bg-white/[0.08]'
                              }`}
                              title={t.dragToReorder}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                            </div>

                            <button
                              onClick={() => setActiveDealId(deal.id)}
                              className={`ios-icon-action p-1 rounded-md transition cursor-pointer ${
                                isLight
                                  ? 'hover:bg-black/[0.06] text-zinc-500 hover:text-black'
                                  : 'hover:bg-white/[0.08] text-white/40 hover:text-white'
                              }`}
                              title={t.editDealTitle}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDealToDelete(deal)}
                              className="ios-icon-action is-destructive p-1 rounded-md hover:bg-red-500/20 text-red-500/70 hover:text-red-600 transition cursor-pointer"
                              title={t.delete}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div
                className={`mt-auto border-t px-4 py-3 flex items-center justify-between text-xs shrink-0 select-none ${
                  isLight
                    ? 'bg-[var(--canvas)] border-black/[0.06] text-zinc-500'
                    : 'bg-black/20 border-white/[0.04] text-white/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd
                      className={`px-1.5 py-0.5 border rounded font-mono text-[10px] ${
                        isLight
                          ? 'bg-white border-black/[0.08] text-zinc-700'
                          : 'bg-[var(--surface-secondary)] border-white/10 text-white/70'
                      }`}
                    >
                      ⌘N
                    </kbd>
                    <span>{t.addDeal}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd
                      className={`px-1.5 py-0.5 border rounded font-mono text-[10px] ${
                        isLight
                          ? 'bg-white border-black/[0.08] text-zinc-700'
                          : 'bg-[var(--surface-secondary)] border-white/10 text-white/70'
                      }`}
                    >
                      /
                    </kbd>
                    <span>{t.searchPlaceholder.split(' ')[0]}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd
                      className={`px-1.5 py-0.5 border rounded font-mono text-[10px] ${
                        isLight
                          ? 'bg-white border-black/[0.08] text-zinc-700'
                          : 'bg-[var(--surface-secondary)] border-white/10 text-white/70'
                      }`}
                    >
                      Esc
                    </kbd>
                    <span>Close</span>
                  </span>
                </div>

                <div className={`font-mono text-[11px] ${isLight ? 'text-zinc-600' : 'text-white/50'}`}>
                  {sortedDeals.length} {t.dealsTab.toLowerCase()}
                </div>
              </div>
            </>
          )}

          {/* Floating Bulk Actions Bar */}
          {selectedDealIds.length > 0 && (
            <aside
              role="region"
              aria-label="Bulk actions bar"
              className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-30 px-4 py-2.5 rounded-2xl border shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 ${
                isLight
                  ? 'bg-white/95 border-black/[0.1] text-zinc-900'
                  : 'bg-[var(--surface-secondary)]/95 border-white/[0.12] text-white'
              }`}
            >
              {/* Selected Count & Total Amount */}
              <div className="flex items-center gap-2 pr-2 border-r border-zinc-500/20 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-semibold">
                  {t.bulkSelected}: {selectedDealIds.length}
                </span>
                <span className="text-[11px] opacity-75 font-mono">
                  • {t.bulkDealsTotalSum || 'Сумма'}: {formatMoney(totalSelectedAmount)}
                </span>
              </div>

              {/* Quick Stage Dropdown */}
              <CustomDropdown
                variant="filter"
                placeholder={`${t.bulkSetStage || 'Сменить этап'}...`}
                value=""
                category="dealStage"
                onChange={(val) => {
                  if (val) bulkUpdateDeals(selectedDealIds, { stage: val as DealStage });
                }}
              />

              {/* Quick Platform Dropdown */}
              <CustomDropdown
                variant="filter"
                placeholder={`${t.bulkSetPlatform || 'Сменить платформу'}...`}
                value=""
                category="platform"
                onChange={(val) => {
                  if (val) bulkUpdateDeals(selectedDealIds, { platform: val as DealPlatform });
                }}
              />

              {/* Bulk Delete */}
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className={`ios-icon-action is-destructive p-1.5 rounded-xl border transition cursor-pointer ml-1 ${
                  isLight
                    ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                    : 'bg-red-500/15 hover:bg-red-500/25 text-red-300 border-red-500/30'
                }`}
                title={t.bulkDelete}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>

              {/* Clear Selection */}
              <button
                type="button"
                onClick={clearDealSelection}
                className={`ios-icon-action p-1.5 rounded-xl transition cursor-pointer ${
                  isLight
                    ? 'hover:bg-black/[0.06] text-zinc-500 hover:text-black'
                    : 'hover:bg-white/10 text-white/50 hover:text-white'
                }`}
                title={t.bulkDeselectAll}
              >
                <X className="w-4 h-4" />
              </button>
            </aside>
          )}
        </div>
      </div>

      {/* Delete Deal Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(dealToDelete)}
        title={t.delete}
        description={
          dealToDelete
            ? `${t.deleteConfirm} (${dealToDelete.artistName} - ${formatMoney(dealToDelete.amount)})`
            : ''
        }
        confirmLabel={t.delete}
        cancelLabel={t.cancel}
        isDestructive={true}
        onConfirm={confirmDeleteDeal}
        onClose={() => setDealToDelete(null)}
      />

      {/* Bulk Delete Deals Confirm Modal */}
      <ConfirmModal
        isOpen={isBulkDeleteModalOpen}
        title={t.bulkDeleteDealsModalTitle || 'Удалить выбранные сделки?'}
        description={
          typeof t.bulkDeleteDealsConfirmDesc === 'function'
            ? t.bulkDeleteDealsConfirmDesc(selectedDealIds.length)
            : `Вы действительно хотите удалить ${selectedDealIds.length} выбранных сделок?`
        }
        confirmLabel={t.bulkDelete}
        cancelLabel={t.cancel}
        isDestructive={true}
        onConfirm={confirmBulkDelete}
        onClose={() => setIsBulkDeleteModalOpen(false)}
      />
    </>
  );
};
