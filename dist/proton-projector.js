import * as THREE from "./vendor/three.module.js";
import { createPrimitives, addDisplayBackFace } from "./geometry.js";
import { createGroundText } from "./ground-text.js";

/** A stylized solar forecasting station: solid monitor, console, and sun sculpture. */
export function createProtonProjector(scene, collisions) {
  const { box, sphere, cylinder, mesh } = createPrimitives(scene);
  const station = new THREE.Group();
  station.name = "proton-projector-landmark";
  station.position.set(-11, 0, 32);
  scene.add(station);

  // Forecast display and supports are physical obstacles, with a clear route around them.
  box(0, 2.7, 0, 5.8, 3.2, 0.42, "#3f5b50", station);
  for (const x of [-2, 2]) box(x, 0.7, 0, 0.25, 1.4, 0.4, "#6d7b62", station);
  collisions.addBox(-11, 32, 5.8, 0.5);

  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 768;
  const context = canvas.getContext("2d");
  context.fillStyle = "#243e38";
  context.fillRect(0, 0, 1536, 768);
  context.fillStyle = "#e9e4bc";
  context.font = "bold 66px sans-serif";
  context.fillText("PROTON PROJECTOR", 80, 112);
  context.fillStyle = "#9bb2a0";
  context.font = "28px sans-serif";
  context.fillText("SOLAR PROTON FLUX / MACHINE LEARNING", 83, 166);
  context.strokeStyle = "#567469";
  context.lineWidth = 2;
  for (let row = 0; row < 5; row++) {
    context.beginPath();
    context.moveTo(90, 250 + row * 92);
    context.lineTo(1440, 250 + row * 92);
    context.stroke();
  }
  context.lineWidth = 8;
  context.strokeStyle = "#e1b469";
  context.beginPath();
  for (let i = 0; i <= 90; i++) {
    const x = 90 + i * 11,
      y =
        590 - Math.exp(-(((i - 42) / 12) ** 2)) * 220 - Math.sin(i * 0.22) * 26;
    i ? context.lineTo(x, y) : context.moveTo(x, y);
  }
  context.stroke();
  context.strokeStyle = "#9fcbb4";
  context.setLineDash([18, 14]);
  context.beginPath();
  for (let i = 90; i <= 120; i++) {
    const x = 90 + i * 11,
      y = 590 - (i - 90) * 4 - Math.sin(i * 0.22) * 26;
    i === 90 ? context.moveTo(x, y) : context.lineTo(x, y);
  }
  context.stroke();
  context.setLineDash([]);
  context.fillStyle = "#9fcbb4";
  context.font = "26px sans-serif";
  context.fillText("FORECAST →", 1140, 700);
  context.fillStyle = "#aab99d";
  context.font = "24px sans-serif";
  context.fillText("NOAA DATA · TFT + RNN", 85, 700);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(5.35, 2.72),
    new THREE.MeshBasicMaterial({ map: texture }),
  );
  face.position.set(0, 2.7, 0.23);
  station.add(face);
  addDisplayBackFace(face, 0.46);

  // A small projector console and lens point toward the data display.
  box(1, 0.7, -3.8, 2.6, 1.4, 1.8, "#668677", station);
  box(1, 1.48, -3.8, 2.85, 0.2, 2, "#b8c7aa", station);
  const lens = cylinder(1, 1.05, -2.85, 0.3, 0.3, 0.35, "#394d43", 16, station);
  lens.rotation.x = Math.PI / 2;
  const glass = mesh(
    new THREE.CircleGeometry(0.23, 24),
    "#a6d4cc",
    1,
    1.05,
    -2.66,
    station,
  );
  collisions.addBox(-10, 28.2, 2.85, 2.2);

  // The sun is another solid, walk-around exhibit, echoing the project's solar subject.
  sphere(-4.4, 2.2, 3.2, 1.65, "#d9a659", station);
  cylinder(-4.4, 0.45, 3.2, 0.5, 0.7, 0.9, "#7a8a69", 10, station);
  collisions.addCircle(-15.4, 35.2, 1.65);
  for (const angle of [0, Math.PI / 3, -Math.PI / 3]) {
    const orbit = mesh(
      new THREE.TorusGeometry(2.2, 0.045, 6, 64),
      "#c6ba77",
      -4.4,
      2.2,
      3.2,
      station,
    );
    orbit.rotation.x = angle;
    orbit.rotation.y = 0.55;
  }
  createGroundText(scene, {
    lines: ["PROJECT 01", "PROTON PROJECTOR"],
    x: -10,
    z: 24.5,
    width: 8,
    height: 2,
    angle: 0,
  });
}
