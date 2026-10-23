# Zulrah

[Open Zulrah simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/zulrah/) · [All simulators](../../README.md)

## Loot simulator

Enter **completed solo Zulrah kills**. Every kill grants **100–299 Zulrah's scales** and **two independent main-table rolls**. Each main roll first has a **1/256** chance of selecting the four-item unique table (equal odds for Tanzanite fang, Magic fang, Serpentine visage and Uncut onyx), making each individual item **1/1,024 per roll**, or roughly **1/512 per kill**. Otherwise the roll uses the published **249-ticket ordinary table**, including equipment, runes, herbs, seeds, resources, and other drops. Scales from the ordinary table are added to the guaranteed scales.

The flax branch has 10 of the 249 ordinary-table tickets. Within that branch, each mutagen has a **10/5,264** chance, replacing the flax; this is roughly **1/6,554 per kill** for either specific mutagen. Mutagens are not modeled as independent tertiary rolls.

The shark branch has 12/249 tickets. Its 3:3:2 subtable yields either **35 raw sharks**, **70 shark lures**, or **35 manta rays**, respectively, according to the June 2025 update. Rare-drop-table outcomes use the project's shared generic rare-drop model. All loot is aggregated by item.

### Tertiary drops

Each tertiary reward rolls **once per kill**, independently of both main drops.

| Drop | Rate per kill |
| --- | --- |
| Jar of Swamp | 1/3,000 |
| Pet Snakeling | 1/4,000 |
| Elite clue scroll | 1/75 normally; 1/71 with elite Combat Achievements |
| Brimstone key | 1/50 only on a Konar Slayer task |

Clue inventory restrictions and the ring-of-wealth rare-drop adjustment are not modeled.

## Dry calculator

Enter how many of each of the **eight rare rewards** you received: Tanzanite fang, Magic fang, Serpentine visage, Uncut onyx, Tanzanite mutagen, Magma mutagen, Jar of Swamp and Pet Snakeling. Results show expected drops, the odds of fewer/exactly/more drops, and the chance of at least one.

The four unique-table items and two mutagens use **Binomial(2 × kills, per-roll chance)**, rather than an approximate single-roll per-kill rate. Jar and pet use **Binomial(kills, tertiary rate)**. Up to two of the same main-roll rare item may drop in a single kill. The displayed rarity on unique cards is the effective probability of at least one copy in a kill.

Uses local OSRS item PNG sprites and no runtime API calls.

Sources: [OSRS Wiki — Zulrah](https://oldschool.runescape.wiki/w/Zulrah), [osrsreboxed-db item sprites](https://github.com/RSPSApp/osrsreboxed-db).
