import { AnimatePresence } from 'motion/react';
import { NativeBackdrop, NativePanel } from './NativeMotion';
import React, { useState } from 'react';
import { X, Play, Square, Settings2, Sliders, Shield, Users, Radio } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ParserConfig } from '../types';

interface ParserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParserSettingsModal: React.FC<ParserSettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    t,
    theme,
    parserAccounts,
    parserStatus,
    startParserTask,
    stopParserTask,
    artists,
  } = useApp();

  const isLight = theme === 'light';
  const accounts = Array.isArray(parserAccounts) ? parserAccounts : [];

  // Config form state with robust defaults
  const [config, setConfig] = useState<ParserConfig>(() => ({
    accountId: accounts[0]?.id || '',
    targets: 'fastfoodmusic, theflowru, beatstars, genius_russia',
    scrapeProfiles: true,
    scrapeStories: true,
    scrapePosts: true,
    scrapeFollowers: false,
    audiencePriority: 'artists_only',
    minFollowers: 1000,
    maxFollowers: 250000,
    skipCrmProfiles: true,
    searchNewMedia: true,
    searchNewOldAccounts: false,
  }));



  const handleStart = () => {
    const existingUsernames = artists.map((a) => a.instagram || a.name).filter(Boolean);
    startParserTask(config, existingUsernames);
    onClose();
  };

  const handleStop = () => {
    stopParserTask();
  };

  return <AnimatePresence>{isOpen && (
    <NativeBackdrop className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <NativePanel
        className={`studio-dialog w-full max-w-2xl rounded-2xl shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden ${
          isLight
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-[var(--surface)] border-white/10 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">{t.parserSettings}</h2>
              <p className="text-xs text-zinc-400">{t.parserSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* 1. Account Selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-300 block">{t.selectAccountForParser}</label>
            <select
              value={config.accountId}
              onChange={(e) => setConfig({ ...config, accountId: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl border transition outline-none ${
                isLight
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-900 focus:border-indigo-500'
                  : 'bg-[var(--surface-secondary)] border-white/10 text-white focus:border-indigo-500'
              }`}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  @{acc.username} ({acc.status === 'active' ? '🟢 Активен' : '🟡 Требуется авторизация'})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Target Donors */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-300 block">{t.targetDonors}</label>
            <textarea
              rows={3}
              placeholder={t.targetsPlaceholder}
              value={config.targets}
              onChange={(e) => setConfig({ ...config, targets: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl border transition outline-none resize-none ${
                isLight
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-900 focus:border-indigo-500'
                  : 'bg-[var(--surface-secondary)] border-white/10 text-white focus:border-indigo-500'
              }`}
            />
            <span className="text-[11px] text-zinc-400">
              Укажите никнеймы крупных медиа, конкурентов или фестивалей. Парсер проанализирует отметки и связи.
            </span>
          </div>

          {/* 3. What to Scrape */}
          <div className="space-y-2">
            <label className="font-semibold text-zinc-300 block">{t.whatToScrape}</label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { key: 'scrapeProfiles', label: t.scrapeProfiles },
                { key: 'scrapeStories', label: t.scrapeStories },
                { key: 'scrapePosts', label: t.scrapePosts },
                { key: 'scrapeFollowers', label: t.scrapeFollowers },
              ].map((item) => (
                <label
                  key={item.key}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                    isLight ? 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100' : 'bg-[var(--canvas)] border-white/5 hover:bg-white/5'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(config as any)[item.key]}
                    onChange={(e) => setConfig({ ...config, [item.key]: e.target.checked })}
                    className="rounded accent-indigo-500 w-4 h-4"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Audience Priority */}
          <div className="space-y-2">
            <label className="font-semibold text-zinc-300 block">{t.audiencePriority}</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'artists_only', label: t.artistsOnly },
                { val: 'producers_only', label: t.producersOnly },
                { val: 'all', label: t.allAudience },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setConfig({ ...config, audiencePriority: item.val as any })}
                  className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer ${
                    config.audiencePriority === item.val
                      ? 'bg-indigo-600 border-indigo-500 text-white font-medium shadow-sm'
                      : isLight
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      : 'bg-[var(--canvas)] border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Followers Range */}
          <div className="space-y-2">
            <label className="font-semibold text-zinc-300 block">{t.followersRange}</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-1">
                <span className="text-[11px] text-zinc-400">{t.minFollowers}</span>
                <input
                  type="number"
                  value={config.minFollowers}
                  onChange={(e) => setConfig({ ...config, minFollowers: Number(e.target.value) })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                    isLight ? 'bg-zinc-100 border-zinc-300' : 'bg-[var(--surface-secondary)] border-white/10'
                  }`}
                />
              </div>
              <span className="text-zinc-500 pt-5">—</span>
              <div className="flex-1 space-y-1">
                <span className="text-[11px] text-zinc-400">{t.maxFollowers}</span>
                <input
                  type="number"
                  value={config.maxFollowers}
                  onChange={(e) => setConfig({ ...config, maxFollowers: Number(e.target.value) })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                    isLight ? 'bg-zinc-100 border-zinc-300' : 'bg-[var(--surface-secondary)] border-white/10'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* 6. Memory & Duplicates */}
          <div className="space-y-2">
            <label className="font-semibold text-zinc-300 block">{t.memoryAndDuplicates}</label>
            <div className="space-y-2">
              {[
                { key: 'skipCrmProfiles', label: t.skipCrmProfiles },
                { key: 'searchNewMedia', label: t.searchNewMedia },
                { key: 'searchNewOldAccounts', label: t.searchNewOldAccounts },
              ].map((item) => (
                <label
                  key={item.key}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition ${
                    isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[var(--canvas)] border-white/5'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(config as any)[item.key]}
                    onChange={(e) => setConfig({ ...config, [item.key]: e.target.checked })}
                    className="rounded accent-indigo-500 w-4 h-4"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-black/10">
          <div className="text-[11px] text-zinc-400 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                parserStatus.isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
              }`}
            />
            <span>{parserStatus.isRunning ? parserStatus.currentStep : 'Готов к запуску'}</span>
          </div>

          <div className="flex items-center gap-2.5">
            {parserStatus.isRunning ? (
              <button
                type="button"
                onClick={handleStop}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium transition cursor-pointer shadow-lg shadow-rose-600/20"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>{t.stopParser}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStart}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{t.startParser}</span>
              </button>
            )}
          </div>
        </div>
      </NativePanel>
    </NativeBackdrop>
  )}</AnimatePresence>;
};
