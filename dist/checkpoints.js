import { animate } from "./vendor/anime.esm.min.js";
import { createCheckpointTracker } from "./checkpoint-state.js";
import { createSuccessSound } from "./success-sound.js";
import { PROJECTS } from "./portfolio-data.js";

/** Brief wooden notifications and a one-time celebration after all three reads. */
export function createCheckpoints(onAllComplete = () => {}) {
  const tracker = createCheckpointTracker(
    PROJECTS.map((project) => project.projectId),
  );
  const successSound = createSuccessSound();
  const toast = document.createElement("section");
  toast.id = "checkpoint-toast";
  toast.hidden = true;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.innerHTML =
    '<span class="checkpoint-icon" aria-hidden="true">✓</span><div><small></small><strong></strong><p></p></div>';
  document.body.append(toast);
  let timeout;
  let notificationAnimation;
  const reducedMotion = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  function celebrate() {
    successSound.play();
    if (reducedMotion()) return;
    const burst = document.createElement("div");
    burst.className = "checkpoint-confetti";
    burst.setAttribute("aria-hidden", "true");
    document.body.append(burst);
    const colors = ["#c5ad66", "#f4e4b6", "#749e79", "#b78b58", "#a8c8a2"];
    for (let index = 0; index < 54; index++) {
      const leaf = document.createElement("i");
      leaf.style.background = colors[index % colors.length];
      leaf.style.left = `${18 + Math.random() * 64}%`;
      burst.append(leaf);
      animate(leaf, {
        y: [-40, innerHeight + 60],
        x: [0, (Math.random() - 0.5) * 400],
        rotate: [0, (Math.random() - 0.5) * 1080],
        opacity: [
          { to: 1, duration: 150 },
          { to: 0, delay: 1800, duration: 600 },
        ],
        duration: 2600 + Math.random() * 900,
        delay: Math.random() * 400,
        ease: "outQuad",
      });
    }
    setTimeout(() => burst.remove(), 4500);
  }

  return {
    complete(project) {
      const progress = tracker.mark(project.projectId);
      if (!progress.changed) return;
      clearTimeout(timeout);
      notificationAnimation?.cancel();
      toast.hidden = false;
      toast.classList.toggle("all-complete", progress.isComplete);
      toast.querySelector("small").textContent = progress.isComplete
        ? "TRAIL COMPLETE"
        : "CHECKPOINT REACHED";
      toast.querySelector("strong").textContent =
        `${progress.completed}/${progress.total} complete`;
      toast.querySelector("p").textContent = progress.isComplete
        ? "All projects explored. Jumping back to the welcome clearing!"
        : project.title;
      notificationAnimation = animate(toast, {
        y: reducedMotion() ? 0 : [-24, 0],
        scale: reducedMotion() ? 1 : [0.8, 1],
        opacity: [0, 1],
        duration: reducedMotion() ? 1 : 500,
        ease: "outBack(1.5)",
      });
      if (progress.isComplete) {
        celebrate();
        onAllComplete();
      }
      timeout = setTimeout(
        () => {
          notificationAnimation = animate(toast, {
            opacity: 0,
            y: -12,
            duration: reducedMotion() ? 1 : 280,
            onComplete: () => {
              toast.hidden = true;
            },
          });
        },
        progress.isComplete ? 6500 : 4200,
      );
    },
  };
}
