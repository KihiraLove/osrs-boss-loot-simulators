export const MAX_COMPLETIONS = 1_000_000;
const MAX_GROUP_SIZE = 8;
const DEATHS_TO_ZERO = 10;

export function parseCompletions(text) {
  const input = text.trim();
  const segment = /(\d+)kc(\d+)g(\d+)d\s*/iy;
  const groups = [];
  let total = 0;
  while (segment.lastIndex < input.length) {
    const match = segment.exec(input);
    if (!match) throw new RangeError("Use the format 12kc5g2d11kc2g0d for the completion string.");
    const [count, groupSize, deaths] = match.slice(1).map(Number);
    if (!Number.isSafeInteger(count) || count < 1) {
      throw new RangeError("Each segment needs at least one completion.");
    }
    if (groupSize < 1 || groupSize > MAX_GROUP_SIZE) {
      throw new RangeError("Group size must be between 1 and 8.");
    }
    if (!Number.isSafeInteger(deaths)) throw new RangeError("Enter a valid death count.");
    total += count;
    if (total > MAX_COMPLETIONS) throw new RangeError("Enter up to 1,000,000 total completions.");
    groups.push({ count, groupSize, deaths });
  }
  if (!total) throw new RangeError("Enter a completion string, such as 12kc5g2d11kc2g0d.");
  return { total, groups };
}

// Jagex's 3 November 2026 rates, using equal damage contribution before deaths.
// https://secure.runescape.com/m=news/quest-month-kick-off-tfa-tweaks--more?oldschool=1
export function purpleChance({ groupSize, deaths }) {
  const teamChance = (1 + 0.04 * Math.max(0, groupSize - 2)) / 14;
  const contribution = Math.max(0, DEATHS_TO_ZERO - deaths) / (DEATHS_TO_ZERO * groupSize);
  return teamChance * contribution;
}

export const PURPLES = [
  { id: "rondache", name: "Rondache", weight: 5 },
  { id: "zoryas-tome-uncharged", name: "Zorya's tome (uncharged)", weight: 4 },
  { id: "horn-of-bran", name: "Horn of Bran", weight: 3 },
  { id: "ascension-crossbows", name: "Ascension crossbows", weight: 2 },
  { id: "obligator-uncharged", name: "Obligator (uncharged)", weight: 1 }
];
export const PURPLE_WEIGHT = 15;
export const ORION = { id: "orion", name: "Orion", rate: 1 / 750 };
export const FOLIO = { id: "archivists-folio-inert", name: "Archivist's folio (inert)", rate: 1 / 15, oneOff: true };
export const FRAGMENT_RATE = 1 / 20;
export const FRAGMENTS = [
  { id: "fragment-of-whispering-wind", name: "Fragment of whispering wind", oneOff: true },
  { id: "fragment-of-deep-water", name: "Fragment of deep water", oneOff: true },
  { id: "fragment-of-living-earth", name: "Fragment of living earth", oneOff: true },
  { id: "fragment-of-burning-fire", name: "Fragment of burning fire", oneOff: true }
];
export const UNIQUE = [...PURPLES, ORION, FOLIO, ...FRAGMENTS];

// https://oldschool.runescape.wiki/w/Chest_(The_Fractured_Archive)#Standard_loot
const STANDARD = [
  ["battlestaff", "Battlestaff", 34, 37, 11],
  ["dragon-platelegs", "Dragon platelegs", 1, 1, 11],
  ["dragon-plateskirt", "Dragon plateskirt", 1, 1, 11],
  ["rune-kiteshield", "Rune kiteshield", 5, 7, 11],
  ["nature-rune", "Nature rune", 301, 385, 11],
  ["astral-rune", "Astral rune", 301, 385, 11],
  ["blood-rune", "Blood rune", 301, 385, 11],
  ["soul-rune", "Soul rune", 301, 380, 11],
  ["earth-rune", "Earth rune", 3009, 3662, 11],
  ["grimy-harralander", "Grimy harralander", 60, 66, 7],
  ["grimy-ranarr-weed", "Grimy ranarr weed", 18, 20, 7],
  ["grimy-toadflax", "Grimy toadflax", 24, 28, 7],
  ["snapdragon-seed", "Snapdragon seed", 3, 4, 7],
  ["kwuarm-seed", "Kwuarm seed", 7, 8, 7],
  ["snape-grass-seed", "Snape grass seed", 7, 8, 7],
  ["yew-seed", "Yew seed", 4, 5, 7],
  ["sapphire", "Sapphire", 24, 27, 11],
  ["emerald", "Emerald", 24, 26, 11],
  ["ruby", "Ruby", 23, 27, 11],
  ["diamond", "Diamond", 24, 26, 11],
  ["iron-ore", "Iron ore", 851, 915, 6],
  ["adamantite-ore", "Adamantite ore", 60, 72, 6],
  ["runite-ore", "Runite ore", 25, 26, 6],
  ["ascension-shards", "Ascension shards", 75, 82, 55],
  ["onyx-bolt-tips", "Onyx bolt tips", 50, 58, 11],
  ["earth-orb", "Earth orb", 68, 75, 11],
  ["wine-of-zamorak", "Wine of Zamorak", 32, 36, 7],
  ["desiccated-page", "Desiccated page", 30, 36, 6],
  ["aether-catalyst", "Aether catalyst", 180, 191, 6],
  ["pure-essence", "Pure essence", 1404, 1632, 6],
  ["mahogany-logs", "Mahogany logs", 140, 152, 6],
  ["dragon-arrowtips", "Dragon arrowtips", 350, 369, 6],
  ["raw-shark", "Raw shark", 80, 92, 6]
].map(([id, name, min, max, weight]) => ({ id, name, min, max, weight }));
const STANDARD_WEIGHT = STANDARD.reduce((sum, item) => sum + item.weight, 0);
const ELITE_CLUE = { id: "clue-scroll-elite", name: "Clue scroll (elite)" };
const CABBAGE = { id: "cabbage", name: "Cabbage" };
export const ITEMS = Object.fromEntries([...UNIQUE, ...STANDARD, ELITE_CLUE, CABBAGE].map(item => [item.id, item]));

function weighted(items, weight, rng) {
  let ticket = rng() * weight;
  return items.find(item => (ticket -= item.weight) < 0);
}

export function simulate({ total, groups }, { rng = Math.random, eliteCAs = false } = {}) {
  const drops = {};
  const fragmentsLeft = [...FRAGMENTS];
  const add = (item, quantity = 1) => { drops[item.id] = (drops[item.id] ?? 0) + quantity; };
  for (const group of groups) {
    const chance = purpleChance(group);
    // The cabbage threshold is unpublished. Use zero contribution as the cutoff.
    if (chance === 0) {
      add(CABBAGE, group.count);
      continue;
    }
    for (let i = 0; i < group.count; i++) {
      if (rng() < chance) {
        add(weighted(PURPLES, PURPLE_WEIGHT, rng));
      } else {
        for (let roll = 0; roll < 3; roll++) {
          const item = weighted(STANDARD, STANDARD_WEIGHT, rng);
          const quantity = item.min + Math.floor(rng() * (item.max - item.min + 1));
          add(item, rng() < 1 / 51 ? quantity * 5 : quantity);
        }
      }
      if (rng() < ORION.rate) add(ORION);
      if (rng() < (eliteCAs ? 1 / 9 : 1 / 10)) add(ELITE_CLUE);
      if (!drops[FOLIO.id] && rng() < FOLIO.rate) add(FOLIO);
      if (fragmentsLeft.length && rng() < FRAGMENT_RATE) {
        const [fragment] = fragmentsLeft.splice(Math.floor(rng() * fragmentsLeft.length), 1);
        add(fragment);
      }
    }
  }
  return { total, drops };
}
