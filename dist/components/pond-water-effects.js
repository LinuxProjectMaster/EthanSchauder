import * as THREE from "../vendor/three.module.js";
import { isInPond } from "../realm-data.js";

/** Ripples and a flat, elliptical spiral. Water always stays at pool level. */
export function createPondWaterEffects(scene, pond) {
  const reducedMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const root = new THREE.Group();
  root.name = "pond-water-effects";
  scene.add(root);
  const ripples = Array.from({ length: 5 }, (_, i) => {
    const ripple = new THREE.Mesh(new THREE.RingGeometry(0.985, 1, 96),
      new THREE.MeshBasicMaterial({ color: "#d3eee0", transparent: true,
        opacity: 0.25, depthWrite: false, side: THREE.DoubleSide }));
    ripple.rotation.x = -Math.PI / 2;
    ripple.position.set(pond.x, 0.25 + i * 0.002, pond.z);
    root.add(ripple);
    return ripple;
  });
  const surface = new THREE.Group();
  surface.position.set(pond.x, 0.265, pond.z);
  surface.rotation.x = -Math.PI / 2;
  surface.scale.set(pond.radiusX, pond.radiusZ, 1);
  root.add(surface);
  const spiral = new THREE.Group();
  spiral.name = "pond-spin";
  spiral.visible = false;
  surface.add(spiral);
  const positions = [], indices = [];
  for (let i = 0; i <= 128; i++) {
    const p = i / 128;
    const angle = p * Math.PI * 3;
    const radius = 0.1 + p * 0.82;
    for (const side of [-1, 1]) {
      const r = radius + side * (0.006 + p * 0.009);
      positions.push(Math.cos(angle) * r, Math.sin(angle) * r, 0);
    }
    if (i < 128) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  const arms = Array.from({ length: 3 }, (_, i) => {
    const arm = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      color: i ? "#afe4d9" : "#e3fff0", transparent: true,
      opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
    arm.rotation.z = i * Math.PI * 2 / 3;
    spiral.add(arm);
    return arm;
  });
  let previousX, previousZ, wakeTime = -Infinity;
  function deactivate() { spiral.visible = false; }
  return {
    deactivate,
    update(elapsed, position, travelPose = null) {
      const inWater = position && isInPond(position, pond);
      const moved = position && previousX !== undefined && Math.hypot(position.x - previousX, position.z - previousZ) > 0.002;
      if (inWater && moved && !travelPose) wakeTime = elapsed;
      previousX = position?.x;
      previousZ = position?.z;
      ripples.forEach((ripple, i) => {
        const wake = i >= 3;
        const phase = reducedMotion ? (i + 1) / 6 : (elapsed * (wake ? 0.9 : 0.2) + i / 3) % 1;
        const radius = wake ? 0.4 + phase * 1.4 : phase;
        ripple.position.x = wake && position ? position.x : pond.x;
        ripple.position.z = wake && position ? position.z : pond.z;
        ripple.scale.set(wake ? radius : pond.radiusX * radius, wake ? radius * 0.65 : pond.radiusZ * radius, 1);
        ripple.material.opacity = (1 - phase) * (wake ? 0.38 : 0.22);
        ripple.visible = !wake || (inWater && elapsed - wakeTime < 0.8);
      });
      const strength = travelPose?.swirl ?? 0;
      spiral.visible = strength > 0;
      spiral.rotation.z = reducedMotion ? 0 : (travelPose?.pondRotation ?? 0);
      for (const arm of arms) arm.material.opacity = strength * 0.75;
    },
  };
}
