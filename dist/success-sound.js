/** A soft original completion chime, unlocked by input and respecting M mute. */
export function createSuccessSound() {
  let context;
  let muted = false;
  function unlock() {
    try {
      context ??= new AudioContext();
      if (context.state !== "running") context.resume().catch(() => {});
    } catch {
      /* The visual celebration still works without audio support. */
    }
  }
  addEventListener("pointerdown", unlock);
  addEventListener("keydown", (event) => {
    if (event.repeat) return;
    if (event.key.toLowerCase() === "m") muted = !muted;
    unlock();
  });
  return {
    play() {
      if (!context || muted || document.hidden || context.state !== "running")
        return;
      [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
        const start = context.currentTime + index * 0.14;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.13, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.1);
        oscillator.connect(gain).connect(context.destination);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
        };
        oscillator.start(start);
        oscillator.stop(start + 1.15);
      });
    },
  };
}
