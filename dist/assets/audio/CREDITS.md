# Footstep recordings

Author: Kenney (Kenney Vleugels)
Pack: Impact Sounds
Original source: https://kenney.nl/assets/impact-sounds
License: Creative Commons Zero (CC0 1.0)
License URL: https://creativecommons.org/publicdomain/zero/1.0/

Files:
- grass-0.ogg: footstep_grass_000.ogg
- path-0.ogg: footstep_concrete_000.ogg

The official archive download was unavailable. These original recordings were retrieved from the public mirror:
https://github.com/liamgh/FlopperFlinger

The WAV copies are converted to mono PCM, leading silence trimmed, and peak normalized. Playback is pitched slightly higher, low-pass filtered, enveloped, and varied per step for a small animal's soft padding. Concrete foley is softened to make the compacted path sound firmer than grass without a boot-like impact.

## Current grass sound

The active grass sound is the user-supplied `ElevenLabs_Generation_4.ogg`, copied as `grass-user.ogg` and converted into `grass-user.wav` for browser compatibility. This supplied recording is not covered by Kenney's CC0 notice above. Its original recording level was very quiet; the WAV is converted to mono, DC offset removed, peak-normalized to 0.85, and given short edge fades. Short random sections play at near-original pitch, with increased grass volume. The path sound remains Kenney's softened concrete recording.

### Playback correction

The active grass WAV now preserves all six seconds and both stereo channels, with gain normalization and only 8 ms edge fades. It plays as one continuous loop at exactly 1× speed, without per-step slices, random offsets, pitch variation, or low-pass filtering. Movement and surface transitions smoothly fade its volume.

## Theme music

The user requested Sleep music as the theme song. The provided local file `leberch-sleep-music-587996.mp3` is bundled as `sleep-theme.mp3`. It plays in full on a loop at a gentle volume, starting after the first keyboard or pointer interaction. No CC0 claim is made for this user-provided track.
