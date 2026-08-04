import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
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

function CustomRangePanel({
  customFrom,
  customTo,
  onCustomChange,
  onApply,
}: {
  customFrom: string;
  customTo: string;
  onCustomChange: (from: string, to: string) => void;
  onApply: () => void;
}) {
  return (
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
        onClick={onApply}
        className="mt-3 w-full rounded-full bg-sage px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
      >
        Apply
      </button>
    </div>
  );
}

export function TimeframeControl({
  value,
  onChange,
  customFrom,
  customTo,
  onCustomChange,
}: TimeframeControlProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const customLabel = formatCustomRange(customFrom, customTo);
  const selected = TIMEFRAME_OPTIONS.find((o) => o.id === value);
  const selectedRange =
    value === 'custom' ? (customLabel || null) : (selected?.resolvedRange ?? null);

  useEffect(() => {
    if (!customOpen && !menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setCustomOpen(false);
        setMenuOpen(false);
      }
    }
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setCustomOpen(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [customOpen, menuOpen]);

  function applyCustom() {
    if (!customFrom || !customTo) return;
    onChange('custom');
    setCustomOpen(false);
    setMenuOpen(false);
  }

  function selectPreset(id: TimeframePreset) {
    if (id === 'custom') {
      onChange('custom');
      setMenuOpen(false);
      setCustomOpen(true);
      return;
    }
    setCustomOpen(false);
    setMenuOpen(false);
    onChange(id);
  }

  return (
    <div className="flex flex-wrap items-end gap-3" ref={rootRef}>
      <span className="pb-2 text-xs font-medium text-ink-faint">Timeframe</span>

      {/* Compact dropdown — small & medium */}
      <div className="relative lg:hidden">
        <button
          type="button"
          onClick={() => {
            setMenuOpen((o) => !o);
            setCustomOpen(false);
          }}
          aria-expanded={menuOpen}
          className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface px-3.5 py-2 text-left transition-colors hover:border-border hover:text-ink"
        >
          <span className="flex min-w-0 flex-col">
            <span className="text-xs font-medium text-ink-soft">{selected?.label ?? 'Timeframe'}</span>
            {selectedRange && (
              <span className="text-[10px] leading-tight text-ink-faint">{selectedRange}</span>
            )}
          </span>
          <ChevronDown size={13} className="shrink-0 text-ink-faint" />
        </button>

        {menuOpen && (
          <div className="absolute left-0 top-full z-20 mt-1.5 min-w-[200px] rounded-xl border border-border bg-surface p-1.5 shadow-soft-lg">
            {TIMEFRAME_OPTIONS.map((opt) => {
              const range =
                opt.id === 'custom'
                  ? value === 'custom'
                    ? customLabel
                    : null
                  : opt.resolvedRange;
              const isSelected = value === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => selectPreset(opt.id)}
                  className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-surface-soft"
                >
                  <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                    {isSelected && <Check size={12} className="text-sage" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-xs ${isSelected ? 'font-medium text-ink' : 'text-ink-soft'}`}
                    >
                      {opt.label}
                    </span>
                    {range && (
                      <span className="block text-[10px] leading-tight text-ink-faint">{range}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {customOpen && (
          <CustomRangePanel
            customFrom={customFrom}
            customTo={customTo}
            onCustomChange={onCustomChange}
            onApply={applyCustom}
          />
        )}
      </div>

      {/* Segmented control — large */}
      <div className="relative hidden items-stretch gap-1 rounded-full bg-surface-soft p-1 lg:inline-flex">
        {TIMEFRAME_OPTIONS.map((opt) => {
          const isSelected = value === opt.id;
          const range =
            opt.id === 'custom' ? (value === 'custom' ? customLabel : null) : opt.resolvedRange;

          if (opt.id === 'custom') {
            return (
              <div key={opt.id} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setCustomOpen((o) => !o);
                    onChange('custom');
                  }}
                  className={`flex min-w-[5.5rem] flex-col items-center rounded-full px-3.5 py-1.5 text-center transition-colors ${
                    isSelected
                      ? 'bg-sage text-white shadow-soft'
                      : 'text-ink-soft hover:bg-surface hover:text-ink'
                  }`}
                >
                  <span className="inline-flex items-center gap-1 text-xs font-medium">
                    {opt.label}
                    <ChevronDown
                      size={12}
                      className={isSelected ? 'opacity-80' : 'text-ink-faint'}
                    />
                  </span>
                  {range && (
                    <span
                      className={`text-[10px] leading-tight ${isSelected ? 'text-white/80' : 'text-ink-faint'}`}
                    >
                      {range}
                    </span>
                  )}
                </button>
                {customOpen && (
                  <CustomRangePanel
                    customFrom={customFrom}
                    customTo={customTo}
                    onCustomChange={onCustomChange}
                    onApply={applyCustom}
                  />
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
                isSelected
                  ? 'bg-sage text-white shadow-soft'
                  : 'text-ink-soft hover:bg-surface hover:text-ink'
              }`}
            >
              <span className="text-xs font-medium">{opt.label}</span>
              {range && (
                <span
                  className={`text-[10px] leading-tight ${isSelected ? 'text-white/80' : 'text-ink-faint'}`}
                >
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
