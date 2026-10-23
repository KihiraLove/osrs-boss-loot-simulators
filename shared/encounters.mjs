import { binomial, convolveDistributions, validateDropCount } from "./distributions.mjs";

export function validateEncounterCounts(counts, encounters, maxEach, maxTotal = maxEach) {
  if (!counts || typeof counts !== "object" || Array.isArray(counts)) throw new TypeError("Enter encounter counts.");
  const ids = new Set(encounters.map(encounter => String(encounter.id)));
  if (Object.keys(counts).some(id => !ids.has(id))) throw new RangeError("Unknown encounter count.");
  const normalized = {};
  let total = 0;
  const groups = encounters.map(encounter => {
    const count = counts[encounter.id] ?? 0;
    validateDropCount(count, maxEach, encounter.label);
    normalized[encounter.id] = count;
    total += count;
    return { ...encounter, count };
  });
  validateDropCount(total, maxTotal, "Combined encounter count");
  return { counts: normalized, total, groups };
}

// Sum independent groups without averaging their probabilities. Equal-rate
// groups combine into one binomial, reducing convolution work for shared pets.
export function mixedBinomial(groups) {
  const trialsByRate = new Map();
  for (const { count, probability } of groups) {
    validateDropCount(count, Number.MAX_SAFE_INTEGER, "Trials");
    if (typeof probability !== "number" || !(probability >= 0 && probability <= 1)) throw new RangeError("Invalid drop rate.");
    if (count && probability) trialsByRate.set(probability, (trialsByRate.get(probability) ?? 0) + count);
  }
  let distribution = { from: 0, values: Float64Array.of(1), expected: 0 }, logNone = 0;
  for (const [probability, count] of trialsByRate) {
    distribution = convolveDistributions(distribution, binomial(count, probability));
    logNone += count * Math.log1p(-probability);
  }
  return { distribution, atLeastOne: -Math.expm1(logNone) };
}
