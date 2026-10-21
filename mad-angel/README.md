# Mad Angel

[Open Mad Angel simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/mad-angel/) · [All simulators](../README.md)

## Mechanics and drop rates

The [Mad Angel simulator and dry calculator](./) model the **repeatable post-quest fight**, not the quest-only variant. Source rates checked October 2026. Every kill yields **25–35 granite dust**. A checkbox allows one **Sunstone crystal** on the first simulated kill if the player's bank chest has not been built and they do not already own the crystal. Without this checkbox the simulator does not invent repeated crystal drops.

The loot simulator models the officially published pre-roll rates as **mutually exclusive** rewards: Ardeaglais teleports **2 at 1/25**, Hallowfell **1/127**, and Jar of Light **1/1,000**. These published *marginal probabilities* are preserved exactly, with a pre-roll success replacing the ordinary-loot result. If all pre-rolls fail, the main table consists of **148 standard-loot tickets** and **2 shared rare-drop-table tickets** out of 150, with one ordinary result per eligible kill. The shared RDT uses the same relative outcomes as the Alchemical Hydra module (default without ring of wealth or quest-specific modifiers).

The standard table includes **supply batches**: when selected, two sharks *or* yellowfins come bundled with Prayer potion(2) and Super combat potion(1). Other normal loot uses published quantities, including coins, noted raw monkfish, gems and potions. An independent tertiary roll awards **Aggy at 1/2,000** and medium clues at **1/25**, improving to **1/23** with the optional Medium Combat Achievements checkbox. Already-owned clues are not tracked.

The dry calculator accepts counts for **Ardeaglais teleports (total quantity, multiples of two), Hallowfell, Jar of Light, and Aggy**. It shows fewer/exact/more drop probabilities for each. The combined **Any rare reward** excludes teleports, and combines the mutually exclusive Hallowfell/Jar pre-rolls with Aggy's independent pet roll (which can occur on the same kill as a pre-roll). It does not count the conditional sunstone crystal.

All sprites, including Aggy on the homepage, are local PNGs sourced from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db). The pre-roll main-replacement model is an explicit interpretation of the drop-table "pre-roll" heading; exact simultaneous-drop behavior is not specified in the available source data. Published rates are maintained for each rare individually, but correlations between rare and standard rewards could differ in-game.

Sources: [OSRS Wiki — Mad Angel](https://oldschool.runescape.wiki/w/Mad_Angel), [Reldo drop table](https://reldo.org/a/mad-angel/), and the [August 2026 rate announcement](https://www.osrsdpscalc.com/en/blog/osrs-mad-angel-drop-rates-wyrmscraig-2026).
