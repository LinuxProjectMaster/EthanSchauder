import * as THREE from "./vendor/three.module.js";
import { createPrimitives, addDisplayBackFace } from "./geometry.js";
import { createGroundText } from "./ground-text.js";

/** Project 02: an illustrated spectrum display, telescope, and silver medal.
 * The display is illustrative artwork, not fabricated notebook output. */
export function createNeuripsAriel(scene, collisions) {
  const { box, sphere, cylinder, mesh } = createPrimitives(scene);
  const station = new THREE.Group();
  station.name = "neurips-ariel-landmark";
  station.position.set(17, 0, 58);
  scene.add(station);

  box(0, 2.7, -2, 6.3, 3.3, 0.42, "#536675", station);
  for (const x of [-2.25, 2.25])
    box(x, 0.7, -2, 0.25, 1.4, 0.4, "#7d8a86", station);
  collisions.addBox(17, 56, 6.3, 0.5);
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 768;
  const context = canvas.getContext("2d");
  context.fillStyle = "#253842";
  context.fillRect(0, 0, 1536, 768);
  context.fillStyle = "#e9e6c7";
  context.font = "bold 63px sans-serif";
  context.fillText("ARIEL DATA CHALLENGE", 75, 110);
  context.fillStyle = "#a0b9c6";
  context.font = "26px sans-serif";
  context.fillText("EXOPLANET TRANSMISSION SPECTRUM", 80, 166);
  context.strokeStyle = "#4c6672";
  context.lineWidth = 2;
  for (let row = 0; row < 5; row++) {
    context.beginPath();
    context.moveTo(90, 260 + row * 80);
    context.lineTo(1440, 260 + row * 80);
    context.stroke();
  }
  // An example spectrum emphasizes absorption features without implying real measurements.
  function spectrum(index) {
    const first = Math.exp(-(((index - 28) / 7) ** 2));
    const second = Math.exp(-(((index - 69) / 10) ** 2));
    return 350 + first * 130 + second * 200 + Math.sin(index * 0.18) * 16;
  }
  context.beginPath();
  for (let index = 0; index <= 110; index++) {
    const x = 90 + index * 12,
      y = spectrum(index);
    index ? context.lineTo(x, y) : context.moveTo(x, y);
  }
  context.strokeStyle = "#9fc4e2";
  context.lineWidth = 7;
  context.stroke();
  context.fillStyle = "#e9cc8e";
  for (let index = 0; index <= 110; index += 4) {
    context.beginPath();
    context.arc(90 + index * 12, spectrum(index), 4, 0, Math.PI * 2);
    context.fill();
  }
  context.font = "26px sans-serif";
  context.fillStyle = "#d6e1e7";
  context.fillText("SILVER MEDAL · 2025", 80, 695);
  context.fillStyle = "#93aab6";
  context.font = "22px sans-serif";
  context.fillText("ILLUSTRATIVE SPECTRUM", 1100, 695);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(5.9, 2.85),
    new THREE.MeshBasicMaterial({ map: texture }),
  );
  screen.position.set(0, 2.7, -1.77);
  station.add(screen);
  addDisplayBackFace(screen, 0.46);

  // A tilted observatory telescope with a broad, solid pedestal.
  cylinder(3, 0.4, 3, 1.15, 1.35, 0.8, "#92a29d", 12, station);
  cylinder(3, 1.4, 3, 0.2, 0.3, 1.7, "#647887", 10, station);
  const telescope = new THREE.Group();
  telescope.position.set(3, 2.5, 3);
  telescope.rotation.x = -0.7;
  station.add(telescope);
  const barrel = cylinder(0, 0, 0.3, 0.58, 0.58, 2.3, "#798ca7", 16, telescope);
  barrel.rotation.x = Math.PI / 2;
  const rim = cylinder(0, 0, 1.5, 0.65, 0.65, 0.18, "#c4d1cf", 20, telescope);
  rim.rotation.x = Math.PI / 2;
  const lens = mesh(
    new THREE.CircleGeometry(0.51, 24),
    "#81b8c8",
    0,
    0,
    1.6,
    telescope,
  );
  box(0, -0.65, -0.25, 1.35, 0.2, 1.1, "#b1c1c0", telescope);
  collisions.addCircle(20, 61, 1.35);

  // The silver medal is a walk-around landmark, based on the resume's award.
  cylinder(-2, 0.6, 5, 0.85, 1, 1.2, "#9da997", 12, station);
  const medal = cylinder(-2, 1.8, 5, 0.7, 0.7, 0.18, "#cad4d7", 32, station);
  medal.rotation.x = Math.PI / 2;
  const inner = mesh(
    new THREE.TorusGeometry(0.51, 0.035, 6, 48),
    "#eef0de",
    -2,
    1.8,
    5.1,
    station,
  );
  const star = new THREE.Shape();
  for (let index = 0; index < 10; index++) {
    const angle = Math.PI / 2 + (index * Math.PI) / 5;
    const radius = index % 2 ? 0.16 : 0.36;
    const x = Math.cos(angle) * radius,
      y = Math.sin(angle) * radius;
    index ? star.lineTo(x, y) : star.moveTo(x, y);
  }
  star.closePath();
  const emblem = new THREE.Mesh(
    new THREE.ShapeGeometry(star),
    new THREE.MeshBasicMaterial({ color: "#f0edc9" }),
  );
  emblem.position.set(-2, 1.8, 5.11);
  station.add(emblem);
  collisions.addCircle(15, 63, 1);

  createGroundText(scene, {
    lines: ["PROJECT 02", "NEURIPS · ARIEL"],
    x: 18,
    z: 50,
    width: 8,
    height: 2,
    angle: 0,
    color: "#526779",
  });
}
