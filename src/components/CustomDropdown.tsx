import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { BadgeColor, DropdownOption, OptionCategory } from '../types';
import { BADGE_COLOR_PALETTES, getBadgeColorClass } from '../utils/customOptions';
import { Check, ChevronDown, Sparkles, Search } from 'lucide-react';
import { Plus, X, Trash2 } from './InterfaceIcons';

export interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options?: DropdownOption[];
  category?: OptionCategory;
  variant?: 'badge' | 'input' | 'table-cell' | 'filter' | 'button';
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  align?: 'left' | 'right' | 'auto';
  showColorDot?: boolean;
  allowCreate?: boolean;
  size?: 'sm' | 'md' | 'xs';
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options: customOptionsList,
  category,
  variant = 'badge',
  placeholder = 'Select...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  disabled = false,
  align = 'auto',
  showColorDot = true,
  allowCreate = true,
  size = 'sm',
}) => {
  const { theme, t, lang, customOptions, addCustomOption, deleteCustomOption, showToast } = useApp();
  const isLight = theme === 'light';
  const isRu = lang === 'ru';

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState<BadgeColor>('emerald');
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    width: number;
    placement: 'bottom' | 'top';
  }>({
    top: 0,
    left: 0,
    width: 160,
    placement: 'bottom',
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Determine options list from category or props
  const options: DropdownOption[] = useMemo(() => {
    if (customOptionsList && customOptionsList.length > 0) {
      return customOptionsList;
    }
    if (category && customOptions && customOptions[category]) {
      return customOptions[category] || [];
    }
    return [];
  }, [customOptionsList, category, customOptions]);

  // Filter options by search query if any
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase().trim();
    return options.filter((o) => o.label.toLowerCase().includes(query));
  }, [options, searchQuery]);

  // Current selected option
  const selectedOption = useMemo(() => {
    return options.find((o) => o.id === value || o.label.toLowerCase() === (value || '').toLowerCase());
  }, [options, value]);

  // Display label
  const displayLabel = selectedOption?.label || value || placeholder;
  const badgeColor: BadgeColor = selectedOption?.color || 'zinc';

  // Calculate coordinates for portal positioning
  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 260;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placement = spaceBelow < dropdownHeight && spaceAbove > spaceBelow ? 'top' : 'bottom';

    let left = rect.left;
    if (align === 'right') {
      left = rect.right - Math.max(rect.width, 190);
    } else if (align === 'auto') {
      if (rect.left + 220 > window.innerWidth) {
        left = Math.max(10, window.innerWidth - 230);
      }
    }

    setMenuPosition({
      top: placement === 'bottom' ? rect.bottom + 4 : rect.top - 4,
      left: Math.max(8, left),
      width: Math.max(rect.width, 180),
      placement,
    });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
      setSearchQuery('');
      setIsOpen(true);
      setIsCreating(false);
    } else {
      setIsOpen(false);
    }
  };

  // Close on outside click or escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setIsCreating(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsCreating(false);
      }
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

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const handleSelectOption = (opt: DropdownOption, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(opt.id);
    setIsOpen(false);
  };

  const handleDeleteOptionOnTheFly = (opt: DropdownOption, e: React.MouseEvent) => {
    e.stopPropagation();
    if (category) {
      deleteCustomOption(category, opt.id);
      if (value === opt.id || value === opt.label) {
        onChange('');
      }
    }
  };

  const handleSaveNewOption = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newLabel.trim()) return;

    const trimmed = newLabel.trim();
    if (category) {
      addCustomOption(category, {
        label: trimmed,
        color: newColor,
      });
      onChange(trimmed);
    } else {
      onChange(trimmed);
    }

    setNewLabel('');
    setIsCreating(false);
    setIsOpen(false);
  };

  // Trigger Button Styles
  const renderTriggerContent = () => {
    if (variant === 'badge' || variant === 'table-cell') {
      const badgeClasses = getBadgeColorClass(badgeColor, theme, 'badge');
      return (
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          className={`inline-flex items-center justify-between gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition cursor-pointer select-none max-w-full truncate ${badgeClasses} ${
            isOpen ? 'ring-2 ring-indigo-500/30' : ''
          } ${buttonClassName}`}
        >
          {showColorDot && (
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${getBadgeColorClass(badgeColor, theme, 'dot')}`}
            />
          )}
          <span className="truncate max-w-[120px]">{displayLabel}</span>
          <ChevronDown
            className={`w-3 h-3 shrink-0 opacity-60 transition-transform duration-150 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      );
    }

    if (variant === 'filter') {
      return (
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          className={`w-full max-w-full overflow-hidden px-2 py-1 rounded-lg border text-xs font-medium flex items-center justify-between gap-1.5 transition cursor-pointer select-none ${
            isLight
              ? 'bg-[var(--surface-secondary)] text-zinc-800 border-black/[0.06] hover:border-black/20'
              : 'bg-[var(--surface-secondary)] text-zinc-200 border-white/[0.06] hover:border-white/20'
          } ${isOpen ? 'ring-2 ring-indigo-500/30' : ''} ${buttonClassName}`}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
            {showColorDot && selectedOption?.color && (
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${getBadgeColorClass(selectedOption.color, theme, 'dot')}`}
              />
            )}
            <span className="truncate text-ellipsis whitespace-nowrap">{displayLabel}</span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 opacity-60 transition-transform duration-150 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      );
    }

    // Default 'input' variant (for forms, modal inputs, settings)
    return (
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`w-full px-3 py-2 rounded-lg border text-xs font-medium flex items-center justify-between gap-2 transition cursor-pointer select-none ${
          isLight
            ? 'bg-white text-zinc-900 border-black/[0.1] hover:border-black/30 focus:border-black/40'
            : 'bg-[var(--surface-secondary)] text-zinc-100 border-white/[0.08] hover:border-white/20 focus:border-white/30'
        } ${isOpen ? 'ring-2 ring-indigo-500/30' : ''} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {showColorDot && (
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${getBadgeColorClass(badgeColor, theme, 'dot')}`}
            />
          )}
          <span className="truncate">{displayLabel}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 opacity-60 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
    );
  };

  const portalContent = isOpen ? (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: menuPosition.placement === 'bottom' ? `${menuPosition.top}px` : undefined,
        bottom: menuPosition.placement === 'top' ? `${window.innerHeight - menuPosition.top}px` : undefined,
        left: `${menuPosition.left}px`,
        minWidth: `${menuPosition.width}px`,
        maxWidth: '320px',
        zIndex: 99999,
      }}
      onClick={(e) => e.stopPropagation()}
      className={`rounded-xl shadow-2xl overflow-hidden border backdrop-blur-xl animate-in fade-in zoom-in-95 duration-250 ${
        isLight
          ? 'bg-white/98 border-black/[0.1] text-zinc-900 shadow-black/15'
          : 'bg-[var(--surface)]/98 border-white/10 text-zinc-100 shadow-black/80'
      } ${menuClassName}`}
    >
      {!isCreating ? (
        <div className="p-1 max-h-72 flex flex-col">
          {/* Micro Search Bar if options >= 6 */}
          {options.length >= 6 && (
            <div
              className={`px-2 py-1.5 mb-1 border-b flex items-center gap-1.5 ${
                isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'
              }`}
            >
              <Search className="w-3 h-3 text-zinc-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRu ? 'Поиск варианта...' : 'Search...'}
                className="w-full bg-transparent text-[11px] focus:outline-none placeholder:text-zinc-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Options list */}
          <div className="overflow-y-auto space-y-0.5 flex-1 pr-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-center text-xs text-zinc-400 italic">
                {isRu ? 'Не найдено' : 'No matches'}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.id === value || opt.label === value;
                return (
                  <div
                    key={opt.id}
                    className={`group/item w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer text-left ${
                      isSelected
                        ? isLight
                          ? 'bg-black/[0.06] font-semibold text-black'
                          : 'bg-white/[0.08] font-semibold text-white'
                        : isLight
                        ? 'hover:bg-black/[0.04] text-zinc-700 hover:text-black'
                        : 'hover:bg-white/[0.05] text-zinc-300 hover:text-white'
                    }`}
                    onClick={(e) => handleSelectOption(opt, e)}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {showColorDot && opt.color && (
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${getBadgeColorClass(opt.color, theme, 'dot')}`}
                        />
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isSelected && (
                        <Check className={`w-3.5 h-3.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
                      )}

                      {/* Micro inline delete button on hover */}
                      {category && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteOptionOnTheFly(opt, e)}
                          className="opacity-0 group-hover/item:opacity-100 p-0.5 rounded text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-opacity"
                          title={isRu ? 'Удалить вариант' : 'Delete option'}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* "+ Add Custom Option" button */}
          {(allowCreate || category) && (
            <div
              className={`pt-1 mt-1 border-t ${
                isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'
              }`}
            >
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className={`w-full px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  isLight
                    ? 'text-indigo-600 hover:bg-indigo-50/70'
                    : 'text-indigo-400 hover:bg-indigo-500/10'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addNewOption || '+ Добавить свой вариант'}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Inline Micro-Creator for creating new option on-the-fly */
        <div className="p-3 space-y-3 w-64">
          <div className="flex items-center justify-between border-b pb-1.5">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              {t.addNewOptionBtn || 'Новый вариант'}
            </span>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-0.5 rounded text-zinc-400 hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleSaveNewOption} className="space-y-2.5">
            <input
              ref={inputRef}
              type="text"
              required
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder={t.optionNamePlaceholder || 'Название...'}
              className={`w-full px-2.5 py-1 rounded-md text-xs border focus:outline-none ${
                isLight
                  ? 'bg-white text-zinc-900 border-black/15 focus:border-indigo-500'
                  : 'bg-[var(--surface-secondary)] text-white border-white/10 focus:border-indigo-500'
              }`}
            />

            <div>
              <label className="text-[10px] block mb-1 text-zinc-400">
                {t.optionColorLabel || 'Цвет'}:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BADGE_COLOR_PALETTES.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => setNewColor(p.color)}
                    style={{ backgroundColor: p.hex }}
                    className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                      newColor === p.color ? 'ring-2 ring-white ring-offset-1 scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={p.labelRu}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className={`px-2 py-1 rounded text-[11px] ${
                  isLight ? 'text-zinc-600 hover:bg-black/5' : 'text-zinc-400 hover:bg-white/5'
                }`}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 rounded text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer shadow-xs"
              >
                {t.save}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  ) : null;

  return (
    <div className={`relative inline-block ${className}`}>
      {renderTriggerContent()}
      {typeof document !== 'undefined' && createPortal(portalContent, document.body)}
    </div>
  );
};
