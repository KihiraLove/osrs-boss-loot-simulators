// Reward tables transcribed from the linked OSRS Wiki pages, 23 October 2026.
// Weights within a table are conditional on reaching that table.
export const ITEMS = {};
export const itemId = name => name.toLowerCase().replaceAll("'", "").replace(/[^a-z0-9]+/g, "-").replace(/-$/, "");

function item(name, min = 1, max = min, scale = 1) {
  const id = itemId(name);
  ITEMS[id] ??= { id, name };
  return { id, min, max, scale };
}
function table(rows, rolls = 1) {
  const entries = rows.map(([weight, ...rewards]) => ({ weight, rewards }));
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (!(total > 0) || entries.some(entry => entry.weight < 0)) throw new RangeError("Invalid chest table");
  return { entries, total, rolls };
}
// A successful pre-roll replaces the ordinary reward. Probabilities here are
// absolute; sequential pre-rolls must include the preceding failures.
function preRoll(rareRows, ordinary) {
  return table([...rareRows, [1 - rareRows.reduce((sum, row) => sum + row[0], 0), ordinary]]);
}
const row = (weight, name, min = 1, max = min, scale = 1) => [weight, item(name, min, max, scale)];
const ids = names => names.map(itemId);
const wiki = page => "https://oldschool.runescape.wiki/w/" + page;

// OSRS Wiki Module:Slayer chest fish chart and Module:Skilling success chart.
// The Wiki estimates these level-dependent chances from observed openings.
export function fishTable(level, scale = 1) {
  const interpolate = (low, high) => Math.max(0, Math.min(1,
    (Math.floor(low * (99 - level) / 98 + high * (level - 1) / 98 + .5) + 1) / 256));
  let remaining = 1;
  const rows = [];
  for (const [name, low, high, min, max] of [
    ["Raw manta ray", -10, 20, 80, 160],
    ["Raw sea turtle", -10, 50, 80, 200],
    ["Raw shark", -60, 40, 80, 250],
    ["Raw monkfish", 0, 170, 100, 300],
    ["Raw swordfish", 25, 200, 100, 300],
    ["Raw tuna", 160, 0, 100, 350]
  ]) {
    const chance = interpolate(low, high);
    const reward = ["Raw manta ray", "Raw sea turtle", "Raw shark"].includes(name)
      ? table([row(2, name, min, max, scale), row(3, "Raw shark", 80, 250, scale), row(3, "Shark lure", 80, 250, scale * 2)])
      : item(name, min, max, scale);
    rows.push([remaining * chance, reward]);
    remaining *= 1 - chance;
  }
  rows.push(row(remaining, "Raw lobster", 100, 350, scale));
  return table(rows);
}

const dagonhai = ["Dagon'hai hat", "Dagon'hai robe top", "Dagon'hai robe bottom"];
const brimstoneRares = ["Broken dragon hasta", "Mystic hat (dusk)", "Mystic robe top (dusk)", "Mystic robe bottom (dusk)", "Mystic gloves (dusk)", "Mystic boots (dusk)"];
const dragonstoneArmour = ["Dragonstone full helm", "Dragonstone platebody", "Dragonstone platelegs", "Dragonstone gauntlets", "Dragonstone boots"];
const darkRares = ["Shield left half", "Dragon plateskirt", "Dragon platelegs"];
const muddyBonus = ["Blighted manta ray", "Blighted karambwan", "Blighted ancient ice sack", "Blighted anglerfish", "Blighted super restore(4)", "Larran's key"];
const sinisterHerbs = ["Grimy ranarr weed", "Grimy harralander", "Grimy irit leaf", "Grimy avantoe", "Grimy kwuarm", "Grimy torstol"];

export const CHESTS = {
  "larrans-chest": {
    title: "Larran's Chest", wiki: wiki("Larran%27s_big_chest"), fishing: true,
    dryIds: ids(dagonhai), exclusive: [ids(dagonhai)],
    note: "Uses Larran's big chest rewards. Fishing level affects the raw fish received.",
    rewards: ({ fishingLevel }) => [preRoll(dagonhai.map(name => row(1 / 256, name)), table([
      row(5, "Uncut diamond", 35, 45), row(5, "Uncut ruby", 35, 45), row(5, "Coal", 450, 650),
      row(4, "Gold ore", 150, 250), row(4, "Dragon arrowtips", 100, 250), row(3, "Coins", 75000, 175000),
      row(3, "Iron ore", 500, 650), row(3, "Rune full helm", 3, 5), row(3, "Rune platebody", 2, 3), row(3, "Rune platelegs", 2, 3), row(3, "Pure essence", 4500, 7500),
      row(2, "Runite ore", 15, 20), row(2, "Steel bar", 350, 550), row(2, "Magic logs", 180, 220), row(2, "Dragon dart tip", 80, 200),
      row(1, "Palm tree seed", 3, 5), row(1, "Magic seed", 3, 4), row(1, "Celastrus seed", 3, 5), row(1, "Dragonfruit tree seed", 3, 5), row(1, "Redwood tree seed"),
      row(1, "Torstol seed", 4, 6), row(1, "Snapdragon seed", 4, 6), row(1, "Ranarr seed", 4, 6), [3, fishTable(fishingLevel, 1.5)]
    ]))]
  },
  "zombie-pirate-chest": {
    title: "Zombie Pirate Chest", wiki: wiki("Zombie_Pirate%27s_Locker"),
    dryIds: ids(["Teleport anchoring scroll"]),
    note: "Opens the Zombie Pirate's Locker. Ordinary loot quantities are doubled; teleport anchoring scrolls are not.",
    rewards: () => [preRoll([row(1 / 275, "Teleport anchoring scroll")], table([
      row(4, "Blood rune", 30, 60, 2), row(4, "Death rune", 30, 90, 2), row(4, "Chaos rune", 30, 90, 2), row(4, "Mind rune", 30, 90, 2),
      row(8, "Battlestaff", 1, 3, 2),
      ...["Adamant platebody", "Rune med helm", "Rune warhammer", "Rune battleaxe", "Rune longsword", "Rune sword", "Rune mace"].map(name => row(6, name, 2)),
      ...["Dragon dagger", "Dragon longsword", "Dragon scimitar"].map(name => row(1, name, 2)),
      row(12, "Blighted ancient ice sack", 10, 30, 2),
      ...["Blighted anglerfish", "Blighted manta ray", "Blighted karambwan"].map(name => row(12, name, 5, 15, 2)),
      row(12, "Blighted super restore(4)", 1, 3, 2), row(12, "Coins", 1000, 8000, 2), row(12, "Steel cannonball", 20, 100, 2), row(12, "Gold ore", 5, 15, 2), row(8, "Adamant seeds", 5, 10, 2)
    ]))]
  },
  "brimstone-chest": {
    title: "Brimstone Chest", wiki: wiki("Brimstone_chest"), fishing: true,
    dryIds: ids(brimstoneRares), exclusive: [ids(brimstoneRares)],
    note: "Rare rewards replace the main roll. Fishing level affects the raw fish received.",
    rewards: ({ fishingLevel }) => [preRoll(brimstoneRares.map((name, index) => row(index === 0 ? 1 / 200 : 1 / 1000, name)), table([
      row(5, "Uncut diamond", 25, 35), row(5, "Uncut ruby", 25, 35), row(5, "Coal", 300, 500), row(5, "Coins", 50000, 150000),
      row(4, "Gold ore", 100, 200), row(4, "Dragon arrowtips", 50, 200), row(3, "Iron ore", 350, 500), row(3, "Rune full helm", 2, 4), row(3, "Rune platebody", 1, 2), row(3, "Rune platelegs", 1, 2),
      row(2, "Runite ore", 10, 15), row(2, "Steel bar", 300, 500), row(2, "Magic logs", 120, 160), row(2, "Dragon dart tip", 40, 160),
      row(1, "Palm tree seed", 2, 4), row(1, "Magic seed", 2, 3), row(1, "Celastrus seed", 2, 4), row(1, "Dragonfruit tree seed", 2, 4), row(1, "Redwood tree seed"),
      row(1, "Torstol seed", 3, 5), row(1, "Snapdragon seed", 3, 5), row(1, "Ranarr seed", 3, 5), row(1, "Pure essence", 3000, 6000), [3, fishTable(fishingLevel)]
    ]))]
  },
  "muddy-chest": {
    title: "Muddy Chest", wiki: wiki("Muddy_chest"), members: true,
    dryIds: ids(muddyBonus), exclusive: [ids(muddyBonus)],
    note: "Every opening gives a ruby, two mithril bars and runes. Members worlds also have a 3/40 chance of a bonus reward. Enter individual item quantities in the dry calculator.",
    rewards: ({ members }) => [item("Uncut ruby"), item("Mithril bar", 2), item("Law rune", 5), item("Death rune", 5), item("Chaos rune", 15),
      ...(members ? [table([row(3, muddyBonus[0], 25), row(3, muddyBonus[1], 25), row(3, muddyBonus[2], 25), row(3, muddyBonus[3], 15), row(3, muddyBonus[4], 3), row(6, muddyBonus[5]), [259]])] : [])]
  },
  "elven-crystal-chest": {
    title: "Elven Crystal Chest", wiki: wiki("Elven_Crystal_Chest"),
    dryIds: ids(["Uncut onyx", ...dragonstoneArmour, "Shield left half"]),
    exclusive: [ids(["Uncut onyx", ...dragonstoneArmour, "Shield left half"])],
    note: "Uses an enhanced crystal key. Ordinary reward bundles include an uncut dragonstone.",
    rewards: () => [preRoll([row(1 / 10000, "Uncut onyx"), ...dragonstoneArmour.map(name => row(1 / 2500, name))], table([
      [64, item("Uncut dragonstone"), item("Coins", 10000, 15000), table([row(1, "Loop half of key"), row(1, "Tooth half of key")])],
      [32, item("Uncut dragonstone"), item("Uncut ruby", 8, 13), item("Uncut diamond", 5, 8)],
      [26, item("Uncut dragonstone"), item("Crystal key")],
      [20, item("Uncut dragonstone"), item("Coins", 30000, 50000), item("Crystal shard", 13, 19)],
      [17, item("Uncut dragonstone"), item("Crystal shard", 25, 35)],
      [17, item("Uncut dragonstone"), item("Crystal shard", 7, 9), table([row(1, "Rune platelegs"), row(1, "Rune plateskirt")])],
      [17, item("Uncut dragonstone"), ...["Cosmic rune", "Chaos rune", "Nature rune", "Law rune", "Death rune"].map(name => item(name, 50, 100))],
      [16, item("Uncut dragonstone"), item("Yew seed")], [16, item("Uncut dragonstone"), item("Raw shark", 50, 100)],
      [12, item("Uncut dragonstone"), item("Gold ore", 350, 500)], [9, item("Uncut dragonstone"), item("Runite ore", 7, 10)],
      [7, item("Uncut dragonstone"), item("Crystal acorn", 4, 6)],
      [3, item("Uncut dragonstone"), table(darkRares.map(name => row(1, name)))]
    ]))]
  },
  "grubby-chest": {
    title: "Grubby Chest", wiki: wiki("Grubby_Chest"),
    dryIds: ids(["Orange egg sac", "Blue egg sac", "Crystal key"]), exclusive: [ids(["Orange egg sac", "Blue egg sac"])],
    note: "Each opening gives two food rolls, one potion roll and one main reward, with a separate chance of an egg sac.",
    rewards: () => [
      table([row(7, "Shark", 4), row(12, "Egg potato", 4), [1, item("Saradomin brew(2)", 3), item("Super restore(2)")]], 2),
      table([[8, item("Super attack(2)"), item("Super strength(2)"), item("Super defence(2)")], [8, item("Ranging potion(2)"), item("Super defence(2)")], row(1, "Super restore(3)", 2), row(3, "Prayer potion(3)", 2)]),
      table([row(10, "Law rune", 200), row(10, "Death rune", 200), row(10, "Astral rune", 200), row(2, "Dragon dart tip", 50), row(2, "Dragon arrowtips", 100), row(10, "Blood rune", 200),
        row(6, "Crystal key"), row(6, "Dragon bones", 10), row(6, "Red dragonhide", 10), row(8, "Grimy toadflax", 10), row(8, "Grimy ranarr weed", 10), row(7, "Grimy snapdragon", 10), row(7, "Grimy torstol", 5), row(8, "Coins", 10000)]),
      table([row(1, "Orange egg sac"), row(1, "Blue egg sac"), [23]])
    ]
  },
  "sinister-chest": {
    title: "Sinister Chest", wiki: wiki("Sinister_chest"), deterministic: true,
    dryIds: ids(sinisterHerbs),
    note: "Every sinister key gives the same six-herb bundle. Rewards are guaranteed, so there is no random dry streak.",
    rewards: () => sinisterHerbs.map((name, index) => item(name, index === 0 ? 3 : index === 1 ? 2 : 1))
  },
  "dark-chest": {
    title: "Dark Chest", wiki: wiki("Dark_Chest"),
    dryIds: ids(darkRares), exclusive: [ids(darkRares)],
    note: "Each dark key gives a rare pre-roll; otherwise it rolls the ordinary reward table.",
    rewards: () => [preRoll(darkRares.map(name => row(1 / 600, name)), table([
      row(15, "Rune pickaxe"), row(15, "Rune axe"), row(5, "Rune longsword"), row(10, "Rune kiteshield"), row(10, "Rune chainbody"),
      row(25, "Mind rune", 400, 600), row(25, "Chaos rune", 300, 500), row(25, "Blood rune", 100, 200), row(25, "Nature rune", 150, 350), row(27, "Law rune", 100, 300), row(27, "Death rune", 200, 400), row(40, "Adamant arrow", 200, 400), row(30, "Rune arrow", 100, 300),
      ...["Grimy dwarf weed", "Grimy torstol", "Grimy ranarr weed", "Grimy snapdragon"].map(name => row(25, name, 10, 15)),
      ...["Green dragon leather", "Blue dragon leather", "Red dragon leather", "Black dragon leather"].map(name => row(20, name, 5, 10)),
      row(35, "Babydragon bones", 10, 15), row(20, "Dragon bones", 10, 15), row(69, "Coins", 9500, 29500), row(10, "Dragonstone"), row(7, "Dark key", 2)
    ]))]
  },
  "moon-key-chest": {
    title: "Chest (moon key)", wiki: wiki("Chest_%28moon_key%29"),
    dryIds: ids(["Uncut onyx", "Helmet of the moon"]), exclusive: [ids(["Uncut onyx", "Helmet of the moon"])],
    note: "Always gives 250 sunfire splinters. The onyx is rolled first, followed by the helmet, then the main reward.",
    rewards: () => [item("Sunfire splinters", 250), preRoll([row(1 / 5000, "Uncut onyx"), row((1 - 1 / 5000) / 500, "Helmet of the moon")], table([
      row(20, "Dragonstone"), row(10, "Dragon platelegs", 2), row(10, "Nature rune", 500), row(10, "Huasca seed", 6), row(10, "Rune platebody", 6), row(10, "Watermelon seed", 100),
      row(10, "Sun-kissed bones", 100), row(10, "Raw monkfish", 300), row(10, "Uncut diamond", 50), row(1, "Gold ore", 500), row(1, "Coal"), row(1, "Cabbage", 28), row(1, "Crystal key"), row(1, "Moon key"), row(1, "Onyx bolts", 150), row(1, "Spinach roll")
    ]))]
  }
};

// Populate item metadata at module load, including option-dependent rewards.
for (const [slug, chest] of Object.entries(CHESTS)) {
  chest.slug = slug;
  chest.icon = "chest-" + slug.replace(/-chest$/, "");
  chest.rewards({ fishingLevel: 99, members: true });
}
