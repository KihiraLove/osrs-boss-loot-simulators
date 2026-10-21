# Scurrius

[Open Scurrius simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/scurrius/) · [All simulators](../README.md)

## Mechanics and drop rates

[Scurrius](./) has a standalone loot simulator and dry calculator. Choose **Solo / MVP** (default) or **Non-MVP** before entering kill count. The two modes have distinct, mutually exclusive common-loot tables. Solo/MVP uses a **100-ticket** table and guarantees one big bones and one raw rat meat per kill. Non-MVP uses a **33-ticket** table with a one-ticket no-extra-item outcome, and guarantees only big bones. Quantity ranges are rolled inclusively.

The only two collection-log rewards are **Scurrius' spine (1/33)** and the **Scurry pet (1/3,000)**. Spine can be awarded to MVP or non-MVP, though only one recipient may obtain it per group kill. Scurry only rolls for MVP. The other independent MVP tertiary rewards are medium clue scroll (1/25, or **1/23** with Medium Combat Achievements), long bone (1/400) and curved bone (1/5,012.5). Non-MVP does not receive these other tertiary rolls. MVP's standard common rolls follow the 100-ticket table; non-MVP has a different common-loot distribution.

The dry calculator accepts the number of received collection-log rewards and reports probabilities of fewer, exactly, and more drops alongside expected quantities and odds of at least one. For MVP, the total count combines two independently rolled rewards, which can occur on the same kill. In non-MVP mode, Scurry is unavailable and only the spine counts.

This models one eligible player's loot, **not** simultaneous group distributions, damage shares, or loot awarded to other players. MVP pet eligibility and the single-spine-per-group rule apply to each kill independently. This frontend requires no runtime Wiki API and includes local PNG item assets.

Sources: [OSRS Wiki Scurrius](https://oldschool.runescape.wiki/w/Scurrius) and [Scurrius drop table](https://reldo.org/a/scurrius/).
