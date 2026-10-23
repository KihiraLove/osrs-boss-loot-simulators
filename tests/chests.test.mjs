import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { CHESTS, ITEMS, fishTable } from "../shared/chest-data.mjs";
import { createChestCalculator, MAX_OPENINGS } from "../shared/chest-calculator.mjs";

const calculators = Object.fromEntries(Object.entries(CHESTS).map(([id, config]) => [id, createChestCalculator(config)]));
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const close = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);
function seeded(seed = 17) {
  return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
}
function run(id, values, options = {}) {
  return calculators[id].simulate(1, { ...options, rng: () => {
    assert.ok(values.length, "Unexpected additional random roll");
    return values.shift();
  } }).drops;
}
function fishChance(node, id) {
  if (node.id) return Number(node.id === id);
  return node.entries.reduce((sum, entry) => sum + entry.weight / node.total * entry.rewards.reduce((sum, reward) => sum + fishChance(reward, id), 0), 0);
}

test("nine separate chest calculators are linked in the Chests group with local Wiki artwork", async () => {
  const home = read("index.html");
  const group = home.match(/<section class="boss-group boss-group--chests"[\s\S]*?<\/section>/)?.[0];
  assert.ok(group);
  assert.match(group, /class="room-hint" id="group-chests">Chests<\/h2>/);
  assert.equal((group.match(/class="boss-tile"/g) ?? []).length, 9);
  assert.equal(Object.keys(CHESTS).length, 9);
  assert.equal(CHESTS["larrans-chest"].title, "Larran's Chest");
  assert.match(CHESTS["larrans-chest"].wiki, /Larran%27s_big_chest$/);
  for (const config of Object.values(CHESTS)) {
    assert.ok(group.includes(`href="bosses/${config.slug}/"`), config.slug);
    const html = read(`bosses/${config.slug}/index.html`);
    assert.ok(html.includes(`data-title="${config.title}"`));
    assert.match(html, /id="mode-dry"/);
    const page = await import(`../bosses/${config.slug}/simulator.mjs`);
    const dry = await import(`../bosses/${config.slug}/dry-calc.mjs`);
    assert.equal(typeof page.simulate, "function");
    assert.equal(dry.calculateDry, page.calculateDry);
  }
  const sources = JSON.parse(read("assets/chest-sources.json"));
  assert.equal(sources.files.filter(asset => asset.kind === "chest").length, 9);
  for (const asset of sources.files) {
    assert.equal(new URL(asset.source).hostname, "oldschool.runescape.wiki");
    const png = readFileSync(new URL("../" + asset.file, import.meta.url));
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  }
  for (const item of Object.values(ITEMS)) assert.ok(existsSync(new URL(`../assets/items/${item.id}.png`, import.meta.url)), item.id);
});

test("ordinary table denominators include fish and exclude the replacing rare pre-roll", () => {
  for (const [id, total, ordinaryChance] of [
    ["larrans-chest", 60, 253 / 256], ["brimstone-chest", 60, .99],
    ["zombie-pirate-chest", 173, 274 / 275], ["elven-crystal-chest", 256, .9979],
    ["dark-chest", 600, .995], ["moon-key-chest", 107, (4999 / 5000) * (499 / 500)]
  ]) {
    const nodes = CHESTS[id].rewards({ fishingLevel: 99, members: true });
    const preRoll = nodes.at(-1), ordinary = preRoll.entries.at(-1);
    close(ordinary.weight, ordinaryChance);
    assert.equal(ordinary.rewards[0].total, total);
  }
});

test("rare rewards replace ordinary loot and retain their published chances", () => {
  assert.deepEqual(run("larrans-chest", [0]), { "dagonhai-hat": 1 });
  assert.deepEqual(run("brimstone-chest", [0]), { "broken-dragon-hasta": 1 });
  assert.deepEqual(run("dark-chest", [0]), { "shield-left-half": 1 });
  assert.deepEqual(run("elven-crystal-chest", [0]), { "uncut-onyx": 1 });
  assert.deepEqual(run("zombie-pirate-chest", [0]), { "teleport-anchoring-scroll": 1 });
  close(calculators["larrans-chest"].dropInfo("dagonhai-hat").chance, 1 / 256);
  close(calculators["brimstone-chest"].dropInfo("broken-dragon-hasta").chance, 1 / 200);
  close(calculators["brimstone-chest"].dropInfo("mystic-hat-dusk").chance, 1 / 1000);
  close(calculators["dark-chest"].dropInfo("dragon-platelegs").chance, 1 / 600);
  close(calculators["elven-crystal-chest"].dropInfo("shield-left-half").chance, .9979 / 256);
});

test("moon-key chest keeps guaranteed splinters and accounts for sequential rare failures", () => {
  assert.deepEqual(run("moon-key-chest", [0]), { "sunfire-splinters": 250, "uncut-onyx": 1 });
  assert.deepEqual(run("moon-key-chest", [.001]), { "sunfire-splinters": 250, "helmet-of-the-moon": 1 });
  assert.deepEqual(run("moon-key-chest", [.5, 0]), { "sunfire-splinters": 250, dragonstone: 1 });
  const result = calculators["moon-key-chest"].calculateDry(5000);
  close(result["uncut-onyx"].expected, 1);
  close(result["helmet-of-the-moon"].expected, 9.998);
  close(result["helmet-of-the-moon"].atLeastOne, 1 - (1 - (4999 / 5000) / 500) ** 5000);
});

test("level-dependent fish tables honor unlocks, shark subtables and integer quantity scaling", () => {
  for (const level of [1, 16, 17, 32, 33, 99]) {
    const fish = fishTable(level);
    close(fish.total, 1);
    close(["raw-manta-ray", "raw-sea-turtle", "raw-shark", "shark-lure", "raw-monkfish", "raw-swordfish", "raw-tuna", "raw-lobster"].reduce((sum, id) => sum + fishChance(fish, id), 0), 1);
    if (level < 17) close(fishChance(fish, "raw-shark") + fishChance(fish, "shark-lure") + fishChance(fish, "raw-sea-turtle"), 0);
    if (level < 33) close(fishChance(fish, "raw-manta-ray"), 0);
  }
  close(fishChance(fishTable(99), "raw-manta-ray"), 21 / 256 * 2 / 8);
  close(fishChance(fishTable(17), "raw-sea-turtle"), 1 / 256 * 2 / 8);
  assert.deepEqual(run("brimstone-chest", [.9, .9999, 0, .9, 1.1 / 171]), { "shark-lure": 162 });
  assert.deepEqual(run("larrans-chest", [.9, .9999, 0, .9, 1.1 / 171]), { "shark-lure": 243 });
});

test("Zombie Pirate ordinary loot doubles the integer base quantity", () => {
  assert.deepEqual(run("zombie-pirate-chest", [.9, 0, .1]), { "blood-rune": 66 });
  const calculator = calculators["zombie-pirate-chest"];
  close(calculator.dropInfo("teleport-anchoring-scroll").chance, 1 / 275);
  for (let n = 0; n < 100; n++) {
    const drops = calculator.simulate(1, { rng: seeded(n) }).drops;
    for (const [id, quantity] of Object.entries(drops)) if (id !== "teleport-anchoring-scroll") assert.equal(quantity % 2, 0);
  }
});

test("Elven Crystal Chest preserves multi-item bundles and key-half choices", () => {
  assert.deepEqual(run("elven-crystal-chest", [.9, 0, 0, 0]), { "uncut-dragonstone": 1, coins: 10000, "loop-half-of-key": 1 });
  assert.deepEqual(run("elven-crystal-chest", [.9, 0, 0, .9]), { "uncut-dragonstone": 1, coins: 10000, "tooth-half-of-key": 1 });
  assert.deepEqual(run("elven-crystal-chest", [.9, 184 / 256, 0, 0, 0, 0, 0]), {
    "uncut-dragonstone": 1, "cosmic-rune": 50, "chaos-rune": 50, "nature-rune": 50, "law-rune": 50, "death-rune": 50
  });
});

test("Grubby Chest repeats food rolls while retaining potion and brew bundles", () => {
  assert.deepEqual(run("grubby-chest", [.99, .99, .1, .47, .99]), {
    "saradomin-brew-2": 6, "super-restore-2": 2, "super-attack-2": 1, "super-strength-2": 1, "super-defence-2": 1, "crystal-key": 1
  });
  close(calculators["grubby-chest"].dropInfo("orange-egg-sac").chance, 1 / 25);
  close(calculators["grubby-chest"].dropInfo("blue-egg-sac").chance, 1 / 25);
  close(calculators["grubby-chest"].dropInfo("crystal-key").chance, .06);
});

test("Muddy Chest always supplies its bundle and only members receive bonuses", () => {
  const guaranteed = { "uncut-ruby": 1, "mithril-bar": 2, "law-rune": 5, "death-rune": 5, "chaos-rune": 15 };
  assert.deepEqual(run("muddy-chest", [], { members: false }), guaranteed);
  assert.deepEqual(run("muddy-chest", [0]), { ...guaranteed, "blighted-manta-ray": 25 });
  const calculator = calculators["muddy-chest"];
  close(calculator.dropInfo("larrans-key").chance, 6 / 280);
  assert.equal(calculator.calculateDry(100, {}, { members: false })["larrans-key"].expected, 0);
  assert.throws(() => calculator.calculateDry(100, { "larrans-key": 1 }, { members: false }));
});

test("Muddy dry odds count items in fixed bundles without inventing intermediate quantities", () => {
  const calculator = calculators["muddy-chest"], id = "blighted-manta-ray";
  const one = calculator.calculateDry(1, { [id]: 25 })[id];
  close(one.expected, 25 * 3 / 280);
  close(one.fewer, 277 / 280); close(one.exact, 3 / 280); close(one.more, 0);
  const partial = calculator.calculateDry(1, { [id]: 1 })[id];
  close(partial.fewer, 277 / 280); assert.equal(partial.exact, 0); close(partial.more, 3 / 280);
});

test("Sinister Chest has deterministic herb quantities and dry probabilities", () => {
  const calculator = calculators["sinister-chest"];
  const drops = calculator.simulate(10, { rng: () => { throw new Error("Guaranteed rewards cannot roll RNG"); } }).drops;
  assert.deepEqual(drops, { "grimy-ranarr-weed": 30, "grimy-harralander": 20, "grimy-irit-leaf": 10, "grimy-avantoe": 10, "grimy-kwuarm": 10, "grimy-torstol": 10 });
  for (const row of Object.values(calculator.calculateDry(10, drops))) {
    assert.equal(row.fewer, 0); assert.equal(row.exact, 1); assert.equal(row.more, 0); assert.equal(row.atLeastOne, 1);
  }
  const absent = calculator.calculateDry(10)["grimy-ranarr-weed"];
  assert.equal(absent.exact, 0); assert.equal(absent.more, 1); assert.equal(absent.expected, 30);
});

test("all chest simulations produce valid local rewards and agree with tracked dry expectations", () => {
  for (const calculator of Object.values(calculators)) {
    const n = 100000, drops = calculator.simulate(n, { rng: seeded() }).drops;
    for (const [id, quantity] of Object.entries(drops)) {
      assert.ok(ITEMS[id], id);
      assert.ok(Number.isSafeInteger(quantity) && quantity > 0);
    }
    for (const item of calculator.DRY_ITEMS) {
      const { quantity, chance } = calculator.dropInfo(item.id);
      const expected = n * quantity * chance;
      const deviation = Math.sqrt(n * chance * (1 - chance)) * quantity;
      assert.ok(Math.abs((drops[item.id] ?? 0) - expected) <= 8 * deviation + quantity, calculator.config.slug + ": " + item.id);
    }
  }
});

test("dry odds stay normalized for zero openings and at the million-opening limit", () => {
  for (const calculator of Object.values(calculators)) {
    assert.deepEqual(calculator.simulate(0).drops, {});
    for (const n of [0, MAX_OPENINGS]) for (const result of Object.values(calculator.calculateDry(n))) {
      close(result.fewer + result.exact + result.more, 1);
      assert.ok(Number.isFinite(result.expected));
      if (n === 0) { assert.equal(result.exact, 1); assert.equal(result.atLeastOne, 0); }
    }
  }
});

test("chest calculators reject invalid openings, item counts, settings and random values", () => {
  for (const calculator of Object.values(calculators)) {
    for (const n of [-1, .5, NaN, Infinity, "10", MAX_OPENINGS + 1]) {
      assert.throws(() => calculator.simulate(n)); assert.throws(() => calculator.calculateDry(n));
    }
    const id = calculator.DRY_ITEMS[0].id, quantity = calculator.dropInfo(id).quantity;
    for (const count of [-1, .5, Infinity, "1", quantity * 10 + 1]) assert.throws(() => calculator.calculateDry(10, { [id]: count }));
    assert.throws(() => calculator.calculateDry(10, null));
    if (!calculator.config.deterministic) for (const value of [1, -.1, NaN, null, "0"]) assert.throws(() => calculator.simulate(1, { rng: () => value }));
  }
  for (const fishingLevel of [0, 100, 1.5, "99"]) assert.throws(() => calculators["brimstone-chest"].simulate(1, { fishingLevel }));
  assert.throws(() => calculators["muddy-chest"].simulate(1, { members: "yes" }));
});

test("mutually exclusive rewards cannot exceed available chest rolls", () => {
  for (const calculator of Object.values(calculators)) for (const group of calculator.config.exclusive ?? []) {
    const received = Object.fromEntries(group.slice(0, 2).map(id => [id, calculator.dropInfo(id).quantity]));
    assert.throws(() => calculator.calculateDry(1, received));
  }
  assert.doesNotThrow(() => calculators["grubby-chest"].calculateDry(1, { "crystal-key": 1, "orange-egg-sac": 1 }));
});
