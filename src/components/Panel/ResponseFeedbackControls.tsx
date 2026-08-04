import { useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import type { ResponseFeedback, ResponseFeedbackReason } from '../../types';
import { ResponseFeedbackModal } from './ResponseFeedbackModal';

interface ResponseFeedbackControlsProps {
  feedback?: ResponseFeedback;
  onThumbsUp: () => void;
  onThumbsDown: (reasons: ResponseFeedbackReason[], comment: string) => void;
}

export function ResponseFeedbackControls({ feedback, onThumbsUp, onThumbsDown }: ResponseFeedbackControlsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const submitted = !!feedback;

  function handleSubmit(reasons: ResponseFeedbackReason[], comment: string) {
    onThumbsDown(reasons, comment);
    setModalOpen(false);
  }

  return (
    <>
      <div className="flex items-center gap-2 border-t border-border-soft pt-3">
        <span className="text-[11px] font-medium text-ink-faint">Was this helpful?</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onThumbsUp}
            disabled={submitted}
            title="This was helpful"
            className={`rounded-full p-1 transition-colors disabled:cursor-default ${
              feedback?.value === 'up'
                ? 'bg-sage-soft text-sage'
                : 'text-ink-faint hover:bg-surface-soft hover:text-ink disabled:hover:bg-transparent disabled:hover:text-ink-faint'
            }`}
          >
            <ThumbsUp size={13} />
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            disabled={submitted}
            title="This wasn't helpful"
            className={`rounded-full p-1 transition-colors disabled:cursor-default ${
              feedback?.value === 'down'
                ? 'bg-terracotta-soft text-terracotta'
                : 'text-ink-faint hover:bg-surface-soft hover:text-ink disabled:hover:bg-transparent disabled:hover:text-ink-faint'
            }`}
          >
            <ThumbsDown size={13} />
          </button>
        </div>
      </div>

      {modalOpen && (
        <ResponseFeedbackModal onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />
      )}
    </>
  );
}
