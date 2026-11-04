import * as THREE from "./vendor/three.module.js";
import { createPrimitives } from "./geometry.js";

export const HOME_BOUNDARY = { minX: -17, maxX: 17, minZ: -18, maxZ: 18 };
export const PROJECT_BOUNDARY = { minX: -25, maxX: 30, minZ: -2, maxZ: 184 };

/** Visible split-rail perimeter, backed by an unjumpable simulation boundary. */
export function createBoundaryFence(scene, collisions, boundary) {
  const group = new THREE.Group();
  group.name = "world-boundary";
  scene.add(group);
  const { box } = createPrimitives(group);
  const { minX, maxX, minZ, maxZ } = boundary;
  const thickness = 0.18;
  // The playable limit matches the inside face of each rail.
  collisions.bounds = {
    minX: minX + thickness / 2,
    maxX: maxX - thickness / 2,
    minZ: minZ + thickness / 2,
    maxZ: maxZ - thickness / 2,
  };
  for (const [ax, az, bx, bz] of [
    [minX, minZ, maxX, minZ], [maxX, minZ, maxX, maxZ],
    [maxX, maxZ, minX, maxZ], [minX, maxZ, minX, minZ],
  ]) {
    const length = Math.hypot(bx - ax, bz - az);
    const sections = Math.ceil(length / 3);
    for (let index = 0; index <= sections; index++) {
      const t = index / sections;
      box(ax + (bx - ax) * t, 0.8, az + (bz - az) * t,
        0.24, 1.6, 0.24, "#92764e");
    }
    for (const height of [0.55, 1.15]) {
      const rail = box((ax + bx) / 2, height, (az + bz) / 2,
        length, 0.16, thickness, "#b29868");
      rail.rotation.y = -Math.atan2(bz - az, bx - ax);
    }
  }
  return group;
}
