const WALK_SPEED = 6;
const RUN_SPEED = 9.5;
const TURN_SPEED = Math.PI * 0.75;
const ACCELERATION = 10;

/** Heading-based movement. Positive yaw turns left for a model facing +Z.
 * Keep momentum aligned with the head so turns never produce sideways sliding. */
export function advanceMovement(state, input, dt) {
  state.lastTurnDirection =
    input.lastTurnDirection || Math.sign(input.turn) || state.lastTurnDirection || 1;
  if (input.turnAround && !state.turnRemaining) {
    state.turnRemaining = Math.PI * state.lastTurnDirection;
  }
  if (state.turnRemaining) {
    const step = Math.sign(state.turnRemaining) *
      Math.min(Math.abs(state.turnRemaining), TURN_SPEED * dt);
    state.heading += step;
    state.turnRemaining -= step;
    state.speed = 0;
    return { x: 0, z: 0 };
  }
  state.heading += input.turn * TURN_SPEED * dt;
  const targetSpeed = input.forward
    ? input.sprint
      ? RUN_SPEED
      : WALK_SPEED
    : 0;
  state.speed +=
    (targetSpeed - state.speed) * (1 - Math.exp(-ACCELERATION * dt));
  if (state.speed < 0.001) state.speed = 0;
  return {
    x: Math.sin(state.heading) * state.speed * dt,
    z: Math.cos(state.heading) * state.speed * dt,
  };
}
