import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three.module.js";
import { createTravel, sampleTravel } from "../dist/journey-state.js";
import { createJourney } from "../dist/journey.js";
import { createRealms } from "../dist/realms.js";
import { HOME, PROJECT_WORLD, HOME_SPAWN, PROJECT_SPAWN, HOME_POND, HOME_SIGNS, isInPond } from "../dist/realm-data.js";
import { PROJECTS } from "../dist/portfolio-data.js";
import { createPond } from "../dist/components/scenery/pond.js";
import { CollisionWorld } from "../dist/collisions.js";
import { exampleScene } from "../dist/scenes/example-scene.js";

function mockDocument(t) {
  const original = globalThis.document;
  const context = new Proxy({ measureText: () => ({ width: 500 }) }, {
    get: (target, key) => target[key] ?? (() => {}),
    set: (target, key, value) => { target[key] = value; return true; },
  });
  const elements = [];
  globalThis.document = {
    body: { append(element) { elements.push(element); } },
    createElement: () => ({ style: {}, setAttribute() {}, getContext: () => context }),
  };
  t.after(() => { globalThis.document = original; });
  return elements;
}

test("pond interaction requires a grounded otter inside the water", () => {
  assert.equal(isInPond(HOME_SPAWN, HOME_POND), false);
  assert.equal(isInPond({ x: 0, y: 0, z: -4 }, HOME_POND), false);
  assert.equal(isInPond({ x: 0, y: 0, z: -6 }, HOME_POND), true);
  assert.equal(isInPond({ x: 4, y: 0, z: -6 }, HOME_POND), false);
  assert.equal(isInPond({ x: 0, y: 1, z: -6 }, HOME_POND), false);
});

test("pond spin precedes the loading animation, which conceals the scene switch", () => {
  for (const reducedMotion of [false, true]) {
    for (const from of [HOME, PROJECT_WORLD]) {
      const start = from === HOME ? { x: 0, y: 0, z: -6 } : { x: 10, y: 0, z: 84 };
      const to = from === HOME ? PROJECT_WORLD : HOME;
      const destination = to === HOME ? HOME_SPAWN : PROJECT_SPAWN;
      const travel = createTravel({ from, to, start, destination, spinPond: from === HOME, reducedMotion });
      assert.deepEqual(sampleTravel(travel, 0).position, start);
      const spinning = sampleTravel(travel, travel.anticipation * 0.75);
      assert.equal(spinning.realm, from);
      assert.equal(spinning.showLoader, false, "the pond spins before the loader appears");
      assert.deepEqual(spinning.position, start, "travel keeps the otter still without a return hop");
      if (from === HOME) {
        assert.deepEqual(spinning.position, start, "the otter stays in the pool");
        assert.ok(spinning.swirl > 0);
        assert.equal(spinning.pondRotation > 0, !reducedMotion);
      }
      const loading = sampleTravel(travel, travel.anticipation + travel.fadeIn + 0.01);
      assert.equal(loading.showLoader, true);
      assert.equal(loading.cover, 1);
      assert.equal(loading.realm, from, "the loader plays before switching scenes");
      const switched = sampleTravel(travel, travel.switchAt);
      assert.equal(switched.realm, to);
      assert.equal(switched.cover, 1);
      assert.equal(switched.showLoader, true);
      assert.deepEqual(switched.position, destination);
      const finished = sampleTravel(travel, travel.duration + 0.1);
      assert.deepEqual(finished.position, destination);
      assert.equal(finished.cover, 0);
      assert.equal(finished.showLoader, false);
      assert.equal(finished.done, true);
    }
  }
});

test("pond spin stays flat across the pool and clears on cancellation", () => {
  const position = { x: 1, y: 0, z: -7 };
  const scene = new THREE.Scene();
  const pond = createPond(scene, new CollisionWorld(), HOME_POND);
  pond.update(1, position, { swirl: 1, pondRotation: 3 });
  const spiral = scene.getObjectByName("pond-spin");
  assert.equal(spiral.visible, true);
  for (const arm of spiral.children) {
    const vertices = arm.geometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) assert.equal(vertices.getZ(i), 0);
  }
  pond.update(2, position);
  assert.equal(spiral.visible, false);
});

test("home and project scenery have isolated visibility, signs, and collision worlds", (t) => {
  mockDocument(t);
  const scene = new THREE.Scene();
  const realms = createRealms(scene);
  assert.equal(realms.active, HOME);
  const homeCollisions = realms.current.collisions;
  const home = scene.getObjectByName("home-world");
  const projects = scene.getObjectByName("projects-world");
  assert.ok(home.visible && !projects.visible);
  assert.ok(realms.current.signs.every((sign) => !sign.projectId));
  for (const rock of HOME_SIGNS) {
    const crossing = { x: rock.x - 2, z: rock.z };
    homeCollisions.move(crossing, 4, 0, .85);
    assert.ok(Math.abs(crossing.x - (rock.x + 2)) < .001, "welcome rocks can be walked across");
  }
  const position = { ...HOME_SPAWN };
  homeCollisions.move(position, 0, 0, 0.85);
  assert.deepEqual(position, HOME_SPAWN);
  const swimmer = { x: 0, z: -2 };
  homeCollisions.move(swimmer, 0, -10, 0.85);
  assert.ok(swimmer.z < HOME_POND.z, "the otter can walk through the pond");
  realms.activate(PROJECT_WORLD);
  assert.ok(!home.visible && projects.visible);
  assert.notEqual(realms.current.collisions, homeCollisions);
  const arrival = { ...PROJECT_SPAWN };
  realms.current.collisions.move(arrival, 0, 0, 0.85);
  assert.deepEqual(arrival, PROJECT_SPAWN);
  assert.equal(realms.current.signs.filter((sign) => sign.projectId).length, PROJECTS.length);
});

test("Enter dives once, the home button returns, and reset cancels travel", (t) => {
  const elements = mockDocument(t);
  const originalListen = globalThis.addEventListener;
  const originalMedia = globalThis.matchMedia;
  let keydown;
  globalThis.addEventListener = (_, listener) => { keydown = listener; };
  globalThis.matchMedia = () => ({ matches: false });
  t.after(() => {
    globalThis.addEventListener = originalListen;
    globalThis.matchMedia = originalMedia;
  });
  const player = new THREE.Group();
  player.position.set(0, 0, -6);
  const definitions = {
    [HOME]: { spawn: HOME_SPAWN, pond: HOME_POND, heading: Math.PI,
      portal: { to: PROJECT_WORLD, label: "Explore projects" }, location: "Home" },
    [PROJECT_WORLD]: { spawn: PROJECT_SPAWN, heading: 0, location: "Projects" },
  };
  const realms = { active: HOME, activate(id) { this.active = id; },
    get: (id) => definitions[id], get current() { return definitions[this.active]; } };
  const loader = { visible: false, opacity: 0,
    show() { this.visible = true; }, setOpacity(value) { this.opacity = value; },
    hide() { this.visible = false; } };
  let departures = 0;
  let allowInteraction = true;
  const journey = createJourney({ player, realms, loadingScreen: loader, canInteract: () => allowInteraction,
    onDepart() { departures++; }, onSwitch() {} });
  journey.update(0, true);
  assert.equal(elements[0].hidden, false);
  const enter = () => keydown({ key: "Enter", preventDefault() {} });
  allowInteraction = false;
  enter();
  assert.equal(journey.busy, false, "an open sign blocks pond travel");
  allowInteraction = true;
  for (let i = 0; i < 30; i++) journey.update(0.04, true);
  assert.equal(journey.busy, false, "standing in the pool never starts travel");
  assert.equal(realms.active, HOME);
  enter();
  enter();
  assert.equal(departures, 1);
  journey.update(1.4, true);
  assert.equal(loader.visible, true);
  assert.equal(realms.active, HOME, "the loader starts before transport");
  for (let i = 0; i < 110; i++) journey.update(0.04, true);
  assert.equal(realms.active, PROJECT_WORLD);
  assert.equal(journey.busy, false);
  assert.deepEqual(player.position.toArray(), [PROJECT_SPAWN.x, 0, PROJECT_SPAWN.z]);
  elements.find((element) => element.id === "return-home").onclick();
  assert.equal(journey.busy, true);
  for (let i = 0; i < 110; i++) {
    journey.update(0.04, true);
    assert.equal(player.position.y, 0, "the otter stays grounded throughout the return");
  }
  assert.equal(realms.active, HOME);
  assert.equal(journey.busy, false);
  assert.deepEqual(player.position.toArray(), [HOME_SPAWN.x, 0, HOME_SPAWN.z]);
  assert.equal(departures, 2, "each journey clears inputs once at launch");
  player.position.set(0, 0, -6);
  journey.update(0, true);
  enter();
  assert.equal(journey.busy, true);
  journey.update(1.4, true);
  assert.equal(loader.visible, true);
  journey.cancel();
  assert.equal(loader.visible, false, "reset dismisses the travel loader");
  journey.update(3, true);
  assert.equal(realms.active, HOME);
  assert.equal(journey.busy, false);
});


test("projects can be left using the home button or pond", (t) => {
  const elements = mockDocument(t);
  const originalListen = globalThis.addEventListener;
  const originalMedia = globalThis.matchMedia;
  globalThis.addEventListener = () => {};
  globalThis.matchMedia = () => ({ matches: true });
  t.after(() => {
    globalThis.addEventListener = originalListen;
    globalThis.matchMedia = originalMedia;
  });
  const realms = createRealms(new THREE.Scene());
  realms.activate(PROJECT_WORLD);
  const player = new THREE.Group();
  player.position.copy(PROJECT_SPAWN);
  let allowed = true;
  const journey = createJourney({ player, realms,
    loadingScreen: { show() {}, hide() {}, setOpacity() {} },
    canInteract: () => allowed, onDepart() {}, onSwitch() {} });
  const button = elements.find((element) => element.id === "return-home");
  const pondPrompt = elements.find((element) => element.id === "pond-prompt");
  journey.update(0, true);
  assert.equal(button.hidden, false, "return is available immediately on arrival");
  allowed = false;
  button.onclick();
  assert.equal(journey.busy, false, "reading a page blocks background travel");
  allowed = true;
  button.onclick();
  assert.equal(journey.busy, true);
  for (let i = 0; i < 60; i++) journey.update(.04, true);
  assert.equal(realms.active, HOME);
  assert.equal(button.hidden, true);
  realms.activate(PROJECT_WORLD);
  player.position.set(realms.current.pond.x, 0, realms.current.pond.z);
  journey.update(0, true);
  assert.equal(pondPrompt.hidden, false);
  pondPrompt.onclick();
  assert.equal(journey.busy, true);
  for (let i = 0; i < 60; i++) journey.update(.04, true);
  assert.equal(realms.active, HOME, "the arrival pond also returns home");
});

test("a third component-based scene supports pond entry and return home without controller changes", (t) => {
  const elements = mockDocument(t);
  const originalListen = globalThis.addEventListener;
  const originalMedia = globalThis.matchMedia;
  globalThis.addEventListener = () => {};
  globalThis.matchMedia = () => ({ matches: true });
  t.after(() => {
    globalThis.addEventListener = originalListen;
    globalThis.matchMedia = originalMedia;
  });
  const realms = createRealms(new THREE.Scene(), [
    { id: "lobby", spawn: { x: 0, y: 0, z: 6 }, pond: HOME_POND,
      portal: { to: exampleScene.id, label: "Visit garden" }, components: [] },
    { ...exampleScene, portal: { to: "lobby", label: "Return to lobby" } },
  ]);
  const player = new THREE.Group();
  player.position.set(HOME_POND.x, 0, HOME_POND.z);
  const journey = createJourney({ player, realms,
    loadingScreen: { show() {}, hide() {}, setOpacity() {} },
    canInteract: () => true, onDepart() {}, onSwitch() {} });
  const pondPrompt = elements.find((element) => element.id === "pond-prompt");
  const homeButton = elements.find((element) => element.id === "return-home");
  journey.update(0, true);
  pondPrompt.onclick();
  for (let i = 0; i < 60; i++) journey.update(.04, true);
  assert.equal(realms.active, "garden");
  assert.deepEqual(player.position.toArray(), [0, 0, 6]);
  journey.update(0, true);
  assert.equal(homeButton.hidden, false);
  homeButton.onclick();
  for (let i = 0; i < 60; i++) journey.update(.04, true);
  assert.equal(realms.active, "lobby", "home is the first registered scene, regardless of its ID");
});
