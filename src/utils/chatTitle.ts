const QUESTION_PREFIXES = [
  /^why did (?:the )?/i,
  /^why (?:was|is|has|have) (?:the )?/i,
  /^how does (?:the )?/i,
  /^how (?:did|is|are) (?:the )?/i,
  /^what (?:is|are|was|were) (?:driving|causing) (?:the )?/i,
  /^what (?:is|are) (?:the )?/i,
  /^which (?:segment|channel|tier) is /i,
  /^can you explain (?:why )?(?:the )?/i,
  /^explain (?:why )?(?:the )?/i,
  /^tell me (?:about )?(?:the )?/i,
  /^dig deeper(?: on| into)? (?:the )?/i,
  /^clarify (?:this )?(?:assumption:? )?/i,
];

const WORD_REPLACEMENTS: [RegExp, string][] = [
  [/\bdip(ped|s)?\b/gi, 'decline'],
  [/\bdrop(ped|s)?\b/gi, 'decline'],
  [/\bfell?\b/gi, 'decline'],
  [/\bdown\b/gi, 'decline'],
  [/\bincrease[sd]?\b/gi, 'increase'],
  [/\brise[sd]?\b/gi, 'increase'],
  [/\bcompare[sd]? to (?:the )?plan\b/gi, 'vs plan'],
  [/\bcompare[sd]? to\b/gi, 'vs'],
];

function sentenceCase(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (/^q\d$/i.test(word)) return word.toUpperCase();
      if (index === 0) return lower.charAt(0).toUpperCase() + lower.slice(1);
      return lower;
    })
    .join(' ');
}

function stripQuestionPrefix(question: string): string {
  let text = question.trim().replace(/\?+$/, '').trim();
  for (const prefix of QUESTION_PREFIXES) {
    if (prefix.test(text)) {
      text = text.replace(prefix, '').trim();
      break;
    }
  }
  return text;
}

function normalizeQuestionText(text: string): string {
  let normalized = text;
  for (const [pattern, replacement] of WORD_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized.replace(/\s+/g, ' ').trim();
}

/** Derive a short chat title from the first user question. */
export function deriveChatTitle(question: string, maxLength = 48): string {
  const stripped = stripQuestionPrefix(question);
  const normalized = normalizeQuestionText(stripped || question.trim().replace(/\?+$/, ''));
  const titled = sentenceCase(normalized);
  if (titled.length <= maxLength) return titled;
  return `${titled.slice(0, maxLength - 1).trimEnd()}…`;
}
