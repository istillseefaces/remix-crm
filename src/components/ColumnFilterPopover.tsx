import React, { useState, useRef, useEffect } from 'react';
import { Filter, X, Check, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ColumnFiltersState } from '../types';

interface ColumnFilterPopoverProps {
  columnKey: keyof ColumnFiltersState;
  title: string;
  options?: Array<{ value: string; label: string }>;
  isLight: boolean;
}

export const ColumnFilterPopover: React.FC<ColumnFilterPopoverProps> = ({
  columnKey,
  title,
  options = [],
  isLight,
}) => {
  const { columnFilters, setColumnFilter, clearColumnFilter, artists, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on click outside or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  // Determine if this column's filter is active
  const filterVal = columnFilters[columnKey];
  const isActive = Boolean(
    filterVal &&
      (Array.isArray(filterVal)
        ? filterVal.length > 0
        : typeof filterVal === 'string'
        ? filterVal !== 'all'
        : typeof filterVal === 'object'
        ? (filterVal as any).preset !== 'all' && (filterVal as any).preset !== undefined
          ? true
          : (filterVal as any).query ||
            ((filterVal as any).selectedNames && (filterVal as any).selectedNames.length > 0) ||
            ((filterVal as any).hasSales && (filterVal as any).hasSales !== 'all') ||
            ((filterVal as any).mode && (filterVal as any).mode !== 'all')
        : false)
  );

  // Render specific filter body based on columnKey
  const renderFilterContent = () => {
    switch (columnKey) {
      case 'artist': {
        const current = (filterVal as ColumnFiltersState['artist']) || { query: '', selectedNames: [] };
        const query = current.query || '';
        const selected = current.selectedNames || [];

        // All distinct artist names
        const allNames = Array.from(new Set(artists.map((a) => a.name).filter(Boolean)));
        const filteredNames = allNames.filter((n) => n.toLowerCase().includes(query.toLowerCase()));

        return (
          <div className="space-y-3 min-w-[240px]">
            <input
              type="text"
              placeholder={t.searchPlaceholder.slice(0, 20) + '...'}
              value={query}
              onChange={(e) =>
                setColumnFilter('artist', { ...current, query: e.target.value })
              }
              className={`w-full px-2.5 py-1.5 text-xs rounded border transition outline-none ${
                isLight
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-900 focus:border-indigo-500'
                  : 'bg-[#18181C] border-white/10 text-white focus:border-indigo-500'
              }`}
            />
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1 text-xs">
              {filteredNames.length === 0 ? (
                <div className="text-zinc-500 py-1 text-center">Нет совпадений</div>
              ) : (
                filteredNames.map((name) => {
                  const isChecked = selected.includes(name);
                  return (
                    <label
                      key={name}
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition ${
                        isLight ? 'hover:bg-zinc-100 text-zinc-800' : 'hover:bg-white/5 text-zinc-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...selected, name]
                            : selected.filter((n) => n !== name);
                          setColumnFilter('artist', { ...current, selectedNames: next });
                        }}
                        className="rounded accent-indigo-500"
                      />
                      <span className="truncate">{name}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        );
      }

      case 'connect': {
        const current = (filterVal as 'all' | 'yes' | 'no') || 'all';
        return (
          <div className="flex flex-col gap-1 min-w-[170px] text-xs">
            {[
              { val: 'all', label: t.filterDatePresetAll },
              { val: 'yes', label: t.filterHasConnect },
              { val: 'no', label: t.filterNoConnect },
            ].map((item) => (
              <button
                key={item.val}
                type="button"
                onClick={() => setColumnFilter('connect', item.val as any)}
                className={`flex items-center justify-between px-3 py-1.5 rounded transition text-left cursor-pointer ${
                  current === item.val
                    ? isLight
                      ? 'bg-indigo-50 text-indigo-600 font-medium'
                      : 'bg-indigo-500/20 text-indigo-400 font-medium'
                    : isLight
                    ? 'hover:bg-zinc-100 text-zinc-700'
                    : 'hover:bg-white/5 text-zinc-300'
                }`}
              >
                <span>{item.label}</span>
                {current === item.val && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        );
      }

      case 'types': {
        const selected = (filterVal as string[]) || [];
        // Extract all existing unique tags from artists
        const availableTags = Array.from(
          new Set(artists.flatMap((a) => a.types || []).filter(Boolean))
        );

        return (
          <div className="space-y-2 min-w-[200px]">
            <div className="max-h-40 overflow-y-auto space-y-1 text-xs pr-1">
              {availableTags.length === 0 ? (
                <div className="text-zinc-500 py-1 text-center">Нет тегов</div>
              ) : (
                availableTags.map((tag) => {
                  const isChecked = selected.includes(tag);
                  return (
                    <label
                      key={tag}
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition ${
                        isLight ? 'hover:bg-zinc-100 text-zinc-800' : 'hover:bg-white/5 text-zinc-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...selected, tag]
                            : selected.filter((t) => t !== tag);
                          setColumnFilter('types', next);
                        }}
                        className="rounded accent-indigo-500"
                      />
                      <span className="truncate">{tag}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        );
      }

      case 'sales': {
        const current = (filterVal as ColumnFiltersState['sales']) || { hasSales: 'all' };
        return (
          <div className="space-y-3 min-w-[210px] text-xs">
            <div className="flex gap-1 p-0.5 rounded border border-white/10 bg-black/10">
              {[
                { val: 'all', label: t.filterDatePresetAll },
                { val: 'yes', label: t.filterHasSales },
                { val: 'no', label: t.filterNoSales },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setColumnFilter('sales', { ...current, hasSales: item.val as any })}
                  className={`flex-1 py-1 rounded text-center transition cursor-pointer ${
                    current.hasSales === item.val
                      ? isLight
                        ? 'bg-white shadow-xs text-indigo-600 font-medium'
                        : 'bg-white/10 text-white font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] text-zinc-400">{t.filterAmountRangeTitle} ($)</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="От"
                  value={current.minAmount ?? ''}
                  onChange={(e) =>
                    setColumnFilter('sales', {
                      ...current,
                      minAmount: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className={`w-1/2 px-2 py-1 rounded border text-xs outline-none ${
                    isLight ? 'bg-zinc-100 border-zinc-300' : 'bg-[#18181C] border-white/10'
                  }`}
                />
                <span className="text-zinc-500">—</span>
                <input
                  type="number"
                  placeholder="До"
                  value={current.maxAmount ?? ''}
                  onChange={(e) =>
                    setColumnFilter('sales', {
                      ...current,
                      maxAmount: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className={`w-1/2 px-2 py-1 rounded border text-xs outline-none ${
                    isLight ? 'bg-zinc-100 border-zinc-300' : 'bg-[#18181C] border-white/10'
                  }`}
                />
              </div>
            </div>
          </div>
        );
      }

      case 'status':
      case 'demoStatus':
      case 'reaction': {
        const selected = (filterVal as string[]) || [];
        return (
          <div className="space-y-1 min-w-[200px] text-xs">
            {options.map((opt) => {
              const isChecked = selected.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition ${
                    isLight ? 'hover:bg-zinc-100 text-zinc-800' : 'hover:bg-white/5 text-zinc-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...selected, opt.value]
                        : selected.filter((v) => v !== opt.value);
                      setColumnFilter(columnKey, next);
                    }}
                    className="rounded accent-indigo-500"
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        );
      }

      case 'touches': {
        const current = (filterVal as ColumnFiltersState['touches']) || { mode: 'all' };
        return (
          <div className="space-y-3 min-w-[220px] text-xs">
            <div className="flex flex-col gap-1">
              {[
                { val: 'all', label: t.filterDatePresetAll },
                { val: 'sent', label: 'Отправлял (>0 касаний)' },
                { val: 'not_sent', label: 'Не отправлял (0 касаний)' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setColumnFilter('touches', { ...current, mode: item.val as any })}
                  className={`flex items-center justify-between px-3 py-1.5 rounded transition text-left cursor-pointer ${
                    current.mode === item.val
                      ? isLight
                        ? 'bg-indigo-50 text-indigo-600 font-medium'
                        : 'bg-indigo-500/20 text-indigo-400 font-medium'
                      : isLight
                      ? 'hover:bg-zinc-100 text-zinc-700'
                      : 'hover:bg-white/5 text-zinc-300'
                  }`}
                >
                  <span>{item.label}</span>
                  {current.mode === item.val && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
            <div className="space-y-1.5 pt-1 border-t border-white/5">
              <span className="text-[11px] text-zinc-400">{t.filterTouchesRangeTitle}</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="От"
                  value={current.min ?? ''}
                  onChange={(e) =>
                    setColumnFilter('touches', {
                      ...current,
                      min: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className={`w-1/2 px-2 py-1 rounded border text-xs outline-none ${
                    isLight ? 'bg-zinc-100 border-zinc-300' : 'bg-[#18181C] border-white/10'
                  }`}
                />
                <span className="text-zinc-500">—</span>
                <input
                  type="number"
                  placeholder="До"
                  value={current.max ?? ''}
                  onChange={(e) =>
                    setColumnFilter('touches', {
                      ...current,
                      max: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className={`w-1/2 px-2 py-1 rounded border text-xs outline-none ${
                    isLight ? 'bg-zinc-100 border-zinc-300' : 'bg-[#18181C] border-white/10'
                  }`}
                />
              </div>
            </div>
          </div>
        );
      }

      case 'lastContactDate': {
        const current = (filterVal as ColumnFiltersState['lastContactDate']) || { preset: 'all' };
        return (
          <div className="space-y-3 min-w-[240px] text-xs">
            <div className="flex flex-col gap-1">
              {[
                { val: 'all', label: t.filterDatePresetAll },
                { val: 'today', label: t.filterDatePresetToday },
                { val: 'this_week', label: t.filterDatePresetWeek },
                { val: 'old', label: t.filterDatePresetOld },
                { val: 'empty', label: t.filterDatePresetEmpty },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setColumnFilter('lastContactDate', { ...current, preset: item.val as any })}
                  className={`flex items-center justify-between px-3 py-1.5 rounded transition text-left cursor-pointer ${
                    current.preset === item.val
                      ? isLight
                        ? 'bg-indigo-50 text-indigo-600 font-medium'
                        : 'bg-indigo-500/20 text-indigo-400 font-medium'
                      : isLight
                      ? 'hover:bg-zinc-100 text-zinc-700'
                      : 'hover:bg-white/5 text-zinc-300'
                  }`}
                >
                  <span>{item.label}</span>
                  {current.preset === item.val && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <span className="text-[11px] text-zinc-400">{t.filterDateRangeTitle}</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={current.startDate || ''}
                  onChange={(e) =>
                    setColumnFilter('lastContactDate', {
                      ...current,
                      preset: 'custom',
                      startDate: e.target.value,
                    })
                  }
                  className={`w-1/2 px-2 py-1 rounded border text-[11px] outline-none ${
                    isLight ? 'bg-zinc-100 border-zinc-300' : 'bg-[#18181C] border-white/10'
                  }`}
                />
                <span className="text-zinc-500">—</span>
                <input
                  type="date"
                  value={current.endDate || ''}
                  onChange={(e) =>
                    setColumnFilter('lastContactDate', {
                      ...current,
                      preset: 'custom',
                      endDate: e.target.value,
                    })
                  }
                  className={`w-1/2 px-2 py-1 rounded border text-[11px] outline-none ${
                    isLight ? 'bg-zinc-100 border-zinc-300' : 'bg-[#18181C] border-white/10'
                  }`}
                />
              </div>
            </div>
          </div>
        );
      }

      case 'followUpDate': {
        const current = (filterVal as ColumnFiltersState['followUpDate']) || { preset: 'all' };
        return (
          <div className="flex flex-col gap-1 min-w-[210px] text-xs">
            {[
              { val: 'all', label: t.filterDatePresetAll },
              { val: 'today', label: t.filterDatePresetToday },
              { val: 'overdue', label: t.filterDatePresetOverdue },
              { val: 'scheduled', label: t.filterDatePresetScheduled },
              { val: 'no_date', label: t.filterDatePresetEmpty },
            ].map((item) => (
              <button
                key={item.val}
                type="button"
                onClick={() => setColumnFilter('followUpDate', { ...current, preset: item.val as any })}
                className={`flex items-center justify-between px-3 py-1.5 rounded transition text-left cursor-pointer ${
                  current.preset === item.val
                    ? isLight
                      ? 'bg-indigo-50 text-indigo-600 font-medium'
                      : 'bg-indigo-500/20 text-indigo-400 font-medium'
                    : isLight
                    ? 'hover:bg-zinc-100 text-zinc-700'
                    : 'hover:bg-white/5 text-zinc-300'
                }`}
              >
                <span>{item.label}</span>
                {current.preset === item.val && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="relative inline-flex items-center" ref={popoverRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title={`Фильтр: ${title}`}
        className={`p-1 rounded-md transition-all cursor-pointer flex items-center justify-center relative ${
          isActive
            ? isLight
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-indigo-500 text-white shadow-xs'
            : isLight
            ? 'text-zinc-400 hover:text-zinc-700 hover:bg-black/5'
            : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
        }`}
      >
        <Filter className="w-3 h-3" />
        {isActive && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full ring-2 ring-[#121214]" />
        )}
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-0 top-full mt-1.5 z-50 p-3 rounded-xl shadow-2xl border backdrop-blur-xl ${
            isLight
              ? 'bg-white/95 border-zinc-200 text-zinc-900 shadow-zinc-300/50'
              : 'bg-[#121214]/95 border-white/10 text-white shadow-black/80'
          }`}
        >
          <div className="flex items-center justify-between gap-3 pb-2 mb-2 border-b border-white/5">
            <span className="text-xs font-semibold">{title}</span>
            {isActive && (
              <button
                type="button"
                onClick={() => clearColumnFilter(columnKey)}
                className="text-[11px] text-rose-400 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>{t.filterReset}</span>
              </button>
            )}
          </div>

          {renderFilterContent()}
        </div>
      )}
    </div>
  );
};
