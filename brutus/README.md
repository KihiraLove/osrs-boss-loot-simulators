# Brutus

[Open Brutus simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/brutus/) · [All simulators](../README.md)

## Mechanics and drop rates

The [Brutus loot simulator and dry calculator](./) model the **repeatable post-quest Brutus encounter**, not Demonic Brutus. Choose **Members** (default) or **Free-to-play** worlds before entering your kill count. Each kill always drops **one bull bones and one raw t-bone steak**. Bull bones cannot normally be picked up in-game; the simulator records their guaranteed appearances for completeness.

The **150-ticket pre-roll** awards exactly one reward when successful: **Mooleta (5/150)** on either world type, **Bottomless milk bucket (empty) (4/150)** on Members worlds, or **Cow slippers (1/150)** on Members worlds. A successful unique pre-roll replaces the ordinary main-table drop. When the pre-roll fails, there is one **81-ticket** ordinary loot roll. The Members table contains iron armour, runes, iron arrows, seeds, cowhide, logs, and three additional noted raw t-bone steaks. On F2P worlds the **25 combined tickets** for potato seeds (10), acorns (5), and noted steaks (10) are replaced by coins in three respective weighted quantity ranges (**60–80 at 15/81**, **80–100 at 5/81**, and **100–120 at 5/81**); the remaining 56 ordinary-loot tickets are shared.

Independent tertiary drops are beginner clue scrolls **1/15** on either world type; easy clue scrolls **1/40** on Members worlds (**1/38** with Easy Combat Achievements); and the **Beef pet 1/1,000** on Members worlds. The simulator assumes the player is eligible for clues on every kill, without tracking currently held scrolls or boxes.

In the dry calculator, enter the number obtained of each of the three pre-roll uniques and Beef. The displayed **fewer / exactly / more** probabilities use individual binomial distributions at the applicable world rates. **Any rare reward** combines the mutually exclusive main pre-roll (10/150 on Members worlds, 5/150 on F2P) with the independent Beef chance, allowing a Members kill to produce both a main unique and the pet. Items that cannot drop on F2P worlds are hidden and excluded from the calculation. Individual probability cards are marginals, not the joint probability of receiving the entire entered inventory.

All reward icons and the homepage Beef icon are local PNGs sourced from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db). Source: [OSRS Wiki — Brutus](https://oldschool.runescape.wiki/w/Brutus), [September 2026 saved wiki reference](https://danielpgleason.com/osrs/reference/brutus-ad606f08/), and [Reldo Brutus drop rates](https://reldo.org/a/brutus/).
