import { Sparkles } from 'lucide-react';
import { getKpi } from '../../data/mockData';
import { useResearch } from '../../state/ResearchContext';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  const { attachedContext } = useResearch();

  if (attachedContext.length === 0) return null;

  const questions = Array.from(new Set(attachedContext.flatMap((id) => getKpi(id).suggestedQuestions))).slice(0, 3);
  if (questions.length === 0) return null;

  return (
    <div className="mb-2 flex flex-wrap gap-1.5">
      {questions.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onSelect(q)}
          className="inline-flex items-center gap-1 rounded-full border border-border-soft bg-surface-soft px-2.5 py-1 text-[11px] font-medium text-ink-soft transition-colors hover:border-border hover:text-ink"
        >
          <Sparkles size={10} />
          {q}
        </button>
      ))}
    </div>
  );
}
