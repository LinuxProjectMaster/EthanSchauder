import { OTTER_RADIUS } from "../dist/otter.js";
import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three.module.js";
import { CollisionWorld } from "../dist/collisions.js";
import { createWorld } from "../dist/world.js";

test("only tree trunks register solid object boundaries", () => {
  const scene = new THREE.Scene();
  const collisions = new CollisionWorld();
  const { trees } = createWorld(scene, collisions);
  assert.ok(trees.length > 50);
  assert.equal(collisions.shapes.length, trees.length);
  assert.equal(
    scene.children.filter((object) => object.name === "tree").length,
    trees.length,
  );
  trees.forEach((tree, index) => {
    const shape = collisions.shapes[index];
    assert.equal(tree.name, "tree");
    assert.equal(shape.type, "circle");
    assert.equal(shape.x, tree.position.x);
    assert.equal(shape.z, tree.position.z);
    assert.equal(shape.radius, 0.28 * tree.scale.x);
  });
});

test("the otter can approach a trunk closely without entering it", () => {
  const collisions = new CollisionWorld();
  createWorld(new THREE.Scene(), collisions);
  const position = { x: -6, z: 0 };
  collisions.move(position, -10, 0, OTTER_RADIUS);
  const clearance = Math.hypot(position.x + 12, position.z);
  const contactDistance = 0.28 * 1.1 + OTTER_RADIUS;
  assert.ok(clearance >= contactDistance);
  assert.ok(clearance < contactDistance + 0.01);
});

test("the spawn remains clear of trees", () => {
  const collisions = new CollisionWorld();
  createWorld(new THREE.Scene(), collisions);
  const position = { x: 0, z: 4 };
  collisions.move(position, 0, 0, OTTER_RADIUS);
  assert.deepEqual(position, { x: 0, z: 4 });
});
