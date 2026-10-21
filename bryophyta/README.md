# Bryophyta

[Open Bryophyta simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/bryophyta/) · [All simulators](../README.md)

## Mechanics and drop rates

The [Bryophyta loot simulator and dry calculator](./) use the post-**25 June 2025** reward system. Defeating Bryophyta rolls the **boss's own 128-ticket table** and independent tertiary rewards, including a **mossy key at 1/16** (**1/8** with a moss giant Slayer task). The chest is separate: it requires one completed kill and one mossy key, and has its own **118-ticket loot table**, with **Bryophyta's essence at 1/118**, a guaranteed beginner clue scroll, and an independent **1/16 mossy-key tertiary roll**. Essence is never awarded directly from the boss. Both Members and Free-to-play tables are supported.

In **Pre-obtained keys** mode, entering N kills simulates exactly N kills **and N chest openings**, regardless of mossy keys dropped from the boss or the chest; additional keys are retained as rewards, not used. In **Key obtained form boss** mode, N kills are simulated, and keys dropped by the boss are used to open chests. **Mossy keys dropped from those chests are also spent on additional chest openings**, repeating the process until no key remains. Chest-generated openings contribute their loot to the same chest loot result, including additional essence drops. A maximum of **1,000,000 simulated chest openings** protects against pathological infinite key chains; if this limit is reached, the results show how many keys remain unused.

The **Kc on slayer task out of total** numeric input determines exactly how many boss kills use the **1/8** mossy-key rate, while the remainder use **1/16**. Only the first entered number of simulated boss kills are counted as on task; the field must not exceed the total kill count. The key and opening summary includes boss kills, on-task kills, boss-obtained keys, chest openings, chest-dropped keys and extra openings funded by those chest keys. Boss loot and chest loot remain in separate grids. **Bryophyta's essence** appears as a highlighted 1/118 unique reward above both loot grids, rather than also appearing among common chest loot.

The **dry calculator** asks **only for the number of chest openings**. It shows expected quantities and the probabilities of zero, exactly one, or at least one **Bryophyta's essence** and **mossy key from the chest**, using their chest rates alone. It never counts boss kills or keys dropped by the boss, and does not ask for obtained-item counts. The applicable formula for at least one reward is `1 − (1 − p)^chests`.

Boss and chest loot use distinct Members/F2P weighted drop tables. Seed, herb and gem branch probabilities are simulated as weighted subtables; some relative subtable weights are derived from rounded published effective rates. Guaranteed giant bones on Members worlds are shown for completeness although they are buried directly from the ground in-game. Clue-scroll ownership, ring-of-wealth effects and other account-specific exclusions are not tracked. All item icons are bundled locally.

Sources: [OSRS Wiki — Bryophyta](https://oldschool.runescape.wiki/w/Bryophyta), [Chest (Bryophyta's lair)](https://oldschool.runescape.wiki/w/Chest_(Bryophyta%27s_lair)), and [the July 2025 mossy key updates](https://osrsindex.com/wiki/mossy-key?site=osrs_wiki).
