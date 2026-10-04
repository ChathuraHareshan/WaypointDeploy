let ctx;
export function chime(times = 1) {
  if (!navigator.userActivation?.hasBeenActive) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < times; i++) {
      const t = ctx.currentTime + i * 0.35;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.15, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.start(t); o.stop(t + 0.3);
    }
    navigator.vibrate?.(times === 1 ? 200 : [200, 100, 200, 100, 200]);
  } catch (e) {}
}
export function speak(text) {
  try {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  } catch (e) {}
}
