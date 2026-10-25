import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { binomial, convolveDistributions, distributionOdds, validateDropCount } from "../shared/distributions.mjs";

const close = (a, b, tolerance = 1e-10) => assert.ok(Math.abs(a - b) <= tolerance, `${a} != ${b}`);
const root = new URL("../", import.meta.url);
const read = path => readFileSync(new URL(path, root), "utf8");
const calculatorDirectories = ["bosses", "chests", "treasure-trails"].flatMap(category => readdirSync(new URL(category + "/", root), { withFileTypes: true })
  .filter(entry => entry.isDirectory()).map(entry => `${category}/${entry.name}`));

test("shared binomial agrees with the exact four-coin distribution", () => {
  const dist = binomial(4, .5);
  assert.equal(dist.from, 0);
  assert.deepEqual([...dist.values], [1 / 16, 4 / 16, 6 / 16, 4 / 16, 1 / 16]);
  assert.deepEqual(distributionOdds(dist, 2), { count: 2, expected: 2, fewer: 5 / 16, exact: 6 / 16, more: 5 / 16 });
});

test("shared distributions handle zero and guaranteed outcomes", () => {
  for (const [n, p, outcome] of [[0, .5, 0], [10, 0, 0], [10, 1, 10]]) {
    const dist = binomial(n, p);
    assert.equal(dist.from, outcome);
    assert.deepEqual([...dist.values], [1]);
    assert.equal(distributionOdds(dist, outcome).exact, 1);
  }
});

test("mode-centered probabilities stay finite for millions of trials and extreme rates", () => {
  for (const p of [1 / 5000, .5, .9999]) {
    const dist = binomial(7_000_000, p);
    close(dist.values.reduce((sum, value) => sum + value, 0), 1);
    close(dist.expected, 7_000_000 * p);
    const result = distributionOdds(dist, Math.round(dist.expected));
    close(result.fewer + result.exact + result.more, 1);
    assert.ok(dist.values.every(value => Number.isFinite(value) && value >= 0));
  }
});

test("convolution preserves support offsets and matches six independent coin tosses", () => {
  const actual = convolveDistributions(binomial(3, .5), binomial(3, .5));
  const expected = binomial(6, .5);
  assert.equal(actual.from, expected.from);
  actual.values.forEach((value, index) => close(value, expected.values[index]));
  assert.equal(actual.expected, 3);
  const shifted = convolveDistributions(binomial(2, 1), binomial(2, .5));
  assert.equal(shifted.from, 2); assert.deepEqual([...shifted.values], [.25, .5, .25]);
  assert.equal(shifted.expected, 3);
});

test("mapped dry statistics support fixed bundles and capped rewards", () => {
  const bundle = distributionOdds(binomial(2, .5), 3, count => count * 3);
  assert.deepEqual(bundle, { count: 3, expected: 3, fewer: .25, exact: .5, more: .25 });
  const cap = distributionOdds(binomial(2, .5), 1, count => Math.min(count, 1));
  assert.deepEqual(cap, { count: 1, expected: .75, fewer: .25, exact: .75, more: 0 });
});

test("shared probability functions reject invalid parameters and respect caller limits", () => {
  for (const n of [-1, .5, NaN, Infinity, "1"]) assert.throws(() => binomial(n, .5));
  for (const p of [-.1, 1.1, NaN, undefined, ".5"]) assert.throws(() => binomial(10, p));
  assert.throws(() => binomial(11, .5, { maxTrials: 10 }));
  assert.throws(() => binomial(10, .5, { deviations: 0 }));
  assert.equal(validateDropCount(10, 10), 10);
  for (const n of [-1, .5, 11, "1"]) assert.throws(() => validateDropCount(n, 10));
});

test("generic calculator controls and imports contain no Phosani names", () => {
  assert.doesNotMatch(read("styles.css") + read("shared/ui.mjs"), /phosani/);
  for (const directory of calculatorDirectories) {
    const source = ["index.html", "app.mjs", "dry-calc.mjs"].map(file => read(directory + "/" + file)).join("\n");
    assert.doesNotMatch(source, /phosani-(?:icon|kills|option)/, directory);
    if (directory !== "bosses/phosani") assert.doesNotMatch(source, /phosani/, directory);
  }
  assert.doesNotMatch(read("shared/chest-calculator.mjs"), /bosses\//);
});

test("concise guides retain working local links and removed chest notes have no references", () => {
  assert.equal(existsSync(new URL("shared/CHESTS.md", root)), false);
  const paths = ["README.md", "chests/README.md", ...calculatorDirectories.map(directory => directory + "/README.md")];
  for (const path of paths) {
    const markdown = read(path);
    assert.doesNotMatch(markdown, /shared\/CHESTS\.md|sinister-chest|Already own|Konar Slayer task|awakened mode/i, path);
    for (const [, target] of markdown.matchAll(/\]\(([^)]+)\)/g)) {
      if (/^(?:https?:|#)/.test(target)) continue;
      const url = new URL(target.split("#")[0], new URL(path, root));
      assert.ok(existsSync(url), `${path}: ${target}`);
    }
  }
});
