import * as THREE from "./vendor/three.module.js";
import { CollisionWorld } from "./collisions.js";
import { createWorld } from "./world.js";
import { createHomeWorld } from "./home-world.js";
import { createPond } from "./pond.js";
import { createProtonProjector } from "./proton-projector.js";
import { createNeuripsAriel } from "./neurips-ariel.js";
import { createChronopedia } from "./chronopedia.js";
import { createGroundText } from "./ground-text.js";
import { createRunicRocks } from "./runic-rocks.js";
import { createSignboards } from "./signs.js";
import { TRAIL_SIGNS } from "./portfolio-data.js";
import { createBoundaryFence, HOME_BOUNDARY, PROJECT_BOUNDARY } from "./boundaries.js";
import { HOME, PROJECT_WORLD, HOME_SIGNS, PROJECT_POND } from "./realm-data.js";

/** Build each realm once; only the active realm renders and resolves collisions. */
export function createRealms(scene) {
  const home = { root: new THREE.Group(), collisions: new CollisionWorld(), signs: HOME_SIGNS };
  const projects = { root: new THREE.Group(), collisions: new CollisionWorld(),
    signs: TRAIL_SIGNS.map((sign) => ({ ...sign, realm: PROJECT_WORLD })) };
  home.root.name = "home-world";
  projects.root.name = "projects-world";
  scene.add(home.root, projects.root);
  const homePond = createHomeWorld(home.root, home.collisions);
  createWorld(projects.root, projects.collisions);
  const projectPond = createPond(projects.root, projects.collisions, PROJECT_POND);
  createProtonProjector(projects.root, projects.collisions);
  createNeuripsAriel(projects.root, projects.collisions);
  createChronopedia(projects.root, projects.collisions);
  createGroundText(projects.root, { lines: ["THE PROJECT TRAIL", "READ THREE SIGNS · HOP BACK HOME"],
    x: 0, z: 18, width: 8, height: 1.2, angle: 0 });
  // Ground lettering faces the camera's reversed projects view.
  projects.root.traverse((object) => {
    if (object.name === "ground-text") object.rotation.y += Math.PI;
  });
  createBoundaryFence(home.root, home.collisions, HOME_BOUNDARY);
  createBoundaryFence(projects.root, projects.collisions, PROJECT_BOUNDARY);
  const runes = createRunicRocks(home.root, home.signs);
  createSignboards(projects.root, projects.collisions, projects.signs);
  const realms = { [HOME]: home, [PROJECT_WORLD]: projects };
  let active = HOME;
  function activate(id) {
    if (!realms[id]) throw new Error(`Unknown realm: ${id}`);
    active = id;
    home.root.visible = id === HOME;
    projects.root.visible = id === PROJECT_WORLD;
  }
  activate(HOME);
  return {
    get active() { return active; },
    get current() { return realms[active]; },
    activate,
    runes,
    update(elapsed, position) {
      (active === HOME ? homePond : projectPond).update(elapsed);
      runes.update(elapsed, position, active === HOME);
    },
    allSigns: [...home.signs, ...projects.signs],
  };
}
