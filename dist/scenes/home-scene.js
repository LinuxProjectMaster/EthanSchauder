import { createHomeWorld } from "./home-world.js";
import { pondComponent, fenceComponent, runeComponent } from "../components/scene-components.js";
import { HOME_BOUNDARY } from "../boundaries.js";
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
  components: [
    ({ root, collisions }) => createHomeWorld(root, collisions),
    pondComponent,
    fenceComponent(HOME_BOUNDARY),
    runeComponent,
  ],
};
