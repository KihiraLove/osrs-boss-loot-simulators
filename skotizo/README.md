# Skotizo

[Open the Skotizo simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/skotizo/) · [All simulators](../README.md)

## Loot simulator

Enter the number of **Skotizo kills** (0–1,000,000). Every simulated kill awards **one infernal ashes** and **one hard clue scroll**. The simulator assumes collected clues are kept as loot without imposing inventory restrictions; OSRS may instead give clue scroll boxes after completing *X Marks the Spot*.

### Main rewards

Skotizo has **two separate independent main rolls** per kill:

- **Ancient shards:** a guaranteed **1–5 ancient shards**. The 100-ticket quantities are 1 shard (75 tickets), 2 (15), 3 (5), 4 (4), or 5 (1). This averages **1.41 shards per kill**.
- **Ordinary loot:** a separate 99-ticket table. Fourteen items or item groups each take seven tickets, and the shield left half has one ticket. Examples: three rune platebodies, 500 death runes, 75 noted adamantite ore, and 150 noted mahogany planks. These quantities are exact per matching roll.

There is also a separate **gemstone roll**: 9/1,000 for ten uncut dragonstones, 1/1,000 for an uncut onyx, otherwise nothing. Gem drops can coincide with all other rolls.

### Independent tertiary drops

| Reward | Chance per kill |
| --- | --- |
| Ensouled demon head | 1/10 |
| Dark claw | **1/25** |
| Skotos pet | **1/65** |
| Jar of Darkness | **1/200** |
| Dark totem (complete) | **1/128** |
| Dark totem component | **3/128** |
| Elite clue scroll | **1/5**, or **1/4** after elite Combat Achievements |
| Brimstone key | **1/56** on a Konar Slayer task only |

The dark-totem outcomes are **mutually exclusive** within the same **4/128** subtable. On a successful totem roll, a complete dark totem is awarded one quarter of the time. Otherwise, the player receives one of the three totem pieces—**base, middle, or top**—whichever is least represented in the simulated inventory. Ties are resolved in that order. The simulator begins with **no pre-existing totem pieces** and does not automatically assemble pieces or reuse the completed totem to kill Skotizo.

The other tertiary outcomes are independent, so a single kill may drop multiple rewards. The optional Konar toggle models brimstone keys only on applicable Konar Slayer tasks. The elite Combat Achievements toggle only changes the **elite clue** rate; the hard clue is always dropped in this simulation.

## Dry calculator

Enter kills and the number of **Dark claws, Skotos pets, Jars of Darkness, uncut onyxes, and complete dark totems** already obtained. For each reward the calculator reports the expected count, the probability of receiving fewer/exactly/more than that count, and the chance of at least one.

The calculator uses independent binomial distributions with the listed per-kill rates, including the combined **1/128 complete dark totem** event. The guaranteed variable-quantity ancient shards are included in the loot simulator but not in the dry calculator. Dark totem **pieces** are not included in dry odds because the subtype depends on simulated inventory state.

Drop data: [OSRS Wiki — Skotizo](https://oldschool.runescape.wiki/w/Skotizo). Local PNG icons: [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db). Game assets remain the property of Jagex; this is an unofficial, client-side simulation.
