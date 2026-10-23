# Wintertodt — Reward Cart

[Open Wintertodt simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/wintertodt/) · [All simulators](../../README.md)

This models the **current Wintertodt Reward Cart**, introduced **9 October 2024**, **not** the discontinued supply crates. Each **cart pull corresponds to one reward roll**, not one Wintertodt kill or one legacy crate. The cart awards two guaranteed pulls for 500 points, one further pull for every additional 500 points, and a proportional chance for another roll according to the remainder. For example, **750 points** gives two pulls and a **50% chance of a third**. Enter the number of rewards to search in the cart. The in-game cart holds at most 8,000 unclaimed rewards, but the simulator lets you model any number of pulls over multiple claims.

## Sequential unique rolls

Every pull performs the following **first-success** checks in order. When an earlier check succeeds, later checks and the common item table are skipped. The table shows the raw check probabilities; *effective* rates multiply by the probability of all earlier checks failing.

| Priority | Reward | Check |
| --- | --- | --- |
| 1 | Phoenix | 1/5,000 |
| 2 | Dragon axe | 1/10,000 |
| 3 | Tome of fire (empty) | 1/1,000 |
| 4 | Warm gloves | 1/150 |
| 5 | Bruma torch | 1/150 |
| 6 | Pyromancer outfit piece | 1/150 |
| 7 | Burnt pages (7–29) | 1/45 |

Pyromancer pieces are awarded in **least-owned order**, with ties broken **garb → hood → robe → boots**. The simulator assumes no previously owned outfit pieces, but tracks those acquired during the simulation. If the starting number of owned **Warm gloves** or **Bruma torches** reaches three, their future successful rolls convert respectively into **one magic seed** or **2–3 torstol seeds**. Use the two starting-ownership fields to represent your actual count of those items. The simulator does not model whether a particular pyromancer piece is stored in the POH costume room.

The dry calculator models **Phoenix, Dragon axe, Tome of fire, Warm gloves, Bruma torch, and the four pyromancer pieces**. It calculates fewer-than, exactly, and more-than probabilities and at-least-one chance based on the selected pull count. Gloves and torch counts are capped at three. Individual pyromancer piece odds use **the sequence of total outfit hits and the least-owned cycling rule**, rather than an incorrect independent 1/600 drop model. Dry calculations assume **zero prior ownership**.

## Common materials

If every rare check fails, the cart rolls the standard 25-ticket table.

| Outcome | Tickets |
| --- | ---: |
| Logs | 3 |
| Gems | 3 |
| Ores | 3 |
| Herbs | 3 |
| Seeds | 3 |
| Fish | 3 |
| Coins (2,000–4,999) | 5 |
| Saltpetre (3–5) | 1 |
| Dynamite (3–5) | 1 |

For materials, the simulator accepts **Woodcutting, Crafting, Mining, Herblore, Farming, and Fishing** levels at the time of opening, in the same way the cart uses the player's skills **when rewards are claimed**, not when earned. Material types and quantities are based on the OSRS Wiki reward list; minimum published eligibility levels are enforced (such as 50 Woodcutting for magic logs and 60 Mining for runite ore).

**Accuracy boundary:** Jagex has not published the exact per-item skill-level weight formulas. Within each material category, this simulator uses a level-sensitive approximation that increasingly favors higher tiers. The six category probabilities, the coin/saltpetre/dynamite outcomes, the rare-item check rates, and their ordering are the published values, but the **relative frequencies of individual logs, ores, gems, herbs, seeds, and fish are estimates**. Do not use this simulator as an exact predictor of ordinary-material GP value.

## Local development and testing

The page is entirely client-side. Local PNG icons are sourced from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db). Start a local static server from the repository root and open `/wintertodt/`.

Run `node --test tests/wintertodt.test.mjs` to test the sequential rare table, ownership conversions, pyromancer distribution and main-page integration.

References: [OSRS Wiki — Reward Cart](https://oldschool.runescape.wiki/w/Reward_Cart), [Wintertodt](https://oldschool.runescape.wiki/w/Wintertodt).
