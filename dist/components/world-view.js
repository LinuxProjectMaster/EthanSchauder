import * as THREE from "../vendor/three.module.js";

/** Shared renderer, daylight and atmosphere for every scene. */
export function createWorldView(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#e5ebd8");
  scene.fog = new THREE.Fog("#e5ebd8", 65, 155);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const camera = new THREE.PerspectiveCamera(39, innerWidth / innerHeight, 0.1, 220);
  scene.add(new THREE.HemisphereLight("#fff9df", "#7b966c", 2.8));
  const sun = new THREE.DirectionalLight("#fff1cf", 3.5);
  sun.position.set(-25, 45, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 55,
    bottom: -55, near: 1, far: 110 });
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.035;
  scene.add(sun);
  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }
  addEventListener("resize", resize);
  resize();
  return { scene, renderer, camera };
}
