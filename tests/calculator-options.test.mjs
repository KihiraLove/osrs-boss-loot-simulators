import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { wealthTable } from "../shared/rare-tables.mjs";
import { simulateCombined as araxxorLoot } from "../bosses/araxxor/simulator.mjs";
import { calculateCombinedDry as araxxorDry } from "../bosses/araxxor/dry-calc.mjs";
import { simulateCombined as maggotLoot, EGG_PET_RATE } from "../bosses/maggot-king/simulator.mjs";
import { calculateCombinedDry as maggotDry } from "../bosses/maggot-king/dry-calc.mjs";
import { simulate as graardorLoot, BOSS_MAIN } from "../bosses/general-graardor/simulator.mjs";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const bosses = readdirSync(new URL("../bosses/", import.meta.url));
const close = (actual, expected, tolerance = 1e-10) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test("calculator pages share one footer and omit retired settings", () => {
  const removedIds = ["konar-task", "krystilia-task", "frozen-door", "quest-ribs", "coagulated-venom",
    "charged-ice", "awakened", "include-cape", "clue-step", "owns-barrel", "owns-tackle-box",
    "owned-gloves", "owned-torches"];
  const pages = ["bosses", "chests"].flatMap(category => readdirSync(new URL(`../${category}/`, import.meta.url), { withFileTypes: true })
    .filter(entry => entry.isDirectory()).map(entry => `${category}/${entry.name}`));
  for (const boss of pages) {
    const html = read(`${boss}/index.html`);
    for (const id of removedIds) assert.ok(!html.includes(`id="${id}"`), `${boss}: ${id}`);
    assert.doesNotMatch(html, /name="slayer-task"|\(gem table\)|50% more standard loot|Combat Achievements \(/);
    assert.doesNotMatch(html, /\\'|github\.com/);
    assert.equal((html.match(/<footer data-wiki-links="[^"]+"><\/footer>/g) ?? []).length, 1, boss);
    assert.match(html, /href="\.\.\/\.\.\/styles\.css"/);
  }
  assert.doesNotMatch(read("bosses/barrows/index.html"), /name="potential"/);
  assert.doesNotMatch(read("bosses/scurrius/index.html"), /name="encounter-mode"/);
  assert.match(read("bosses/bryophyta/index.html"), /id="kills-input"[\s\S]*?<\/label>\s*<label[^>]*id="slayer-option"><span>Of which on task/);
  assert.match(read("bosses/dagannoth-kings/index.html"), /pet-dagannoth-prime\.png/);
  assert.match(read("bosses/hespori/index.html"), /bottomless-compost-bucket\.png/);
});

test("Araxxor combines loot while keeping signature rewards limited to harvested corpses", () => {
  const result = araxxorLoot(1, 2, { rng: () => 0 });
  assert.equal(result.kills, 3);
  assert.equal(result.drops.nid, 3);
  assert.equal(result.drops["noxious-pommel"], 1);
  assert.equal(result.drops["clue-scroll-elite"], 3);
  assert.equal(result.drops["coagulated-venom"], undefined);
  assert.equal(araxxorLoot(0, 2, { rng: () => 0 }).drops["noxious-pommel"], undefined);
  assert.throws(() => araxxorDry(0, 2, { "araxyte-fang": 1 }));
  assert.throws(() => araxxorDry(1, 2, { nid: 4 }));
  assert.throws(() => araxxorLoot(-1, 2));
});

test("mixed Araxxor pet odds use both probabilities rather than an average", () => {
  const p = 1 / 3000, q = 1 / 1500;
  const pet = araxxorDry(1, 1, { nid: 1 }).nid;
  close(pet.expected, p + q);
  close(pet.fewer, (1 - p) * (1 - q));
  close(pet.exact, p * (1 - q) + q * (1 - p));
  close(pet.more, p * q);
  close(pet.atLeastOne, 1 - (1 - p) * (1 - q));
  close(araxxorDry(0, 10).nid.expected, 10 * q);
});

test("Maggot King combines stomach weapons, eggs, clues and pet outcomes", () => {
  const result = maggotLoot(1, 2, { rng: () => 0 });
  assert.equal(result.kills, 3);
  assert.equal(result.drops["elder-venator-fang"], 1);
  assert.equal(result.drops["maggot-egg-base"], 2);
  assert.equal(result.drops["maggot-marquess"], 3);
  assert.equal(result.drops["clue-scroll-elite"], 3);
  const p = 1 / 3500, q = EGG_PET_RATE;
  const pet = maggotDry(1, 1, { "maggot-marquess": 1 })["maggot-marquess"];
  close(pet.expected, p + q);
  close(pet.exact, p * (1 - q) + q * (1 - p));
  close(pet.more, p * q);
  close(pet.atLeastOne, 1 - (1 - p) * (1 - q));
  assert.throws(() => maggotDry(0, 2, { "elder-venator-fang": 1 }));
  assert.throws(() => maggotDry(1, 2, { "maggot-marquess": 4 }));
  assert.throws(() => maggotLoot(1, 0.5));
});

test("combined dry calculations remain normalized at maximum counts", () => {
  for (const calculate of [araxxorDry, maggotDry]) {
    const result = calculate(1_000_000, 1_000_000);
    for (const row of Object.values(result).filter(value => value && typeof value === "object" && "exact" in value)) {
      close(row.fewer + row.exact + row.more, 1, 1e-8);
      assert.ok(Number.isFinite(row.expected));
    }
  }
});

test("Ring of wealth removes empty gem and mega slots without boosting the rare-table entry chance", () => {
  const source = [["nothing", "Nothing", 0, 0, 1]];
  assert.equal(wealthTable(source, false, 4), source);
  const gem = wealthTable(source, true, 4, { kind: "gem" });
  close(gem.reduce((sum, row) => sum + row[4], 0), 1);
  close(gem.find(row => row[0] === "uncut-sapphire")[4], 32 / 65);
  close(gem.find(row => row[0] === "dragon-spear")[4], 1 / 65 * 3 / 15);
  assert.ok(gem.every(row => !row[0].includes("nothing")));
  const rare = wealthTable(source, true, 4);
  close(rare.find(row => row[0] === "coins")[4], 21 / 128);
  close(rare.reduce((sum, row) => sum + row[4], 0), 1);
  const nested = [["@nothing", 0, 0, 63], ["uncut-sapphire", 1, 1, 32]];
  assert.deepEqual(wealthTable(nested, true, 3, { nested: true }), [nested[1]]);
});

test("Graardor uses the four-column nested tables and applies Ring of wealth", () => {
  const total = BOSS_MAIN.reduce((sum, row) => sum + row[4], 0);
  const index = BOSS_MAIN.findIndex(row => row[0] === "@gem");
  const ticket = (BOSS_MAIN.slice(0, index).reduce((sum, row) => sum + row[4], 0) + 0.5) / total;
  const run = ringOfWealth => {
    const values = [ticket, 0];
    return graardorLoot(1, { ringOfWealth, rng: () => values.shift() ?? 0.5 });
  };
  assert.equal(run(false).drops["uncut-sapphire"], undefined);
  assert.equal(run(true).drops["uncut-sapphire"], 1);
});

test("every rare-table calculator supplies a working ring and local metadata for boosted outcomes", async () => {
  const checkDrops = (boss, simulation, result) => {
    for (const [id, count] of Object.entries(result)) {
      assert.ok(simulation.ITEMS[id], `${boss}: missing metadata for ${id}`);
      assert.ok(Number.isSafeInteger(count) && count > 0, `${boss}: invalid ${id} quantity`);
      assert.ok(existsSync(new URL(`../assets/items/${id}.png`, import.meta.url)), `${boss}: missing ${id} image`);
    }
  };
  const imbuedOnly = ["chaos-elemental", "chaos-fanatic", "crazy-archaeologist"];
  for (const boss of bosses.filter(boss => imbuedOnly.includes(boss) || read(`bosses/${boss}/index.html`).includes('id="ring-of-wealth"'))) {
    const simulation = await import(`../bosses/${boss}/simulator.mjs`);
    let seed = 4;
    const rng = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
    const count = boss === "dagannoth-kings" ? { rex: 10000, supreme: 10000, prime: 10000 } : 10000;
    const option = imbuedOnly.includes(boss) ? "imbuedRingOfWealth" : "ringOfWealth";
    const result = simulation.simulate(count, { [option]: true, rng });
    const drops = result.drops ? [result.drops] : result.kings
      ? Object.values(result.kings).map(king => king.drops) : [result.bossDrops, result.chestDrops];
    drops.forEach(drop => checkDrops(boss, simulation, drop));
    assert.throws(() => simulation.simulate(count, { [option]: "yes" }));
  }
});

test("the imbued option also applies the ordinary ring effect on Wilderness rare tables", async () => {
  for (const boss of ["chaos-elemental", "chaos-fanatic", "crazy-archaeologist"]) {
    const html = read(`bosses/${boss}/index.html`);
    assert.doesNotMatch(html, /id="ring-of-wealth"/);
    assert.match(html, /id="imbued-ring-of-wealth"/);
    const simulation = await import(`../bosses/${boss}/simulator.mjs`);
    const branch = boss === "chaos-elemental" ? "@rare" : "@gem";
    const index = simulation.MAIN.findIndex(row => row[0] === branch);
    assert.ok(index >= 0);
    const weights = simulation.MAIN.map(row => row[3]);
    const ticket = (weights.slice(0, index).reduce((a, b) => a + b, 0) + 0.5) / weights.reduce((a, b) => a + b, 0);
    const run = imbuedRingOfWealth => {
      // Skip the pickaxe/unique pre-roll, enter the rare branch, then its first slot.
      const values = boss === "chaos-elemental" ? [0.99, 0.99, ticket, 0] : [0.99, ticket, 0];
      return simulation.simulate(1, { imbuedRingOfWealth, rng: () => values.shift() ?? 0.99 });
    };
    const boostedItem = boss === "chaos-elemental" ? "nature-rune" : "uncut-sapphire";
    assert.equal(run(false).drops[boostedItem], undefined, boss);
    assert.ok(run(true).drops[boostedItem] > 0, boss);
  }
});

test("imbued rings double Wilderness clues, including Combat Achievement boosts", async () => {
  for (const [boss, achievement] of [["chaos-elemental", "eliteCAs"], ["chaos-fanatic", "hardCAs"],
    ["crazy-archaeologist", "hardCAs"], ["scorpia", "hardCAs"]]) {
    const simulation = await import(`../bosses/${boss}/simulator.mjs`);
    for (const enabled of [false, true]) {
      const options = { [achievement]: enabled };
      close(simulation.clueRate({ ...options, imbuedRingOfWealth: true }), simulation.clueRate(options) * 2);
    }
  }
  for (const boss of ["callisto-artio", "venenatis-spindel", "vetion-calvarion"]) {
    const simulation = await import(`../bosses/${boss}/simulator.mjs`);
    const baseRate = Object.values(simulation.TERTIARY)[0].find(([id]) => id.startsWith("clue-scroll-"))[1];
    const run = imbuedRingOfWealth => simulation.simulate(1, 0, { imbuedRingOfWealth, rng: () => baseRate * 1.5 });
    const clue = Object.keys(run(true).drops).find(id => id.startsWith("clue-scroll-"));
    assert.ok(clue, boss);
    assert.equal(run(false).drops[clue], undefined, boss);
    assert.throws(() => simulation.simulate(1, 0, { imbuedRingOfWealth: "yes" }));
  }
});
