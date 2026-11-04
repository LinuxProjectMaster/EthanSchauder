import test from "node:test";
import assert from "node:assert/strict";
import { getIntroCameraPose, PLAY_CAMERA } from "../dist/camera-intro.js";

test("opening zooms toward the otter and holds a close-up for one full second", () => {
  assert.equal(getIntroCameraPose(0).distance, 34);
  assert.ok(getIntroCameraPose(0.75).distance < 34);
  assert.ok(getIntroCameraPose(0.75).distance > 7);
  for (const seconds of [1.5, 1.75, 2, 2.49, 2.5]) {
    assert.equal(getIntroCameraPose(seconds).distance, 7);
    assert.equal(getIntroCameraPose(seconds).done, false);
  }
});

test("opening pulls back smoothly to the playable camera distance", () => {
  const midway = getIntroCameraPose(3.1);
  assert.ok(midway.distance > 7 && midway.distance < PLAY_CAMERA.distance);
  const end = getIntroCameraPose(4);
  assert.deepEqual(end, { ...PLAY_CAMERA, done: true });
  assert.deepEqual(getIntroCameraPose(10), end);
});
