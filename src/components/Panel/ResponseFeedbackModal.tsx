import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { ResponseFeedbackReason } from '../../types';

export const RESPONSE_FEEDBACK_REASONS: { id: ResponseFeedbackReason; label: string }[] = [
  { id: 'inaccurate', label: 'Inaccurate or incomplete' },
  { id: 'missedAsk', label: 'Missed the ask' },
  { id: 'uncertainty', label: 'Should have flagged uncertainty' },
  { id: 'citation', label: "Citation didn't hold up" },
  { id: 'privacy', label: 'Privacy or access concern' },
  { id: 'other', label: 'Other' },
];

interface ResponseFeedbackModalProps {
  onClose: () => void;
  onSubmit: (reasons: ResponseFeedbackReason[], comment: string) => void;
}

export function ResponseFeedbackModal({ onClose, onSubmit }: ResponseFeedbackModalProps) {
  const [selected, setSelected] = useState<ResponseFeedbackReason[]>([]);
  const [comment, setComment] = useState('');

  function toggleReason(id: ResponseFeedbackReason) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  }

  function handleSubmit() {
    onSubmit(selected, comment.trim());
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center bg-ink/30 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          className="w-full max-w-lg rounded-2xl border border-border bg-surface p-5 shadow-soft-lg"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-ink">What went wrong?</p>
              <p className="text-[11px] text-ink-faint">Select all that apply — your feedback helps us improve.</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-ink-soft hover:bg-surface-soft">
              <X size={16} />
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {RESPONSE_FEEDBACK_REASONS.map(({ id, label }) => (
              <label
                key={id}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors ${
                  selected.includes(id)
                    ? 'border-sage/40 bg-sage-soft/60'
                    : 'border-border-soft bg-surface-soft hover:border-border'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(id)}
                  onChange={() => toggleReason(id)}
                  className="size-3.5 shrink-0 accent-sage"
                />
                <span className="text-xs font-medium text-ink">{label}</span>
              </label>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Anything else you'd like to share? (optional)"
            rows={3}
            className="mt-3 w-full resize-none rounded-xl border border-border-soft bg-surface-soft p-3 text-xs leading-relaxed text-ink placeholder:text-ink-faint focus:border-border focus:outline-none"
          />

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-surface-soft"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-surface transition-opacity hover:opacity-90"
            >
              <Check size={13} />
              Submit feedback
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
