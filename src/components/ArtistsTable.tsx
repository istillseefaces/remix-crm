import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { Artist, ConnectStatus, SalesStatus, ArtistStatus, DemoStatus, ReactionStatus } from '../types';
import {
  Instagram,
  Send,
  Mail,
  Calendar,
  AlertCircle,
  Sparkles,
  Edit2,
  Trash2,
  Minus,
  Plus,
  Check,
  X,
  Clock,
  ArrowUpDown,
  GripVertical,
  MessageSquare,
  Copy,
  RotateCcw,
  Trash,
  FilterX,
  Users,
  CalendarDays,
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { CustomCheckbox } from './CustomCheckbox';
import { CustomDropdown } from './CustomDropdown';
import { DatePicker } from './DatePicker';
import { ColumnFilterPopover } from './ColumnFilterPopover';
import { getFollowUpStatus } from '../utils/customOptions';
import { copyCleanEmailList } from '../utils/exportUtils';

export const ArtistsTable: React.FC = () => {
  const {
    filteredArtists,
    t,
    theme,
    customOptions,
    updateArtist,
    deleteArtist,
    reorderArtists,
    crmViewMode,
    setCrmViewMode,
    trashCount,
    restoreArtist,
    hardDeleteArtist,
    emptyTrash,
    bulkRestoreArtists,
    bulkHardDeleteArtists,
    columnFilters,
    clearAllColumnFilters,
    setActiveArtistId,
    setSelectedTagFilter,
    setIsNewArtistModalOpen,
    selectedArtistIds,
    toggleArtistSelection,
    selectAllFilteredArtists,
    clearArtistSelection,
    bulkUpdateArtists,
    bulkDeleteArtists,
    showToast,
  } = useApp();

  const isLight = theme === 'light';

  const [sortField, setSortField] = useState<keyof Artist | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [artistToDelete, setArtistToDelete] = useState<Artist | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isEmptyTrashModalOpen, setIsEmptyTrashModalOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Drag & drop state for manual reordering
  const [draggedArtistId, setDraggedArtistId] = useState<string | null>(null);
  const [dragOverArtistId, setDragOverArtistId] = useState<string | null>(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    artist: Artist;
    x: number;
    y: number;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown & context menu on click outside or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSortDropdownOpen(false);
        setContextMenu(null);
      }
    };

    const handleScrollOrResize = () => {
      if (contextMenu) setContextMenu(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isSortDropdownOpen, contextMenu]);

  // Inline editing for text cells (name, email, instagram, notes)
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: 'name' | 'email' | 'instagram' | 'notes';
    value: string;
  } | null>(null);

  const handleSort = (field: keyof Artist) => {
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

  const sortedArtists = useMemo(() => {
    if (!sortField) return filteredArtists;

    return [...filteredArtists].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

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
  }, [filteredArtists, sortField, sortAsc]);

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (sortField) {
      setSortField(null);
    }
    setDraggedArtistId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverArtistId !== id) {
      setDragOverArtistId(id);
    }
  };

  const handleDragEnd = () => {
    setDraggedArtistId(null);
    setDragOverArtistId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = draggedArtistId || e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      handleDragEnd();
      return;
    }

    const currentList = [...filteredArtists];
    const sourceIndex = currentList.findIndex((a) => a.id === sourceId);
    const targetIndex = currentList.findIndex((a) => a.id === targetId);

    if (sourceIndex !== -1 && targetIndex !== -1) {
      const updated = [...currentList];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, moved);
      reorderArtists(updated);
    }

    handleDragEnd();
  };

  // Context Menu Handler
  const handleContextMenu = (e: React.MouseEvent, artist: Artist) => {
    e.preventDefault();
    e.stopPropagation();

    const menuWidth = 230;
    const menuHeight = 220;
    let posX = e.clientX;
    let posY = e.clientY;

    if (posX + menuWidth > window.innerWidth - 10) {
      posX = Math.max(10, window.innerWidth - menuWidth - 10);
    }
    if (posY + menuHeight > window.innerHeight - 10) {
      posY = Math.max(10, window.innerHeight - menuHeight - 10);
    }

    setContextMenu({
      artist,
      x: posX,
      y: posY,
    });
  };

  const handleCopyContact = (text: string, label: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!text || !text.trim()) return;
    navigator.clipboard.writeText(text.trim());
    showToast(
      typeof t.copiedFieldToast === 'function'
        ? t.copiedFieldToast(label)
        : `${label}: ${t.copiedToClipboard || 'скопировано'}`,
      'success'
    );
    setContextMenu(null);
  };

  // Selection helpers
  const allFilteredSelected =
    filteredArtists.length > 0 &&
    filteredArtists.every((a) => selectedArtistIds.includes(a.id));
  const someSelected =
    selectedArtistIds.length > 0 &&
    filteredArtists.some((a) => selectedArtistIds.includes(a.id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      clearArtistSelection();
    } else {
      selectAllFilteredArtists(filteredArtists.map((a) => a.id));
    }
  };

  const handleBulkCopyEmails = async () => {
    const selectedArtists = filteredArtists.filter((a) => selectedArtistIds.includes(a.id));
    const result = await copyCleanEmailList(selectedArtists);
    if (result.count > 0) {
      showToast(t.copiedEmailsToast(result.count), 'mail');
    } else {
      showToast(t.noEmailsToast, 'info');
    }
  };

  const handleBulkSetFollowUp = (daysToAdd: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    const dateStr = d.toISOString().split('T')[0];
    bulkUpdateArtists(selectedArtistIds, { followUpDate: dateStr });
  };

  const confirmDeleteArtist = () => {
    if (artistToDelete) {
      if (crmViewMode === 'trash') {
        hardDeleteArtist(artistToDelete.id);
      } else {
        deleteArtist(artistToDelete.id);
      }
      setArtistToDelete(null);
    }
  };

  const confirmBulkDelete = () => {
    if (crmViewMode === 'trash') {
      bulkHardDeleteArtists(selectedArtistIds);
    } else {
      bulkDeleteArtists(selectedArtistIds);
    }
    setIsBulkDeleteModalOpen(false);
  };

  const confirmEmptyTrash = () => {
    emptyTrash();
    setIsEmptyTrashModalOpen(false);
  };

  const saveInlineEdit = () => {
    if (editingCell) {
      updateArtist(editingCell.id, { [editingCell.field]: editingCell.value.trim() });
      setEditingCell(null);
    }
  };

  const renderFollowUpBadge = (dateStr: string) => {
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

  const getInstagramUrl = (handle: string) => {
    if (!handle) return '#';
    const clean = handle.replace('@', '').trim();
    return `https://instagram.com/${clean}`;
  };

  const getTelegramUrl = (handle: string) => {
    if (!handle) return '#';
    const clean = handle.replace('@', '').trim();
    return `https://t.me/${clean}`;
  };

  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-pink-500 via-rose-500 to-amber-500',
      'from-indigo-500 via-purple-500 to-pink-500',
      'from-cyan-500 via-blue-500 to-indigo-500',
      'from-emerald-400 via-teal-500 to-cyan-600',
      'from-violet-600 via-purple-600 to-fuchsia-600',
      'from-amber-400 via-orange-500 to-red-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  const getInitials = (name: string) => {
    if (!name) return 'A';
    const clean = name.replace('@', '').trim();
    const parts = clean.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
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
          {/* Top Sub-Bar: View Mode (All / Trash) & Active Column Filters notice */}
          <div
            className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 select-none ${
              isLight
                ? crmViewMode === 'trash'
                  ? 'bg-red-50/60 border-red-200/80'
                  : 'bg-[var(--canvas)]/80 border-black/[0.06]'
                : crmViewMode === 'trash'
                ? 'bg-red-950/20 border-red-500/20'
                : 'bg-[var(--surface)]/60 border-white/[0.04]'
            }`}
          >
            {/* View Mode Switcher */}
            <div className="flex items-center gap-2">
              <div
                className={`p-0.5 rounded-xl border flex items-center gap-1 ${
                  isLight ? 'bg-white border-black/[0.08]' : 'bg-[var(--surface-secondary)] border-white/[0.08]'
                }`}
              >
                <button
                  onClick={() => setCrmViewMode('active')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition cursor-pointer text-xs ${
                    crmViewMode === 'active'
                      ? isLight
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-white text-black shadow-xs font-semibold'
                      : isLight
                      ? 'text-zinc-600 hover:text-black hover:bg-black/[0.04]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{t.allContacts}</span>
                </button>

                <button
                  onClick={() => setCrmViewMode('trash')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition cursor-pointer text-xs ${
                    crmViewMode === 'trash'
                      ? 'bg-red-500 text-white font-semibold shadow-xs shadow-red-500/20'
                      : isLight
                      ? 'text-zinc-600 hover:text-red-700 hover:bg-red-50'
                      : 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.trashTitle}</span>
                  {trashCount > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${
                        crmViewMode === 'trash'
                          ? 'bg-white text-red-600'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {trashCount}
                    </span>
                  )}
                </button>
              </div>

              {crmViewMode === 'trash' && (
                <span
                  className={`text-[11px] hidden sm:inline ${
                    isLight ? 'text-red-700' : 'text-red-300'
                  }`}
                >
                  {t.trashNotice}
                </span>
              )}
            </div>

            {/* Actions & Filters on the Right */}
            <div className="flex items-center gap-2">
              {/* Reset column filters if active */}
              {Object.keys(columnFilters).length > 0 && (
                <button
                  onClick={clearAllColumnFilters}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    isLight
                      ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                      : 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/30'
                  }`}
                  title={t.clearColumnFilter}
                >
                  <FilterX className="w-3 h-3 text-indigo-500" />
                  <span>{t.clearAllColumnFilters}</span>
                  <span className="px-1 py-0.2 rounded font-mono text-[10px] bg-indigo-500/20 font-bold">
                    {Object.keys(columnFilters).length}
                  </span>
                </button>
              )}

              {crmViewMode === 'trash' && trashCount > 0 && (
                <button
                  onClick={() => setIsEmptyTrashModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 transition cursor-pointer"
                >
                  <Trash className="w-3 h-3" />
                  <span>{t.emptyTrashBtn}</span>
                </button>
              )}
            </div>
          </div>

          {sortedArtists.length === 0 ? (
            <div className="studio-empty flex-1 flex flex-col items-center text-center">
              <div
                className={`w-12 h-12 rounded-full border flex items-center justify-center mb-3 shadow-md ${
                  isLight
                    ? 'bg-[var(--surface-secondary)] border-black/[0.06] text-zinc-400'
                    : 'bg-[var(--surface-secondary)] border-white/[0.08] text-zinc-500'
                }`}
              >
                <Users className="w-6 h-6 text-zinc-400" strokeWidth={1.4} />
              </div>
              <h3
                className={`text-sm font-semibold mb-1 ${
                  isLight ? 'text-[var(--ink)]' : 'text-white'
                }`}
              >
                {t.noResults}
              </h3>
              <p
                className={`text-xs max-w-sm mb-4 ${
                  isLight ? 'text-zinc-500' : 'text-zinc-400'
                }`}
              >
                {t.noResultsHint}
              </p>
              <button
                onClick={() => setIsNewArtistModalOpen(true)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-lg transition cursor-pointer flex items-center gap-2 ${
                  isLight
                    ? 'bg-black text-white hover:bg-zinc-800'
                    : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addArtist}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Responsive Table Scroll Container */}
              <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0 select-text">
                <table className="w-full text-left text-xs border-collapse">
                  {/* Sticky Header */}
                  <thead
                    className={`sticky top-0 z-20 backdrop-blur-md border-b select-none ${
                      isLight
                        ? 'bg-[var(--canvas)]/95 border-black/[0.06] text-zinc-600'
                        : 'bg-[var(--surface)]/95 border-white/[0.04] text-white/50'
                    }`}
                  >
                    <tr>
                      {/* Checkbox column */}
                      <th className="py-3 px-3 w-10 text-center">
                        <CustomCheckbox
                          checked={allFilteredSelected}
                          indeterminate={someSelected && !allFilteredSelected}
                          onChange={handleToggleSelectAll}
                        />
                      </th>

                      <th className="py-3 px-4 font-medium transition">
                        <div className="flex items-center justify-between gap-1">
                          <div
                            onClick={() => handleSort('name')}
                            className={`flex items-center gap-1.5 cursor-pointer hover:${
                              isLight ? 'text-black' : 'text-white'
                            }`}
                          >
                            <span>{t.fieldInstaName}</span>
                            {sortField === 'name' && (
                              <span className="text-emerald-500 font-mono text-[10px]">
                                {sortAsc ? '▲' : '▼'}
                              </span>
                            )}
                          </div>
                          <ColumnFilterPopover
                            columnKey="artist"
                            title={t.fieldInstaName}
                            isLight={isLight}
                          />
                        </div>
                      </th>

                      <th className="py-3 px-4 font-medium transition">
                        <div className="flex items-center justify-between gap-1">
                          <div
                            onClick={() => handleSort('connect')}
                            className={`flex items-center gap-1.5 cursor-pointer hover:${
                              isLight ? 'text-black' : 'text-white'
                            }`}
                          >
                            <span>{t.fieldConnect}</span>
                            {sortField === 'connect' && (
                              <span className="text-emerald-500 font-mono text-[10px]">
                                {sortAsc ? '▲' : '▼'}
                              </span>
                            )}
                          </div>
                          <ColumnFilterPopover
                            columnKey="connect"
                            title={t.fieldConnect}
                            options={[
                              { value: 'yes', label: t.connectYes },
                              { value: 'no', label: t.connectNo },
                            ]}
                            isLight={isLight}
                          />
                        </div>
                      </th>

                      <th className="py-3 px-4 font-medium min-w-[170px]">
                        <div className="flex items-center justify-between gap-1">
                          <span>{t.fieldTypes}</span>
                          <ColumnFilterPopover
                            columnKey="types"
                            title={t.fieldTypes}
                            options={(customOptions?.genres || []).map((o) => ({
                              value: o.label,
                              label: o.label,
                            }))}
                            isLight={isLight}
                          />
                        </div>
                      </th>

                      <th className="py-3 px-4 font-medium transition">
                        <div className="flex items-center justify-between gap-1">
                          <div
                            onClick={() => handleSort('sales')}
                            className={`flex items-center gap-1.5 cursor-pointer hover:${
                              isLight ? 'text-black' : 'text-white'
                            }`}
                          >
                            <span>{t.fieldSales}</span>
                            {sortField === 'sales' && (
                              <span className="text-emerald-500 font-mono text-[10px]">
                                {sortAsc ? '▲' : '▼'}
                              </span>
                            )}
                          </div>
                          <ColumnFilterPopover
                            columnKey="sales"
                            title={t.fieldSales}
                            isLight={isLight}
                          />
                        </div>
                      </th>

                      <th className="py-3 px-4 font-medium transition">
                        <div className="flex items-center justify-between gap-1">
                          <div
                            onClick={() => handleSort('status')}
                            className={`flex items-center gap-1.5 cursor-pointer hover:${
                              isLight ? 'text-black' : 'text-white'
                            }`}
                          >
                            <span>{t.fieldStatus}</span>
                            {sortField === 'status' && (
                              <span className="text-emerald-500 font-mono text-[10px]">
                                {sortAsc ? '▲' : '▼'}
                              </span>
                            )}
                          </div>
                          <ColumnFilterPopover
                            columnKey="status"
                            title={t.fieldStatus}
                            options={(customOptions?.artistStatus || []).map((o) => ({
                              value: o.id,
                              label: o.label,
                            }))}
                            isLight={isLight}
                          />
                        </div>
                      </th>

                      <th className="py-3 px-4 font-medium transition">
                        <div className="flex items-center justify-between gap-1">
                          <div
                            onClick={() => handleSort('demoStatus')}
                            className={`flex items-center gap-1.5 cursor-pointer hover:${
                              isLight ? 'text-black' : 'text-white'
                            }`}
                          >
                            <span>{t.fieldDemo}</span>
                            {sortField === 'demoStatus' && (
                              <span className="text-emerald-500 font-mono text-[10px]">
                                {sortAsc ? '▲' : '▼'}
                              </span>
                            )}
                          </div>
                          <ColumnFilterPopover
                            columnKey="demoStatus"
                            title={t.fieldDemo}
                            options={(customOptions?.demoStatus || []).map((o) => ({
                              value: o.id,
                              label: o.label,
                            }))}
                            isLight={isLight}
                          />
                        </div>
                      </th>

                      <th className="py-3 px-4 font-medium text-center transition">
                        <div className="flex items-center justify-center gap-1">
                          <div
                            onClick={() => handleSort('touches')}
                            className={`flex items-center gap-1.5 cursor-pointer hover:${
                              isLight ? 'text-black' : 'text-white'
                            }`}
                          >
                            <span>{t.fieldTouches}</span>
                            {sortField === 'touches' && (
                              <span className="text-emerald-500 font-mono text-[10px]">
                                {sortAsc ? '▲' : '▼'}
                              </span>
                            )}
                          </div>
                          <ColumnFilterPopover
                            columnKey="touches"
                            title={t.fieldTouches}
                            isLight={isLight}
                          />
                        </div>
                      </th>

                      <th className="py-3 px-4 font-medium transition">
                        <div className="flex items-center justify-between gap-1">
                          <div
                            onClick={() => handleSort('reaction')}
                            className={`flex items-center gap-1.5 cursor-pointer hover:${
                              isLight ? 'text-black' : 'text-white'
                            }`}
                          >
                            <span>{t.fieldReaction}</span>
                            {sortField === 'reaction' && (
                              <span className="text-emerald-500 font-mono text-[10px]">
                                {sortAsc ? '▲' : '▼'}
                              </span>
                            )}
                          </div>
                          <ColumnFilterPopover
                            columnKey="reaction"
                            title={t.fieldReaction}
                            options={(customOptions?.reaction || []).map((o) => ({
                              value: o.id,
                              label: o.label,
                            }))}
                            isLight={isLight}
                          />
                        </div>
                      </th>

                      {/* NEW: Last Contact Date column */}
                      <th className="py-3 px-4 font-medium transition min-w-[150px]">
                        <div className="flex items-center justify-between gap-1">
                          <div
                            onClick={() => handleSort('lastContactDate')}
                            className={`flex items-center gap-1.5 cursor-pointer hover:${
                              isLight ? 'text-black' : 'text-white'
                            }`}
                          >
                            <span>{t.fieldLastContactDate}</span>
                            {sortField === 'lastContactDate' && (
                              <span className="text-emerald-500 font-mono text-[10px]">
                                {sortAsc ? '▲' : '▼'}
                              </span>
                            )}
                          </div>
                          <ColumnFilterPopover
                            columnKey="lastContactDate"
                            title={t.fieldLastContactDate}
                            isLight={isLight}
                          />
                        </div>
                      </th>

                      <th className="py-3 px-4 font-medium transition min-w-[150px]">
                        <div className="flex items-center justify-between gap-1">
                          <div
                            onClick={() => handleSort('followUpDate')}
                            className={`flex items-center gap-1.5 cursor-pointer hover:${
                              isLight ? 'text-black' : 'text-white'
                            }`}
                          >
                            <span>{t.fieldFollowUp}</span>
                            {sortField === 'followUpDate' && (
                              <span className="text-emerald-500 font-mono text-[10px]">
                                {sortAsc ? '▲' : '▼'}
                              </span>
                            )}
                          </div>
                          <ColumnFilterPopover
                            columnKey="followUpDate"
                            title={t.fieldFollowUp}
                            isLight={isLight}
                          />
                        </div>
                      </th>

                      {/* Actions column with Sorting Dropdown */}
                      <th className="py-3 px-4 font-medium text-right whitespace-nowrap">
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
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                                    : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-xs'
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
                                <div
                                  className={`px-2.5 py-1.5 text-[10px] font-semibold tracking-wider uppercase border-b mb-1 ${
                                    isLight
                                      ? 'text-zinc-400 border-black/[0.05]'
                                      : 'text-white/40 border-white/[0.06]'
                                  }`}
                                >
                                  {t.sortBy}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleSetSortPreset('newest')}
                                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                                    sortField === 'createdAt' && !sortAsc
                                      ? isLight
                                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                                        : 'bg-emerald-500/15 text-emerald-300 font-medium'
                                      : isLight
                                      ? 'hover:bg-black/[0.04] text-zinc-700'
                                      : 'hover:bg-white/[0.06] text-white/80'
                                  }`}
                                >
                                  <span>{t.sortNewestFirst}</span>
                                  {sortField === 'createdAt' && !sortAsc && (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSetSortPreset('oldest')}
                                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                                    sortField === 'createdAt' && sortAsc
                                      ? isLight
                                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                                        : 'bg-emerald-500/15 text-emerald-300 font-medium'
                                      : isLight
                                      ? 'hover:bg-black/[0.04] text-zinc-700'
                                      : 'hover:bg-white/[0.06] text-white/80'
                                  }`}
                                >
                                  <span>{t.sortOldestFirst}</span>
                                  {sortField === 'createdAt' && sortAsc && (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  )}
                                </button>

                                <div
                                  className={`my-1 border-t ${
                                    isLight ? 'border-black/[0.05]' : 'border-white/[0.06]'
                                  }`}
                                />

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
                                  {!sortField && (
                                    <Check className="w-3.5 h-3.5 text-zinc-400" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody
                    className={`divide-y transition-colors ${
                      isLight
                        ? 'divide-black/[0.04] text-zinc-900'
                        : 'divide-white/[0.02] text-zinc-200'
                    }`}
                  >
                    {sortedArtists.map((artist) => {
                      const isSelected = selectedArtistIds.includes(artist.id);
                      const isDragged = draggedArtistId === artist.id;
                      const isDragOver = dragOverArtistId === artist.id;

                      return (
                        <tr
                          key={artist.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, artist.id)}
                          onDragOver={(e) => handleDragOver(e, artist.id)}
                          onDragEnd={handleDragEnd}
                          onDrop={(e) => handleDrop(e, artist.id)}
                          onContextMenu={(e) => handleContextMenu(e, artist)}
                          onClick={() => setActiveArtistId(artist.id)}
                          className={`group transition-colors duration-200 cursor-pointer ${
                            isDragged
                              ? 'opacity-40'
                              : isDragOver
                              ? isLight
                                ? 'bg-emerald-100/60 border-t-2 border-emerald-500'
                                : 'bg-emerald-500/20 border-t-2 border-emerald-400'
                              : isSelected
                              ? isLight
                                ? 'bg-indigo-50/70 hover:bg-indigo-50'
                                : 'bg-indigo-950/20 hover:bg-indigo-950/30'
                              : isLight
                              ? 'hover:bg-black/[0.02]'
                              : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          {/* Checkbox */}
                          <td
                            className="py-3 px-3 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CustomCheckbox
                              checked={isSelected}
                              onChange={() => toggleArtistSelection(artist.id)}
                            />
                          </td>

                          {/* Artist Name & Avatar */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-7 h-7 rounded-full studio-contact-avatar ${getAvatarGradient(
                                  artist.name
                                )} flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-xs`}
                              >
                                {getInitials(artist.name)}
                              </div>
                              <div className="min-w-0 flex flex-col">
                                {editingCell?.id === artist.id && editingCell?.field === 'name' ? (
                                  <div
                                    className="flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input
                                      autoFocus
                                      type="text"
                                      value={editingCell.value}
                                      onChange={(e) =>
                                        setEditingCell({ ...editingCell, value: e.target.value })
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveInlineEdit();
                                        if (e.key === 'Escape') setEditingCell(null);
                                      }}
                                      className={`px-1.5 py-0.5 rounded text-xs border focus:outline-none ${
                                        isLight
                                          ? 'bg-white text-zinc-900 border-black/20'
                                          : 'bg-[var(--surface-secondary)] text-white border-white/20'
                                      }`}
                                    />
                                    <button
                                      onClick={saveInlineEdit}
                                      className="p-0.5 text-emerald-500 hover:text-emerald-400"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span
                                    onDoubleClick={(e) => {
                                      e.stopPropagation();
                                      setEditingCell({
                                        id: artist.id,
                                        field: 'name',
                                        value: artist.name,
                                      });
                                    }}
                                    className={`font-semibold tracking-tight text-xs truncate max-w-[180px] sm:max-w-[220px] ${
                                      isLight
                                        ? 'text-[var(--ink)] group-hover:text-indigo-600'
                                        : 'text-white group-hover:text-indigo-400'
                                    }`}
                                    title="Double click to edit"
                                  >
                                    {artist.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Connect Status */}
                          <td
                            className="py-3 px-4 whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CustomDropdown
                              variant="badge"
                              value={artist.connect}
                              onChange={(val) =>
                                updateArtist(artist.id, {
                                  connect: val as ConnectStatus,
                                })
                              }
                              options={[
                                { id: 'yes', label: t.connectYes, color: 'emerald' },
                                { id: 'no', label: t.connectNo, color: 'red' },
                              ]}
                              allowCreate={false}
                            />
                          </td>

                          {/* Types / Genre Tags */}
                          <td
                            className="py-3 px-4 min-w-[170px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex flex-wrap gap-1 items-center">
                              {artist.types && artist.types.length > 0 ? (
                                artist.types.map((tag, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setSelectedTagFilter(tag)}
                                    className={`px-2 py-0.5 rounded-full text-[10px] border transition font-mono cursor-pointer ${
                                      isLight
                                        ? 'bg-[var(--surface-secondary)] hover:bg-indigo-50 hover:text-indigo-700 text-zinc-700 border-black/[0.06]'
                                        : 'bg-[var(--surface-secondary)] hover:bg-indigo-500/20 hover:text-indigo-300 text-white/60 border-white/[0.04]'
                                    }`}
                                    title={`Click to filter by "${tag}"`}
                                  >
                                    {tag}
                                  </button>
                                ))
                              ) : (
                                <span className="text-zinc-400 text-[11px]">—</span>
                              )}
                            </div>
                          </td>

                          {/* Sales Badge */}
                          <td
                            className="py-3 px-4 whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CustomDropdown
                              variant="badge"
                              value={artist.sales}
                              onChange={(val) =>
                                updateArtist(artist.id, {
                                  sales: val as SalesStatus,
                                })
                              }
                              options={[
                                { id: 'yes', label: t.salesYes, color: 'emerald' },
                                { id: 'no', label: t.salesNo, color: 'red' },
                              ]}
                              allowCreate={false}
                            />
                          </td>

                          {/* Status Badge */}
                          <td
                            className="py-3 px-4 whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CustomDropdown
                              variant="badge"
                              category="artistStatus"
                              value={artist.status}
                              onChange={(val) =>
                                updateArtist(artist.id, {
                                  status: val as ArtistStatus,
                                })
                              }
                            />
                          </td>

                          {/* Demo Status */}
                          <td
                            className="py-3 px-4 whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CustomDropdown
                              variant="badge"
                              category="demoStatus"
                              value={artist.demoStatus}
                              onChange={(val) =>
                                updateArtist(artist.id, {
                                  demoStatus: val as DemoStatus,
                                })
                              }
                            />
                          </td>

                          {/* Touches Counter */}
                          <td
                            className="py-3 px-4 whitespace-nowrap text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                                isLight
                                  ? 'bg-[var(--surface-secondary)] border-black/[0.06]'
                                  : 'bg-[var(--surface-secondary)] border-white/[0.04]'
                              }`}
                            >
                              <button
                                onClick={() =>
                                  updateArtist(artist.id, {
                                    touches: Math.max(0, (artist.touches || 0) - 1),
                                  })
                                }
                                className={`p-0.5 transition cursor-pointer ${
                                  isLight
                                    ? 'text-zinc-400 hover:text-black'
                                    : 'text-white/40 hover:text-white'
                                }`}
                                title="Decrease touches"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span
                                className={`font-mono font-semibold px-1 text-[11px] ${
                                  isLight ? 'text-zinc-900' : 'text-white'
                                }`}
                              >
                                {artist.touches || 0}
                              </span>
                              <button
                                onClick={() =>
                                  updateArtist(artist.id, {
                                    touches: (artist.touches || 0) + 1,
                                  })
                                }
                                className={`p-0.5 transition cursor-pointer ${
                                  isLight
                                    ? 'text-zinc-400 hover:text-emerald-600'
                                    : 'text-white/40 hover:text-emerald-400'
                                }`}
                                title="Increase touches"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </td>

                          {/* Reaction */}
                          <td
                            className="py-3 px-4 whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CustomDropdown
                              variant="badge"
                              category="reaction"
                              value={artist.reaction}
                              onChange={(val) =>
                                updateArtist(artist.id, {
                                  reaction: val as ReactionStatus,
                                })
                              }
                            />
                          </td>

                          {/* Last Contact Date */}
                          <td
                            className="py-3 px-4 whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DatePicker
                              value={artist.lastContactDate || ''}
                              onChange={(val) =>
                                updateArtist(artist.id, { lastContactDate: val })
                              }
                              variant="table-cell"
                              showShortcuts={true}
                              allowClear={true}
                            />
                          </td>

                          {/* Follow-up Date */}
                          <td
                            className="py-3 px-4 whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-2">
                              <DatePicker
                                value={artist.followUpDate || ''}
                                onChange={(val) =>
                                  updateArtist(artist.id, { followUpDate: val })
                                }
                                variant="table-cell"
                                showShortcuts={true}
                                allowClear={true}
                              />
                              {artist.followUpDate && renderFollowUpBadge(artist.followUpDate)}
                            </div>
                          </td>

                          {/* Actions */}
                          <td
                            className="py-3 px-4 text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1">
                              {crmViewMode === 'trash' ? (
                                <>
                                  <button
                                    onClick={() => restoreArtist(artist.id)}
                                    className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                                      isLight
                                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                        : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
                                    }`}
                                    title={t.restoreContact}
                                  >
                                    <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>{t.restoreContact}</span>
                                  </button>

                                  <button
                                    onClick={() => setArtistToDelete(artist)}
                                    className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/15 hover:bg-red-500/25 text-red-400 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                                    title={t.hardDeleteContact}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>{t.hardDeleteContact}</span>
                                  </button>
                                </>
                              ) : (
                                <>
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
                                    onClick={() => setActiveArtistId(artist.id)}
                                    className={`p-1 rounded-md transition cursor-pointer ${
                                      isLight
                                        ? 'hover:bg-black/[0.06] text-zinc-500 hover:text-black'
                                        : 'hover:bg-white/[0.08] text-white/40 hover:text-white'
                                    }`}
                                    title={t.editArtist}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setArtistToDelete(artist)}
                                    className="p-1 rounded-md hover:bg-red-500/20 text-red-500/70 hover:text-red-600 transition cursor-pointer"
                                    title={t.delete}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Sleek Immersive Table Footer */}
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
                    <span>{t.addArtist}</span>
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

                <div className="flex items-center gap-3 font-mono text-[11px]">
                  {selectedArtistIds.length > 0 && (
                    <span className={isLight ? 'text-indigo-700 font-bold' : 'text-indigo-300 font-semibold'}>
                      {selectedArtistIds.length} {t.bulkSelected.toLowerCase()}
                    </span>
                  )}
                  <span className={isLight ? 'text-zinc-600' : 'text-white/50'}>
                    {sortedArtists.length} {t.artistsTab.toLowerCase()}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Floating Bulk Actions Bar */}
          {selectedArtistIds.length > 0 && (
            <aside
              aria-label="Bulk actions toolbar"
              className={`absolute bottom-16 left-1/2 -translate-x-1/2 z-30 shadow-2xl rounded-2xl px-4 py-2.5 flex flex-wrap items-center gap-2.5 backdrop-blur-2xl text-xs animate-in fade-in slide-in-from-bottom-3 duration-150 border ${
                isLight
                  ? 'bg-white/95 border-indigo-200 text-zinc-800 shadow-indigo-500/10'
                  : 'bg-[#16161C]/95 border-indigo-500/30 text-zinc-200 shadow-black/60'
              }`}
            >
              {/* Count badge */}
              <div
                className={`flex items-center gap-2 pr-2.5 border-r ${
                  isLight ? 'border-black/[0.08]' : 'border-white/10'
                }`}
              >
                <span
                  className={`px-2 py-0.5 rounded-full font-mono font-bold text-[11px] border ${
                    isLight
                      ? 'bg-indigo-100 text-indigo-900 border-indigo-200'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  }`}
                >
                  {selectedArtistIds.length}
                </span>
                <span
                  className={`font-medium whitespace-nowrap ${
                    isLight ? 'text-zinc-800' : 'text-zinc-200'
                  }`}
                >
                  {t.bulkSelected}
                </span>
              </div>

              {crmViewMode === 'trash' ? (
                <>
                  <button
                    onClick={() => bulkRestoreArtists(selectedArtistIds)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 transition cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.bulkRestore} ({selectedArtistIds.length})</span>
                  </button>

                  <button
                    onClick={() => setIsBulkDeleteModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.bulkHardDelete} ({selectedArtistIds.length})</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Copy Emails button for selected artists */}
                  <button
                    onClick={handleBulkCopyEmails}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition cursor-pointer font-medium ${
                      isLight
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                    title={t.bulkCopyEmails}
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t.bulkCopyEmails}</span>
                  </button>

                  {/* Quick Connect Dropdown */}
                  <CustomDropdown
                    variant="filter"
                    placeholder={`${t.bulkSetConnect}...`}
                    value=""
                    onChange={(val) => {
                      if (val) bulkUpdateArtists(selectedArtistIds, { connect: val as ConnectStatus });
                    }}
                    options={[
                      { id: 'yes', label: t.connectYes, color: 'emerald' },
                      { id: 'no', label: t.connectNo, color: 'red' },
                    ]}
                    allowCreate={false}
                  />

                  {/* Quick Demo Dropdown */}
                  <CustomDropdown
                    variant="filter"
                    placeholder={`${t.bulkSetDemo}...`}
                    value=""
                    category="demoStatus"
                    onChange={(val) => {
                      if (val) bulkUpdateArtists(selectedArtistIds, { demoStatus: val as DemoStatus });
                    }}
                  />

                  {/* Quick Status Dropdown */}
                  <CustomDropdown
                    variant="filter"
                    placeholder={`${t.bulkSetStatus}...`}
                    value=""
                    category="artistStatus"
                    onChange={(val) => {
                      if (val) bulkUpdateArtists(selectedArtistIds, { status: val as ArtistStatus });
                    }}
                  />

                  {/* Quick Follow-up buttons */}
                  <div className="flex items-center gap-1 pl-1">
                    <button
                      onClick={() => handleBulkSetFollowUp(0)}
                      className={`px-2 py-1 rounded-lg border transition cursor-pointer text-[11px] ${
                        isLight
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 font-semibold'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] text-amber-300 border-white/10'
                      }`}
                      title={t.today}
                    >
                      {t.today}
                    </button>
                    <button
                      onClick={() => handleBulkSetFollowUp(3)}
                      className={`px-2 py-1 rounded-lg border transition cursor-pointer text-[11px] ${
                        isLight
                          ? 'bg-black/[0.03] hover:bg-black/[0.06] text-zinc-700 border-black/[0.08]'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/10'
                      }`}
                      title={t.in3Days}
                    >
                      {t.in3Days}
                    </button>
                    <button
                      onClick={() => handleBulkSetFollowUp(7)}
                      className={`px-2 py-1 rounded-lg border transition cursor-pointer text-[11px] ${
                        isLight
                          ? 'bg-black/[0.03] hover:bg-black/[0.06] text-zinc-700 border-black/[0.08]'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/10'
                      }`}
                      title={t.in7Days}
                    >
                      {t.in7Days}
                    </button>
                  </div>

                  {/* Bulk Delete */}
                  <button
                    onClick={() => setIsBulkDeleteModalOpen(true)}
                    className={`p-1.5 rounded-xl border transition cursor-pointer ml-1 ${
                      isLight
                        ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                        : 'bg-red-500/15 hover:bg-red-500/25 text-red-300 border-red-500/30'
                    }`}
                    title={t.bulkDelete}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </>
              )}

              {/* Clear Selection */}
              <button
                onClick={clearArtistSelection}
                className={`p-1.5 rounded-xl transition cursor-pointer ${
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

      {/* Delete Artist Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(artistToDelete)}
        title={crmViewMode === 'trash' ? t.hardDeleteModalTitle : t.deleteArtistModalTitle}
        description={
          artistToDelete
            ? crmViewMode === 'trash'
              ? `${t.hardDeleteConfirmDesc} (${artistToDelete.name})`
              : `${t.deleteConfirmDesc} (${artistToDelete.name})`
            : ''
        }
        confirmLabel={crmViewMode === 'trash' ? t.hardDeleteContact : t.delete}
        cancelLabel={t.cancel}
        isDestructive={true}
        onConfirm={confirmDeleteArtist}
        onClose={() => setArtistToDelete(null)}
      />

      {/* Bulk Delete Confirm Modal */}
      <ConfirmModal
        isOpen={isBulkDeleteModalOpen}
        title={crmViewMode === 'trash' ? t.bulkHardDeleteModalTitle : t.bulkDeleteModalTitle}
        description={
          crmViewMode === 'trash'
            ? `${t.bulkHardDeleteConfirmDesc} (${selectedArtistIds.length})`
            : typeof t.bulkDeleteConfirmDesc === 'function'
            ? t.bulkDeleteConfirmDesc(selectedArtistIds.length)
            : `Delete ${selectedArtistIds.length} artists?`
        }
        confirmLabel={crmViewMode === 'trash' ? t.bulkHardDelete : t.bulkDelete}
        cancelLabel={t.cancel}
        isDestructive={true}
        onConfirm={confirmBulkDelete}
        onClose={() => setIsBulkDeleteModalOpen(false)}
      />

      {/* Empty Trash Confirm Modal */}
      <ConfirmModal
        isOpen={isEmptyTrashModalOpen}
        title={t.emptyTrashModalTitle}
        description={t.emptyTrashConfirmDesc}
        confirmLabel={t.emptyTrashBtn}
        cancelLabel={t.cancel}
        isDestructive={true}
        onConfirm={confirmEmptyTrash}
        onClose={() => setIsEmptyTrashModalOpen(false)}
      />

      {/* Custom Context Menu (Portal) */}
      {contextMenu && typeof document !== 'undefined' && createPortal(
        <div
          ref={contextMenuRef}
          style={{
            position: 'fixed',
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            zIndex: 99999,
          }}
          onClick={(e) => e.stopPropagation()}
          className={`w-56 rounded-xl border p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-250 select-none ${
            isLight
              ? 'bg-white/95 border-black/[0.1] text-zinc-800 shadow-black/15'
              : 'bg-[var(--surface)]/95 border-white/10 text-zinc-100 shadow-black/80'
          }`}
        >
          <div className={`px-2.5 py-1.5 text-[10px] font-semibold tracking-wider uppercase border-b mb-1 flex items-center justify-between ${
            isLight ? 'text-zinc-400 border-black/[0.05]' : 'text-white/40 border-white/[0.06]'
          }`}>
            <span className="truncate max-w-[140px] font-bold text-zinc-700 dark:text-zinc-300">{contextMenu.artist.name}</span>
            <span className="text-[9px] lowercase opacity-60 font-mono">меню</span>
          </div>

          {/* Copy Instagram */}
          <button
            type="button"
            disabled={!contextMenu.artist.instagram}
            onClick={(e) => handleCopyContact(contextMenu.artist.instagram, 'Instagram', e)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
              contextMenu.artist.instagram
                ? isLight
                  ? 'hover:bg-pink-50 hover:text-pink-700 text-zinc-800 cursor-pointer'
                  : 'hover:bg-pink-500/10 hover:text-pink-300 text-zinc-200 cursor-pointer'
                : 'opacity-40 cursor-not-allowed text-zinc-400'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Instagram className="w-3.5 h-3.5 text-pink-500 shrink-0" />
              <span className="truncate">{t.copyInstagram}</span>
            </div>
            {contextMenu.artist.instagram && <Copy className="w-3 h-3 opacity-40 shrink-0" />}
          </button>

          {/* Copy Phone / iMessage */}
          <button
            type="button"
            disabled={!contextMenu.artist.phone}
            onClick={(e) => handleCopyContact(contextMenu.artist.phone, t.fieldPhone || 'Телефон', e)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
              contextMenu.artist.phone
                ? isLight
                  ? 'hover:bg-emerald-50 hover:text-emerald-700 text-zinc-800 cursor-pointer'
                  : 'hover:bg-emerald-500/10 hover:text-emerald-300 text-zinc-200 cursor-pointer'
                : 'opacity-40 cursor-not-allowed text-zinc-400'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{t.copyPhone}</span>
            </div>
            {contextMenu.artist.phone && <Copy className="w-3 h-3 opacity-40 shrink-0" />}
          </button>

          {/* Copy Email */}
          <button
            type="button"
            disabled={!contextMenu.artist.email}
            onClick={(e) => handleCopyContact(contextMenu.artist.email, 'Email', e)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
              contextMenu.artist.email
                ? isLight
                  ? 'hover:bg-amber-50 hover:text-amber-700 text-zinc-800 cursor-pointer'
                  : 'hover:bg-amber-500/10 hover:text-amber-300 text-zinc-200 cursor-pointer'
                : 'opacity-40 cursor-not-allowed text-zinc-400'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{t.copyEmail}</span>
            </div>
            {contextMenu.artist.email && <Copy className="w-3 h-3 opacity-40 shrink-0" />}
          </button>

          {/* Copy Telegram */}
          <button
            type="button"
            disabled={!contextMenu.artist.telegram}
            onClick={(e) => handleCopyContact(contextMenu.artist.telegram, 'Telegram', e)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
              contextMenu.artist.telegram
                ? isLight
                  ? 'hover:bg-sky-50 hover:text-sky-700 text-zinc-800 cursor-pointer'
                  : 'hover:bg-sky-500/10 hover:text-sky-300 text-zinc-200 cursor-pointer'
                : 'opacity-40 cursor-not-allowed text-zinc-400'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Send className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span className="truncate">{t.copyTelegram}</span>
            </div>
            {contextMenu.artist.telegram && <Copy className="w-3 h-3 opacity-40 shrink-0" />}
          </button>

          <div className={`my-1 border-t ${isLight ? 'border-black/[0.06]' : 'border-white/[0.08]'}`} />

          {/* Open / Edit */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveArtistId(contextMenu.artist.id);
              setContextMenu(null);
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
              isLight ? 'hover:bg-black/[0.04] text-zinc-700' : 'hover:bg-white/[0.06] text-zinc-300'
            }`}
          >
            <Edit2 className="w-3.5 h-3.5 opacity-60 shrink-0" />
            <span>{t.editArtist}</span>
          </button>

          {crmViewMode === 'trash' ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  restoreArtist(contextMenu.artist.id);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-emerald-500 hover:bg-emerald-500/10 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{t.restoreContact}</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setArtistToDelete(contextMenu.artist);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-500/10 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{t.hardDeleteContact}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setArtistToDelete(contextMenu.artist);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-500/10 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>{t.delete}</span>
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
};
