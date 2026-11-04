import test from "node:test";
import assert from "node:assert/strict";
import { isOnRune, RUNE_RADIUS } from "../dist/runic-rocks.js";
import { HOME_SIGNS, HOME_SPAWN } from "../dist/realm-data.js";

test("welcome rocks trigger only when the otter is grounded on their footprint", () => {
  assert.deepEqual(HOME_SIGNS.map((rock) => rock.title).sort(), ["ABOUT", "CONTACTS", "EDUCATION", "INTERESTS"]);
  for (const rock of HOME_SIGNS) {
    assert.equal(rock.runic, true);
    assert.equal(isOnRune(HOME_SPAWN, rock), false);
    assert.equal(isOnRune({ x: rock.x, z: rock.z, y: 0 }, rock), true);
    assert.equal(isOnRune({ x: rock.x, z: rock.z, y: 1 }, rock), false);
    assert.equal(isOnRune({ x: rock.x + RUNE_RADIUS + .01, z: rock.z, y: 0 }, rock), false);
  }
});
