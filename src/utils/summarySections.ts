const VALIDATION_MARKER = '### Validation needed';

/** Pulls the validation block out of the summary so it can render in "Your next best step". */
export function splitValidationFromSummary(summary: string): {
  summaryBody: string;
  validationNeeded: string | null;
} {
  const idx = summary.indexOf(VALIDATION_MARKER);
  if (idx === -1) {
    return { summaryBody: summary, validationNeeded: null };
  }

  const before = summary.slice(0, idx).trimEnd();
  const afterMarker = summary.slice(idx + VALIDATION_MARKER.length).replace(/^\s*\n+/, '');
  const nextHeading = afterMarker.search(/\n(?:##|###)\s/);
  const validationNeeded = (
    nextHeading === -1 ? afterMarker : afterMarker.slice(0, nextHeading)
  ).trim();
  const afterValidation = nextHeading === -1 ? '' : afterMarker.slice(nextHeading).trimStart();
  const summaryBody = [before, afterValidation].filter(Boolean).join('\n\n');

  return {
    summaryBody,
    validationNeeded: validationNeeded || null,
  };
}
