/** Prefer warm, natural English voices over the browser default (often flat/robotic). */
const PREFERRED_VOICE_PATTERNS = [
  /samantha/i,
  /karen/i,
  /moira/i,
  /serena/i,
  /google us english/i,
  /microsoft aria/i,
  /microsoft jenny/i,
  /natural/i,
  /enhanced/i,
];

export interface ReadAloudOptions {
  onStart?: () => void;
  onEnd?: () => void;
}

function pickReadAloudVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const english = voices.filter((v) => /^en([-_]|$)/i.test(v.lang));
  const pool = english.length > 0 ? english : voices;

  for (const pattern of PREFERRED_VOICE_PATTERNS) {
    const match = pool.find((v) => pattern.test(v.name));
    if (match) return match;
  }

  return pool.find((v) => v.localService) ?? pool[0] ?? null;
}

function speakWithVoice(text: string, options?: ReadAloudOptions) {
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickReadAloudVoice();
  if (voice) utterance.voice = voice;
  // Slightly brighter + quicker than defaults — slow/low defaults often sound ominous.
  utterance.rate = 1.08;
  utterance.pitch = 1.08;
  utterance.volume = 1;
  utterance.onstart = () => options?.onStart?.();
  utterance.onend = () => options?.onEnd?.();
  utterance.onerror = () => options?.onEnd?.();
  window.speechSynthesis.speak(utterance);
}

/** Strip markdown / citation noise so speech matches the visible agent response. */
export function toSpeechText(markdown: string): string {
  return markdown
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\[\d+\]/g, '')
    .replace(/^[-*•]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>>>\s+/gm, '')
    .replace(/---/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\.\s*\./g, '.')
    .trim();
}

/** Stop any in-progress read-aloud. */
export function stopReadAloud() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/** Speak plain text with a preferred natural English voice. */
export function readAloud(text: string, options?: ReadAloudOptions) {
  if (!('speechSynthesis' in window)) {
    throw new Error('Speech synthesis is not supported in this browser.');
  }

  window.speechSynthesis.cancel();

  const trimmed = text.trim();
  if (!trimmed) {
    options?.onEnd?.();
    return;
  }

  if (window.speechSynthesis.getVoices().length > 0) {
    speakWithVoice(trimmed, options);
    return;
  }

  // Chromium often loads voices asynchronously on first use.
  const onVoices = () => {
    window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
    speakWithVoice(trimmed, options);
  };
  window.speechSynthesis.addEventListener('voiceschanged', onVoices);
  // Fallback if voiceschanged never fires.
  window.setTimeout(() => {
    window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
    if (window.speechSynthesis.getVoices().length > 0) {
      speakWithVoice(trimmed, options);
    } else {
      options?.onEnd?.();
    }
  }, 250);
}
