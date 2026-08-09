import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { QUICK_ACTIONS } from '../data/quickActions';

const triggerBtnClass =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-soft text-ink-soft transition-colors hover:border-border hover:text-ink disabled:opacity-40';

const menuItemClass =
  'flex w-full items-center rounded-lg px-2.5 py-2 text-left text-sm text-ink-soft transition-colors hover:bg-surface-soft hover:text-ink';

interface ComposerQuickActionsMenuProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export function ComposerQuickActionsMenu({ onSelect, disabled = false }: ComposerQuickActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  function handleSelect(question: string) {
    onSelect(question);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 z-20 mb-2 min-w-[12rem] max-w-[min(100vw-2rem,20rem)] rounded-xl border border-border bg-surface p-1.5 shadow-soft-lg"
        >
          {QUICK_ACTIONS.map(({ label, question }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              onClick={() => handleSelect(question)}
              className={menuItemClass}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        disabled={disabled}
        title="Suggested prompts"
        aria-label="Suggested prompts"
        aria-expanded={open}
        aria-haspopup="menu"
        className={`${triggerBtnClass}${open ? ' border-border bg-surface-soft text-ink' : ''}`}
      >
        <Plus size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
