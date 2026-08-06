import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Folder, Lock } from 'lucide-react';
import type { Finding } from '../../types';
import { getSource } from '../../data/mockData';
import { SourceIcon, hidesExcerptSummary } from './SourceIcon';

const CLOSE_DELAY_MS = 200;
const CARD_WIDTH = 320;

interface InlineCitationProps {
  number: number;
  finding: Finding;
}

export function InlineCitation({ number, finding }: InlineCitationProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [excerptIndex, setExcerptIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const panelId = useId();

  const sourceId = finding.sourceIds[0];
  const source = sourceId ? getSource(sourceId) : null;
  const excerpts = source?.excerpts ?? [];
  const excerptCount = excerpts.length;
  const showSummary = source != null && !hidesExcerptSummary(source.type) && excerptCount > 0;
  const showExcerptNav = showSummary && excerptCount > 1;

  function clearCloseTimer() {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function show() {
    clearCloseTimer();
    setOpen(true);
  }

  function scheduleHide() {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      setExcerptIndex(0);
      closeTimerRef.current = null;
    }, CLOSE_DELAY_MS);
  }

  function updatePosition() {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pad = 8;
    let left = rect.left + rect.width / 2 - CARD_WIDTH / 2;
    left = Math.max(pad, Math.min(left, window.innerWidth - CARD_WIDTH - pad));
    setCoords({ top: rect.bottom + 4, left });
  }

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, excerptIndex]);

  useEffect(() => {
    if (!open) return;
    function onScrollOrResize() {
      updatePosition();
    }
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open]);

  useEffect(() => () => clearCloseTimer(), []);

  return (
    <span className="group relative inline whitespace-nowrap">
      <button
        ref={triggerRef}
        type="button"
        aria-describedby={open ? panelId : undefined}
        onMouseEnter={show}
        onMouseLeave={scheduleHide}
        onFocus={show}
        className="mx-0.5 inline-flex h-4 min-w-4 translate-y-[-1px] items-center justify-center rounded-full bg-ocean-soft px-1 align-baseline text-[10px] font-semibold leading-none text-ocean underline-offset-2 transition-colors hover:bg-ocean hover:text-surface group-hover:underline"
      >
        {number}
      </button>

      {open &&
        coords &&
        source &&
        createPortal(
          <div
            id={panelId}
            role="tooltip"
            onMouseEnter={show}
            onMouseLeave={scheduleHide}
            style={{ top: coords.top, left: coords.left, width: CARD_WIDTH }}
            className="fixed z-[80] rounded-2xl border border-border-soft bg-surface p-3.5 shadow-soft-lg"
          >
            {/* Invisible bridge so the pointer can travel from the badge into the card */}
            <div className="absolute inset-x-0 -top-3 h-3" aria-hidden />

            {source.restricted ? (
              <div className="flex items-start gap-2.5">
                <Lock size={16} className="mt-0.5 shrink-0 text-ink-faint" />
                <div>
                  <p className="text-sm font-semibold leading-snug text-ink">{source.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                    You don't have access to this source, so its contents aren't shown here.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    <SourceIcon type={source.type} size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold leading-snug text-ink">{source.name}</p>
                    <p className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 text-[11px] leading-snug text-ink-faint">
                      <span className="shrink-0">{source.timestamp}</span>
                      {source.author && (
                        <>
                          <span aria-hidden>•</span>
                          <span className="truncate">{source.author}</span>
                        </>
                      )}
                      {source.workspace && (
                        <>
                          <span aria-hidden>•</span>
                          <span className="inline-flex min-w-0 items-center gap-1">
                            <Folder size={11} className="shrink-0" />
                            <span className="truncate">{source.workspace}</span>
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {showSummary && (
                  <p className="mt-2.5 text-xs leading-relaxed text-ink-soft">
                    {excerpts[excerptIndex]}
                  </p>
                )}

                {showExcerptNav && (
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-ink-faint">
                      {excerptIndex + 1} of {excerptCount} excerpts
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={excerptIndex === 0}
                        onClick={() => setExcerptIndex((i) => Math.max(0, i - 1))}
                        className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-ink transition-colors hover:bg-surface-soft disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={excerptIndex >= excerptCount - 1}
                        onClick={() => setExcerptIndex((i) => Math.min(excerptCount - 1, i + 1))}
                        className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-ink transition-colors hover:bg-surface-soft disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>,
          document.body,
        )}
    </span>
  );
}
