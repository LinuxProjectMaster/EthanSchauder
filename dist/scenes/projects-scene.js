import { createWorld } from "../world.js";
import { createPond } from "../pond.js";
import { createProtonProjector } from "../proton-projector.js";
import { createNeuripsAriel } from "../neurips-ariel.js";
import { createChronopedia } from "../chronopedia.js";
import { createGroundText } from "../ground-text.js";
import { createSignboards } from "../signs.js";
import { createBoundaryFence, PROJECT_BOUNDARY } from "../boundaries.js";
import { getSurfaceAt } from "../surfaces.js";
import { TRAIL_SIGNS } from "../portfolio-data.js";
import { PROJECT_WORLD, PROJECT_SPAWN, PROJECT_POND } from "../realm-data.js";

export const projectsScene = {
  id: PROJECT_WORLD,
  spawn: PROJECT_SPAWN,
  heading: 0,
  pond: PROJECT_POND,
  signs: TRAIL_SIGNS.map((sign) => ({ ...sign, realm: PROJECT_WORLD })),
  location: "Projects world · Read the three project signs to return home",
  getSurfaceAt,
  build(scene) {
    const { root, collisions } = scene;
    createWorld(root, collisions);
    scene.add(createPond(root, collisions, PROJECT_POND));
    createProtonProjector(root, collisions);
    createNeuripsAriel(root, collisions);
    createChronopedia(root, collisions);
    createGroundText(root, { lines: ["THE PROJECT TRAIL", "READ THREE SIGNS · HOP BACK HOME"],
      x: 0, z: 18, width: 8, height: 1.2, angle: 0 });
    root.traverse((object) => { if (object.name === "ground-text") object.rotation.y += Math.PI; });
    createBoundaryFence(root, collisions, PROJECT_BOUNDARY);
    createSignboards(root, collisions, scene.signs);
  },
};
