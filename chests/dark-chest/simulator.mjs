import { CHESTS } from "../../shared/chest-data.mjs";
import { createChestCalculator } from "../../shared/chest-calculator.mjs";

export const calculator = createChestCalculator(CHESTS["dark-chest"]);
export const { config, ITEMS, DRY_ITEMS, MAX_OPENINGS, dropInfo, simulate, calculateDry } = calculator;
