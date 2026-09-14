import React, { useEffect } from 'react';
import { motion, useReducedMotion, useAnimationControls, useIsPresent, type HTMLMotionProps } from 'motion/react';

export const nativeEase = [0.22, 1, 0.36, 1] as const;
export const nativeTransition = { type: 'tween' as const, duration: 0.55, ease: nativeEase };

export function NativeBackdrop(props: HTMLMotionProps<'div'>) {
  const isPresent = useIsPresent();
  return <motion.div {...props} inert={!isPresent} className={props.className?.replace(/\banimate-in\b/g, '')}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} />;
}

export function NativePanel({ drawer = false, ...props }: HTMLMotionProps<'div'> & { drawer?: boolean }) {
  const reduceMotion = useReducedMotion();
  return <motion.div {...props} className={props.className?.replace(/\banimate-in\b/g, '')}
    initial={{ opacity: 0, x: !reduceMotion && drawer ? 24 : 0, y: !reduceMotion && !drawer ? 12 : 0 }}
    animate={{ x: 0, y: 0, opacity: 1 }}
    exit={{ opacity: 0, x: !reduceMotion && drawer ? 12 : 0, y: !reduceMotion && !drawer ? 6 : 0, transition: { duration: 0.26, ease: 'easeInOut' } }}
    transition={reduceMotion ? { duration: 0.15 } : nativeTransition}
  />;
}

export function NativePage({ children, view }: { children: React.ReactNode; view: string }) {
  const controls = useAnimationControls();
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    void controls.start({ opacity: [0.8, 1], transition: { duration: reduceMotion ? 0.12 : 0.5, ease: nativeEase } });
  }, [view, reduceMotion, controls]);
  return <motion.div className="native-page" initial={false} animate={controls}>{children}</motion.div>;
}
