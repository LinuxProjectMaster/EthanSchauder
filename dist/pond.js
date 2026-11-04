import * as THREE from "./vendor/three.module.js";
import { createPrimitives } from "./geometry.js";
import { isInPond } from "./realm-data.js";

/** A shallow, walkable pool, with a rising vortex only during deliberate travel. */
export function createPond(scene, collisions, pond) {
  const { cylinder, sphere } = createPrimitives(scene);
  const reducedMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const rim = cylinder(pond.x, 0.035, pond.z, 1, 1, 0.1, "#c8bd8c", 64);
  rim.scale.set(pond.radiusX + 0.5, 1, pond.radiusZ + 0.5);
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(1, 96),
    new THREE.MeshStandardMaterial({ color: "#5fa7a3", roughness: 0.2,
      metalness: 0.18, transparent: true, opacity: 0.88 }),
  );
  water.name = "pond-water";
  water.rotation.x = -Math.PI / 2;
  water.position.set(pond.x, 0.23, pond.z);
  water.scale.set(pond.radiusX, pond.radiusZ, 1);
  water.receiveShadow = true;
  scene.add(water);
  // The shallow floor stays at ground height: paws enter the water naturally.
  const ripples = [];
  for (let i = 0; i < 5; i++) {
    const ripple = new THREE.Mesh(
      new THREE.RingGeometry(0.985, 1, 96),
      new THREE.MeshBasicMaterial({ color: "#d3eee0", transparent: true,
        opacity: 0.25, depthWrite: false, side: THREE.DoubleSide }),
    );
    ripple.rotation.x = -Math.PI / 2;
    ripple.position.set(pond.x, 0.25 + i * 0.002, pond.z);
    scene.add(ripple);
    ripples.push(ripple);
  }

  // Opaque water rises from the surface; the helical foam makes its rotation legible.
  const vortex = new THREE.Group();
  vortex.name = "pond-vortex";
  vortex.visible = false;
  scene.add(vortex);
  const curtain = new THREE.Mesh(
    new THREE.CylinderGeometry(1.45, 1.85, 1, 64, 12, true),
    new THREE.MeshStandardMaterial({ color: "#68b5b4", roughness: 0.19,
      metalness: 0.15, side: THREE.DoubleSide, transparent: true, opacity: 0.94 }),
  );
  vortex.add(curtain);
  const curtainBase = curtain.geometry.attributes.position.array.slice();
  const ribbonPositions = new Float32Array(97 * 2 * 3);
  const ribbonGeometry = new THREE.BufferGeometry();
  ribbonGeometry.setAttribute("position", new THREE.BufferAttribute(ribbonPositions, 3));
  const indices = [];
  for (let i = 0; i < 96; i++) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  ribbonGeometry.setIndex(indices);
  const ribbons = Array.from({ length: 3 }, (_, i) => {
    const ribbon = new THREE.Mesh(ribbonGeometry,
      new THREE.MeshBasicMaterial({ color: i === 0 ? "#e5fff4" : "#a1e2da",
        transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide }));
    ribbon.rotation.y = i * Math.PI * 2 / 3;
    ribbon.frustumCulled = false;
    vortex.add(ribbon);
    return ribbon;
  });
  const droplets = Array.from({ length: 24 }, (_, i) => {
    const drop = new THREE.Mesh(new THREE.SphereGeometry(0.035 + (i % 4) * 0.012, 6, 4),
      new THREE.MeshBasicMaterial({ color: "#d3f9ed", transparent: true, opacity: 0.75 }));
    vortex.add(drop);
    return drop;
  });
  for (let i = 0; i < 7; i++) {
    const angle = i * 2.4;
    const rock = sphere(pond.x + Math.sin(angle) * (pond.radiusX + 0.3), 0.15,
      pond.z + Math.cos(angle) * (pond.radiusZ + 0.3), 0.36, "#a5ab8c");
    rock.scale.y = 0.6;
  }
  for (const [x, z] of [[-2.2, 0.6], [2, -1]]) {
    cylinder(pond.x + x, 0.27, pond.z + z, 0.55, 0.55, 0.025, "#799a60", 12);
    sphere(pond.x + x + 0.1, 0.34, pond.z + z, 0.14, "#efd3ba");
  }
  let previousX, previousZ;
  let wakeTime = 0;
  return {
    update(elapsed, position, travelPose = null) {
      const swirl = travelPose?.swirl ?? 0;
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
      vortex.visible = swirl > 0;
      if (!vortex.visible) return;
      const origin = travelPose.swirlOrigin;
      vortex.position.set(origin.x, 0.24, origin.z);
      const height = 0.04 + swirl * 2.7;
      const spin = reducedMotion ? 0 : elapsed * 4.5;
      curtain.position.y = height / 2;
      curtain.scale.y = height;
      curtain.rotation.y = spin;
      curtain.material.opacity = Math.min(0.97, swirl * 1.6);
      const wall = curtain.geometry.attributes.position;
      for (let i = 0; i < wall.count; i++) {
        const x = curtainBase[i * 3], y = curtainBase[i * 3 + 1], z = curtainBase[i * 3 + 2];
        const angle = Math.atan2(z, x);
        const wave = reducedMotion ? 0 : Math.sin(angle * 3 + y * 8 - spin * 1.5) * 0.045;
        wall.setXYZ(i, x * (1 + wave), y + (y + 0.5) * wave * 0.5, z * (1 + wave));
      }
      wall.needsUpdate = true;
      curtain.geometry.computeVertexNormals();
      // Wind three foam ribbons upward around the rising body of water.
      for (let i = 0; i <= 96; i++) {
        const p = i / 96;
        const angle = p * Math.PI * 3;
        const radius = 1.88 - p * 0.4;
        for (let side = 0; side < 2; side++) {
          const offset = (i * 2 + side) * 3;
          ribbonPositions[offset] = Math.cos(angle) * radius;
          ribbonPositions[offset + 1] = Math.max(0.01, p * height + (side - 0.5) * 0.09);
          ribbonPositions[offset + 2] = Math.sin(angle) * radius;
        }
      }
      ribbonGeometry.attributes.position.needsUpdate = true;
      ribbons.forEach((ribbon, i) => { ribbon.rotation.y = spin + i * Math.PI * 2 / 3; });
      droplets.forEach((drop, i) => {
        const p = reducedMotion ? i / 24 : (elapsed * 0.65 + i / 24) % 1;
        const angle = i * 2.39996 + spin;
        const radius = 1.8 + Math.sin(p * Math.PI) * 0.45;
        drop.position.set(Math.cos(angle) * radius, p * height + Math.sin(p * Math.PI) * 0.4, Math.sin(angle) * radius);
        drop.material.opacity = Math.sin(p * Math.PI) * swirl * 0.8;
      });
    },
  };
}
