# Ethan Schauder

[Live portfolio](https://linuxprojectmaster.github.io/EthanSchauder/) · [Source](https://github.com/LinuxProjectMaster/EthanSchauder)

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

The otter starts in a welcome clearing surrounded by About, Education, Interests, and Contacts runic stepping stones. A compact WASD/arrow-key movement hint appears at the bottom after the camera intro; its keyboard button reopens it after dismissal. Large stone labels and University of Virginia beneath Ethan’s name orient visitors. Walk onto a stone to light its carved rune and swirl black smoke and curling charcoal dust across the screen before its full section page opens. Leave the stone before stepping back on to reopen it; Enter or the nearby prompt can also activate it. Reduced-motion settings use a brief, gentle reveal. Contacts includes the owner-supplied email and LinkedIn profile. Walk into the shallow pond and press Enter (or click its prompt) to travel. Entry alone never transports the otter. The pond surface begins spinning, then the same animated loading illustration used at startup plays before revealing the projects world. The otter arrives at the portfolio trail spawn. Project pages can be read and revisited freely. Closing a page leaves the otter in place on the projects trail. Use the Return home button, the arrival pond, or R to return to the welcome clearing.


The projects camera faces along the trail, so walking forward leads up the screen. Both realms have a visible split-rail fence; its inner edge is a solid boundary that cannot be crossed by walking, sprinting, or jumping. The projects perimeter encloses the arrival pond, all exhibits, and the full scenic trail.

Each realm owns its scenery, signs, and collision map. Only one is visible and interactive at a time. Travel locks movement, hides the world switch behind the reusable opening loading animation, and resets the camera and momentum on arrival. Reduced-motion preferences shorten travel.

## Adding a scene

Scenes declare an ordered list of component factories. Copy the tested `dist/scenes/example-scene.js`, register it in `dist/scenes/registry.js`, and point an existing pond portal at its ID. Shared factories provide ponds, fences, signs, and runes; each scene owns its collision map and component lifecycle.

See [the scene authoring guide](docs/adding-scenes.md) for the complete component contract, reusable pieces, and entry/exit setup. The example is not registered in the live portfolio.

## Publishing

GitHub Pages stages `dist/` with versioned script/style URLs and publishes it through `.github/workflows/pages.yml` after every push to `main`. Syntax checks and the test suite must pass before deployment. No dependency installation or build is required. In repository Settings → Pages, choose GitHub Actions as the publishing source.

All browser modules, assets, fonts, and styles use relative URLs, so the site works under a repository path such as `/EthanSchauder/`. Section routes use URL hashes and need no server rewrites. `.openai/hosting.json` retains the separate Sites identity; it is outside the Pages artifact.

## Code map

| File | Responsibility |
| --- | --- |
| `dist/main.js` | Application composition, player updates, and the animation loop |
| `dist/camera-intro.js` | Opening one-second close-up and gentle pullback |
| `dist/movement.js` | Heading-based movement, turn speed, walk/sprint speed, and acceleration |
| `dist/otter.js` | GLB loading, model normalization, and idle/walk animation blending |
| `dist/realm-data.js` | Realm IDs, spawn/pond coordinates, and welcome sign copy |
| `dist/realms.js` | Generic scene activation, component updates, and isolated collision maps |
| `dist/scenes/registry.js` | Register scene definitions |
| `dist/scenes/create-scene.js` | Shared scene/component lifecycle |
| `dist/scenes/home-scene.js`, `dist/scenes/projects-scene.js` | Scene-specific composition, spawns, ponds, signs, and portals |
| `dist/components/` | Shared scene factories, loading screen, water effects, rune dust, renderer, and follow camera |
| `dist/components/scenery/` | Reusable pond, ground text, runes, signboards, and trail arrows |
| `dist/components/exhibits/` | Project exhibit meshes and collision footprints |
| `dist/scenes/home-world.js` | Welcome clearing, trees, lettering, and pond |
| `dist/scenes/projects-world.js` | Projects landscape, trails, trees, and trunk boundaries |
| `dist/boundaries.js` | Realm perimeter coordinates, visible fences, and playable limits |
| `dist/components/scenery/pond.js` | Static shallow-pool scenery, composed with water effects |
| `dist/journey-state.js` | Pure dive/return timeline and travel poses |
| `dist/journey.js` | Enter interaction, travel sequencing, and return to home |
| `dist/geometry.js` | Shared low-poly primitives and material caching |
| `dist/collisions.js` | Circle/polygon collision resolution, sliding, and world limits |
| `dist/controls.js` | Keyboard and pointer input |
| `dist/surfaces.js` | Shared path layout and grass/path classification |
| `dist/footsteps.js` | Gesture-unlocked, surface-specific paw sounds |
| `dist/theme-music.js` | Sleep music playback and mute/visibility handling |
| `dist/signs.js` | Signboard rendering and full-page section routes and navigation |
| `dist/index.html`, `dist/style.css` | Full-screen canvas and shared interface styles |
| `server.js` | Local Node.js static server |
| `tests/` | Movement, collisions, trail signs, realm isolation, and journey regression tests |

Walking speed, sprint speed, turn speed, and acceleration are named constants in `movement.js`. Jump speed and gravity are at the top of `main.js`. The otter's collision radius is exported as `OTTER_RADIUS` in `otter.js` and reused by collision tests. Each solid prop registers its footprint next to the mesh that creates it.

Collision movement is subdivided into small steps to prevent tunneling. Multiple contact passes handle neighboring trees and allow sliding. Tree boundaries fit the visible trunks; foliage and trails are passable. The player boundary fits the otter's torso rather than its full tail length. Jumping does not bypass tree trunks. Outer world limits remain in place.

This is a finite, single-player world. The local version is served by Node.js; the previously published version uses static hosting.

Three.js is MIT licensed; see `dist/vendor/THREE-LICENSE.txt`.

The otter asset source and license are recorded in `dist/assets/otter-CREDITS.md`. The GLTF loader and geometry utilities in `dist/vendor` are part of Three.js, under the same MIT license.

Grass footsteps use the user-supplied ElevenLabs recording, normalized and played louder. Path footsteps use Kenney’s CC0 recording. Both are bundled as browser-compatible WAV files. Audio starts after keyboard or pointer input. Grass plays the full six-second stereo recording at original speed with smooth volume fades. Path sounds follow paw contacts. Actual travel gates playback so idle, airborne, and fully blocked movement stay quiet. See `dist/assets/audio/CREDITS.md` for sources and edits.

Sleep music is bundled in `dist/assets/audio/sleep-theme.m4a`. It loops after the first interaction. Nearby signs show an Enter prompt; reading pauses the otter, and Enter or Escape returns to the world.

## Portfolio

Large ground lettering at the entrance introduces Ethan Schauder, Computer Science at the University of Virginia, with interests in machine learning, full-stack development, and aerospace. `portfolio-data.js` stores this copy and the sign definitions. `ground-text.js` draws the lettering into transparent ground decals.

The first sign features Proton Projector and links to https://devpost.com/software/proton-projector. Its description is based on the Devpost project page. `proton-projector.js` builds a stylized forecasting display, console, and solar sculpture with physical collision boundaries. The graph is illustrative, rather than live prediction data. The compact trail ends at z=54 inside the project fence.

Project 02 is the NeurIPS Ariel Data Challenge 2025, based on Ethan's resume: silver medal and exoplanet transmission-spectrum modeling. Its second sign links to the supplied Kaggle submission notebook. `neurips-ariel.js` builds a solid telescope, an illustrative spectrum display, and a silver-medal marker on the right side of the path.

Each section has its own shareable hash route (`#/section/about`, `#/section/education`, `#/section/interests`, `#/section/contacts`) and a charcoal page with warm white type and no navbar, with a clear “Back to the world” footer button that stays visible while the article scrolls independently. Other pages are discovered by exploring the world rather than through direct page navigation. Pages ease in over the world and fade out on return; reduced-motion preferences skip the animation. Project details use the same page format. Browser Back and Escape return to exploration; movement controls pause while reading. The camera follows position with a fixed orbit, adjusted by dragging, and does not rotate when the otter turns.

Project 03 is Chronopedia, based on https://devpost.com/software/chronopedia. The third stop features an encyclopedia, clock, and stacked-book obstacles. Closing any project page returns to exploration at the same position, including after reading all three projects.

Painted arrows after every sign follow the path centerline. Project stops are at z=20, 34, and 48, with the first just 8 units from arrival. The compact path ends at z=54 inside a visible fence spanning x=-21…26 and z=0…58. A persistent Return home button and the arrival pond allow leaving whenever you choose.
