import { binomial, distributionOdds, validateDropCount } from "../../shared/distributions.mjs";
import { mixedBinomial } from "../../shared/encounters.mjs";
import { FOLIO, FRAGMENTS, FRAGMENT_RATE, ORION, PURPLES, PURPLE_WEIGHT, purpleChance } from "./simulator.mjs";

export function calculateDry({ total, groups }, received = {}) {
  const result = { total };
  const purpleGroups = groups.map(group => ({ count: group.count, probability: purpleChance(group) }));
  const eligible = purpleGroups.reduce((sum, group) => sum + (group.probability > 0 ? group.count : 0), 0);
  const stats = (item, { distribution, atLeastOne }) => {
    const count = validateDropCount(received[item.id] ?? 0, item.oneOff ? 1 : total, item.name);
    return { ...distributionOdds(distribution, count), atLeastOne };
  };

  let purpleCount = 0;
  for (const item of PURPLES) {
    const probability = item.weight / PURPLE_WEIGHT;
    result[item.id] = stats(item, mixedBinomial(purpleGroups.map(group => ({
      count: group.count,
      probability: group.probability * probability
    }))));
    purpleCount += result[item.id].count;
  }
  validateDropCount(purpleCount, total, "Total purple drops");
  const anyPurple = mixedBinomial(purpleGroups);
  result.anyPurple = { ...distributionOdds(anyPurple.distribution, purpleCount), atLeastOne: anyPurple.atLeastOne };
  result[ORION.id] = stats(ORION, mixedBinomial([{ count: eligible, probability: ORION.rate }]));

  const folioChance = -Math.expm1(eligible * Math.log1p(-FOLIO.rate));
  result[FOLIO.id] = stats(FOLIO, { distribution: binomial(1, folioChance), atLeastOne: folioChance });

  // Each successful roll unlocks a different fragment. The expected number
  // of fragments, capped at four, splits evenly among the four types.
  const fragmentRolls = binomial(eligible, FRAGMENT_RATE);
  const expectedFragments = distributionOdds(fragmentRolls, 0, count => Math.min(count, FRAGMENTS.length)).expected;
  const fragmentChance = Math.min(1, expectedFragments / FRAGMENTS.length);
  const fragment = { distribution: binomial(1, fragmentChance), atLeastOne: fragmentChance };
  for (const item of FRAGMENTS) result[item.id] = stats(item, fragment);
  return result;
}
