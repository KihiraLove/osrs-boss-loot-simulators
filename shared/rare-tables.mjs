// Ring effects apply inside the shared tables, never to boss-specific uniques.
// https://oldschool.runescape.wiki/w/Rare_drop_table
const tables = {
  rare: [
    ["nature-rune",3],["adamant-javelin",2],["death-rune",2],["law-rune",2],
    ["rune-arrow",2],["steel-arrow",2],["rune-2h-sword",3],["rune-battleaxe",3],
    ["rune-sq-shield",2],["dragon-med-helm",1],["rune-kiteshield",1],["coins",21],
    ["loop-half-of-key",20],["tooth-half-of-key",20],["runite-bar",5],
    ["dragonstone",2],["silver-ore",2],["@gem",20],["@mega",15]
  ],
  gem: [
    ["uncut-sapphire",32],["uncut-emerald",16],["uncut-ruby",8],["nature-talisman",3],
    ["uncut-diamond",2],["rune-javelin",1],["loop-half-of-key",1],
    ["tooth-half-of-key",1],["@mega",1]
  ],
  mega: [["rune-spear",8],["shield-left-half",4],["dragon-spear",3]]
};

function probabilities(kind) {
  const result = new Map(), rows = tables[kind];
  const total = rows.reduce((sum, row) => sum + row[1], 0);
  for (const [id, weight] of rows) {
    if (id.startsWith("@")) {
      for (const [nested, probability] of probabilities(id.slice(1))) {
        result.set(nested, (result.get(nested) ?? 0) + weight / total * probability);
      }
    } else result.set(id, (result.get(id) ?? 0) + weight / total);
  }
  return result;
}

const boosted = { rare: probabilities("rare"), gem: probabilities("gem") };
const quantities = { "nature-rune": 67, "adamant-javelin": 20, "death-rune": 45, "law-rune": 45,
  "rune-arrow": 42, "steel-arrow": 150, coins: 3000, "silver-ore": 100, "rune-javelin": 5 };
export const RARE_ITEM_METADATA = Object.fromEntries([...boosted.rare.keys()].map(id => [id, {
  id, name: id[0].toUpperCase() + id.slice(1).replaceAll("-", " ")
}]));
const cache = new WeakMap();

export function wealthTable(rows, enabled, weightIndex, { kind = "rare", reciprocal = false, nested = false } = {}) {
  if (!enabled) return rows;
  const key = [weightIndex, kind, reciprocal, nested].join(":");
  if (!cache.has(rows)) cache.set(rows, new Map());
  const cached = cache.get(rows);
  if (!cached.has(key)) {
    const originals = new Map(rows.map(row => [row[0], row]));
    const values = nested
      ? rows.filter(row => row[0] !== "nothing" && row[0] !== "@nothing")
      : [...boosted[kind]].map(([id, probability]) => {
        const quantity = quantities[id] ?? 1;
        const result = originals.has(id) ? [...originals.get(id)]
          : weightIndex === 4 ? [id, RARE_ITEM_METADATA[id].name, quantity, quantity, 0] : [id, quantity, 0];
        result[weightIndex] = reciprocal ? 1 / probability : probability;
        return result;
      });
    cached.set(key, values);
  }
  return cached.get(key);
}
