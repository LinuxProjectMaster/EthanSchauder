import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three.module.js";
import { createBoundaryFence, HOME_BOUNDARY, PROJECT_BOUNDARY } from "../dist/boundaries.js";
import { CollisionWorld } from "../dist/collisions.js";
import { HOME, PROJECT_WORLD, getRealmCameraOrbit } from "../dist/realm-data.js";
import { advanceMovement } from "../dist/movement.js";
import { OTTER_RADIUS } from "../dist/otter.js";

for (const [name, boundary] of [["home", HOME_BOUNDARY], ["projects", PROJECT_BOUNDARY]]) {
  test(`${name} fence blocks all edges and corners, including airborne sprint movement`, () => {
    const scene = new THREE.Scene();
    const collisions = new CollisionWorld();
    const fence = createBoundaryFence(scene, collisions, boundary);
    assert.equal(fence.name, "world-boundary");
    assert.ok(fence.children.length > 8);
    const center = { x: (boundary.minX + boundary.maxX) / 2, z: (boundary.minZ + boundary.maxZ) / 2 };
    for (const y of [0, 2]) {
      for (const [x, z] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1]]) {
        const position = { ...center, y };
        collisions.move(position, x * 250, z * 250, OTTER_RADIUS);
        const bounds = collisions.bounds;
        assert.ok(position.x >= bounds.minX + OTTER_RADIUS);
        assert.ok(position.x <= bounds.maxX - OTTER_RADIUS);
        assert.ok(position.z >= bounds.minZ + OTTER_RADIUS);
        assert.ok(position.z <= bounds.maxZ - OTTER_RADIUS);
        if (x < 0) assert.equal(position.x, bounds.minX + OTTER_RADIUS);
        if (x > 0) assert.equal(position.x, bounds.maxX - OTTER_RADIUS);
        if (z < 0) assert.equal(position.z, bounds.minZ + OTTER_RADIUS);
        if (z > 0) assert.equal(position.z, bounds.maxZ - OTTER_RADIUS);
        assert.equal(position.y, y);
      }
    }
  });
}

test("forward movement and trail arrows lead up the default projects view", () => {
  const orbit = getRealmCameraOrbit(0.62, PROJECT_WORLD);
  assert.equal(getRealmCameraOrbit(0.62, HOME), 0.62);
  const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 220);
  camera.position.set(Math.sin(orbit) * 17, 14, Math.cos(orbit) * 17);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  const origin = new THREE.Vector3().project(camera);
  const movement = { heading: 0, speed: 6 };
  const delta = advanceMovement(movement, { forward: true, turn: 0 }, 0.04);
  const next = new THREE.Vector3(delta.x, 0, delta.z).project(camera);
  assert.ok(next.y > origin.y, "forward movement projects above the starting point");
  const arrowTip = new THREE.Vector3(0, 0, 1).project(camera);
  assert.ok(arrowTip.y > origin.y);
});
