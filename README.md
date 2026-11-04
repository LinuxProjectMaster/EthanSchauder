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

The otter starts in a welcome clearing surrounded by About, Education, Interests, and Contacts runic stepping stones. Step onto a stone to light its carved rune and swirl violet dust across the screen before its information opens. Leave the stone before stepping back on to reopen it; Enter or the nearby prompt can also activate it. Reduced-motion settings use a brief, gentle reveal. Contacts includes the owner-supplied email and LinkedIn profile. Walk toward the pond and press Enter (or click the shore prompt) to dive into the projects world. The otter emerges from an arrival pond onto the existing portfolio trail. Reading and closing each of the three unique project signs completes its checkpoint. After the final checkpoint, the celebration plays and the otter jumps back into the welcome clearing. Progress is retained for the current page visit; repeated reads do not repeat the completion celebration. R cancels a journey and returns home without clearing completed checkpoints.

The projects camera faces along the trail, so walking forward leads up the screen. Both realms have a visible split-rail fence; its inner edge is a solid boundary that cannot be crossed by walking, sprinting, or jumping. The projects perimeter encloses the arrival pond, all exhibits, and the full scenic trail.

Each realm owns its scenery, signs, and collision map. Only one is visible and interactive at a time. Travel locks movement, hides the world switch behind a water-colored fade, and resets the camera and momentum on arrival. Reduced-motion preferences shorten travel and reduce the jump.

## Code map

| File | Responsibility |
| --- | --- |
| `dist/main.js` | Scene setup, camera, animation loop, and loading lifecycle |
| `dist/camera-intro.js` | Opening zoom, one-second close-up, and gentle pullback |
| `dist/movement.js` | Heading-based movement, turn speed, walk/sprint speed, and acceleration |
| `dist/otter.js` | GLB loading, model normalization, and idle/walk animation blending |
| `dist/realm-data.js` | Realm IDs, spawn/pond coordinates, and welcome sign copy |
| `dist/realms.js` | Assemble both realms and switch their visibility and collision maps |
| `dist/home-world.js` | Welcome clearing, trees, lettering, and pond |
| `dist/world.js` | Projects landscape, trails, trees, and trunk boundaries |
| `dist/boundaries.js` | Realm perimeter coordinates, visible fences, and playable limits |
| `dist/pond.js` | Reusable shoreline, water, lily pads, and ripples |
| `dist/journey-state.js` | Pure dive/return timeline and travel poses |
| `dist/journey.js` | Enter interaction, travel sequencing, and return to home |
| `dist/geometry.js` | Shared low-poly primitives and material caching |
| `dist/collisions.js` | Circle/polygon collision resolution, sliding, and world limits |
| `dist/controls.js` | Keyboard and pointer input |
| `dist/surfaces.js` | Shared path layout and grass/path classification |
| `dist/footsteps.js` | Gesture-unlocked, surface-specific paw sounds |
| `dist/theme-music.js` | Sleep music playback and mute/visibility handling |
| `dist/signs.js` | Signboard rendering and one shared reading panel filtered by realm |
| `dist/checkpoint-state.js` | Unique project completion state |
| `dist/checkpoints.js` | Notifications, celebration, and completion callback |
| `dist/index.html`, `dist/style.css` | Wordless loading animation and full-screen canvas |
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

Reading panels use an anime.js 4.2.2 scale-and-fade entrance and reverse exit, while retaining the native dialog focus trap and Escape behavior. Reduced-motion preferences skip the animation. Wood-grain CSS, beveled edges, metal fasteners, Bree Serif headings, and Lora body text style the panels as trail signs. Anime.js and both OFL fonts are bundled locally with their licenses.

Project 03 is Chronopedia, based on https://devpost.com/software/chronopedia. The third stop features an encyclopedia, clock, and stacked-book obstacles. Closing each project's reading panel marks a unique checkpoint for the current visit (1/3, 2/3, 3/3). The final checkpoint triggers an anime.js leaf-confetti celebration and an original synthesized completion chime; M also mutes that chime. Decorative signs do not count, and repeated project reads do not increase progress. Progress resets on reload so visitors can repeat the trail.

Painted arrows after every sign follow the path centerline. The path now ends at z=180, inside the expanded z=190 world boundary. `checkpoint-state.js` contains progression rules, `checkpoints.js` contains notifications and celebration effects, and `success-sound.js` contains the original chime.
