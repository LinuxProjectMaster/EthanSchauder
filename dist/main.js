import * as THREE from "./vendor/three.module.js";
import { createTutorial } from "./tutorial.js";
import { createOtter } from "./otter.js";
import { createControls } from "./controls.js";
import { createFootsteps } from "./footsteps.js";
import { advanceMovement } from "./movement.js";
import { createThemeMusic } from "./theme-music.js";
import { createSignReader } from "./signs.js";
import { createCheckpoints } from "./checkpoints.js";
import { createRealms } from "./realms.js";
import { createJourney } from "./journey.js";
import { HOME, HOME_SPAWN, isInPond } from "./realm-data.js";
import { createLoadingScreen } from "./components/loading-screen.js";
import { createWorldView } from "./components/world-view.js";
import { createFollowCamera } from "./components/follow-camera.js";

const GRAVITY = 17;
const JUMP_SPEED = 6;
const SPAWN = new THREE.Vector3(HOME_SPAWN.x, HOME_SPAWN.y, HOME_SPAWN.z);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const loadingScreen = createLoadingScreen();
loadingScreen.show();
const loadingStarted = performance.now();
let bootReady = false;
let startupRevealAt = null;
const { scene, renderer, camera } = createWorldView(document.getElementById("world"));
const followCamera = createFollowCamera(camera, reducedMotion);

createThemeMusic();
const footsteps = createFootsteps();
const tutorial = createTutorial();
const realms = createRealms(scene);
const checkpoints = createCheckpoints(() => journey.returnHome());
const signs = createSignReader(realms.allSigns, (project) => checkpoints.complete(project), (rock) => {
  realms.current.runes?.activate(rock);
  const point = new THREE.Vector3(rock.x, .2, rock.z).project(camera);
  return { x: (point.x + 1) * innerWidth / 2, y: (1 - point.y) * innerHeight / 2 };
});
const otter = await createOtter(scene);
const player = otter.root;
player.position.copy(SPAWN);
const movement = { heading: Math.PI, speed: 0 };
player.rotation.y = Math.PI;
let verticalSpeed = 0;
const controls = createControls(renderer.domElement, resetPlayer);
const journey = createJourney({
  player, realms, loadingScreen,
  canInteract: () => !signs.isOpen && bootReady,
  onDepart() {
    controls.clearMovement();
    movement.speed = 0;
    movement.turnRemaining = 0;
    verticalSpeed = 0;
  },
  onSwitch() {
    movement.heading = realms.current.heading;
    player.rotation.y = movement.heading;
    player.rotation.x = 0;
    controls.clearMovement();
    followCamera.snap();
  },
});

const shadow = new THREE.Mesh(
  new THREE.CircleGeometry(0.65, 24),
  new THREE.MeshBasicMaterial({
    color: "#536a43",
    transparent: true,
    opacity: 0.16,
  }),
);
shadow.rotation.x = -Math.PI / 2;
scene.add(shadow);

function resetPlayer() {
  journey.cancel();
  signs.close();
  realms.activate(HOME);
  player.position.copy(SPAWN);
  followCamera.snap();
  movement.heading = Math.PI;
  movement.speed = 0;
  movement.turnRemaining = 0;
  movement.lastTurnDirection = 1;
  player.rotation.y = Math.PI;
  player.rotation.x = 0;
  verticalSpeed = 0;
  controls.reset();
}

function updatePlayer(dt, elapsed) {
  const worldReady = bootReady;
  const tutorialEnabled = worldReady && followCamera.introDone && realms.active === HOME && !journey.busy && !signs.isOpen;
  tutorial.update({ enabled: tutorialEnabled });
  signs.update(player.position, realms.active, worldReady && !journey.busy);
  const travelPose = journey.update(dt, worldReady && !signs.isOpen);
  realms.update(elapsed, player.position, travelPose);
  if (travelPose) {
    controls.clearMovement();
    otter.update(dt, elapsed, 0, player.position.y > 0.01);
    player.rotation.x = travelPose.pitch ?? 0;
    footsteps.update("grass", 0, false);
    shadow.visible = false;
    return;
  }
  shadow.visible = true;
  if (!worldReady || signs.isOpen) {
    controls.clearMovement();
    movement.speed = 0;
    otter.update(dt, elapsed, 0, false);
    footsteps.update("grass", 0, false);
    return;
  }
  const input = controls.movement();
  const previousHeading = movement.heading;
  const displacement = advanceMovement(movement, input, dt);
  player.rotation.y = movement.heading;

  const previousX = player.position.x;
  const previousZ = player.position.z;
  realms.current.collisions.move(
    player.position,
    displacement.x,
    displacement.z,
    otter.radius,
  );
  // Animate actual travel, so pushing against a boundary doesn't run in place.
  const actualSpeed =
    Math.hypot(player.position.x - previousX, player.position.z - previousZ) /
    dt;
  if (controls.state.jumpQueued && player.position.y < 0.01)
    verticalSpeed = JUMP_SPEED;
  controls.state.jumpQueued = false;
  verticalSpeed -= GRAVITY * dt;
  player.position.y = Math.max(0, player.position.y + verticalSpeed * dt);
  if (player.position.y === 0) verticalSpeed = 0;
  const pawContact = otter.update(
    dt,
    elapsed,
    actualSpeed,
    player.position.y > 0.01,
    Math.sign(movement.heading - previousHeading),
  );
  const surface = realms.current.getSurfaceAt(player.position.x, player.position.z);
  const inWater = realms.current.pond && isInPond(player.position, realms.current.pond);
  footsteps.update(
    surface,
    actualSpeed,
    player.position.y <= 0.01 && worldReady && !inWater,
  );
  if (pawContact && worldReady && !inWater) footsteps.play(surface, actualSpeed);
  tutorial.update({ enabled: tutorialEnabled, dt, traveled: actualSpeed * dt,
    turned: movement.heading - previousHeading, height: player.position.y });
  shadow.position.set(player.position.x, 0.045, player.position.z);
  shadow.scale.setScalar(1 + player.position.y * 0.15);
  shadow.material.opacity = inWater ? 0 : 0.16 / (1 + player.position.y);
}

const clock = new THREE.Clock();
let elapsed = 0;
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.max(0.0001, Math.min(clock.getDelta(), 0.04));
  elapsed += dt;
  if (!bootReady && startupRevealAt !== null && elapsed >= startupRevealAt) {
    const progress = (elapsed - startupRevealAt) / (reducedMotion ? 0.2 : 0.9);
    loadingScreen.setOpacity(1 - progress);
    if (progress >= 1) {
      loadingScreen.hide();
      bootReady = true;
      followCamera.beginIntro(elapsed);
    }
  }
  updatePlayer(dt, elapsed);
  followCamera.update(dt, elapsed, player.position, realms.current.cameraOrbit, controls.state);
  renderer.render(scene, camera);
}

// Warm all scenes so a later portal never reveals uncompiled scenery.
const visibility = [];
scene.children.forEach((child) => {
  if (child.name.endsWith("-world")) { visibility.push([child, child.visible]); child.visible = true; }
});
await renderer.compileAsync(scene, camera);
for (const [child, visible] of visibility) child.visible = visible;
startupRevealAt = elapsed + Math.max(0, (reducedMotion ? 0 : 2) - (performance.now() - loadingStarted) / 1000);
animate();
