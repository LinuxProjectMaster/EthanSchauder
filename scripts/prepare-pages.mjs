import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

// Give every module in the import graph the same deployment version, including
// vendor modules, so a cached dependency cannot restore an older page design.
const output = resolve(process.argv[2] ?? ".pages");
const version = process.env.GITHUB_SHA ?? "local";
if (!/^[a-zA-Z0-9-]+$/.test(version)) throw new Error("Invalid asset version");
if (output === resolve("dist") || output === resolve(".")) throw new Error("Use a separate Pages output directory");
await mkdir(output, { recursive: true });
await cp("dist", output, { recursive: true });
async function versionFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await versionFiles(path);
    else if (entry.name.endsWith(".js") || entry.name.endsWith(".html")) {
      const source = await readFile(path, "utf8");
      const updated = entry.name.endsWith(".js")
        ? source.replace(/((?:from\s+|import\s*)["'])(\.[^"']+\.js)(["'])/g, `$1$2?v=${version}$3`)
        : source.replace(/((?:src|href)=["'])([^"']+\.(?:js|css))(["'])/g, `$1$2?v=${version}$3`);
      await writeFile(path, updated);
    }
  }
}
await versionFiles(output);
