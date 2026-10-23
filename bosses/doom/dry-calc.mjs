import { binomial, convolveDistributions as convolve } from "../../shared/distributions.mjs";
import {
  SPECIAL_ITEMS, MAX_DEPTH, validatePlan, gearDenominator, domDenominator
} from "./simulator.mjs";

// A floor awards at most one equipment unique. Marginally, each eligible
// equipment item has probability 1 / gearDenominator(floor); the Dom pet
// rolls separately. Results below are per-item probabilities, NOT a joint
// probability across multiple different items.
export function uniqueDropProbability(itemId, floor) {
  const item = SPECIAL_ITEMS.find(entry => entry.id === itemId);
  if (!item) throw new RangeError("Unknown unique reward: " + itemId);
  if (!Number.isSafeInteger(floor) || floor < 1 || floor > MAX_DEPTH) {
    throw new RangeError("Invalid delve floor.");
  }
  if (floor < item.minimumDepth) return 0;
  return 1 / (item.id === "dom" ? domDenominator(floor) : gearDenominator(floor));
}

export function uniqueRollGroups(plan, itemId) {
  validatePlan(plan);
  const groups = [];
  for (let floor = 1; floor <= MAX_DEPTH; floor++) {
    const probability = uniqueDropProbability(itemId, floor);
    if (probability === 0) continue;
    const trials = plan.reduce((sum, row) => sum + (row.depth === floor ? row.count : 0), 0);
    if (trials) groups.push({ floor, trials, probability });
  }
  return groups;
}

function clampProbability(value) {
  return Math.min(1, Math.max(0, value));
}

export function chanceForCount(groups, obtained) {
  if (!Number.isSafeInteger(obtained) || obtained < 0) {
    throw new RangeError("Drop counts must be non-negative whole numbers.");
  }
  const attempts = groups.reduce((sum, group) => sum + group.trials, 0);
  const expected = groups.reduce((sum, group) => sum + group.trials * group.probability, 0);

  if (attempts === 0) {
    return { fewer: obtained > 0 ? 1 : 0, exact: obtained === 0 ? 1 : 0, more: 0, expected, attempts };
  }
  if (obtained > attempts) {
    return { fewer: 1, exact: 0, more: 0, expected, attempts };
  }

  let distribution = { from: 0, values: Float64Array.of(1), expected: 0 };
  for (const { trials, probability } of groups) {
    distribution = convolve(distribution, binomial(trials, probability, { deviations: 18, padding: 24 }));
  }

  // Small floating-point errors must not make the three outcomes fail to sum to 1.
  let fewer = 0;
  let exact = 0;
  let more = 0;
  for (let i = 0; i < distribution.values.length; i++) {
    const count = distribution.from + i;
    const chance = distribution.values[i];
    if (count < obtained) fewer += chance;
    else if (count === obtained) exact += chance;
    else more += chance;
  }
  const total = fewer + exact + more;
  fewer = clampProbability(fewer / total);
  exact = clampProbability(exact / total);
  more = clampProbability(1 - fewer - exact);
  return { fewer, exact, more, expected, attempts };
}

// For the combined result, an equipment roll has one mutually exclusive
// chance to award any eligible piece, and Dom can drop independently on the
// same floor. These are two independent Bernoulli trials, not four separate
// equipment rolls.
export function anyUniqueRollGroups(plan) {
  validatePlan(plan);
  const groups = [];
  for (let floor = 1; floor <= MAX_DEPTH; floor++) {
    const trials = plan.reduce((sum, row) => sum + (row.depth === floor ? row.count : 0), 0);
    if (!trials) continue;

    const eligibleGear = SPECIAL_ITEMS.slice(0, 3)
      .filter(item => floor >= item.minimumDepth).length;
    if (eligibleGear) {
      groups.push({ floor, type: "equipment", trials, probability: eligibleGear / gearDenominator(floor) });
    }
    if (floor >= 6) {
      groups.push({ floor, type: "pet", trials, probability: 1 / domDenominator(floor) });
    }
  }
  return groups;
}

export function calculateAnyUniqueResult(plan, counts) {
  validatePlan(plan);
  let count = 0;
  for (const item of SPECIAL_ITEMS) {
    const value = counts[item.id];
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new RangeError("Enter a non-negative whole number for " + item.name + ".");
    }
    count += value;
    if (!Number.isSafeInteger(count)) {
      throw new RangeError("Combined unique count is too large.");
    }
  }
  const groups = anyUniqueRollGroups(plan);
  const odds = chanceForCount(groups, count);
  // P(at least one) = 1 - product((1-p)^trials), computed accurately even
  // when the expected count is tiny.
  const logNone = groups.reduce(
    (sum, group) => sum + group.trials * Math.log1p(-group.probability), 0
  );
  return { count, ...odds, atLeastOne: groups.length ? -Math.expm1(logNone) : 0 };
}

export function calculateDryResults(plan, counts) {
  validatePlan(plan);
  const results = {};
  for (const item of SPECIAL_ITEMS) {
    const count = counts[item.id];
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new RangeError("Enter a non-negative whole number for " + item.name + ".");
    }
    results[item.id] = {
      item,
      count,
      ...chanceForCount(uniqueRollGroups(plan, item.id), count)
    };
  }
  results.anyUnique = calculateAnyUniqueResult(plan, counts);
  return results;
}
