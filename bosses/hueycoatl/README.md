# The Hueycoatl

[Open the Hueycoatl simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/hueycoatl/) · [All simulators](../../README.md)

## Loot simulator

Enter **solo KC (100% contribution)**, **duo KC (50%)** and **trio KC (33%)** separately. The simulator rolls each encounter using its individual contribution and adds everything into **one combined inventory**. A solo kill counts as one solo event, not as multiple trio events. The 33% contribution setting uses **exactly 0.33** rather than one-third.

### Uniques

Each player independently gets a unique-table roll at **1/18 × their personal contribution**. One successful unique roll gives one item type, with mutually exclusive conditional weights **6/35 dragon hunter wand**, **22/35 Hueycoatl hide**, and **7/35 Tome of Earth (empty)**. Each hide unique yields **3 hides**, regardless of team size.

| Reward | Solo 100% | Duo 50% | Trio 33% |
| --- | --- | --- | --- |
| Any primary unique | 1/18 | 1/36 | 0.33/18 |
| Dragon hunter wand | 1/105 | 1/210 | 0.33/105 |
| Hueycoatl hide (3) | 11/315 | 11/630 | 0.33 × 11/315 |
| Tome of Earth (empty) | 1/90 | 1/180 | 0.33/90 |
| Huberte | 1/400 | 1/800 | 0.33/400 |

**Huberte is a separate tertiary roll**, scaled by personal contribution, so it can appear together with a primary unique.

### Ordinary loot and tertiary drops

One ordinary item is selected using the **68-ticket weighted main table** per kill (with the published weight and range for each of 26 items). Its **quantity**, not the ordinary item's table weight, is reduced for group kills. To approximate the undocumented quantity mechanics, the simulator uniformly chooses within the published solo range, multiplies the quantity by 0.50 or 0.33, rounds, and ensures at least one item. All three modes use their own separate ordinary rolls, summed afterwards.

The following tertiary drops are separate from primary uniques and ordinary loot:

- **Tooth half of key (moon key): approximately 1/75 for each participant**, without contribution scaling.
- **Hard clue scroll: 1/50**, or **1/47** when Hard Combat Achievements are enabled, irrespective of the contribution selection.
- **Big bones (1)** for the **MVP**. Solo encounters guarantee MVP status and big bones; for duo and trio, the simulator does not award group MVP bones because MVP identity cannot be determined from percentage alone.

This simulator assumes the player **qualifies for normal loot**, has not triggered the boss's low-damage penalty, and receives the stated contribution percentage. It does not simulate the **MVP's separate 10% unique boost**, group-specific MVP determination, the exact distribution of shared ordinary loot quantities, or clue-scroll inventory restrictions.

## Dry calculator

Enter the number of individual dragon hunter wands, tomes, Huberte pets, and **individual Hueycoatl hides (multiples of three)** obtained from the **combined** solo, duo and trio KC. The calculator uses each mode's **different contribution-scaled per-kill rates** and convolves the three independent binomial distributions. For each item it reports:

- Expected item quantity.
- Probability of obtaining **fewer than, exactly, or more than** the entered quantity.
- Probability of obtaining **at least one**.

The **Any primary unique** summary counts unique **occurrences** (one for each wand/tome/hide triple), not the raw number of hides. This preserves mutual exclusivity of the three primary unique rewards per encounter. Huberte remains an independent reward and is not included in the primary-unique summary.

## Drop sources

The [OSRS Wiki — The Hueycoatl](https://oldschool.runescape.wiki/w/The_Hueycoatl) documents the 2025 unique-table buffs and contribution scaling. Item PNGs come from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db). This simulator runs entirely client-side without a live Wiki/API dependency.
