import * as THREE from "./vendor/three.module.js";

/** Shared low-poly primitives with cached materials and consistent shadows. */
export function createPrimitives(scene) {
  const materials = {};
  function mat(color) {
    return (materials[color] ??= new THREE.MeshStandardMaterial({
      color,
      roughness: 0.92,
      flatShading: true,
    }));
  }
  function mesh(geo, color, x = 0, y = 0, z = 0, parent = scene) {
    const m = new THREE.Mesh(geo, mat(color));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function box(x, y, z, w, h, d, c, parent = scene) {
    return mesh(new THREE.BoxGeometry(w, h, d), c, x, y, z, parent);
  }
  function sphere(x, y, z, r, c, parent = scene) {
    return mesh(new THREE.IcosahedronGeometry(r, 1), c, x, y, z, parent);
  }
  function cylinder(x, y, z, rt, rb, h, c, n = 10, parent = scene) {
    return mesh(new THREE.CylinderGeometry(rt, rb, h, n), c, x, y, z, parent);
  }
  return { mesh, box, sphere, cylinder };
}

/** Show textured exhibit displays from both approaches without mirrored lettering. */
export function addDisplayBackFace(front, depth) {
  const back = front.clone();
  back.position.z -= depth;
  back.rotation.y += Math.PI;
  front.parent.add(back);
  return back;
}
