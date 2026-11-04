import * as THREE from "./vendor/three.module.js";
import { createPrimitives } from "./geometry.js";
import { createGroundText } from "./ground-text.js";
import { createPond } from "./pond.js";
import { HOME_POND } from "./realm-data.js";

/** An enclosed welcome clearing, independent of the long projects trail. */
export function createHomeWorld(scene, collisions) {
  const { mesh, cylinder, sphere } = createPrimitives(scene);
  const ground = mesh(new THREE.PlaneGeometry(180, 180), "#a7bc7b");
  ground.rotation.x = -Math.PI / 2;
  ground.castShadow = false;
  const clearing = cylinder(0, 0.015, 0, 12, 12, 0.03, "#bfca8b", 64);
  clearing.castShadow = false;
  const welcome = cylinder(0, 0.04, 4, 3, 3, 0.04, "#d6c595", 48);
  welcome.castShadow = false;
  collisions.bounds = { x: 17, z: 18 };
  // A ring of trees frames the clearing without obstructing any signs or shore.
  for (let i = 0; i < 30; i++) {
    const angle = i * Math.PI * 2 / 30;
    const x = Math.sin(angle) * (15 + (i % 3));
    const z = Math.cos(angle) * (15 + (i % 2));
    cylinder(x, 1.2, z, 0.18, 0.26, 2.4, "#8e7651", 7);
    sphere(x, 3, z, 1.55, i % 2 ? "#759650" : "#849f59");
    sphere(x + 0.6, 3.6, z, 0.95, "#91aa62");
    collisions.addCircle(x, z, 0.3);
  }
  createGroundText(scene, { lines: ["ETHAN SCHAUDER"], x: 0, z: 8.7,
    width: 12, height: 1.2, angle: 0 });
  createGroundText(scene, { lines: ["UNIVERSITY OF VIRGINIA"], x: 0, z: 9.85,
    width: 10, height: .7, angle: 0, color: "#4e6349" });
  createGroundText(scene, { lines: ["SOFTWARE · MACHINE LEARNING · SPACE"], x: 0, z: 10.85,
    width: 11, height: 0.45, angle: 0, color: "#687850" });
  createGroundText(scene, { lines: ["THE PROJECT POND", "WADE INTO THE WATER · PRESS ENTER"], x: 0, z: -2.8,
    width: 6.5, height: 1.15, angle: 0 });
  return createPond(scene, collisions, HOME_POND);
}
