import React, { useState } from 'react';
import { X, UserPlus, CheckSquare, Square, Download, Instagram, Music } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ImportFromParserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportFromParserModal: React.FC<ImportFromParserModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    t,
    theme,
    stagingContacts,
    importStagingToCrm,
  } = useApp();

  const isLight = theme === 'light';
  const contacts = Array.isArray(stagingContacts) ? stagingContacts : [];

  // Selected staging contacts IDs (default: all new)
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    (Array.isArray(stagingContacts) ? stagingContacts : [])
      .filter((c) => c.status === 'new')
      .map((c) => c.id)
  );

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(contacts.map((c) => c.id));
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleImport = () => {
    if (selectedIds.length === 0) return;
    importStagingToCrm(selectedIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-3xl rounded-2xl shadow-2xl border flex flex-col max-h-[85vh] overflow-hidden ${
          isLight
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-[#121215] border-white/10 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">{t.importFromParser}</h2>
              <p className="text-xs text-zinc-400">
                Перенос найденных музыкальных лидов в CRM со статусом «Новый»
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/5 bg-black/10 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-indigo-400 hover:bg-indigo-500/10 transition cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{t.filterSelectAll}</span>
            </button>
            <button
              type="button"
              onClick={handleClearSelection}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-zinc-400 hover:bg-white/5 transition cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" />
              <span>{t.filterClearSelection}</span>
            </button>
          </div>
          <span className="text-zinc-400">
            Выбрано: <strong className="text-white">{selectedIds.length}</strong> из {contacts.length}
          </span>
        </div>

        {/* Candidate list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5 text-xs">
          {contacts.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 space-y-2">
              <p>База парсинга пуста</p>
              <p className="text-[11px] text-zinc-600">
                Перейдите во вкладку «Парсер» и запустите сбор контактов
              </p>
            </div>
          ) : (
            contacts.map((contact) => {
              const isSelected = selectedIds.includes(contact.id);
              return (
                <div
                  key={contact.id}
                  onClick={() => toggleSelect(contact.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? isLight
                        ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                        : 'bg-indigo-500/10 border-indigo-500/30 shadow-xs'
                      : isLight
                      ? 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                      : 'bg-[#16161A] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded accent-indigo-500 w-4 h-4 cursor-pointer"
                    />

                    {contact.avatarUrl ? (
                      <img
                        src={contact.avatarUrl}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-300">
                        {contact.username.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-200 truncate">
                          {contact.fullName || contact.username}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          @{contact.username}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            contact.category === 'artist'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}
                        >
                          {contact.category === 'artist' ? 'Артист' : 'Продюсер'}
                        </span>
                      </div>

                      {contact.bio && (
                        <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5 max-w-xl">
                          {contact.bio}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-1">
                        <span>👥 {contact.followersCount.toLocaleString()} подп.</span>
                        <span>Источник: @{contact.sourceTarget}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right pl-3">
                    <a
                      href={`https://instagram.com/${contact.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-indigo-400 transition"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>Открыть</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-black/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer text-xs"
          >
            Закрыть
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={selectedIds.length === 0}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-medium text-xs transition cursor-pointer shadow-lg ${
              selectedIds.length > 0
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.importSelectedCount(selectedIds.length)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
