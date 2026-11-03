# Little Roamer

A small Three.js / WebGL playground with a Node.js static server. All 3D geometry is generated in code and Three.js is bundled locally. No install or build step is required. Google Fonts is optional; system fonts are used when offline.

## Run

With Node.js 20.11 or newer:

```sh
npm start
```

Open http://127.0.0.1:3000. Set `PORT` to use another port. To verify JavaScript syntax, run `npm run check`.

## Controls

- WASD / arrows: move relative to the camera
- Shift: sprint
- Space: jump
- Drag: rotate camera
- Scroll: zoom
- E: read a nearby landmark's story
- R: return to the meadow
- H: field guide

Touch controls are available on narrow screens. Find six golden markers; progress is saved in browser localStorage. The top-right music button enables synthesized ambient sound.

The open world has five landmarks, obstacle collisions, animated windmill sails and a following camera. It is a single-player experience with a finite landscape. Node.js serves local development; the published version uses static hosting.

Three.js is MIT licensed: https://github.com/mrdoob/three.js/blob/r170/LICENSE
