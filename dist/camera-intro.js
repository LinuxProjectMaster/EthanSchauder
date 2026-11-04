const WIDE = { distance: 34, elevation: 0.76 };
const CLOSE = { distance: 7, elevation: 0.44 };
export const PLAY_CAMERA = { distance: 22, elevation: 0.68 };
const ZOOM_IN_SECONDS = 1.5;
const HOLD_SECONDS = 1;
const ZOOM_OUT_SECONDS = 1.2;

function blend(from, to, progress) {
  const t = Math.max(0, Math.min(1, progress));
  const eased = t * t * (3 - 2 * t);
  return {
    distance: from.distance + (to.distance - from.distance) * eased,
    elevation: from.elevation + (to.elevation - from.elevation) * eased,
  };
}

/** Reveal the otter, hold the close-up for one second, then ease into play. */
export function getIntroCameraPose(seconds) {
  if (seconds < ZOOM_IN_SECONDS) {
    return { ...blend(WIDE, CLOSE, seconds / ZOOM_IN_SECONDS), done: false };
  }
  const pullbackStart = ZOOM_IN_SECONDS + HOLD_SECONDS;
  if (seconds < pullbackStart) return { ...CLOSE, done: false };
  const progress = (seconds - pullbackStart) / ZOOM_OUT_SECONDS;
  return { ...blend(CLOSE, PLAY_CAMERA, progress), done: progress >= 1 };
}
