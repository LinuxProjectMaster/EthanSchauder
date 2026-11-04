import test from "node:test";
import assert from "node:assert/strict";
import { getSurfaceAt, TRAILS } from "../dist/surfaces.js";

test("all trail segment centers use path sounds", () => {
  for (const { points } of TRAILS) {
    for (let index = 1; index < points.length; index++) {
      const a = points[index - 1],
        b = points[index];
      assert.equal(getSurfaceAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2), "path");
    }
  }
});

test("grass away from the main path uses rustling paw sounds", () => {
  assert.equal(getSurfaceAt(8, 4), "grass");
  assert.equal(getSurfaceAt(60, 40), "grass");
});

test("sound changes at the visible path edge", () => {
  assert.equal(getSurfaceAt(3.49, 4), "path");
  assert.equal(getSurfaceAt(3.51, 4), "grass");
});

test("rounded trail joints retain path sounds", () => {
  assert.equal(getSurfaceAt(0, 38), "path");
  assert.equal(getSurfaceAt(14, 160), "path");
});

test("there is one broad path with the otter starting on it", () => {
  assert.equal(TRAILS.length, 1);
  assert.equal(TRAILS[0].width, 7);
  assert.equal(getSurfaceAt(0, 4), "path");
});
