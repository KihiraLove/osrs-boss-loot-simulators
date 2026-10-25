import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { REWARDS, UNIQUE, DRY_ITEMS, ITEMS, MASTER_RATE, COLLECTION_RATE, MAX_CASKETS, rateOf, simulate } from "../treasure-trails/medium/simulator.mjs";
import { casketDistribution, calculateDry } from "../treasure-trails/medium/dry-calc.mjs";
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

test("medium tables include all 115 collection-log items and complete shared rewards", () => {
  assert.equal(REWARDS.length, 192);
  assert.equal(UNIQUE.length, 115);
  assert.equal(new Set(UNIQUE.map(item => item.id)).size, 115);
  assert.equal(DRY_ITEMS.length, 116);
  assert.equal(Object.keys(ITEMS).length, 191);
  close(totalRate, 1);
  close(rateOf("ranger-boots"), 1 / 1133);
  close(rateOf("wizard-boots"), 1 / 1133);
  close(rateOf("gnomish-firelighter"), 1 / 341);
  close(rateOf("yew-comp-bow"), 1 / 341);
  close(rateOf("strength-amulet-t"), 1 / 341);
  close(rateOf("black-unicorn-mask"), 1 / 2266);
  close(rateOf("gold-elegant-skirt"), 1 / 2266);
  close(COLLECTION_RATE, 34 / 341);
  close(rateOf("master-scroll-book-empty"), 10 / 7502);
  assert.equal(REWARDS.filter(row => /-page-\d$/.test(row[0])).length, 24);
  assert.equal(REWARDS.filter(row => row[0].endsWith("-blessing")).length, 6);
});

test("medium caskets choose three, four or five rolls and allow duplicate uniques", () => {
  const index = REWARDS.findIndex(row => row[0] === "ranger-boots");
  for (const [value, rolls] of [[0, 3], [.5, 4], [.999, 5]]) {
    const result = run([value, ...Array(rolls).fill(ticket(index)), .99]);
    assert.equal(result.rewardRolls, rolls);
    assert.deepEqual(result.drops, { "ranger-boots": rolls });
  }
  assert.doesNotThrow(() => calculateDry(1, { "ranger-boots": 5 }));
});

test("every medium reward outcome uses its published quantity endpoints", () => {
  REWARDS.forEach((row, index) => {
    for (const endpoint of [0, .999999]) {
      const random = [0];
      for (let roll = 0; roll < 3; roll++) {
        random.push(ticket(index));
        if (row[2] !== row[3]) random.push(endpoint);
      }
      random.push(.99);
      assert.deepEqual(run(random).drops, { [row[0]]: 3 * row[endpoint === 0 ? 2 : 3] }, row[1]);
    }
  });
});

test("medium master clues have a separate 1/30 roll per casket", () => {
  const result = run([.999, ticket(0), ticket(0), ticket(0), ticket(0), ticket(0), MASTER_RATE - 1e-9]);
  assert.equal(result.rewardRolls, 5);
  assert.deepEqual(result.drops, { "gnomish-firelighter": 5, "clue-scroll-master": 1 });
  assert.equal(run([0, ticket(0), ticket(0), ticket(0), MASTER_RATE]).drops["clue-scroll-master"], undefined);
  const dry = calculateDry(1, { "ranger-boots": 5, "clue-scroll-master": 1 });
  close(dry["clue-scroll-master"].exact, 1 / 30);
  close(dry["clue-scroll-master"].atLeastOne, 1 / 30);
  close(dry["clue-scroll-master"].expected, 1 / 30);
  close(dry.anyUnique.expected, 4 * COLLECTION_RATE);
  close(dry.anyUnique.exact, casketDistribution(COLLECTION_RATE).values[5]);
  close(calculateDry(2, { "clue-scroll-master": 2 })["clue-scroll-master"].exact, 1 / 900);
});

test("medium dry odds retain the random number of rolls", () => {
  const fair = casketDistribution(.5);
  [7, 25, 34, 22, 7, 1].forEach((weight, index) => close(fair.values[index], weight / 96));
  close(fair.expected, 2);
  const p = rateOf("ranger-boots"), q = 1 - p;
  close(calculateDry(1, { "ranger-boots": 5 })["ranger-boots"].exact, p ** 5 / 3);
  const zero = calculateDry(2)["ranger-boots"];
  close(zero.exact, ((q ** 3 + q ** 4 + q ** 5) / 3) ** 2);
  close(zero.atLeastOne, 1 - zero.exact);
  assert.ok(Math.abs(zero.exact - q ** 8) > 1e-8);
});

test("medium dry distributions normalize through a million caskets with correct moments", () => {
  for (const n of [0, 1, 100, MAX_CASKETS]) {
    const dry = calculateDry(n);
    assert.equal(Object.keys(dry).length, 117);
    for (const row of Object.values(dry)) {
      close(row.fewer + row.exact + row.more, 1);
      assert.ok(Number.isFinite(row.expected));
      assert.ok(row.atLeastOne >= 0 && row.atLeastOne <= 1);
      if (!n) { assert.equal(row.exact, 1); assert.equal(row.atLeastOne, 0); }
    }
    close(dry.anyUnique.expected, 4 * n * COLLECTION_RATE, 1e-8);
  }
  const p = COLLECTION_RATE, n = MAX_CASKETS;
  const dist = repeatDistribution(casketDistribution(p), n);
  const variance = dist.values.reduce((sum, chance, index) => sum + chance * (dist.from + index - dist.expected) ** 2, 0);
  close(variance, n * (4 * p - 10 / 3 * p * p), 1e-5);
});

test("seeded medium loot agrees with the reward, rare and tertiary probabilities", () => {
  let seed = 101;
  const rng = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
  const n = 200000, result = simulate(n, { rng });
  assert.ok(Math.abs(result.rewardRolls - 4 * n) < 8 * Math.sqrt(n * 2 / 3));
  for (const item of UNIQUE) {
    const p = rateOf(item.id), mean = 4 * n * p;
    assert.ok(Math.abs((result.drops[item.id] ?? 0) - mean) < 8 * Math.sqrt(n * (4 * p - 10 / 3 * p * p)), item.id);
  }
  assert.ok(Math.abs(result.drops["clue-scroll-master"] - n / 30) < 8 * Math.sqrt(n * MASTER_RATE * (1 - MASTER_RATE)));
  for (const [id, count] of Object.entries(result.drops)) {
    assert.ok(ITEMS[id], id);
    assert.ok(Number.isSafeInteger(count) && count > 0);
  }
});

test("invalid medium inputs and impossible reward or master totals are rejected", () => {
  for (const n of [-1, .5, NaN, Infinity, "1", MAX_CASKETS + 1]) {
    assert.throws(() => simulate(n)); assert.throws(() => calculateDry(n));
  }
  for (const value of [1, -.1, NaN, null, "0"]) assert.throws(() => simulate(1, { rng: () => value }));
  assert.throws(() => simulate(1, { rng: null }));
  for (const received of [null, [], { "ranger-boots": -1 }, { "ranger-boots": .5 }, { "ranger-boots": 6 }, { "ranger-boots": 3, "wizard-boots": 3 }, { "clue-scroll-master": 2 }]) assert.throws(() => calculateDry(1, received));
});

test("medium caskets use shared UI, source links, navigation and local PNG sprites", () => {
  assert.match(read("index.html"), /href="treasure-trails\/medium\/"/);
  assert.match(read("README.md"), /treasure-trails\/medium\/README.md/);
  const page = read("treasure-trails/medium/index.html");
  assert.match(page, /data-title="Medium Clue Caskets" data-icon="reward-casket-medium"/);
  assert.match(page, /data-wiki-links="https:\/\/oldschool.runescape.wiki\/w\/Reward_casket_%28medium%29"/);
  assert.match(page, /id="casket-count"/);
  assert.match(page, /id="reward-search"/);
  assert.doesNotMatch(page, /Beginner|beginner|Easy|easy/);
  for (const tier of ["beginner", "easy", "medium"]) {
    assert.match(read(`treasure-trails/${tier}/app.mjs`), /shared\/clue-app.mjs/);
    assert.match(read(`treasure-trails/${tier}/dry-calc.mjs`), /shared\/clue-caskets.mjs/);
  }
  for (const id of [...Object.keys(ITEMS), "reward-casket-medium"]) {
    assert.deepEqual([...readFileSync(new URL(`../assets/items/${id}.png`, import.meta.url)).subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], id);
  }
});
