import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

test("Pages versioning updates the entire module graph without changing source", async (t) => {
  const output = await mkdtemp(join(tmpdir(), "ethan-pages-"));
  t.after(() => rm(output, { recursive: true, force: true }));
  const result = spawnSync(process.execPath, ["scripts/prepare-pages.mjs", output], {
    env: { ...process.env, GITHUB_SHA: "abc123" }, encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  const html = await readFile(join(output, "index.html"), "utf8");
  assert.match(html, /src="main\.js\?v=abc123"/);
  assert.match(html, /href="style\.css\?v=abc123"/);
  let imports = 0;
  async function check(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await check(path);
      else if (entry.name.endsWith(".js")) {
        const source = await readFile(path, "utf8");
        for (const match of source.matchAll(/(?:from\s+|import\s*)["'](\.[^"']+\.js(?:\?[^"']*)?)["']/g)) {
          imports++;
          assert.ok(match[1].endsWith("?v=abc123"), `${path}: ${match[1]}`);
          await access(resolve(dirname(path), match[1].split("?")[0]));
        }
      }
    }
  }
  await check(output);
  assert.ok(imports > 50, "checks application and vendor module imports");
  assert.doesNotMatch(await readFile("dist/main.js", "utf8"), /\?v=abc123/);
});
