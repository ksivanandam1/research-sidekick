import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { PRODUCT_OPTIONS, type ProductFilterId } from '../../data/dashboardFilters';

interface ProductFilterProps {
  value: ProductFilterId;
  onChange: (id: ProductFilterId) => void;
}

export function ProductFilter({ value, onChange }: ProductFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const label = PRODUCT_OPTIONS.find((o) => o.id === value)?.label ?? 'All tiers';

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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface px-3.5 py-2 text-xs font-medium text-ink-soft transition-colors hover:border-border hover:text-ink"
      >
        {label}
        <ChevronDown size={13} className="text-ink-faint" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1.5 min-w-[160px] rounded-xl border border-border bg-surface p-1.5 shadow-soft-lg">
          {PRODUCT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onChange(opt.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-surface-soft"
            >
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                {value === opt.id && <Check size={12} className="text-sage" />}
              </span>
              <span className={value === opt.id ? 'font-medium text-ink' : 'text-ink-soft'}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
