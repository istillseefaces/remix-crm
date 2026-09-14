import {
  BadgeColor,
  CustomOptionsState,
  DropdownOption,
  OptionCategory,
  Theme,
} from '../types';

export const BADGE_COLOR_PALETTES: Array<{ color: BadgeColor; labelRu: string; labelEn: string; hex: string }> = [
  { color: 'emerald', labelRu: 'Зеленый', labelEn: 'Green', hex: '#10B981' },
  { color: 'amber', labelRu: 'Желтый', labelEn: 'Yellow', hex: '#F59E0B' },
  { color: 'red', labelRu: 'Красный', labelEn: 'Red', hex: '#EF4444' },
  { color: 'blue', labelRu: 'Синий', labelEn: 'Blue', hex: '#0EA5E9' },
  { color: 'purple', labelRu: 'Фиолетовый', labelEn: 'Purple', hex: '#A855F7' },
  { color: 'cyan', labelRu: 'Бирюзовый', labelEn: 'Cyan', hex: '#06B6D4' },
  { color: 'pink', labelRu: 'Розовый', labelEn: 'Pink', hex: '#EC4899' },
  { color: 'orange', labelRu: 'Оранжевый', labelEn: 'Orange', hex: '#F97316' },
  { color: 'zinc', labelRu: 'Серый', labelEn: 'Gray', hex: '#71717A' },
];

export const defaultCustomOptions: CustomOptionsState = {
  artistStatus: [
    { id: 'active', label: 'Активный', color: 'emerald', isSystem: true },
    { id: 'passive', label: 'Пассивный', color: 'amber', isSystem: true },
    { id: 'dead', label: 'Мертвый', color: 'zinc', isSystem: true },
  ],
  demoStatus: [
    { id: 'none', label: 'Не отправлено', color: 'zinc', isSystem: true },
    { id: 'in_progress', label: 'В работе', color: 'purple', isSystem: true },
    { id: 'sent', label: 'Отправлено', color: 'blue', isSystem: true },
    { id: 'liked', label: 'Понравилось', color: 'emerald', isSystem: true },
    { id: 'rejected', label: 'Отклонено', color: 'red', isSystem: true },
  ],
  reaction: [
    { id: 'none', label: 'Нет реакции', color: 'zinc', isSystem: true },
    { id: 'ignored', label: 'Игнор', color: 'red', isSystem: true },
    { id: 'listening', label: 'Слушает', color: 'blue', isSystem: true },
    { id: 'replied', label: 'Ответил', color: 'amber', isSystem: true },
    { id: 'wants_more', label: 'Просит еще', color: 'purple', isSystem: true },
    { id: 'ready_to_buy', label: 'Хочет купить', color: 'emerald', isSystem: true },
  ],
  platform: [
    { id: 'Instagram', label: 'Instagram', color: 'pink', isSystem: true },
    { id: 'Telegram', label: 'Telegram', color: 'blue', isSystem: true },
    { id: 'Email', label: 'Email', color: 'amber', isSystem: true },
    { id: 'Discord', label: 'Discord', color: 'purple', isSystem: true },
    { id: 'iMessage', label: 'iMessage', color: 'emerald', isSystem: true },
    { id: 'Other', label: 'Other', color: 'zinc', isSystem: true },
  ],
  genres: [
    { id: 'Dark Rage', label: 'Dark Rage', color: 'purple', isSystem: true },
    { id: 'Yeat Type', label: 'Yeat Type', color: 'emerald', isSystem: true },
    { id: 'Ken Carson', label: 'Ken Carson', color: 'pink', isSystem: true },
    { id: 'Playboi Carti', label: 'Playboi Carti', color: 'red', isSystem: true },
    { id: 'Hyperpop', label: 'Hyperpop', color: 'cyan', isSystem: true },
    { id: 'Drill', label: 'Drill', color: 'blue', isSystem: true },
    { id: 'Trap', label: 'Trap', color: 'amber', isSystem: true },
    { id: 'Underground', label: 'Underground', color: 'zinc', isSystem: true },
  ],
  dealStage: [
    { id: 'interested', label: 'Заинтересован', color: 'blue', isSystem: true },
    { id: 'in_progress', label: 'В процессе', color: 'purple', isSystem: true },
    { id: 'closed', label: 'Закрыта', color: 'emerald', isSystem: true },
    { id: 'cancelled', label: 'Отменена', color: 'red', isSystem: true },
  ],
};

/**
 * Sanitizes and fills missing category arrays for custom options
 */
export function sanitizeCustomOptions(raw: any): CustomOptionsState {
  if (!raw || typeof raw !== 'object') {
    return { ...defaultCustomOptions };
  }

  const result: CustomOptionsState = {
    artistStatus: Array.isArray(raw.artistStatus) && raw.artistStatus.length > 0 ? raw.artistStatus : defaultCustomOptions.artistStatus,
    demoStatus: Array.isArray(raw.demoStatus) && raw.demoStatus.length > 0 ? raw.demoStatus : defaultCustomOptions.demoStatus,
    reaction: Array.isArray(raw.reaction) && raw.reaction.length > 0 ? raw.reaction : defaultCustomOptions.reaction,
    platform: Array.isArray(raw.platform) && raw.platform.length > 0 ? raw.platform : defaultCustomOptions.platform,
    genres: Array.isArray(raw.genres) && raw.genres.length > 0 ? raw.genres : (Array.isArray(raw.artistTypes) && raw.artistTypes.length > 0 ? raw.artistTypes : defaultCustomOptions.genres),
    dealStage: Array.isArray(raw.dealStage) && raw.dealStage.length > 0 ? raw.dealStage : defaultCustomOptions.dealStage,
  };

  return result;
}

/**
 * Formats YYYY-MM-DD string to Russian date format DD.MM.YYYY
 */
export function formatDateRu(dateStr: string | null | undefined): string {
  if (!dateStr || !dateStr.trim()) return '';
  const parts = dateStr.trim().split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${parts[0]}`;
  }
  return dateStr;
}

/**
 * Formats DD.MM.YYYY string back to standard YYYY-MM-DD
 */
export function parseDateRu(ruDateStr: string | null | undefined): string {
  if (!ruDateStr || !ruDateStr.trim()) return '';
  const parts = ruDateStr.trim().split('.');
  if (parts.length === 3 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return ruDateStr;
}

/**
 * Returns Tailwind class names for badge pills, text colors, and indicators
 */
export function getBadgeColorClass(
  color: BadgeColor = 'zinc',
  theme: Theme = 'dark',
  variant: 'badge' | 'solid' | 'text' | 'dot' | 'subtle' = 'badge'
): string {
  const isLight = theme === 'light';

  switch (color) {
    case 'emerald':
      if (variant === 'badge') {
        return isLight
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70'
          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/25';
      }
      if (variant === 'dot') return 'bg-emerald-500 shadow-xs shadow-emerald-500/40';
      if (variant === 'text') return isLight ? 'text-emerald-700' : 'text-emerald-400';
      return isLight ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white';

    case 'amber':
      if (variant === 'badge') {
        return isLight
          ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/70'
          : 'bg-amber-500/15 text-amber-300 border-amber-500/25 hover:bg-amber-500/25';
      }
      if (variant === 'dot') return 'bg-amber-500 shadow-xs shadow-amber-500/40';
      if (variant === 'text') return isLight ? 'text-amber-700' : 'text-amber-400';
      return isLight ? 'bg-amber-500 text-white' : 'bg-amber-600 text-white';

    case 'red':
      if (variant === 'badge') {
        return isLight
          ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100/70'
          : 'bg-red-500/15 text-red-300 border-red-500/25 hover:bg-red-500/25';
      }
      if (variant === 'dot') return 'bg-red-500 shadow-xs shadow-red-500/40';
      if (variant === 'text') return isLight ? 'text-red-700' : 'text-red-400';
      return isLight ? 'bg-red-500 text-white' : 'bg-red-600 text-white';

    case 'blue':
      if (variant === 'badge') {
        return isLight
          ? 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100/70'
          : 'bg-sky-500/15 text-sky-300 border-sky-500/25 hover:bg-sky-500/25';
      }
      if (variant === 'dot') return 'bg-sky-500 shadow-xs shadow-sky-500/40';
      if (variant === 'text') return isLight ? 'text-sky-700' : 'text-sky-400';
      return isLight ? 'bg-sky-500 text-white' : 'bg-sky-600 text-white';

    case 'purple':
      if (variant === 'badge') {
        return isLight
          ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100/70'
          : 'bg-purple-500/15 text-purple-300 border-purple-500/25 hover:bg-purple-500/25';
      }
      if (variant === 'dot') return 'bg-purple-500 shadow-xs shadow-purple-500/40';
      if (variant === 'text') return isLight ? 'text-purple-700' : 'text-purple-400';
      return isLight ? 'bg-purple-500 text-white' : 'bg-purple-600 text-white';

    case 'cyan':
      if (variant === 'badge') {
        return isLight
          ? 'bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100/70'
          : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25 hover:bg-cyan-500/25';
      }
      if (variant === 'dot') return 'bg-cyan-500 shadow-xs shadow-cyan-500/40';
      if (variant === 'text') return isLight ? 'text-cyan-700' : 'text-cyan-400';
      return isLight ? 'bg-cyan-500 text-white' : 'bg-cyan-600 text-white';

    case 'pink':
      if (variant === 'badge') {
        return isLight
          ? 'bg-pink-50 text-pink-800 border-pink-200 hover:bg-pink-100/70'
          : 'bg-pink-500/15 text-pink-300 border-pink-500/25 hover:bg-pink-500/25';
      }
      if (variant === 'dot') return 'bg-pink-500 shadow-xs shadow-pink-500/40';
      if (variant === 'text') return isLight ? 'text-pink-700' : 'text-pink-400';
      return isLight ? 'bg-pink-500 text-white' : 'bg-pink-600 text-white';

    case 'orange':
      if (variant === 'badge') {
        return isLight
          ? 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100/70'
          : 'bg-orange-500/15 text-orange-300 border-orange-500/25 hover:bg-orange-500/25';
      }
      if (variant === 'dot') return 'bg-orange-500 shadow-xs shadow-orange-500/40';
      if (variant === 'text') return isLight ? 'text-orange-700' : 'text-orange-400';
      return isLight ? 'bg-orange-500 text-white' : 'bg-orange-600 text-white';

    case 'zinc':
    default:
      if (variant === 'badge') {
        return isLight
          ? 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200/60'
          : 'bg-zinc-800/80 text-zinc-300 border-white/[0.08] hover:bg-zinc-800';
      }
      if (variant === 'dot') return 'bg-zinc-400';
      if (variant === 'text') return isLight ? 'text-zinc-600' : 'text-zinc-400';
      return isLight ? 'bg-zinc-600 text-white' : 'bg-zinc-700 text-white';
  }
}

/**
 * Calculates follow up countdown and status cleanly
 */
export function getFollowUpStatus(
  dateStr: string | undefined | null,
  t: {
    dueTodayBadge?: string;
    overdueDays?: (n: number) => string;
    inDays?: (n: number) => string;
    overdue?: string;
    today?: string;
  }
) {
  if (!dateStr || !dateStr.trim()) return null;

  const parts = dateStr.trim().split('-');
  if (parts.length < 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;

  const targetDate = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueCount = Math.abs(diffDays);
    const label = t.overdueDays ? t.overdueDays(overdueCount) : `Просрочено (${overdueCount} дн.)`;
    return {
      type: 'overdue' as const,
      days: overdueCount,
      label,
      shortLabel: `-${overdueCount} дн.`,
      diffDays,
    };
  } else if (diffDays === 0) {
    return {
      type: 'today' as const,
      days: 0,
      label: t.dueTodayBadge || t.today || 'Сегодня',
      shortLabel: 'Сегодня',
      diffDays: 0,
    };
  } else {
    const label = t.inDays ? t.inDays(diffDays) : `Через ${diffDays} дн.`;
    return {
      type: 'future' as const,
      days: diffDays,
      label,
      shortLabel: `+${diffDays} дн.`,
      diffDays,
    };
  }
}
