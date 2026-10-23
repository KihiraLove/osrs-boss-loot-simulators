# Sarachnis

[Open Sarachnis simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/sarachnis/) · [All simulators](../../README.md)

## Loot simulator

Enter **Sarachnis kill count** to simulate the boss's loot, including its Sarachnis cudgel, Sraracha pet, Jar of Eyes, Pristine spider silk, ordinary drops, herbs and tertiary rewards. The simulator runs entirely in the browser and loads all its item artwork from the repository's local PNG assets.

### Main and herb rolls

Each kill first gets an **exclusive pre-roll** with **2/384 dragon med helm** and **1/384 Sarachnis cudgel**. If the pre-roll does not trigger, an ordinary reward is rolled from a **100-ticket table**. The listed item entries total 84 tickets and the gem and rare-seed subtables take another 3 tickets; the remaining **13/100 tickets are modeled as unspecified/no listed loot**, so published probabilities are not incorrectly renormalized. The shared gem and rare-seed branches use their own respective weights.

The **independent herb roll** uses 800 weighted tickets: 80 for eight types of grimy noted herbs and 720 for no herbs. The amount is an inclusive random quantity within the published range, for example 10–15 grimy kwuarm.

### Tertiary rolls

The following rolls are separate from primary and herb loot, so multiple items can appear on the same kill.

| Reward | Drop rate |
| --- | --- |
| Tattered page (one of three) | **1/5 total** |
| Giant egg sac(full) | 1/20 |
| Grubby key | 1/15 |
| Pristine spider silk | 1/50 |
| Hard clue scroll | 1/40 (or **1/38** with hard Combat Achievements) |
| Elite clue scroll | 1/60 (or **1/57** with elite Combat Achievements) |
| Jar of Eyes | 1/2,000 |
| Sraracha | 1/3,000 |
| Brimstone key | **1/57**, only with **Konar Slayer task** enabled |

Tattered moon, sun and temple pages **share one 1/5 roll**; the resulting page is chosen uniformly from the type(s) the simulated character currently has the fewest of. Each new simulation assumes **zero existing pages**. It does not track page counts from the user's actual bank, nor clue-scroll inventory limitations.

## Dry calculator

Enter the number of **Sarachnis cudgels, Pristine spider silks, Jars of Eyes and Sraracha pets** received alongside completed kill count. For each reward, the calculator gives:

- Expected number of drops.
- Chance of receiving **fewer**, **exactly** or **more** than your entered number.
- Chance of obtaining **at least one**.

The model uses a binomial distribution with each item's own per-kill rate. The cudgel uses its exclusive pre-roll rate of **1/384**; the other rewards are independent tertiary rolls. Combat Achievement and Konar options affect only tertiary clue/key loot, not these dry-calculator rewards.

### Sources and limitations

Rates and quantities: [OSRS Wiki — Sarachnis](https://oldschool.runescape.wiki/w/Sarachnis); item sprites: [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db). As the Wiki lists only 87 tickets out of the 100 ordinary-table tickets, the unspecified portion is modeled as empty. Instances, supply consumption, respawn duration, and item prices are not simulated.
