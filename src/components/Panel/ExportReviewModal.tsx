import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ShieldAlert, X } from 'lucide-react';
import type { ConversationTurn } from '../../types';
import { isChartContext } from '../../types';
import { getSource } from '../../data/mockData';
import { useResearch } from '../../state/ResearchContext';
import { buildExportDraft } from '../../utils/exportDraft';
import { ComposerContextCard } from './ContextChip';

interface ExportReviewModalProps {
  turn: ConversationTurn;
  onClose: () => void;
}

export function ExportReviewModal({ turn, onClose }: ExportReviewModalProps) {
  const { showToast } = useResearch();
  const [draft, setDraft] = useState(() => buildExportDraft(turn));

  useEffect(() => {
    setDraft(buildExportDraft(turn));
  }, [turn]);

  const hasRestricted = turn.answer?.findings.some((f) => f.sourceIds.some((id) => getSource(id).restricted));
  const chartContext = (turn.contextItems ?? []).filter(isChartContext);

  async function handleApprove() {
    try {
      await navigator.clipboard.writeText(draft);
    } catch {
      // Clipboard access may be unavailable in some environments — still confirm the review flow completed.
    }
    showToast('Copied — ready to paste.');
    onClose();
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
          className="flex w-full max-w-lg flex-col items-end gap-2"
        >
          {chartContext.length > 0 && (
            <div className="flex max-w-full flex-wrap justify-end gap-2">
              {chartContext.map((item) => (
                <ComposerContextCard
                  key={item.instanceId}
                  title={item.title}
                  timeframeLabel={item.timeframeLabel}
                  chartKind={item.chartKind}
                  compact
                />
              ))}
            </div>
          )}
          <div className="w-full rounded-2xl border border-border bg-surface p-5 shadow-soft-lg">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-ink">Review before sharing</p>
              <p className="text-[11px] text-ink-faint">Nothing leaves this panel without your review.</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-ink-soft hover:bg-surface-soft">
              <X size={16} />
            </button>
          </div>

          {hasRestricted && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-soft bg-amber-soft p-2.5">
              <ShieldAlert size={14} className="mt-0.5 shrink-0 text-amber" />
              <p className="text-[11px] leading-relaxed text-amber">
                This answer references a restricted source. Its contents are excluded from the draft below — check
                the text still reads correctly before sharing.
              </p>
            </div>
          )}

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={12}
            className="mt-3 w-full resize-none rounded-xl border border-border-soft bg-surface-soft p-3 text-xs leading-relaxed text-ink focus:border-border focus:outline-none"
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
              onClick={handleApprove}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-surface transition-opacity hover:opacity-90"
            >
              <Check size={13} />
              Export
            </button>
          </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
