import * as THREE from "../../vendor/three.module.js";
import { createPrimitives } from "../../geometry.js";

/** Wooden trail signs, proximity prompts, and a keyboard-accessible reading panel. */
export function createSignboards(scene, collisions, signData) {
  const { box, cylinder } = createPrimitives(scene);
  for (const sign of signData) {
    const group = new THREE.Group();
    group.position.set(sign.x, 0, sign.z);
    scene.add(group);
    cylinder(0, 0.9, 0, 0.09, 0.11, 1.8, "#876a49", 8, group);
    box(0, 1.85, 0, 2.5, 0.95, 0.18, "#a48254", group);
    collisions.addBox(sign.x, sign.z, 2.5, 0.22);

    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    context.fillStyle = "#e8d6aa";
    context.fillRect(0, 0, 768, 256);
    context.strokeStyle = "#92784e";
    context.lineWidth = 5;
    context.strokeRect(15, 15, 738, 226);
    context.fillStyle = "#42563c";
    context.textAlign = "center";
    context.font = "bold 34px sans-serif";
    context.fillText(sign.title, 384, 113);
    context.font = "24px sans-serif";
    context.fillText("↵", 384, 181);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 1,
    });
    // Put matching faces on both sides so signs remain readable on the return walk.
    for (const side of [-1, 1]) {
      const face = new THREE.Mesh(
        new THREE.PlaneGeometry(2.36, 0.82),
        material,
      );
      face.position.set(0, 1.85, side * 0.101);
      face.rotation.y = side === 1 ? 0 : Math.PI;
      group.add(face);
    }
  }
}

