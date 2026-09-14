import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, Mail, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp();

  if (!toast) return null;

  const isSuccess = toast.type === 'success' || !toast.type;
  const isError = toast.type === 'error';
  const isMail = toast.type === 'mail';

  return (
    <aside
      aria-label="Notification"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200 pointer-events-auto"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-xl text-xs font-medium ${
          isMail
            ? 'bg-[#12141a]/95 border-emerald-500/40 text-emerald-200 shadow-emerald-950/40'
            : isSuccess
            ? 'bg-[#111613]/95 border-emerald-500/40 text-emerald-200 shadow-emerald-950/40'
            : isError
            ? 'bg-[#1c1214]/95 border-red-500/40 text-red-200 shadow-red-950/40'
            : 'bg-[#141418]/95 border-white/10 text-zinc-200 shadow-black/50'
        }`}
      >
        <div className="shrink-0">
          {isMail ? (
            <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
              <Mail className="w-4 h-4" />
            </div>
          ) : isSuccess ? (
            <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : isError ? (
            <div className="p-1 rounded-md bg-red-500/20 text-red-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
              <Info className="w-4 h-4" />
            </div>
          )}
        </div>

        <span className="text-zinc-100 font-medium tracking-wide">{toast.message}</span>

        <button
          onClick={hideToast}
          className="ml-2 p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
