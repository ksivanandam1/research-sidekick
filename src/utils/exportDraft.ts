import type { ConversationTurn, FindingKind } from '../types';
import { DASHBOARD_NARRATIVE, DASHBOARD_NARRATIVE_TITLE, DASHBOARD_NEXT_STEP, getSource } from '../data/mockData';

export function buildExportDraft(turn: ConversationTurn): string {
  if (!turn.answer) return '';
  const lines: string[] = [];

  lines.push(`Q: ${turn.question}`, '', turn.answer.summary, '');

  const section = (heading: string, kind: FindingKind) => {
    const items = turn.answer!.findings.filter((f) => f.kind === kind);
    if (items.length === 0) return;
    lines.push(`${heading}:`);
    items.forEach((f) => {
      const sourceNames = f.sourceIds.filter((id) => !getSource(id).restricted).map((id) => getSource(id).name);
      const suffix = sourceNames.length ? ` (Source: ${sourceNames.join('; ')})` : '';
      lines.push(`- ${f.text}${suffix}`);
    });
    lines.push('');
  };

  section('Evidence', 'evidence');
  section('Assumptions', 'assumption');

  if (turn.answer.nextCheck) {
    lines.push(`Suggested next check: ${turn.answer.nextCheck}`);
  }

  const restrictedCount = turn.answer.findings.filter((f) => f.sourceIds.some((id) => getSource(id).restricted)).length;
  if (restrictedCount > 0) {
    lines.push(
      '',
      `Note: ${restrictedCount} restricted source(s) were referenced but excluded from this draft — confirm access before sharing externally.`,
    );
  }

  return lines.join('\n');
}

export function buildDashboardExportDraft(): string {
  const lines: string[] = [DASHBOARD_NARRATIVE_TITLE, ''];
  DASHBOARD_NARRATIVE.forEach((paragraph) => lines.push(paragraph, ''));
  lines.push(`Suggested next step: ${DASHBOARD_NEXT_STEP}`);
  return lines.join('\n');
}
