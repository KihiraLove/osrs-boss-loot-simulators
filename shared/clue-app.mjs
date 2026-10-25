import { setupEncounterCalculator } from "./encounter-app.mjs";
import { byId as $, formatNumber as format, createLootCard } from "./ui.mjs";

export function setupClueCalculator({ tier, maxCaskets, maxRolls, items, unique, dryItems = unique, simulate, calculateDry,
  encounters = [{ id: "caskets", inputId: "casket-count", label: "Opened " + tier + " caskets" }],
  readPlan = counts => counts.caskets, maxReceived = counts => counts.caskets * maxRolls,
  summaryLabel = "Any " + (tier === "beginner" ? "" : tier + " ") + "collection-log reward" }) {
  $("unique-grid").classList.replace("unique-grid", "loot-grid");
  setupEncounterCalculator({
    encounters, maxEach: maxCaskets, maxReceived,
    items, unique, dryItems,
    simulate: (counts, options) => simulate(readPlan(counts), options),
    calculateDry: (counts, received) => calculateDry(readPlan(counts), received),
    createUnique: (item, count) => {
      const card = createLootCard(item, count);
      card.classList.toggle("found", count > 0);
      return card;
    },
    summaryLabel, summaryKey: "anyUnique",
    onMode: dry => document.body.classList.toggle("is-dry-mode", dry),
    onLoot: result => {
      $("results-summary").textContent = format(result.caskets) + (result.caskets === 1 ? " casket opened · " : " caskets opened · ") +
        format(result.rewardRolls) + (result.rewardRolls === 1 ? " reward roll" : " reward rolls") +
        (result.mimicBonusRolls === undefined ? "" : " · " + format(result.mimicBonusRolls) + (result.mimicBonusRolls === 1 ? " Mimic bonus roll" : " Mimic bonus rolls"));
    }
  });
  const search = $("reward-search");
  if (search) {
    const filter = () => {
      const query = search.value.trim().toLowerCase();
      let visible = 0;
      for (const field of $("dry-inputs").children) {
        field.hidden = !field.textContent.toLowerCase().includes(query);
        if (!field.hidden) visible++;
      }
      $("reward-search-empty").hidden = visible !== 0;
    };
    search.addEventListener("input", event => { event.stopPropagation(); filter(); });
    $("clear-button").addEventListener("click", filter);
  }
}
