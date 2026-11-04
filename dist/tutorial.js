/** A compact movement hint that disappears when the player starts moving. */
export function createTutorial() {
  const card = document.createElement("aside");
  card.id = "movement-tutorial";
  card.hidden = true;
  card.setAttribute("aria-label", "WASD or arrow keys to move");
  card.innerHTML = `
    <div class="tutorial-keys" aria-label="WASD"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></div>
    <span class="tutorial-or" aria-hidden="true">/</span>
    <div class="tutorial-keys" aria-label="Arrow keys"><kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd></div>
    <span class="tutorial-caption">to move</span>
    <button class="tutorial-dismiss" type="button" aria-label="Dismiss movement hint">×</button>`;
  document.body.append(card);
  const help = document.createElement("button");
  help.id = "controls-help";
  help.type = "button";
  help.textContent = "⌨";
  help.setAttribute("aria-label", "Show movement controls");
  help.hidden = true;
  document.body.append(help);
  let dismissed = false;
  let ready = false;
  card.querySelector(".tutorial-dismiss").onclick = () => {
    dismissed = true;
    card.hidden = true;
    help.hidden = !ready;
  };
  help.onclick = () => { dismissed = false; card.hidden = !ready; help.hidden = true; };
  return {
    update({ enabled, traveled = 0, turned = 0, height = 0 }) {
      ready = enabled;
      if (enabled && (traveled > .001 || Math.abs(turned) > .001 || height > .01)) dismissed = true;
      card.hidden = !enabled || dismissed;
      help.hidden = !enabled || !dismissed;
    },
  };
}
