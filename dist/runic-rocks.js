import * as THREE from "./vendor/three.module.js";
import { createGroundText } from "./ground-text.js";

export const RUNE_RADIUS = 1.35;
export function isOnRune(position, rock) {
  return position.y < 0.1 && Math.hypot(position.x - rock.x, position.z - rock.z) < RUNE_RADIUS;
}

/** Low, passable stepping stones with a different carved sigil on each face. */
export function createRunicRocks(scene, rocks) {
  const glyphs = [
    [[0,-.62],[0,.62],[-.42,.2],[0,-.15],[.42,.2],[0,.62]],
    [[0,.65],[0,-.65],[.45,-.2],[0,.15],[-.45,-.2],[0,-.65]],
    [[-.45,-.55],[.45,0],[-.45,.55],[0,0],[-.45,-.55]],
    [[-.5,-.4],[.5,.4],[0,0],[.5,-.4],[-.5,.4]],
  ];
  const entries = rocks.map((rock, index) => {
    const group = new THREE.Group();
    group.name = `runic-rock-${rock.title.toLowerCase()}`;
    group.position.set(rock.x, 0, rock.z);
    scene.add(group);
    const stone = new THREE.Mesh(new THREE.CylinderGeometry(1.44, 1.66, .22, 9),
      new THREE.MeshStandardMaterial({ color: "#747183", roughness: 1, flatShading: true }));
    stone.position.y = .08;
    stone.rotation.y = index * .7;
    stone.receiveShadow = true;
    group.add(stone);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const c = canvas.getContext("2d");
    c.translate(256, 256);
    c.strokeStyle = "#ead4ff";
    c.lineWidth = 9;
    c.lineJoin = "round";
    c.lineCap = "round";
    c.beginPath();
    c.arc(0, 0, 215, 0, Math.PI * 2);
    c.stroke();
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      c.beginPath();
      c.moveTo(Math.cos(a) * 185, Math.sin(a) * 185);
      c.lineTo(Math.cos(a) * 201, Math.sin(a) * 201);
      c.stroke();
    }
    c.beginPath();
    glyphs[index % glyphs.length].forEach(([x, y], i) => c[i ? "lineTo" : "moveTo"](x * 220, y * 220));
    c.stroke();
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshStandardMaterial({ map: texture, transparent: true,
      emissive: "#c179ff", emissiveMap: texture, emissiveIntensity: .15,
      roughness: .85, depthWrite: false });
    const rune = new THREE.Mesh(new THREE.PlaneGeometry(2.65, 2.65), material);
    rune.rotation.x = -Math.PI / 2;
    rune.position.y = .198;
    group.add(rune);
    const light = new THREE.PointLight("#b56cff", 0, 5);
    light.position.y = .8;
    group.add(light);
    createGroundText(scene, { lines: [rock.title, "STEP ON THE RUNE"], x: rock.x, z: rock.z + 2,
      width: 3.8, height: .6, angle: 0, color: "#55506b" });
    return { rock, material, light, charge: 0 };
  });
  let active = null;
  return {
    activate(rock) { active = rock; },
    update(elapsed, position, enabled = true) {
      for (const entry of entries) {
        const lit = enabled && (entry.rock === active || (position && isOnRune(position, entry.rock)));
        entry.charge += ((lit ? 1 : 0) - entry.charge) * .12;
        entry.material.emissiveIntensity = .15 + entry.charge * (2.7 + Math.sin(elapsed * 5) * .3);
        entry.light.intensity = entry.charge * 7;
      }
      if (!enabled || (position && !rocks.some((rock) => isOnRune(position, rock)))) active = null;
    },
  };
}

/** A screen-space spiral grows from the stepped-on stone into a cloud of violet dust. */
export function createRuneDust() {
  const canvas = document.createElement("canvas");
  canvas.id = "rune-dust";
  canvas.setAttribute("aria-hidden", "true");
  canvas.hidden = true;
  document.body.append(canvas);
  const context = canvas.getContext("2d");
  let frame;
  let generation = 0;
  function cancel() {
    generation++;
    cancelAnimationFrame(frame);
    canvas.hidden = true;
  }
  return {
    cancel,
    play(origin, onReveal) {
      cancel();
      const run = generation;
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const duration = reduced ? 320 : 1800;
      const started = performance.now();
      const particles = Array.from({ length: 200 }, (_, i) => ({
        phase: i * 2.39996, radius: .2 + (i % 23) / 23,
        size: 9 + (i % 13) * 3, speed: 1 + (i % 7) / 7,
      }));
      canvas.hidden = false;
      function draw(now) {
        if (run !== generation) return;
        const p = Math.min(1, (now - started) / duration);
        const w = innerWidth, h = innerHeight;
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
        context.clearRect(0, 0, w, h);
        const expansion = Math.pow(p, 1.7);
        const cx = origin.x + (w / 2 - origin.x) * p;
        const cy = origin.y + (h / 2 - origin.y) * p;
        const spread = Math.hypot(w, h) * expansion;
        context.fillStyle = `rgba(94, 48, 133, ${Math.max(0, (p - .35) / .65)})`;
        context.fillRect(0, 0, w, h);
        for (const particle of particles) {
          const angle = particle.phase + (reduced ? 0 : p * 6 * particle.speed);
          const radius = spread * particle.radius;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius * .65 - Math.sin(p * Math.PI) * h * .22;
          const size = particle.size * (.3 + expansion * 6);
          const gradient = context.createRadialGradient(x, y, 0, x, y, size);
          gradient.addColorStop(0, `rgba(211, 165, 255, ${.3 + p * .3})`);
          gradient.addColorStop(1, "rgba(151, 85, 211, 0)");
          context.fillStyle = gradient;
          context.fillRect(x - size, y - size, size * 2, size * 2);
          if (particle.size < 22) {
            context.fillStyle = "#f0dcff";
            context.fillRect(x, y, 2, 2);
          }
        }
        if (p < 1) frame = requestAnimationFrame(draw);
        else { canvas.hidden = true; onReveal(); }
      }
      frame = requestAnimationFrame(draw);
    },
  };
}
