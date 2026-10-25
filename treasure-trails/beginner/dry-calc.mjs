import { calculateCasketDry, rewardRollDistribution } from "../../shared/clue-caskets.mjs";
import { UNIQUE, rateOf, MAX_CASKETS, MIN_ROLLS, MAX_ROLLS } from "./simulator.mjs";

export const casketDistribution = p => rewardRollDistribution(p, MIN_ROLLS, MAX_ROLLS);
export function calculateDry(caskets, received = {}) {
  return calculateCasketDry(caskets, received, {
    unique: UNIQUE, rateOf, minRolls: MIN_ROLLS, maxRolls: MAX_ROLLS,
    maxCaskets: MAX_CASKETS, label: "Opened beginner caskets"
  });
}
