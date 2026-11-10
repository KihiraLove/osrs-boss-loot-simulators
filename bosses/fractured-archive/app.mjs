import { setupEncounterCalculator } from "../../shared/encounter-app.mjs?v=fractured-archive";
import { byId as $, formatNumber } from "../../shared/ui.mjs";
import { FOLIO, ITEMS, ORION, PURPLE_WEIGHT, UNIQUE, parseCompletions, simulate } from "./simulator.mjs";
import { calculateDry } from "./dry-calc.mjs";

function rarity(item) {
  if (item.weight) return item.weight + "/" + PURPLE_WEIGHT + " of purple chests";
  if (item === ORION || item === FOLIO) return "1/" + Math.round(1 / item.rate) + " per eligible raid";
  return "1/20 shared fragment roll";
}

function showTotal(id, { total }) {
  $(id).textContent = formatNumber(total) + (total === 1 ? " completion" : " completions");
}

setupEncounterCalculator({
  items: ITEMS,
  unique: UNIQUE,
  dryItems: UNIQUE,
  readCounts: () => parseCompletions($("completion-string").value),
  maxReceived: ({ total }) => total,
  readOptions: () => ({ eliteCAs: $("elite-cas").checked }),
  simulate,
  calculateDry,
  rarity,
  summaryLabel: "Any purple",
  summaryKey: "anyPurple",
  onLoot: result => showTotal("loot-summary", result),
  onDry: result => showTotal("dry-summary", result),
  onMode: dry => { $("elite-cas").closest("label").hidden = dry; }
});
