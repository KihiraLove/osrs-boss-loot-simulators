import { binomial, distributionOdds, validateDropCount } from "../../shared/distributions.mjs";
import { mixedBinomial } from "../../shared/encounters.mjs";
import { DRY_ITEMS, COLLECTION_IDS, PET, PET_RATE, rateOf, settings, validateGambles } from "./simulator.mjs";

export function calculateDry(gambles, received = {}, options = {}) {
  validateGambles(gambles);
  settings(options);
  if (!received || typeof received !== "object" || Array.isArray(received)) throw new TypeError("Enter received reward counts.");
  const result = {};
  for (const item of DRY_ITEMS) {
    const count = received[item.id] ?? 0, p = rateOf(item.id, options);
    validateDropCount(count, gambles, item.name);
    result[item.id] = {
      ...distributionOdds(binomial(gambles, p), count),
      atLeastOne: gambles ? -Math.expm1(gambles * Math.log1p(-p)) : 0
    };
  }
  const mainCount = (received["granite-helm"] ?? 0) + (received["dragon-chainbody"] ?? 0) + (received["dragon-med-helm"] ?? 0);
  validateDropCount(mainCount, gambles, "Combined armour rewards");
  const collectionCount = COLLECTION_IDS.reduce((total, id) => total + (received[id] ?? 0), 0);
  const mixed = mixedBinomial([
    { count: gambles, probability: COLLECTION_IDS.filter(id => id !== PET.id).reduce((total, id) => total + rateOf(id), 0) },
    { count: gambles, probability: PET_RATE }
  ]);
  result.anyUnique = { ...distributionOdds(mixed.distribution, collectionCount), atLeastOne: gambles ? mixed.atLeastOne : 0 };
  return result;
}
