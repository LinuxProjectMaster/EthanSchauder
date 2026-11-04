/** Start the user-provided theme on the first interaction, as browsers require. */
export function createThemeMusic() {
  const music = new Audio("./assets/audio/sleep-theme.m4a");
  music.loop = true;
  music.preload = "auto";
  music.volume = 0.35;
  let started = false;

  function start() {
    if (document.hidden || !music.paused) return;
    started = true;
    music.play().catch(() => {
      /* A later user gesture can retry playback. */
    });
  }
  addEventListener("pointerdown", start);
  addEventListener("keydown", (event) => {
    if (event.repeat) return;
    if (event.key.toLowerCase() === "m") music.muted = !music.muted;
    start();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) music.pause();
    else if (started) start();
  });
}
