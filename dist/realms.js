import { createScene } from "./scenes/create-scene.js";
import { SCENES } from "./scenes/registry.js";

/** Shared scene lifecycle; no scene-specific construction or update branches. */
export function createRealms(parent, definitions = SCENES) {
  if (!definitions.length) throw new Error("At least one scene is required");
  const scenes = new Map();
  for (const definition of definitions) {
    if (scenes.has(definition.id)) throw new Error(`Duplicate scene: ${definition.id}`);
    const scene = createScene(definition);
    scenes.set(definition.id, scene);
    parent.add(scene.root);
    scene.deactivate();
  }
  let active;
  function get(id) {
    if (!scenes.has(id)) throw new Error(`Unknown realm: ${id}`);
    return scenes.get(id);
  }
  function activate(id) {
    const next = get(id);
    if (id === active) return;
    if (active !== undefined) get(active).deactivate();
    active = id;
    next.activate();
  }
  activate(definitions[0].id);
  return {
    get active() { return active; },
    get current() { return get(active); },
    get,
    activate,
    update: (elapsed, position, travelPose = null) => get(active).update(elapsed, position, travelPose),
    allSigns: [...scenes.values()].flatMap((scene) => scene.signs),
  };
}
