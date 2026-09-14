import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Plus,
  Settings as SettingsIcon,
  Download,
  BarChart3,
  Sun,
  Moon,
} from 'lucide-react';

export const MainHeader: React.FC = () => {
  const {
    activeTab,
    searchQuery,
    setSearchQuery,
    setIsNewArtistModalOpen,
    setIsNewDealModalOpen,
    setIsSettingsOpen,
    setIsImportExportOpen,
    theme,
    toggleTheme,
    currency,
    setCurrency,
    t,
  } = useApp();

  const isLight = theme === 'light';

  const getTitle = () => {
    if (activeTab === 'artists') return t.artistsTab;
    if (activeTab === 'deals') return t.dealsTab;
    return t.analyticsTab;
  };

  return (
    <header
      className={`h-14 sm:h-16 max-h-16 border-b flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-10 select-none transition-colors duration-150 ${
        isLight
          ? 'bg-[#F8F9FA]/90 backdrop-blur-xl border-black/[0.06]'
          : 'bg-[#0C0C0E]/80 backdrop-blur-xl border-white/[0.04]'
      }`}
    >
      {/* Left: View Title & Search Input */}
      <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 min-w-0">
        <h2
          className={`text-base lg:text-lg font-semibold tracking-tight whitespace-nowrap flex items-center gap-2 ${
            isLight ? 'text-[#1A1A1E]' : 'text-white'
          }`}
        >
          {activeTab === 'analytics' && <BarChart3 className="w-5 h-5 text-pink-400 shrink-0" />}
          <span className="truncate">{getTitle()}</span>
        </h2>

        {/* Global Search Bar (shown for artists and deals) */}
        {activeTab !== 'analytics' && (
          <div className="relative hidden sm:block">
            <Search
              className={`w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                isLight ? 'text-zinc-400' : 'text-white/30'
              }`}
            />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`h-9 rounded-full py-1.5 pl-9 pr-12 text-xs w-48 md:w-64 lg:w-80 focus:outline-none transition-all ${
                isLight
                  ? 'bg-[#F1F3F5] border border-black/[0.06] text-[#1A1A1E] placeholder:text-zinc-400 focus:border-black/25 focus:bg-white'
                  : 'bg-[#18181C] border border-white/[0.04] text-white placeholder:text-white/25 focus:border-white/20'
              }`}
            />
            <div
              className={`absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono pointer-events-none ${
                isLight
                  ? 'bg-black/[0.04] text-zinc-500 border border-black/[0.04]'
                  : 'bg-[#111113] text-zinc-500 border border-white/[0.04]'
              }`}
            >
              /
            </div>
          </div>
        )}
      </div>

      {/* Right: Currency Selector, Theme Toggle, Primary Action & Settings */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Currency Switcher: [ $ USD ] / [ ₸ KZT ] */}
        <div
          className={`h-9 flex items-center p-0.5 rounded-full border text-xs font-mono select-none ${
            isLight
              ? 'bg-black/[0.03] border-black/[0.06]'
              : 'bg-[#18181C] border-white/[0.06]'
          }`}
        >
          <button
            id="currency-usd-btn"
            onClick={() => setCurrency('USD')}
            className={`h-7 px-2.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center ${
              currency === 'USD'
                ? isLight
                  ? 'bg-white text-black shadow-xs font-bold'
                  : 'bg-white text-black shadow-xs font-bold'
                : isLight
                ? 'text-zinc-500 hover:text-black'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="USD ($)"
          >
            $ USD
          </button>
          <button
            id="currency-kzt-btn"
            onClick={() => setCurrency('KZT')}
            className={`h-7 px-2.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center ${
              currency === 'KZT'
                ? isLight
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'bg-emerald-500 text-black shadow-xs font-bold'
                : isLight
                ? 'text-zinc-500 hover:text-black'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="KZT (₸)"
          >
            ₸ KZT
          </button>
        </div>

        {/* Theme Switcher Toggle Button (☀️ / 🌙) */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          className={`h-9 w-9 flex items-center justify-center rounded-full border transition-all cursor-pointer active:scale-95 ${
            isLight
              ? 'bg-black/[0.03] border-black/[0.06] text-amber-600 hover:text-amber-700 hover:bg-black/[0.06]'
              : 'bg-[#18181C] border-white/[0.04] text-zinc-400 hover:text-amber-300 hover:bg-white/5'
          }`}
          title={isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
          aria-label="Toggle theme"
        >
          {isLight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Solid Pill Primary Action Button */}
        {activeTab === 'artists' && (
          <button
            id="add-artist-primary-btn"
            onClick={() => setIsNewArtistModalOpen(true)}
            className={`h-9 px-3.5 sm:px-4 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer shrink-0 ${
              isLight
                ? 'bg-black text-white hover:bg-black/90'
                : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t.addArtist}</span>
            <kbd
              className={`hidden sm:inline px-1 py-0.2 rounded text-[9px] font-mono ${
                isLight ? 'bg-white/20 text-white/80' : 'bg-black/10 text-black/60'
              }`}
            >
              ⌘N
            </kbd>
          </button>
        )}

        {activeTab === 'deals' && (
          <button
            id="add-deal-primary-btn"
            onClick={() => setIsNewDealModalOpen(true)}
            className={`h-9 px-3.5 sm:px-4 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer shrink-0 ${
              isLight
                ? 'bg-black text-white hover:bg-black/90'
                : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t.addDeal}</span>
            <kbd
              className={`hidden sm:inline px-1 py-0.2 rounded text-[9px] font-mono ${
                isLight ? 'bg-white/20 text-white/80' : 'bg-black/10 text-black/60'
              }`}
            >
              ⌘N
            </kbd>
          </button>
        )}

        {activeTab === 'analytics' && (
          <button
            id="add-artist-analytics-btn"
            onClick={() => setIsNewArtistModalOpen(true)}
            className={`h-9 px-3.5 sm:px-4 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer shrink-0 ${
              isLight
                ? 'bg-black text-white hover:bg-black/90'
                : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t.addArtist}</span>
          </button>
        )}

        {/* Quick Export/Import Icon Button */}
        <button
          id="export-import-btn"
          onClick={() => setIsImportExportOpen(true)}
          className={`h-9 w-9 flex items-center justify-center rounded-full border transition-colors cursor-pointer ${
            isLight
              ? 'bg-black/[0.03] border-black/[0.06] text-zinc-600 hover:text-black hover:bg-black/[0.06]'
              : 'bg-[#18181C] border-white/[0.04] text-white/60 hover:text-white hover:bg-white/5'
          }`}
          title={t.exportImport}
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* Settings Icon Button */}
        <button
          id="settings-btn"
          onClick={() => setIsSettingsOpen(true)}
          className={`h-9 w-9 flex items-center justify-center rounded-full border transition-colors cursor-pointer ${
            isLight
              ? 'bg-black/[0.03] border-black/[0.06] text-zinc-600 hover:text-black hover:bg-black/[0.06]'
              : 'bg-[#18181C] border-white/[0.04] text-white/60 hover:text-white hover:bg-white/5'
          }`}
          title={t.settings}
        >
          <SettingsIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
