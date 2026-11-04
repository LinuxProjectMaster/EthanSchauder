import { createPond } from "../pond.js";
import { createHomeWorld } from "../home-world.js";
import { createRunicRocks } from "../runic-rocks.js";
import { createBoundaryFence, HOME_BOUNDARY } from "../boundaries.js";
import { HOME, PROJECT_WORLD, HOME_SIGNS, HOME_SPAWN, HOME_POND } from "../realm-data.js";

export const homeScene = {
  id: HOME,
  spawn: HOME_SPAWN,
  heading: Math.PI,
  pond: HOME_POND,
  portal: { to: PROJECT_WORLD, label: "Explore the projects world" },
  signs: HOME_SIGNS,
  location: "",
  getSurfaceAt: () => "grass",
  build(scene) {
    createHomeWorld(scene.root, scene.collisions);
    scene.add(createPond(scene.root, scene.collisions, HOME_POND));
    createBoundaryFence(scene.root, scene.collisions, HOME_BOUNDARY);
    scene.runes = createRunicRocks(scene.root, scene.signs);
    scene.add({
      update: (elapsed, position) => scene.runes.update(elapsed, position),
      deactivate: () => scene.runes.update(0, null, false),
    });
  },
};
