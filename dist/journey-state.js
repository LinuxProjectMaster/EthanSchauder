const clamp = (t) => Math.max(0, Math.min(1, t));
const ease = (t) => t * t * (3 - 2 * t);

/** Scene-independent travel timeline: anticipation, shared loader, then arrival. */
export function createTravel({ from, to, start, destination, spinPond = false, reducedMotion = false }) {
  const anticipation = reducedMotion ? 0.2 : spinPond ? 1.1 : 0.7;
  const fadeIn = reducedMotion ? 0.1 : 0.25;
  const loading = reducedMotion ? 0.4 : 1.7;
  const reveal = reducedMotion ? 0.2 : 0.45;
  return { from, to, start: { ...start }, destination: { ...destination },
    spinPond, reducedMotion, anticipation, fadeIn, loading, reveal,
    switchAt: anticipation + fadeIn + loading * 0.65,
    revealAt: anticipation + fadeIn + loading,
    duration: anticipation + fadeIn + loading + reveal };
}

export function sampleTravel(travel, elapsed) {
  const time = Math.max(0, elapsed);
  const switched = time >= travel.switchAt;
  const anticipating = time < travel.anticipation;
  const cover = time < travel.revealAt
    ? ease(clamp((time - travel.anticipation) / travel.fadeIn))
    : 1 - ease(clamp((time - travel.revealAt) / travel.reveal));
  const spin = clamp(time / travel.anticipation);
  return {
    realm: switched ? travel.to : travel.from,
    position: switched ? { ...travel.destination } : { ...travel.start },
    pitch: 0,
    phase: anticipating ? "anticipation" : time < travel.revealAt ? "loading" : "arrival",
    swirl: travel.spinPond && !switched ? ease(spin) : 0,
    pondRotation: travel.reducedMotion ? 0 : spin * spin * Math.PI * 3,
    showLoader: time >= travel.anticipation && time < travel.duration,
    cover,
    done: time >= travel.duration,
  };
}
