/** Pale lavender smoke and fine embers match the section pages, with depth and drag. */
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
  // Cache soft sprites once instead of allocating hundreds of gradients per frame.
  function glow(color) {
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const c = sprite.getContext("2d");
    const gradient = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, `rgba(${color},0.65)`);
    gradient.addColorStop(0.25, `rgba(${color},0.22)`);
    gradient.addColorStop(1, `rgba(${color},0)`);
    c.fillStyle = gradient;
    c.fillRect(0, 0, 64, 64);
    return sprite;
  }
  let smoke, spark;
  return {
    cancel,
    play(origin, onReveal) {
      cancel();
      const run = generation;
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const duration = reduced ? 320 : 2000;
      const started = performance.now();
      smoke ??= glow("224,208,237");
      spark ??= glow("245,240,247");
      const particles = Array.from({ length: 280 }, (_, i) => ({
        phase: i * 2.399963,
        radius: Math.sqrt((i * 73 % 281) / 281),
        depth: 0.35 + (i * 37 % 101) / 101,
        size: 0.7 + (i * 17 % 13) / 6,
        delay: (i % 11) * 0.012,
        wisp: i % 7 === 0,
      }));
      canvas.hidden = false;
      function draw(now) {
        if (run !== generation) return;
        const p = Math.min(1, (now - started) / duration);
        const w = innerWidth, h = innerHeight;
        const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
          canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
        }
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, w, h);
        context.globalCompositeOperation = "source-over";
        context.globalAlpha = 1;
        const wash = reduced ? p : Math.max(0, (p - 0.5) / 0.5);
        // Match the section page's #f5f0f7 background at the end of the reveal.
        context.fillStyle = `rgba(245, 240, 247, ${wash})`;
        context.fillRect(0, 0, w, h);
        if (!reduced) {
          const spread = Math.hypot(w, h) * Math.pow(p, 1.6) * 0.8;
          const cx = origin.x + (w / 2 - origin.x) * p;
          const cy = origin.y + (h * 0.45 - origin.y) * p;
          for (const particle of particles) {
            const age = Math.max(0, p - particle.delay);
            if (age === 0) continue;
            // Shared curl resembles a gust; each depth layer responds at a different rate.
            const angle = particle.phase + age * (4.8 - particle.depth * 1.5);
            const radius = spread * particle.radius * particle.depth;
            const curl = Math.sin(age * 11 + particle.phase) * age * 32;
            const x = cx + Math.cos(angle) * radius + curl;
            const y = cy + Math.sin(angle) * radius * 0.55
              - Math.sin(age * Math.PI) * h * 0.22 * particle.depth;
            const fade = Math.min(1, age * 9) * (0.7 + Math.sin(age * 15 + particle.phase) * 0.3);
            if (particle.wisp) {
              const size = (22 + age * 160) * particle.depth;
              context.globalCompositeOperation = "source-over";
              context.globalAlpha = fade * 0.48;
              context.drawImage(smoke, x - size, y - size * 0.6, size * 2, size * 1.2);
            } else {
              const size = particle.size * particle.depth;
              context.globalCompositeOperation = "lighter";
              context.globalAlpha = fade * 0.65;
              context.drawImage(spark, x - size * 5, y - size * 5, size * 10, size * 10);
              // A short curved glint follows the local flow, instead of square confetti.
              context.strokeStyle = "#f5f0f7";
              context.lineWidth = Math.max(0.5, size * 0.55);
              context.lineCap = "round";
              context.beginPath();
              context.moveTo(x, y);
              context.quadraticCurveTo(x + Math.sin(angle) * size * 2, y - Math.cos(angle) * size,
                x + Math.sin(angle) * size * (2 + age * 4), y - Math.cos(angle) * size * 3);
              context.stroke();
            }
          }
        }
        context.globalAlpha = 1;
        context.globalCompositeOperation = "source-over";
        if (p < 1) frame = requestAnimationFrame(draw);
        else { canvas.hidden = true; onReveal(); }
      }
      frame = requestAnimationFrame(draw);
    },
  };
}
