# Vorkath

[Open Vorkath simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/vorkath/) · [All simulators](../../README.md)

## Loot simulator

Enter completed **post-quest Vorkath kills**. Each kill always yields **2 superior dragon bones and 2 blue dragonhide**, then gets **two independent rolls** on the main loot table. All tertiary rewards roll separately **once per kill**, not twice. This also applies to the Scaly blue dragonhide, Vorkath's head, Dragonbone necklace, Jar of Decay, Vorki, Draconic visage, Skeletal visage and elite clues. Collected loot is aggregated by item, including both normal blue dragonhide drops and the guaranteed pair.

The ordinary table has **150 tickets per roll**. The explicitly listed equipment, runes, dragonhides, fletching materials and other items account for 131 tickets. The remaining named branches are the **5-ticket rare-drop table**, **5-ticket bolt-tip table**, **4-ticket shark table** and **3-ticket tree/herb seed table**. Two residual tickets are left unspecified rather than altering the stated table weights. Rare-drop-table items use the shared model already present in the project. Bolt-tip items use published relative weights, totaling 91, and shark-table items use weights 3:3:2 (including the new shark lure, which drops in **even-numbered quantities of 70–110**). The seed subtable's relative weights are approximated from rounded Wiki rates; actual seed frequency may differ.

### Tertiary rewards

| Drop | Rate per kill |
| --- | --- |
| Scaly blue dragonhide | 1/10 |
| Vorkath's head | 1/50, **guaranteed on KC 50** |
| Dragonbone necklace | 1/1,000 |
| Jar of Decay | 1/3,000 |
| Vorki | 1/3,000 |
| Draconic visage | 1/5,000 |
| Skeletal visage | 1/5,000 |
| Elite clue scroll | 1/65 normally, 1/61 with elite Combat Achievements |
| Brimstone key | 1/50, only when on a Konar Slayer task |

The 50th kill's guaranteed head *replaces* that kill's random head roll, so the simulator never awards two heads on KC 50. The simulation **assumes the entered kills start from account Vorkath KC 0**: it grants that special head on the 50th simulated kill. Already having past kills is not currently a configurable input. Clue-scroll inventory restrictions are not modeled.

## Dry calculator

Enter how many of each six major collection-log drops you received: Vorkath's head, Dragonbone necklace, Jar of Decay, Vorki, Draconic visage and Skeletal visage. The calculator displays the expected number, the odds of getting fewer, exactly, or more than your count, and the probability of obtaining at least one.

The guaranteed head is modeled exactly: for fewer than 50 kills, the number of heads follows **Binomial(kills, 1/50)**. For 50 or more kills, it follows **1 + Binomial(kills − 1, 1/50)**. The other drops follow independent binomial distributions at their published per-kill odds.

The simulator uses local OSRS item PNGs and needs no runtime API calls.

Sources: [OSRS Wiki — Vorkath](https://oldschool.runescape.wiki/w/Vorkath), [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db).
