import * as THREE from "../../vendor/three.module.js";
import { getTrailPoseAtZ } from "../../surfaces.js";
import { TRAIL_SIGNS } from "../../portfolio-data.js";

export function createTrailArrows(scene) {
  const shape = new THREE.Shape();
  shape.moveTo(-0.35, 1.7);
  shape.lineTo(0.35, 1.7);
  shape.lineTo(0.35, -0.3);
  shape.lineTo(1.05, -0.3);
  shape.lineTo(0, -1.7);
  shape.lineTo(-1.05, -0.3);
  shape.lineTo(-0.35, -0.3);
  shape.closePath();
  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({ color: "#899057" });
  for (const z of [10, ...TRAIL_SIGNS.map((sign) => sign.z + 6)]) {
    const pose = getTrailPoseAtZ(z);
    const arrow = new THREE.Mesh(geometry, material);
    arrow.name = "path-direction-arrow";
    arrow.rotation.set(-Math.PI / 2, 0, 0);
    const group = new THREE.Group();
    group.name = "trail-arrow";
    group.position.set(pose.x, 0.065, pose.z);
    group.rotation.y = pose.heading;
    group.add(arrow);
    scene.add(group);
  }
}
