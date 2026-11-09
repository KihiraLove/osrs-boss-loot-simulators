import { setupEncounterCalculator } from "../../shared/encounter-app.mjs";
import { byId as $, formatNumber, createCompactUniqueCard } from "../../shared/ui.mjs";
import { UNIQUE, DRY_ITEMS, ITEMS, MAX_GAMBLES, simulate } from "./simulator.mjs";
import { calculateDry } from "./dry-calc.mjs";

$("unique-grid").classList.replace("unique-grid", "loot-grid");
setupEncounterCalculator({
  encounters: [{ id: "gambles", inputId: "gamble-count", label: "Completed high gambles" }],
  maxEach: MAX_GAMBLES, maxReceived: counts => counts.gambles,
  items: ITEMS, unique: UNIQUE, dryItems: DRY_ITEMS,
  readOptions: () => ({ eliteCA: $("elite-combat-achievements").checked }),
  simulate: (counts, options) => simulate(counts.gambles, options),
  calculateDry: (counts, received, options) => calculateDry(counts.gambles, received, options),
  createUnique: createCompactUniqueCard,
  summaryLabel: "Any collection-log reward", summaryKey: "anyUnique",
  onLoot: result => {
    $("results-summary").textContent = formatNumber(result.gambles) + (result.gambles === 1 ? " high gamble" : " high gambles");
  }
});
