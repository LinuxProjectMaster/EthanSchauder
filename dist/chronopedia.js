import * as THREE from "./vendor/three.module.js";
import { createPrimitives } from "./geometry.js";
import { createGroundText } from "./ground-text.js";

/** A walk-around encyclopedia and clock for the time-travelling knowledge project. */
export function createChronopedia(scene, collisions) {
  const { box, cylinder, mesh } = createPrimitives(scene);
  const exhibit = new THREE.Group();
  exhibit.name = "chronopedia-landmark";
  exhibit.position.set(-4, 0, 48);
  scene.add(exhibit);

  // The large open book is a solid exhibit, with page graphics on both halves.
  box(0, 0.65, 0, 5.4, 1.3, 2.9, "#7e8d6a", exhibit);
  const book = new THREE.Group();
  book.position.set(0, 1.45, 0);
  exhibit.add(book);
  for (const side of [-1, 1]) {
    const pages = new THREE.Group();
    pages.position.x = side * 1.5;
    pages.rotation.z = side * 0.12;
    book.add(pages);
    box(0, 0, 0, 2.95, 0.2, 3.2, "#624b38", pages);
    box(0, 0.16, 0, 2.8, 0.18, 3.05, "#e8dec3", pages);
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 768;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#e8dec3";
    ctx.fillRect(0, 0, 768, 768);
    ctx.fillStyle = "#4c5943";
    ctx.font = "bold 43px Georgia";
    ctx.textAlign = "center";
    ctx.fillText(side < 0 ? "THE PAST" : "THE FUTURE", 384, 125);
    ctx.font = "28px Georgia";
    ctx.fillText(side < 0 ? "1925" : "2080", 384, 184);
    ctx.fillStyle = "#9b9b7d";
    for (let line = 0; line < 11; line++)
      ctx.fillRect(80, 250 + line * 32, 570 - (line % 3) * 45, 4);
    ctx.fillStyle = "#88694a";
    ctx.font = "24px Georgia";
    ctx.fillText("CHRONOPEDIA", 384, 690);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(2.7, 2.96),
      new THREE.MeshBasicMaterial({ map: texture }),
    );
    face.rotation.x = -Math.PI / 2;
    face.position.y = 0.26;
    pages.add(face);
  }
  cylinder(0, 1.5, 0, 0.09, 0.09, 3.3, "#947854", 8, exhibit).rotation.x =
    Math.PI / 2;
  collisions.addBox(-4, 48, 6.3, 3.4);

  // A clock on a pedestal provides a second solid obstacle beside the book.
  cylinder(-4, 0.65, -3, 0.9, 1, 1.3, "#8a9c80", 12, exhibit);
  const rim = cylinder(-4, 2.4, -3, 1.15, 1.15, 0.23, "#a98a58", 48, exhibit);
  rim.rotation.x = Math.PI / 2;
  const face = mesh(
    new THREE.CircleGeometry(1.02, 48),
    "#ebe2be",
    -4,
    2.4,
    -2.87,
    exhibit,
  );
  for (let hour = 0; hour < 12; hour++) {
    const angle = (hour * Math.PI) / 6;
    const tick = box(
      -4 + Math.sin(angle) * 0.85,
      2.4 + Math.cos(angle) * 0.85,
      -2.84,
      0.035,
      0.13,
      0.02,
      "#526147",
      exhibit,
    );
    tick.rotation.z = -angle;
  }
  const hourHand = box(
    -4.16,
    2.55,
    -2.8,
    0.055,
    0.5,
    0.035,
    "#42513c",
    exhibit,
  );
  hourHand.rotation.z = -0.75;
  const minuteHand = box(
    -3.75,
    2.65,
    -2.77,
    0.035,
    0.77,
    0.035,
    "#42513c",
    exhibit,
  );
  minuteHand.rotation.z = -0.75;
  collisions.addCircle(-8, 45, 1.15);

  // Stacked books reinforce the encyclopedia theme and block the otter's path.
  for (let level = 0; level < 4; level++) {
    const volume = box(
      3.8,
      0.22 + level * 0.37,
      3,
      1.8,
      0.33,
      1.45,
      ["#647e67", "#b3925f", "#647987", "#9e7855"][level],
      exhibit,
    );
    volume.rotation.y = level % 2 ? 0.12 : -0.08;
  }
  collisions.addBox(-0.2, 51, 2, 1.65);
  createGroundText(scene, {
    lines: ["PROJECT 03", "CHRONOPEDIA"],
    x: -4,
    z: 40.5,
    width: 8,
    height: 2,
    angle: 0,
  });
}
