import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three.module.js";
import { createTravel, sampleTravel } from "../dist/journey-state.js";
import { createJourney } from "../dist/journey.js";
import { createRealms } from "../dist/realms.js";
import { HOME, PROJECT_WORLD, HOME_SPAWN, PROJECT_SPAWN, HOME_POND, HOME_SIGNS, isInPond } from "../dist/realm-data.js";
import { PROJECTS } from "../dist/portfolio-data.js";
import { createCheckpointTracker } from "../dist/checkpoint-state.js";
import { createPond } from "../dist/pond.js";
import { CollisionWorld } from "../dist/collisions.js";

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

test("dive and return switch worlds under cover and land exactly at their spawns", () => {
  for (const reducedMotion of [false, true]) {
    for (const from of [HOME, PROJECT_WORLD]) {
      const start = from === HOME ? { x: 0, y: 0, z: -6 } : { x: 10, y: 0, z: 84 };
      const travel = createTravel(from, start, reducedMotion);
      assert.deepEqual(sampleTravel(travel, 0).position, start);
      const halfway = sampleTravel(travel, travel.duration * (from === HOME ? 0.6 : 0.5));
      assert.equal(halfway.realm, travel.to);
      assert.equal(halfway.cover, 1);
      const finished = sampleTravel(travel, travel.duration + 0.1);
      assert.deepEqual(finished.position, from === HOME ? PROJECT_SPAWN : HOME_SPAWN);
      assert.equal(finished.cover, 0);
      assert.equal(finished.done, true);
      assert.ok(sampleTravel(travel, travel.duration * (reducedMotion ? 0.95 : 0.8)).position.y > 0,
        "the otter visibly jumps out of the destination pond");
    }
  }
});

test("water encloses the otter before departure and a cancelled vortex disappears", () => {
  const start = { x: 1, y: 0, z: -7 };
  const scene = new THREE.Scene();
  const pond = createPond(scene, new CollisionWorld(), HOME_POND);
  const travel = createTravel(HOME, start);
  const rising = sampleTravel(travel, travel.duration * 0.3);
  assert.deepEqual(rising.position, start, "otter stays in place as water rises");
  assert.equal(rising.realm, HOME);
  assert.equal(rising.cover, 0, "water is visible before the screen cover");
  assert.ok(rising.swirl > 0);
  pond.update(1, start, rising);
  const vortex = scene.getObjectByName("pond-vortex");
  assert.equal(vortex.visible, true);
  assert.equal(vortex.position.x, start.x);
  assert.equal(vortex.position.z, start.z);
  const enclosed = sampleTravel(travel, travel.duration * 0.48);
  assert.equal(enclosed.swirl, 1, "water reaches full height before submerging");
  assert.equal(enclosed.realm, HOME);
  assert.equal(enclosed.cover, 0);
  pond.update(2, enclosed.position, enclosed);
  assert.ok(vortex.children[0].scale.y > 2.5);
  pond.update(3, start, null);
  assert.equal(vortex.visible, false, "cancel/reset removes the water column");
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

test("Enter dives once, unique checkpoints return home once, and reset cancels travel", (t) => {
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
  const realms = { active: HOME, activate(id) { this.active = id; } };
  let departures = 0;
  let allowInteraction = true;
  const journey = createJourney({ player, realms, canInteract: () => allowInteraction,
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
  for (let i = 0; i < 110; i++) journey.update(0.04, true);
  assert.equal(realms.active, PROJECT_WORLD);
  assert.equal(journey.busy, false);
  assert.deepEqual(player.position.toArray(), [PROJECT_SPAWN.x, 0, PROJECT_SPAWN.z]);
  const tracker = createCheckpointTracker(PROJECTS.map((project) => project.projectId));
  for (const sign of [HOME_SIGNS[0], PROJECTS[1], PROJECTS[1], PROJECTS[0]]) {
    if (tracker.mark(sign.projectId).isComplete) journey.returnHome();
  }
  assert.equal(journey.busy, false);
  if (tracker.mark(PROJECTS[2].projectId).isComplete) journey.returnHome();
  journey.returnHome();
  assert.equal(journey.busy, true);
  for (let i = 0; i < 110; i++) journey.update(0.04, true);
  assert.equal(realms.active, HOME);
  assert.equal(journey.busy, false);
  assert.deepEqual(player.position.toArray(), [HOME_SPAWN.x, 0, HOME_SPAWN.z]);
  assert.equal(departures, 3, "departure clears inputs at completion and at launch");
  player.position.set(0, 0, -6);
  journey.update(0, true);
  enter();
  assert.equal(journey.busy, true);
  journey.cancel();
  journey.update(3, true);
  assert.equal(realms.active, HOME);
  assert.equal(journey.busy, false);
});
