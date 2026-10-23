# Kalphite Queen

[Open Kalphite Queen simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/kalphite-queen/) · [All simulators](../../README.md)

## Mechanics and drop rates

[Kalphite Queen](./) has a separate page with an entered kill count and two modes: **Loot simulator** and **Dry calculator**. Every kill makes one roll on the full **126-ticket ordinary drop table** (including the rare drop table branch), plus one roll on a separate **9-ticket consumables table**. Published drop quantities are modeled as given, including noted item stacks. The rare drop table uses the OSRS Wiki's published unboosted overall odds for the ten listed rewards; remaining conditional outcomes are treated as no item. This is not a complete simulation of every rare drop table reward.

All six **collection-log uniques** are individually rolled: **Kq head 1/128**, **Dragon chainbody 1/128**, **Dragon 2h sword 1/256**, **Dragon pickaxe 1/400**, **Jar of Sand 1/2,000**, and **Kalphite Princess 1/3,000**. Ensouled kalphite heads (1/20), elite clue scrolls (1/100, or 1/95 with Elite Combat Achievements), and optional Konar-only brimstone keys (1/54) are separately rolled. The independent rare rolls can award multiple unique types during one kill. The *tattered Kq head*, guaranteed once on the player's actual 256th lifetime kill, is deliberately not awarded by the simulator: the page does not request starting lifetime KC, so including it based solely on simulated kills would give misleading results. The rare **Kq head** is modeled normally, and the tattered head does not count as a collection-log slot.

The dry calculator lets the user enter their received quantity for every collection-log unique. It reports expected count, the probability of fewer/exactly/more drops, and the probability of at least one. The **any rare reward** calculation combines six independent binomial distributions and allows multiple rare items on the same kill. It does not include the milestone-only tattered head or conditional drops. All game item icons are local PNGs.

Sources: [OSRS Wiki Kalphite Queen](https://oldschool.runescape.wiki/w/Kalphite_Queen) and [Kalphite Queen detailed loot tables](https://reldo.org/a/kalphite-queen/).
