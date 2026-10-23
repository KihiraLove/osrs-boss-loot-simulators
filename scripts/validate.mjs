import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

function modules(directory) {
  return readdirSync(new URL(directory + "/", import.meta.url), { withFileTypes: true })
    .flatMap(entry => entry.isDirectory()
      ? modules(directory + "/" + entry.name)
      : entry.name.endsWith(".mjs") ? [directory + "/" + entry.name] : []);
}

function run(args) {
  const result = spawnSync(process.execPath, args, {
    cwd: root, stdio: "inherit", windowsHide: true
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const sources = ["../bosses", "../shared", "../scripts"].flatMap(modules);
for (const source of sources) run(["--check", fileURLToPath(new URL(source, import.meta.url))]);
console.log("Syntax checked " + sources.length + " modules.");

const tests = readdirSync(new URL("../tests/", import.meta.url))
  .filter(name => name.endsWith(".test.mjs")).map(name => "tests/" + name);
run(["--test", ...tests]);
