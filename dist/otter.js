import * as THREE from "./vendor/three.module.js";
import { GLTFLoader } from "./vendor/GLTFLoader.js";

// Fit the torso rather than the full nose-to-tail length.
export const OTTER_RADIUS = 0.85;
const MODEL_LENGTH = 2.8;

// Shoulder, elbow, and wrist chains in this otter's quadruped skeleton.
const FRONT_LEG_BONES = new Set([
  "Bone_030",
  "Bone_029",
  "Bone_028",
  "Bone_035",
  "Bone_034",
  "Bone_033",
]);

/** Reuse the authored gait only on the front legs, leaving the rear paws planted. */
export function createFrontPawTurnClip(walkClip) {
  const tracks = walkClip.tracks
    .filter((track) => FRONT_LEG_BONES.has(track.name.split(".")[0]))
    .map((track) => track.clone());
  return new THREE.AnimationClip("turn-front-paws", walkClip.duration, tracks);
}

/** Gamideo's CC0 otter, with its original quadruped skeleton and animation clips.
 * The outer root handles gameplay transforms; the inner model owns animation. */
export async function createOtter(scene) {
  const asset = await new GLTFLoader().loadAsync("./assets/otter.glb");
  const root = new THREE.Group();
  const model = asset.scene;
  root.add(model);

  // Normalize the asset once, keeping animation coordinates untouched.
  const originalBounds = new THREE.Box3().setFromObject(model);
  const originalSize = originalBounds.getSize(new THREE.Vector3());
  const scale = MODEL_LENGTH / originalSize.z;
  model.scale.set(scale, scale * 0.9, scale);
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  model.position.set(-center.x, -bounds.min.y, -center.z);
  model.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
    // Animated bones can move beyond the mesh's rest-pose bounding volume.
    object.frustumCulled = false;
  });
  scene.add(root);

  const mixer = new THREE.AnimationMixer(model);
  const idle = mixer.clipAction(
    THREE.AnimationClip.findByName(asset.animations, "idle"),
  );
  const walk = mixer.clipAction(
    THREE.AnimationClip.findByName(asset.animations, "walk"),
  );
  const turn = mixer.clipAction(createFrontPawTurnClip(walk.getClip()));
  turn.play();
  turn.setEffectiveWeight(0);
  idle.play();
  walk.play();
  walk.setEffectiveWeight(0);
  let walkingWeight = 0;
  let turningWeight = 0;

  return {
    root,
    radius: OTTER_RADIUS,
    update(dt, elapsed, speed, airborne, steering = 0) {
      // Blend smoothly into the original four-paw walk cycle and match its pace.
      const targetWeight = airborne ? 0 : Math.min(speed / 1.5, 1);
      walkingWeight = THREE.MathUtils.damp(walkingWeight, targetWeight, 12, dt);
      idle.setEffectiveWeight(1 - walkingWeight);
      walk.setEffectiveWeight(walkingWeight);
      walk.setEffectiveTimeScale(THREE.MathUtils.clamp(speed / 4, 0.5, 2.4));
      // In-place steering uses a front-leg-only gait. Moving turns already use
      // the full walk cycle. Automatic half turns use the same steering gait.
      const isTurning = steering !== 0;
      const turnTarget =
        !airborne && isTurning ? Math.max(0, 1 - speed / 1.5) : 0;
      turningWeight = THREE.MathUtils.damp(turningWeight, turnTarget, 14, dt);
      turn.setEffectiveWeight(turningWeight);
      turn.setEffectiveTimeScale(1.1);
      const halfCycle = walk.getClip().duration / 2;
      const previousContact = Math.floor(walk.time / halfCycle);
      mixer.update(dt);
      const pawContact = Math.floor(walk.time / halfCycle) !== previousContact;
      root.rotation.x = airborne ? -0.1 : 0;
      return pawContact && speed > 0.4 && !airborne;
    },
  };
}
