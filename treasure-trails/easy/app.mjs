import { setupClueCalculator } from "../../shared/clue-app.mjs";
import { UNIQUE, DRY_ITEMS, ITEMS, MAX_CASKETS, MAX_ROLLS, simulate } from "./simulator.mjs";
import { calculateDry } from "./dry-calc.mjs";

setupClueCalculator({
  tier: "easy", maxCaskets: MAX_CASKETS, maxRolls: MAX_ROLLS,
  items: ITEMS, unique: UNIQUE, dryItems: DRY_ITEMS, simulate, calculateDry
});
