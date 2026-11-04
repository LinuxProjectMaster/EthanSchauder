import { OTTER_RADIUS } from "../dist/otter.js";
import test from "node:test";
import assert from "node:assert/strict";
import { CollisionWorld } from "../dist/collisions.js";

const radius = OTTER_RADIUS;

test("a sprint-sized movement cannot tunnel through a tree", () => {
  const world = new CollisionWorld();
  world.addCircle(0, 0, 0.9);
  const position = { x: -5, z: 0 };
  world.move(position, 10, 0, radius);
  assert.ok(position.x <= -(0.9 + radius));
});

test("exact center overlap is resolved without NaN", () => {
  const world = new CollisionWorld();
  world.addCircle(0, 0, 1);
  const position = { x: 0, z: 0 };
  world.move(position, 0, 0, radius);
  assert.ok(Math.hypot(position.x, position.z) >= 1 + radius);
});

test("a rotated bench blocks travel across its seat", () => {
  const world = new CollisionWorld();
  const angle = 0.7;
  world.addBox(0, 0, 2.3, 0.95, angle);
  const position = { x: -Math.sin(angle) * 3, z: -Math.cos(angle) * 3 };
  world.move(position, Math.sin(angle) * 6, Math.cos(angle) * 6, radius);
  const localDepth =
    position.x * Math.sin(angle) + position.z * Math.cos(angle);
  assert.ok(localDepth <= -0.475 - radius + 0.001);
});

test("the full pond footprint blocks entry at both ends", () => {
  const world = new CollisionWorld();
  world.addEllipse(27, 1, 6.3, 6.3 * 0.66);
  for (const side of [-1, 1]) {
    const position = { x: 27 + side * 9, z: 1 };
    world.move(position, -side * 12, 0, radius);
    assert.ok(Math.abs(position.x - 27) >= 6.3 + radius - 0.01);
  }
});

test("arch pillars block the sides but leave the center passable", () => {
  const world = new CollisionWorld();
  world.addBox(-2, 0, 0.95, 1.12);
  world.addBox(2, 0, 0.95, 1.12);
  const center = { x: 0, z: -3 };
  world.move(center, 0, 6, radius);
  assert.ok(center.z > 2.9);
  const side = { x: 2, z: -3 };
  world.move(side, 0, 6, radius);
  assert.ok(side.z <= -0.56 - radius);
});

test("jumping cannot bypass a solid object boundary", () => {
  const world = new CollisionWorld();
  world.addCircle(0, 0, 2.85);
  const position = { x: -5, y: 1.8, z: 0 };
  world.move(position, 10, 0, radius);
  assert.ok(position.x <= -2.85 - radius);
  assert.equal(position.y, 1.8);
});

test("outer bounds account for the whole player radius", () => {
  const world = new CollisionWorld();
  const position = { x: 71, z: 189 };
  world.move(position, 5, 5, radius);
  assert.equal(position.x, 72 - radius);
  assert.equal(position.z, 190 - radius);
});

test("sliding against a wall preserves movement along it", () => {
  const world = new CollisionWorld();
  world.addBox(0, 0, 2, 20);
  const position = { x: -2, z: -4 };
  world.move(position, 4, 3, radius);
  assert.ok(position.x <= -1 - radius);
  assert.ok(position.z > -1.1);
});
