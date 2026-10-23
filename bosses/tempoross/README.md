# Tempoross — Reward pool

[Open the Tempoross reward-pool simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/tempoross/) · [All simulators](../../README.md)

Simulate **reward permits (reward pool searches)**, not completed Tempoross games or boss kill count. Each permit consumes one pool pull and yields one displayed reward. You can simulate any number from 0 to 1,000,000; the actual pool stores at most 8,000 unclaimed permits at a time.

## Loot simulator

Enter the number of **reward pool pulls** and your **base Fishing level when claiming them** (35–99). Boosts do not change pool rewards. The correct fish table is selected for Fishing levels **35–39, 40–45, 46–49, 50–75, 76–78, 79–80 and 81–99**; 81+ is required for raw manta ray.

Rarity of special rewards per permit:

| Reward | Chance | Quantity |
| --- | --- | --- |
| Soaked pages | 149/8,000 | 5–9 |
| Fish barrel | 1/400 | 1 (once only) |
| Tackle box | 1/400 | 1 (once only) |
| Big harpoonfish | 1/1,600 | 1 |
| Tome of water (empty) | 1/1,600 | 1 |
| Dragon harpoon | 1/8,000 | 1 |
| Tiny tempor | 1/8,000 | 1 |

Fish barrels and tackle boxes are protected against duplicate acquisition: their **second and later rolls give 25 soaked pages** instead. The two *Already own* checkboxes allow that behavior to start before the first simulated pull. **Big harpoonfish can drop again**; it is not converted into soaked pages on repeat pulls.

Common rewards include **32–64 spirit flakes** (published 1/4), **reward-pool caskets** (published 1/20, kept unopened), the level-specific noted fish, planks, oak planks, seaweed, steel nails, feathers and fishing bait. The fish quantities and relative weights come from the Wiki's level brackets; for example, at 81+ Fishing, bass/swordfish/shark/sea turtle/manta ray drop with relative weights **900:810:720:630:540** and stacks **30–40, 20–30, 10–20, 7–12, 5–10**. Spirit angler outfit pieces are purchased or upgraded with spirit flakes; they do not drop directly from reward-pool pulls.

### Rate reconciliation and assumption

The Wiki's listed common fish/other/flake/casket probabilities already total 100% of one roll, while its additional rare-reward probabilities total **201/8,000**. Because those observations do not describe a single exclusive table unambiguously, the simulator uses an explicit **rare-priority approximation**: roll the published rare probabilities first (without rescaling them); if none succeeds, pick exactly one ordinary reward using the Wiki's original common *relative weights*. This slightly reduces the modeled absolute chance of fish, flakes, caskets and supplies (by **201/8,000 = 2.5125%**) versus the published standalone frequencies. The simulator awards **one outcome per permit**, not a guaranteed common reward plus a second rare. This approximation is documented rather than presented as an exact reconstruction of game code.

## Dry calculator

Enter your number of pulls and how many **fish barrels, tackle boxes, big harpoonfish, tomes of water, dragon harpoons, Tiny tempors, spirit-flake bundles and caskets** were received. For each, the page shows expected drops, chance of at least one, and probabilities for **fewer than / exactly / more than** the received count.

- Fish barrel and tackle box use the **first-success geometric model** with at most one obtainable drop, starting with neither owned.
- Other rewards use binomial odds over permits at their modeled rate. The casket/flake rates are scaled by the no-rare probability to match the simulation's one-outcome assumption.
- Soaked pages are shown in simulated loot but excluded from the dry calculator: duplicate barrel/tackle rolls convert into stacks of 25, changing their distribution based on what is already owned.

Caskets are **not automatically opened**, and fishing experience, point-to-permit conversion, and post-simulation sales are not included.

Sources: [OSRS Wiki — Reward pool](https://oldschool.runescape.wiki/w/Reward_pool), [OSRS Wiki — Tempoross](https://oldschool.runescape.wiki/w/Tempoross). Images are local PNG sprites from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db).
