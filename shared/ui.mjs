const formatter = new Intl.NumberFormat("en-US");

export const byId = id => document.getElementById(id);
export const formatNumber = value => formatter.format(value);

export function itemImageUrl(id) {
  return new URL("../assets/items/" + id + ".png", import.meta.url).href;
}

export function createItemImage(item) {
  const image = document.createElement("img");
  image.src = itemImageUrl(typeof item === "string" ? item : item.id);
  image.alt = "";
  image.loading = "lazy";
  image.width = 36;
  image.height = 32;
  return image;
}

export function createItemIcon(item, { textFallback = false } = {}) {
  const wrapper = document.createElement("span");
  wrapper.className = "phosani-icon";
  const image = createItemImage(item);
  if (textFallback) {
    wrapper.title = item.name;
    image.addEventListener("error", () => {
      wrapper.textContent = item.name.split(" ").slice(0, 3)
        .map(word => word[0]).join("").toUpperCase();
    }, { once: true });
  }
  wrapper.append(image);
  return wrapper;
}

export function clearInputsOnClick(form) {
  form.addEventListener("click", event => {
    const input = event.target;
    if (input instanceof HTMLInputElement && input.type === "number" &&
        !input.disabled && !input.readOnly && input.value !== "") {
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
}

export function parseNumber(input, limit, label) {
  const raw = input.value.trim();
  const value = Number(raw);
  if (!/^(0|[1-9]\d*)$/.test(raw) || !Number.isSafeInteger(value) || value > limit) {
    throw new RangeError("Enter a non-negative whole number up to " +
      formatNumber(limit) + " for " + label + ".");
  }
  return value;
}

export function showError(message) {
  const element = byId("validation-message");
  element.textContent = message;
  element.hidden = !message;
}

export function resetPanels() {
  byId("empty-state").hidden = false;
  byId("results-content").hidden = true;
  byId("dry-empty").hidden = false;
  byId("dry-results").hidden = true;
}

export function probabilityText(probability) {
  if (probability <= 0) return "0%";
  if (probability >= 1) return "100%";
  const value = probability * 100;
  if (value < .000001) return "<0.000001%";
  if (value > 99.999999) return ">99.999999%";
  return value.toFixed(value < 1 ? 4 : 2) + "%";
}

export function createOutcome(label, probability) {
  const item = document.createElement("div");
  item.className = "dry-outcome";
  const text = document.createElement("span");
  text.textContent = label;
  const value = document.createElement("strong");
  value.textContent = probabilityText(probability);
  item.append(text, value);
  return item;
}

export function createLootCard(item, count) {
  const card = document.createElement("div");
  card.className = "loot-item";
  const frame = document.createElement("div");
  frame.className = "loot-icon";
  frame.append(createItemIcon(item));
  const detail = document.createElement("div");
  detail.className = "loot-info";
  const amount = document.createElement("strong");
  amount.textContent = "× " + formatNumber(count);
  const title = document.createElement("span");
  title.textContent = item.name;
  detail.append(amount, title);
  card.append(frame, detail);
  return card;
}

export function createUniqueCard(item, count, rarityText) {
  const card = document.createElement("div");
  card.className = "unique-card" + (count ? " found" : "");
  const name = document.createElement("strong");
  name.textContent = item.name;
  const amount = document.createElement("span");
  amount.className = "count";
  amount.textContent = "× " + formatNumber(count);
  const rarity = document.createElement("span");
  rarity.className = "rarity";
  rarity.textContent = rarityText;
  card.append(createItemIcon(item), name, amount, rarity);
  return card;
}

export function createDryCard(name, item, result, combined = false, showAtLeastOne = combined) {
  const card = document.createElement("section");
  card.className = "dry-result-card" + (combined ? " dry-total-card" : "");
  const head = document.createElement("div");
  head.className = "dry-result-heading";
  const title = document.createElement("div");
  const heading = document.createElement("h3");
  heading.textContent = name;
  const expected = document.createElement("p");
  expected.textContent = "Expected: " + result.expected.toLocaleString("en-US", { maximumFractionDigits: 2 });
  title.append(heading, expected);
  head.append(createItemIcon(item), title);
  card.append(head);
  if (showAtLeastOne) {
    const line = document.createElement("p");
    line.className = "any-drop-chance";
    const caption = document.createElement("span");
    caption.textContent = "At least one";
    const value = document.createElement("strong");
    value.textContent = probabilityText(result.atLeastOne);
    line.append(caption, value);
    card.append(line);
  }
  const odds = document.createElement("div");
  odds.className = "dry-outcomes";
  odds.append(
    createOutcome("Fewer than " + formatNumber(result.count), result.fewer),
    createOutcome("Exactly " + formatNumber(result.count), result.exact),
    createOutcome("More than " + formatNumber(result.count), result.more)
  );
  card.append(odds);
  return card;
}
