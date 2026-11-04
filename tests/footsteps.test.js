import test from "node:test";
import assert from "node:assert/strict";
import { createFootsteps } from "../dist/footsteps.js";

test("audio unlocks on input, uses different surface recordings, and respects mute/hidden state", async (t) => {
  const events = new Map();
  const played = [];
  const sources = [];
  const fades = [];
  const filters = [];
  let contexts = 0;
  const parameter = () => ({
    value: 0,
    setValueAtTime() {},
    linearRampToValueAtTime() {},
    exponentialRampToValueAtTime() {},
    setTargetAtTime(value) {
      fades.push(value);
    },
  });
  const node = () => ({
    connect(target) {
      return target;
    },
    disconnect() {},
  });
  class FakeAudioContext {
    constructor() {
      contexts++;
      this.state = "suspended";
      this.currentTime = 1;
      this.destination = node();
    }
    async resume() {
      this.state = "running";
    }
    async decodeAudioData(data) {
      return { id: new Uint8Array(data)[0], duration: 6 };
    }
    createGain() {
      return { ...node(), gain: parameter() };
    }
    createDynamicsCompressor() {
      return node();
    }
    createBiquadFilter() {
      const filter = { ...node(), frequency: parameter() };
      filters.push(filter);
      return filter;
    }
    createStereoPanner() {
      return { ...node(), pan: parameter() };
    }
    createBufferSource() {
      return {
        ...node(),
        playbackRate: parameter(),
        start() {
          played.push(this.buffer.id);
          sources.push(this);
        },
        stop() {
          this.onended();
        },
      };
    }
  }
  const originals = Object.fromEntries(
    ["addEventListener", "AudioContext", "fetch", "document"].map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  t.after(() => {
    for (const [key, descriptor] of Object.entries(originals)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  globalThis.addEventListener = (name, handler) => {
    if (!events.has(name)) events.set(name, []);
    events.get(name).push(handler);
  };
  globalThis.AudioContext = FakeAudioContext;
  globalThis.document = { hidden: false };
  globalThis.fetch = async (url) => ({
    ok: true,
    arrayBuffer: async () =>
      new Uint8Array([url.includes("grass") ? 1 : 2]).buffer,
  });

  const audio = createFootsteps();
  audio.play("grass", 6);
  assert.equal(contexts, 0, "no autoplay context before user input");
  assert.equal(played.length, 0);
  events.get("pointerdown")[0]();
  await new Promise(setImmediate);
  audio.update("grass", 6, true);
  audio.play("path", 6);
  assert.deepEqual(played, [1, 2]);
  assert.equal(
    sources[0].loop,
    true,
    "grass uses the full recording as a loop",
  );
  assert.equal(
    sources[0].playbackRate.value,
    1,
    "grass stays at its original speed",
  );
  assert.equal(
    filters.length,
    1,
    "grass is not filtered or chopped into impacts",
  );
  assert.equal(filters[0].frequency.value, 1450);
  audio.update("grass", 6, true);
  assert.equal(
    played.length,
    2,
    "moving does not restart or layer the grass recording",
  );
  audio.update("grass", 0, true);
  assert.equal(fades.at(-1), 0, "stopping fades out grass");
  audio.update("grass", 6, true);
  assert.equal(fades.at(-1), 0.07);
  audio.update("grass", 6, false);
  assert.equal(fades.at(-1), 0, "jumping fades out grass");
  audio.update("grass", 6, true);
  audio.update("path", 6, true);
  assert.equal(fades.at(-1), 0, "entering a path fades out grass");
  events
    .get("keydown")
    .forEach((handler) => handler({ key: "m", repeat: false }));
  audio.play("grass", 6);
  assert.equal(played.length, 2, "muted footsteps stay silent");
  events
    .get("keydown")
    .forEach((handler) => handler({ key: "m", repeat: false }));
  globalThis.document.hidden = true;
  audio.play("path", 6);
  assert.equal(played.length, 2, "hidden page stays silent");
  globalThis.document.hidden = false;
  audio.play("path", 6);
  assert.equal(played.length, 3);
});
