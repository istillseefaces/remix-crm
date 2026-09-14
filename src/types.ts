export type Language = 'ru' | 'en';
export type Currency = 'USD' | 'KZT';
export type Theme = 'dark' | 'light';

export type ConnectStatus = 'yes' | 'no';
export type SalesStatus = 'yes' | 'no';
export type ArtistStatus = 'active' | 'passive' | 'dead' | string;
export type DemoStatus = 'none' | 'sent' | 'liked' | 'in_progress' | 'rejected' | string;
export type ReactionStatus = 'none' | 'ignored' | 'listening' | 'replied' | 'wants_more' | 'ready_to_buy' | string;

export interface Artist {
  id: string;
  name: string;
  instagram: string;
  email: string;
  phone: string;
  telegram: string;
  discord: string;
  notes: string;
  connect: ConnectStatus;
  types: string[];
  sales: SalesStatus;
  status: ArtistStatus;
  demoStatus: DemoStatus;
  touches: number;
  reaction: ReactionStatus;
  lastContactDate?: string; // YYYY-MM-DD (новая колонка "Дата последнего контакта")
  followUpDate: string; // YYYY-MM-DD
  isDeleted?: boolean; // Soft delete для Корзины
  createdAt: string;
  updatedAt: string;
}

export type DealPlatform = 'Instagram' | 'Telegram' | 'iMessage' | 'Discord' | 'Email' | 'Other' | string;
export type DealStage = 'interested' | 'in_progress' | 'closed' | 'cancelled' | string;

export interface Deal {
  id: string;
  artistId?: string;
  artistName: string;
  platform: DealPlatform;
  stage: DealStage;
  amount: number;
  currency: string;
  date: string; // YYYY-MM-DD
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type ActiveTab = 'artists' | 'deals' | 'analytics' | 'parser';

export type AnalyticsSubTab = 'overview' | 'deals_analytics' | 'revenue' | 'distribution' | 'genres' | 'comparison';
export type AnalyticsTimeRange = '3d' | '7d' | '14d' | '30d' | '90d' | 'all';

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'greater_than'
  | 'less_than'
  | 'between'
  | 'date_preset';

export type DatePreset = 'today' | 'this_week' | 'overdue' | 'future' | 'all';

export interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  secondaryValue?: any;
}

export type QuickPreset =
  | 'all'
  | 'has_connect'
  | 'followup_due'
  | 'no_connect'
  | 'hot_deals'
  | 'has_sales'
  | 'active_artists'
  | 'deals_overdue'
  | 'deals_today'
  | 'deals_in_progress'
  | 'deals_interested'
  | 'deals_won'
  | 'deals_lost'
  | 'deals_high_value';

export interface AppStats {
  totalArtists: number;
  connectCount: number;
  connectRate: number;
  overdueFollowups: number;
  todayFollowups: number;
  totalDeals: number;
  activeDealsCount: number;
  dealsClosedCount: number;
  dealsWinRate: number;
  overdueDealsCount: number;
  todayDealsCount: number;
  closedRevenue: number;
  pipelineRevenue: number;
}

// Option Manager & Custom Dropdown Option Types
export type OptionCategory = 'artistStatus' | 'demoStatus' | 'reaction' | 'platform' | 'genres' | 'dealStage';

export type BadgeColor =
  | 'emerald'
  | 'amber'
  | 'red'
  | 'blue'
  | 'purple'
  | 'cyan'
  | 'pink'
  | 'zinc'
  | 'orange';

export interface DropdownOption {
  id: string;
  label: string;
  color: BadgeColor;
  isSystem?: boolean;
}

export interface CustomOptionsState {
  artistStatus: DropdownOption[];
  demoStatus: DropdownOption[];
  reaction: DropdownOption[];
  platform: DropdownOption[];
  genres: DropdownOption[];
  dealStage?: DropdownOption[];
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  periodType: 'month' | 'quarter' | 'custom';
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface ArtistLtvData {
  artistId: string;
  artistName: string;
  totalLtv: number;
  closedDealsCount: number;
  repeatDealsCount: number;
  tier: 'vip' | 'regular' | 'one_time' | 'lead';
  badgeLabel: string;
}

// -------------------------------------------------------------
// LOCAL PARSER MODULE TYPES
// -------------------------------------------------------------
export type ParserAccountStatus = 'active' | 'needs_auth' | 'blocked' | 'error';

export interface ParserAccount {
  id: string;
  username: string;
  password?: string;
  twoFactorSecret?: string;
  proxy?: string; // host:port:login:pass
  status: ParserAccountStatus;
  lastCheckedAt?: string;
  lastChecked?: string;
  sessionExists?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type StagingCategory = 'artist' | 'producer' | 'all' | 'unknown';
export type StagingStatus = 'new' | 'imported' | 'excluded';

export interface StagingContact {
  id: string;
  username: string;
  name?: string;
  fullName?: string;
  avatarUrl?: string;
  followersCount: number;
  followingCount?: number;
  postsCount?: number;
  bio?: string;
  links?: string[];
  email?: string;
  phone?: string;
  telegram?: string;
  tags?: string[];
  sourceTarget: string; // аккаунт-донор
  category: StagingCategory;
  parsedAt: string;
  scrapedAt?: string;
  instagramUrl?: string;
  externalUrl?: string;
  status: StagingStatus;
  notes?: string;
}

export interface ParserConfig {
  accountId: string;
  targets: string; // построчно или через запятую
  scrapeProfiles: boolean;
  scrapeStories: boolean;
  scrapePosts: boolean;
  scrapeFollowers: boolean;
  audiencePriority: 'artists_only' | 'producers_only' | 'all';
  minFollowers: number;
  maxFollowers: number;
  skipCrmProfiles: boolean;
  searchNewMedia: boolean;
  searchNewOldAccounts: boolean;
}

export interface ParserLogEntry {
  id: string;
  timestamp: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  level?: 'info' | 'warn' | 'error' | 'success' | string;
}

export interface ParserTaskStatus {
  isRunning: boolean;
  currentStep: string;
  progress: number;
  scrapedCount: number;
  collectedCount?: number;
  foundCount?: number;
  totalTarget?: number;
  errorsCount: number;
  error?: string;
  logs: ParserLogEntry[];
  activeAccountId?: string;
  activeTarget?: string;
}

// -------------------------------------------------------------
// COLUMN-LEVEL CUSTOM FILTERS FOR CRM TABLE
// -------------------------------------------------------------
export interface ColumnFiltersState {
  artist?: { query: string; selectedNames: string[] };
  connect?: 'all' | 'yes' | 'no';
  types?: string[];
  sales?: { hasSales: 'all' | 'yes' | 'no'; minAmount?: number; maxAmount?: number };
  status?: string[];
  demoStatus?: string[]; // Доверие / Демо
  touches?: { mode: 'all' | 'sent' | 'not_sent'; min?: number; max?: number };
  reaction?: string[];
  lastContactDate?: {
    preset: 'all' | 'today' | 'this_week' | 'old' | 'empty' | 'custom';
    startDate?: string;
    endDate?: string;
  };
  followUpDate?: {
    preset: 'all' | 'today' | 'overdue' | 'scheduled' | 'no_date';
    manager?: string;
  };
}

