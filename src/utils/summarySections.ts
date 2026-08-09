const VALIDATION_MARKER = '### Validation needed';
const UNKNOWNS_MARKER = '### Unknowns';

function extractMarkedSection(
  summary: string,
  marker: string,
): { summaryBody: string; section: string | null } {
  const idx = summary.indexOf(marker);
  if (idx === -1) {
    return { summaryBody: summary, section: null };
  }

  const before = summary.slice(0, idx).trimEnd();
  const afterMarker = summary.slice(idx + marker.length).replace(/^\s*\n+/, '');
  const nextHeading = afterMarker.search(/\n(?:##|###)\s/);
  const section = (nextHeading === -1 ? afterMarker : afterMarker.slice(0, nextHeading)).trim();
  const afterSection = nextHeading === -1 ? '' : afterMarker.slice(nextHeading).trimStart();
  const summaryBody = [before, afterSection].filter(Boolean).join('\n\n');

  return {
    summaryBody,
    section: section || null,
  };
}

/** Pulls the validation block out of the summary so it can render in "Suggested next steps". */
export function splitValidationFromSummary(summary: string): {
  summaryBody: string;
  validationNeeded: string | null;
} {
  const { summaryBody, section } = extractMarkedSection(summary, VALIDATION_MARKER);
  return {
    summaryBody,
    validationNeeded: section,
  };
}

/** Pulls the unknowns block out of the summary so it can render like Assumptions. */
export function splitUnknownsFromSummary(summary: string): {
  summaryBody: string;
  unknowns: string | null;
} {
  const { summaryBody, section } = extractMarkedSection(summary, UNKNOWNS_MARKER);
  return {
    summaryBody,
    unknowns: section,
  };
}

/** Bullet lines from an unknowns markdown block. */
export function parseUnknownBullets(unknowns: string): string[] {
  return unknowns
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-*•]\s/.test(line))
    .map((line) => line.replace(/^[-*•]\s*/, ''));
}
