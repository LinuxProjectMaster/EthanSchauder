import { createPrimitives } from "../geometry.js";
import { pondComponent, fenceComponent, signboardComponent } from "../components/scene-components.js";
import { HOME } from "../realm-data.js";

/** Copy this definition, rename its id, then register it in registry.js. */
export const exampleScene = {
  id: "garden",
  spawn: { x: 0, y: 0, z: 6 },
  heading: Math.PI,
  location: "Garden",
  pond: { x: 0, z: -5, radiusX: 4, radiusZ: 3 },
  portal: { to: HOME, label: "Return home" },
  signs: [{ x: 6, z: 4, title: "Garden notes", text: "A new place to explore." }],
  components: [
    ({ root }) => {
      const { box } = createPrimitives(root);
      box(0, -0.15, 0, 40, 0.3, 40, "#a7bc7b");
    },
    pondComponent,
    fenceComponent({ minX: -18, maxX: 18, minZ: -18, maxZ: 18 }),
    signboardComponent,
  ],
};
