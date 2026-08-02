import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useResearch } from '../../state/ResearchContext';

export function Toast() {
  const { toast, dismissToast } = useResearch();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismissToast, 2600);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.18 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border bg-ink px-4 py-2 text-xs font-medium text-surface shadow-soft-lg"
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
