import * as THREE from "../vendor/three.module.js";
import { getIntroCameraPose } from "../camera-intro.js";

/** Intro framing and scene-relative follow behavior, independent of scene content. */
export function createFollowCamera(camera, reducedMotion) {
  let introStart = null;
  let done = reducedMotion;
  let snapNext = true;
  const target = new THREE.Vector3();
  const offset = new THREE.Vector3();
  return {
    get introDone() { return done; },
    beginIntro(elapsed) { introStart = elapsed; },
    snap() { snapNext = true; },
    update(dt, elapsed, position, orbitOffset, controls) {
      const orbit = controls.orbit + orbitOffset;
      const intro = done ? null : getIntroCameraPose(introStart === null ? 0 : elapsed - introStart);
      const { elevation, distance } = intro ?? controls;
      target.set(position.x, 0.75, position.z);
      offset.set(Math.sin(orbit) * Math.cos(elevation) * distance,
        Math.sin(elevation) * distance, Math.cos(orbit) * Math.cos(elevation) * distance);
      const goal = offset.add(target);
      if (intro || snapNext) camera.position.copy(goal);
      else camera.position.lerp(goal, 1 - Math.exp(-dt * 5));
      snapNext = false;
      if (intro?.done) {
        done = true;
        controls.distance = distance;
        controls.elevation = elevation;
      }
      camera.lookAt(target);
    },
  };
}
