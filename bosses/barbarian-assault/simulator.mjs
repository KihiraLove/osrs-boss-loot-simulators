import { validateDropCount } from "../../shared/distributions.mjs";
import { MAIN, DRAGON, PET, CLUE } from "./data.mjs";
export { MAIN, DRAGON, PET, CLUE, UNIQUE, DRY_ITEMS, COLLECTION_IDS, ITEMS } from "./data.mjs";

export const MAX_GAMBLES = 1_000_000;
export const PET_RATE = 1 / 1000;
export const DRAGON_RATE = 1 / 16000;
// Preserve the two dragon rates; divide the remaining main roll equally.
export const COMMON_RATE = (1 - 2 * DRAGON_RATE) / MAIN.length;
export function validateGambles(count) {
  return validateDropCount(count, MAX_GAMBLES, "Completed high gambles");
}
export function settings(options = {}) {
  if (!options || typeof options !== "object" || Array.isArray(options)) throw new TypeError("Invalid high-gamble settings.");
  const { eliteCA = false, rng = Math.random } = options;
  if (typeof eliteCA !== "boolean") throw new TypeError("Elite Combat Achievements must be enabled or disabled.");
  if (typeof rng !== "function") throw new TypeError("RNG must be a function.");
  return { eliteCA, rng, clueRate: eliteCA ? 1 / 14 : 1 / 15 };
}
export function rateOf(id, options = {}) {
  const { clueRate } = settings(options);
  if (id === PET.id) return PET_RATE;
  if (id === CLUE.id) return clueRate;
  if (DRAGON.some(row => row[0] === id)) return DRAGON_RATE;
  return MAIN.some(row => row[0] === id) ? COMMON_RATE : 0;
}

export function simulate(gambles, options = {}) {
  validateGambles(gambles);
  const { rng, clueRate } = settings(options);
  const unit = () => {
    const value = rng();
    if (typeof value !== "number" || !(value >= 0 && value < 1)) throw new RangeError("RNG must return a number in [0, 1).");
    return value;
  };
  const drops = {};
  const add = (id, count = 1) => { drops[id] = (drops[id] ?? 0) + count; };
  for (let gamble = 0; gamble < gambles; gamble++) {
    const roll = unit();
    const row = roll < 2 * DRAGON_RATE
      ? DRAGON[Math.floor(roll / DRAGON_RATE)]
      : MAIN[Math.floor(unit() * MAIN.length)];
    const [id, , min, max] = row;
    add(id, min === max ? min : min + Math.floor(unit() * (max - min + 1)));
    if (unit() < PET_RATE) add(PET.id);
    if (unit() < clueRate) add(CLUE.id);
  }
  return { gambles, drops };
}
