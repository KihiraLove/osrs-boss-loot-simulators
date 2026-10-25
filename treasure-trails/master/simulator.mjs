import { createMimicCasketCalculator } from "../../shared/mimic-caskets.mjs";
import { REWARDS, MIMIC_REWARDS, MIMIC_GUARANTEED, UNIQUE, BLOODHOUND } from "./data.mjs";
export { REWARDS, MIMIC_REWARDS, MIMIC_GUARANTEED, UNIQUE, DRY_ITEMS, ITEMS, BLOODHOUND } from "./data.mjs";

export const MAX_CASKETS = 1_000_000;
export const MIN_ROLLS = 5, MAX_ROLLS = 7;
export const MIMIC_ROLLS = 6;
export const PET_RATE = 1 / 1000;
export const TERTIARY = Object.freeze([{ ...BLOODHOUND, rate: PET_RATE, collection: true }]);
export const {
  ENCOUNTERS, rateOf, mimicRateOf, COLLECTION_RATE, MIMIC_COLLECTION_RATE,
  validatePlan, simulate, calculateDry, casketDistribution
} = createMimicCasketCalculator({
  tier: "master", rewards: REWARDS, mimicRewards: MIMIC_REWARDS,
  guaranteed: MIMIC_GUARANTEED, unique: UNIQUE, tertiary: TERTIARY,
  minRolls: MIN_ROLLS, maxRolls: MAX_ROLLS, mimicRolls: MIMIC_ROLLS, maxCaskets: MAX_CASKETS
});
