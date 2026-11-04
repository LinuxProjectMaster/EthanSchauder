import test from "node:test";
import assert from "node:assert/strict";
import { getIntroCameraPose, PLAY_CAMERA } from "../dist/camera-intro.js";

test("opening starts close to the otter and holds for one full second", () => {
  for (const seconds of [0, 0.25, 0.5, 0.99, 1]) {
    assert.deepEqual(getIntroCameraPose(seconds), {
      distance: 7, elevation: 0.44, done: false,
    });
  }
});

test("opening pulls back smoothly to the playable camera distance", () => {
  const midway = getIntroCameraPose(1.6);
  assert.ok(midway.distance > 7 && midway.distance < PLAY_CAMERA.distance);
  const end = getIntroCameraPose(2.2);
  assert.deepEqual(end, { ...PLAY_CAMERA, done: true });
  assert.deepEqual(getIntroCameraPose(10), end);
});
