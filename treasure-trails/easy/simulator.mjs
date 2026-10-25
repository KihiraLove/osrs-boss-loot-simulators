import { validateDropCount } from "../../shared/distributions.mjs";
import { createRewardTable, simulateCaskets } from "../../shared/clue-caskets.mjs";
import { REWARDS, UNIQUE, MASTER } from "./data.mjs";
export { REWARDS, UNIQUE, DRY_ITEMS, ITEMS, MASTER } from "./data.mjs";

export const MAX_CASKETS = 1_000_000;
export const MIN_ROLLS = 2, MAX_ROLLS = 4;
export const MASTER_RATE = 1 / 50;
export const TERTIARY = Object.freeze([{ ...MASTER, rate: MASTER_RATE }]);
const rewardTable = createRewardTable(REWARDS);
export const rateOf = rewardTable.rateOf;
export const COLLECTION_RATE = UNIQUE.reduce((sum, item) => sum + rateOf(item.id), 0);
export function validateCaskets(count) {
  return validateDropCount(count, MAX_CASKETS, "Opened easy caskets");
}

export function simulate(caskets, { rng = Math.random } = {}) {
  return simulateCaskets(caskets, {
    minRolls: MIN_ROLLS, maxRolls: MAX_ROLLS, maxCaskets: MAX_CASKETS,
    label: "Opened easy caskets", rng, tertiary: TERTIARY,
    rollReward: rewardTable.rollReward
  });
}
