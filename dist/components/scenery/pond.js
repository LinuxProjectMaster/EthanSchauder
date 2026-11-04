import * as THREE from "../../vendor/three.module.js";
import { createPrimitives } from "../../geometry.js";
import { createPondWaterEffects } from "../pond-water-effects.js";

/** Reusable shallow pool scenery. Surface animation lives in its own component. */
export function createPond(scene, collisions, pond) {
  const { cylinder, sphere } = createPrimitives(scene);
  const rim = cylinder(pond.x, 0.035, pond.z, 1, 1, 0.1, "#c8bd8c", 64);
  rim.scale.set(pond.radiusX + 0.5, 1, pond.radiusZ + 0.5);
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(1, 96),
    new THREE.MeshStandardMaterial({ color: "#5fa7a3", roughness: 0.2,
      metalness: 0.18, transparent: true, opacity: 0.88 }),
  );
  water.name = "pond-water";
  water.rotation.x = -Math.PI / 2;
  water.position.set(pond.x, 0.23, pond.z);
  water.scale.set(pond.radiusX, pond.radiusZ, 1);
  water.receiveShadow = true;
  scene.add(water);
  for (let i = 0; i < 7; i++) {
    const angle = i * 2.4;
    const rock = sphere(pond.x + Math.sin(angle) * (pond.radiusX + 0.3), 0.15,
      pond.z + Math.cos(angle) * (pond.radiusZ + 0.3), 0.36, "#a5ab8c");
    rock.scale.y = 0.6;
  }
  for (const [x, z] of [[-2.2, 0.6], [2, -1]]) {
    cylinder(pond.x + x, 0.27, pond.z + z, 0.55, 0.55, 0.025, "#799a60", 12);
    sphere(pond.x + x + 0.1, 0.34, pond.z + z, 0.14, "#efd3ba");
  }
  return createPondWaterEffects(scene, pond);
}
