import { HOME, PROJECT_WORLD, HOME_POND, PROJECT_POND, HOME_SPAWN, PROJECT_SPAWN } from "./realm-data.js";

const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);

/** Pure, frame-independent travel poses. The world switches only under cover. */
export function createTravel(from, position, reducedMotion = false) {
  return {
    from, to: from === HOME ? PROJECT_WORLD : HOME,
    start: { x: position.x, y: position.y, z: position.z },
    duration: reducedMotion ? 0.7 : 2.4,
    reducedMotion,
  };
}

export function sampleTravel(travel, elapsed) {
  const t = Math.max(0, Math.min(1, elapsed / travel.duration));
  const outbound = t < 0.5;
  const phase = outbound ? t * 2 : (t - 0.5) * 2;
  const destination = travel.to === HOME ? HOME_SPAWN : PROJECT_SPAWN;
  const entryPond = travel.from === HOME ? HOME_POND : PROJECT_POND;
  const exitPond = travel.to === HOME ? HOME_POND : PROJECT_POND;
  // Completing the trail launches a celebratory jump from the final checkpoint.
  const launch = travel.from === HOME ? entryPond : travel.start;
  const start = outbound ? travel.start : exitPond;
  const end = outbound ? launch : destination;
  const amount = ease(phase);
  const jump = travel.reducedMotion ? 0.2 : (outbound && travel.from === HOME ? 1.3 : 2.5);
  const y = outbound
    ? lerp(travel.start.y, -1.4, amount) + Math.sin(phase * Math.PI) * jump
    : lerp(-1.4, 0, amount) + Math.sin(phase * Math.PI) * jump;
  return {
    realm: outbound ? travel.from : travel.to,
    position: t === 1 ? { ...destination } : { x: lerp(start.x, end.x, amount), y, z: lerp(start.z, end.z, amount) },
    pitch: travel.reducedMotion || t === 1 ? 0 : (outbound ? -1 : 1) * Math.sin(phase * Math.PI) * 0.9,
    // Cover the switch, then reveal the otter emerging from the other pond.
    cover: Math.max(0, Math.min(1, (0.5 - Math.abs(t - 0.5)) * 5)),
    done: t >= 1,
  };
}
