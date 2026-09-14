import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RefreshCw,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { BADGE_COLOR_PALETTES, getBadgeColorClass } from '../utils/customOptions';
import { BadgeColor, DropdownOption, OptionCategory } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { ErrorBoundary } from './ErrorBoundary';

interface OptionManagerProps {
  initialCategory?: OptionCategory;
}

const OptionManagerContent: React.FC<OptionManagerProps> = ({ initialCategory = 'artistStatus' }) => {
  const {
    t,
    lang,
    theme,
    artists,
    deals,
    customOptions,
    addCustomOption,
    updateCustomOption,
    deleteCustomOption,
    resetCustomOptions,
    showToast,
  } = useApp();

  const isLight = theme === 'light';

  // Selected Category
  const [selectedCategory, setSelectedCategory] = useState<OptionCategory>(initialCategory);

  // New option form state
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState<BadgeColor>('emerald');

  // Editing option state
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState<BadgeColor>('emerald');

  // Confirm modals
  const [optionToDelete, setOptionToDelete] = useState<{
    category: OptionCategory;
    id: string;
    label: string;
  } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Categories list
  const categories: { id: OptionCategory; label: string }[] = [
    { id: 'artistStatus', label: t.optionCategoryStatus || 'Статусы артиста' },
    { id: 'demoStatus', label: t.optionCategoryDemo || 'Демо / Отправка' },
    { id: 'reaction', label: t.optionCategoryReaction || 'Реакции' },
    { id: 'platform', label: t.optionCategoryPlatform || 'Платформы' },
    { id: 'genres', label: t.optionCategoryGenres || 'Тайпы / Жанры' },
    { id: 'dealStage', label: t.stageInterested ? 'Этапы сделок' : 'Deal Stages' },
  ];

  // Calculate usage count for any option
  const getUsageCount = (cat: OptionCategory, optId: string, optLabel: string) => {
    const idLower = (optId || '').toLowerCase();
    const labelLower = (optLabel || '').toLowerCase();

    if (cat === 'artistStatus') {
      return (artists || []).filter(
        (a) =>
          (a.status || '').toLowerCase() === idLower ||
          (a.status || '').toLowerCase() === labelLower
      ).length;
    }
    if (cat === 'demoStatus') {
      return (artists || []).filter(
        (a) =>
          (a.demoStatus || '').toLowerCase() === idLower ||
          (a.demoStatus || '').toLowerCase() === labelLower
      ).length;
    }
    if (cat === 'reaction') {
      return (artists || []).filter(
        (a) =>
          (a.reaction || '').toLowerCase() === idLower ||
          (a.reaction || '').toLowerCase() === labelLower
      ).length;
    }
    if (cat === 'platform') {
      return (deals || []).filter(
        (d) =>
          (d.platform || '').toLowerCase() === idLower ||
          (d.platform || '').toLowerCase() === labelLower
      ).length;
    }
    if (cat === 'genres') {
      return (artists || []).filter((a) =>
        (a.types || []).some(
          (type) =>
            type.toLowerCase() === idLower || type.toLowerCase() === labelLower
        )
      ).length;
    }
    if (cat === 'dealStage') {
      return (deals || []).filter(
        (d) =>
          (d.stage || '').toLowerCase() === idLower ||
          (d.stage || '').toLowerCase() === labelLower
      ).length;
    }
    return 0;
  };

  const optionsList: DropdownOption[] = (customOptions && customOptions[selectedCategory]) || [];

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    addCustomOption(selectedCategory, {
      label: newLabel.trim(),
      color: newColor,
    });
    setNewLabel('');
  };

  const handleStartEdit = (opt: DropdownOption) => {
    setEditingOptionId(opt.id);
    setEditLabel(opt.label);
    setEditColor(opt.color);
  };

  const handleSaveEdit = (optId: string) => {
    if (!editLabel.trim()) return;

    updateCustomOption(selectedCategory, optId, {
      label: editLabel.trim(),
      color: editColor,
    });
    setEditingOptionId(null);
    showToast('Вариант обновлен');
  };

  const handleCancelEdit = () => {
    setEditingOptionId(null);
  };

  const confirmDelete = () => {
    if (optionToDelete) {
      deleteCustomOption(optionToDelete.category, optionToDelete.id);
      setOptionToDelete(null);
    }
  };

  const confirmResetAll = () => {
    resetCustomOptions();
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h4 className="font-semibold text-sm">{t.customOptionsTitle || 'Справочники и Выпадающие списки'}</h4>
        <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
          {t.customOptionsDesc || 'Управление вариантами для статусов, реакций, каналов связи и жанров'}
        </p>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex flex-wrap gap-1.5 pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setSelectedCategory(cat.id);
              setEditingOptionId(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
              selectedCategory === cat.id
                ? isLight
                  ? 'bg-black text-white border-black font-semibold shadow-xs'
                  : 'bg-white text-black border-white font-semibold shadow-xs'
                : isLight
                ? 'bg-[var(--surface-secondary)] text-zinc-700 border-black/[0.06] hover:bg-black/[0.04]'
                : 'bg-[var(--surface-secondary)] text-zinc-400 border-white/[0.06] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Options List with Inline CRUD */}
      <div
        className={`border rounded-2xl p-3.5 space-y-2.5 ${
          isLight ? 'bg-[var(--canvas)] border-black/[0.06]' : 'bg-[var(--surface)] border-white/[0.06]'
        }`}
      >
        <div className="flex items-center justify-between px-1">
          <span className="font-semibold text-[11px] text-zinc-400 uppercase tracking-wider">
            {optionsList.length} вариантов в категории
          </span>
        </div>

        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {optionsList.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-400 italic">
              Нет вариантов в этой категории
            </div>
          ) : (
            optionsList.map((opt) => {
              const isEditing = editingOptionId === opt.id;
              const badgeClass = getBadgeColorClass(opt.color, theme, 'badge');
              const dotClass = getBadgeColorClass(opt.color, theme, 'dot');
              const usageCount = getUsageCount(selectedCategory, opt.id, opt.label);

              if (isEditing) {
                return (
                  <div
                    key={opt.id}
                    className={`p-2.5 rounded-xl border space-y-2.5 animate-in fade-in duration-150 ${
                      isLight
                        ? 'bg-white border-indigo-300 shadow-sm'
                        : 'bg-[#1C1C22] border-indigo-500/40 shadow-lg'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        placeholder="Название варианта..."
                        className={`flex-1 px-2.5 py-1 text-xs rounded-lg border focus:outline-none ${
                          isLight
                            ? 'bg-white text-zinc-900 border-black/20 focus:border-indigo-500'
                            : 'bg-[var(--surface)] text-white border-white/20 focus:border-indigo-500'
                        }`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(opt.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => handleSaveEdit(opt.id)}
                        className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer"
                        title="Сохранить"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700' : 'bg-white/10 hover:bg-white/20 text-zinc-300'
                        }`}
                        title="Отмена"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Color selection in edit mode */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {BADGE_COLOR_PALETTES.map((p) => (
                        <button
                          key={p.color}
                          type="button"
                          onClick={() => setEditColor(p.color)}
                          style={{ backgroundColor: p.hex }}
                          className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                            editColor === p.color ? 'ring-2 ring-white ring-offset-1 scale-125' : 'opacity-70 hover:opacity-100'
                          }`}
                          title={p.labelRu}
                        />
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={opt.id}
                  className={`flex items-center justify-between p-2 rounded-xl border transition ${
                    isLight
                      ? 'bg-white border-black/[0.06] hover:border-black/15'
                      : 'bg-[var(--surface-secondary)] border-white/[0.04] hover:border-white/10'
                  }`}
                >
                  {/* Badge Preview and Usage Count */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                      <span className="truncate max-w-[160px]">{opt.label}</span>
                    </span>

                    {usageCount > 0 ? (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border ${
                          isLight
                            ? 'bg-zinc-100 border-zinc-200 text-zinc-700'
                            : 'bg-white/5 border-white/10 text-zinc-400'
                        }`}
                        title={`${usageCount} записей используют этот вариант в базе`}
                      >
                        {usageCount} в базе
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400 opacity-60">не исп.</span>
                    )}
                  </div>

                  {/* Actions: Edit ✏️ & Delete 🗑️ */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(opt)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        isLight
                          ? 'text-zinc-500 hover:text-black hover:bg-black/5'
                          : 'text-zinc-400 hover:text-white hover:bg-white/10'
                      }`}
                      title="Редактировать вариант и цвет"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setOptionToDelete({
                          category: selectedCategory,
                          id: opt.id,
                          label: opt.label,
                        })
                      }
                      className="p-1.5 rounded-lg transition cursor-pointer text-red-400 hover:text-red-500 hover:bg-red-500/10"
                      title="Удалить вариант"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add New Option Form */}
      <form
        onSubmit={handleAddOption}
        className={`border rounded-2xl p-4 space-y-3 ${
          isLight ? 'bg-white border-black/[0.08]' : 'bg-[var(--surface-secondary)] border-white/[0.06]'
        }`}
      >
        <div className="font-semibold text-xs flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-emerald-500" />
          <span>{t.addNewOptionBtn || '+ Добавить новый вариант в категорию'}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder={t.optionNamePlaceholder || 'Название варианта (например, Hyperpop, В работе...)'}
            className={`flex-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 ${
              isLight
                ? 'bg-[var(--surface-secondary)] text-zinc-900 border-black/[0.08]'
                : 'bg-[var(--surface)] text-white border-white/[0.1]'
            }`}
          />

          <button
            type="submit"
            disabled={!newLabel.trim()}
            className={`px-4 py-1.5 rounded-xl font-semibold text-xs transition cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5 ${
              isLight
                ? 'bg-black text-white hover:bg-black/90'
                : 'bg-emerald-500 text-black hover:bg-emerald-400'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addNewOptionBtn || 'Добавить'}</span>
          </button>
        </div>

        {/* Color Preset Palette Selection */}
        <div className="space-y-1.5 pt-1">
          <span className={`text-[11px] block font-medium ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {t.optionColorLabel || 'Цвет бейджа'}:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {BADGE_COLOR_PALETTES.map((p) => {
              const isSelected = newColor === p.color;
              return (
                <button
                  key={p.color}
                  type="button"
                  onClick={() => setNewColor(p.color)}
                  style={{ backgroundColor: p.hex }}
                  className={`w-5 h-5 rounded-full transition-all cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--surface)] scale-110 shadow-md'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  title={p.labelRu}
                />
              );
            })}
          </div>
        </div>
      </form>

      {/* Bottom Control Area - Reset to Defaults */}
      <div
        className={`flex items-center justify-between pt-2 border-t ${
          isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'
        }`}
      >
        <span className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
          {lang === 'ru'
            ? 'Хотите вернуть стандартные значения всех справочников?'
            : 'Want to restore default dropdown options?'}
        </span>

        <button
          type="button"
          onClick={() => setIsResetConfirmOpen(true)}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-xs ${
            isLight
              ? 'bg-white hover:bg-red-50 text-zinc-700 hover:text-red-600 border-black/[0.1] hover:border-red-300 active:scale-[0.98]'
              : 'bg-[var(--surface-secondary)] hover:bg-red-500/10 text-zinc-300 hover:text-red-300 border-white/[0.08] hover:border-red-500/30 active:scale-[0.98]'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:rotate-180 transition-transform duration-300" />
          <span>{t.resetOptionsBtn || 'Сбросить справочники к дефолтным'}</span>
        </button>
      </div>

      {/* Delete Confirmation Modal with In-use Warning */}
      <ConfirmModal
        isOpen={Boolean(optionToDelete)}
        title="Удалить вариант?"
        description={
          optionToDelete
            ? `Вы действительно хотите удалить "${optionToDelete.label}" из справочника? ${
                getUsageCount(optionToDelete.category, optionToDelete.id, optionToDelete.label) > 0
                  ? `\n⚠️ Внимание: Этот вариант используется у ${getUsageCount(
                      optionToDelete.category,
                      optionToDelete.id,
                      optionToDelete.label
                    )} записей в вашей базе данных.`
                  : ''
              }`
            : ''
        }
        confirmLabel={t.delete || 'Удалить'}
        cancelLabel={t.cancel || 'Отмена'}
        isDestructive={true}
        onConfirm={confirmDelete}
        onClose={() => setOptionToDelete(null)}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title={t.resetOptionsBtn || 'Сброс справочников'}
        description={
          t.resetOptionsConfirm ||
          'Сбросить все статусы, реакции, платформы и жанры к стандартным исходным значениям?'
        }
        confirmLabel={t.resetOptionsBtn || 'Сбросить'}
        cancelLabel={t.cancel || 'Отмена'}
        isDestructive={false}
        onConfirm={confirmResetAll}
        onClose={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};

export const OptionManager: React.FC<OptionManagerProps> = (props) => {
  return (
    <ErrorBoundary
      fallbackTitle="Ошибка загрузки справочников"
      fallbackMessage="Произошла ошибка при отрисовке списка справочников. Нажмите кнопку ниже для сброса настроек."
    >
      <OptionManagerContent {...props} />
    </ErrorBoundary>
  );
};
