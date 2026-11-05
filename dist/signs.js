import { createRuneDust } from "./components/rune-dust.js";
import { isOnRune } from "./components/scenery/runic-rocks.js";

/** Full-page section routes, reached from the stones or project trail. */
export function createSignReader(signs, onRuneActivate = () => ({ x: innerWidth / 2, y: innerHeight * .65 })) {
  const prompt = document.createElement("button");
  prompt.id = "sign-prompt";
  prompt.hidden = true;
  document.body.append(prompt);
  const page = document.createElement("main");
  page.id = "section-page";
  page.hidden = true;
  page.innerHTML = `
    <article class="section-article" aria-labelledby="section-title">
      <header class="section-heading">
        <p class="section-eyebrow"></p>
        <h1 id="section-title" tabindex="-1"></h1>
      </header>
      <div class="section-content">
        <img class="section-portrait" hidden />
        <div class="section-copy"></div>
      </div>
      <div class="section-technologies"></div>
      <div class="section-links"></div>
    </article>
    <footer class="section-footer">
      <a class="section-return" href="#">← Back to the world</a>
      <p>Explore the world to discover other pages.</p>
    </footer>`;
  document.body.append(page);
  const slug = (sign) => sign.projectId ?? sign.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const route = (sign) => `#/section/${slug(sign)}`;
  const dust = createRuneDust();
  let pending = false;
  let occupiedRune = null;
  let nearest = null;
  let activeSign = null;
  let lastFocus = null;
  const inertElements = new Map();
  let pageAnimation;
  let closing = false;

  function transitionPage(entering, onComplete = () => {}) {
    // Capture the current frame before cancelling, so rapid Back/Forward stays continuous.
    const opacity = page.hidden ? 0 : Number(getComputedStyle(page).opacity);
    const transform = page.hidden ? "translateY(16px)" : getComputedStyle(page).transform;
    pageAnimation?.cancel();
    pageAnimation = null;
    page.hidden = false;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onComplete();
      return;
    }
    pageAnimation = page.animate([
      { opacity, transform },
      { opacity: entering ? 1 : 0, transform: entering ? "translateY(0)" : "translateY(10px)" },
    ], {
      duration: entering ? 520 : 320,
      easing: "cubic-bezier(.22, 1, .36, 1)",
      fill: "forwards",
    });
    pageAnimation.onfinish = () => {
      const finished = pageAnimation;
      pageAnimation = null;
      onComplete();
      finished.cancel();
    };
  }

  function hidePage() {
    if (!activeSign || closing) return;
    closing = true;
    page.inert = true;
    transitionPage(false, () => {
      activeSign = null;
      page.hidden = true;
      closing = false;
      document.body.classList.remove("section-view");
      for (const [element, inert] of inertElements) element.inert = inert;
      inertElements.clear();
      document.title = "Ethan Schauder";
      if (lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
    });
  }
  function render(sign) {
    if (page.hidden) lastFocus = document.activeElement;
    activeSign = sign;
    closing = false;
    page.inert = false;
    page.classList.toggle("portrait-page", !!sign.image);
    const title = sign.pageTitle ?? sign.title.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
    page.querySelector("h1").textContent = title;
    const eyebrow = page.querySelector(".section-eyebrow");
    eyebrow.textContent = sign.label ?? "A LITTLE FURTHER ALONG THE TRAIL";
    eyebrow.hidden = !eyebrow.textContent;
    const copy = page.querySelector(".section-copy");
    copy.replaceChildren();
    const portrait = page.querySelector(".section-portrait");
    portrait.hidden = !sign.image;
    page.querySelector(".section-content").classList.toggle("has-portrait", !!sign.image);
    if (sign.image) {
      portrait.src = sign.image.src;
      portrait.alt = sign.image.alt;
      portrait.width = sign.image.width;
      portrait.height = sign.image.height;
      portrait.decoding = "async";
    } else {
      portrait.removeAttribute("src");
      portrait.alt = "";
    }
    // Give the original copy room to breathe without changing its content.
    const sentences = sign.text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) ?? [sign.text];
    const paragraphs = sign.text.includes("\n\n")
      ? sign.text.split(/\n\n+/)
      : Array.from({ length: Math.ceil(sentences.length / 2) }, (_, i) => sentences.slice(i * 2, i * 2 + 2).join("").trim());
    for (const text of paragraphs) {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      copy.append(paragraph);
    }
    const tech = page.querySelector(".section-technologies");
    tech.replaceChildren();
    tech.hidden = !sign.technologies;
    for (const name of (sign.technologies ?? "").split(" · ").filter(Boolean)) {
      const tag = document.createElement("span");
      tag.textContent = name;
      tech.append(tag);
    }
    const links = page.querySelector(".section-links");
    links.replaceChildren();
    const items = [...(sign.links ?? [])];
    if (sign.url) items.push({ label: sign.linkLabel ?? "View project on Devpost ↗", url: sign.url });
    for (const item of items) {
      const link = document.createElement("a");
      link.href = item.url;
      link.textContent = item.label;
      if (item.url.startsWith("https:")) { link.target = "_blank"; link.rel = "noopener noreferrer"; }
      links.append(link);
    }
    for (const element of document.body.children) {
      if (element !== page && !inertElements.has(element)) {
        inertElements.set(element, element.inert);
        element.inert = true;
      }
    }
    transitionPage(true);
    document.body.classList.add("section-view");
    document.title = `${title} · Ethan Schauder`;
    page.querySelector(".section-article").scrollTop = 0;
    page.querySelector("h1").focus({ preventScroll: true });
    prompt.hidden = true;
  }
  function syncRoute() {
    dust.cancel();
    pending = false;
    const selected = signs.find((sign) => route(sign) === location.hash);
    if (selected) render(selected);
    else hidePage();
  }
  function navigate(sign) {
    if (location.hash === route(sign)) render(sign);
    else { history.pushState(null, "", route(sign)); syncRoute(); }
  }
  function returnToWorld() {
    history.pushState(null, "", location.pathname + location.search);
    syncRoute();
  }
  function open() {
    if (!nearest || activeSign || pending) return;
    const selected = nearest;
    if (selected.runic) {
      occupiedRune = selected;
      pending = true;
      prompt.hidden = true;
      dust.play(onRuneActivate(selected), () => { pending = false; navigate(selected); });
    } else navigate(selected);
  }
  prompt.onclick = open;
  addEventListener("hashchange", syncRoute);
  addEventListener("popstate", syncRoute);
  addEventListener("keydown", (event) => {
    if (event.repeat) return;
    if (event.key === "Escape" && (activeSign || pending)) {
      event.preventDefault();
      dust.cancel();
      pending = false;
      if (activeSign) returnToWorld();
      return;
    }
    if (event.key !== "Enter" || activeSign || event.target.closest?.("a, button")) return;
    if (!nearest) return;
    event.preventDefault();
    open();
  });
  syncRoute();
  return {
    close() {
      dust.cancel();
      pending = false;
      occupiedRune = null;
      if (activeSign) { history.replaceState(null, "", location.pathname + location.search); hidePage(); }
      nearest = null;
      prompt.hidden = true;
    },
    get isOpen() { return !!activeSign || pending; },
    update(position, realm = "projects", enabled = true) {
      nearest = null;
      const standing = signs.find((sign) => sign.runic && sign.realm === realm && isOnRune(position, sign));
      if (!standing) occupiedRune = null;
      let distance = 4;
      if (enabled && position.y < .1 && !activeSign) {
        for (const sign of signs) {
          if ((sign.realm ?? "projects") !== realm) continue;
          const current = Math.hypot(position.x - sign.x, position.z - sign.z);
          if (current < distance) { nearest = sign; distance = current; }
        }
      }
      if (enabled && standing && standing !== occupiedRune && !activeSign && !pending) {
        nearest = standing;
        open();
      }
      prompt.hidden = !nearest || !!activeSign || pending;
      if (nearest) prompt.textContent = `↵  ${nearest.title}`;
    },
  };
}
