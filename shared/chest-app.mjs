import {
  byId as $, clearInputsOnClick, createItemIcon, createUniqueCard,
  createLootCard, createDryCard, formatNumber, parseNumber, resetPanels, showError
} from "./ui.mjs";

export function setupChestCalculator(calculator) {
  const { config, DRY_ITEMS, ITEMS, MAX_OPENINGS, dropInfo, simulate, calculateDry } = calculator;
  const form = $("simulator-form"), dryInputs = $("dry-inputs");
  let mode = "loot";
  const readOptions = () => ({ fishingLevel: config.fishing ? parseNumber($("fishing-level"), 99, "Fishing level") : 99,
    members: $("members-world")?.checked ?? true });

  for (const item of DRY_ITEMS) {
    const label = document.createElement("label");
    label.className = "dry-field";
    const name = document.createElement("span");
    name.textContent = item.name;
    const input = document.createElement("input");
    input.type = "number"; input.min = "0"; input.step = "1"; input.value = "0";
    input.inputMode = "numeric"; input.dataset.id = item.id;
    input.setAttribute("aria-label", item.name + " received");
    label.append(createItemIcon(item), name, input);
    dryInputs.append(label);
  }

  function setMode(next) {
    mode = next;
    const dry = mode === "dry";
    $("dry-fields").hidden = !dry;
    $("dry-panel").hidden = !dry;
    $("loot-panel").hidden = dry;
    if (config.fishing) $("fishing-field").hidden = dry;
    $("action-label").textContent = dry ? "Calculate chances" : "Simulate loot";
    for (const name of ["loot", "dry"]) {
      $("mode-" + name).classList.toggle("is-active", name === mode);
      $("mode-" + name).setAttribute("aria-pressed", String(name === mode));
    }
    resetPanels(); showError("");
  }
  function renderLoot(result, options) {
    const unique = $("unique-grid"), loot = $("loot-grid");
    unique.replaceChildren(); loot.replaceChildren();
    const tracked = new Set(config.dryIds);
    for (const item of DRY_ITEMS) {
      const { chance, quantity } = dropInfo(item.id, options);
      const rarity = chance === 0 ? "Members only" : chance === 1 ? "Guaranteed × " + quantity
        : (quantity > 1 ? quantity + " per reward · " : "") + "1 in " + (1 / chance).toLocaleString("en-US", { maximumFractionDigits: 2 });
      unique.append(createUniqueCard(item, result.drops[item.id] ?? 0, rarity));
    }
    for (const [id, count] of Object.entries(result.drops).filter(([id]) => !tracked.has(id))
      .sort((a, b) => b[1] - a[1] || ITEMS[a[0]].name.localeCompare(ITEMS[b[0]].name))) {
      loot.append(createLootCard(ITEMS[id], count));
    }
    $("collected-heading").hidden = loot.childElementCount === 0;
    $("results-summary").textContent = formatNumber(result.openings) + (result.openings === 1 ? " chest opened" : " chests opened");
    $("empty-state").hidden = true; $("results-content").hidden = false;
  }
  function renderDry(result) {
    const grid = $("dry-results-grid");
    grid.replaceChildren(...DRY_ITEMS.map(item => createDryCard(item.name, item, result[item.id], false, true)));
    $("dry-empty").hidden = true; $("dry-results").hidden = false;
  }

  $("mode-loot").addEventListener("click", () => setMode("loot"));
  $("mode-dry").addEventListener("click", () => setMode("dry"));
  form.addEventListener("input", () => { resetPanels(); showError(""); });
  $("clear-button").addEventListener("click", () => {
    form.reset(); $("opening-count").value = "0";
    for (const input of dryInputs.querySelectorAll("input")) input.value = "0";
    resetPanels(); showError("");
  });
  form.addEventListener("submit", event => {
    event.preventDefault(); showError("");
    try {
      const openings = parseNumber($("opening-count"), MAX_OPENINGS, "completed openings");
      // Fishing has no effect on tracked rare rewards and is hidden in dry mode.
      const options = mode === "dry" ? { members: $("members-world")?.checked ?? true } : readOptions();
      if (mode === "loot") renderLoot(simulate(openings, options), options);
      else {
        const received = {};
        for (const input of dryInputs.querySelectorAll("input")) {
          const id = input.dataset.id;
          received[id] = parseNumber(input, openings * dropInfo(id, options).quantity, ITEMS[id].name);
        }
        renderDry(calculateDry(openings, received, options));
      }
    } catch (error) {
      resetPanels(); showError(error instanceof Error ? error.message : "Could not calculate the result.");
    }
  });
  clearInputsOnClick(form);
}
