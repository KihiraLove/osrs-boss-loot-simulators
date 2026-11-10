import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { FOLIO, FRAGMENTS, ITEMS, parseCompletions, purpleChance, simulate } from "../bosses/fractured-archive/simulator.mjs";
import { calculateDry } from "../bosses/fractured-archive/dry-calc.mjs";

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} != ${expected}`);

test("completion strings preserve each batch and reject invalid or excessive input", () => {
  const parsed = parseCompletions("12kc5g2d11kc2g0d");
  assert.deepEqual(parsed, { total: 23, groups: [
    { count: 12, groupSize: 5, deaths: 2 },
    { count: 11, groupSize: 2, deaths: 0 }
  ] });
  assert.deepEqual(parseCompletions(" 12KC5G2D 11kc2g0d "), parsed);
  for (const value of ["", "0kc2g0d", "1kc0g0d", "1kc9g0d", "1kc2g-1d", "1.5kc2g0d",
    "1kc2g", "1kc2g0d!", "1kc2g9007199254740992d", "999999kc2g0d2kc3g0d"]) {
    assert.throws(() => parseCompletions(value), RangeError, value);
  }
});

test("group size and personal deaths set the rate for each batch", () => {
  close(purpleChance({ groupSize: 1, deaths: 0 }), 1 / 14);
  close(purpleChance({ groupSize: 2, deaths: 0 }), 1 / 28);
  close(purpleChance({ groupSize: 5, deaths: 2 }), .0128);
  close(purpleChance({ groupSize: 8, deaths: 0 }), 1.24 / (14 * 8));
  assert.equal(purpleChance({ groupSize: 2, deaths: 12 }), 0);
});

test("loot rolls exclusive purples or standard chests, with eligible tertiary rewards", () => {
  const drops = simulate(parseCompletions("6kc2g0d1kc5g10d"), { rng: () => 0 }).drops;
  assert.deepEqual(drops, {
    rondache: 6, orion: 6, "clue-scroll-elite": 6, [FOLIO.id]: 1,
    ...Object.fromEntries(FRAGMENTS.map(item => [item.id, 1])), cabbage: 1
  });
  const rolls = [.5, 0, .999, 0, 0, 0, .5, 0, 0, .5, .5, .5, .5, .5];
  const standard = simulate(parseCompletions("1kc2g0d"), { rng: () => rolls.shift() });
  assert.deepEqual(standard.drops, { battlestaff: 37 * 5 + 34 * 2 });
  assert.equal(rolls.length, 0);
  for (const id of Object.keys(ITEMS)) {
    assert.ok(existsSync(new URL(`../assets/items/${id}.png`, import.meta.url)), id);
  }
});

test("dry odds combine distinct probabilities and handle capped rewards", () => {
  const result = calculateDry(parseCompletions("12kc5g2d11kc2g0d"));
  const zero = (1 - .0128) ** 12 * (1 - 1 / 28) ** 11;
  close(result.anyPurple.exact, zero);
  close(result.anyPurple.atLeastOne, 1 - zero);
  close(result.anyPurple.expected, 12 * .0128 + 11 / 28);
  close(result.rondache.expected, result.anyPurple.expected * 5 / 15);
  const one = calculateDry(parseCompletions("1kc2g0d1kc2g10d"), { rondache: 1 });
  assert.equal(one.anyPurple.count, 1);
  close(one.anyPurple.exact, 1 / 28);
  close(one.orion.atLeastOne, 1 / 750);
  close(one[FOLIO.id].atLeastOne, 1 / 15);
  close(one[FRAGMENTS[0].id].atLeastOne, 1 / 80);
  const large = calculateDry(parseCompletions("1000000kc2g0d"));
  close(large[FOLIO.id].atLeastOne, 1);
  close(large[FRAGMENTS[0].id].atLeastOne, 1);
});
