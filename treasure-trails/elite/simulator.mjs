import { createMimicCasketCalculator } from "../../shared/mimic-caskets.mjs";
import { REWARDS, MIMIC_REWARDS, MIMIC_GUARANTEED, UNIQUE, MASTER } from "./data.mjs";
export { REWARDS, MIMIC_REWARDS, MIMIC_GUARANTEED, UNIQUE, DRY_ITEMS, ITEMS, MASTER } from "./data.mjs";

export const MAX_CASKETS = 1_000_000;
export const MIN_ROLLS = 4, MAX_ROLLS = 6;
export const MASTER_RATE = 1 / 5;
export const TERTIARY = Object.freeze([{ ...MASTER, rate: MASTER_RATE }]);
export const {
  ENCOUNTERS, rateOf, mimicRateOf, COLLECTION_RATE, MIMIC_COLLECTION_RATE,
  validatePlan, simulate, calculateDry, casketDistribution
} = createMimicCasketCalculator({
  tier: "elite", rewards: REWARDS, mimicRewards: MIMIC_REWARDS,
  guaranteed: MIMIC_GUARANTEED, unique: UNIQUE, tertiary: TERTIARY,
  minRolls: MIN_ROLLS, maxRolls: MAX_ROLLS, maxCaskets: MAX_CASKETS
});
