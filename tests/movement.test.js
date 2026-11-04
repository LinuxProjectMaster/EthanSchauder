import test from "node:test";
import assert from "node:assert/strict";
import { advanceMovement } from "../dist/movement.js";
import { createControls } from "../dist/controls.js";

const neutral = { forward: false, turn: 0, turnAround: false, sprint: false };
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9);

test("forward follows the head at any heading", () => {
  for (const heading of [0, 0.62, Math.PI / 2, Math.PI, -1.2]) {
    const state = { heading, speed: 0 };
    const delta = advanceMovement(state, { ...neutral, forward: true }, 0.04);
    close(delta.x, Math.sin(heading) * state.speed * 0.04);
    close(delta.z, Math.cos(heading) * state.speed * 0.04);
  }
});

test("left and right turn in place, and moving turns stay aligned with the head", () => {
  const left = { heading: 0, speed: 0 },
    right = { heading: 0, speed: 0 };
  assert.deepEqual(advanceMovement(left, { ...neutral, turn: 1 }, 0.04), {
    x: 0,
    z: 0,
  });
  advanceMovement(right, { ...neutral, turn: -1 }, 0.04);
  close(left.heading, -right.heading);
  const state = { heading: 0, speed: 6 };
  const delta = advanceMovement(
    state,
    { ...neutral, forward: true, turn: 1 },
    0.04,
  );
  close(Math.atan2(delta.x, delta.z), state.heading);
});

test("back smoothly turns exactly 180 degrees in the last steering direction", () => {
  for (const direction of [1, -1]) {
    for (const dt of [1 / 30, 1 / 60, 1 / 144]) {
      const state = { heading: 0.7, speed: 6 };
      advanceMovement(state, { ...neutral, turn: direction }, dt);
      const start = state.heading;
      const delta = advanceMovement(state, { ...neutral, turnAround: true }, dt);
      assert.ok((state.heading - start) * direction > 0);
      assert.ok(Math.abs(state.heading - start) < Math.PI / 4);
      assert.deepEqual(delta, { x: 0, z: 0 });
      for (let frame = 0; state.turnRemaining && frame < 300; frame++) {
        const previous = state.heading;
        assert.deepEqual(advanceMovement(state, { ...neutral, forward: true }, dt), { x: 0, z: 0 });
        assert.ok((state.heading - previous) * direction > 0);
        assert.equal(state.speed, 0);
      }
      assert.equal(state.turnRemaining, 0);
      close(state.heading, start + direction * Math.PI);
      const next = advanceMovement(state, { ...neutral, forward: true }, dt);
      assert.ok(next.x * Math.sin(start) + next.z * Math.cos(start) < 0);
    }
  }
});

test("another back press during a turn does not extend the half turn", () => {
  const state = { heading: 0, speed: 0 };
  for (let frame = 0; frame < 30; frame++) {
    advanceMovement(state, { ...neutral, turnAround: frame < 2 }, 1 / 30);
  }
  close(state.heading, Math.PI);
});

test("back is queued once per press, including autorepeat and alternate back keys", (t) => {
  const events = new Map();
  const original = globalThis.addEventListener;
  globalThis.addEventListener = (name, fn) => events.set(name, fn);
  t.after(() => {
    if (original) globalThis.addEventListener = original;
    else delete globalThis.addEventListener;
  });
  const canvas = { style: {}, addEventListener() {} };
  const controls = createControls(canvas, () => {});
  const keydown = (key) =>
    events.get("keydown")({ key, repeat: false, preventDefault() {} });
  keydown("s");
  assert.equal(controls.movement().turnAround, true);
  assert.equal(controls.movement().turnAround, false);
  events.get("keydown")({ key: "s", repeat: true, preventDefault() {} });
  keydown("ArrowDown");
  assert.equal(controls.movement().turnAround, false);
  events.get("keyup")({ key: "s" });
  events.get("keyup")({ key: "ArrowDown" });
  keydown("ArrowDown");
  assert.equal(controls.movement().turnAround, true);
  keydown("a");
  keydown("d");
  assert.equal(controls.movement().lastTurnDirection, -1);
  events.get("keyup")({ key: "d" });
  events.get("keydown")({ key: "a", repeat: true, preventDefault() {} });
  assert.equal(controls.movement().lastTurnDirection, -1, "autorepeat cannot replace the last pressed direction");
  keydown("ArrowLeft");
  assert.equal(controls.movement().lastTurnDirection, 1);
  controls.reset();
  assert.equal(controls.movement().lastTurnDirection, 1);
});
