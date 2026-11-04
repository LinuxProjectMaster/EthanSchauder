import test from "node:test";
import assert from "node:assert/strict";
import { createCheckpointTracker } from "../dist/checkpoint-state.js";
import { PROJECTS, CHRONOPEDIA, TRAIL_SIGNS } from "../dist/portfolio-data.js";
import { getTrailPoseAtZ, getSurfaceAt } from "../dist/surfaces.js";

test("three unique project visits advance once and complete only at the last checkpoint", () => {
  const tracker = createCheckpointTracker(
    PROJECTS.map((project) => project.projectId),
  );
  assert.equal(PROJECTS.length, 3);
  assert.equal(TRAIL_SIGNS[2], CHRONOPEDIA);
  assert.equal(tracker.mark("unknown").changed, false);
  assert.equal(tracker.mark(PROJECTS[0].projectId).completed, 1);
  assert.equal(tracker.mark(PROJECTS[0].projectId).changed, false);
  assert.equal(tracker.mark(PROJECTS[1].projectId).completed, 2);
  const final = tracker.mark(PROJECTS[2].projectId);
  assert.deepEqual(final, {
    changed: true,
    completed: 3,
    total: 3,
    isComplete: true,
  });
  assert.equal(
    tracker.mark(PROJECTS[2].projectId).isComplete,
    false,
    "reopening a project cannot repeat the celebration",
  );
});

test("projects can be checked out of order and decorative signs never advance progress", () => {
  const tracker = createCheckpointTracker(
    PROJECTS.map((project) => project.projectId),
  );
  assert.equal(tracker.mark(undefined).completed, 0);
  assert.equal(tracker.mark(PROJECTS[2].projectId).completed, 1);
  assert.equal(tracker.mark(PROJECTS[0].projectId).completed, 2);
  assert.equal(tracker.mark(PROJECTS[1].projectId).isComplete, true);
});

test("an arrow after each sign remains centered on the path and points forward", () => {
  for (const sign of TRAIL_SIGNS) {
    const pose = getTrailPoseAtZ(sign.z + 6);
    assert.ok(pose.z > sign.z);
    assert.equal(getSurfaceAt(pose.x, pose.z), "path");
    assert.ok(Math.cos(pose.heading) > 0);
  }
});
