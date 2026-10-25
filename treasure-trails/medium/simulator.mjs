import { validateDropCount } from "../../shared/distributions.mjs";
import { createRewardTable, simulateCaskets } from "../../shared/clue-caskets.mjs";
import { REWARDS, UNIQUE, MASTER } from "./data.mjs";
export { REWARDS, UNIQUE, DRY_ITEMS, ITEMS, MASTER } from "./data.mjs";

export const MAX_CASKETS = 1_000_000;
export const MIN_ROLLS = 3, MAX_ROLLS = 5;
export const MASTER_RATE = 1 / 30;
export const TERTIARY = Object.freeze([{ ...MASTER, rate: MASTER_RATE }]);
const rewardTable = createRewardTable(REWARDS);
export const rateOf = rewardTable.rateOf;
export const COLLECTION_RATE = UNIQUE.reduce((sum, item) => sum + rateOf(item.id), 0);
export function validateCaskets(count) {
  return validateDropCount(count, MAX_CASKETS, "Opened medium caskets");
}

export function simulate(caskets, { rng = Math.random } = {}) {
  return simulateCaskets(caskets, {
    minRolls: MIN_ROLLS, maxRolls: MAX_ROLLS, maxCaskets: MAX_CASKETS,
    label: "Opened medium caskets", rng, tertiary: TERTIARY,
    rollReward: rewardTable.rollReward
  });
}

