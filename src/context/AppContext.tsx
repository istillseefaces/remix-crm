import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  Artist,
  Deal,
  Language,
  Currency,
  Theme,
  ActiveTab,
  FilterCondition,
  QuickPreset,
  AppStats,
  CustomOptionsState,
  OptionCategory,
  BadgeColor,
  DropdownOption,
  ColumnFiltersState,
  ParserAccount,
  StagingContact,
  ParserConfig,
  ParserTaskStatus,
} from '../types';
import { translations } from '../locales/translations';
import { initialArtists, initialDeals } from '../utils/sampleData';
import { defaultCustomOptions, sanitizeCustomOptions } from '../utils/customOptions';

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations['ru'];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Theme & Currency
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  formatMoney: (amountInUSD: number, options?: { hideSymbol?: boolean }) => string;
  currencySymbol: string;
  
  // Data
  artists: Artist[];
  deals: Deal[];
  
  // Custom Options / Option Manager
  customOptions: CustomOptionsState;
  addCustomOption: (category: OptionCategory, option: { label: string; color: BadgeColor }) => void;
  updateCustomOption: (category: OptionCategory, id: string, updates: Partial<DropdownOption>) => void;
  deleteCustomOption: (category: OptionCategory, id: string) => boolean;
  resetCustomOptions: () => void;

  // CRUD Artists
  addArtist: (artist: Omit<Artist, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateArtist: (id: string, updates: Partial<Artist>) => void;
  deleteArtist: (id: string) => void;
  reorderArtists: (newArtists: Artist[]) => void;

  // Trash & Soft Delete
  crmViewMode: 'active' | 'trash';
  setCrmViewMode: (mode: 'active' | 'trash') => void;
  trashCount: number;
  restoreArtist: (id: string) => void;
  hardDeleteArtist: (id: string) => void;
  emptyTrash: () => void;
  bulkRestoreArtists: (ids: string[]) => void;
  bulkHardDeleteArtists: (ids: string[]) => void;
  
  // CRUD Deals
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  reorderDeals: (newDeals: Deal[]) => void;
  
  // Search & Filtering
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  quickPreset: QuickPreset;
  setQuickPreset: (preset: QuickPreset) => void;
  filterConditions: FilterCondition[];
  addFilterCondition: (condition: Omit<FilterCondition, 'id'>) => void;
  removeFilterCondition: (id: string) => void;
  updateFilterCondition: (id: string, updates: Partial<FilterCondition>) => void;
  clearAllFilters: () => void;

  // Custom Column Filters
  columnFilters: ColumnFiltersState;
  setColumnFilter: <K extends keyof ColumnFiltersState>(key: K, value: ColumnFiltersState[K]) => void;
  clearColumnFilter: (key: keyof ColumnFiltersState) => void;
  clearAllColumnFilters: () => void;
  
  // Tag Quick Filter
  selectedTagFilter: string | null;
  setSelectedTagFilter: (tag: string | null) => void;
  
  // Filtered lists
  filteredArtists: Artist[];
  filteredDeals: Deal[];
  
  // Stats
  stats: AppStats;
  
  // Selection & Drawers
  activeArtistId: string | null;
  setActiveArtistId: (id: string | null) => void;
  activeDealId: string | null;
  setActiveDealId: (id: string | null) => void;

  // Bulk Selection for Artists
  selectedArtistIds: string[];
  toggleArtistSelection: (id: string) => void;
  selectAllFilteredArtists: (ids: string[]) => void;
  clearArtistSelection: () => void;
  bulkUpdateArtists: (ids: string[], updates: Partial<Artist>) => void;
  bulkDeleteArtists: (ids: string[]) => void;

  // Bulk Selection for Deals
  selectedDealIds: string[];
  toggleDealSelection: (id: string) => void;
  selectAllFilteredDeals: (ids: string[]) => void;
  clearDealSelection: () => void;
  bulkUpdateDeals: (ids: string[], updates: Partial<Deal>) => void;
  bulkDeleteDeals: (ids: string[]) => void;

  // Parser Integration State & Actions
  parserAccounts: ParserAccount[];
  stagingContacts: StagingContact[];
  parserStatus: ParserTaskStatus;
  isParserSettingsOpen: boolean;
  setIsParserSettingsOpen: (open: boolean) => void;
  isImportFromParserOpen: boolean;
  setIsImportFromParserOpen: (open: boolean) => void;
  startParserTask: (config: ParserConfig, existingUsernames?: string[]) => Promise<void>;
  stopParserTask: () => Promise<void>;
  authenticateParserAccount: (id: string) => Promise<boolean>;
  saveParserAccount: (account: Partial<ParserAccount>) => Promise<void>;
  deleteParserAccount: (id: string) => Promise<void>;
  excludeStagingContact: (id: string) => Promise<void>;
  clearStagingContacts: () => Promise<void>;
  importStagingToCrm: (stagingIds: string[]) => Promise<void>;

  // Toast System
  toast: { message: string; type?: 'success' | 'info' | 'error' | 'mail' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error' | 'mail') => void;
  hideToast: () => void;
  
  // Modals
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isImportExportOpen: boolean;
  setIsImportExportOpen: (open: boolean) => void;
  isNewArtistModalOpen: boolean;
  setIsNewArtistModalOpen: (open: boolean) => void;
  isNewDealModalOpen: boolean;
  setIsNewDealModalOpen: (open: boolean) => void;
  
  // DB Management
  wipeDatabase: () => void;
  resetToSampleData: () => void;
  importSnapshot: (newArtists: Artist[], newDeals: Deal[], mode?: 'replace' | 'append') => void;
  importArtists: (newArtists: Artist[], mode?: 'append' | 'replace') => void;
  importDeals: (newDeals: Deal[], mode?: 'append' | 'replace') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('verse_crm_lang');
    return (saved === 'en' || saved === 'ru') ? saved : 'ru';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('verse_crm_lang', newLang);
  };

  const t = translations[lang];

  // Theme (dark | light)
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('verse_crm_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'light';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('verse_crm_theme', newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  // Currency (USD | KZT)
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('verse_crm_currency');
    return (saved === 'KZT' || saved === 'USD') ? saved : 'USD';
  });

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('verse_crm_currency', newCurrency);
  };

  const toggleCurrency = () => {
    setCurrency(currency === 'USD' ? 'KZT' : 'USD');
  };

  // USD to KZT exchange rate (default: 500)
  const [exchangeRate, setExchangeRateState] = useState<number>(() => {
    const saved = localStorage.getItem('verse_crm_exchange_rate');
    const parsed = Number(saved);
    return parsed > 0 ? parsed : 500;
  });

  const setExchangeRate = (rate: number) => {
    const validRate = rate > 0 ? rate : 500;
    setExchangeRateState(validRate);
    localStorage.setItem('verse_crm_exchange_rate', String(validRate));
  };

  const currencySymbol = currency === 'USD' ? '$' : '₸';

  const formatMoney = (amountInUSD: number, options?: { hideSymbol?: boolean }) => {
    const num = Number(amountInUSD) || 0;
    if (currency === 'USD') {
      const formatted = Math.round(num).toLocaleString('en-US');
      if (options?.hideSymbol) return formatted;
      return `$${formatted}`;
    } else {
      const kzt = Math.round(num * exchangeRate);
      const formatted = kzt.toLocaleString('ru-RU');
      if (options?.hideSymbol) return formatted;
      return `${formatted} ₸`;
    }
  };

  // Active Tab: default to 'artists'
  const [activeTab, setActiveTab] = useState<ActiveTab>('artists');

  // Artists Data
  const [artists, setArtists] = useState<Artist[]>(() => {
    const saved = localStorage.getItem('verse_crm_artists');
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved artists:', e);
      }
    }
    return [];
  });

  // Deals Data
  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem('verse_crm_deals');
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved deals:', e);
      }
    }
    return [];
  });

  // Custom Options State
  const [customOptions, setCustomOptions] = useState<CustomOptionsState>(() => {
    const saved = localStorage.getItem('verse_crm_custom_options');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        return sanitizeCustomOptions(parsed);
      } catch (e) {
        console.error('Failed to parse custom options:', e);
      }
    }
    return defaultCustomOptions;
  });

  useEffect(() => {
    localStorage.setItem('verse_crm_artists', JSON.stringify(artists));
  }, [artists]);

  useEffect(() => {
    localStorage.setItem('verse_crm_deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('verse_crm_custom_options', JSON.stringify(customOptions));
  }, [customOptions]);

  // Option Manager Actions
  const addCustomOption = (category: OptionCategory, option: { label: string; color: BadgeColor }) => {
    const id = option.label.trim();
    setCustomOptions((prev) => {
      const currentList = prev[category] || [];
      // avoid duplicates
      if (currentList.some((item) => item.label.toLowerCase() === option.label.toLowerCase().trim())) {
        return prev;
      }
      const newOption: DropdownOption = {
        id,
        label: option.label.trim(),
        color: option.color,
        isSystem: false,
      };
      return {
        ...prev,
        [category]: [...currentList, newOption],
      };
    });
    showToast(t.optionAddedToast || 'Вариант добавлен');
  };

  const updateCustomOption = (category: OptionCategory, id: string, updates: Partial<DropdownOption>) => {
    setCustomOptions((prev) => {
      const currentList = prev[category] || [];
      return {
        ...prev,
        [category]: currentList.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      };
    });
  };

  const deleteCustomOption = (category: OptionCategory, id: string): boolean => {
    setCustomOptions((prev) => {
      const currentList = prev[category] || [];
      return {
        ...prev,
        [category]: currentList.filter((item) => item.id !== id),
      };
    });
    showToast(t.optionDeletedToast || 'Вариант удален');
    return true;
  };

  const resetCustomOptions = () => {
    setCustomOptions(defaultCustomOptions);
    showToast(t.resetOptionsBtn || 'Справочники сброшены');
  };

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [quickPreset, setQuickPreset] = useState<QuickPreset>('all');
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  // CRM View Mode (active / trash)
  const [crmViewMode, setCrmViewMode] = useState<'active' | 'trash'>('active');

  // Custom Column Filters State
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>({});

  const setColumnFilter = <K extends keyof ColumnFiltersState>(key: K, value: ColumnFiltersState[K]) => {
    setColumnFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearColumnFilter = (key: keyof ColumnFiltersState) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const clearAllColumnFilters = () => {
    setColumnFilters({});
  };

  // Modals & Drawers
  const [activeArtistId, setActiveArtistId] = useState<string | null>(null);
  const [activeDealId, setActiveDealId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isNewArtistModalOpen, setIsNewArtistModalOpen] = useState(false);
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);

  // Bulk selection state
  const [selectedArtistIds, setSelectedArtistIds] = useState<string[]>([]);
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);

  const toggleArtistSelection = (id: string) => {
    setSelectedArtistIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const selectAllFilteredArtists = (ids: string[]) => {
    setSelectedArtistIds(ids);
  };

  const clearArtistSelection = () => {
    setSelectedArtistIds([]);
  };

  const toggleDealSelection = (id: string) => {
    setSelectedDealIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const selectAllFilteredDeals = (ids: string[]) => {
    setSelectedDealIds(ids);
  };

  const clearDealSelection = () => {
    setSelectedDealIds([]);
  };

  const bulkUpdateDeals = (ids: string[], updates: Partial<Deal>) => {
    setDeals((prev) =>
      prev.map((d) =>
        ids.includes(d.id)
          ? { ...d, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
          : d
      )
    );
    showToast(t.bulkUpdatedToast);
  };

  const bulkDeleteDeals = (ids: string[]) => {
    setDeals((prev) => prev.filter((d) => !ids.includes(d.id)));
    setSelectedDealIds([]);
    showToast(
      typeof t.bulkDealsDeletedToast === 'function'
        ? t.bulkDealsDeletedToast(ids.length)
        : `Удалено ${ids.length} сделок`
    );
  };

  // Toast System
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' | 'mail' } | null>(null);
  const toastTimerRef = useRef<any>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' | 'mail' = 'success') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const hideToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast(null);
  };

  // CRUD for Artists
  const addArtist = (artistData: Omit<Artist, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newArtist: Artist = {
      ...artistData,
      id: `art-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setArtists((prev) => [...prev, newArtist]);
    showToast(`Артист ${newArtist.name} добавлен в базу`);
  };

  const reorderArtists = (newArtists: Artist[]) => {
    setArtists(newArtists);
  };

  const updateArtist = (id: string, updates: Partial<Artist>) => {
    setArtists((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              ...updates,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : a
      )
    );
  };

  const trashCount = useMemo(() => artists.filter((a) => a.isDeleted).length, [artists]);

  const deleteArtist = (id: string) => {
    const target = artists.find((a) => a.id === id);
    if (!target) return;
    if (target.isDeleted) {
      hardDeleteArtist(id);
    } else {
      setArtists((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isDeleted: true, updatedAt: new Date().toISOString().split('T')[0] } : a))
      );
      setSelectedArtistIds((prev) => prev.filter((item) => item !== id));
      showToast(t.movedToTrashToast);
    }
  };

  const restoreArtist = (id: string) => {
    setArtists((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isDeleted: false, updatedAt: new Date().toISOString().split('T')[0] } : a))
    );
    setSelectedArtistIds((prev) => prev.filter((item) => item !== id));
    showToast(t.restoredFromTrashToast);
  };

  const hardDeleteArtist = (id: string) => {
    setArtists((prev) => prev.filter((a) => a.id !== id));
    setSelectedArtistIds((prev) => prev.filter((item) => item !== id));
    showToast(t.hardDeletedToast);
  };

  const emptyTrash = () => {
    const count = artists.filter((a) => a.isDeleted).length;
    setArtists((prev) => prev.filter((a) => !a.isDeleted));
    setSelectedArtistIds([]);
    showToast(`${t.emptyTrashToast} (${count})`);
  };

  const bulkRestoreArtists = (ids: string[]) => {
    setArtists((prev) =>
      prev.map((a) => (ids.includes(a.id) ? { ...a, isDeleted: false, updatedAt: new Date().toISOString().split('T')[0] } : a))
    );
    setSelectedArtistIds([]);
    showToast(t.restoredFromTrashToast);
  };

  const bulkHardDeleteArtists = (ids: string[]) => {
    setArtists((prev) => prev.filter((a) => !ids.includes(a.id)));
    setSelectedArtistIds([]);
    showToast(typeof t.bulkDeletedToast === 'function' ? t.bulkDeletedToast(ids.length) : `Удалено ${ids.length} артистов`);
  };

  // Bulk update / delete
  const bulkUpdateArtists = (ids: string[], updates: Partial<Artist>) => {
    setArtists((prev) =>
      prev.map((a) => (ids.includes(a.id) ? { ...a, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : a))
    );
    showToast(t.bulkUpdatedToast);
  };

  const bulkDeleteArtists = (ids: string[]) => {
    if (crmViewMode === 'trash') {
      bulkHardDeleteArtists(ids);
    } else {
      setArtists((prev) =>
        prev.map((a) => (ids.includes(a.id) ? { ...a, isDeleted: true, updatedAt: new Date().toISOString().split('T')[0] } : a))
      );
      setSelectedArtistIds([]);
      showToast(typeof t.bulkDeletedToast === 'function' ? t.bulkDeletedToast(ids.length) : `Перемещено в корзину: ${ids.length}`);
    }
  };

  // CRUD for Deals
  const addDeal = (dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDeal: Deal = {
      ...dealData,
      id: `deal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setDeals((prev) => [...prev, newDeal]);
    showToast(`Сделка на сумму $${newDeal.amount} создана`);
  };

  const reorderDeals = (newDeals: Deal[]) => {
    setDeals(newDeals);
  };

  const updateDeal = (id: string, updates: Partial<Deal>) => {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              ...updates,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : d
      )
    );
  };

  const deleteDeal = (id: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== id));
    showToast(t.delete);
  };

  // Filter conditions management
  const addFilterCondition = (condition: Omit<FilterCondition, 'id'>) => {
    const newCondition: FilterCondition = {
      ...condition,
      id: `fc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setFilterConditions((prev) => [...prev, newCondition]);
  };

  const removeFilterCondition = (id: string) => {
    setFilterConditions((prev) => prev.filter((c) => c.id !== id));
  };

  const updateFilterCondition = (id: string, updates: Partial<FilterCondition>) => {
    setFilterConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setQuickPreset('all');
    setFilterConditions([]);
    setSelectedTagFilter(null);
  };

  // Helper date evaluation
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filtered Artists
  const filteredArtists = useMemo(() => {
    return artists.filter((artist) => {
      // 0. Trash / Active mode
      if (crmViewMode === 'trash') {
        if (!artist.isDeleted) return false;
      } else {
        if (artist.isDeleted) return false;
      }

      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = (artist.name || '').toLowerCase().includes(query);
        const matchInsta = (artist.instagram || '').toLowerCase().includes(query);
        const matchEmail = (artist.email || '').toLowerCase().includes(query);
        const matchTelegram = (artist.telegram || '').toLowerCase().includes(query);
        const matchNotes = (artist.notes || '').toLowerCase().includes(query);
        const matchTags = (artist.types || []).some((tag) => tag.toLowerCase().includes(query));

        if (!matchName && !matchInsta && !matchEmail && !matchTelegram && !matchNotes && !matchTags) {
          return false;
        }
      }

      // 2. Tag Filter
      if (selectedTagFilter) {
        if (!artist.types || !artist.types.includes(selectedTagFilter)) {
          return false;
        }
      }

      // 3. Quick Preset
      if (quickPreset === 'has_connect') {
        if (artist.connect !== 'yes') return false;
      } else if (quickPreset === 'followup_due') {
        if (!artist.followUpDate) return false;
        // Follow-up due is today or overdue
        if (artist.followUpDate > todayStr) return false;
      } else if (quickPreset === 'no_connect') {
        if (artist.connect !== 'no') return false;
      } else if (quickPreset === 'has_sales') {
        if (artist.sales !== 'yes') return false;
      } else if (quickPreset === 'active_artists') {
        if (artist.status !== 'active') return false;
      }

      // 4. Custom Column Filters
      // a. Artist name / query
      if (columnFilters.artist) {
        const { query, selectedNames } = columnFilters.artist;
        if (query && !artist.name.toLowerCase().includes(query.toLowerCase())) return false;
        if (selectedNames && selectedNames.length > 0 && !selectedNames.includes(artist.name)) return false;
      }

      // b. Connect
      if (columnFilters.connect && columnFilters.connect !== 'all') {
        if (artist.connect !== columnFilters.connect) return false;
      }

      // c. Types (Tags)
      if (columnFilters.types && columnFilters.types.length > 0) {
        const hasAnyTag = (artist.types || []).some((t) => columnFilters.types!.includes(t));
        if (!hasAnyTag) return false;
      }

      // d. Sales
      if (columnFilters.sales) {
        const { hasSales, minAmount, maxAmount } = columnFilters.sales;
        if (hasSales && hasSales !== 'all' && artist.sales !== hasSales) return false;
        if (minAmount !== undefined || maxAmount !== undefined) {
          const artistDeals = deals.filter((d) => d.artistId === artist.id);
          const totalSales = artistDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
          if (minAmount !== undefined && totalSales < minAmount) return false;
          if (maxAmount !== undefined && totalSales > maxAmount) return false;
        }
      }

      // e. Status
      if (columnFilters.status && columnFilters.status.length > 0) {
        if (!columnFilters.status.includes(artist.status)) return false;
      }

      // f. DemoStatus (Доверие)
      if (columnFilters.demoStatus && columnFilters.demoStatus.length > 0) {
        if (!columnFilters.demoStatus.includes(artist.demoStatus)) return false;
      }

      // g. Touches
      if (columnFilters.touches) {
        const { mode, min, max } = columnFilters.touches;
        if (mode === 'sent' && (artist.touches || 0) <= 0) return false;
        if (mode === 'not_sent' && (artist.touches || 0) > 0) return false;
        if (min !== undefined && (artist.touches || 0) < min) return false;
        if (max !== undefined && (artist.touches || 0) > max) return false;
      }

      // h. Reaction
      if (columnFilters.reaction && columnFilters.reaction.length > 0) {
        if (!columnFilters.reaction.includes(artist.reaction)) return false;
      }

      // i. Last Contact Date
      if (columnFilters.lastContactDate && columnFilters.lastContactDate.preset !== 'all') {
        const { preset, startDate, endDate } = columnFilters.lastContactDate;
        const d = artist.lastContactDate;
        if (preset === 'empty') {
          if (d) return false;
        } else if (preset === 'today') {
          if (d !== todayStr) return false;
        } else if (preset === 'this_week') {
          if (!d) return false;
          const diffDays = Math.abs((new Date(todayStr).getTime() - new Date(d).getTime()) / (1000 * 3600 * 24));
          if (diffDays > 7) return false;
        } else if (preset === 'old') {
          if (!d) return false;
          const diffDays = (new Date(todayStr).getTime() - new Date(d).getTime()) / (1000 * 3600 * 24);
          if (diffDays < 14) return false;
        } else if (preset === 'custom') {
          if (!d) return false;
          if (startDate && d < startDate) return false;
          if (endDate && d > endDate) return false;
        }
      }

      // j. Follow-up Date (Напоминание)
      if (columnFilters.followUpDate && columnFilters.followUpDate.preset !== 'all') {
        const { preset } = columnFilters.followUpDate;
        const d = artist.followUpDate;
        if (preset === 'no_date') {
          if (d) return false;
        } else if (preset === 'today') {
          if (d !== todayStr) return false;
        } else if (preset === 'overdue') {
          if (!d || d >= todayStr) return false;
        } else if (preset === 'scheduled') {
          if (!d || d <= todayStr) return false;
        }
      }

      // 5. Custom Filter Conditions
      for (const cond of filterConditions) {
        const fieldVal = (artist as any)[cond.field];

        switch (cond.operator) {
          case 'equals':
            if (String(fieldVal).toLowerCase() !== String(cond.value).toLowerCase()) return false;
            break;
          case 'not_equals':
            if (String(fieldVal).toLowerCase() === String(cond.value).toLowerCase()) return false;
            break;
          case 'contains':
            if (!String(fieldVal || '').toLowerCase().includes(String(cond.value).toLowerCase())) return false;
            break;
          case 'not_contains':
            if (String(fieldVal || '').toLowerCase().includes(String(cond.value).toLowerCase())) return false;
            break;
          case 'greater_than':
            if (Number(fieldVal) <= Number(cond.value)) return false;
            break;
          case 'less_than':
            if (Number(fieldVal) >= Number(cond.value)) return false;
            break;
          case 'date_preset': {
            if (!fieldVal) return false;
            if (cond.value === 'today' && fieldVal !== todayStr) return false;
            if (cond.value === 'overdue' && fieldVal >= todayStr) return false;
            if (cond.value === 'future' && fieldVal <= todayStr) return false;
            break;
          }
        }
      }

      return true;
    });
  }, [artists, deals, crmViewMode, searchQuery, quickPreset, filterConditions, columnFilters, selectedTagFilter, todayStr]);

  // Filtered Deals
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchArtist = (deal.artistName || '').toLowerCase().includes(query);
        const matchPlatform = (deal.platform || '').toLowerCase().includes(query);
        const matchNotes = (deal.notes || '').toLowerCase().includes(query);
        const matchAmount = String(deal.amount || '').includes(query);
        const matchDate = (deal.date || '').includes(query);

        if (!matchArtist && !matchPlatform && !matchNotes && !matchAmount && !matchDate) {
          return false;
        }
      }

      // 2. Quick Presets
      if (quickPreset === 'deals_overdue') {
        // Overdue deal / payment: date is in the past and stage is not closed/cancelled
        if (!deal.date || deal.date >= todayStr || deal.stage === 'closed' || deal.stage === 'cancelled') {
          return false;
        }
      } else if (quickPreset === 'deals_today') {
        if (deal.date !== todayStr) return false;
      } else if (quickPreset === 'deals_in_progress') {
        if (deal.stage !== 'in_progress') return false;
      } else if (quickPreset === 'deals_interested') {
        if (deal.stage !== 'interested') return false;
      } else if (quickPreset === 'deals_won') {
        if (deal.stage !== 'closed') return false;
      } else if (quickPreset === 'deals_lost') {
        if (deal.stage !== 'cancelled') return false;
      } else if (quickPreset === 'deals_high_value') {
        if ((Number(deal.amount) || 0) < 500) return false;
      } else if (quickPreset === 'hot_deals') {
        if (deal.stage !== 'in_progress' && deal.stage !== 'interested') return false;
      }

      // 3. Custom Filter Conditions
      for (const cond of filterConditions) {
        const fieldVal = (deal as any)[cond.field];

        switch (cond.operator) {
          case 'equals':
            if (String(fieldVal ?? '').toLowerCase() !== String(cond.value ?? '').toLowerCase()) return false;
            break;
          case 'not_equals':
            if (String(fieldVal ?? '').toLowerCase() === String(cond.value ?? '').toLowerCase()) return false;
            break;
          case 'contains':
            if (!String(fieldVal || '').toLowerCase().includes(String(cond.value || '').toLowerCase())) return false;
            break;
          case 'not_contains':
            if (String(fieldVal || '').toLowerCase().includes(String(cond.value || '').toLowerCase())) return false;
            break;
          case 'greater_than':
            if (Number(fieldVal || 0) <= Number(cond.value)) return false;
            break;
          case 'less_than':
            if (Number(fieldVal || 0) >= Number(cond.value)) return false;
            break;
          case 'between': {
            const num = Number(fieldVal || 0);
            const min = Number(cond.value);
            const max = cond.secondaryValue !== undefined ? Number(cond.secondaryValue) : Infinity;
            if (num < min || num > max) return false;
            break;
          }
          case 'date_preset': {
            if (!fieldVal) return false;
            if (cond.value === 'today' && fieldVal !== todayStr) return false;
            if (cond.value === 'overdue' && fieldVal >= todayStr) return false;
            if (cond.value === 'future' && fieldVal <= todayStr) return false;
            break;
          }
        }
      }

      return true;
    });
  }, [deals, searchQuery, quickPreset, filterConditions, todayStr]);

  // Stats calculation
  const stats: AppStats = useMemo(() => {
    const activeArtists = artists.filter((a) => !a.isDeleted);
    const totalArtists = activeArtists.length;
    const connectCount = activeArtists.filter((a) => a.connect === 'yes').length;
    const connectRate = totalArtists > 0 ? Math.round((connectCount / totalArtists) * 100) : 0;

    let overdueFollowups = 0;
    let todayFollowups = 0;

    activeArtists.forEach((a) => {
      if (a.followUpDate) {
        if (a.followUpDate < todayStr) overdueFollowups++;
        else if (a.followUpDate === todayStr) todayFollowups++;
      }
    });

    const totalDeals = deals.length;
    const activeDealsCount = deals.filter((d) => d.stage === 'in_progress' || d.stage === 'interested').length;
    const dealsClosedCount = deals.filter((d) => d.stage === 'closed').length;
    const dealsWinRate = totalDeals > 0 ? Math.round((dealsClosedCount / totalDeals) * 100) : 0;

    let overdueDealsCount = 0;
    let todayDealsCount = 0;
    deals.forEach((d) => {
      if (d.date && d.stage !== 'closed' && d.stage !== 'cancelled') {
        if (d.date < todayStr) overdueDealsCount++;
        else if (d.date === todayStr) todayDealsCount++;
      }
    });

    const closedRevenue = deals
      .filter((d) => d.stage === 'closed')
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    const pipelineRevenue = deals
      .filter((d) => d.stage === 'in_progress' || d.stage === 'interested')
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    return {
      totalArtists,
      connectCount,
      connectRate,
      overdueFollowups,
      todayFollowups,
      totalDeals,
      activeDealsCount,
      dealsClosedCount,
      dealsWinRate,
      overdueDealsCount,
      todayDealsCount,
      closedRevenue,
      pipelineRevenue,
    };
  }, [artists, deals, todayStr]);

  // Database Management
  const wipeDatabase = () => {
    setArtists([]);
    setDeals([]);
    setSelectedArtistIds([]);
    setActiveArtistId(null);
    setActiveDealId(null);
    localStorage.removeItem('verse_crm_artists');
    localStorage.removeItem('verse_crm_deals');
    showToast('База данных полностью очищена');
  };

  const resetToSampleData = () => {
    setArtists(initialArtists);
    setDeals(initialDeals);
    setSelectedArtistIds([]);
    showToast('Загружены демо-данные');
  };

  const importSnapshot = (newArtists: Artist[], newDeals: Deal[], mode: 'replace' | 'append' = 'replace') => {
    if (mode === 'replace') {
      setArtists(newArtists);
      setDeals(newDeals);
    } else {
      setArtists((prev) => [...prev, ...newArtists]);
      setDeals((prev) => [...prev, ...newDeals]);
    }
    showToast(`Импортировано: ${newArtists.length} артистов, ${newDeals.length} сделок`);
  };

  const importArtists = (newArtists: Artist[], mode: 'append' | 'replace' = 'append') => {
    if (mode === 'replace') {
      setArtists(newArtists);
    } else {
      setArtists((prev) => [...prev, ...newArtists]);
    }
    showToast(`Импортировано ${newArtists.length} артистов`);
  };

  const importDeals = (newDeals: Deal[], mode: 'append' | 'replace' = 'append') => {
    if (mode === 'replace') {
      setDeals(newDeals);
    } else {
      setDeals((prev) => [...prev, ...newDeals]);
    }
    showToast(`Импортировано ${newDeals.length} сделок`);
  };

  // Parser Integration State & Actions
  const [parserAccounts, setParserAccounts] = useState<ParserAccount[]>([]);
  const [stagingContacts, setStagingContacts] = useState<StagingContact[]>([]);
  const [parserStatus, setParserStatus] = useState<ParserTaskStatus>({
    isRunning: false,
    currentStep: 'idle',
    progress: 0,
    scrapedCount: 0,
    errorsCount: 0,
    totalTarget: 0,
    foundCount: 0,
    logs: [],
  });
  const [isParserSettingsOpen, setIsParserSettingsOpen] = useState(false);
  const [isImportFromParserOpen, setIsImportFromParserOpen] = useState(false);

  // Initial load from backend API
  useEffect(() => {
    const fetchInitialParserData = async () => {
      try {
        const [accRes, stagingRes, statusRes] = await Promise.all([
          fetch('/api/parser/accounts'),
          fetch('/api/parser/staging'),
          fetch('/api/parser/status'),
        ]);
        if (accRes.ok) {
          const accData = await accRes.json();
          setParserAccounts(Array.isArray(accData) ? accData : (accData?.accounts || []));
        }
        if (stagingRes.ok) {
          const stagingData = await stagingRes.json();
          setStagingContacts(Array.isArray(stagingData) ? stagingData : (stagingData?.contacts || []));
        }
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          const rawStatus = statusData?.status || statusData;
          if (rawStatus && typeof rawStatus === 'object') {
            setParserStatus((prev) => ({
              ...prev,
              ...rawStatus,
              logs: Array.isArray(rawStatus.logs) ? rawStatus.logs : (prev?.logs || []),
            }));
          }
        }
      } catch (err) {
        console.warn('Initial parser API fetch skipped or running offline:', err);
      }
    };
    fetchInitialParserData();
  }, []);

  // Live SSE connection to backend parser events
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/parser/events');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const statusObj = data.payload || data.status;
          if (data.type === 'status' && statusObj) {
            setParserStatus((prev) => ({
              ...prev,
              ...statusObj,
              logs: Array.isArray(statusObj.logs) ? statusObj.logs : (prev?.logs || []),
            }));
          } else if (data.type === 'log' && (data.payload || data.entry)) {
            const entry = data.payload || data.entry;
            setParserStatus((prev) => ({
              ...prev,
              logs: [entry, ...(prev?.logs || [])].slice(0, 250),
            }));
          } else if ((data.type === 'new_contact' || data.type === 'contact') && (data.payload || data.contact)) {
            const contact = data.payload || data.contact;
            setStagingContacts((prev) => {
              const currentList = Array.isArray(prev) ? prev : [];
              if (currentList.some((c) => c.id === contact.id)) return currentList;
              return [contact, ...currentList];
            });
          }
        } catch (e) {
          console.error('SSE JSON error:', e);
        }
      };
      eventSource.onerror = () => {
        // SSE error handled silently
      };
    } catch (err) {
      console.warn('EventSource error:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const startParserTask = async (config: ParserConfig, existingUsernames: string[] = []) => {
    try {
      const res = await fetch('/api/parser/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, existingUsernames }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to start parser');
      }
      const data = await res.json();
      const newStatus = data.status || data;
      if (newStatus && typeof newStatus === 'object') {
        setParserStatus((prev) => ({
          ...prev,
          ...newStatus,
          logs: Array.isArray(newStatus.logs) ? newStatus.logs : (prev?.logs || []),
        }));
      }
      showToast(t.parserStartedToast);
    } catch (err: any) {
      showToast(err.message || 'Ошибка запуска парсера', 'error');
    }
  };

  const stopParserTask = async () => {
    try {
      const res = await fetch('/api/parser/stop', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const newStatus = data.status || data;
        if (newStatus && typeof newStatus === 'object') {
          setParserStatus((prev) => ({
            ...prev,
            ...newStatus,
            logs: Array.isArray(newStatus.logs) ? newStatus.logs : (prev?.logs || []),
          }));
        }
        showToast(t.parserStoppedToast, 'info');
      }
    } catch (err: any) {
      showToast('Ошибка остановки парсера', 'error');
    }
  };

  const authenticateParserAccount = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/parser/accounts/${id}/auth`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setParserAccounts((prev) => {
          const list = Array.isArray(prev) ? prev : [];
          return list.map((acc) =>
            acc.id === id ? { ...acc, status: 'active', lastActive: new Date().toISOString() } : acc
          );
        });
        showToast(t.authSuccessToast);
        return true;
      } else {
        setParserAccounts((prev) => {
          const list = Array.isArray(prev) ? prev : [];
          return list.map((acc) => (acc.id === id ? { ...acc, status: 'error' } : acc));
        });
        showToast(data.message || t.authFailedToast, 'error');
        return false;
      }
    } catch (err: any) {
      showToast(t.authFailedToast, 'error');
      return false;
    }
  };

  const saveParserAccount = async (accountData: Partial<ParserAccount>) => {
    try {
      const res = await fetch('/api/parser/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData),
      });
      if (res.ok) {
        const resData = await res.json();
        const savedAccount: ParserAccount = resData.account || resData;
        if (savedAccount && savedAccount.id) {
          setParserAccounts((prev) => {
            const list = Array.isArray(prev) ? prev : [];
            const index = list.findIndex((a) => a.id === savedAccount.id);
            if (index >= 0) {
              const copy = [...list];
              copy[index] = savedAccount;
              return copy;
            }
            return [...list, savedAccount];
          });
          showToast(t.accountSavedToast);
        }
      }
    } catch (err) {
      showToast('Ошибка сохранения аккаунта', 'error');
    }
  };

  const deleteParserAccount = async (id: string) => {
    try {
      const res = await fetch(`/api/parser/accounts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setParserAccounts((prev) => {
          const list = Array.isArray(prev) ? prev : [];
          return list.filter((a) => a.id !== id);
        });
        showToast(t.accountDeletedToast);
      }
    } catch (err) {
      showToast('Ошибка удаления аккаунта', 'error');
    }
  };

  const excludeStagingContact = async (id: string) => {
    try {
      await fetch(`/api/parser/staging/${id}`, { method: 'DELETE' });
      setStagingContacts((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        return list.filter((c) => c.id !== id);
      });
      showToast(t.contactExcludedToast);
    } catch (err) {
      setStagingContacts((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        return list.filter((c) => c.id !== id);
      });
    }
  };

  const clearStagingContacts = async () => {
    try {
      await fetch('/api/parser/staging/clear', { method: 'POST' });
      setStagingContacts([]);
      showToast(t.stagingClearedToast);
    } catch (err) {
      setStagingContacts([]);
    }
  };

  const importStagingToCrm = async (stagingIds: string[]) => {
    const selected = stagingContacts.filter((c) => stagingIds.includes(c.id));
    if (selected.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const newArtistsToAdd: Artist[] = selected.map((contact) => ({
      id: `art-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: contact.name || contact.username,
      instagram: contact.instagramUrl || `https://instagram.com/${contact.username}`,
      email: contact.email || '',
      phone: contact.phone || '',
      telegram: contact.telegram || '',
      discord: '',
      notes: contact.bio ? `Парсер Instagram: ${contact.bio}` : 'Импортировано из локального парсера',
      connect: 'no',
      types: ['Парсер', ...(contact.tags || [])],
      sales: 'no',
      status: 'active',
      demoStatus: 'none',
      touches: 0,
      reaction: 'none',
      lastContactDate: today,
      followUpDate: today,
      isDeleted: false,
      createdAt: today,
      updatedAt: today,
    }));

    setArtists((prev) => [...prev, ...newArtistsToAdd]);

    try {
      await fetch('/api/parser/staging/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: stagingIds }),
      });
      setStagingContacts((prev) =>
        prev.map((c) => (stagingIds.includes(c.id) ? { ...c, status: 'imported' } : c))
      );
    } catch (err) {
      console.warn('Import API call error:', err);
    }

    showToast(t.importSuccessToast(selected.length));
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        t,
        activeTab,
        setActiveTab,
        theme,
        setTheme,
        toggleTheme,
        currency,
        setCurrency,
        toggleCurrency,
        exchangeRate,
        setExchangeRate,
        formatMoney,
        currencySymbol,
        artists,
        deals,
        customOptions,
        addCustomOption,
        updateCustomOption,
        deleteCustomOption,
        resetCustomOptions,
        addArtist,
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
        addDeal,
        updateDeal,
        deleteDeal,
        reorderDeals,
        searchQuery,
        setSearchQuery,
        quickPreset,
        setQuickPreset,
        filterConditions,
        addFilterCondition,
        removeFilterCondition,
        updateFilterCondition,
        clearAllFilters,
        columnFilters,
        setColumnFilter,
        clearColumnFilter,
        clearAllColumnFilters,
        selectedTagFilter,
        setSelectedTagFilter,
        filteredArtists,
        filteredDeals,
        stats,
        activeArtistId,
        setActiveArtistId,
        activeDealId,
        setActiveDealId,
        selectedArtistIds,
        toggleArtistSelection,
        selectAllFilteredArtists,
        clearArtistSelection,
        bulkUpdateArtists,
        bulkDeleteArtists,
        selectedDealIds,
        toggleDealSelection,
        selectAllFilteredDeals,
        clearDealSelection,
        bulkUpdateDeals,
        bulkDeleteDeals,
        parserAccounts,
        stagingContacts,
        parserStatus,
        isParserSettingsOpen,
        setIsParserSettingsOpen,
        isImportFromParserOpen,
        setIsImportFromParserOpen,
        startParserTask,
        stopParserTask,
        authenticateParserAccount,
        saveParserAccount,
        deleteParserAccount,
        excludeStagingContact,
        clearStagingContacts,
        importStagingToCrm,
        toast,
        showToast,
        hideToast,
        isSettingsOpen,
        setIsSettingsOpen,
        isImportExportOpen,
        setIsImportExportOpen,
        isNewArtistModalOpen,
        setIsNewArtistModalOpen,
        isNewDealModalOpen,
        setIsNewDealModalOpen,
        wipeDatabase,
        resetToSampleData,
        importSnapshot,
        importArtists,
        importDeals,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
