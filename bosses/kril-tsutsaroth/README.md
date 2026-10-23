# K'ril Tsutsaroth

[Open K'ril Tsutsaroth simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/kril-tsutsaroth/) · [All simulators](../../README.md)

## Full-room loot simulator

Each entered **K'ril Tsutsaroth KC** simulates one complete Zamorak room clear: one K'ril, **Tstanon Karlak (melee)**, **Balfrug Kreeyath (magic)** and **Zakl'n Gritch (ranged)**. Loot is rolled independently for all four monsters and displayed in **four separate windows**, with a combined total calculated internally.

Every monster gets exactly one **127-ticket main-table roll**. The boss has mutually exclusive Steam battlestaff and Zamorakian spear outcomes at 1/127 each, a Staff of the Dead and Zamorak hilt branch at 1/508 each, and a separate Godsword shard branch. A bodyguard has a spear branch at 1/127 with 3/127 chance of actually rolling the spear, and a Godsword shard branch at 1/127 with 1/12 chance per shard. Each bodyguard's remaining 125 tickets produce their own common loot, including runes, darts, arrows, fish, potatoes, potions and wine.

### Rare drop rates

| Unique | K'ril per kill | Each bodyguard per kill |
| --- | --- | --- |
| Steam battlestaff | 1/127 | Not dropped |
| Zamorakian spear | 1/127 | 3/16,129 |
| Staff of the Dead | 1/508 | Not dropped |
| Zamorak hilt | 1/508 | Not dropped |
| Godsword shard 1 | 1/762 | 1/1,524 |
| Godsword shard 2 | 1/762 | 1/1,524 |
| Godsword shard 3 | 1/762 | 1/1,524 |
| Pet K'ril Tsutsaroth | 1/5,000 | Not dropped |

K'ril always drops **infernal ashes** and each bodyguard drops **malicious ashes**. K'ril's other regular drops include adamant arrows(p++), rune scimitars, adamant platebodies, rune platelegs, dragon daggers(p++), grimy lantadyme, lantadyme seeds, runes and coins. **Super attack(3) and Super strength(3) are awarded together**, and **Super restore(3) and Zamorak brew(3) are also awarded together** in quantities of three each.

The boss's rare and gem tables follow the existing repository's God Wars weighted-table approximation, replacing runite bars with rune swords and empty results with coins. This uncommon subtable is approximate.

## Other rewards and options

K'ril's separate tertiary drops are the **pet (1/5,000)**, **elite clues (1/250 or 1/237 with elite Combat Achievements)**, and **brimstone keys (1/50 on a Konar Slayer task)**. Each bodyguard can independently drop a **hard clue at 1/128**, improved to **1/121** with hard Combat Achievements. Konar brimstone key drops are included only for K'ril, as shown on his drop table.

The **Frozen Door** option enables the guaranteed Zamorak frozen key piece from K'ril and a separate 1/20 key-piece roll per bodyguard during the miniquest. Outside this miniquest the key pieces are not rolled. Clue inventory restrictions are not modeled.

## Combined dry calculator

Enter the total number of each unique obtained from the **boss and all three bodyguards**. The result for each item uses the independent distribution:

\[
X \sim \operatorname{Binomial}(KC,p_{\mathrm{K'ril}})
+\operatorname{Binomial}(3KC,p_{\mathrm{bodyguard}})
\]

The bodyguards increase the Zamorakian spear and Godsword shard odds. Other rare rewards are boss-only. The calculator shows the probability of at least one, expected drops and the probabilities of receiving fewer, exactly, or more than the entered amount.

All item sprites are served as local PNGs.

Sources: [OSRS Wiki — K'ril Tsutsaroth](https://oldschool.runescape.wiki/w/K%27ril_Tsutsaroth), [Tstanon Karlak](https://oldschool.runescape.wiki/w/Tstanon_Karlak), [Balfrug Kreeyath](https://oldschool.runescape.wiki/w/Balfrug_Kreeyath), [Zakl'n Gritch](https://oldschool.runescape.wiki/w/Zakl%27n_Gritch); sprites from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db).
