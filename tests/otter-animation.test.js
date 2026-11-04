import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three.module.js";
import { createFrontPawTurnClip } from "../dist/otter.js";

test("turning animates both front leg chains while leaving rear paws and torso alone", () => {
  const front = [
    "Bone_030",
    "Bone_029",
    "Bone_028",
    "Bone_035",
    "Bone_034",
    "Bone_033",
  ];
  const other = [
    "Bone_006",
    "Bone_005",
    "Bone_004",
    "Bone_011",
    "Bone_010",
    "Bone_009",
    "Bone_015",
  ];
  const tracks = [...front, ...other].map(
    (name) =>
      new THREE.QuaternionKeyframeTrack(
        `${name}.quaternion`,
        [0, 0.5],
        [0, 0, 0, 1, 0, 0.1, 0, 0.995],
      ),
  );
  const walk = new THREE.AnimationClip("walk", 0.5, tracks);
  const turn = createFrontPawTurnClip(walk);
  assert.equal(turn.duration, walk.duration);
  assert.deepEqual(
    turn.tracks.map((track) => track.name),
    front.map((name) => `${name}.quaternion`),
  );
  assert.equal(
    walk.tracks.length,
    13,
    "the original walking animation remains complete",
  );
  assert.notEqual(
    turn.tracks[0],
    walk.tracks[0],
    "turning owns copies of the animation tracks",
  );
});
