# The Gauntlet

[Open the Gauntlet simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/gauntlet/) · [All simulators](../README.md)

This simulator models **successful completed chests only** for **The Gauntlet** and **The Corrupted Gauntlet**. Enter a separate completed-kill count for each mode. Both counts contribute to **one combined inventory** and **one combined dry calculator**.

## Loot simulator

| Mechanic | Regular Gauntlet | Corrupted Gauntlet |
| --- | --- | --- |
| Standard loot rolls per chest | 2 | 3 |
| Guaranteed crystal shards per chest | 5–9 | 7–12 |
| Crystal weapon seed | 1/120 | 1/50 |
| Crystal armour seed | 1/120 | 1/50 |
| Enhanced crystal weapon seed | 1/2,000 | 1/400 |
| Youngllef | 1/2,000 | 1/800 |
| Elite clue scroll | 1/25 | 1/20 |
| Elite clue with elite Combat Achievements | 1/23 | 1/19 |

Every successful chest has **two or three independently selected common rolls**, using the corresponding 24-ticket table and its respective quantity ranges. Most items have a weight of 1/24 per roll, but **dragon halberd has 0.5/24** and **coins have 1.5/24**. Quantities for corrupted completions are usually greater. Every chest also awards the appropriate 5–9 or 7–12 crystal shards.

The two crystal seed types, the enhanced crystal weapon seed, and Youngllef have **independent per-completion rolls**, separate from standard loot and from each other. A single chest can award more than one type of crystal seed. The total inventory combines quantities of the same item across regular and corrupted runs. The four special rewards appear as separate unique cards at the top, regardless of quantity.

A **Gauntlet cape** is awarded once on the first successful corrupted completion **if the player does not already own one**. The simulator has an *Include first-time Gauntlet cape* checkbox (enabled by default), adding at most one cape when corrupted KC is nonzero. Disable it if already owned.

The Elite Combat Achievements option only affects the elite clue rate. The simulator does not model clue scroll/scroll box inventory restrictions or loot from failed runs.

## Combined dry calculator

Enter the **total number received** across both modes for each of four unique rewards. The odds of fewer, exactly, and more than the entered count are calculated from the convolution of:

\[
X_{\text{regular}}\sim\operatorname{Binomial}(n_{\text{regular}},p_{\text{regular}}),\qquad
X_{\text{corrupted}}\sim\operatorname{Binomial}(n_{\text{corrupted}},p_{\text{corrupted}}).
\]

The drop count follows \(X_{\text{regular}}+X_{\text{corrupted}}\), not a binomial distribution with a simple averaged rate. This accounts for mixed KC and independent rolls. Each reward card also shows the exact combined chance of at least one:

\[
1-(1-p_{\text{regular}})^{n_{\text{regular}}}(1-p_{\text{corrupted}})^{n_{\text{corrupted}}}.
\]

The *any crystal seed* and *any seed or pet* panels aggregate the independently rolled probabilities within each completion, then combine regular and corrupted completions. These cards show at-least-one chances; each individual seed or pet card shows the full distribution.

## Local files and verification

- `gauntlet/simulator.mjs` — all standard tables, roll counts and seeded tertiary rolls.
- `gauntlet/dry-calc.mjs` — mixed-rate convolution and probabilities.
- `gauntlet/app.mjs`, `gauntlet/index.html`, `gauntlet/styles.css` — frontend.
- `tests/gauntlet.test.mjs` — validation and regression checks.
- All displayed items use local `assets/items/*.png` sprites.

Source: [OSRS Wiki — Reward Chest (The Gauntlet)](https://oldschool.runescape.wiki/w/Reward_Chest_(The_Gauntlet)). Item images: [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db).
