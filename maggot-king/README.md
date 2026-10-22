# Maggot King

[Open Maggot King simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/maggot-king/) · [All simulators](../README.md)

## Modes

After each Maggot King kill, the player chooses **Open-stomach** or **Take-eggs**. These are mutually exclusive options. The simulator has a strategy selector above the kill count; the loot and dry-calculator results use the selected strategy.

- **Open-stomach** (normal loot): unique weapon pre-rolls, a weighted 159-ticket common table, independent **Maggot marquess (1/3,500)** and elite clues (**1/40**, or **1/38** with elite Combat Achievements). Optional Konar Slayer task adds independent **brimstone keys (1/50)**.
- **Take-eggs** (pet strategy): no normal table or weapon uniques. One of six egg variants can appear, each with its published chance to be obtained and its own chance to hatch **Maggot marquess**. The total pet probability for one take-eggs kill, **assuming the obtained egg is popped**, is about **1/1,502.4**. Elite clues still roll at **1/40**, or **1/38** with the elite Combat Achievements toggle.

## Open-stomach details

The two rare weapon rewards are **Elder venator fang (1/340)** and **Crimson kisten (1/520)**. The simulator models them as mutually exclusive pre-roll outcomes before the normal drop table. Its 159 weighted common-table outcomes use the latest documented July 2026 quantities. The 41-ticket supplies branch awards **2–4 stymphike tartare plus one dull ancient medal** together; it is not two separate 41-ticket rolls. Other common drops include uncut rubies, ores, blood sacs, venator fangs and teeth, and tarnished equipment.

Pet and clue rolls are independent of the primary loot. The elite Combat Achievement reward affects **clues only** and is not the same as an elite Slayer task. The model does not enforce clue-scroll inventory restrictions.

## Take-eggs details

| Egg variant | Chance per kill | Pet chance after popping |
| --- | --- | --- |
| Base | 300/1,500 | 1/3,000 |
| Sickly | 150/1,500 | 1/2,500 |
| Warm | 33/1,500 | 1/1,250 |
| Pulsating | 6/1,500 | 1/500 |
| Wriggling | 3/1,500 | 1/10 |
| Writhing | 1/1,500 | 1/2 |

Each individual simulated egg is automatically *popped* to calculate the pet roll. The loot inventory displays the number of **eggs obtained by type before popping**, which is a statistical record, not surviving usable eggs.

The published egg probabilities total **493/1,500**. The remaining **1,007/1,500** comprises outcomes in which the player receives nothing or a supply bundle (stymphike tartare and dull ancient medal). **No exact split between those two outcomes is published**, so this simulator does not invent the split or award take-eggs supply drops; those non-egg results are currently omitted from the item inventory. This limitation only affects incidental supplies, **not** the published egg-based pet chance.

## Dry calculator

For **Open-stomach**, enter your received Elder venator fangs, Crimson kistens and Maggot marquess pets. The calculator shows expected drops, chances of **fewer**, **exactly**, or **more**, and the chance of **at least one** of each. The **either weapon unique** result combines the two mutually exclusive weapon branches, using a per-kill chance of **1/340 + 1/520**.

For **Take-eggs**, the calculator shows the Maggot marquess distribution using the weighted probability of hatching it from an obtained egg, about **1/1,502.4** per kill. Weapon uniques are not available in this mode.

All calculations run locally, and all item images are bundled in the repository as local PNGs.

Sources: [OSRS Wiki — Maggot King](https://oldschool.runescape.wiki/w/Maggot_king), [OSRS Wiki — Maggot egg](https://oldschool.runescape.wiki/w/Maggot_egg), [Jagex-published drop rates](https://oldschool.runescape.wiki/w/Update:The_Blood_Moon_Rises_%26_Bank_Tags_Tweaks), and [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db).
