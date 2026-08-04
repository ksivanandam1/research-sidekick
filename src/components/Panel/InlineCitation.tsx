import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Lock } from 'lucide-react';
import type { Finding } from '../../types';
import { getSource } from '../../data/mockData';
import { SourcePreview } from './SourcePreview';

const CLOSE_DELAY_MS = 200;

interface InlineCitationProps {
  number: number;
  finding: Finding;
}

export function InlineCitation({ number, finding }: InlineCitationProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [openSourceId, setOpenSourceId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const panelId = useId();

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
      setOpenSourceId(null);
      closeTimerRef.current = null;
    }, CLOSE_DELAY_MS);
  }

  function updatePosition() {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = 288;
    const pad = 8;
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(pad, Math.min(left, window.innerWidth - width - pad));
    setCoords({ top: rect.bottom + 4, left });
  }

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, openSourceId]);

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
    <span className="relative inline whitespace-nowrap">
      <button
        ref={triggerRef}
        type="button"
        aria-describedby={open ? panelId : undefined}
        onMouseEnter={show}
        onMouseLeave={scheduleHide}
        onFocus={show}
        className="mx-0.5 inline-flex h-4 min-w-4 translate-y-[-1px] items-center justify-center rounded-full bg-ocean-soft px-1 align-baseline text-[10px] font-semibold leading-none text-ocean transition-colors hover:bg-ocean hover:text-surface"
      >
        {number}
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            id={panelId}
            role="tooltip"
            onMouseEnter={show}
            onMouseLeave={scheduleHide}
            style={{ top: coords.top, left: coords.left, width: 288 }}
            className="fixed z-[80] rounded-xl border border-border-soft bg-surface p-3 shadow-soft"
          >
            {/* Invisible bridge so the pointer can travel from the badge into the card */}
            <div className="absolute inset-x-0 -top-3 h-3" aria-hidden />

            <p className="text-sm leading-relaxed text-ink">{finding.text}</p>
            {finding.sourceIds.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {finding.sourceIds.map((id) => {
                  const source = getSource(id);
                  const shortLabel = source.name.split('—')[0].trim();
                  const isActive = openSourceId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setOpenSourceId(isActive ? null : id)}
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                        isActive
                          ? 'border-ink bg-ink text-surface'
                          : source.restricted
                            ? 'border-border-soft bg-surface-soft text-ink-faint'
                            : 'border-border-soft bg-surface-soft text-ink-soft hover:border-border hover:text-ink'
                      }`}
                    >
                      {source.restricted ? <Lock size={10} /> : <FileText size={10} />}
                      {shortLabel}
                    </button>
                  );
                })}
              </div>
            )}
            {openSourceId && <SourcePreview source={getSource(openSourceId)} />}
          </div>,
          document.body,
        )}
    </span>
  );
}
