import { setupClueCalculator } from "../../shared/clue-app.mjs";
import { UNIQUE, ITEMS, MAX_CASKETS, MAX_ROLLS, simulate } from "./simulator.mjs";
import { calculateDry } from "./dry-calc.mjs";

setupClueCalculator({
  tier: "beginner", maxCaskets: MAX_CASKETS, maxRolls: MAX_ROLLS,
  items: ITEMS, unique: UNIQUE, simulate, calculateDry
});
