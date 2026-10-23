# Kraken

[Open Kraken simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/kraken/) · [All simulators](../../README.md)

This simulator covers the **Kraken boss (combat level 291)**, not the smaller cave kraken Slayer monster. Each simulated kill is one successfully completed boss kill. The model is a browser-only implementation with bundled local item sprites.

## Loot simulator

For every kill, the simulator selects **one outcome from the 128-ticket ordinary loot table**, covering weapons, armour, runes, seeds, materials, supplies and other rewards. Quantities follow the published ranges; for example, the **15/128 coins** roll yields **10,000–19,999 coins**, uniformly. The ordinary table has a **2/128 gem-table branch**, which follows the wiki's nested gem, talisman and mega-rare tables, including entries that award nothing.

There are four *independent* rare-item rolls, in addition to the ordinary loot roll:

| Unique reward | Chance per boss kill |
| --- | --- |
| Trident of the seas (full) | **1/512** |
| Kraken tentacle | **1/400** |
| Jar of dirt | **1/1,000** |
| Pet kraken | **1/3,000** |

The simulator rolls each of these separately, so more than one unique can occur on the same kill. These are **boss rates**: the regular cave kraken has different trident and tentacle mechanics and is not included.

Other optional/tertiary rewards are independent:

- **Elite clue scroll:** **1/500**, or **1/475** when the elite Combat Achievements reward tier is unlocked (toggle).
- **Brimstone key:** **1/49**, but *only* for boss kills on a Slayer task assigned by **Konar quo Maten** (toggle). Being on a regular Slayer task is not enough.

The simulator tracks raw reward quantities, not bank value. It does not enforce the one-clue-at-a-time inventory rule or substitute scroll boxes based on quest completion.

## Dry calculator

Enter your Kraken boss kill count and how many **full tridents**, **tentacles**, **jars**, and **pets** you received. For each rare reward the calculator displays:

- Expected number of drops.
- Chance of **fewer than**, **exactly**, or **more than** the entered drop count.
- Chance of **at least one** such drop across the entered kills.

Each item uses its own exact binomial distribution with the published per-kill rate. These four independent rolls are **not** part of the shared 128-ticket ordinary loot roll. The elite clue and Konar key options do not change unique dry odds.

## Sources and implementation

Drop rates, ordinary-table weights, quantity ranges and Combat Achievement adjustments: [OSRS Wiki — Kraken](https://oldschool.runescape.wiki/w/Kraken). Game item PNG images: [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db).

The **Kraken**, **cave kraken** and Sailing-related kraken NPCs have separate drop tables; only the boss is modeled here.
