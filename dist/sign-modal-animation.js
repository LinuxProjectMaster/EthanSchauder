import { animate } from "./vendor/anime.esm.min.js";

/** Keep the native dialog's focus trap while animating its entrance and exit. */
export function createSignModalAnimation(dialog) {
  const content = dialog.querySelector(".sign-content");
  let animation;
  let contentAnimation;
  let closing = false;
  const reducedMotion = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  function cancelAnimations() {
    animation?.cancel();
    contentAnimation?.cancel();
  }

  function close() {
    if (!dialog.open || closing) return;
    closing = true;
    cancelAnimations();
    if (reducedMotion()) {
      dialog.close();
      closing = false;
      return;
    }
    animation = animate(dialog, {
      scale: 0,
      opacity: 0,
      duration: 190,
      ease: "inQuad",
      onComplete: () => {
        dialog.close();
        closing = false;
      },
    });
  }

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });

  return {
    open() {
      cancelAnimations();
      closing = false;
      dialog.style.transform = reducedMotion() ? "scale(1)" : "scale(0)";
      dialog.style.opacity = reducedMotion() ? "1" : "0";
      content.style.opacity = reducedMotion() ? "1" : "0";
      dialog.showModal();
      if (reducedMotion()) return;
      animation = animate(dialog, {
        scale: [0, 1],
        opacity: [0, 1],
        rotate: [-2, 0],
        duration: 540,
        ease: "outExpo",
      });
      contentAnimation = animate(content, {
        opacity: [0, 1],
        y: [8, 0],
        duration: 320,
        delay: 130,
        ease: "outQuad",
      });
    },
    close,
  };
}
