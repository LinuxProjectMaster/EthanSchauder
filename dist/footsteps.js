/** Surface-specific paw impacts: user-supplied grass audio and Kenney path foley.
 * Audio unlocks on the first real keyboard/pointer gesture, without adding UI. */
export function createFootsteps() {
  let context;
  let master;
  let buffers;
  let loading;
  let muted = false;
  let paw = 0;
  let grassSource;
  let grassGain;
  let grassActive = false;
  const recordings = Promise.all(
    ["grass", "path"].map(async (surface) => {
      const filename = surface === "grass" ? "grass-user.wav" : "path-0.wav";
      const response = await fetch(`./assets/audio/${filename}`);
      if (!response.ok) throw new Error(`Unable to load ${surface} footsteps`);
      return [surface, await response.arrayBuffer()];
    }),
  );
  // Prevent an unavailable sound asset from interrupting the playable world.
  recordings.catch(() => {});

  async function unlock() {
    try {
      if (!context) {
        context = new AudioContext();
        master = context.createGain();
        master.gain.value = muted ? 0 : 0.55;
        const limiter = context.createDynamicsCompressor();
        master.connect(limiter).connect(context.destination);
      }
      await context.resume();
      if (!loading) {
        loading = recordings.then(async (files) => {
          buffers = Object.fromEntries(
            await Promise.all(
              files.map(async ([surface, data]) => [
                surface,
                await context.decodeAudioData(data),
              ]),
            ),
          );
        });
      }
      await loading;
    } catch (error) {
      console.warn("Footstep audio unavailable:", error.message);
    }
  }
  const resumeOnInput = () => {
    if (!buffers || context?.state !== "running") void unlock();
  };
  addEventListener("keydown", resumeOnInput);
  addEventListener("pointerdown", resumeOnInput);
  addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() !== "m" || event.repeat) return;
    muted = !muted;
    if (master)
      master.gain.setTargetAtTime(muted ? 0 : 0.55, context.currentTime, 0.04);
  });

  function setGrassActive(active) {
    if (!buffers || !context || context.state !== "running") return;
    if (active && !grassSource) {
      grassSource = context.createBufferSource();
      grassSource.buffer = buffers.grass;
      grassSource.loop = true;
      grassSource.playbackRate.value = 1;
      grassGain = context.createGain();
      grassGain.gain.value = 0;
      grassSource.connect(grassGain).connect(master);
      // Run the complete six-second recording, never random per-paw fragments.
      grassSource.start(context.currentTime);
    }
    if (active !== grassActive && grassGain) {
      grassGain.gain.setTargetAtTime(
        active ? 0.07 : 0,
        context.currentTime,
        0.045,
      );
    }
    grassActive = active;
  }
  addEventListener("blur", () => setGrassActive(false));
  addEventListener("visibilitychange", () => {
    if (document.hidden) setGrassActive(false);
  });

  return {
    update(surface, speed, grounded) {
      const active =
        surface === "grass" && speed > 0.4 && grounded && !document.hidden;
      setGrassActive(active);
    },
    play(surface, speed) {
      // Paths retain discrete footfalls. Grass uses the full continuous recording.
      if (
        surface === "grass" ||
        !buffers ||
        muted ||
        context.state !== "running" ||
        document.hidden
      )
        return;
      const source = context.createBufferSource();
      source.buffer = buffers.path;
      source.playbackRate.value = 1.28 + Math.random() * 0.18;
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1450;
      const envelope = context.createGain();
      const now = context.currentTime;
      const volume =
        0.55 * (speed > 7 ? 1.12 : 1) * (0.85 + Math.random() * 0.25);
      envelope.gain.setValueAtTime(0, now);
      envelope.gain.linearRampToValueAtTime(volume, now + 0.006);
      envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      const pan = context.createStereoPanner();
      pan.pan.value = (paw++ % 2 ? 1 : -1) * 0.12;
      source.connect(filter).connect(envelope).connect(pan).connect(master);
      source.onended = () => {
        source.disconnect();
        filter.disconnect();
        envelope.disconnect();
        pan.disconnect();
      };
      source.start(now);
      source.stop(now + 0.2);
    },
  };
}
