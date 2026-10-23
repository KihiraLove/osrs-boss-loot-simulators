# Moons of Peril — Lunar Chest

[Open the simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/moons-of-peril/) · [All simulators](../../README.md)

This simulator considers **only complete runs where Blood Moon, Blue Moon, and Eclipse Moon have all been defeated before opening the Lunar Chest**. Enter the number of full clear chests. A full clear counts as **one chest**, not three separate chest openings. There are no options to skip moons.

## Loot simulator

Each chest receives **three independent 1/56 unique rolls**, one for each respective Moon. One, two, or three unique items can drop together in a single chest. The probability of **at least one** is **1 − (55/56)³ ≈ 5.263%**, approximately 1/19.

- **Eclipse Moon:** Eclipse atlatl, eclipse moon helm, chestplate, tassets.
- **Blood Moon:** Dual macuahuitl, blood moon helm, chestplate, tassets.
- **Blue Moon:** Blue moon spear, blue moon helm, chestplate, tassets.

Each set has **duplicate protection**: on a unique roll, select uniformly among **unobtained pieces of that set** until all four pieces are obtained. Only then do all four become eligible for future drops, each with equal probability. Duplicate protection is **per set**, and there is no duplicate protection for standard loot. Starting inventories are empty; the simulator does not accept an existing collection log.

A nominal item rarity of **1/224** (1/56 for its moon, then 1/4) is displayed for comparison, but because duplicate protection changes the item selection pool, the actual chance of receiving a particular item on a future chest depends on which pieces have already dropped.

**If any unique drops, the entire standard loot table is skipped.** Otherwise, a complete three-moon chest receives **six independent rolls** on this 30-ticket table:

| Standard drop | Quantity per roll | Tickets / 30 |
| --- | --- | --- |
| Atlatl dart | 72–120 | 5 |
| Blessed bone shards | 160–179 | 2 |
| Wyrmling bones | 42–54 | 1 |
| Sun-kissed bones | 6–12 | 3 |
| Swamp tar | 79–119 | 4 |
| Water orb | 30–45 | 2 |
| Supercompost | 6–12 | 3 |
| Soft clay | 15–25 | 3 |
| Grimy harralander | 12–18 | 3 |
| Grimy irit leaf | 12–18 | 1 |
| Maple seed | 1–2 | 2 |
| Yew seed | 1 | 1 |

Ordinary quantities are independent uniform integer ranges. Items are combined across all simulated full-clear chests. The site uses local PNG item sprites and makes no calls to game services during simulation.

## Dry calculator

Enter the number of each of the twelve set pieces already obtained over the chosen number of full-clear chests. The calculator shows **fewer, exactly, and more than** the entered number, the expected count, and the chance of at least one item.

Duplicate protection is accounted for analytically. For a **specific piece**, let the number of unique hits for its moon be **H ~ Binomial(chests, 1/56)**. Then:

- If **H is under 4**, the piece has been obtained once with probability H/4, otherwise not at all.
- If **H is 4 or more**, the piece has been obtained exactly once during the first four hits, plus **Binomial(H − 4, 1/4)** additional copies.

The calculator averages over H; it does **not** incorrectly treat repeated copies of each piece as independent 1/224 rolls.

The **Any unique pieces** card models the total number of pieces across all three moons: **Binomial(3 × chests, 1/56)**. The probability to finish **all twelve pieces** from an empty log is also shown: **[P(Binomial(chests,1/56) ≥ 4)]³**. Each moon must give four unique hits to complete its set.

Calculations assume all three moons are killed every run, no item trades or sacrifices, and an initially empty log. They do not model exchanges of gear with Eyatlalli.

## Sources

- [OSRS Wiki — Lunar Chest](https://oldschool.runescape.wiki/w/Lunar_Chest)
- [OSRS Wiki — Moons of Peril](https://oldschool.runescape.wiki/w/Moons_of_Peril)
- [RSPSApp/osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db) for local item sprites
