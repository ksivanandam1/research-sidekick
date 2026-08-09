import { FileText } from 'lucide-react';
import type { GeneratedDocument } from '../../types';

interface GeneratedDocumentCardProps extends GeneratedDocument {
  onOpen?: () => void;
}

/** Document artifact styled like the composer chart context card. */
export function GeneratedDocumentCard({
  title,
  subtitle,
  format,
  onOpen,
}: GeneratedDocumentCardProps) {
  const subtitleLine = format ? `${subtitle} · ${format}` : subtitle;

  return (
    <button
      type="button"
      onClick={onOpen}
      title={`Open ${title}`}
      className="flex w-full max-w-sm items-center gap-2.5 rounded-xl bg-composer-chip py-2 pl-2 pr-3 text-left transition-colors hover:brightness-[0.98]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
        <FileText size={14} strokeWidth={2} className="text-ink" />
      </div>
      <div className="min-w-0 flex-1 pr-1">
        <p className="truncate text-sm font-semibold leading-tight text-ink">{title}</p>
        <p className="truncate text-xs leading-tight text-composer-placeholder">{subtitleLine}</p>
      </div>
    </button>
  );
}
