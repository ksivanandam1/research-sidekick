let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedContext) {
    sharedContext = new AudioContext();
  }
  return sharedContext;
}

/** Short two-tone chime when an agent answer finishes loading. */
export function playResponseReadySound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  const start = ctx.currentTime;
  const master = ctx.createGain();
  master.connect(ctx.destination);
  master.gain.setValueAtTime(0.0001, start);
  master.gain.exponentialRampToValueAtTime(0.4, start + 0.008);
  master.gain.exponentialRampToValueAtTime(0.0001, start + 0.42);

  const audio = ctx;
  function tone(frequency: number, at: number, duration: number) {
    const osc = audio.createOscillator();
    const env = audio.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, at);
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(1, at + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    osc.connect(env);
    env.connect(master);
    osc.start(at);
    osc.stop(at + duration + 0.02);
  }

  // Soft ascending pair — similar to a completion ding.
  tone(659.25, start, 0.14); // E5
  tone(987.77, start + 0.1, 0.22); // B5
}
