import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { REWARDS, UNIQUE, DRY_ITEMS, ITEMS, MASTER_RATE, COLLECTION_RATE, MAX_CASKETS, rateOf, simulate } from "../treasure-trails/easy/simulator.mjs";
import { casketDistribution, calculateDry } from "../treasure-trails/easy/dry-calc.mjs";
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

test("easy reward tables retain all 131 collection-log items and complete shared rewards", () => {
  assert.equal(REWARDS.length, 211);
  assert.equal(UNIQUE.length, 131);
  assert.equal(new Set(UNIQUE.map(item => item.id)).size, 131);
  assert.equal(UNIQUE.at(-1).id, "black-pickaxe");
  assert.equal(DRY_ITEMS.length, 132);
  assert.equal(Object.keys(ITEMS).length, 208);
  close(totalRate, 1);
  assert.equal(REWARDS.filter(row => /-page-\d$/.test(row[0])).length, 24);
  assert.equal(REWARDS.filter(row => row[0].endsWith("-blessing")).length, 6);
  close(rateOf("willow-comp-bow"), 1 / 360);
  close(rateOf("team-cape-zero"), 1 / 5616);
  close(rateOf("golden-chefs-hat"), 1 / 2808);
  close(rateOf("black-platebody-t"), 1 / 1404);
  close(rateOf("red-elegant-shirt"), 1 / 2808);
  close(rateOf("monks-robe-top-g"), 1 / 14040);
  close(rateOf("black-pickaxe"), 1 / 36);
  close(COLLECTION_RATE, 31 / 351 + 1 / 36);
  close(rateOf("master-scroll-book-empty"), 11 / 8712);
});

test("easy caskets choose two, three or four rolls and allow duplicate uniques", () => {
  for (const [value, rolls] of [[0, 2], [.5, 3], [.999, 4]]) {
    const result = run([value, ...Array(rolls).fill(ticket(0)), .99]);
    assert.equal(result.rewardRolls, rolls);
    assert.deepEqual(result.drops, { "willow-comp-bow": rolls });
  }
  assert.doesNotThrow(() => calculateDry(1, { "willow-comp-bow": 4 }));
});

test("every flattened outcome is reachable and uses its published quantity endpoints", () => {
  REWARDS.forEach((row, index) => {
    for (const endpoint of [0, .999999]) {
      const random = [0];
      for (let roll = 0; roll < 2; roll++) {
        random.push(ticket(index));
        if (row[2] !== row[3]) random.push(endpoint);
      }
      random.push(.99);
      assert.deepEqual(run(random).drops, { [row[0]]: 2 * row[endpoint === 0 ? 2 : 3] }, row[1]);
    }
  });
});

test("master clues roll once per casket independently of reward-roll count", () => {
  const result = run([.999, ticket(0), ticket(0), ticket(0), ticket(0), MASTER_RATE - 1e-9]);
  assert.equal(result.rewardRolls, 4);
  assert.deepEqual(result.drops, { "willow-comp-bow": 4, "clue-scroll-master": 1 });
  assert.equal(run([0, ticket(0), ticket(0), MASTER_RATE]).drops["clue-scroll-master"], undefined);
  const dry = calculateDry(1, { "willow-comp-bow": 4, "clue-scroll-master": 1 });
  close(dry["clue-scroll-master"].exact, MASTER_RATE);
  close(dry["clue-scroll-master"].atLeastOne, MASTER_RATE);
  close(dry["clue-scroll-master"].expected, MASTER_RATE);
  close(dry.anyUnique.expected, 3 * COLLECTION_RATE);
});

test("easy dry probabilities use a uniform mixture of two, three and four reward rolls", () => {
  const fair = casketDistribution(.5);
  [7, 18, 16, 6, 1].forEach((weight, index) => close(fair.values[index], weight / 48));
  close(fair.expected, 1.5);
  const p = rateOf("team-cape-i"), q = 1 - p;
  const one = calculateDry(1, { "team-cape-i": 4 })["team-cape-i"];
  close(one.exact, p ** 4 / 3);
  const zero = calculateDry(2)["team-cape-i"];
  close(zero.exact, ((q ** 2 + q ** 3 + q ** 4) / 3) ** 2);
  close(zero.atLeastOne, 1 - zero.exact);
  assert.ok(Math.abs(zero.exact - q ** 6) > 1e-9);
});

test("combined easy collection odds include common black pickaxes and exclude master clues", () => {
  const received = { "team-cape-i": 1, "black-pickaxe": 1, "clue-scroll-master": 1 };
  const dry = calculateDry(1, received);
  close(dry.anyUnique.exact, casketDistribution(COLLECTION_RATE).values[2]);
  close(dry.anyUnique.atLeastOne, 1 - casketDistribution(COLLECTION_RATE).values[0]);
  close(dry["black-pickaxe"].expected, 3 / 36);
  const master = calculateDry(2, { "clue-scroll-master": 2 })["clue-scroll-master"];
  close(master.exact, MASTER_RATE ** 2);
  close(master.more, 0);
});

test("easy dry distributions normalize through a million caskets with correct moments", () => {
  for (const n of [0, 1, 100, MAX_CASKETS]) {
    const dry = calculateDry(n);
    assert.equal(Object.keys(dry).length, 133);
    for (const row of Object.values(dry)) {
      close(row.fewer + row.exact + row.more, 1);
      assert.ok(Number.isFinite(row.expected));
      assert.ok(row.atLeastOne >= 0 && row.atLeastOne <= 1);
      if (!n) { assert.equal(row.exact, 1); assert.equal(row.atLeastOne, 0); }
    }
    close(dry.anyUnique.expected, 3 * n * COLLECTION_RATE, 1e-8);
  }
  const p = COLLECTION_RATE, n = MAX_CASKETS;
  const dist = repeatDistribution(casketDistribution(p), n);
  const variance = dist.values.reduce((sum, chance, index) => sum + chance * (dist.from + index - dist.expected) ** 2, 0);
  close(variance, n * (3 * p - 7 / 3 * p * p), 1e-5);
});

test("seeded easy loot agrees with common, rare and tertiary probabilities", () => {
  let seed = 71;
  const rng = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
  const n = 200000, result = simulate(n, { rng });
  assert.ok(Math.abs(result.rewardRolls - 3 * n) < 8 * Math.sqrt(n * 2 / 3));
  for (const item of UNIQUE) {
    const p = rateOf(item.id), mean = 3 * n * p;
    assert.ok(Math.abs((result.drops[item.id] ?? 0) - mean) < 8 * Math.sqrt(n * (3 * p - 7 / 3 * p * p)), item.id);
  }
  assert.ok(Math.abs(result.drops["clue-scroll-master"] - n * MASTER_RATE) < 8 * Math.sqrt(n * MASTER_RATE * (1 - MASTER_RATE)));
  for (const [id, count] of Object.entries(result.drops)) {
    assert.ok(ITEMS[id], id);
    assert.ok(Number.isSafeInteger(count) && count > 0);
  }
});

test("invalid easy inputs and impossible collection or master totals are rejected", () => {
  for (const n of [-1, .5, NaN, Infinity, "1", MAX_CASKETS + 1]) {
    assert.throws(() => simulate(n)); assert.throws(() => calculateDry(n));
  }
  for (const value of [1, -.1, NaN, null, "0"]) assert.throws(() => simulate(1, { rng: () => value }));
  assert.throws(() => simulate(1, { rng: null }));
  for (const received of [null, [], { "willow-comp-bow": -1 }, { "willow-comp-bow": .5 }, { "willow-comp-bow": 5 }, { "willow-comp-bow": 3, "black-pickaxe": 2 }, { "clue-scroll-master": 2 }]) assert.throws(() => calculateDry(1, received));
});

test("easy caskets use shared UI, navigation, documentation and local PNG sprites", () => {
  assert.match(read("index.html"), /href="treasure-trails\/easy\/"/);
  assert.match(read("README.md"), /treasure-trails\/easy\/README.md/);
  const page = read("treasure-trails/easy/index.html");
  assert.match(page, /data-title="Easy Clue Caskets" data-icon="reward-casket-easy"/);
  assert.match(page, /data-wiki-links="https:\/\/oldschool.runescape.wiki\/w\/Reward_casket_%28easy%29"/);
  assert.doesNotMatch(page, /Beginner|beginner|\.css"[^>]*>.*\.css"/);
  for (const tier of ["beginner", "easy"]) {
    assert.match(read(`treasure-trails/${tier}/app.mjs`), /shared\/clue-app.mjs/);
    assert.match(read(`treasure-trails/${tier}/dry-calc.mjs`), /shared\/clue-caskets.mjs/);
  }
  for (const id of [...Object.keys(ITEMS), "reward-casket-easy"]) {
    assert.deepEqual([...readFileSync(new URL(`../assets/items/${id}.png`, import.meta.url)).subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], id);
  }
});
