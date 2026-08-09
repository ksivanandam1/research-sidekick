import { useRef, useState } from 'react';
import { ArrowUp, Mic } from 'lucide-react';
import { ComposerQuickActionsMenu } from '../ComposerQuickActionsMenu';
import { useResearch } from '../../state/ResearchContext';

const PLACEHOLDER = 'Ask a question about this dashboard';

const composerIconBtn =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-soft text-ink-soft transition-colors hover:border-border hover:text-ink';

export function FloatingResearchBar() {
  const { panelOpen, openPanel, submitQuestion, showToast } = useResearch();
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  if (panelOpen) return null;

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    openPanel();
    submitQuestion(trimmed);
    setText('');
    setFocused(false);
  }

  function handleQuickAction(question: string) {
    openPanel();
    submitQuestion(question);
    setText('');
    setFocused(false);
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-xl">
        <div ref={rootRef} data-floating-research-bar className="relative">
          <div
            className={`flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 shadow-soft-lg transition-shadow ${
              focused ? 'ring-2 ring-sage/25' : ''
            }`}
          >
            <ComposerQuickActionsMenu onSelect={handleQuickAction} />
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                window.setTimeout(() => {
                  if (document.activeElement?.closest('[data-floating-research-bar]') == null) {
                    setFocused(false);
                  }
                }, 0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={PLACEHOLDER}
              className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
            />
            <button
              type="button"
              onClick={() => showToast('Voice dictation is coming soon.')}
              title="Voice mode (coming soon)"
              aria-label="Voice mode"
              className={composerIconBtn}
            >
              <Mic size={16} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!text.trim()}
              title="Open research panel"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-surface transition-opacity disabled:opacity-35"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
