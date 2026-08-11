import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Mic, Square } from 'lucide-react';
import { ComposerQuickActionsMenu } from '../ComposerQuickActionsMenu';
import { useResearch } from '../../state/ResearchContext';
import { isAssumptionContext } from '../../types';
import { ComposerContextStrip } from './ContextTray';
import { SuggestedQuestions } from './SuggestedQuestions';
// import { PinTriggerToggle } from './PinTriggerToggle'; // hidden for now — restore when needed

const promptBtnClass =
  'prompt-rise inline-flex max-w-full items-center rounded-lg border border-border-soft bg-surface px-3 py-1.5 text-left text-sm font-medium text-ink-soft transition-colors hover:border-border hover:text-ink';

const composerIconBtn =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-soft text-ink-soft transition-colors hover:border-border hover:text-ink';

interface FollowUpInputProps {
  /** Suggested / notify chips only when the transcript is scrolled to the bottom. */
  showPrompts?: boolean;
}

export function FollowUpInput({ showPrompts = true }: FollowUpInputProps) {
  const {
    attachedContext,
    pendingPrefill,
    consumePrefill,
    submitQuestion,
    stopRun,
    showToast,
    turns,
  } = useResearch();
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const activeRunTurn =
    [...turns].reverse().find((t) => t.stage !== 'ready' && !t.stopped) ?? null;
  const isGenerating = activeRunTurn != null;

  const showAttachSuggestions = showPrompts && turns.length === 0;

  const latestTurn = turns[turns.length - 1] ?? null;
  const answerFollowUps =
    latestTurn?.stage === 'ready' &&
    latestTurn.answer?.followUpPrompts &&
    latestTurn.answer.followUpPrompts.length > 0
      ? latestTurn.answer.followUpPrompts
      : null;
  const showAnswerFollowUps = showPrompts && !!answerFollowUps;

  useEffect(() => {
    if (pendingPrefill) {
      setValue(pendingPrefill);
      consumePrefill();
    }
  }, [pendingPrefill, consumePrefill]);

  useEffect(() => {
    if (attachedContext.some(isAssumptionContext)) {
      inputRef.current?.focus();
    }
  }, [attachedContext]);

  function handleSubmit(question?: string) {
    const text = question ?? value;
    if (!text.trim()) return;
    submitQuestion(text);
    setValue('');
  }

  function handleStop() {
    if (!activeRunTurn) return;
    stopRun(activeRunTurn.id);
  }

  function handleVoiceDictation() {
    showToast('Voice dictation is coming soon.');
  }

  return (
    <div className="bg-surface px-5 pb-3 pt-1">
      {/* <PinTriggerToggle /> */}
      {showAttachSuggestions && (
        <div key="attach-prompts" className="mb-2 overflow-hidden">
          <SuggestedQuestions onSelect={(q) => handleSubmit(q)} />
        </div>
      )}

      {showAnswerFollowUps && answerFollowUps && (
        <div
          key="answer-follow-ups"
          className="prompt-stack mb-2 flex flex-col items-end gap-1.5 overflow-hidden"
        >
          {answerFollowUps.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSubmit(prompt)}
              className={promptBtnClass}
            >
              <span className="truncate">{prompt}</span>
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isGenerating) return;
          handleSubmit();
        }}
        className="rounded-2xl border border-border-soft bg-composer px-3 py-2.5"
      >
        <ComposerContextStrip />
        <div className="flex items-center gap-2">
          <ComposerQuickActionsMenu
            onSelect={(question) => handleSubmit(question)}
            disabled={isGenerating}
          />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={
              attachedContext.some(isAssumptionContext)
                ? 'Clarify this assumption…'
                : attachedContext.length === 0
                  ? 'Ask a question about this dashboard'
                  : 'Dig deeper…'
            }
            className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-sm text-ink placeholder:text-composer-placeholder focus:outline-none"
          />
          <button
            type="button"
            onClick={handleVoiceDictation}
            title="Voice dictation (coming soon)"
            aria-label="Voice dictation"
            className={composerIconBtn}
          >
            <Mic size={16} strokeWidth={1.75} />
          </button>
          {isGenerating ? (
            <button
              type="button"
              onClick={handleStop}
              title="Stop response"
              aria-label="Stop response"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-opacity hover:opacity-90"
            >
              <Square size={13} fill="currentColor" strokeWidth={0} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!value.trim()}
              title="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage text-white transition-opacity disabled:opacity-30"
            >
              <ArrowUp size={16} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
