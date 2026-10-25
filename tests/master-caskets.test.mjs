import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  REWARDS, MIMIC_REWARDS, UNIQUE, DRY_ITEMS, ITEMS, PET_RATE, MAX_CASKETS, COLLECTION_RATE,
  MIMIC_COLLECTION_RATE, rateOf, mimicRateOf, simulate, validatePlan
} from "../treasure-trails/master/simulator.mjs";
import { casketDistribution, calculateDry } from "../treasure-trails/master/dry-calc.mjs";

const close = (a, b, tolerance = 1e-10) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const totalRate = rows => rows.reduce((sum, row) => sum + row[4] / row[5], 0);
function ticket(rows, index) {
  return (totalRate(rows.slice(0, index)) + rows[index][4] / rows[index][5] / 2) / totalRate(rows);
}
function run(counts, values) {
  return simulate(counts, { rng: () => {
    assert.ok(values.length, "Unexpected extra random roll");
    return values.shift();
  } });
}
const first = ticket(REWARDS, 0);

test("master tables contain all 94 log rewards and exact standard, rare and bonus rates", () => {
  assert.equal(REWARDS.length, 173);
  assert.equal(MIMIC_REWARDS.length, 29);
  assert.equal(UNIQUE.length, 94);
  assert.equal(DRY_ITEMS.length, 94);
  assert.equal(new Set(UNIQUE.map(item => item.id)).size, 94);
  assert.equal(Object.keys(ITEMS).length, 174);
  close(totalRate(REWARDS), 1);
  close(totalRate(MIMIC_REWARDS), 1);
  close(rateOf("occult-ornament-kit"), 1 / 851);
  close(rateOf("dragon-kiteshield-ornament-kit"), 1 / 25530);
  close(rateOf("dragon-platebody-ornament-kit"), 1 / 12765);
  close(rateOf("armadyl-godsword-ornament-kit"), 1 / 3404);
  close(rateOf("ankou-mask"), 1 / 12765);
  close(rateOf("3rd-age-pickaxe"), 1 / 313168);
  close(mimicRateOf("3rd-age-pickaxe"), 1 / 5244);
  close(mimicRateOf("ring-of-3rd-age"), 6 / 228);
  close(MIMIC_COLLECTION_RATE, 7 / 228);
  assert.equal(rateOf("ring-of-3rd-age"), 0);
  assert.equal(UNIQUE.filter(item => item.id.startsWith("3rd-age-")).length, 23);
  assert.equal(UNIQUE.filter(item => item.id.startsWith("gilded-")).length, 20);
});

test("master god pages and extra coins include both source-table paths", () => {
  const pageRate = 22 / 23 / 29 / 24 + 1 / 23 / 37 / 24;
  close(rateOf("saradomin-page-1"), pageRate);
  const extraCoins = REWARDS.find(row => row[0] === "coins" && row[2] === 15000);
  close(extraCoins[4] / extraCoins[5], 1 / 23 * 2 / 37 * 2 / 3 + 1 / 23 / 37 * 9 / 10);
  assert.equal(REWARDS.filter(row => row[0] === "coins").length, 3);
});

test("normal masters have five to seven rolls while first-attempt Mimics have six", () => {
  for (const [value, rolls] of [[0, 5], [.5, 6], [.999, 7]]) {
    const normal = run({ master: 1 }, [value, ...Array(rolls).fill(first), .99]);
    assert.equal(normal.rewardRolls, rolls);
    assert.deepEqual(normal.drops, { "occult-ornament-kit": rolls });
    const mimic = run({ mimic: 1 }, [value, ...Array(6).fill(first), .99, ticket(MIMIC_REWARDS, 0)]);
    assert.equal(mimic.rewardRolls, 6);
    assert.equal(mimic.drops["occult-ornament-kit"], 6);
    assert.equal(mimic.drops["ring-of-3rd-age"], 1);
    assert.equal(mimic.drops["mahogany-plank"], 1);
  }
});

test("both master inputs combine loot and each casket can also roll Bloodhound", () => {
  const result = run({ master: 1, mimic: 1 }, [
    .999, ...Array(7).fill(first), 0,
    0, ...Array(6).fill(first), 0, ticket(MIMIC_REWARDS, 0)
  ]);
  assert.equal(result.caskets, 2);
  assert.equal(result.rewardRolls, 13);
  assert.equal(result.mimicBonusRolls, 1);
  assert.deepEqual(result.counts, { master: 1, mimic: 1 });
  assert.deepEqual(result.drops, { "occult-ornament-kit": 13, bloodhound: 2, "mahogany-plank": 1, "ring-of-3rd-age": 1 });
});

test("every master standard outcome retains its inclusive stack quantities", () => {
  REWARDS.forEach((row, index) => {
    for (const endpoint of [0, .999999]) {
      const random = [0];
      for (let roll = 0; roll < 5; roll++) {
        random.push(ticket(REWARDS, index));
        if (row[2] !== row[3]) random.push(endpoint);
      }
      random.push(.99);
      assert.deepEqual(run({ master: 1 }, random).drops, { [row[0]]: 5 * row[endpoint === 0 ? 2 : 3] }, row[1]);
    }
  });
});

test("all master Mimic bonuses use first-attempt probabilities and quantities", () => {
  MIMIC_REWARDS.forEach((row, index) => {
    assert.equal(row[2], row[3]);
    const result = run({ mimic: 1 }, [0, ...Array(6).fill(first), .99, ticket(MIMIC_REWARDS, index)]);
    assert.deepEqual(result.drops, { "occult-ornament-kit": 6, "mahogany-plank": 1, [row[0]]: row[2] }, row[1]);
  });
  assert.equal(MIMIC_REWARDS.find(row => row[0] === "death-rune")[2], 600);
  assert.equal(MIMIC_REWARDS.find(row => row[0] === "blood-rune")[2], 500);
  assert.equal(MIMIC_REWARDS.find(row => row[0] === "grimy-ranarr-weed")[2], 25);
  assert.equal(MIMIC_REWARDS.find(row => row[0] === "raw-manta-ray")[2], 15);
});

test("combined master dry odds retain normal roll variation and fixed Mimic rolls", () => {
  const counts = { master: 2, mimic: 3 }, id = "3rd-age-pickaxe", p = rateOf(id), q = mimicRateOf(id);
  const result = calculateDry(counts, { [id]: 1, "ring-of-3rd-age": 1 });
  const single = casketDistribution(p), fixed = (1 - p) ** 18;
  const zero = single.values[0] ** 2 * fixed;
  const one = 2 * single.values[1] * single.values[0] * fixed + single.values[0] ** 2 * 18 * p * (1 - p) ** 17;
  close(result[id].exact, one * (1 - q) ** 3 + zero * 3 * q * (1 - q) ** 2);
  close(result[id].atLeastOne, 1 - zero * (1 - q) ** 3);
  close(result[id].expected, 30 * p + 3 * q);
  close(result["ring-of-3rd-age"].expected, 3 / 38);
  close(result["ring-of-3rd-age"].exact, 3 / 38 * (37 / 38) ** 2);
  const pureMimic = calculateDry({ mimic: 1 })[id];
  close(pureMimic.exact, (1 - p) ** 6 * (1 - q));
  assert.ok(Math.abs(casketDistribution(.5).values[0] - .5 ** 6) > .001);
});

test("Bloodhound rolls from both counts and contributes to the combined collection result", () => {
  const counts = { master: 2, mimic: 1 }, result = calculateDry(counts, { bloodhound: 1 });
  close(result.bloodhound.expected, 3 / 1000);
  close(result.bloodhound.exact, 3 * PET_RATE * (1 - PET_RATE) ** 2);
  close(result.bloodhound.atLeastOne, 1 - (1 - PET_RATE) ** 3);
  assert.equal(result.anyUnique.count, 1);
  close(result.anyUnique.expected, 18 * COLLECTION_RATE + MIMIC_COLLECTION_RATE + 3 * PET_RATE);
  const baseZero = casketDistribution(COLLECTION_RATE).values[0] ** 2 * (1 - COLLECTION_RATE) ** 6;
  close(calculateDry(counts).anyUnique.exact, baseZero * (1 - MIMIC_COLLECTION_RATE) * (1 - PET_RATE) ** 3);
});

test("seven matching rare rewards and Bloodhound fit one Mimic with nonzero combined odds", () => {
  const id = "3rd-age-pickaxe", regular = ticket(REWARDS, REWARDS.findIndex(row => row[0] === id));
  const bonus = ticket(MIMIC_REWARDS, MIMIC_REWARDS.findIndex(row => row[0] === id));
  const result = run({ mimic: 1 }, [0, ...Array(6).fill(regular), 0, bonus]);
  assert.equal(result.drops[id], 7);
  assert.equal(result.drops.bloodhound, 1);
  const dry = calculateDry({ mimic: 1 }, { [id]: 7, bloodhound: 1 });
  assert.equal(dry.anyUnique.count, 8);
  assert.ok(dry[id].exact > 0);
  close(dry[id].exact / (rateOf(id) ** 6 * mimicRateOf(id)), 1);
  close(dry.anyUnique.exact / (COLLECTION_RATE ** 6 * MIMIC_COLLECTION_RATE * PET_RATE), 1);
});

test("combined master dry odds normalize through a million caskets", () => {
  for (const counts of [{}, { master: 1 }, { mimic: 1 }, { master: 100, mimic: 5 }, { master: 500000, mimic: 500000 }]) {
    const n = (counts.master ?? 0) + (counts.mimic ?? 0), m = counts.mimic ?? 0;
    const dry = calculateDry(counts);
    assert.equal(Object.keys(dry).length, 95);
    for (const row of Object.values(dry)) {
      close(row.fewer + row.exact + row.more, 1);
      assert.ok(Number.isFinite(row.expected));
      assert.ok(row.atLeastOne >= 0 && row.atLeastOne <= 1);
      if (!n) { assert.equal(row.exact, 1); assert.equal(row.atLeastOne, 0); }
    }
    close(dry.anyUnique.expected, 6 * n * COLLECTION_RATE + m * MIMIC_COLLECTION_RATE + n * PET_RATE, 1e-8);
  }
});

test("seeded master loot agrees with regular, Mimic and pet probabilities", () => {
  let seed = 227;
  const rng = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
  const a = 100000, b = 100000, n = a + b, result = simulate({ master: a, mimic: b }, { rng });
  assert.ok(Math.abs(result.rewardRolls - 6 * n) < 8 * Math.sqrt(a * 2 / 3));
  assert.equal(result.mimicBonusRolls, b);
  for (const item of UNIQUE.filter(item => item.id !== "bloodhound")) {
    const p = rateOf(item.id), q = mimicRateOf(item.id), mean = 6 * n * p + b * q;
    const sigma = Math.sqrt(a * (6 * p - 16 / 3 * p * p) + b * 6 * p * (1 - p) + b * q * (1 - q));
    assert.ok(Math.abs((result.drops[item.id] ?? 0) - mean) < 8 * sigma, item.id);
  }
  assert.ok(Math.abs(result.drops.bloodhound - n * PET_RATE) < 8 * Math.sqrt(n * PET_RATE * (1 - PET_RATE)));
  assert.ok(result.drops["mahogany-plank"] >= b);
  for (const [id, quantity] of Object.entries(result.drops)) {
    assert.ok(ITEMS[id], id);
    assert.ok(Number.isSafeInteger(quantity) && quantity > 0);
  }
});

test("invalid master plans, impossible pet totals and unavailable Mimic rewards are rejected", () => {
  for (const counts of [null, [], 1, { master: -1 }, { mimic: .5 }, { master: NaN }, { mimic: "1" }, { master: MAX_CASKETS + 1 }, { master: MAX_CASKETS, mimic: 1 }, { elite: 1 }]) {
    assert.throws(() => validatePlan(counts)); assert.throws(() => simulate(counts)); assert.throws(() => calculateDry(counts));
  }
  for (const value of [1, -.1, NaN, null, "0"]) assert.throws(() => simulate({ master: 1 }, { rng: () => value }));
  assert.throws(() => simulate({ master: 1 }, { rng: null }));
  for (const received of [null, [], { bloodhound: 2 }, { "occult-ornament-kit": -1 }, { "occult-ornament-kit": .5 }, { "occult-ornament-kit": 7 }, { "3rd-age-pickaxe": 8 }]) assert.throws(() => calculateDry({ mimic: 1 }, received));
  assert.throws(() => calculateDry({ master: 100 }, { "ring-of-3rd-age": 1 }));
  assert.throws(() => calculateDry({ mimic: 1 }, { "occult-ornament-kit": 6, "ring-of-3rd-age": 1, "gilded-boots": 1, bloodhound: 1 }));
});

test("master caskets share the Mimic module, navigation, footer and local images", () => {
  assert.match(read("index.html"), /href="treasure-trails\/master\/"/);
  assert.match(read("README.md"), /treasure-trails\/master\/README.md/);
  const page = read("treasure-trails/master/index.html");
  assert.match(page, /data-title="Master Clue Caskets" data-icon="reward-casket-master"/);
  assert.match(page, /id="master-count"/);
  assert.match(page, /id="mimic-count"/);
  assert.match(page, /Reward_casket_%28master%29 https:\/\/oldschool.runescape.wiki\/w\/The_Mimic#Master_drops/);
  assert.doesNotMatch(page, /Elite|elite|id="casket-count"/);
  for (const tier of ["master", "elite"]) assert.match(read(`treasure-trails/${tier}/simulator.mjs`), /shared\/mimic-caskets.mjs/);
  for (const id of [...Object.keys(ITEMS), "reward-casket-master"]) {
    assert.deepEqual([...readFileSync(new URL(`../assets/items/${id}.png`, import.meta.url)).subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], id);
  }
});
