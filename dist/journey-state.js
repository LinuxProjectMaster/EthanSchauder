import { HOME, PROJECT_WORLD, HOME_POND, PROJECT_POND, HOME_SPAWN, PROJECT_SPAWN } from "./realm-data.js";

const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);

/** Pure, frame-independent travel poses. The world switches only under cover. */
export function createTravel(from, position, reducedMotion = false) {
  return {
    from, to: from === HOME ? PROJECT_WORLD : HOME,
    start: { x: position.x, y: position.y, z: position.z },
    duration: reducedMotion ? 0.9 : from === HOME ? 3.6 : 2.4,
    reducedMotion,
  };
}

export function sampleTravel(travel, elapsed) {
  const t = Math.max(0, Math.min(1, elapsed / travel.duration));
  const switchAt = travel.from === HOME ? 0.6 : 0.5;
  const outbound = t < switchAt;
  const phase = outbound ? t / switchAt : (t - switchAt) / (1 - switchAt);
  const destination = travel.to === HOME ? HOME_SPAWN : PROJECT_SPAWN;
  const exitPond = travel.to === HOME ? HOME_POND : PROJECT_POND;
  // Completing the trail launches a celebratory jump from the final checkpoint.
  // Stay where Enter was pressed while the water climbs around the otter.
  const launch = travel.start;
  const start = outbound ? travel.start : exitPond;
  const end = outbound ? launch : destination;
  const amount = ease(phase);
  const jump = travel.reducedMotion ? 0.2 : 2.5;
  const waterDeparture = outbound && travel.from === HOME;
  const submerge = ease(Math.max(0, Math.min(1, (phase - 0.65) / 0.35)));
  const y = waterDeparture ? lerp(travel.start.y, -1.4, submerge) : outbound
    ? lerp(travel.start.y, -1.4, amount) + Math.sin(phase * Math.PI) * jump
    : lerp(-1.4, 0, amount) + Math.sin(phase * Math.PI) * jump;
  return {
    realm: outbound ? travel.from : travel.to,
    position: t === 1 ? { ...destination } : { x: lerp(start.x, end.x, amount), y, z: lerp(start.z, end.z, amount) },
    pitch: travel.reducedMotion || t === 1 || waterDeparture ? 0 : (outbound ? -1 : 1) * Math.sin(phase * Math.PI) * 0.9,
    swirl: waterDeparture ? ease(Math.min(1, phase / 0.8)) : 0,
    swirlOrigin: waterDeparture ? travel.start : null,
    reducedMotion: travel.reducedMotion,
    // Cover the switch, then reveal the otter emerging from the other pond.
    cover: outbound
      ? ease(Math.max(0, Math.min(1, (phase - 0.8) / 0.2)))
      : 1 - ease(Math.min(1, phase / 0.4)),
    done: t >= 1,
  };
}
