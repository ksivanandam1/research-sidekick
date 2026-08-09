import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Menu, Share2, SquarePen, X } from 'lucide-react';

export interface ChatHistoryListItem {
  id: string;
  title: string;
  isActive: boolean;
}

interface PanelHeaderProps {
  title: string;
  onClose: () => void;
  onShare: () => void;
  onNewChat: () => void;
  shareDisabled: boolean;
  chats: ChatHistoryListItem[];
  onSelectChat: (chatId: string) => void;
}

const iconBtn =
  'flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface-soft hover:text-ink';

export function PanelHeader({
  title,
  onClose,
  onShare,
  onNewChat,
  shareDisabled,
  chats,
  onSelectChat,
}: PanelHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="border-b border-border px-3 py-2.5">
      <div className="flex items-center gap-1">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            title="Chat history"
            aria-label="Chat history"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((open) => !open)}
            className={iconBtn}
          >
            <Menu size={18} strokeWidth={1.75} />
          </button>

          {menuOpen && (
            <div
              role="menu"
              aria-label="Chat history"
              className="absolute left-0 top-full z-30 mt-1 w-64 overflow-hidden rounded-xl border border-border-soft bg-surface py-1 shadow-soft-lg"
            >
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                Chats
              </p>
              {chats.length === 0 ? (
                <p className="px-3 py-2 text-sm text-ink-faint">No chats in this session yet</p>
              ) : (
                <ul className="max-h-72 overflow-y-auto py-0.5">
                  {chats.map((chat) => (
                    <li key={chat.id}>
                      <button
                        type="button"
                        role="menuitem"
                        disabled={chat.isActive}
                        onClick={() => {
                          onSelectChat(chat.id);
                          setMenuOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                          chat.isActive
                            ? 'bg-surface-soft font-medium text-ink'
                            : 'text-ink hover:bg-surface-soft'
                        }`}
                      >
                        <span className="min-w-0 flex-1 truncate">{chat.title}</span>
                        {chat.isActive && (
                          <Check size={14} strokeWidth={2} className="shrink-0 text-ink-soft" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          title={title}
          className="inline-flex min-w-0 max-w-[min(100%,14rem)] items-center gap-1 rounded-lg px-1.5 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-soft"
        >
          <span className="truncate">{title}</span>
          <ChevronDown size={14} strokeWidth={2} className="shrink-0 text-ink-faint" />
        </button>

        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={onNewChat}
            title="New chat"
            aria-label="New chat"
            className={iconBtn}
          >
            <SquarePen size={16} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={onShare}
            disabled={shareDisabled}
            title="Review & share"
            aria-label="Share"
            className={`${iconBtn} disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-soft`}
          >
            <Share2 size={16} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close panel"
            aria-label="Close panel"
            className={iconBtn}
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
