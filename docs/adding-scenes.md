# Adding a scene

Copy `dist/scenes/example-scene.js` to `dist/scenes/garden-scene.js`. The example is runnable and covered by tests, but is deliberately absent from the live registry.

1. Give the exported definition a unique `id` and export name. Set `spawn`, `heading`, `location`, and optional `cameraOrbit` (radians).
2. Compose its `components` array. Each factory receives the scene context: `root`, `collisions`, `signs`, and the definition's configuration. Add meshes to `root` and solid footprints to `collisions`.
3. Import the definition in `dist/scenes/registry.js` and append it to `SCENES`. The first registered scene is home. Signs receive the owning scene's ID automatically; use unique titles or project IDs for their hash routes.
4. To reach the scene, point another scene's `portal.to` at its ID. Give that source scene a `pond` and include `pondComponent`. The new scene's own portal chooses its exit. The Return home button also works in every additional scene.
5. Run `npm run check` and `npm test`, then walk through entry, reading, exit, and re-entry with `npm start`.

No changes to `main.js`, the scene manager, or the travel controller are needed when adding a registered scene.

## Component contract

A factory is called once per scene instance, in array order. A static factory may return nothing. An animated or interactive factory returns any of these optional hooks:

```js
({ root, collisions }) => {
  // Build meshes and register collision shapes here.
  return {
    activate() { /* scene becomes visible */ },
    update(elapsed, playerPosition, travelPose) { /* active scene only */ },
    deactivate() { /* clear effects when leaving */ },
  };
}
```

Each instance owns its own mesh tree, collision world, and hook closures. Avoid module-level mutable component state. All scenes are constructed at startup; `deactivate` must be safe before the first `activate`. Optional `build(scene)` remains supported for custom composition after the component list; `scene.add(component)` registers lifecycle hooks there.

## Included components

| Component | Configuration |
| --- | --- |
| `pondComponent` | Reads `scene.pond`; builds the pool and registers ripple/spin updates. |
| `fenceComponent(bounds)` | Builds the perimeter and sets solid world limits. Place after terrain that sets its own bounds. |
| `signboardComponent` | Builds signs from `scene.signs`, including their collision footprints. |
| `runeComponent` | Builds stepping stones from `scene.signs`; set `runic: true` on these signs. Registers their glow and activation behavior. |
| `components/scenery/*` | Lower-level pools, text, runes, signboards, and trail arrows for custom compositions. |
| `components/exhibits/*` | Portfolio exhibit builders, including collision shapes. |

Surface sounds default to grass. Supply `getSurfaceAt(x, z)` when the scene has paths. `portal` and `pond` are optional; a scene without them can still be exited with Return home. Reduced-motion behavior and the shared loading transition are handled centrally.
