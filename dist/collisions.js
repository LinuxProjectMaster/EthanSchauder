/** Ground-plane collisions. Decorative grass and collectible rings stay passable. */
export class CollisionWorld {
  constructor() {
    this.shapes = [];
    this.bounds = { x: 72, z: 190 };
  }

  addCircle(x, z, radius) {
    this.shapes.push({ type: "circle", x, z, radius });
  }

  addBox(x, z, width, depth, angle = 0) {
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    this.addPolygon(
      [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ].map(([a, b]) => ({
        x: x + ((a * width) / 2) * cosine + ((b * depth) / 2) * sine,
        z: z - ((a * width) / 2) * sine + ((b * depth) / 2) * cosine,
      })),
    );
  }

  addEllipse(x, z, radiusX, radiusZ) {
    this.addPolygon(
      Array.from({ length: 48 }, (_, index) => {
        const angle = (index / 48) * Math.PI * 2;
        return {
          x: x + Math.cos(angle) * radiusX,
          z: z + Math.sin(angle) * radiusZ,
        };
      }),
    );
  }

  addPolygon(vertices) {
    this.shapes.push({ type: "polygon", vertices });
  }

  /** Short movement steps prevent sprinting through thin obstacles. Height does
   * not disable collisions, so jumping cannot bypass a solid object's footprint. */
  move(position, deltaX, deltaZ, radius) {
    const steps = Math.max(
      1,
      Math.ceil(Math.hypot(deltaX, deltaZ) / (radius * 0.4)),
    );
    for (let step = 0; step < steps; step++) {
      position.x += deltaX / steps;
      position.z += deltaZ / steps;
      // Revisit contacts because resolving one can push into a neighboring shape.
      for (let pass = 0; pass < 8; pass++) {
        let collided = false;
        for (const shape of this.shapes) {
          collided = this.resolve(position, radius, shape) || collided;
        }
        position.x = Math.max(
          (this.bounds.minX ?? -this.bounds.x) + radius,
          Math.min((this.bounds.maxX ?? this.bounds.x) - radius, position.x),
        );
        position.z = Math.max(
          (this.bounds.minZ ?? -this.bounds.z) + radius,
          Math.min((this.bounds.maxZ ?? this.bounds.z) - radius, position.z),
        );
        if (!collided) break;
      }
    }
  }

  resolve(position, radius, shape) {
    if (shape.type === "circle") {
      const dx = position.x - shape.x;
      const dz = position.z - shape.z;
      const distance = Math.hypot(dx, dz);
      const separation = shape.radius + radius;
      if (distance >= separation) return false;
      // A deterministic direction also handles an exact center overlap.
      const nx = distance > 1e-8 ? dx / distance : 1;
      const nz = distance > 1e-8 ? dz / distance : 0;
      position.x = shape.x + nx * (separation + 0.0001);
      position.z = shape.z + nz * (separation + 0.0001);
      return true;
    }

    let inside = false;
    let nearest = null;
    let nearestDistance = Infinity;
    const vertices = shape.vertices;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const a = vertices[j];
      const b = vertices[i];
      if (
        a.z > position.z !== b.z > position.z &&
        position.x < ((b.x - a.x) * (position.z - a.z)) / (b.z - a.z) + a.x
      )
        inside = !inside;
      const edgeX = b.x - a.x;
      const edgeZ = b.z - a.z;
      const t = Math.max(
        0,
        Math.min(
          1,
          ((position.x - a.x) * edgeX + (position.z - a.z) * edgeZ) /
            (edgeX ** 2 + edgeZ ** 2),
        ),
      );
      const point = { x: a.x + edgeX * t, z: a.z + edgeZ * t };
      const distance = Math.hypot(position.x - point.x, position.z - point.z);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = { ...point, edgeX, edgeZ };
      }
    }
    if (!inside && nearestDistance >= radius) return false;
    let nx = position.x - nearest.x;
    let nz = position.z - nearest.z;
    if (nearestDistance > 1e-8) {
      const direction = inside ? -1 : 1;
      nx = (nx / nearestDistance) * direction;
      nz = (nz / nearestDistance) * direction;
    } else {
      // Vertices are counterclockwise in the x/z plane: right is outward.
      const length = Math.hypot(nearest.edgeX, nearest.edgeZ);
      nx = nearest.edgeZ / length;
      nz = -nearest.edgeX / length;
    }
    position.x = nearest.x + nx * (radius + 0.0001);
    position.z = nearest.z + nz * (radius + 0.0001);
    return true;
  }
}
