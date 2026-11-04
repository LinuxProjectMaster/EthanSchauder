import { createPond } from "./scenery/pond.js";
import { createRunicRocks } from "./scenery/runic-rocks.js";
import { createBoundaryFence } from "../boundaries.js";
import { createSignboards } from "./scenery/signboards.js";

/** Factories receive the scene context and return optional lifecycle hooks. */
export function pondComponent({ root, collisions, pond }) {
  if (!pond) throw new Error("pondComponent requires scene.pond");
  return createPond(root, collisions, pond);
}

export function fenceComponent(boundary) {
  return ({ root, collisions }) => { createBoundaryFence(root, collisions, boundary); };
}

export function signboardComponent({ root, collisions, signs }) {
  createSignboards(root, collisions, signs);
}

export function runeComponent(scene) {
  const runes = createRunicRocks(scene.root, scene.signs);
  scene.onSignActivate = (sign) => runes.activate(sign);
  return {
    update: (elapsed, position) => runes.update(elapsed, position),
    deactivate: () => runes.update(0, null, false),
  };
}
