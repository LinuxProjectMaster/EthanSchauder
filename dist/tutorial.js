/** Three small, non-blocking hints teach the controls through actual movement. */
export function createTutorial() {
  const card = document.createElement("aside");
  card.id = "movement-tutorial";
  card.hidden = true;
  card.setAttribute("aria-label", "Movement tutorial");
  card.innerHTML = `
    <div class="tutorial-top"><span>A TINY ADVENTURE</span><button class="tutorial-skip" type="button">Skip</button></div>
    <div class="tutorial-instruction" role="status" aria-live="polite"></div>
    <div class="tutorial-dots" aria-hidden="true"><i></i><i></i><i></i></div>`;
  document.body.append(card);
  const help = document.createElement("button");
  help.id = "controls-help";
  help.type = "button";
  help.textContent = "? Controls";
  help.hidden = true;
  document.body.append(help);
  const instruction = card.querySelector(".tutorial-instruction");
  const steps = [
    '<h2>Let’s go for a wander.</h2><p><kbd>W</kbd> or <kbd>↑</kbd> to walk forward</p>',
    '<h2>Find your own direction.</h2><p><kbd>A</kbd> <kbd>D</kbd> or <kbd>←</kbd> <kbd>→</kbd> to turn</p>',
    '<h2>A little hop?</h2><p><kbd>Space</kbd> to jump</p>',
    '<h2>You’re ready to explore.</h2><p>Discover the stones. Find your next adventure at the pond.</p>',
  ];
  let stage = 0;
  let dismissed = false;
  let distance = 0;
  let turn = 0;
  let finishTime = 0;
  let ready = false;
  function render() {
    instruction.innerHTML = steps[stage];
    card.querySelectorAll(".tutorial-dots i").forEach((dot, index) => {
      dot.classList.toggle("complete", index < stage);
      dot.classList.toggle("current", index === stage);
    });
    card.querySelector(".tutorial-skip").textContent = stage === 3 ? "Got it" : "Skip";
  }
  function dismiss() { dismissed = true; card.hidden = true; help.hidden = !ready; }
  card.querySelector(".tutorial-skip").onclick = dismiss;
  help.onclick = () => { dismissed = false; stage = 0; distance = turn = finishTime = 0; render(); };
  render();
  return {
    update({ enabled, dt = 0, traveled = 0, turned = 0, height = 0 }) {
      ready = enabled;
      card.hidden = !enabled || dismissed;
      help.hidden = !enabled || !dismissed;
      if (!enabled || dismissed) return;
      distance += traveled;
      turn += Math.abs(turned);
      const complete = stage === 0 ? distance >= .8 : stage === 1 ? turn >= .4 : stage === 2 ? height > .2 : false;
      if (complete) { stage++; render(); }
      if (stage === 3) { finishTime += dt; if (finishTime > 4) dismiss(); }
    },
  };
}
