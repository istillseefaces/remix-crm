import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, Mail, X } from 'lucide-react';
import { nativeTransition } from './NativeMotion';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp();
  const reduceMotion = useReducedMotion();
  const Icon = toast?.type === 'mail' ? Mail : toast?.type === 'error' ? AlertCircle : toast?.type === 'success' || !toast?.type ? CheckCircle2 : Info;
  return <AnimatePresence>{toast && <motion.aside key={toast.message} className="native-toast" role="status" aria-live="polite" initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : 12, transition: { duration: 0.26 } }} transition={nativeTransition}><Icon size={20} className={toast.type === 'error' ? 'text-red-500' : 'text-emerald-500'} /><span>{toast.message}</span><button onClick={hideToast} aria-label="Close notification"><X size={15} /></button></motion.aside>}</AnimatePresence>;
};
