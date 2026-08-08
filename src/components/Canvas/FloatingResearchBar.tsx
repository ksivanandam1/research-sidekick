import { useState } from 'react';
import { ArrowUp, Dna, ImagePlus, Mic } from 'lucide-react';
import { useResearch } from '../../state/ResearchContext';

const PLACEHOLDER = 'Get the latest insights on the revenue dip this quarter.';
const SUMMARISE_QUESTION =
  'Why did revenue dip in Q3, and where does the miss actually live by tier and channel?';

export function FloatingResearchBar() {
  const { panelOpen, openPanel, submitQuestion } = useResearch();
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);

  if (panelOpen) return null;

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    openPanel();
    submitQuestion(trimmed);
    setText('');
    setFocused(false);
  }

  function handleSummarise() {
    openPanel();
    submitQuestion(SUMMARISE_QUESTION);
    setText('');
    setFocused(false);
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-4">
      <div className="pointer-events-auto flex w-full max-w-xl flex-col items-stretch gap-2">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSummarise}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-medium text-ink-soft shadow-soft transition-colors hover:border-border hover:text-ink"
          >
            <Dna size={12} className="text-sage" />
            Summarise
          </button>
        </div>

        <div
          data-floating-research-bar
          className={`flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 shadow-soft-lg transition-shadow ${
            focused ? 'ring-2 ring-sage/25' : ''
          }`}
        >
          {focused && (
            <>
              <button
                type="button"
                title="Attach images or charts (coming soon)"
                aria-label="Attach images or charts"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-soft text-ink-soft"
              >
                <ImagePlus size={15} />
              </button>
              <button
                type="button"
                title="Voice mode (coming soon)"
                aria-label="Voice mode"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-soft text-ink-soft"
              >
                <Mic size={15} />
              </button>
            </>
          )}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              // Keep chrome visible briefly if empty so click on +/mic still works;
              // collapse when leaving the bar entirely.
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
  );
}
