import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  REWARDS, MIMIC_REWARDS, UNIQUE, DRY_ITEMS, ITEMS, MAX_CASKETS, COLLECTION_RATE,
  MIMIC_COLLECTION_RATE, rateOf, mimicRateOf, simulate, validatePlan
} from "../treasure-trails/elite/simulator.mjs";
import { casketDistribution, calculateDry } from "../treasure-trails/elite/dry-calc.mjs";

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

test("elite and Mimic tables retain exact rates and every collection-log reward", () => {
  assert.equal(REWARDS.length, 182);
  assert.equal(MIMIC_REWARDS.length, 29);
  assert.equal(UNIQUE.length, 104);
  assert.equal(DRY_ITEMS.length, 105);
  assert.equal(new Set(UNIQUE.map(item => item.id)).size, 104);
  assert.equal(Object.keys(ITEMS).length, 191);
  close(totalRate(REWARDS), 1);
  close(totalRate(MIMIC_REWARDS), 1);
  close(rateOf("dragon-full-helm-ornament-kit"), 1 / 1275);
  close(rateOf("dark-tuxedo-jacket"), 1 / 12750);
  close(rateOf("ring-of-nature"), 2 / 29325);
  close(rateOf("3rd-age-bow"), 2 / 498525);
  close(mimicRateOf("3rd-age-bow"), 1 / 5750);
  close(mimicRateOf("3rd-age-pickaxe"), 1 / 5750);
  close(mimicRateOf("ring-of-3rd-age"), 6 / 250);
  close(MIMIC_COLLECTION_RATE, 7 / 250);
  assert.equal(rateOf("ring-of-3rd-age"), 0);
  assert.equal(rateOf("3rd-age-pickaxe"), 0);
  assert.equal(UNIQUE.filter(item => !rateOf(item.id)).length, 7);
  assert.equal(UNIQUE.filter(item => item.id.startsWith("3rd-age-")).length, 23);
});

test("separate elite and Mimic counts produce combined regular rolls and exact bonus counts", () => {
  const result = run({ elite: 1, mimic: 1 }, [
    0, first, first, first, first, 0,
    .999, first, first, first, first, first, first, .99, ticket(MIMIC_REWARDS, 0)
  ]);
  assert.equal(result.caskets, 2);
  assert.deepEqual(result.counts, { elite: 1, mimic: 1 });
  assert.equal(result.rewardRolls, 10);
  assert.equal(result.mimicBonusRolls, 1);
  assert.deepEqual(result.drops, {
    "dragon-full-helm-ornament-kit": 10, "clue-scroll-master": 1,
    "mahogany-plank": 1, "ring-of-3rd-age": 1
  });
});

test("all ordinary elite outcomes use published quantities without automatic Mimic conversions", () => {
  REWARDS.forEach((row, index) => {
    for (const endpoint of [0, .999999]) {
      const random = [0];
      for (let roll = 0; roll < 4; roll++) {
        random.push(ticket(REWARDS, index));
        if (row[2] !== row[3]) random.push(endpoint);
      }
      random.push(.99);
      const result = run({ elite: 1 }, random);
      assert.deepEqual(result.drops, { [row[0]]: 4 * row[endpoint === 0 ? 2 : 3] }, row[1]);
      assert.equal(result.mimicBonusRolls, 0);
    }
  });
});

test("Mimic bonus outcomes are exclusive, use first-attempt quantities and include the guaranteed plank", () => {
  MIMIC_REWARDS.forEach((row, index) => {
    assert.equal(row[2], row[3]);
    const result = run({ mimic: 1 }, [0, first, first, first, first, .99, ticket(MIMIC_REWARDS, index)]);
    assert.deepEqual(result.drops, { "dragon-full-helm-ornament-kit": 4, "mahogany-plank": 1, [row[0]]: row[2] }, row[1]);
  });
  assert.equal(MIMIC_REWARDS.find(row => row[0] === "death-rune")[2], 600);
  assert.equal(MIMIC_REWARDS.find(row => row[0] === "blood-rune")[2], 500);
  assert.equal(MIMIC_REWARDS.find(row => row[0] === "grimy-ranarr-weed")[2], 25);
  assert.equal(MIMIC_REWARDS.find(row => row[0] === "raw-manta-ray")[2], 15);
});

test("Mimic rare rewards can arrive alongside six matching regular rewards", () => {
  const id = "3rd-age-bow", regular = ticket(REWARDS, REWARDS.findIndex(row => row[0] === id));
  const bonus = ticket(MIMIC_REWARDS, MIMIC_REWARDS.findIndex(row => row[0] === id));
  const result = run({ mimic: 1 }, [.999, ...Array(6).fill(regular), .99, bonus]);
  assert.equal(result.drops[id], 7);
  const dry = calculateDry({ mimic: 1 }, { [id]: 7 })[id];
  const expected = rateOf(id) ** 6 / 3 * mimicRateOf(id);
  assert.ok(dry.exact > 0);
  close(dry.exact / expected, 1);
});

test("combined dry odds convolve regular rewards and Mimic bonuses without averaging rates", () => {
  const counts = { elite: 2, mimic: 3 }, total = 5, id = "3rd-age-bow";
  const result = calculateDry(counts, { [id]: 1, "ring-of-3rd-age": 1 });
  const p = rateOf(id), q = mimicRateOf(id), single = casketDistribution(p);
  const baseZero = single.values[0] ** total;
  const baseOne = total * single.values[1] * single.values[0] ** (total - 1);
  close(result[id].exact, baseOne * (1 - q) ** 3 + baseZero * 3 * q * (1 - q) ** 2);
  close(result[id].atLeastOne, 1 - baseZero * (1 - q) ** 3);
  close(result[id].expected, 5 * total * p + 3 * q);
  close(result["ring-of-3rd-age"].exact, 3 * .024 * .976 ** 2);
  close(result["ring-of-3rd-age"].expected, 3 * .024);
  const combined = calculateDry(counts).anyUnique;
  const zero = casketDistribution(COLLECTION_RATE).values[0] ** total * (1 - MIMIC_COLLECTION_RATE) ** 3;
  close(combined.exact, zero);
  close(combined.atLeastOne, 1 - zero);
  close(combined.expected, 5 * total * COLLECTION_RATE + 3 * MIMIC_COLLECTION_RATE);
  const averaged = (1 - combined.expected / (5 * total + 3)) ** (5 * total + 3);
  assert.ok(Math.abs(combined.exact - averaged) > 1e-5);
});

test("master clue rolls use both casket counts and stay outside the collection total", () => {
  const dry = calculateDry({ elite: 2, mimic: 1 }, { "clue-scroll-master": 3 });
  close(dry["clue-scroll-master"].expected, 3 / 5);
  close(dry["clue-scroll-master"].exact, (1 / 5) ** 3);
  close(dry["clue-scroll-master"].atLeastOne, 1 - (4 / 5) ** 3);
  assert.equal(dry.anyUnique.count, 0);
});

test("Mimic-only items are impossible without entered Mimic caskets", () => {
  const dry = calculateDry({ elite: 100 });
  for (const id of ["ring-of-3rd-age", "3rd-age-pickaxe", "3rd-age-druidic-staff"]) {
    assert.equal(dry[id].expected, 0);
    assert.equal(dry[id].exact, 1);
    assert.equal(dry[id].atLeastOne, 0);
    assert.throws(() => calculateDry({ elite: 100 }, { [id]: 1 }));
  }
  assert.throws(() => calculateDry({ mimic: 1 }, { "ring-of-3rd-age": 1, "3rd-age-pickaxe": 1 }));
});

test("combined elite dry odds normalize from zero through a million caskets", () => {
  for (const counts of [{}, { elite: 1 }, { mimic: 1 }, { elite: 100, mimic: 5 }, { elite: 500000, mimic: 500000 }]) {
    const n = (counts.elite ?? 0) + (counts.mimic ?? 0), m = counts.mimic ?? 0;
    const dry = calculateDry(counts);
    assert.equal(Object.keys(dry).length, 106);
    for (const row of Object.values(dry)) {
      close(row.fewer + row.exact + row.more, 1);
      assert.ok(Number.isFinite(row.expected));
      assert.ok(row.atLeastOne >= 0 && row.atLeastOne <= 1);
      if (!n) { assert.equal(row.exact, 1); assert.equal(row.atLeastOne, 0); }
    }
    close(dry.anyUnique.expected, 5 * n * COLLECTION_RATE + m * MIMIC_COLLECTION_RATE, 1e-8);
  }
});

test("seeded combined elite loot agrees with the separate regular, bonus and master rates", () => {
  let seed = 193;
  const rng = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
  const counts = { elite: 100000, mimic: 100000 }, n = 200000, m = 100000, result = simulate(counts, { rng });
  assert.ok(Math.abs(result.rewardRolls - 5 * n) < 8 * Math.sqrt(n * 2 / 3));
  assert.equal(result.mimicBonusRolls, m);
  for (const item of UNIQUE) {
    const p = rateOf(item.id), q = mimicRateOf(item.id), mean = 5 * n * p + m * q;
    const sigma = Math.sqrt(n * (5 * p - 13 / 3 * p * p) + m * q * (1 - q));
    assert.ok(Math.abs((result.drops[item.id] ?? 0) - mean) < 8 * sigma, item.id);
  }
  assert.ok(result.drops["mahogany-plank"] >= m);
  assert.ok(Math.abs(result.drops["clue-scroll-master"] - n / 5) < 8 * Math.sqrt(n * .2 * .8));
  for (const [id, count] of Object.entries(result.drops)) {
    assert.ok(ITEMS[id], id);
    assert.ok(Number.isSafeInteger(count) && count > 0);
  }
});

test("invalid elite plans, random values and impossible received totals are rejected", () => {
  for (const counts of [null, [], 1, { elite: -1 }, { mimic: .5 }, { elite: NaN }, { mimic: "1" }, { elite: MAX_CASKETS + 1 }, { elite: MAX_CASKETS, mimic: 1 }, { hard: 1 }]) {
    assert.throws(() => validatePlan(counts)); assert.throws(() => simulate(counts)); assert.throws(() => calculateDry(counts));
  }
  for (const value of [1, -.1, NaN, null, "0"]) assert.throws(() => simulate({ elite: 1 }, { rng: () => value }));
  assert.throws(() => simulate({ elite: 1 }, { rng: null }));
  for (const received of [null, [], { "dragon-full-helm-ornament-kit": -1 }, { "dragon-full-helm-ornament-kit": .5 }, { "dragon-full-helm-ornament-kit": 7 }, { "dragon-full-helm-ornament-kit": 4, "royal-crown": 4 }, { "clue-scroll-master": 2 }]) assert.throws(() => calculateDry({ mimic: 1 }, received));
});

test("elite combined page uses shared UI, two counts, source links and local images", () => {
  assert.match(read("index.html"), /href="treasure-trails\/elite\/"/);
  assert.match(read("README.md"), /treasure-trails\/elite\/README.md/);
  const page = read("treasure-trails/elite/index.html");
  assert.match(page, /data-title="Elite Clue Caskets" data-icon="reward-casket-elite"/);
  assert.match(page, /id="elite-count"/);
  assert.match(page, /id="mimic-count"/);
  assert.match(page, /Reward_casket_%28elite%29 https:\/\/oldschool.runescape.wiki\/w\/The_Mimic#Elite_drops/);
  assert.doesNotMatch(page, /Hard|hard|id="casket-count"/);
  assert.match(read("treasure-trails/elite/app.mjs"), /shared\/clue-app.mjs/);
  assert.match(read("treasure-trails/elite/simulator.mjs"), /shared\/mimic-caskets.mjs/);
  for (const id of [...Object.keys(ITEMS), "reward-casket-elite"]) {
    assert.deepEqual([...readFileSync(new URL(`../assets/items/${id}.png`, import.meta.url)).subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], id);
  }
});
