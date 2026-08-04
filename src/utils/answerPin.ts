import type { Answer } from '../types';

/** True when any finding offers an investigate path. */
export function answerCanSpawnChild(answer: Answer): boolean {
  return answer.findings.some((f) => !!f.investigateQuestion);
}

/**
 * Pin title: first `## ` heading in summary, else thin auto-headline when
 * the answer can spawn a child, else null (leaf / nothing to pin).
 */
export function getAnswerHeadline(answer: Answer): string | null {
  const heading = answer.summary.match(/^##\s+(.+)$/m);
  if (heading?.[1]) return heading[1].trim();

  if (answerCanSpawnChild(answer)) {
    const plain = answer.summary
      .replace(/^#+\s+/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\[\d+\]/g, '')
      .replace(/^>>>\s+/gm, '')
      .trim();
    const first = plain.split(/(?<=\.)\s+/)[0] ?? plain;
    const line = first.split('\n')[0]?.trim() ?? '';
    if (!line) return null;
    return line.length > 100 ? `${line.slice(0, 99)}…` : line;
  }

  return null;
}

/** First body paragraph after the `##` heading; null if none. */
export function getPinExpandDetail(answer: Answer): string | null {
  const blocks = answer.summary.split(/\n\n+/);
  const headingIdx = blocks.findIndex((b) => b.trim().startsWith('## '));
  if (headingIdx < 0) return null;
  for (let i = headingIdx + 1; i < blocks.length; i += 1) {
    const t = blocks[i].trim();
    if (!t || t.startsWith('#') || t.startsWith('>>>')) continue;
    return t.replace(/\*\*/g, '').replace(/\[\d+\]/g, '').trim();
  }
  return null;
}
