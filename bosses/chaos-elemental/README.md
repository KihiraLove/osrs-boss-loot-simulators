# Chaos Elemental

[Open Chaos Elemental simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/chaos-elemental/) · [All simulators](../../README.md)

## Mechanics and drop rates

The [Chaos Elemental simulator](./) includes a completed-kills field, loot simulator and dry calculator. Every kill awards **one of five equally likely minor drops**, alongside a major drop determined by a **Dragon pickaxe pre-roll (1/256)** followed by a **128-ticket ordinary drop table** if that pre-roll fails. The major table has **Dragon 2h sword at 2/128 conditional on reaching the table**; a pickaxe and Dragon 2h therefore cannot both be awarded as major drops on the same kill. The effective per-kill Dragon 2h probability in the dry calculator is **(255/256) × (2/128)**, while the UI displays its published 1/64 main-table rarity. The independently rolled **Pet chaos elemental (1/300)** can appear alongside either.

The three collection-log rewards are **Dragon 2h sword, Dragon pickaxe and Pet chaos elemental**. The dry calculator takes obtained quantities for all three and computes expected drops, odds of fewer, exactly and more than received, plus chance of at least one. The **any rare reward** calculation models mutually exclusive major uniques and an independently rolled pet, so it permits a primary unique and pet on one kill, but not both weapons.

The common major table has 128 weighted tickets covering weapons, runes, herbs, resources, materials, and an **8/128 rare drop table branch**. The latter uses the published unboosted rarity figures for twelve listed results, with unlisted outcomes treated as empty, so this part of the model is an approximation rather than a complete rare-drop-table simulation. RDT effects from the imbued ring and quest-dependent modifiers are not modeled. Actual quantity ranges are rolled uniformly.

Additional independent loot rolls are **Weapon poison(++) at 10/128**, **looting bag at 1/3**, **elite clue scroll at 1/200** (1/190 with Elite Combat Achievements, 1/100 with imbued ring of wealth, or 1/95 with both), and the pet. Players can choose no Slayer task, **Konar (brimstone key 1/59)**, or **Krystilia (Larran's key 1/58 and Slayer's enchantment 1/30)**. One task type at a time is allowed. Elite clue ownership and ring-of-wealth item effects beyond clues are not modeled.

All item sprites are local PNG assets. Sources: [OSRS Wiki — Chaos Elemental](https://oldschool.runescape.wiki/w/Chaos_Elemental), [Collection log](https://oldschool.runescape.wiki/w/Collection_log).
