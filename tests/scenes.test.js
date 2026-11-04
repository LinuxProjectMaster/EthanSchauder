import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three.module.js";
import { createRealms } from "../dist/realms.js";
import { createLoadingScreen } from "../dist/components/loading-screen.js";

test("a third scene registers and activates without changes to the scene manager", () => {
  const events = [];
  const definitions = ["home", "projects", "forest"].map((id) => ({
    id, spawn: { x: 0, y: 0, z: 0 }, signs: [{ realm: id }],
    build(scene) {
      scene.add({
        activate: () => events.push(`enter:${id}`),
        deactivate: () => events.push(`leave:${id}`),
        update: () => events.push(`update:${id}`),
      });
    },
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
  assert.throws(() => realms.activate("missing"), /Unknown realm/);
  assert.equal(realms.active, "forest", "invalid travel leaves the current scene intact");
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
