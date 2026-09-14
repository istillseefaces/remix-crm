import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Briefcase,
  Settings as SettingsIcon,
  Download,
  Plus,
  Search,
  Sparkles,
  Command,
} from 'lucide-react';

export const MacTitleBar: React.FC = () => {
  const {
    t,
    lang,
    setLang,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    setIsSettingsOpen,
    setIsImportExportOpen,
    setIsNewArtistModalOpen,
    setIsNewDealModalOpen,
    artists,
    deals,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-[#0C0C0E]/95 backdrop-blur-md border-b border-white/[0.06] select-none">
      {/* Top macOS App Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04] text-xs">
        <div className="flex items-center gap-3">
          {/* macOS window control buttons */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56] hover:opacity-80 transition cursor-pointer shadow-inner" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:opacity-80 transition cursor-pointer shadow-inner" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F] hover:opacity-80 transition cursor-pointer shadow-inner" />
          </div>

          <div className="h-3.5 w-[1px] bg-white/[0.08]" />

          {/* Verse Logo & Version */}
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-widest text-sm text-white font-mono flex items-center gap-1.5">
              <span className="text-emerald-400 text-base">✦</span> VERSE CRM
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.05] text-zinc-400 font-mono border border-white/[0.04]">
              v4.0.0
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md mx-6">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-zinc-500 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-8 pr-12 py-1.5 bg-[#18181C] hover:bg-[#1C1C22] focus:bg-[#18181C] text-xs text-zinc-200 placeholder-zinc-500 rounded-lg border border-white/[0.06] focus:border-emerald-500/40 focus:outline-none transition"
            />
            <div className="absolute right-2.5 flex items-center gap-1 px-1.5 py-0.5 bg-[#111113] rounded text-[10px] text-zinc-500 font-mono border border-white/[0.04] pointer-events-none">
              <Command className="w-2.5 h-2.5" />
              <span>/</span>
            </div>
          </div>
        </div>

        {/* Right Tools: Lang, Export/Import, Settings */}
        <div className="flex items-center gap-2">
          {/* Quick Language Toggle */}
          <button
            id="lang-toggle-btn"
            onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
            className="px-2 py-1 rounded-md bg-[#18181C] hover:bg-[#202026] text-[11px] font-medium text-zinc-300 border border-white/[0.06] transition flex items-center gap-1"
            title="Toggle Language (RU / EN)"
          >
            <span className={lang === 'ru' ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>RU</span>
            <span className="text-zinc-600">/</span>
            <span className={lang === 'en' ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>EN</span>
          </button>

          {/* Import / Export */}
          <button
            id="export-import-btn"
            onClick={() => setIsImportExportOpen(true)}
            className="px-2.5 py-1 rounded-md bg-[#18181C] hover:bg-[#202026] text-xs text-zinc-300 border border-white/[0.06] transition flex items-center gap-1.5"
            title={t.exportImport}
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">{t.exportImport}</span>
          </button>

          {/* Settings Modal */}
          <button
            id="settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-md bg-[#18181C] hover:bg-[#202026] text-zinc-300 border border-white/[0.06] transition"
            title={t.settings}
          >
            <SettingsIcon className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Navigation Subheader: Tabs & Add Action */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Main Tabs */}
        <div className="flex items-center gap-1 bg-[#111113] p-1 rounded-lg border border-white/[0.06]">
          <button
            id="tab-artists-btn"
            onClick={() => setActiveTab('artists')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'artists'
                ? 'bg-[#1C1C22] text-white shadow-sm border border-white/[0.08]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.artistsTab}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/[0.06] text-zinc-400 font-mono">
              {artists.length}
            </span>
          </button>

          <button
            id="tab-deals-btn"
            onClick={() => setActiveTab('deals')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'deals'
                ? 'bg-[#1C1C22] text-white shadow-sm border border-white/[0.08]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.dealsTab}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/[0.06] text-zinc-400 font-mono">
              {deals.length}
            </span>
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2">
          {activeTab === 'artists' ? (
            <button
              id="add-artist-primary-btn"
              onClick={() => setIsNewArtistModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 text-xs font-medium rounded-lg border border-emerald-500/30 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addArtist}</span>
              <kbd className="hidden md:inline px-1 bg-emerald-950/60 rounded text-[10px] font-mono text-emerald-400/80 border border-emerald-500/20">
                ⌘N
              </kbd>
            </button>
          ) : (
            <button
              id="add-deal-primary-btn"
              onClick={() => setIsNewDealModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 hover:text-cyan-200 text-xs font-medium rounded-lg border border-cyan-500/30 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addDeal}</span>
              <kbd className="hidden md:inline px-1 bg-cyan-950/60 rounded text-[10px] font-mono text-cyan-400/80 border border-cyan-500/20">
                ⌘N
              </kbd>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
