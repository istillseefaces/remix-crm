import { AnimatePresence } from 'motion/react';
import { NativeBackdrop, NativePanel } from './NativeMotion';
import React, { useState } from 'react';
import { X, Shield, Lock, Globe, FileText, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ParserAccount } from '../types';

interface ParserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: ParserAccount | null;
}

export const ParserAccountModal: React.FC<ParserAccountModalProps> = ({
  isOpen,
  onClose,
  accountToEdit,
}) => {
  const { t, theme, saveParserAccount } = useApp();
  const isLight = theme === 'light';

  const [username, setUsername] = useState(accountToEdit?.username || '');
  const [password, setPassword] = useState(accountToEdit?.password || '');
  const [twoFactorSecret, setTwoFactorSecret] = useState(accountToEdit?.twoFactorSecret || '');
  const [proxy, setProxy] = useState(accountToEdit?.proxy || '');
  const [notes, setNotes] = useState(accountToEdit?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsSubmitting(true);
    await saveParserAccount({
      id: accountToEdit?.id,
      username: username.trim().replace(/^@/, ''),
      password,
      twoFactorSecret,
      proxy,
      notes,
      status: accountToEdit?.status || 'needs_auth',
    });
    setIsSubmitting(false);
    onClose();
  };

  return <AnimatePresence>{isOpen && (
    <NativeBackdrop className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <NativePanel
        className={`studio-dialog w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden ${
          isLight
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-[var(--surface)] border-white/10 text-white'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold">
              {accountToEdit ? t.editParserAccount : t.addParserAccount}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>{t.accountUsername}</span>
            </label>
            <input
              type="text"
              required
              placeholder="например, my_instagram_lead_scout"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border transition outline-none ${
                isLight
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-900 focus:border-indigo-500'
                  : 'bg-[var(--surface-secondary)] border-white/10 text-white focus:border-indigo-500'
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{t.accountPassword}</span>
            </label>
            <input
              type="password"
              placeholder="Пароль от аккаунта"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border transition outline-none ${
                isLight
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-900 focus:border-indigo-500'
                  : 'bg-[var(--surface-secondary)] border-white/10 text-white focus:border-indigo-500'
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-zinc-400" />
              <span>{t.account2FA}</span>
            </label>
            <input
              type="text"
              placeholder="2FA Secret или 8-значный резервный код"
              value={twoFactorSecret}
              onChange={(e) => setTwoFactorSecret(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border transition outline-none ${
                isLight
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-900 focus:border-indigo-500'
                  : 'bg-[var(--surface-secondary)] border-white/10 text-white focus:border-indigo-500'
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span>{t.accountProxy}</span>
            </label>
            <input
              type="text"
              placeholder="ip:port:login:password"
              value={proxy}
              onChange={(e) => setProxy(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border transition outline-none ${
                isLight
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-900 focus:border-indigo-500'
                  : 'bg-[var(--surface-secondary)] border-white/10 text-white focus:border-indigo-500'
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>{t.accountNotes}</span>
            </label>
            <textarea
              rows={2}
              placeholder="Для чего используется аккаунт..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border transition outline-none resize-none ${
                isLight
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-900 focus:border-indigo-500'
                  : 'bg-[var(--surface-secondary)] border-white/10 text-white focus:border-indigo-500'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition cursor-pointer shadow-sm"
            >
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </NativePanel>
    </NativeBackdrop>
  )}</AnimatePresence>;
};
