import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three.module.js";
import { createRealms } from "../dist/realms.js";
import { createLoadingScreen } from "../dist/components/loading-screen.js";
import { exampleScene } from "../dist/scenes/example-scene.js";
import { createScene } from "../dist/scenes/create-scene.js";

test("a third scene registers and activates without changes to the scene manager", () => {
  const events = [];
  const definitions = ["home", "projects", "forest"].map((id) => ({
    id, spawn: { x: 0, y: 0, z: 0 }, signs: [{ realm: id }],
    components: [() => ({
        activate: () => events.push(`enter:${id}`),
        deactivate: () => events.push(`leave:${id}`),
        update: () => events.push(`update:${id}`),
    })],
  }));
  const realms = createRealms(new THREE.Scene(), definitions);
  const firstCollisions = realms.current.collisions;
  realms.activate("forest");
  realms.update(1, { x: 0, y: 0, z: 0 });
  assert.equal(realms.current.id, "forest");
  assert.equal(realms.get("home").root.visible, false);
  assert.equal(realms.get("projects").root.visible, false);
  assert.equal(realms.current.root.visible, true);
  assert.notEqual(realms.current.collisions, firstCollisions);
  assert.deepEqual(events.slice(-3), ["leave:home", "enter:forest", "update:forest"]);
  assert.equal(realms.allSigns.length, 3);
  assert.equal(realms.homeId, "home");
  assert.throws(() => realms.activate("missing"), /Unknown realm/);
  assert.equal(realms.active, "forest", "invalid travel leaves the current scene intact");
});

test("copied scene components keep lifecycle state and signs isolated", () => {
  const events = [];
  const sign = { title: "Notes" };
  const component = ({ id }) => {
    let count = 0;
    return {
      update: () => events.push(`${id}:${++count}`),
      deactivate: () => { count = 0; },
    };
  };
  const definition = { spawn: { x: 0, y: 0, z: 0 }, signs: [sign], components: [component] };
  const realms = createRealms(new THREE.Scene(), [
    { ...definition, id: "first" }, { ...definition, id: "copy" },
  ]);
  realms.update(0, definition.spawn);
  realms.activate("copy");
  realms.update(0, definition.spawn);
  realms.activate("first");
  realms.update(0, definition.spawn);
  assert.deepEqual(events, ["first:1", "copy:1", "first:1"]);
  assert.equal(realms.get("first").signs[0].realm, "first");
  assert.equal(realms.get("copy").signs[0].realm, "copy");
  assert.equal(sign.realm, undefined, "registration does not mutate shared sign data");
});

test("the copyable example composes actual scenery, signs, pond effects, and bounds", (t) => {
  const context = new Proxy({}, { get: () => () => {} });
  const original = globalThis.document;
  globalThis.document = { createElement: () => ({ getContext: () => context }) };
  t.after(() => { globalThis.document = original; });
  const scene = createScene(exampleScene);
  assert.ok(scene.root.getObjectByName("pond-water"));
  assert.ok(scene.root.getObjectByName("world-boundary"));
  assert.equal(scene.signs[0].realm, "garden");
  assert.ok(scene.collisions.shapes.length > 0, "signs register solid footprints");
  assert.ok(scene.collisions.bounds.maxX < 18, "the fence sets playable limits");
  scene.activate();
  scene.update(1, { x: 0, y: 0, z: -5 }, { swirl: 1, pondRotation: 1 });
  const spiral = scene.root.getObjectByName("pond-spin");
  assert.equal(spiral.visible, true);
  scene.deactivate();
  assert.equal(scene.root.visible, false);
  assert.equal(spiral.visible, false, "leaving clears animated pond effects");
});

test("startup and travel use the same loading illustration and reset cleanly", (t) => {
  const original = globalThis.document;
  const attributes = {};
  let element;
  globalThis.document = { createElement: () => ({ style: {},
    setAttribute: (key, value) => { attributes[key] = value; } }) };
  t.after(() => { globalThis.document = original; });
  const screen = createLoadingScreen({ append(node) { element = node; } });
  screen.show();
  const startup = element.innerHTML;
  assert.match(startup, /runner-wrap/);
  assert.match(startup, /loader-scene/);
  screen.hide();
  assert.equal(screen.visible, false);
  screen.show("Travelling to the next world");
  assert.equal(element.innerHTML, startup);
  assert.equal(attributes["aria-label"], "Travelling to the next world");
  screen.setOpacity(0.5);
  assert.equal(element.style.opacity, "0.5");
  screen.hide();
  screen.show();
  assert.equal(screen.visible, true);
  assert.equal(element.style.opacity, "1");
});
