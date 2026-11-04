import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three.module.js";
import { CollisionWorld } from "../dist/collisions.js";
import { createChronopedia } from "../dist/chronopedia.js";
import { createNeuripsAriel } from "../dist/neurips-ariel.js";
import { createProtonProjector } from "../dist/proton-projector.js";
import {
  TRAIL_SIGNS,
  PROTON_PROJECTOR,
  NEURIPS_ARIEL,
  INTRO,
} from "../dist/portfolio-data.js";

test("project signs form a compact trail with short walks from arrival and between stops", () => {
  assert.deepEqual(INTRO.name, ["ETHAN", "SCHAUDER"]);
  assert.equal(TRAIL_SIGNS[0], PROTON_PROJECTOR);
  assert.equal(TRAIL_SIGNS[1], NEURIPS_ARIEL);
  assert.equal(
    NEURIPS_ARIEL.url,
    "https://www.kaggle.com/code/ethanjschauder/submission-pipeline-final",
  );
  assert.ok(TRAIL_SIGNS[0].z - 12 <= 8);
  for (let i = 1; i < TRAIL_SIGNS.length; i++)
    assert.ok(TRAIL_SIGNS[i].z - TRAIL_SIGNS[i - 1].z <= 14);
  assert.equal(
    PROTON_PROJECTOR.url,
    "https://devpost.com/software/proton-projector",
  );
});

test("project exhibits register solid collision footprints", (t) => {
  const original = globalThis.document;
  const context = new Proxy(
    { measureText: () => ({ width: 500 }) },
    {
      get: (target, key) => target[key] ?? (() => {}),
      set: (target, key, value) => {
        target[key] = value;
        return true;
      },
    },
  );
  globalThis.document = {
    createElement: () => ({ getContext: () => context }),
  };
  t.after(() => {
    if (original) globalThis.document = original;
    else delete globalThis.document;
  });
  const scene = new THREE.Scene();
  const collisions = new CollisionWorld();
  createProtonProjector(scene, collisions);
  assert.equal(collisions.shapes.length, 3);
  assert.ok(scene.getObjectByName("proton-projector-landmark"));
  const position = { x: -11, z: 12 };
  collisions.move(position, 0, 16, 0.85);
  assert.ok(
    position.z < 16.2,
    "the console blocks movement through the station",
  );
  const sun = { x: -15.4, z: 23.2 };
  collisions.move(sun, 0, 0, 0.85);
  assert.ok(Math.hypot(sun.x + 15.4, sun.z - 23.2) >= 2.5);
  createNeuripsAriel(scene, collisions);
  assert.equal(collisions.shapes.length, 6);
  assert.ok(scene.getObjectByName("neurips-ariel-landmark"));
  const observer = { x: 17, z: 27 };
  collisions.move(observer, 0, 10, 0.85);
  assert.ok(observer.z < 32, "the spectrum display blocks movement through it");
  const telescope = { x: 20, z: 37 };
  collisions.move(telescope, 0, 0, 0.85);
  assert.ok(Math.hypot(telescope.x - 20, telescope.z - 37) >= 2.2);
  createChronopedia(scene, collisions);
  assert.equal(collisions.shapes.length, 9);
  assert.ok(scene.getObjectByName("chronopedia-landmark"));
  const book = { x: -4, z: 42 };
  collisions.move(book, 0, 14, 0.85);
  assert.ok(book.z < 48, "the encyclopedia blocks movement through it");
});
