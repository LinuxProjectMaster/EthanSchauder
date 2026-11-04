import * as THREE from "../vendor/three.module.js";
import { CollisionWorld } from "../collisions.js";

/** Scene components own their meshes and optionally implement update/activate/deactivate. */
export function createScene(definition) {
  const root = new THREE.Group();
  root.name = `${definition.id}-world`;
  const components = [];
  const scene = {
    cameraOrbit: 0,
    heading: 0,
    getSurfaceAt: () => "grass",
    ...definition,
    root,
    collisions: new CollisionWorld(),
    signs: definition.signs ?? [],
    add(component) { components.push(component); return component; },
    update(elapsed, position, travelPose) {
      for (const component of components) component.update?.(elapsed, position, travelPose);
    },
    activate() {
      root.visible = true;
      for (const component of components) component.activate?.();
    },
    deactivate() {
      root.visible = false;
      for (const component of components) component.deactivate?.();
    },
  };
  definition.build(scene);
  return scene;
}
