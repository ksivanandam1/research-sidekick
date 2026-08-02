import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useResearch } from '../../state/ResearchContext';
import { SuggestedQuestions } from './SuggestedQuestions';

export function FollowUpInput() {
  const { attachedContext, pendingPrefill, consumePrefill, submitQuestion } = useResearch();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (pendingPrefill) {
      setValue(pendingPrefill);
      consumePrefill();
    }
  }, [pendingPrefill, consumePrefill]);

  const disabled = attachedContext.length === 0;

  function handleSubmit(question?: string) {
    const text = question ?? value;
    if (!text.trim() || disabled) return;
    submitQuestion(text);
    setValue('');
  }

  return (
    <div className="border-t border-border bg-surface px-5 py-3">
      <SuggestedQuestions onSelect={(q) => handleSubmit(q)} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex items-center gap-2"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={disabled ? 'Attach a chart to ask a question…' : 'Ask a follow-up…'}
          disabled={disabled}
          className="flex-1 rounded-full border border-border-soft bg-surface-soft px-3.5 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-border focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          title="Send"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-surface transition-opacity disabled:opacity-30"
        >
          <ArrowUp size={16} />
        </button>
      </form>
    </div>
  );
}
