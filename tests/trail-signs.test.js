import test from "node:test";
import assert from "node:assert/strict";
import { TRAIL_SIGNS } from "../dist/portfolio-data.js";
import { getTrailPoseAtZ, getSurfaceAt } from "../dist/surfaces.js";

test("an arrow after each sign remains centered on the path and points forward", () => {
  for (const sign of TRAIL_SIGNS) {
    const pose = getTrailPoseAtZ(sign.z + 6);
    assert.ok(pose.z > sign.z);
    assert.equal(getSurfaceAt(pose.x, pose.z), "path");
    assert.ok(Math.cos(pose.heading) > 0);
  }
});
