import { HOME, PROJECT_WORLD, HOME_POND, isNearPond } from "./realm-data.js";
import { createTravel, sampleTravel } from "./journey-state.js";

/** Pond interaction and return sequencing. Rendering and normal movement stay outside. */
export function createJourney({ player, realms, canInteract, onDepart, onSwitch }) {
  const prompt = document.createElement("button");
  prompt.id = "pond-prompt";
  prompt.textContent = "↵  Dive into the projects world";
  prompt.hidden = true;
  document.body.append(prompt);
  const cover = document.createElement("div");
  cover.id = "journey-cover";
  cover.setAttribute("aria-hidden", "true");
  document.body.append(cover);
  const location = document.createElement("aside");
  location.id = "realm-location";
  location.setAttribute("aria-live", "polite");
  document.body.append(location);
  let travel = null;
  let travelTime = 0;
  let returnDelay = null;
  let hasReturned = false;

  function start() {
    if (travel) return;
    onDepart();
    travel = createTravel(realms.active, player.position,
      matchMedia("(prefers-reduced-motion: reduce)").matches);
    travelTime = 0;
    prompt.hidden = true;
    location.textContent = realms.active === HOME ? "Diving into the projects…" : "Trail complete · Jumping home…";
  }
  function dive() {
    if (realms.active !== HOME || returnDelay !== null || !canInteract() ||
      !isNearPond(player.position, HOME_POND)) return;
    start();
  }
  prompt.onclick = dive;
  addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.repeat || event.defaultPrevented || prompt.hidden) return;
    event.preventDefault();
    dive();
  });
  return {
    get busy() { return !!travel || returnDelay !== null; },
    returnHome() {
      if (realms.active !== PROJECT_WORLD || travel || returnDelay !== null) return;
      onDepart();
      returnDelay = 1.2;
      prompt.hidden = true;
    },
    cancel() {
      travel = null;
      returnDelay = null;
      cover.style.opacity = "0";
      prompt.hidden = true;
    },
    update(dt, enabled) {
      if (returnDelay !== null) {
        returnDelay -= dt;
        if (returnDelay > 0) return { waiting: true };
        returnDelay = null;
        start();
      }
      if (travel) {
        travelTime += dt;
        const pose = sampleTravel(travel, travelTime);
        if (realms.active !== pose.realm) {
          realms.activate(pose.realm);
          onSwitch();
        }
        player.position.set(pose.position.x, pose.position.y, pose.position.z);
        // Face the pond on departure and toward the clearing/trail on arrival.
        player.rotation.y = pose.realm === HOME || travel.from === HOME && travelTime < travel.duration / 2 ? Math.PI : 0;
        cover.style.opacity = String(pose.cover);
        if (pose.done) {
          hasReturned ||= travel.to === HOME;
          travel = null;
          onSwitch();
        }
        return pose;
      }
      prompt.hidden = !(enabled && realms.active === HOME && isNearPond(player.position, HOME_POND));
      location.textContent = realms.active === HOME
        ? hasReturned ? "Welcome back · All three projects explored" : "Welcome clearing · Meet Ethan, then find the pond"
        : "Projects world · Read the three project signs to return home";
      return null;
    },
  };
}
