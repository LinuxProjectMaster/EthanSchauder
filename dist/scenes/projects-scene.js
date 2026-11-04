import { createWorld } from "./projects-world.js";
import { pondComponent, fenceComponent, signboardComponent } from "../components/scene-components.js";
import { createProtonProjector } from "../components/exhibits/proton-projector.js";
import { createNeuripsAriel } from "../components/exhibits/neurips-ariel.js";
import { createChronopedia } from "../components/exhibits/chronopedia.js";
import { createGroundText } from "../components/scenery/ground-text.js";
import { PROJECT_BOUNDARY } from "../boundaries.js";
import { getSurfaceAt } from "../surfaces.js";
import { TRAIL_SIGNS } from "../portfolio-data.js";
import { HOME, PROJECT_WORLD, PROJECT_SPAWN, PROJECT_POND } from "../realm-data.js";

export const projectsScene = {
  id: PROJECT_WORLD,
  spawn: PROJECT_SPAWN,
  heading: 0,
  cameraOrbit: Math.PI,
  pond: PROJECT_POND,
  signs: TRAIL_SIGNS,
  portal: { to: HOME, label: "Return home" },
  location: "Projects world",
  getSurfaceAt,
  components: [
    ({ root, collisions }) => createWorld(root, collisions),
    pondComponent,
    ({ root, collisions }) => { createProtonProjector(root, collisions); },
    ({ root, collisions }) => { createNeuripsAriel(root, collisions); },
    ({ root, collisions }) => { createChronopedia(root, collisions); },
    ({ root }) => {
      createGroundText(root, { lines: ["Projects"],
        x: 0, z: 10, width: 8, height: 1.2, angle: 0 });
      root.traverse((object) => { if (object.name === "ground-text") object.rotation.y += Math.PI; });
    },
    fenceComponent(PROJECT_BOUNDARY),
    signboardComponent,
  ],
};
