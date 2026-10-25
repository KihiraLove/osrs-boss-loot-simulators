import { setupClueCalculator } from "../../shared/clue-app.mjs";
import { ENCOUNTERS, UNIQUE, DRY_ITEMS, ITEMS, MAX_CASKETS, MAX_ROLLS, simulate } from "./simulator.mjs";
import { calculateDry } from "./dry-calc.mjs";

setupClueCalculator({
  tier: "elite", maxCaskets: MAX_CASKETS, maxRolls: MAX_ROLLS,
  encounters: ENCOUNTERS, readPlan: counts => counts,
  maxReceived: counts => (counts.elite + counts.mimic) * MAX_ROLLS + counts.mimic,
  items: ITEMS, unique: UNIQUE, dryItems: DRY_ITEMS, simulate, calculateDry,
  summaryLabel: "Any collection-log reward"
});
