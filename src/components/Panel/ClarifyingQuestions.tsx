import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Pencil } from 'lucide-react';
import type { ClarifyingQuestion, ClarifyingRound } from '../../types';

interface ClarifyingQuestionsProps {
  clarifying: ClarifyingRound;
  onSelect: (optionId: string, customLabel?: string) => void;
  /** When false, the active question card is omitted (rendered in the floating dock instead). */
  showActiveCard?: boolean;
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[85%] bg-sage-soft px-3.5 py-2.5 text-sm font-medium text-ink"
        style={{ borderRadius: '16px 16px 16px 0px' }}
      >
        {text}
      </div>
    </div>
  );
}

export function ActiveClarifyingCard({
  question,
  index,
  total,
  onSelect,
}: {
  question: ClarifyingQuestion;
  index: number;
  total: number;
  onSelect: (optionId: string, customLabel?: string) => void;
}) {
  const [editingOther, setEditingOther] = useState(false);
  const [otherText, setOtherText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditingOther(false);
    setOtherText('');
  }, [question.id]);

  useEffect(() => {
    if (editingOther) inputRef.current?.focus();
  }, [editingOther]);

  function submitOther() {
    const trimmed = otherText.trim();
    if (!trimmed) return;
    onSelect('other', trimmed);
  }

  return (
    <div className="rounded-xl border border-border/80 bg-surface p-3.5 shadow-[0_12px_40px_-12px_rgba(36,33,27,0.35)]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        Question {index + 1} of {total}
      </p>
      <p className="mt-1.5 text-sm font-medium text-ink">{question.prompt}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-soft">{question.why}</p>
      <div className="mt-3 flex flex-col gap-1.5">
        {question.options.map((option) => {
          if (option.id === 'other') {
            if (editingOther) {
              return (
                <form
                  key={option.id}
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitOther();
                  }}
                  className="flex items-center gap-2 rounded-xl border border-sage/40 bg-surface px-3 py-2"
                >
                  <Pencil size={14} className="shrink-0 text-ink-faint" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    placeholder="Something else"
                    className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!otherText.trim()}
                    title="Submit"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-surface disabled:opacity-30"
                  >
                    <ArrowUp size={14} />
                  </button>
                </form>
              );
            }

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setEditingOther(true)}
                className="flex items-center gap-2 rounded-xl border border-dashed border-border-soft bg-surface-soft px-3 py-2.5 text-left text-sm text-ink-faint transition-colors hover:border-sage/40 hover:bg-sage-soft/60 hover:text-ink-soft"
              >
                <Pencil size={14} className="shrink-0" />
                <span>Something else</span>
              </button>
            );
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className="rounded-xl border border-border-soft bg-surface-soft px-3 py-2.5 text-left text-sm text-ink transition-colors hover:border-sage/40 hover:bg-sage-soft/60"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Thread history for clarifying rounds (intro + answered pairs). */
export function ClarifyingQuestions({
  clarifying,
  onSelect,
  showActiveCard = true,
}: ClarifyingQuestionsProps) {
  const { intro, questions, currentIndex, responses } = clarifying;
  const active = currentIndex < questions.length ? questions[currentIndex] : null;
  const showIntro = responses.length === 0;

  return (
    <div className="flex flex-col gap-3">
      {showIntro && (
        <p className="text-sm font-normal leading-relaxed text-ink">{intro}</p>
      )}

      {responses.map((response) => {
        const q = questions.find((item) => item.id === response.questionId);
        return (
          <div key={`${response.questionId}-${response.optionId}-${response.label}`} className="flex flex-col gap-2">
            {q && (
              <div className="rounded-xl border border-border-soft bg-surface-soft px-3 py-2.5">
                <p className="text-sm font-medium text-ink">{q.prompt}</p>
              </div>
            )}
            <UserBubble text={response.label} />
          </div>
        );
      })}

      {showActiveCard && active && (
        <ActiveClarifyingCard
          question={active}
          index={currentIndex}
          total={questions.length}
          onSelect={onSelect}
        />
      )}
    </div>
  );
}
