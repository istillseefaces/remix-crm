import { AnimatePresence } from 'motion/react';
import { NativeBackdrop, NativePanel } from './NativeMotion';
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Trash2, X } from './InterfaceIcons';
import { useApp } from '../context/AppContext';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onClose,
}) => {
  const { theme } = useApp();
  const isLight = theme === 'light';



  return <AnimatePresence>{isOpen && (
    <NativeBackdrop
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <NativePanel
        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150 text-xs border ${
          isLight
            ? 'bg-white border-black/[0.08] text-[var(--ink)]'
            : 'bg-[var(--surface)] border-white/[0.08] text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isDestructive
                ? isLight
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : 'bg-red-500/15 text-red-400 border-red-500/25'
                : isLight
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
            }`}
          >
            {isDestructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold mb-1 ${isLight ? 'text-[var(--ink)]' : 'text-white'}`}>
              {title}
            </h3>
            <p className={`leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {description}
            </p>
          </div>

          <button
            onClick={onClose}
            className={`ios-icon-action p-1 rounded-lg transition cursor-pointer ${
              isLight
                ? 'hover:bg-black/[0.05] text-zinc-400 hover:text-black'
                : 'hover:bg-white/[0.08] text-zinc-500 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className={`flex items-center justify-end gap-2 pt-3 border-t ${
            isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-xs font-medium border transition cursor-pointer ${
              isLight
                ? 'bg-[var(--surface-secondary)] hover:bg-black/[0.06] text-zinc-700 border-black/[0.08]'
                : 'bg-[#1F1F24] hover:bg-[#282830] text-zinc-300 border-white/[0.06]'
            }`}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </NativePanel>
    </NativeBackdrop>
  )}</AnimatePresence>;
};
