import { createRewardTable, simulateCaskets, calculateCasketDry, rewardRollDistribution } from "./clue-caskets.mjs";
import { validateEncounterCounts } from "./encounters.mjs";

export function createMimicCasketCalculator({ tier, rewards, mimicRewards, guaranteed, unique, tertiary = [], minRolls, maxRolls, mimicRolls, maxCaskets }) {
  const title = tier[0].toUpperCase() + tier.slice(1);
  const ENCOUNTERS = Object.freeze([
    { id: tier, inputId: tier + "-count", label: title + " caskets" },
    { id: "mimic", inputId: "mimic-count", label: title + " Mimic caskets" }
  ]);
  const regular = createRewardTable(rewards), bonus = createRewardTable(mimicRewards);
  const validatePlan = counts => validateEncounterCounts(counts, ENCOUNTERS, maxCaskets);
  const label = "Opened " + tier + " caskets";
  return {
    ENCOUNTERS, validatePlan, rateOf: regular.rateOf, mimicRateOf: bonus.rateOf,
    COLLECTION_RATE: unique.reduce((sum, item) => sum + regular.rateOf(item.id), 0),
    MIMIC_COLLECTION_RATE: unique.reduce((sum, item) => sum + bonus.rateOf(item.id), 0),
    casketDistribution: p => rewardRollDistribution(p, minRolls, maxRolls),
    simulate(counts, { rng = Math.random } = {}) {
      const plan = validatePlan(counts);
      const options = { minRolls, maxRolls, maxCaskets, label, rng, tertiary, rollReward: regular.rollReward };
      const normal = simulateCaskets(plan.counts[tier], options);
      const mimic = simulateCaskets(plan.counts.mimic, {
        ...options, minRolls: mimicRolls ?? minRolls, maxRolls: mimicRolls ?? maxRolls,
        bonusReward(context) {
          context.add(guaranteed);
          bonus.rollReward(context);
        }
      });
      const drops = { ...normal.drops };
      for (const [id, quantity] of Object.entries(mimic.drops)) drops[id] = (drops[id] ?? 0) + quantity;
      return { counts: plan.counts, caskets: plan.total, rewardRolls: normal.rewardRolls + mimic.rewardRolls, mimicBonusRolls: plan.counts.mimic, drops };
    },
    calculateDry(counts, received = {}) {
      const plan = validatePlan(counts);
      return calculateCasketDry(plan.total, received, {
        unique, rateOf: regular.rateOf, minRolls, maxRolls, maxCaskets, label, tertiary,
        bonusCount: plan.counts.mimic, bonusRateOf: bonus.rateOf,
        rollGroups: mimicRolls === undefined ? undefined : [
          { count: plan.counts[tier], minRolls, maxRolls },
          { count: plan.counts.mimic, minRolls: mimicRolls, maxRolls: mimicRolls }
        ]
      });
    }
  };
}
