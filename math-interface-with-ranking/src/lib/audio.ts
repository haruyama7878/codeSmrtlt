// Tiny WebAudio sound effects — no assets needed.
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur = 0.12, type: OscillatorType = "sine", vol = 0.12, delay = 0) {
  const ac = getCtx();
  if (!ac) return;
  try {
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  } catch {
    /* ignore */
  }
}

export const sfx = {
  click: () => tone(520, 0.06, "triangle", 0.07),
  select: () => tone(660, 0.07, "triangle", 0.08),
  correct() {
    tone(659, 0.12, "sine", 0.14);
    tone(880, 0.18, "sine", 0.14, 0.09);
  },
  wrong() {
    tone(220, 0.2, "sawtooth", 0.08);
    tone(160, 0.28, "sawtooth", 0.08, 0.1);
  },
  match() {
    tone(587, 0.09, "triangle", 0.1);
    tone(784, 0.12, "triangle", 0.1, 0.07);
  },
  levelup() {
    [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.16, "triangle", 0.12, i * 0.09));
  },
};
