import { HOME, PROJECT_WORLD, isInPond } from "./realm-data.js";
import { createTravel, sampleTravel } from "./journey-state.js";

/** Portal input and travel sequencing; scene building and loading visuals stay outside. */
export function createJourney({ player, realms, loadingScreen, canInteract, onDepart, onSwitch }) {
  const prompt = document.createElement("button");
  prompt.id = "pond-prompt";
  prompt.hidden = true;
  document.body.append(prompt);
  const location = document.createElement("aside");
  location.id = "realm-location";
  location.setAttribute("aria-live", "polite");
  document.body.append(location);
  let travel = null;
  let travelTime = 0;
  let returnDelay = null;
  const homeButton = document.createElement("button");
  homeButton.id = "return-home";
  homeButton.textContent = "← Return home";
  homeButton.hidden = true;
  document.body.append(homeButton);
  homeButton.onclick = () => {
    if (realms.active === PROJECT_WORLD && canInteract() && !travel && returnDelay === null) start(HOME);
  };

  function start(target, spinPond = false) {
    if (travel) return;
    const destination = realms.get(target);
    onDepart();
    travel = createTravel({ from: realms.active, to: target,
      start: { x: player.position.x, y: player.position.y, z: player.position.z },
      destination: destination.spawn, spinPond,
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches });
    travelTime = 0;
    prompt.hidden = true;
    homeButton.hidden = true;
    location.textContent = spinPond ? "The pond is stirring…" : "Returning home…";
  }
  function enterPortal() {
    const { portal, pond } = realms.current;
    if (!portal || !pond || returnDelay !== null || !canInteract() || !isInPond(player.position, pond)) return;
    start(portal.to, true);
  }
  prompt.onclick = enterPortal;
  addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.repeat || event.defaultPrevented || prompt.hidden) return;
    event.preventDefault();
    enterPortal();
  });
  return {
    get busy() { return !!travel || returnDelay !== null; },
    returnHome() {
      if (realms.active !== PROJECT_WORLD || travel || returnDelay !== null) return;
      onDepart();
      returnDelay = 1.2;
      prompt.hidden = true;
      homeButton.hidden = true;
    },
    cancel() {
      if (travel) loadingScreen.hide();
      travel = null;
      returnDelay = null;
      prompt.hidden = true;
      homeButton.hidden = true;
    },
    update(dt, enabled) {
      if (returnDelay !== null) {
        returnDelay -= dt;
        if (returnDelay > 0) return { waiting: true };
        returnDelay = null;
        start(HOME);
      }
      if (travel) {
        travelTime += dt;
        const pose = sampleTravel(travel, travelTime);
        // Make the loader fully opaque before activating the destination.
        if (pose.showLoader) {
          loadingScreen.show("Travelling to the next world");
          loadingScreen.setOpacity(pose.cover);
        }
        if (realms.active !== pose.realm) {
          realms.activate(pose.realm);
          onSwitch();
        }
        player.position.set(pose.position.x, pose.position.y, pose.position.z);
        if (pose.done) {
          travel = null;
          loadingScreen.hide();
          onSwitch();
        }
        return pose;
      }
      homeButton.hidden = !(enabled && realms.active === PROJECT_WORLD);
      const { pond, portal } = realms.current;
      prompt.hidden = !(enabled && portal && pond && isInPond(player.position, pond));
      if (portal) prompt.textContent = `↵  ${portal.label}`;
      location.textContent = realms.current.location;
      return null;
    },
  };
}
