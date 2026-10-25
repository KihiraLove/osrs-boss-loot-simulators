import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { REWARDS, UNIQUE, DRY_ITEMS, ITEMS, MASTER_RATE, COLLECTION_RATE, MAX_CASKETS, rateOf, simulate } from "../treasure-trails/hard/simulator.mjs";
import { casketDistribution, calculateDry } from "../treasure-trails/hard/dry-calc.mjs";
import { repeatDistribution } from "../shared/distributions.mjs";

const close = (a, b, tolerance = 1e-10) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const totalRate = REWARDS.reduce((sum, row) => sum + row[4] / row[5], 0);
function ticket(index) {
  return (REWARDS.slice(0, index).reduce((sum, row) => sum + row[4] / row[5], 0) + REWARDS[index][4] / REWARDS[index][5] / 2) / totalRate;
}
function run(values) {
  return simulate(1, { rng: () => {
    assert.ok(values.length, "Unexpected extra random roll");
    return values.shift();
  } });
}

test("hard tables include all 158 collection-log items and exact unrounded rates", () => {
  assert.equal(REWARDS.length, 233);
  assert.equal(UNIQUE.length, 158);
  assert.equal(new Set(UNIQUE.map(item => item.id)).size, 158);
  assert.equal(DRY_ITEMS.length, 159);
  assert.equal(Object.keys(ITEMS).length, 234);
  close(totalRate, 1);
  close(rateOf("magic-comp-bow"), 12 / 3250);
  close(rateOf("robin-hood-hat"), 1 / 1625);
  close(rateOf("rune-platebody-h1"), 1 / 8125);
  close(rateOf("armadyl-dhide-shield"), 1 / 9750);
  close(rateOf("rune-full-helm"), 12 / 325);
  close(rateOf("magic-longbow"), 108 / 3250);
  close(rateOf("nardah-teleport"), 21 / 7150);
  close(COLLECTION_RATE, 653 / 8125);
  assert.equal(UNIQUE.filter(item => item.id.startsWith("gilded-")).length, 11);
  assert.equal(UNIQUE.filter(item => item.id.startsWith("3rd-age-")).length, 13);
  close(UNIQUE.filter(item => item.id.startsWith("gilded-")).reduce((sum, item) => sum + rateOf(item.id), 0), 1 / 3250);
  close(UNIQUE.filter(item => item.id.startsWith("3rd-age-")).reduce((sum, item) => sum + rateOf(item.id), 0), 1 / 16250);
  assert.equal(REWARDS.filter(row => /-page-\d$/.test(row[0])).length, 24);
});

test("hard caskets choose four, five or six rolls and allow duplicate mega-rares", () => {
  const index = REWARDS.findIndex(row => row[0] === "3rd-age-amulet");
  for (const [value, rolls] of [[0, 4], [.5, 5], [.999, 6]]) {
    const result = run([value, ...Array(rolls).fill(ticket(index)), .99]);
    assert.equal(result.rewardRolls, rolls);
    assert.deepEqual(result.drops, { "3rd-age-amulet": rolls });
  }
  assert.doesNotThrow(() => calculateDry(1, { "3rd-age-amulet": 6 }));
});

test("every hard reward outcome uses its published quantity endpoints", () => {
  REWARDS.forEach((row, index) => {
    for (const endpoint of [0, .999999]) {
      const random = [0];
      for (let roll = 0; roll < 4; roll++) {
        random.push(ticket(index));
        if (row[2] !== row[3]) random.push(endpoint);
      }
      random.push(.99);
      const expected = { [row[0]]: 4 * row[endpoint === 0 ? 2 : 3] };
      for (const extra of row[6] ?? []) expected[extra[0]] = 4 * extra[2];
      assert.deepEqual(run(random).drops, expected, row[1]);
    }
  });
});

test("mega-rare combat potions arrive together on one reward roll", () => {
  const combat = REWARDS.findIndex(row => row[0] === "super-attack-4");
  const result = run([0, ticket(combat), ticket(0), ticket(0), ticket(0), .99]);
  assert.equal(result.rewardRolls, 4);
  assert.deepEqual(result.drops, { "super-attack-4": 5, "super-strength-4": 5, "super-defence-4": 5, "magic-comp-bow": 3 });
  for (const id of ["super-attack-4", "super-strength-4", "super-defence-4"]) close(rateOf(id), 1 / 16250);
  assert.equal(REWARDS.filter(row => ["super-strength-4", "super-defence-4"].includes(row[0])).length, 0);
});

test("hard master clues have a separate 1/15 roll per casket", () => {
  const result = run([.999, ...Array(6).fill(ticket(0)), MASTER_RATE - 1e-9]);
  assert.equal(result.rewardRolls, 6);
  assert.deepEqual(result.drops, { "magic-comp-bow": 6, "clue-scroll-master": 1 });
  assert.equal(run([0, ...Array(4).fill(ticket(0)), MASTER_RATE]).drops["clue-scroll-master"], undefined);
  const dry = calculateDry(1, { "robin-hood-hat": 6, "clue-scroll-master": 1 });
  close(dry["clue-scroll-master"].exact, 1 / 15);
  close(dry["clue-scroll-master"].atLeastOne, 1 / 15);
  close(dry["clue-scroll-master"].expected, 1 / 15);
  close(dry.anyUnique.expected, 5 * COLLECTION_RATE);
  close(dry.anyUnique.exact, casketDistribution(COLLECTION_RATE).values[6]);
});

test("hard dry odds retain the random roll count and ultra-rare probabilities", () => {
  const fair = casketDistribution(.5);
  [7, 32, 59, 56, 29, 8, 1].forEach((weight, index) => close(fair.values[index], weight / 192));
  close(fair.expected, 2.5);
  const p = rateOf("robin-hood-hat"), q = 1 - p;
  close(calculateDry(1, { "robin-hood-hat": 6 })["robin-hood-hat"].exact, p ** 6 / 3);
  const zero = calculateDry(2)["robin-hood-hat"];
  close(zero.exact, ((q ** 4 + q ** 5 + q ** 6) / 3) ** 2);
  close(zero.atLeastOne, 1 - zero.exact);
  assert.ok(Math.abs(zero.exact - q ** 10) > 1e-8);
  const rare = calculateDry(1)["3rd-age-amulet"];
  close(rare.atLeastOne, 1 - ((1 - 1 / 211250) ** 4 + (1 - 1 / 211250) ** 5 + (1 - 1 / 211250) ** 6) / 3);
  const six = calculateDry(1, { "3rd-age-amulet": 6 })["3rd-age-amulet"];
  assert.ok(six.exact > 0);
  close(six.exact / ((1 / 211250) ** 6 / 3), 1);
  const twelve = calculateDry(2, { "3rd-age-amulet": 12 })["3rd-age-amulet"];
  assert.ok(twelve.exact > 0);
  close(twelve.exact / ((1 / 211250) ** 12 / 9), 1);
});

test("hard dry distributions normalize through a million caskets with correct moments", () => {
  for (const n of [0, 1, 100, MAX_CASKETS]) {
    const dry = calculateDry(n);
    assert.equal(Object.keys(dry).length, 160);
    for (const row of Object.values(dry)) {
      close(row.fewer + row.exact + row.more, 1);
      assert.ok(Number.isFinite(row.expected));
      assert.ok(row.atLeastOne >= 0 && row.atLeastOne <= 1);
      if (!n) { assert.equal(row.exact, 1); assert.equal(row.atLeastOne, 0); }
    }
    close(dry.anyUnique.expected, 5 * n * COLLECTION_RATE, 1e-8);
  }
  const p = COLLECTION_RATE, n = MAX_CASKETS;
  const dist = repeatDistribution(casketDistribution(p), n);
  const variance = dist.values.reduce((sum, chance, index) => sum + chance * (dist.from + index - dist.expected) ** 2, 0);
  close(variance, n * (5 * p - 13 / 3 * p * p), 1e-5);
});

test("seeded hard loot agrees with ordinary, unique, mega-rare and master rates", () => {
  let seed = 149;
  const rng = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
  const n = 200000, result = simulate(n, { rng });
  assert.ok(Math.abs(result.rewardRolls - 5 * n) < 8 * Math.sqrt(n * 2 / 3));
  for (const item of UNIQUE) {
    const p = rateOf(item.id), mean = 5 * n * p;
    assert.ok(Math.abs((result.drops[item.id] ?? 0) - mean) < 8 * Math.sqrt(n * (5 * p - 13 / 3 * p * p)), item.id);
  }
  assert.ok(Math.abs(result.drops["clue-scroll-master"] - n / 15) < 8 * Math.sqrt(n * MASTER_RATE * (1 - MASTER_RATE)));
  assert.equal(result.drops["super-attack-4"], result.drops["super-strength-4"]);
  assert.equal(result.drops["super-attack-4"], result.drops["super-defence-4"]);
  for (const [id, count] of Object.entries(result.drops)) {
    assert.ok(ITEMS[id], id);
    assert.ok(Number.isSafeInteger(count) && count > 0);
  }
});

test("invalid hard counts and impossible collection or master totals are rejected", () => {
  for (const n of [-1, .5, NaN, Infinity, "1", MAX_CASKETS + 1]) {
    assert.throws(() => simulate(n)); assert.throws(() => calculateDry(n));
  }
  for (const value of [1, -.1, NaN, null, "0"]) assert.throws(() => simulate(1, { rng: () => value }));
  assert.throws(() => simulate(1, { rng: null }));
  for (const received of [null, [], { "robin-hood-hat": -1 }, { "robin-hood-hat": .5 }, { "robin-hood-hat": 7 }, { "robin-hood-hat": 4, "3rd-age-amulet": 3 }, { "clue-scroll-master": 2 }]) assert.throws(() => calculateDry(1, received));
});

test("hard caskets use shared UI, navigation, documentation and local PNG sprites", () => {
  assert.match(read("index.html"), /href="treasure-trails\/hard\/"/);
  assert.match(read("README.md"), /treasure-trails\/hard\/README.md/);
  const page = read("treasure-trails/hard/index.html");
  assert.match(page, /data-title="Hard Clue Caskets" data-icon="reward-casket-hard"/);
  assert.match(page, /data-wiki-links="https:\/\/oldschool.runescape.wiki\/w\/Reward_casket_%28hard%29"/);
  assert.match(page, /id="casket-count"/);
  assert.match(page, /id="reward-search"/);
  assert.doesNotMatch(page, /Beginner|beginner|Easy|easy|Medium|medium/);
  assert.match(read("treasure-trails/hard/app.mjs"), /shared\/clue-app.mjs/);
  assert.match(read("treasure-trails/hard/dry-calc.mjs"), /shared\/clue-caskets.mjs/);
  for (const id of [...Object.keys(ITEMS), "reward-casket-hard"]) {
    assert.deepEqual([...readFileSync(new URL(`../assets/items/${id}.png`, import.meta.url)).subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], id);
  }
});
