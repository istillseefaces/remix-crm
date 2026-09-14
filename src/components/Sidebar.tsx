import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Briefcase,
  Download,
  Settings as SettingsIcon,
  BarChart3,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsSettingsOpen,
    setIsImportExportOpen,
    artists,
    deals,
    stats,
    stagingContacts,
    lang,
    setLang,
    theme,
    toggleTheme,
    formatMoney,
    t,
  } = useApp();

  const isLight = theme === 'light';

  return (
    <aside
      className={`w-64 border-r flex flex-col shrink-0 select-none z-20 transition-colors duration-150 ${
        isLight
          ? 'bg-[#FFFFFF] border-black/[0.06] text-[#1A1A1E]'
          : 'bg-[#111113] border-white/[0.04] text-white'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`p-5 flex items-center justify-between border-b ${
          isLight ? 'border-black/[0.06]' : 'border-white/[0.04]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-black tracking-tighter text-xs">
            YX
          </div>
          <div>
            <span
              className={`font-bold tracking-tight text-sm flex items-center gap-1.5 ${
                isLight ? 'text-[#1A1A1E]' : 'text-white'
              }`}
            >
              YX CRM
            </span>
            <span
              className={`text-[10px] font-mono block ${
                isLight ? 'text-zinc-500' : 'text-white/40'
              }`}
            >
              Music Producer Suite
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Language Toggle */}
          <button
            onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border transition cursor-pointer ${
              isLight
                ? 'bg-[#F1F3F5] hover:bg-black/[0.06] text-zinc-700 border-black/[0.08]'
                : 'bg-[#18181C] hover:bg-white/[0.08] text-zinc-400 hover:text-white border-white/[0.06]'
            }`}
            title="Switch Language (RU / EN)"
          >
            {lang.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {/* Group 1: Workspace Modules */}
        <div className="space-y-1">
          <div
            className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] ${
              isLight ? 'text-zinc-400' : 'text-white/30'
            }`}
          >
            Workspace
          </div>

          {/* Artists Nav Button */}
          <button
            onClick={() => setActiveTab('artists')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'artists'
                ? isLight
                  ? 'bg-indigo-50 border border-indigo-200/80 text-indigo-900 shadow-xs'
                  : 'bg-white/[0.06] border border-white/[0.08] text-white shadow-sm'
                : isLight
                ? 'text-zinc-600 hover:text-black hover:bg-black/[0.03] border border-transparent'
                : 'text-white/60 hover:text-white hover:bg-white/[0.02] border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users
                className={`w-4 h-4 ${
                  activeTab === 'artists'
                    ? isLight
                      ? 'text-indigo-600'
                      : 'text-indigo-400'
                    : 'opacity-70'
                }`}
              />
              <span>{t.artistsTab}</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                isLight ? 'bg-black/[0.05] text-zinc-700' : 'bg-white/[0.06] text-white/70'
              }`}
            >
              {artists.length}
            </span>
          </button>

          {/* Deals Nav Button */}
          <button
            onClick={() => setActiveTab('deals')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'deals'
                ? isLight
                  ? 'bg-cyan-50 border border-cyan-200/80 text-cyan-900 shadow-xs'
                  : 'bg-white/[0.06] border border-white/[0.08] text-white shadow-sm'
                : isLight
                ? 'text-zinc-600 hover:text-black hover:bg-black/[0.03] border border-transparent'
                : 'text-white/60 hover:text-white hover:bg-white/[0.02] border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Briefcase
                className={`w-4 h-4 ${
                  activeTab === 'deals'
                    ? isLight
                      ? 'text-cyan-600'
                      : 'text-cyan-400'
                    : 'opacity-70'
                }`}
              />
              <span>{t.dealsTab}</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                isLight ? 'bg-black/[0.05] text-zinc-700' : 'bg-white/[0.06] text-white/70'
              }`}
            >
              {deals.length}
            </span>
          </button>

          {/* Analytics / Statistics Nav Button */}
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? isLight
                  ? 'bg-pink-50 border border-pink-200/80 text-pink-900 shadow-xs'
                  : 'bg-white/[0.06] border border-white/[0.08] text-white shadow-sm'
                : isLight
                ? 'text-zinc-600 hover:text-black hover:bg-black/[0.03] border border-transparent'
                : 'text-white/60 hover:text-white hover:bg-white/[0.02] border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BarChart3
                className={`w-4 h-4 ${
                  activeTab === 'analytics'
                    ? isLight
                      ? 'text-pink-600'
                      : 'text-pink-400'
                    : 'opacity-70'
                }`}
              />
              <span>{t.analyticsTab}</span>
            </div>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                isLight
                  ? 'bg-pink-100 text-pink-800 border-pink-300'
                  : 'bg-pink-500/15 text-pink-300 border-pink-500/30'
              }`}
            >
              Charts
            </span>
          </button>

          {/* Parser Nav Button */}
          <button
            onClick={() => setActiveTab('parser')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'parser'
                ? isLight
                  ? 'bg-purple-50 border border-purple-200/80 text-purple-900 shadow-xs'
                  : 'bg-white/[0.06] border border-white/[0.08] text-white shadow-sm'
                : isLight
                ? 'text-zinc-600 hover:text-black hover:bg-black/[0.03] border border-transparent'
                : 'text-white/60 hover:text-white hover:bg-white/[0.02] border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles
                className={`w-4 h-4 ${
                  activeTab === 'parser'
                    ? isLight
                      ? 'text-purple-600'
                      : 'text-purple-400'
                    : 'opacity-70'
                }`}
              />
              <span>{t.parserTab}</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-300'
              }`}
            >
              {stagingContacts.length}
            </span>
          </button>
        </div>

        {/* Group 2: Quick Metrics Preview */}
        <div className="space-y-1">
          <div
            className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] ${
              isLight ? 'text-zinc-400' : 'text-white/30'
            }`}
          >
            Quick KPIs
          </div>

          <div
            className={`px-3 py-2 rounded-lg border space-y-2 text-xs ${
              isLight
                ? 'bg-[#F8F9FA] border-black/[0.06]'
                : 'bg-black/20 border-white/[0.03]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                {t.statConnectRate}
              </span>
              <span className={`font-mono font-semibold ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
                {stats.connectRate}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                {t.statPipelineRevenue}
              </span>
              <span className={`font-mono font-semibold ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                {formatMoney(stats.pipelineRevenue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                {t.statClosedRevenue}
              </span>
              <span className={`font-mono font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                {formatMoney(stats.closedRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Group 3: Management */}
        <div className="space-y-1">
          <div
            className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] ${
              isLight ? 'text-zinc-400' : 'text-white/30'
            }`}
          >
            Management
          </div>

          {/* Import / Export Button */}
          <button
            onClick={() => setIsImportExportOpen(true)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors border border-transparent cursor-pointer ${
              isLight
                ? 'text-zinc-600 hover:text-black hover:bg-black/[0.03]'
                : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Download className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400 opacity-70'}`} />
              <span>{t.exportImport}</span>
            </div>
            <span className={`text-[10px] font-mono ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
              .xlsx/.csv
            </span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors border border-transparent cursor-pointer ${
              isLight
                ? 'text-zinc-600 hover:text-black hover:bg-black/[0.03]'
                : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <SettingsIcon className={`w-4 h-4 ${isLight ? 'text-zinc-500' : 'text-zinc-400 opacity-70'}`} />
              <span>{t.settings}</span>
            </div>
          </button>
        </div>
      </nav>

      {/* Sidebar Footer Database Status */}
      <div className={`p-4 border-t ${isLight ? 'border-black/[0.06]' : 'border-white/[0.04]'}`}>
        <div
          className={`p-3 rounded-xl border text-xs ${
            isLight
              ? 'bg-[#F8F9FA] border-black/[0.06]'
              : 'bg-[#18181C] border-white/[0.04]'
          }`}
        >
          <div
            className={`mb-1.5 text-[10px] font-semibold uppercase tracking-wider ${
              isLight ? 'text-zinc-400' : 'text-white/40'
            }`}
          >
            Database Status
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" />
              <span className={`font-medium text-[11px] ${isLight ? 'text-zinc-800' : 'text-white/90'}`}>
                YX Engine: Active
              </span>
            </div>
            <span className={`text-[10px] font-mono ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {artists.length + deals.length} rec
            </span>
          </div>
        </div>

        {/* App Version */}
        <div className="mt-2.5 flex items-center justify-center">
          <span
            className={`text-[10px] font-mono tracking-wider select-none transition-colors ${
              isLight ? 'text-zinc-400 hover:text-zinc-600' : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            v1.3.0
          </span>
        </div>
      </div>
    </aside>
  );
};
