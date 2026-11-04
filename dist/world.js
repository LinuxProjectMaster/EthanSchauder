import * as THREE from "./vendor/three.module.js";
import { createPrimitives } from "./geometry.js";
import { TRAILS, getSurfaceAt } from "./surfaces.js";
import { TRAIL_SIGNS } from "./portfolio-data.js";
import { createTrailArrows } from "./trail-arrows.js";

/** Landscape with a broad portfolio trail and solid tree trunks. */
export function createWorld(scene, collisions) {
  const { mesh, sphere, cylinder } = createPrimitives(scene);
  // One broad trail through the trees.
  const ground = mesh(new THREE.PlaneGeometry(420, 420), "#a7bc7b");
  ground.rotation.x = -Math.PI / 2;
  ground.castShadow = false;
  let seed = 42;
  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  const trees = [];
  function createTree(x, z, scale = 1, pine = false) {
    if (getSurfaceAt(x, z) === "path") return;
    // Keep the arrival pond and its shoreline clear.
    if (Math.hypot(x / 8, (z - 5) / 7) < 1) return;
    if (TRAIL_SIGNS.some((sign) => Math.hypot(x - sign.x, z - sign.z) < 2.6))
      return;
    // Reserve a clearing for the first project exhibit and its readable sign.
    if (x > -21 && x < -3.8 && z > 23 && z < 42) return;
    // Keep the next project stop clear for its telescope, spectrum display, and medal.
    if (x > 9 && x < 26 && z > 48 && z < 69) return;
    if (x > -12 && x < 2 && z > 75 && z < 95) return;
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.scale.setScalar(scale);
    g.name = "tree";
    trees.push(g);
    scene.add(g);
    cylinder(0, 1.3, 0, 0.16, 0.24, 2.6, "#8e7651", 7, g);
    if (pine) {
      for (let i = 0; i < 3; i++)
        cylinder(0, 2 + i * 0.8, 0, 0, 1.25 - i * 0.2, 2, "#597e50", 7, g);
    } else {
      sphere(0, 3, 0, 1.4, "#759650", g);
      sphere(0.8, 2.7, 0.15, 0.9, "#849f59", g);
      sphere(-0.5, 3.6, 0, 0.95, "#91aa62", g);
    }
    // Match the trunk, allowing the otter to brush beneath the foliage.
    collisions.addCircle(x, z, 0.28 * scale);
  }
  function createPath(points, width, color = "#d6c595") {
    for (let i = 1; i < points.length; i++) {
      const a = new THREE.Vector3(points[i - 1][0], 0.025, points[i - 1][1]),
        b = new THREE.Vector3(points[i][0], 0.025, points[i][1]);
      const m = mesh(
        new THREE.PlaneGeometry(width, a.distanceTo(b) + width * 0.28),
        color,
      );
      m.rotation.x = -Math.PI / 2;
      m.rotation.z = Math.atan2(b.x - a.x, b.z - a.z);
      m.position.copy(a.add(b).multiplyScalar(0.5));
      m.castShadow = false;
      const disc = cylinder(
        b.x,
        0.022,
        b.z,
        width / 2,
        width / 2,
        0.03,
        color,
        24,
      );
      disc.castShadow = false;
    }
  }
  for (const { points, width } of TRAILS) createPath(points, width);
  createTrailArrows(scene);

  // Deterministic planting keeps the same world on every reload.
  for (let i = 0; i < 190; i++) {
    const x = (random() - 0.5) * 145,
      z = random() * 225 - 55;
    if ((Math.abs(x) < 10 && Math.abs(z) < 10) || getSurfaceAt(x, z) === "path")
      continue;
    createTree(x, z, 0.65 + random() * 0.7, random() > 0.57);
  }
  for (const [x, z, s, p] of [
    [-12, 0, 1.1, false],
    [-15, 3, 0.8, false],
    [8, -9, 1.2, false],
    [11, -11, 0.8, false],
    [14, 11, 1, true],
    [10, 15, 1.1, true],
    [-2, -14, 1, false],
    [-5, -17, 0.8, false],
    [-17, 15, 1.2, false],
    [31, 9, 0.9, false],
  ])
    createTree(x, z, s, p);
  return { trees };
}
