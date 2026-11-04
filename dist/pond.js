import * as THREE from "./vendor/three.module.js";
import { createPrimitives } from "./geometry.js";

/** A solid shoreline with animated water; travel bypasses it only during a dive. */
export function createPond(scene, collisions, pond) {
  const { cylinder, sphere } = createPrimitives(scene);
  const rim = cylinder(pond.x, 0.035, pond.z, 1, 1, 0.1, "#c8bd8c", 64);
  rim.scale.set(pond.radiusX + 0.5, 1, pond.radiusZ + 0.5);
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(1, 64),
    new THREE.MeshStandardMaterial({ color: "#5fa7a3", roughness: 0.27, metalness: 0.12 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(pond.x, 0.1, pond.z);
  water.scale.set(pond.radiusX, pond.radiusZ, 1);
  water.receiveShadow = true;
  scene.add(water);
  collisions.addEllipse(pond.x, pond.z, pond.radiusX, pond.radiusZ);
  const ripples = [];
  for (let i = 0; i < 3; i++) {
    const ripple = new THREE.Mesh(
      new THREE.RingGeometry(0.96, 1, 64),
      new THREE.MeshBasicMaterial({ color: "#d3eee0", transparent: true, opacity: 0.3, depthWrite: false }),
    );
    ripple.rotation.x = -Math.PI / 2;
    ripple.position.set(pond.x, 0.12 + i * 0.001, pond.z);
    scene.add(ripple);
    ripples.push(ripple);
  }
  for (let i = 0; i < 7; i++) {
    const angle = i * 2.4;
    const rock = sphere(pond.x + Math.sin(angle) * (pond.radiusX + 0.3), 0.15,
      pond.z + Math.cos(angle) * (pond.radiusZ + 0.3), 0.36, "#a5ab8c");
    rock.scale.y = 0.6;
  }
  // Lily pads sit away from the central dive point.
  for (const [x, z] of [[-2.2, 0.6], [2, -1]]) {
    cylinder(pond.x + x, 0.13, pond.z + z, 0.55, 0.55, 0.025, "#799a60", 12);
    sphere(pond.x + x + 0.1, 0.2, pond.z + z, 0.14, "#efd3ba");
  }
  return {
    update(elapsed) {
      ripples.forEach((ripple, i) => {
        const phase = (elapsed * 0.25 + i / 3) % 1;
        ripple.scale.set(pond.radiusX * phase, pond.radiusZ * phase, 1);
        ripple.material.opacity = (1 - phase) * 0.3;
      });
    },
  };
}
