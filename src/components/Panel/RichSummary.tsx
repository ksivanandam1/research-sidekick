import type { ReactNode } from 'react';
import { Compass } from 'lucide-react';

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function renderBlock(block: string, key: number) {
  const trimmed = block.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('## ')) {
    return (
      <h2 key={key} className="text-sm font-semibold leading-snug text-ink">
        {renderInline(trimmed.slice(3))}
      </h2>
    );
  }
  if (trimmed.startsWith('### ')) {
    return (
      <h3 key={key} className="text-sm font-semibold leading-snug text-ink">
        {renderInline(trimmed.slice(4))}
      </h3>
    );
  }
  // Callout — same chrome as AnswerSection "Suggested next check"
  if (trimmed.startsWith('>>> ')) {
    const [titleLine, ...rest] = trimmed.slice(4).split('\n');
    const body = rest.join('\n').trim();
    return (
      <div
        key={key}
        className="flex items-start gap-2 rounded-xl border border-ocean-soft bg-ocean-soft/60 p-3"
      >
        <Compass size={14} className="mt-0.5 shrink-0 text-ocean" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ocean">{titleLine}</p>
          {body ? (
            <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{renderInline(body)}</p>
          ) : null}
        </div>
      </div>
    );
  }

  const lines = trimmed.split('\n');
  const isList = lines.every((line) => /^\d+\.\s/.test(line.trim()) || line.trim() === '');
  if (isList) {
    return (
      <ol key={key} className="list-decimal space-y-1.5 pl-4 text-sm leading-relaxed text-ink">
        {lines
          .filter((line) => line.trim())
          .map((line, i) => (
            <li key={i}>{renderInline(line.replace(/^\d+\.\s*/, ''))}</li>
          ))}
      </ol>
    );
  }

  return (
    <p key={key} className="text-sm font-normal leading-relaxed text-ink">
      {renderInline(trimmed)}
    </p>
  );
}

interface RichSummaryProps {
  text: string;
}

export function RichSummary({ text }: RichSummaryProps) {
  return (
    <div className="flex flex-col gap-3">
      {text.split(/\n\n+/).map((block, i) => renderBlock(block, i))}
    </div>
  );
}
