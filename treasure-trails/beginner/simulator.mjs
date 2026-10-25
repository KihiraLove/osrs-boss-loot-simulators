import { validateDropCount } from "../../shared/distributions.mjs";
import { simulateCaskets } from "../../shared/clue-caskets.mjs";
import { COSMETICS, BLACK, MAIN, CABBAGE } from "./data.mjs";
export { COSMETICS, BLACK, MAIN, UNIQUE, UNIQUE as DRY_ITEMS, ITEMS } from "./data.mjs";

export const MAX_CASKETS = 1_000_000;
export const MIN_ROLLS = 1, MAX_ROLLS = 3;
export const COSMETIC_RATE = 1 / 360;
export const BLACK_PICKAXE_RATE = 11 / 8856;
export const COLLECTION_RATE = 1 / 24 + BLACK_PICKAXE_RATE;
export function validateCaskets(count) {
  return validateDropCount(count, MAX_CASKETS, "Opened beginner caskets");
}
export function rateOf(id) {
  if (id === "black-pickaxe") return BLACK_PICKAXE_RATE;
  return COSMETICS.some(item => item.id === id) ? COSMETIC_RATE : 0;
}

export function simulate(caskets, { rng = Math.random } = {}) {
  return simulateCaskets(caskets, {
    minRolls: MIN_ROLLS, maxRolls: MAX_ROLLS, maxCaskets: MAX_CASKETS,
    label: "Opened beginner caskets", rng,
    rollReward({ unit, pick, add }) {
      if (unit() < 1 / 12) {
        if (unit() < .5) add(CABBAGE);
        else {
          const item = pick(COSMETICS);
          add([item.id, item.name, 1, 1]);
        }
      } else {
        const row = pick(MAIN);
        add(row[0] === "@black" ? pick(BLACK) : row);
      }
    }
  });
}
