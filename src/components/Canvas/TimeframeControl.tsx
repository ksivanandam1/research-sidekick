import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  TIMEFRAME_OPTIONS,
  formatCustomRange,
  type TimeframePreset,
} from '../../data/dashboardFilters';

export interface TimeframeControlProps {
  value: TimeframePreset;
  onChange: (preset: TimeframePreset) => void;
  customFrom: string;
  customTo: string;
  onCustomChange: (from: string, to: string) => void;
}

export function TimeframeControl({
  value,
  onChange,
  customFrom,
  customTo,
  onCustomChange,
}: TimeframeControlProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const customRef = useRef<HTMLDivElement>(null);
  const customLabel = formatCustomRange(customFrom, customTo);

  useEffect(() => {
    if (!customOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setCustomOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (customRef.current && !customRef.current.contains(e.target as Node)) setCustomOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [customOpen]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <span className="pb-2 text-xs font-medium text-ink-faint">Timeframe</span>
      <div className="inline-flex flex-wrap items-stretch gap-1 rounded-full bg-surface-soft p-1">
        {TIMEFRAME_OPTIONS.map((opt) => {
          const selected = value === opt.id;
          const range =
            opt.id === 'custom' ? (value === 'custom' ? customLabel : null) : opt.resolvedRange;

          if (opt.id === 'custom') {
            return (
              <div key={opt.id} className="relative" ref={customRef}>
                <button
                  type="button"
                  onClick={() => {
                    setCustomOpen((o) => !o);
                    onChange('custom');
                  }}
                  className={`flex min-w-[5.5rem] flex-col items-center rounded-full px-3.5 py-1.5 text-center transition-colors ${
                    selected
                      ? 'bg-sage text-white shadow-soft'
                      : 'text-ink-soft hover:bg-surface hover:text-ink'
                  }`}
                >
                  <span className="inline-flex items-center gap-1 text-xs font-medium">
                    {opt.label}
                    <ChevronDown size={12} className={selected ? 'opacity-80' : 'text-ink-faint'} />
                  </span>
                  {range && (
                    <span className={`text-[10px] leading-tight ${selected ? 'text-white/80' : 'text-ink-faint'}`}>
                      {range}
                    </span>
                  )}
                </button>
                {customOpen && (
                  <div className="absolute left-0 top-full z-20 mt-1.5 w-56 rounded-xl border border-border bg-surface p-3 shadow-soft-lg">
                    <label className="flex flex-col gap-1 text-[11px] font-medium text-ink-faint">
                      From
                      <input
                        type="date"
                        value={customFrom}
                        onChange={(e) => onCustomChange(e.target.value, customTo)}
                        className="rounded-lg border border-border-soft bg-surface-soft px-2 py-1.5 text-xs text-ink focus:border-border focus:outline-none"
                      />
                    </label>
                    <label className="mt-2 flex flex-col gap-1 text-[11px] font-medium text-ink-faint">
                      To
                      <input
                        type="date"
                        value={customTo}
                        onChange={(e) => onCustomChange(customFrom, e.target.value)}
                        className="rounded-lg border border-border-soft bg-surface-soft px-2 py-1.5 text-xs text-ink focus:border-border focus:outline-none"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={!customFrom || !customTo}
                      onClick={() => {
                        if (!customFrom || !customTo) return;
                        onChange('custom');
                        setCustomOpen(false);
                      }}
                      className="mt-3 w-full rounded-full bg-sage px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setCustomOpen(false);
                onChange(opt.id);
              }}
              className={`flex min-w-[5.5rem] flex-col items-center rounded-full px-3.5 py-1.5 text-center transition-colors ${
                selected
                  ? 'bg-sage text-white shadow-soft'
                  : 'text-ink-soft hover:bg-surface hover:text-ink'
              }`}
            >
              <span className="text-xs font-medium">{opt.label}</span>
              {range && (
                <span className={`text-[10px] leading-tight ${selected ? 'text-white/80' : 'text-ink-faint'}`}>
                  {range}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
