import React, { useState, useEffect, useRef } from 'react';
import { Database, Play, Square, Shield, ShieldCheck, ShieldAlert, FileSpreadsheet, ExternalLink, Instagram, RefreshCw, Terminal, CheckCircle2, AlertTriangle, Info, XCircle, Sparkles } from 'lucide-react';
import { Users, Settings2, Plus, Trash2, Download } from './InterfaceIcons';
import { useApp } from '../context/AppContext';
import { ParserAccount, StagingContact } from '../types';
import { ParserAccountModal } from './ParserAccountModal';
import { ParserSettingsModal } from './ParserSettingsModal';
import { ImportFromParserModal } from './ImportFromParserModal';

export const ParserView: React.FC = () => {
  const {
    t,
    theme,
    parserAccounts,
    stagingContacts,
    parserStatus,
    startParserTask,
    stopParserTask,
    authenticateParserAccount,
    deleteParserAccount,
    excludeStagingContact,
    clearStagingContacts,
    importStagingToCrm,
    artists,
  } = useApp();

  const isLight = theme === 'light';

  // Defensive array bindings
  const accounts = Array.isArray(parserAccounts) ? parserAccounts : [];
  const staging = Array.isArray(stagingContacts) ? stagingContacts : [];
  const logs = Array.isArray(parserStatus?.logs) ? parserStatus.logs : [];

  // Sub-tabs: 'accounts' | 'staging'
  const [activeSubTab, setActiveSubTab] = useState<'staging' | 'accounts'>('staging');

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<ParserAccount | null>(null);

  // Authenticating account spinner
  const [authenticatingId, setAuthenticatingId] = useState<string | null>(null);

  // Log console auto-scroll
  const consoleEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  // Export to Excel / CSV
  const handleExportXlsx = () => {
    if (staging.length === 0) return;

    // Generate CSV data formatted for Excel
    const headers = [
      'Username',
      'Full Name',
      'Category',
      'Followers',
      'Following',
      'Bio',
      'External URL',
      'Email',
      'Phone',
      'Donor Source',
      'Collected At',
    ];

    const rows = staging.map((c) => [
      c.username,
      `"${(c.fullName || c.name || '').replace(/"/g, '""')}"`,
      c.category,
      c.followersCount,
      c.followingCount ?? 0,
      `"${(c.bio || '').replace(/"/g, '""')}"`,
      c.externalUrl || c.instagramUrl || '',
      c.email || '',
      c.phone || '',
      c.sourceTarget,
      c.scrapedAt || c.parsedAt || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `staging_contacts_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAuthAccount = async (account: ParserAccount) => {
    setAuthenticatingId(account.id);
    await authenticateParserAccount(account.id);
    setAuthenticatingId(null);
  };

  return (
    <div className="studio-parser flex-1 flex flex-col min-h-0 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[var(--ink)] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>{t.parserTitle}</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Discovery
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">{t.parserSubtitle}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
              isLight
                ? 'bg-white border-zinc-300 text-zinc-800 hover:bg-zinc-50'
                : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>{t.parserSettings}</span>
          </button>

          {parserStatus.isRunning ? (
            <button
              type="button"
              onClick={stopParserTask}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer shadow-lg shadow-rose-600/20"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>{t.stopParser}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                const existing = artists.map((a) => a.instagram || a.name).filter(Boolean);
                startParserTask(
                  {
                    accountId: parserAccounts[0]?.id || '',
                    targets: 'fastfoodmusic, theflowru, beatstars',
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
                  },
                  existing
                );
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{t.startParser}</span>
            </button>
          )}
        </div>
      </div>

      {/* Parser Live Progress / Terminal Card */}
      <div
        className={`rounded-2xl border overflow-hidden p-4 space-y-3 transition-all ${
          isLight
            ? 'bg-white border-zinc-200 shadow-sm'
            : 'bg-[var(--surface)] border-white/10 shadow-xl'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                parserStatus?.isRunning
                  ? 'bg-emerald-400 animate-pulse'
                  : parserStatus?.error
                  ? 'bg-rose-500'
                  : 'bg-zinc-500'
              }`}
            />
            <span className="font-semibold text-[var(--ink)]">
              {parserStatus?.isRunning ? 'Парсер запущен' : 'Статус: Ожидание'}
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400">{parserStatus?.currentStep || 'Ожидание'}</span>
          </div>

          <div className="text-xs text-zinc-400">
            Собрано кандидатов:{' '}
            <strong className="text-indigo-400">
              {parserStatus?.scrapedCount ?? parserStatus?.collectedCount ?? staging.length}
            </strong>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              parserStatus?.error
                ? 'bg-rose-500'
                : 'bg-indigo-500'
            }`}
            style={{ width: `${Math.max(5, parserStatus?.progress || 0)}%` }}
          />
        </div>

        {/* Real-time terminal log viewer */}
        <div
          className={`rounded-xl p-3 font-mono text-[11px] h-28 overflow-y-auto space-y-1 ${
            isLight ? 'bg-zinc-950 text-zinc-300' : 'bg-black/60 text-zinc-300 border border-white/5'
          }`}
        >
          {logs.length === 0 ? (
            <div className="text-zinc-600 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>Консоль парсера готова. Нажмите «Запустить парсер» для сбора контактов.</span>
            </div>
          ) : (
            logs.map((log, idx) => {
              const level = (log.level || log.type || 'info').toLowerCase();
              const timeStr = log.timestamp ? (log.timestamp.split('T')[1]?.slice(0, 8) || '') : '';
              return (
                <div key={log.id || idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-zinc-600 select-none">{timeStr}</span>
                  {level === 'error' && (
                    <span className="text-rose-400 font-bold">[ERR]</span>
                  )}
                  {level === 'warning' && (
                    <span className="text-amber-400 font-bold">[WARN]</span>
                  )}
                  {level === 'success' && (
                    <span className="text-emerald-400 font-bold">[OK]</span>
                  )}
                  {(level === 'info' || level === 'log') && (
                    <span className="text-indigo-400 font-bold">[INFO]</span>
                  )}
                  <span
                    className={
                      level === 'error'
                        ? 'text-rose-300'
                        : level === 'success'
                        ? 'text-emerald-300'
                        : level === 'warning'
                        ? 'text-amber-300'
                        : 'text-zinc-300'
                    }
                  >
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
          <div ref={consoleEndRef} />
        </div>
      </div>

      {/* Subtabs Switcher */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('staging')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'staging'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isLight
                ? 'text-zinc-600 hover:bg-zinc-100'
                : 'text-zinc-400 hover:bg-white/5 hover:text-[var(--ink)]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{t.parserStagingTab}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeSubTab === 'staging'
                  ? 'bg-white/20 text-[var(--ink)]'
                  : 'bg-indigo-500/10 text-indigo-400'
              }`}
            >
              {staging.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('accounts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'accounts'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isLight
                ? 'text-zinc-600 hover:bg-zinc-100'
                : 'text-zinc-400 hover:bg-white/5 hover:text-[var(--ink)]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>{t.parserAccountsTab}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeSubTab === 'accounts'
                  ? 'bg-white/20 text-[var(--ink)]'
                  : 'bg-white/10 text-zinc-400'
              }`}
            >
              {accounts.length}
            </span>
          </button>
        </div>

        {/* Actions for active subtab */}
        {activeSubTab === 'staging' ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportXlsx}
              disabled={staging.length === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition cursor-pointer ${
                isLight
                  ? 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.parserExportXlsx || t.exportXlsx}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm(t.clearStagingConfirm)) {
                  clearStagingContacts();
                }
              }}
              disabled={staging.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearStaging}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              disabled={staging.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.importToCrm}</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setAccountToEdit(null);
              setIsAccountModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addParserAccount}</span>
          </button>
        )}
      </div>

      {/* Subtab 1: Staging Table */}
      {activeSubTab === 'staging' && (
        <div
          className={`rounded-2xl border overflow-hidden ${
            isLight ? 'bg-white border-zinc-200' : 'bg-[var(--surface)] border-white/10'
          }`}
        >
          {staging.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 space-y-2">
              <Database className="w-8 h-8 mx-auto text-zinc-600" />
              <p className="font-semibold text-zinc-300">База контактов пуста</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Нажмите «Запустить парсер» вверху страницы для поиска свежих артистов и продюсеров
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr
                    className={`border-b text-[11px] uppercase tracking-wider font-semibold ${
                      isLight
                        ? 'bg-zinc-50/80 border-zinc-200 text-zinc-500'
                        : 'bg-white/5 border-white/5 text-zinc-400'
                    }`}
                  >
                    <th className="py-3 px-4">Артист / Никнейм</th>
                    <th className="py-3 px-3">Категория</th>
                    <th className="py-3 px-3">Подписчики</th>
                    <th className="py-3 px-3">Bio / Описание</th>
                    <th className="py-3 px-3">Источник (Донор)</th>
                    <th className="py-3 px-3">Дата сбора</th>
                    <th className="py-3 px-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {staging.map((contact) => (
                    <tr
                      key={contact.id}
                      className={`transition ${
                        isLight ? 'hover:bg-zinc-50' : 'hover:bg-white/5'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {contact.avatarUrl ? (
                            <img
                              src={contact.avatarUrl}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-white/10"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-300 text-xs">
                              {contact.username.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-[var(--ink)] truncate">
                              {contact.fullName || contact.name || contact.username}
                            </div>
                            <a
                              href={`https://instagram.com/${contact.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-zinc-500 hover:text-indigo-400 font-mono flex items-center gap-1"
                            >
                              <span>@{contact.username}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            contact.category === 'artist'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}
                        >
                          {contact.category === 'artist' ? 'Артист' : 'Продюсер'}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-medium text-[var(--ink)]">
                        {(contact.followersCount || 0).toLocaleString()}
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <p className="text-zinc-400 truncate text-[11px]" title={contact.bio}>
                          {contact.bio || '—'}
                        </p>
                      </td>

                      <td className="py-3 px-3 text-zinc-400 font-mono text-[11px]">
                        @{contact.sourceTarget}
                      </td>

                      <td className="py-3 px-3 text-zinc-500 text-[11px]">
                        {(contact.scrapedAt || contact.parsedAt || '').split('T')[0] || '—'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => importStagingToCrm([contact.id])}
                            title="Импортировать в CRM"
                            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => excludeStagingContact(contact.id)}
                            title={t.excludeContact}
                            className="ios-icon-action is-destructive p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: Accounts */}
      {activeSubTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const isAuthRunning = authenticatingId === account.id;
            const checkedDate = (account.lastChecked || account.lastCheckedAt || '').split('T')[0];
            return (
              <div
                key={account.id}
                className={`rounded-2xl border p-5 space-y-4 flex flex-col justify-between transition ${
                  isLight
                    ? 'bg-white border-zinc-200 hover:border-zinc-300'
                    : 'bg-[var(--surface)] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center text-indigo-400 font-bold">
                        <Instagram className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--ink)]">@{account.username}</h3>
                        <p className="text-[11px] text-zinc-500">
                          {checkedDate ? `Проверен: ${checkedDate}` : 'Не проверялся'}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                        account.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : account.status === 'blocked'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {account.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                      {account.status === 'blocked' && <XCircle className="w-3 h-3" />}
                      {account.status === 'needs_auth' && <AlertTriangle className="w-3 h-3" />}
                      <span>
                        {account.status === 'active'
                          ? t.accountStatusActive
                          : account.status === 'blocked'
                          ? t.accountStatusBlocked
                          : t.accountStatusNeedsAuth}
                      </span>
                    </span>
                  </div>

                  {account.notes && (
                    <p className="text-xs text-zinc-400 bg-white/5 p-2.5 rounded-xl">
                      {account.notes}
                    </p>
                  )}

                  {account.proxy && (
                    <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                      <span className="font-semibold">Прокси:</span>
                      <span className="font-mono truncate">{account.proxy}</span>
                    </div>
                  )}
                </div>

                {/* Account card footer actions */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleAuthAccount(account)}
                    disabled={isAuthRunning}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-medium border transition cursor-pointer ${
                      account.status === 'active'
                        ? 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                        : 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAuthRunning ? 'animate-spin' : ''}`} />
                    <span>{isAuthRunning ? 'Проверка...' : t.checkAuth}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAccountToEdit(account);
                      setIsAccountModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-zinc-400 hover:text-[var(--ink)] hover:bg-white/5 transition cursor-pointer"
                    title="Редактировать"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Удалить аккаунт @${account.username}?`)) {
                        deleteParserAccount(account.id);
                      }
                    }}
                    className="ios-icon-action is-destructive p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ParserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ParserAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setAccountToEdit(null);
        }}
        accountToEdit={accountToEdit}
      />

      <ImportFromParserModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};
