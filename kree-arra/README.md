# Kree'arra

[Open Kree'arra simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/kree-arra/) · [All simulators](../README.md)

## Full-room loot simulator

One entered **Kree'arra KC** simulates a complete Armadyl room clear: one kill of **Kree'arra**, **Flight Kilisa (melee)**, **Wingman Skree (magic)**, and **Flockleader Geerin (ranged)**. Each monster's loot is rolled independently, and the result is shown in **four separate loot windows**. The overall loot is also aggregated internally.

Kree'arra guarantees **big bones** and **1–16 feathers** per kill. Each bodyguard guarantees **bones** and **1–11 feathers**. The number of **mind runes** dropped by Kree'arra (586–601) is precisely **585 + the feathers rolled on that kill**, and each bodyguard's **steel arrows/darts** quantity is **90 + its feathers**.

### Unique rates

| Item | Kree'arra (per kill) | Each bodyguard (per kill) |
| --- | --- | --- |
| Armadyl helmet | 1/381 | 1/16,129 |
| Armadyl chestplate | 1/381 | 1/16,129 |
| Armadyl chainskirt | 1/381 | 1/16,129 |
| Armadyl hilt | 1/508 | — |
| Godsword shard 1 | 1/762 | 1/1,524 |
| Godsword shard 2 | 1/762 | 1/1,524 |
| Godsword shard 3 | 1/762 | 1/1,524 |
| Pet Kree'arra | 1/5,000 | — |

Kree'arra's ordinary table uses **127 tickets**: separate one-ticket Armadyl armour, hilt and shard branches, nine eight-ticket ordinary categories, crystal key and yew seed, eight rare-table and two gem-table tickets, and forty coin tickets. The armour branch gives one of three pieces; the hilt branch has a 1/4 hilt chance; the shard branch has a 1/6 chance per shard. Ranging potion(3) and Super defence(3) are awarded together in quantities of three each, on a shared roll.

Each bodyguard uses its own independent **127-ticket table**: one armour branch (1/127 for any particular armour piece conditional on the branch), one shard branch (1/12 for each shard conditional on the branch), and 125 ordinary tickets. Ordinary loot covers steel arrows, darts, smoke runes, manta rays, mushroom potatoes, coins, crushed nests and grimy kwuarm.

The rare and gem rolls share the existing project's God Wars rare-drop-table approximation: rune sword replaces runite bar, empty rolls yield coins, and talisman rolls yield chaos talismans. These uncommon subtable odds are approximate rather than a bit-for-bit Wiki implementation.

### Other rewards and options

| Source | Reward | Rate |
| --- | --- | --- |
| Kree'arra | Pet Kree'arra | 1/5,000 |
| Kree'arra | Elite clue | 1/250; 1/237 with elite Combat Achievements |
| Kree'arra | Long bone | 1/400 |
| Kree'arra | Curved bone | 1/5,012.5 |
| Kree'arra | Brimstone key (Konar task) | 1/50 |
| Flight Kilisa | Brimstone key (Konar task) | 1/89 |
| Wingman Skree | Brimstone key (Konar task) | 1/92 |
| Flockleader Geerin | Brimstone key (Konar task) | 1/91 |
| Each bodyguard | Hard clue | 1/128; 1/121 with hard Combat Achievements |

During **The Frozen Door** miniquest, the optional toggle grants one Armadyl frozen key piece on each Kree'arra kill and separately rolls 1/20 for each of the three bodyguards. This is not automatically applied outside the miniquest. Clue inventory restrictions are not modeled.

## Combined dry calculator

For each rare, enter the combined number obtained from Kree'arra **and all three bodyguards**, not just the boss. The exact count distribution for an item is:

\[
X \sim \operatorname{Binomial}(KC,p_{\mathrm{Kree}})
+ \operatorname{Binomial}(3KC,p_{\mathrm{bodyguard}})
\]

Armadyl armour and Godsword shards include bodyguard probabilities. Armadyl hilt and the pet remain Kree'arra-only. Expected copies, odds of getting fewer, exactly or more, and chance of at least one are reported.

Icons are stored as local OSRS item PNGs. No browser-time Wiki API calls are required.

Sources: [OSRS Wiki — Kree'arra](https://oldschool.runescape.wiki/w/Kree%27arra), [Flight Kilisa](https://oldschool.runescape.wiki/w/Flight_Kilisa), [Wingman Skree](https://oldschool.runescape.wiki/w/Wingman_Skree), [Flockleader Geerin](https://oldschool.runescape.wiki/w/Flockleader_Geerin); [osrsreboxed-db sprites](https://github.com/RSPSApp/osrsreboxed-db).
