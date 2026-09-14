import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
  AlertCircle,
} from 'lucide-react';
import { formatDateRu, parseDateRu, getFollowUpStatus } from '../utils/customOptions';

export interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  align?: 'left' | 'right' | 'auto';
  showShortcuts?: boolean;
  showFollowUpBadge?: boolean;
  variant?: 'input' | 'table-cell' | 'minimal';
  allowClear?: boolean;
}

const MONTHS_RU = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const DAYS_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'ДД.ММ.ГГГГ',
  className = '',
  buttonClassName = '',
  disabled = false,
  align = 'auto',
  showShortcuts = true,
  showFollowUpBadge = false,
  variant = 'input',
  allowClear = true,
}) => {
  const { theme, lang, t } = useApp();
  const isLight = theme === 'light';
  const isRu = lang === 'ru';

  const [isOpen, setIsOpen] = useState(false);

  // Parse initial date or default to current date
  const parsedDate = useMemo(() => {
    if (!value || !value.trim()) return null;
    const parts = value.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    }
    return null;
  }, [value]);

  const [viewYear, setViewYear] = useState<number>(() => {
    return parsedDate ? parsedDate.getFullYear() : new Date().getFullYear();
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    return parsedDate ? parsedDate.getMonth() : new Date().getMonth();
  });

  // When value changes from outside, sync view
  useEffect(() => {
    if (parsedDate) {
      setViewYear(parsedDate.getFullYear());
      setViewMonth(parsedDate.getMonth());
    }
  }, [parsedDate]);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
    placement: 'bottom' | 'top';
  }>({
    top: 0,
    left: 0,
    placement: 'bottom',
  });

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const pickerHeight = 330;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placement = spaceBelow < pickerHeight && spaceAbove > spaceBelow ? 'top' : 'bottom';

    let left = rect.left;
    if (align === 'right') {
      left = rect.right - 270;
    } else if (align === 'auto') {
      if (rect.left + 280 > window.innerWidth) {
        left = Math.max(10, window.innerWidth - 290);
      }
    }

    setPopoverPos({
      top: placement === 'bottom' ? rect.bottom + 6 : rect.top - 6,
      left: Math.max(8, left),
      placement,
    });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleScrollOrResize = () => {
      if (isOpen) updatePosition();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  // Calendar Grid Calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

    // Monday as 0: 0 = Mon, ..., 6 = Sun
    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay === -1) startDay = 6;

    const days = [];
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();

    // Days from previous month
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        month: viewMonth - 1,
        year: viewYear,
        isCurrentMonth: false,
      });
    }

    // Days of current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({
        day: i,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
      });
    }

    // Fill remaining to reach complete weeks (multiple of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        month: viewMonth + 1,
        year: viewYear,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (year: number, month: number, day: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const dateObj = new Date(year, month, day);
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    const formatted = `${y}-${m}-${d}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleQuickPreset = (offsetDays: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${day}`);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const today = new Date();
  const isToday = (year: number, month: number, day: number) => {
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const isSelected = (year: number, month: number, day: number) => {
    if (!parsedDate) return false;
    return (
      parsedDate.getFullYear() === year &&
      parsedDate.getMonth() === month &&
      parsedDate.getDate() === day
    );
  };

  const followUpStatus = useMemo(() => {
    if (!value) return null;
    return getFollowUpStatus(value, t);
  }, [value, t]);

  const displayDateText = value ? formatDateRu(value) : placeholder;

  const renderTrigger = () => {
    if (variant === 'table-cell') {
      return (
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer select-none border ${
            isLight
              ? 'bg-white hover:bg-black/[0.04] text-zinc-800 border-black/[0.08]'
              : 'bg-[#18181C] hover:bg-[#202026] text-zinc-200 border-white/[0.06]'
          } ${isOpen ? 'ring-2 ring-indigo-500/40 border-indigo-500/50' : ''} ${buttonClassName}`}
        >
          <CalendarIcon className="w-3 h-3 text-indigo-400 opacity-80 shrink-0" />
          <span className={value ? 'font-medium' : 'text-zinc-400 italic'}>{displayDateText}</span>
        </button>
      );
    }

    // Default 'input' variant
    return (
      <div className="relative flex items-center w-full">
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          className={`w-full px-3 py-2 ${value && allowClear ? 'pr-8' : ''} rounded-lg border text-xs flex items-center justify-between gap-2 transition cursor-pointer select-none font-mono ${
            isLight
              ? 'bg-white text-zinc-900 border-black/[0.1] hover:border-black/30'
              : 'bg-[#18181C] text-zinc-100 border-white/[0.08] hover:border-white/20'
          } ${isOpen ? 'ring-2 ring-indigo-500/30 border-indigo-500/50' : ''} ${buttonClassName}`}
        >
          <div className="flex items-center gap-2 truncate">
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className={value ? 'font-semibold' : 'text-zinc-400 font-sans italic'}>
              {displayDateText}
            </span>
          </div>
        </button>

        {value && allowClear && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className={`absolute right-2.5 p-0.5 rounded transition cursor-pointer z-10 ${
              isLight ? 'hover:bg-black/10 text-zinc-400 hover:text-zinc-700' : 'hover:bg-white/10 text-zinc-400 hover:text-white'
            }`}
            title="Очистить"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  };

  const popoverContent = isOpen ? (
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        top: popoverPos.placement === 'bottom' ? `${popoverPos.top}px` : undefined,
        bottom: popoverPos.placement === 'top' ? `${window.innerHeight - popoverPos.top}px` : undefined,
        left: `${popoverPos.left}px`,
        width: '276px',
        zIndex: 99999,
      }}
      onClick={(e) => e.stopPropagation()}
      className={`rounded-2xl shadow-2xl overflow-hidden border backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100 p-3 select-none ${
        isLight
          ? 'bg-white/98 border-black/[0.1] text-zinc-900 shadow-black/15'
          : 'bg-[#121215]/98 border-white/10 text-white shadow-black/90'
      }`}
    >
      {/* Month & Year Navigation Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06]">
        <button
          type="button"
          onClick={handlePrevMonth}
          className={`p-1 rounded-lg transition cursor-pointer ${
            isLight
              ? 'hover:bg-black/[0.06] text-zinc-600'
              : 'hover:bg-white/[0.08] text-zinc-300'
          }`}
          title="Предыдущий месяц"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-xs font-semibold tracking-wide">
          <span>{isRu ? MONTHS_RU[viewMonth] : MONTHS_EN[viewMonth]}</span>{' '}
          <span className="font-mono text-indigo-400 font-bold">{viewYear}</span>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className={`p-1 rounded-lg transition cursor-pointer ${
            isLight
              ? 'hover:bg-black/[0.06] text-zinc-600'
              : 'hover:bg-white/[0.08] text-zinc-300'
          }`}
          title="Следующий месяц"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {(isRu ? DAYS_RU : DAYS_EN).map((d) => (
          <div
            key={d}
            className={`text-[10px] font-semibold uppercase tracking-wider py-0.5 ${
              isLight ? 'text-zinc-400' : 'text-zinc-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day Cells Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarDays.map((item, idx) => {
          const isSelectedDay = isSelected(item.year, item.month, item.day);
          const isTodayDay = isToday(item.year, item.month, item.day);

          let cellClass = isLight
            ? 'text-zinc-800 hover:bg-black/[0.06]'
            : 'text-zinc-200 hover:bg-white/[0.08]';

          if (!item.isCurrentMonth) {
            cellClass = isLight
              ? 'text-zinc-300 hover:text-zinc-600 hover:bg-black/[0.03]'
              : 'text-white/20 hover:text-white/50 hover:bg-white/[0.04]';
          }

          if (isSelectedDay) {
            cellClass = 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/30 hover:bg-indigo-500';
          } else if (isTodayDay) {
            cellClass += ' ring-1 ring-indigo-400 font-bold text-indigo-400';
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={(e) => handleSelectDay(item.year, item.month, item.day, e)}
              className={`h-7 w-7 rounded-lg text-xs font-mono flex items-center justify-center transition-all cursor-pointer mx-auto ${cellClass}`}
            >
              {item.day}
            </button>
          );
        })}
      </div>

      {/* Preset Shortcuts (0d, +3d, +7d, +14d, Clear) */}
      {showShortcuts && (
        <div
          className={`mt-3 pt-2.5 border-t flex flex-wrap items-center justify-between gap-1 text-[11px] ${
            isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'
          }`}
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => handleQuickPreset(0, e)}
              className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
                isLight
                  ? 'bg-black/[0.04] hover:bg-black/[0.08] text-zinc-700'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200'
              }`}
            >
              {isRu ? 'Сегодня' : 'Today'}
            </button>
            <button
              type="button"
              onClick={(e) => handleQuickPreset(3, e)}
              className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
                isLight
                  ? 'bg-black/[0.04] hover:bg-black/[0.08] text-zinc-700'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200'
              }`}
            >
              +3d
            </button>
            <button
              type="button"
              onClick={(e) => handleQuickPreset(7, e)}
              className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
                isLight
                  ? 'bg-black/[0.04] hover:bg-black/[0.08] text-zinc-700'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200'
              }`}
            >
              +7d
            </button>
          </div>

          {allowClear && (
            <button
              type="button"
              onClick={handleClear}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                isLight
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-red-400 hover:bg-red-500/10'
              }`}
            >
              {isRu ? 'Очистить' : 'Clear'}
            </button>
          )}
        </div>
      )}
    </div>
  ) : null;

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      {renderTrigger()}
      {showFollowUpBadge && followUpStatus && (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${
            followUpStatus.type === 'overdue'
              ? isLight
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-red-500/15 text-red-300 border-red-500/30'
              : followUpStatus.type === 'today'
              ? isLight
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              : isLight
              ? 'bg-sky-50 text-sky-800 border-sky-200'
              : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
          }`}
        >
          {followUpStatus.type === 'overdue' && <AlertCircle className="w-2.5 h-2.5 text-red-500" />}
          {followUpStatus.type === 'today' && <Clock className="w-2.5 h-2.5 text-amber-500" />}
          {followUpStatus.type === 'future' && <Clock className="w-2.5 h-2.5 text-sky-400" />}
          <span>{followUpStatus.label}</span>
        </span>
      )}
      {typeof document !== 'undefined' && createPortal(popoverContent, document.body)}
    </div>
  );
};
