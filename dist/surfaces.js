/** One source of truth for both visible paths and footstep surface detection. */
export const TRAILS = [
  {
    width: 7,
    points: [
      [0, 1],
      [0, 22],
      [6, 36],
      [3, 54],
    ],
  },
];

export function getSurfaceAt(x, z) {
  for (const { points, width } of TRAILS) {
    const halfWidth = width / 2;
    for (let index = 1; index < points.length; index++) {
      const [ax, az] = points[index - 1];
      const [bx, bz] = points[index];
      const dx = bx - ax;
      const dz = bz - az;
      const length = Math.hypot(dx, dz);
      const along = ((x - ax) * dx + (z - az) * dz) / length;
      const across = Math.abs((x - ax) * dz - (z - az) * dx) / length;
      // Match the extended rectangular segment and rounded joint drawn in scenes/projects-world.js.
      const onSegment =
        across <= halfWidth &&
        along >= -width * 0.14 &&
        along <= length + width * 0.14;
      const onJoint = Math.hypot(x - bx, z - bz) <= halfWidth;
      if (onSegment || onJoint) return "path";
    }
  }
  return "grass";
}

/** Centerline position and forward heading for trail markers at a given depth. */
export function getTrailPoseAtZ(z) {
  const { points } = TRAILS[0];
  for (let index = 1; index < points.length; index++) {
    const [ax, az] = points[index - 1],
      [bx, bz] = points[index];
    if (z <= bz) {
      const t = Math.max(0, Math.min(1, (z - az) / (bz - az)));
      return {
        x: ax + (bx - ax) * t,
        z: az + (bz - az) * t,
        heading: Math.atan2(bx - ax, bz - az),
      };
    }
  }
  const [x, lastZ] = points.at(-1);
  return { x, z: lastZ, heading: 0 };
}
