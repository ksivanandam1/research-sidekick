import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useResearch } from '../../state/ResearchContext';
import { ComposerContextStrip } from './ContextTray';
import { PinTriggerToggle } from './PinTriggerToggle';
import { SuggestedQuestions } from './SuggestedQuestions';

export function FollowUpInput() {
  const { attachedContext, pendingPrefill, consumePrefill, submitQuestion, turns } = useResearch();
  const [value, setValue] = useState('');
  const showSuggestions = turns.length === 0;

  useEffect(() => {
    if (pendingPrefill) {
      setValue(pendingPrefill);
      consumePrefill();
    }
  }, [pendingPrefill, consumePrefill]);

  function handleSubmit(question?: string) {
    const text = question ?? value;
    if (!text.trim()) return;
    submitQuestion(text);
    setValue('');
  }

  return (
    <div className="border-t border-border bg-surface px-5 py-3">
      <PinTriggerToggle />
      {showSuggestions && <SuggestedQuestions onSelect={(q) => handleSubmit(q)} />}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="rounded-2xl bg-composer px-3 py-2.5"
      >
        <ComposerContextStrip />
        <div className="flex items-center gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={
              attachedContext.length === 0
                ? 'Ask about company performance…'
                : 'Ask a follow-up…'
            }
            className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-sm text-ink placeholder:text-composer-placeholder focus:outline-none"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            title="Send"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage text-white transition-opacity disabled:opacity-30"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
