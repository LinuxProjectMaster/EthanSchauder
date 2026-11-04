import { MathUtils } from "./vendor/three.module.js";
import { PLAY_CAMERA } from "./camera-intro.js";

/** Keyboard movement and pointer-controlled camera, kept separate from simulation. */
export function createControls(canvas, onReset) {
  const keys = new Set();
  const state = {
    orbit: 0.62,
    ...PLAY_CAMERA,
    jumpQueued: false,
    turnAroundQueued: false,
    lastTurnDirection: 1,
  };
  let pointer = null;

  addEventListener("keydown", (event) => {
    if (globalThis.document?.body?.classList?.contains("section-view")) return;
    const key = event.key.toLowerCase();
    if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key))
      event.preventDefault();
    const isBack = key === "s" || key === "arrowdown";
    const backHeld = keys.has("s") || keys.has("arrowdown");
    if (isBack && !event.repeat && !backHeld) state.turnAroundQueued = true;
    if (!event.repeat) {
      if (key === "a" || key === "arrowleft") state.lastTurnDirection = 1;
      if (key === "d" || key === "arrowright") state.lastTurnDirection = -1;
    }
    keys.add(key);
    if (key === " " && !event.repeat) state.jumpQueued = true;
    if (key === "r" && !event.repeat) onReset();
  });
  addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
  addEventListener("blur", () => {
    keys.clear();
    pointer = null;
    state.turnAroundQueued = false;
    state.jumpQueued = false;
  });

  canvas.style.cursor = "grab";
  canvas.addEventListener("pointerdown", (event) => {
    pointer = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = "grabbing";
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!pointer) return;
    state.orbit -= (event.clientX - pointer.x) * 0.006;
    state.elevation = MathUtils.clamp(
      state.elevation + (event.clientY - pointer.y) * 0.004,
      0.32,
      1.25,
    );
    pointer = { x: event.clientX, y: event.clientY };
  });
  for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) {
    canvas.addEventListener(name, () => {
      pointer = null;
      canvas.style.cursor = "grab";
    });
  }
  canvas.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      state.distance = MathUtils.clamp(
        state.distance + event.deltaY * 0.025,
        13,
        52,
      );
    },
    { passive: false },
  );

  return {
    state,
    movement() {
      const turnAround = state.turnAroundQueued;
      state.turnAroundQueued = false;
      return {
        forward: keys.has("w") || keys.has("arrowup"),
        turn:
          Number(keys.has("a") || keys.has("arrowleft")) -
          Number(keys.has("d") || keys.has("arrowright")),
        turnAround,
        lastTurnDirection: state.lastTurnDirection,
        sprint: keys.has("shift"),
      };
    },
    clearMovement() {
      keys.clear();
      state.jumpQueued = false;
      state.turnAroundQueued = false;
    },
    reset() {
      keys.clear();
      Object.assign(state, {
        orbit: 0.62,
        ...PLAY_CAMERA,
        jumpQueued: false,
        turnAroundQueued: false,
        lastTurnDirection: 1,
      });
    },
  };
}
