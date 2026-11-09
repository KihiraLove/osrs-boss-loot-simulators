import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  MAIN, DRAGON, PET, CLUE, UNIQUE, DRY_ITEMS, COLLECTION_IDS, ITEMS,
  MAX_GAMBLES, PET_RATE, DRAGON_RATE, COMMON_RATE, rateOf, simulate
} from "../bosses/barbarian-assault/simulator.mjs";
import { calculateDry } from "../bosses/barbarian-assault/dry-calc.mjs";

const close = (a, b, tolerance = 1e-10) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
function run(values, options = {}) {
  const result = simulate(1, { ...options, rng: () => {
    assert.ok(values.length, "Unexpected extra random roll");
    return values.shift();
  } });
  assert.equal(values.length, 0, "Unused random rolls");
  return result.drops;
}

test("high gambles retain every main reward and the three collection-log rewards", () => {
  assert.equal(MAIN.length, 32);
  assert.equal(DRAGON.length, 2);
  assert.equal(Object.keys(ITEMS).length, 36);
  assert.equal(UNIQUE.length, 4);
  assert.equal(DRY_ITEMS.length, 5);
  assert.deepEqual(COLLECTION_IDS, [PET.id, "granite-helm", "dragon-chainbody"]);
  assert.equal(ITEMS["ranarr-weed"].name, "Ranarr weed");
  assert.equal(ITEMS["grimy-ranarr-weed"], undefined);
  assert.equal(rateOf("fighter-torso"), 0);
});

test("exclusive main rewards normalize while preserving both published dragon rates", () => {
  close(MAIN.length * COMMON_RATE + DRAGON.length * DRAGON_RATE, 1);
  for (const [id] of MAIN) close(rateOf(id), COMMON_RATE);
  for (const [id] of DRAGON) close(rateOf(id), 1 / 16000);
  close(rateOf(PET.id), 1 / 1000);
  close(rateOf(CLUE.id), 1 / 15);
  close(rateOf(CLUE.id, { eliteCA: true }), 1 / 14);
  for (const id of [...COLLECTION_IDS, "dragon-med-helm"]) close(rateOf(id, { eliteCA: true }), rateOf(id));
});

test("dragon armour replaces one common reward and respects its probability boundaries", () => {
  assert.deepEqual(run([0, .99, .99]), { "dragon-med-helm": 1 });
  assert.deepEqual(run([DRAGON_RATE * .999, .99, .99]), { "dragon-med-helm": 1 });
  assert.deepEqual(run([DRAGON_RATE, .99, .99]), { "dragon-chainbody": 1 });
  assert.deepEqual(run([DRAGON_RATE * 1.999, .99, .99]), { "dragon-chainbody": 1 });
  assert.deepEqual(run([DRAGON_RATE * 2, 0, 0, .99, .99]), { "ranarr-weed": 20 });
});

test("every common outcome is reachable with both inclusive quantity endpoints", () => {
  for (const [index, [id, , min, max]] of MAIN.entries()) {
    const rolls = quantity => [.5, (index + .5) / MAIN.length, ...(min === max ? [] : [quantity]), .99, .99];
    assert.deepEqual(run(rolls(0)), { [id]: min });
    assert.deepEqual(run(rolls(.999999)), { [id]: max });
  }
});

test("pets and clues roll independently in addition to a main reward", () => {
  assert.deepEqual(run([0, 0, 0]), { "dragon-med-helm": 1, [PET.id]: 1, [CLUE.id]: 1 });
  assert.deepEqual(run([DRAGON_RATE, 0, 0]), { "dragon-chainbody": 1, [PET.id]: 1, [CLUE.id]: 1 });
  assert.deepEqual(run([0, PET_RATE, 1 / 15]), { "dragon-med-helm": 1 });
  assert.deepEqual(run([0, 0, .99]), { "dragon-med-helm": 1, [PET.id]: 1 });
  assert.deepEqual(run([0, .99, 0]), { "dragon-med-helm": 1, [CLUE.id]: 1 });
});

test("elite Combat Achievements affect only the separate elite clue roll", () => {
  const clueRoll = (1 / 15 + 1 / 14) / 2;
  assert.deepEqual(run([0, .99, clueRoll]), { "dragon-med-helm": 1 });
  assert.deepEqual(run([0, .99, clueRoll], { eliteCA: true }), { "dragon-med-helm": 1, [CLUE.id]: 1 });
  const normal = calculateDry(100), elite = calculateDry(100, {}, { eliteCA: true });
  close(normal[CLUE.id].expected, 100 / 15);
  close(elite[CLUE.id].expected, 100 / 14);
  for (const id of [...UNIQUE.map(item => item.id), "anyUnique"]) assert.deepEqual(elite[id], normal[id]);
});

test("individual dry odds use the number of completed gambles", () => {
  const n = 8, p = DRAGON_RATE;
  const result = calculateDry(n, { "dragon-chainbody": 2 });
  close(result["dragon-chainbody"].exact, n * (n - 1) / 2 * p ** 2 * (1 - p) ** (n - 2));
  close(result["dragon-chainbody"].expected, n * p);
  close(result[PET.id].exact, (1 - PET_RATE) ** n);
  close(result[PET.id].atLeastOne, 1 - (1 - PET_RATE) ** n);
});

test("combined collection odds allow a main collection reward and pet from the same gamble", () => {
  const main = COMMON_RATE + DRAGON_RATE, pet = PET_RATE;
  const none = calculateDry(1).anyUnique;
  close(none.exact, (1 - main) * (1 - pet));
  close(none.atLeastOne, 1 - (1 - main) * (1 - pet));
  close(none.expected, main + pet);
  const one = calculateDry(1, { "granite-helm": 1 }).anyUnique;
  close(one.exact, main * (1 - pet) + pet * (1 - main));
  const two = calculateDry(1, { "granite-helm": 1, [PET.id]: 1 }).anyUnique;
  close(two.exact, main * pet);
  close(two.more, 0);
});

test("dragon med helms and clues do not inflate the combined collection result", () => {
  const result = calculateDry(5, { "dragon-med-helm": 1, [CLUE.id]: 3 });
  assert.deepEqual(result.anyUnique, calculateDry(5).anyUnique);
  assert.throws(() => calculateDry(1, { "granite-helm": 1, "dragon-chainbody": 1 }), /Combined armour/);
  assert.throws(() => calculateDry(1, { "dragon-med-helm": 1, "dragon-chainbody": 1 }), /Combined armour/);
  assert.doesNotThrow(() => calculateDry(1, { "dragon-chainbody": 1, [PET.id]: 1, [CLUE.id]: 1 }));
});

test("dry odds remain finite and normalized from zero through a million gambles", () => {
  for (const n of [0, 1, 100, MAX_GAMBLES]) {
    const result = calculateDry(n);
    assert.equal(Object.keys(result).length, 6);
    for (const row of Object.values(result)) {
      close(row.fewer + row.exact + row.more, 1);
      assert.ok(Number.isFinite(row.expected));
      assert.ok(row.atLeastOne >= 0 && row.atLeastOne <= 1);
      if (n === 0) { assert.equal(row.exact, 1); assert.equal(row.atLeastOne, 0); }
    }
  }
  assert.deepEqual(simulate(0), { gambles: 0, drops: {} });
});

test("seeded simulation agrees with the rare reward and clue probabilities", () => {
  let seed = 43;
  const rng = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
  const n = 200000, result = simulate(n, { rng, eliteCA: true });
  assert.equal(result.gambles, n);
  for (const item of DRY_ITEMS) {
    const p = rateOf(item.id, { eliteCA: true });
    const expected = n * p, sigma = Math.sqrt(n * p * (1 - p));
    assert.ok(Math.abs((result.drops[item.id] ?? 0) - expected) < 8 * sigma, item.id);
  }
  for (const [id, count] of Object.entries(result.drops)) {
    assert.ok(ITEMS[id], id);
    assert.ok(Number.isSafeInteger(count) && count > 0);
  }
});

test("invalid counts, settings, random values and received totals are rejected", () => {
  for (const n of [-1, .5, NaN, Infinity, "1", MAX_GAMBLES + 1]) {
    assert.throws(() => simulate(n));
    assert.throws(() => calculateDry(n));
  }
  for (const options of [null, [], { eliteCA: 1 }, { rng: null }]) {
    assert.throws(() => simulate(1, options));
    assert.throws(() => calculateDry(1, {}, options));
  }
  for (const value of [1, -.1, NaN, null, "0"]) assert.throws(() => simulate(1, { rng: () => value }));
  for (const received of [null, [], { [PET.id]: -1 }, { [PET.id]: .5 }, { [CLUE.id]: 2 }]) assert.throws(() => calculateDry(1, received));
});

test("Other bosses navigation uses the local Penance Queen pet icon and shared page modules", () => {
  const home = read("index.html"), page = read("bosses/barbarian-assault/index.html");
  const other = home.match(/<section[^>]*boss-group--other[\s\S]*?<\/section>/)?.[0];
  assert.ok(other);
  assert.match(other, /href="bosses\/barbarian-assault\/"/);
  assert.match(other, /src="\.\/assets\/items\/pet-penance-queen.png"/);
  assert.match(page, /data-simulator-header data-title="Barbarian Assault" data-icon="pet-penance-queen"/);
  assert.match(page, /href="\.\.\/\.\.\/styles.css"/);
  assert.match(page, /id="gamble-count"/);
  assert.match(page, /id="elite-combat-achievements"/);
  assert.match(page, /data-wiki-links="https:\/\/oldschool.runescape.wiki\/w\/Barbarian_Assault\/Gambles#High_Gambles"/);
  assert.match(read("README.md"), /bosses\/barbarian-assault\/README.md/);
  const app = read("bosses/barbarian-assault/app.mjs");
  assert.match(app, /setupEncounterCalculator/);
  assert.match(app, /createCompactUniqueCard/);
});

test("every high-gamble sprite is a local PNG and new downloads retain Wiki attribution", () => {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  for (const item of Object.values(ITEMS)) {
    const file = new URL(`../assets/items/${item.id}.png`, import.meta.url);
    assert.deepEqual([...readFileSync(file).subarray(0, 8)], signature, item.id);
  }
  const manifest = JSON.parse(read("assets/barbarian-assault-sources.json"));
  assert.equal(manifest.files.length, 6);
  for (const asset of manifest.files) {
    assert.equal(new URL(asset.source).hostname, "oldschool.runescape.wiki");
    assert.deepEqual([...readFileSync(new URL("../" + asset.file, import.meta.url)).subarray(0, 8)], signature);
  }
});
