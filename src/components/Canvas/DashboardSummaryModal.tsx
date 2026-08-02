import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Bookmark, Check, Download, MessageSquarePlus, Sparkles, X } from 'lucide-react';
import { DASHBOARD_NARRATIVE, DASHBOARD_NARRATIVE_TITLE } from '../../data/mockData';
import { useResearch } from '../../state/ResearchContext';
import { useTypewriter } from '../../hooks/useTypewriter';
import { buildDashboardExportDraft } from '../../utils/exportDraft';

interface DashboardSummaryModalProps {
  onClose: () => void;
}

type Step = 'generating' | 'summary' | 'export';

const GENERATE_DELAY_MS = 700;
const NARRATIVE_TEXT = DASHBOARD_NARRATIVE.join('\n\n');

function SkeletonLine({ width }: { width: string }) {
  return <div className="h-2.5 animate-pulse rounded-full bg-border-soft" style={{ width }} />;
}

export function DashboardSummaryModal({ onClose }: DashboardSummaryModalProps) {
  const { addContext, saveRepeatable, showToast } = useResearch();
  const [step, setStep] = useState<Step>('generating');
  const [draft, setDraft] = useState(() => buildDashboardExportDraft());
  const typedNarrative = useTypewriter(NARRATIVE_TEXT, step === 'summary', 5, 10);
  const isTyped = typedNarrative === NARRATIVE_TEXT;

  useEffect(() => {
    const timer = setTimeout(() => setStep('summary'), GENERATE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const isGenerating = step === 'generating';
  const isExport = step === 'export';
  const paragraphs = typedNarrative.split('\n\n').filter(Boolean);

  function handleDiscuss() {
    addContext('revenue');
    addContext('churn');
    onClose();
  }

  async function handleApproveExport() {
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
          className="w-full max-w-lg rounded-2xl border border-border bg-surface p-5 shadow-soft-lg"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isExport && (
                <button
                  type="button"
                  onClick={() => setStep('summary')}
                  title="Back to summary"
                  className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-surface-soft"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-surface">
                <Sparkles size={14} />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-ink">
                  {isExport ? 'Review before exporting' : DASHBOARD_NARRATIVE_TITLE}
                </p>
                <p className="text-[11px] text-ink-faint">
                  {isExport ? 'Nothing leaves this panel without your review.' : 'AI-generated narrative · Q1–Q3 2026'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              title="Close"
              className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-surface-soft"
            >
              <X size={16} />
            </button>
          </div>

          {isExport ? (
            <>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={12}
                className="mt-3 w-full resize-none rounded-xl border border-border-soft bg-surface-soft p-3 text-xs leading-relaxed text-ink focus:border-border focus:outline-none"
              />
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStep('summary')}
                  className="rounded-full px-3.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-surface-soft"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleApproveExport}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-surface transition-opacity hover:opacity-90"
                >
                  <Check size={13} />
                  Approve &amp; Copy
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mt-3 flex flex-col gap-2.5">
                {isGenerating ? (
                  <>
                    <SkeletonLine width="94%" />
                    <SkeletonLine width="88%" />
                    <SkeletonLine width="70%" />
                  </>
                ) : (
                  paragraphs.map((paragraph, i) => (
                    <p key={i} className="text-xs leading-relaxed text-ink-soft">
                      {paragraph}
                    </p>
                  ))
                )}
              </div>

              {step === 'summary' && isTyped && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border-soft pt-3.5">
                  <button
                    type="button"
                    onClick={handleDiscuss}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border-soft px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-border hover:text-ink"
                  >
                    <MessageSquarePlus size={13} />
                    Discuss in chat
                  </button>
                  <button
                    type="button"
                    onClick={() => saveRepeatable('Q3 dashboard summary')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border-soft px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-border hover:text-ink"
                  >
                    <Bookmark size={13} />
                    Save as a repeatable check
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('export')}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-surface transition-opacity hover:opacity-90"
                  >
                    <Download size={13} />
                    Export
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
