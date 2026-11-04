import * as THREE from "./vendor/three.module.js";
import { createTutorial } from "./tutorial.js";
import { createOtter } from "./otter.js";
import { createControls } from "./controls.js";
import { createFootsteps } from "./footsteps.js";
import { getSurfaceAt } from "./surfaces.js";
import { advanceMovement } from "./movement.js";
import { getIntroCameraPose } from "./camera-intro.js";
import { createThemeMusic } from "./theme-music.js";
import { createSignReader } from "./signs.js";
import { createCheckpoints } from "./checkpoints.js";
import { createRealms } from "./realms.js";
import { createJourney } from "./journey.js";
import { HOME, HOME_SPAWN, HOME_POND, PROJECT_POND, isInPond, getRealmCameraOrbit } from "./realm-data.js";

const GRAVITY = 17;
const JUMP_SPEED = 6;
const SPAWN = new THREE.Vector3(HOME_SPAWN.x, HOME_SPAWN.y, HOME_SPAWN.z);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let cameraIntroStart = null;
let cameraIntroDone = reducedMotion;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#e5ebd8");
scene.fog = new THREE.Fog("#e5ebd8", 65, 155);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("world"),
  antialias: true,
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
const camera = new THREE.PerspectiveCamera(
  39,
  innerWidth / innerHeight,
  0.1,
  220,
);

scene.add(new THREE.HemisphereLight("#fff9df", "#7b966c", 2.8));
const sun = new THREE.DirectionalLight("#fff1cf", 3.5);
sun.position.set(-25, 45, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {
  left: -55,
  right: 55,
  top: 55,
  bottom: -55,
  near: 1,
  far: 110,
});
sun.shadow.bias = -0.0006;
sun.shadow.normalBias = 0.035;
scene.add(sun);

createThemeMusic();
const footsteps = createFootsteps();
const tutorial = createTutorial();
const realms = createRealms(scene);
const checkpoints = createCheckpoints(() => journey.returnHome());
const signs = createSignReader(realms.allSigns, (project) => checkpoints.complete(project), (rock) => {
  realms.runes.activate(rock);
  const point = new THREE.Vector3(rock.x, .2, rock.z).project(camera);
  return { x: (point.x + 1) * innerWidth / 2, y: (1 - point.y) * innerHeight / 2 };
});
const otter = await createOtter(scene);
const player = otter.root;
player.position.copy(SPAWN);
const movement = { heading: Math.PI, speed: 0 };
player.rotation.y = Math.PI;
let snapCamera = true;
let verticalSpeed = 0;
const controls = createControls(renderer.domElement, resetPlayer);
const journey = createJourney({
  player, realms,
  canInteract: () => !signs.isOpen && !document.getElementById("loading"),
  onDepart() {
    controls.clearMovement();
    movement.speed = 0;
    movement.turnRemaining = 0;
    verticalSpeed = 0;
  },
  onSwitch() {
    movement.heading = realms.active === HOME ? Math.PI : 0;
    player.rotation.y = movement.heading;
    player.rotation.x = 0;
    controls.clearMovement();
    snapCamera = true;
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
  snapCamera = true;
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
  const worldReady = !document.getElementById("loading");
  const tutorialEnabled = worldReady && cameraIntroDone && realms.active === HOME && !journey.busy && !signs.isOpen;
  tutorial.update({ enabled: tutorialEnabled });
  signs.update(player.position, realms.active, worldReady && !journey.busy);
  const travelPose = journey.update(dt, worldReady && !signs.isOpen);
  realms.update(elapsed, player.position, travelPose);
  if (travelPose) {
    controls.clearMovement();
    otter.update(dt, elapsed, 0, !travelPose.waiting);
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
  const surface = realms.active === HOME ? "grass" : getSurfaceAt(player.position.x, player.position.z);
  const inWater = isInPond(player.position, realms.active === HOME ? HOME_POND : PROJECT_POND);
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

const cameraTarget = new THREE.Vector3();
const cameraOffset = new THREE.Vector3();
function updateCamera(dt) {
  // Keep the dragged viewing offset relative to the otter as it turns.
  const orbit = controls.state.orbit + movement.heading - Math.PI;
  const introPose = cameraIntroDone
    ? null
    : getIntroCameraPose(
        cameraIntroStart === null ? 0 : elapsed - cameraIntroStart,
      );
  const { elevation, distance } = introPose ?? controls.state;
  cameraTarget.set(player.position.x, 0.75, player.position.z);
  cameraOffset.set(
    Math.sin(orbit) * Math.cos(elevation) * distance,
    Math.sin(elevation) * distance,
    Math.cos(orbit) * Math.cos(elevation) * distance,
  );
  const goal = cameraOffset.add(cameraTarget);
  // Follow the exact intro timeline so the close-up holds for a full second.
  if (introPose || snapCamera) camera.position.copy(goal);
  else camera.position.lerp(goal, 1 - Math.exp(-dt * 5));
  snapCamera = false;
  if (introPose?.done) {
    cameraIntroDone = true;
    controls.state.distance = distance;
    controls.state.elevation = elevation;
  }
  camera.lookAt(cameraTarget);
}

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}
addEventListener("resize", resize);
resize();
camera.position.set(17, 22, 27);

const clock = new THREE.Clock();
let elapsed = 0;
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.max(0.0001, Math.min(clock.getDelta(), 0.04));
  elapsed += dt;
  updatePlayer(dt, elapsed);
  updateCamera(dt);
  renderer.render(scene, camera);
}

// Compile shaders before revealing the world, respecting reduced-motion settings.
const loadingStarted = performance.now();
await renderer.compileAsync(scene, camera);
animate();
const introDuration = reducedMotion ? 0 : 2000;
setTimeout(
  () => {
    requestAnimationFrame(() => {
      document.getElementById("loading").classList.add("done");
      setTimeout(
        () => {
          document.getElementById("loading")?.remove();
          cameraIntroStart = elapsed;
        },
        reducedMotion ? 200 : 1000,
      );
    });
  },
  Math.max(0, introDuration - (performance.now() - loadingStarted)),
);
