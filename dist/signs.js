import { createRuneDust, isOnRune } from "./runic-rocks.js";
import * as THREE from "./vendor/three.module.js";
import { createPrimitives } from "./geometry.js";

import { createSignModalAnimation } from "./sign-modal-animation.js";

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

/** One shared reading panel for both realms; only active signs can be opened. */
export function createSignReader(signs, onProjectRead = () => {}, onRuneActivate = () => ({ x: innerWidth / 2, y: innerHeight * .65 })) {
  const prompt = document.createElement("button");
  prompt.id = "sign-prompt";
  prompt.hidden = true;
  document.body.append(prompt);
  const dialog = document.createElement("dialog");
  dialog.id = "sign-dialog";
  dialog.setAttribute("aria-labelledby", "sign-title");
  dialog.innerHTML = `
    <span class="sign-bolt top-left" aria-hidden="true"></span>
    <span class="sign-bolt bottom-left" aria-hidden="true"></span>
    <span class="sign-bolt bottom-right" aria-hidden="true"></span>
    <button class="sign-close" aria-label="Close sign">×</button>
    <div class="sign-content">
      <p class="sign-label">ALONG THE TRAIL</p>
      <h2 id="sign-title"></h2>
      <span class="sign-divider" aria-hidden="true">✦</span>
      <p class="sign-body"></p>
      <p class="sign-technologies"></p>
      <div class="sign-contact-links"></div>
      <a class="sign-project-link" target="_blank" rel="noopener noreferrer" hidden></a>
      <button class="sign-continue">Back to the trail <span aria-hidden="true">↵</span></button>
    </div>`;
  document.body.append(dialog);
  const modalAnimation = createSignModalAnimation(dialog);
  const dust = createRuneDust();
  let pending = false;
  let occupiedRune = null;
  let nearest = null;
  let activeSign = null;
  dialog.addEventListener("close", () => {
    if (activeSign?.projectId) onProjectRead(activeSign);
    activeSign = null;
  });

  function open() {
    if (!nearest || dialog.open || pending) return;
    const selected = nearest;
    if (selected.runic) {
      occupiedRune = selected;
      pending = true;
      prompt.hidden = true;
      const origin = onRuneActivate(selected);
      dust.play(origin, () => { pending = false; reveal(selected); });
    } else reveal(selected);
  }

  function reveal(nearest) {
    activeSign = nearest;
    dialog.classList.toggle("runic-panel", !!nearest.runic);
    dialog.querySelector(".sign-close").setAttribute("aria-label", nearest.runic ? "Close rune" : "Close sign");
    dialog.querySelector("h2").textContent = nearest.title;
    dialog.querySelector(".sign-body").textContent = nearest.text;
    dialog.querySelector(".sign-label").textContent =
      nearest.label ?? "ALONG THE TRAIL";
    const technologies = dialog.querySelector(".sign-technologies");
    technologies.textContent = nearest.technologies ?? "";
    technologies.hidden = !nearest.technologies;
    const contacts = dialog.querySelector(".sign-contact-links");
    contacts.replaceChildren();
    for (const item of nearest.links ?? []) {
      const anchor = document.createElement("a");
      anchor.textContent = item.label;
      anchor.href = item.url;
      if (item.url.startsWith("https:")) { anchor.target = "_blank"; anchor.rel = "noopener noreferrer"; }
      contacts.append(anchor);
    }
    const link = dialog.querySelector(".sign-project-link");
    link.hidden = !nearest.url;
    link.textContent = nearest.linkLabel ?? "View project on Devpost ↗";
    if (nearest.url) link.href = nearest.url;
    else link.removeAttribute("href");
    dialog.querySelector(".sign-continue").innerHTML = nearest.realm === "home"
      ? 'Back to the clearing <span aria-hidden="true">↵</span>'
      : 'Back to the trail <span aria-hidden="true">↵</span>';
    modalAnimation.open();
    prompt.hidden = true;
  }
  prompt.onclick = open;
  dialog.querySelector(".sign-close").onclick = () => modalAnimation.close();
  dialog.querySelector(".sign-continue").onclick = () => modalAnimation.close();
  addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.repeat) return;
    if (event.target.closest?.("a")) return;
    if (!dialog.open && !nearest) return;
    event.preventDefault();
    if (dialog.open) modalAnimation.close();
    else open();
  });

  return {
    close() {
      dust.cancel();
      pending = false;
      occupiedRune = null;
      if (dialog.open) modalAnimation.close();
      nearest = null;
      prompt.hidden = true;
    },
    get isOpen() {
      return dialog.open || pending;
    },
    update(position, realm = "projects", enabled = true) {
      nearest = null;
      const standing = signs.find((sign) => sign.runic && sign.realm === realm && isOnRune(position, sign));
      if (!standing) occupiedRune = null;
      let distance = 4;
      if (enabled && position.y < 0.1) {
        for (const sign of signs) {
          if ((sign.realm ?? "projects") !== realm) continue;
          const current = Math.hypot(position.x - sign.x, position.z - sign.z);
          if (current < distance) {
            nearest = sign;
            distance = current;
          }
        }
      }
      if (enabled && standing && standing !== occupiedRune && !dialog.open && !pending) {
        nearest = standing;
        open();
      }
      prompt.hidden = !nearest || dialog.open || pending;
      if (nearest) prompt.textContent = `↵  ${nearest.title}`;
    },
  };
}
