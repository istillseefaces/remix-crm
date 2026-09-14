import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Globe,
  Database,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle,
  Sun,
  Moon,
  DollarSign,
  SlidersHorizontal,
  Plus,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { exportToJsonFile, parseImportFile } from '../utils/exportUtils';
import { ConfirmModal } from './ConfirmModal';
import { OptionManager } from './OptionManager';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    lang,
    setLang,
    theme,
    setTheme,
    currency,
    setCurrency,
    exchangeRate,
    setExchangeRate,
    t,
    artists,
    deals,
    wipeDatabase,
    resetToSampleData,
    importSnapshot,
    showToast,
  } = useApp();

  const isLight = theme === 'light';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings active section tab
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'options'>('general');

  // Modal confirmations
  const [isWipeConfirmOpen, setIsWipeConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Local exchange rate input state
  const [localRate, setLocalRate] = useState<string>(String(exchangeRate));

  if (!isSettingsOpen) return null;

  const handleBackup = () => {
    exportToJsonFile(artists, deals);
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await parseImportFile(file);
      if (result.type === 'snapshot' && result.artists && result.deals) {
        importSnapshot(result.artists, result.deals);
      } else if (result.artists) {
        importSnapshot(result.artists, deals);
      }
    } catch (err) {
      console.error('Error parsing backup file:', err);
    }
    e.target.value = '';
  };

  const handleRateChange = (val: string) => {
    setLocalRate(val);
    const num = Number(val);
    if (num > 0) {
      setExchangeRate(num);
    }
  };

  const confirmWipe = () => {
    wipeDatabase();
    setIsWipeConfirmOpen(false);
  };

  const confirmResetDemo = () => {
    resetToSampleData();
    setIsResetConfirmOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
        <div
          className={`w-full max-w-xl border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 transition-colors flex flex-col max-h-[90vh] ${
            isLight
              ? 'bg-white border-black/[0.08] text-[#1A1A1E]'
              : 'bg-[#111113] border-white/[0.08] text-white'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Navigation Tabs */}
          <div
            className={`px-6 py-3 border-b flex items-center justify-between shrink-0 ${
              isLight ? 'bg-[#F8F9FA] border-black/[0.06]' : 'bg-[#141418] border-white/[0.06]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-semibold text-sm">
                <span className="text-emerald-500 font-mono">✦</span>
                <span>{t.settingsTitle}</span>
              </div>

              {/* Navigation Pill Tabs */}
              <div
                className={`flex items-center p-0.5 rounded-lg border text-xs ${
                  isLight ? 'bg-black/[0.03] border-black/[0.06]' : 'bg-white/[0.04] border-white/[0.06]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveSettingsTab('general')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                    activeSettingsTab === 'general'
                      ? isLight
                        ? 'bg-white text-black shadow-xs font-bold'
                        : 'bg-[#1F1F26] text-white shadow-xs font-bold'
                      : isLight
                      ? 'text-zinc-500 hover:text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {lang === 'ru' ? 'Общие' : 'General'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSettingsTab('options')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    activeSettingsTab === 'options'
                      ? isLight
                        ? 'bg-white text-black shadow-xs font-bold'
                        : 'bg-[#1F1F26] text-white shadow-xs font-bold'
                      : isLight
                      ? 'text-zinc-500 hover:text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>{lang === 'ru' ? 'Справочники' : 'Options'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                isLight
                  ? 'hover:bg-black/[0.06] text-zinc-500 hover:text-black'
                  : 'hover:bg-white/[0.08] text-zinc-400 hover:text-white'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Hidden File Input for JSON restore */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          {/* Body content */}
          <div className="p-6 space-y-6 text-xs overflow-y-auto flex-1 min-h-0">
            {activeSettingsTab === 'general' ? (
              <>
                {/* Section 1: Appearance Theme (Verse Light / Verse Dark) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-semibold">
                    {isLight ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                    <span>{t.themeSection}</span>
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {t.themeDesc}
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300 ring-1 ring-indigo-500/30 font-bold'
                          : isLight
                          ? 'bg-[#F1F3F5] border-black/[0.06] text-zinc-700 hover:bg-black/[0.04]'
                          : 'bg-[#18181C] border-white/[0.06] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-indigo-400" />
                        <span>{t.themeDark}</span>
                      </div>
                      {theme === 'dark' && <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                        theme === 'light'
                          ? 'bg-amber-50 border-amber-400 text-amber-900 ring-1 ring-amber-400/50 font-bold'
                          : isLight
                          ? 'bg-[#F1F3F5] border-black/[0.06] text-zinc-700 hover:bg-black/[0.04]'
                          : 'bg-[#18181C] border-white/[0.06] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-amber-600" />
                        <span>{t.themeLight}</span>
                      </div>
                      {theme === 'light' && <CheckCircle className="w-3.5 h-3.5 text-amber-600" />}
                    </button>
                  </div>
                </div>

                <div className={`h-[1px] ${isLight ? 'bg-black/[0.06]' : 'bg-white/[0.06]'}`} />

                {/* Section 2: Multicurrency (USD ↔ KZT) & Exchange Rate */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span>{t.currencySection}</span>
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {t.currencyDesc}
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setCurrency('USD')}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                        currency === 'USD'
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 ring-1 ring-emerald-500/30 font-bold'
                          : isLight
                          ? 'bg-[#F1F3F5] border-black/[0.06] text-zinc-700 hover:bg-black/[0.04]'
                          : 'bg-[#18181C] border-white/[0.06] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">$</span>
                        <span>USD ($)</span>
                      </div>
                      {currency === 'USD' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrency('KZT')}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                        currency === 'KZT'
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 ring-1 ring-emerald-500/30 font-bold'
                          : isLight
                          ? 'bg-[#F1F3F5] border-black/[0.06] text-zinc-700 hover:bg-black/[0.04]'
                          : 'bg-[#18181C] border-white/[0.06] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">₸</span>
                        <span>KZT (₸)</span>
                      </div>
                      {currency === 'KZT' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  </div>

                  {/* Custom Exchange Rate Input */}
                  <div
                    className={`p-3.5 rounded-xl border space-y-2 mt-2 ${
                      isLight
                        ? 'bg-[#F8F9FA] border-black/[0.06]'
                        : 'bg-[#18181C] border-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                        {t.exchangeRateLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRateChange('500')}
                        className={`text-[10px] underline cursor-pointer ${
                          isLight ? 'text-zinc-500 hover:text-black' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Reset (500)
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-zinc-400">1 USD =</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={localRate}
                        onChange={(e) => handleRateChange(e.target.value)}
                        className={`w-28 px-2.5 py-1 rounded-lg border font-mono text-xs focus:outline-none focus:border-emerald-500 ${
                          isLight
                            ? 'bg-white border-black/[0.1] text-zinc-900 shadow-xs'
                            : 'bg-[#111113] border-white/[0.1] text-white'
                        }`}
                      />
                      <span className="font-mono font-bold text-xs text-zinc-400">₸ KZT</span>
                      <span className={`ml-auto text-[10px] font-mono ${isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400'}`}>
                        ($150 = {Math.round(150 * exchangeRate).toLocaleString('ru-RU')} ₸)
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`h-[1px] ${isLight ? 'bg-black/[0.06]' : 'bg-white/[0.06]'}`} />

                {/* Section 3: Language Switch */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <Globe className="w-4 h-4 text-emerald-500" />
                    <span>{t.languageSection}</span>
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {t.languageDesc}
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setLang('ru')}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                        lang === 'ru'
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 ring-1 ring-emerald-500/20 font-bold'
                          : isLight
                          ? 'bg-[#F1F3F5] border-black/[0.06] text-zinc-700 hover:bg-black/[0.04]'
                          : 'bg-[#18181C] border-white/[0.06] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🇷🇺</span>
                        <span>Русский</span>
                      </div>
                      {lang === 'ru' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setLang('en')}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                        lang === 'en'
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 ring-1 ring-emerald-500/20 font-bold'
                          : isLight
                          ? 'bg-[#F1F3F5] border-black/[0.06] text-zinc-700 hover:bg-black/[0.04]'
                          : 'bg-[#18181C] border-white/[0.06] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🇬🇧</span>
                        <span>English</span>
                      </div>
                      {lang === 'en' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  </div>
                </div>

                <div className={`h-[1px] ${isLight ? 'bg-black/[0.06]' : 'bg-white/[0.06]'}`} />

                {/* Section 4: Database Management & Backup */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <Database className="w-4 h-4 text-cyan-500" />
                    <span>{t.databaseSection}</span>
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {t.databaseDesc}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* Backup */}
                    <button
                      type="button"
                      onClick={handleBackup}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition text-left cursor-pointer ${
                        isLight
                          ? 'bg-[#F8F9FA] hover:bg-[#F1F3F5] border-black/[0.06] text-zinc-800'
                          : 'bg-[#18181C] hover:bg-[#202028] border-white/[0.06] text-zinc-200'
                      }`}
                    >
                      <Download className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <div className="font-semibold">{t.backupBtn}</div>
                        <div className={`text-[10px] font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                          {artists.length} artists, {deals.length} deals
                        </div>
                      </div>
                    </button>

                    {/* Restore */}
                    <button
                      type="button"
                      onClick={handleRestoreClick}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition text-left cursor-pointer ${
                        isLight
                          ? 'bg-[#F8F9FA] hover:bg-[#F1F3F5] border-black/[0.06] text-zinc-800'
                          : 'bg-[#18181C] hover:bg-[#202028] border-white/[0.06] text-zinc-200'
                      }`}
                    >
                      <Upload className="w-4 h-4 text-cyan-500 shrink-0" />
                      <div>
                        <div className="font-semibold">{t.restoreBtn}</div>
                        <div className="text-[10px] text-zinc-400">.json file upload</div>
                      </div>
                    </button>

                    {/* Reset to Demo */}
                    <button
                      type="button"
                      onClick={() => setIsResetConfirmOpen(true)}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition text-left cursor-pointer ${
                        isLight
                          ? 'bg-amber-50/60 hover:bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-[#18181C] hover:bg-[#202028] border-amber-500/20 text-amber-300'
                      }`}
                    >
                      <RefreshCw className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <div className="font-semibold">{t.resetDemoBtn}</div>
                        <div className="text-[10px] text-zinc-400">Sample Artists & Deals</div>
                      </div>
                    </button>

                    {/* Wipe DB */}
                    <button
                      type="button"
                      onClick={() => setIsWipeConfirmOpen(true)}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition text-left cursor-pointer ${
                        isLight
                          ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-800'
                          : 'bg-red-950/20 hover:bg-red-950/30 border-red-500/20 text-red-300'
                      }`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                      <div>
                        <div className="font-semibold">{t.clearDbBtn}</div>
                        <div className="text-[10px] text-red-400/70">{t.wipeModalDesc}</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border text-[11px] flex items-center gap-2 ${
                    isLight
                      ? 'bg-[#F8F9FA] border-black/[0.06] text-zinc-600'
                      : 'bg-[#18181C] border-white/[0.04] text-zinc-400'
                  }`}
                >
                  <span className="font-mono text-emerald-500">⌨</span>
                  <span>{t.hotkeyHint}</span>
                </div>
              </>
            ) : (
              /* Option Manager / Справочники */
              <OptionManager />
            )}
          </div>

          {/* Footer */}
          <div
            className={`px-6 py-3.5 border-t flex justify-end shrink-0 ${
              isLight ? 'bg-[#F8F9FA] border-black/[0.06]' : 'bg-[#141418] border-white/[0.06]'
            }`}
          >
            <button
              onClick={() => setIsSettingsOpen(false)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                isLight
                  ? 'bg-black text-white hover:bg-black/90 border-transparent'
                  : 'bg-white text-black hover:bg-zinc-200 border-transparent'
              }`}
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>

      {/* Wipe Confirmation Modal */}
      <ConfirmModal
        isOpen={isWipeConfirmOpen}
        title={t.wipeModalTitle}
        description={t.clearConfirm}
        confirmLabel={t.clearDbBtn}
        cancelLabel={t.cancel}
        isDestructive={true}
        onConfirm={confirmWipe}
        onClose={() => setIsWipeConfirmOpen(false)}
      />

      {/* Reset Demo Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title={t.resetDemoBtn}
        description={t.resetConfirm}
        confirmLabel={t.resetDemoBtn}
        cancelLabel={t.cancel}
        isDestructive={false}
        onConfirm={confirmResetDemo}
        onClose={() => setIsResetConfirmOpen(false)}
      />
    </>
  );
};
