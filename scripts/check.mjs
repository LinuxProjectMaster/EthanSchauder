import { access, readdir, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";

// Automatically include new scene/component modules; vendor files are kept intact.
async function modules(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory() && entry.name !== "vendor" && entry.name !== "assets") files.push(...await modules(path));
    else if (entry.isFile() && entry.name.endsWith(".js")) files.push(path);
  }
  return files;
}
for (const path of [...await modules("dist"), "server.js"]) {
  const result = spawnSync(process.execPath, ["--check", path], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
  const source = await readFile(path, "utf8");
  for (const match of source.matchAll(/(?:from\s+|import\s*)["'](\.[^"']+)["']/g)) {
    try { await access(resolve(dirname(path), match[1])); }
    catch { throw new Error(`Missing module ${match[1]} imported by ${path}`); }
  }
}
