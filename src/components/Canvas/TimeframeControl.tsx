import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  THIS_QUARTER_RANGE,
  formatTimeframeLabel,
  type TimeframeSelection,
} from '../../data/dashboardFilters';

interface TimeframeControlProps {
  value: TimeframeSelection;
  onChange: (selection: TimeframeSelection) => void;
}

function parseIso(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1, 12);
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBetween(day: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const t = day.getTime();
  return t > start.getTime() && t < end.getTime();
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function shortDate(iso: string): string {
  return parseIso(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function buildMonthDays(month: Date): (Date | null)[] {
  const first = startOfMonth(month);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const startWeekday = first.getDay(); // 0 Sun
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), day, 12));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const pillBase =
  'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors';
const pillActive = 'border-ink bg-ink text-surface';
const pillIdle = 'border-border-soft bg-surface text-ink-soft hover:border-border hover:text-ink';

export function TimeframeControl({ value, onChange }: TimeframeControlProps) {
  const isQuarter = value.preset === 'thisQuarter';
  const [open, setOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(value.startDate);
  const [draftEnd, setDraftEnd] = useState(value.endDate);
  const [picking, setPicking] = useState<'start' | 'end'>('start');
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(parseIso(value.startDate)));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setDraftStart(value.startDate);
    setDraftEnd(value.endDate);
    setPicking('start');
    setVisibleMonth(startOfMonth(parseIso(value.startDate)));
  }, [open, value.startDate, value.endDate]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const days = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth]);
  const startDate = parseIso(draftStart);
  const endDate = parseIso(draftEnd);

  function selectThisQuarter() {
    onChange({
      preset: 'thisQuarter',
      startDate: THIS_QUARTER_RANGE.startDate,
      endDate: THIS_QUARTER_RANGE.endDate,
    });
    setOpen(false);
  }

  function handleDayClick(day: Date) {
    const iso = toIso(day);
    if (picking === 'start' || iso < draftStart) {
      setDraftStart(iso);
      setDraftEnd(iso);
      setPicking('end');
      return;
    }
    setDraftEnd(iso);
    setPicking('start');
  }

  function applyCustom() {
    const start = draftStart <= draftEnd ? draftStart : draftEnd;
    const end = draftStart <= draftEnd ? draftEnd : draftStart;
    const matchesQuarter =
      start === THIS_QUARTER_RANGE.startDate && end === THIS_QUARTER_RANGE.endDate;
    onChange({
      preset: matchesQuarter ? 'thisQuarter' : 'custom',
      startDate: start,
      endDate: end,
    });
    setOpen(false);
  }

  const customLabel = isQuarter ? 'Custom' : formatTimeframeLabel(value);

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Timeframe">
      <button
        type="button"
        onClick={selectThisQuarter}
        aria-pressed={isQuarter}
        className={`${pillBase} ${isQuarter ? pillActive : pillIdle}`}
      >
        This quarter
      </button>

      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-pressed={!isQuarter}
          className={`${pillBase} ${!isQuarter ? pillActive : pillIdle}`}
        >
          <span className="max-w-[180px] truncate">{customLabel}</span>
          <ChevronDown size={13} className={!isQuarter ? 'text-surface/70' : 'text-ink-faint'} />
        </button>

        {open && (
          <div
            role="dialog"
            aria-label="Custom date range"
            className="absolute left-0 top-full z-30 mt-1.5 w-[280px] rounded-xl border border-border bg-surface p-3 shadow-soft-lg"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setVisibleMonth((m) => addMonths(m, -1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface-soft hover:text-ink"
                aria-label="Previous month"
              >
                <ChevronLeft size={14} />
              </button>
              <p className="text-xs font-semibold text-ink">{monthLabel(visibleMonth)}</p>
              <button
                type="button"
                onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface-soft hover:text-ink"
                aria-label="Next month"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-0.5">
              {WEEKDAYS.map((d) => (
                <span key={d} className="py-1 text-center text-[10px] font-medium text-ink-faint">
                  {d}
                </span>
              ))}
            </div>

            <div className="mb-3 grid grid-cols-7 gap-0.5">
              {days.map((day, i) => {
                if (!day) return <span key={`empty-${i}`} />;
                const iso = toIso(day);
                const selected = sameDay(day, startDate) || sameDay(day, endDate);
                const inRange = isBetween(day, startDate, endDate);
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={`flex h-8 items-center justify-center rounded-lg text-[11px] transition-colors ${
                      selected
                        ? 'bg-ink font-semibold text-surface'
                        : inRange
                          ? 'bg-surface-soft font-medium text-ink'
                          : 'text-ink-soft hover:bg-surface-soft hover:text-ink'
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="mb-3 flex items-center justify-between gap-2 rounded-lg bg-surface-soft px-2.5 py-2 text-[11px] text-ink-soft">
              <span>
                <span className="text-ink-faint">From </span>
                <span className="font-medium text-ink">{shortDate(draftStart)}</span>
              </span>
              <span>
                <span className="text-ink-faint">To </span>
                <span className="font-medium text-ink">{shortDate(draftEnd)}</span>
              </span>
            </div>

            <p className="mb-2.5 text-[11px] text-ink-faint">
              {picking === 'start' ? 'Select a start date' : 'Select an end date'}
            </p>

            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-border-soft px-2.5 py-1 text-[11px] font-medium text-ink-soft transition-colors hover:border-border hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyCustom}
                className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium text-surface transition-opacity hover:opacity-90"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
