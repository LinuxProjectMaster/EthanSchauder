import * as THREE from "./vendor/three.module.js";

/** Paint crisp, transparent lettering flat on the ground, like the trail arrow. */
export function createGroundText(
  scene,
  {
    lines,
    x = 0,
    z = 0,
    width = 12,
    height = 4,
    angle = 0.62,
    color = "#3d5541",
  },
) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = Math.round((canvas.width * height) / width);
  const context = canvas.getContext("2d");
  context.fillStyle = color;
  context.textAlign = "center";
  context.textBaseline = "middle";
  const lineHeight = canvas.height / lines.length;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    let size = lineHeight * 0.88;
    context.font = `800 ${size}px sans-serif`;
    const measured = context.measureText(line).width;
    if (measured > canvas.width * 0.96)
      size *= (canvas.width * 0.96) / measured;
    context.font = `800 ${size}px sans-serif`;
    context.fillText(line, canvas.width / 2, lineHeight * (index + 0.5));
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });
  const group = new THREE.Group();
  group.name = "ground-text";
  group.position.set(x, 0.08, z);
  group.rotation.y = angle;
  const lettering = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    material,
  );
  lettering.rotation.x = -Math.PI / 2;
  group.add(lettering);
  scene.add(group);
  return group;
}

