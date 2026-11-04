# Little Roamer

A wordless Three.js / WebGL world with a animated quadruped otter. The scenery and loading graphics are created in code. The otter is a locally bundled GLB model from Gamideo’s CC0 Cozy Animals pack. Three.js is bundled locally; no install, external requests, or build step is required.

## Run

Use Node.js 20.11 or newer:

```sh
npm start
```

Open http://127.0.0.1:3000. Set `PORT` to change the port.

```sh
npm run check
npm test
```

## Controls

- W / Up: walk in the direction the otter is facing
- A / Left and D / Right: turn left or right
- S / Down: smoothly turn 180 degrees in the last pressed left/right direction (left by default), once per press
- Shift: sprint
- Space: jump
- Drag: rotate the camera
- Scroll: zoom
- R: return to the welcome clearing
- Enter: read a nearby sign or dive at the welcome pond; Enter or Escape closes a sign
- M: mute/unmute music and footsteps

The otter starts in a welcome clearing surrounded by About, Education, Interests, and Contacts runic stepping stones. A compact WASD/arrow-key movement hint appears at the bottom after the camera intro; its keyboard button reopens it after dismissal. Large stone labels and University of Virginia beneath Ethan’s name orient visitors. Walk onto a stone to light its carved rune and swirl layered violet mist and curling, glowing embers across the screen before its full section page opens. Leave the stone before stepping back on to reopen it; Enter or the nearby prompt can also activate it. Reduced-motion settings use a brief, gentle reveal. Contacts includes the owner-supplied email and LinkedIn profile. Walk into the shallow pond and press Enter (or click its prompt) to travel. Entry alone never transports the otter. The pond surface begins spinning, then the same animated loading illustration used at startup plays before revealing the projects world. The otter arrives at the portfolio trail spawn. Reading and closing each of the three unique project signs completes its checkpoint. After the final checkpoint, the celebration plays and the otter jumps back into the welcome clearing. Progress is retained for the current page visit; repeated reads do not repeat the completion celebration. R cancels a journey and returns home without clearing completed checkpoints.


The projects camera faces along the trail, so walking forward leads up the screen. Both realms have a visible split-rail fence; its inner edge is a solid boundary that cannot be crossed by walking, sprinting, or jumping. The projects perimeter encloses the arrival pond, all exhibits, and the full scenic trail.

Each realm owns its scenery, signs, and collision map. Only one is visible and interactive at a time. Travel locks movement, hides the world switch behind the reusable opening loading animation, and resets the camera and momentum on arrival. Reduced-motion preferences shorten travel and reduce the jump.

## Adding a scene

Create a definition in `dist/scenes/` and add it to `SCENES` in `registry.js`. Declare a unique `id`, `spawn` (`x`, `y`, `z`), `heading`, `location`, `signs`, and `getSurfaceAt(x, z)`. Set `cameraOrbit` when the default view should face a different direction (it defaults to zero). Its `build(scene)` receives an independent Three.js `root`, `collisions`, and `add(component)` method. Add static meshes to `root`, register solid footprints with `collisions`, and register animated components with `add`.

Components may implement `update(elapsed, playerPosition, travelPose)`, `activate()`, and `deactivate()`. The manager updates only the active scene and runs lifecycle hooks when switching. Use `deactivate` to clear temporary effects. Scenes share the otter, controls, camera, and lighting without duplicating them.

For a pond portal, declare `pond` coordinates and `portal: { to: "destination-id", label: "Explore the next scene" }`, then compose `createPond` in `build`. The shared journey uses the target scene's spawn, plays the shared loader, and activates it under full cover. The existing three-project completion flow still returns home. Scene manager code does not need a new branch.

`components/loading-screen.js` owns the single loading illustration used at startup and during travel; its styles live alongside it. `journey-state.js` owns transition timing, while `components/pond-water-effects.js` owns the flat surface spiral. `npm run check` discovers all scene/component JavaScript automatically. `tests/scenes.test.js` verifies registration and lifecycle behavior with a third scene.

## Code map

| File | Responsibility |
| --- | --- |
| `dist/main.js` | Application composition, player updates, and the animation loop |
| `dist/camera-intro.js` | Opening zoom, one-second close-up, and gentle pullback |
| `dist/movement.js` | Heading-based movement, turn speed, walk/sprint speed, and acceleration |
| `dist/otter.js` | GLB loading, model normalization, and idle/walk animation blending |
| `dist/realm-data.js` | Realm IDs, spawn/pond coordinates, and welcome sign copy |
| `dist/realms.js` | Generic scene activation, component updates, and isolated collision maps |
| `dist/scenes/registry.js` | Register scene definitions |
| `dist/scenes/create-scene.js` | Shared scene/component lifecycle |
| `dist/scenes/home-scene.js`, `dist/scenes/projects-scene.js` | Scene-specific composition, spawns, ponds, signs, and portals |
| `dist/components/` | Reusable loading screen, water effects, rune dust, renderer, and follow camera |
| `dist/home-world.js` | Welcome clearing, trees, lettering, and pond |
| `dist/world.js` | Projects landscape, trails, trees, and trunk boundaries |
| `dist/boundaries.js` | Realm perimeter coordinates, visible fences, and playable limits |
| `dist/pond.js` | Static shallow-pool scenery, composed with water effects |
| `dist/journey-state.js` | Pure dive/return timeline and travel poses |
| `dist/journey.js` | Enter interaction, travel sequencing, and return to home |
| `dist/geometry.js` | Shared low-poly primitives and material caching |
| `dist/collisions.js` | Circle/polygon collision resolution, sliding, and world limits |
| `dist/controls.js` | Keyboard and pointer input |
| `dist/surfaces.js` | Shared path layout and grass/path classification |
| `dist/footsteps.js` | Gesture-unlocked, surface-specific paw sounds |
| `dist/theme-music.js` | Sleep music playback and mute/visibility handling |
| `dist/signs.js` | Signboard rendering and full-page section routes and navigation |
| `dist/checkpoint-state.js` | Unique project completion state |
| `dist/checkpoints.js` | Notifications, celebration, and completion callback |
| `dist/index.html`, `dist/style.css` | Full-screen canvas and shared interface styles |
| `server.js` | Local Node.js static server |
| `tests/` | Movement, collisions, progression, realm isolation, and journey regression tests |

Walking speed, sprint speed, turn speed, and acceleration are named constants in `movement.js`. Jump speed and gravity are at the top of `main.js`. The otter's collision radius is exported as `OTTER_RADIUS` in `otter.js` and reused by collision tests. Each solid prop registers its footprint in `world.js` next to the mesh that creates it.

Collision movement is subdivided into small steps to prevent tunneling. Multiple contact passes handle neighboring trees and allow sliding. Tree boundaries fit the visible trunks; foliage and trails are passable. The player boundary fits the otter's torso rather than its full tail length. Jumping does not bypass tree trunks. Outer world limits remain in place.

This is a finite, single-player world. The local version is served by Node.js; the previously published version uses static hosting.

Three.js is MIT licensed; see `dist/vendor/THREE-LICENSE.txt`.

The otter asset source and license are recorded in `dist/assets/otter-CREDITS.md`. The GLTF loader and geometry utilities in `dist/vendor` are part of Three.js, under the same MIT license.

Grass footsteps use the user-supplied ElevenLabs recording, normalized and played louder. Path footsteps use Kenney’s CC0 recording. Both are bundled as browser-compatible WAV files. Audio starts after keyboard or pointer input. Grass plays the full six-second stereo recording at original speed with smooth volume fades. Path sounds follow paw contacts. Actual travel gates playback so idle, airborne, and fully blocked movement stay quiet. See `dist/assets/audio/CREDITS.md` for sources and edits.

Sleep music is the bundled user-provided `leberch-sleep-music-587996.mp3`. It loops after the first interaction. Nearby signs show an Enter prompt; reading pauses the otter, and Enter or Escape returns to the world.

## Portfolio

Large ground lettering at the entrance introduces Ethan Schauder, Computer Science at the University of Virginia, with interests in machine learning, full-stack development, and aerospace. `portfolio-data.js` stores this copy and the sign definitions. `ground-text.js` draws the lettering into transparent ground decals.

The first sign features Proton Projector and links to https://devpost.com/software/proton-projector. Its description is based on the Devpost project page. `proton-projector.js` builds a stylized forecasting display, console, and solar sculpture with physical collision boundaries. The graph is illustrative, rather than live prediction data. The trail extends to z=160; world boundaries extend to z=170.

Project 02 is the NeurIPS Ariel Data Challenge 2025, based on Ethan's resume: silver medal and exoplanet transmission-spectrum modeling. Its second sign links to the supplied Kaggle submission notebook. `neurips-ariel.js` builds a solid telescope, an illustrative spectrum display, and a silver-medal marker on the right side of the path.

Each section has its own shareable hash route (`#/section/about`, `#/section/education`, `#/section/interests`, `#/section/contacts`) and a full-page layout without a navbar, with a clear “Back to the world” footer button. Other pages are discovered by exploring the world rather than through direct page navigation. Pages ease in over the world and fade out on return; reduced-motion preferences skip the animation. Project details use the same page format. Browser Back and Escape return to exploration; movement controls pause while reading. The camera follows position with a fixed orbit, adjusted by dragging, and does not rotate when the otter turns.

Project 03 is Chronopedia, based on https://devpost.com/software/chronopedia. The third stop features an encyclopedia, clock, and stacked-book obstacles. Leaving each project's page marks a unique checkpoint for the current visit (1/3, 2/3, 3/3). The final checkpoint triggers an anime.js leaf-confetti celebration and an original synthesized completion chime; M also mutes that chime. Decorative signs do not count, and repeated project reads do not increase progress. Progress resets on reload so visitors can repeat the trail.

Painted arrows after every sign follow the path centerline. The path now ends at z=180, inside the expanded z=190 world boundary. `checkpoint-state.js` contains progression rules, `checkpoints.js` contains notifications and celebration effects, and `success-sound.js` contains the original chime.
