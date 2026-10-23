# Venenatis and Spindel

[Open Venenatis and Spindel simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/venenatis-spindel/) · [All simulators](../../README.md)

## Mechanics and drop rates

The [Venenatis and Spindel simulator](./) takes **separate KC for each boss** and merges their randomized rewards into a single loot inventory. Each boss uses its own ordinary table (**126 tickets for solo Venenatis and 128 for Spindel**) and its own unique rates. The six shared collection-log items appear at the top; all sprites are local.

The five primary unique items are mutually exclusive within a kill. Venenatis / Spindel rates: **Fangs of Venenatis 1/196 / 1/618; dragon 2h sword 1/256 / 1/358; dragon pickaxe 1/256 / 1/358; Voidwaker gem 1/360 / 1/912; treasonous ring 1/512 / 1/716**. The independent **Venenatis spiderling** pet chance is **1/1,500 / 1/2,800**, allowing the pet to drop alongside a primary unique. Guaranteed big bones are included per kill, alongside an independent 1/3 supply roll, looting bag 1/3, strange fruit 1/5, elite clue 1/100; long/curved bones are rolled for Venenatis.

The **combined dry calculator** takes both KC values and the user's obtained quantities for each rare item. It calculates each exact-count distribution as `Binomial(Venenatis KC, Venenatis rate) + Binomial(Spindel KC, Spindel rate)`, accounting for the distinct rates rather than averaging them. The combined any-unique distribution also permits the independent pet and one primary unique on the same kill. It reports expected drops, probabilities of fewer/exact/more and at least one.

This model assumes **solo Venenatis contribution and full loot eligibility**. Group contribution scaling, Combat Achievement / imbued ring clue boosts, clue scroll ownership, and conditional Slayer-task rewards (Konar or Krystilia) are not modeled. It does not change existing Callisto/Artio behavior.

Sources: [OSRS Wiki Venenatis](https://oldschool.runescape.wiki/w/Venenatis), [OSRS Wiki Spindel](https://oldschool.runescape.wiki/w/Spindel), [Venenatis drop table](https://reldo.org/a/venenatis/), [Spindel drop table](https://reldo.org/a/spindel/).
