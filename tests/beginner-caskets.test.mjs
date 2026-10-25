import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  COSMETICS, BLACK, MAIN, UNIQUE, ITEMS, MAX_CASKETS,
  COSMETIC_RATE, BLACK_PICKAXE_RATE, COLLECTION_RATE, rateOf, simulate
} from "../treasure-trails/beginner/simulator.mjs";
import { casketDistribution, calculateDry } from "../treasure-trails/beginner/dry-calc.mjs";
import { repeatDistribution } from "../shared/distributions.mjs";

const close = (a, b, tolerance = 1e-10) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
function run(values) {
  return simulate(1, { rng: () => {
    assert.ok(values.length, "Unexpected extra random roll");
    return values.shift();
  } });
}

test("beginner tables retain all ordinary rewards and all 16 collection-log items", () => {
  assert.equal(COSMETICS.length, 15);
  assert.equal(BLACK.length, 18);
  assert.equal(MAIN.length, 41);
  assert.equal(UNIQUE.length, 16);
  assert.equal(UNIQUE.at(-1).id, "black-pickaxe");
  close(COSMETICS.length / 360 + 1 / 24 + 40 * 11 / 492 + BLACK.length * 11 / 8856, 1);
  close(rateOf("mole-slippers"), 1 / 360);
  close(rateOf("black-pickaxe"), 11 / 8856);
  close(COLLECTION_RATE, 15 / 360 + 11 / 8856);
});

test("each casket rolls one, two or three rewards, including duplicate uniques", () => {
  const one = run([0, .9, 1.5 / 41]);
  assert.equal(one.rewardRolls, 1);
  assert.deepEqual(one.drops, { shortbow: 1 });
  const two = run([.5, .9, 1.5 / 41, .9, 1.5 / 41]);
  assert.equal(two.rewardRolls, 2);
  assert.deepEqual(two.drops, { shortbow: 2 });
  const three = run([.99, 0, .75, 0, 0, .75, 0, 0, .75, 0]);
  assert.equal(three.rewardRolls, 3);
  assert.deepEqual(three.drops, { "mole-slippers": 3 });
  assert.doesNotThrow(() => calculateDry(1, { "mole-slippers": 3 }));
});

test("cabbages and cosmetics are exclusive halves of the special subtable", () => {
  assert.deepEqual(run([0, 0, .49, 0]).drops, { cabbage: 5 });
  assert.deepEqual(run([0, 0, .49, .999]).drops, { cabbage: 9 });
  assert.deepEqual(run([0, 0, .5, 0]).drops, { "mole-slippers": 1 });
  assert.deepEqual(run([0, 0, .99, .999]).drops, { "rune-scimitar-ornament-kit-zamorak": 1 });
});

test("the common black-equipment branch chooses one of 18 items", () => {
  assert.deepEqual(run([0, 1 / 12, 0, 10.5 / 18]).drops, { "black-pickaxe": 1 });
  assert.deepEqual(run([0, .9, 0, 0]).drops, { "black-2h-sword": 1 });
  assert.deepEqual(run([0, .9, 0, .999]).drops, { "black-warhammer": 1 });
});

test("ordinary stack quantities include both published endpoints", () => {
  for (const [id, min, max] of [["air-rune", 15, 35], ["nature-rune", 2, 7], ["shrimps", 5, 14], ["bronze-arrow", 15, 30]]) {
    const index = MAIN.findIndex(row => row[0] === id);
    assert.ok(index >= 0);
    assert.equal(run([0, .9, (index + .5) / MAIN.length, 0]).drops[id], min);
    assert.equal(run([0, .9, (index + .5) / MAIN.length, .999]).drops[id], max);
  }
});

test("one-casket dry distribution matches the exact mixture for fair coin rewards", () => {
  const dist = casketDistribution(.5);
  [7 / 24, 11 / 24, 5 / 24, 1 / 24].forEach((chance, index) => close(dist.values[index], chance));
  assert.equal(dist.expected, 1);
});

test("dry odds retain random roll counts instead of replacing them with their mean", () => {
  const p = COSMETIC_RATE, q = 1 - p;
  const result = calculateDry(3, { "mole-slippers": 2 })["mole-slippers"];
  // Three caskets yield 3..9 rolls with these exact multiplicities out of 27.
  let expectedExact = 0;
  [1, 3, 6, 7, 6, 3, 1].forEach((weight, index) => {
    const rolls = index + 3;
    expectedExact += weight / 27 * rolls * (rolls - 1) / 2 * p * p * q ** (rolls - 2);
  });
  close(result.exact, expectedExact);
  close(result.expected, 6 * p);
  const zero = calculateDry(3)["mole-slippers"];
  close(zero.exact, ((q + q * q + q ** 3) / 3) ** 3);
  assert.ok(Math.abs(zero.exact - q ** 6) > 1e-6);
});

test("combined dry result uses one exclusive collection-log event per reward roll", () => {
  const received = { "mole-slippers": 1, "black-pickaxe": 1 };
  const result = calculateDry(1, received);
  close(result.anyUnique.exact, casketDistribution(COLLECTION_RATE).values[2]);
  close(result.anyUnique.expected, 2 * COLLECTION_RATE);
  close(result["black-pickaxe"].expected, 2 * BLACK_PICKAXE_RATE);
  close(result.anyUnique.atLeastOne, 1 - casketDistribution(COLLECTION_RATE).values[0]);
});

test("repeated distributions preserve their mean and variance at a million caskets", () => {
  const p = COLLECTION_RATE, n = MAX_CASKETS;
  const dist = repeatDistribution(casketDistribution(p), n);
  close(dist.values.reduce((sum, value) => sum + value, 0), 1);
  close(dist.expected, 2 * n * p, 1e-8);
  const variance = dist.values.reduce((sum, chance, index) => sum + chance * (dist.from + index - dist.expected) ** 2, 0);
  close(variance, n * (2 * p - 4 / 3 * p * p), 1e-5);
  assert.ok(dist.values.length < 10000);
});

test("dry results normalize from zero caskets through the supported limit", () => {
  for (const n of [0, 1, 100, MAX_CASKETS]) {
    const result = calculateDry(n);
    for (const row of Object.values(result)) {
      close(row.fewer + row.exact + row.more, 1);
      assert.ok(Number.isFinite(row.expected));
      assert.ok(row.atLeastOne >= 0 && row.atLeastOne <= 1);
      if (n === 0) { assert.equal(row.exact, 1); assert.equal(row.atLeastOne, 0); }
    }
  }
});

test("seeded simulated frequencies agree with the reward-roll and unique rates", () => {
  let seed = 19;
  const rng = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
  const n = 200000, result = simulate(n, { rng });
  assert.ok(Math.abs(result.rewardRolls - 2 * n) < 8 * Math.sqrt(n * 2 / 3));
  for (const item of UNIQUE) {
    const p = rateOf(item.id), mean = 2 * n * p;
    const sigma = Math.sqrt(n * (2 * p - 4 / 3 * p * p));
    assert.ok(Math.abs((result.drops[item.id] ?? 0) - mean) < 8 * sigma, item.id);
  }
  for (const [id, count] of Object.entries(result.drops)) {
    assert.ok(ITEMS[id], id);
    assert.ok(Number.isSafeInteger(count) && count > 0);
  }
});

test("invalid counts, random values and impossible combined totals are rejected", () => {
  for (const n of [-1, .5, NaN, Infinity, "1", MAX_CASKETS + 1]) {
    assert.throws(() => simulate(n)); assert.throws(() => calculateDry(n));
  }
  for (const value of [1, -.1, NaN, null, "0"]) assert.throws(() => simulate(1, { rng: () => value }));
  assert.throws(() => simulate(1, { rng: null }));
  for (const received of [null, [], { "mole-slippers": -1 }, { "mole-slippers": .5 }, { "mole-slippers": 4 }, { "mole-slippers": 2, "black-pickaxe": 2 }]) assert.throws(() => calculateDry(1, received));
  for (const p of [-1, 2, NaN, "0"]) assert.throws(() => casketDistribution(p));
  assert.throws(() => repeatDistribution(casketDistribution(.5), -.5));
});

test("Treasure Trails navigation, shared UI, source notes and every local PNG are present", () => {
  const home = read("index.html");
  assert.match(home, /class="room-hint" id="group-treasure-trails">Treasure Trails<\/h2>/);
  assert.match(home, /href="treasure-trails\/beginner\/"/);
  const page = read("treasure-trails/beginner/index.html");
  assert.match(page, /data-title="Beginner Clue Caskets" data-icon="reward-casket-beginner"/);
  assert.match(page, /id="casket-count"/);
  assert.doesNotMatch(page, /Grubby|chest-grubby|fishing-level|members-world/);
  assert.match(read("scripts/validate.mjs"), /\.\.\/treasure-trails/);
  assert.match(read("README.md"), /treasure-trails\/beginner\/README.md/);
  const sourceManifest = JSON.parse(read("assets/treasure-trails-sources.json"));
  for (const asset of sourceManifest.files) {
    assert.equal(new URL(asset.source).hostname, "oldschool.runescape.wiki");
    assert.deepEqual([...readFileSync(new URL("../" + asset.file, import.meta.url)).subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  }
  for (const item of Object.values(ITEMS)) assert.deepEqual([...readFileSync(new URL(`../assets/items/${item.id}.png`, import.meta.url)).subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
});
