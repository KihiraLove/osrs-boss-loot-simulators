# OSRS Nex — nihil-shard-based loot simulator

[Open Nex simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/bosses/nex/) · [All simulators](../../README.md)

Drop data and mechanics come from the **Old School RuneScape Wiki**. This calculator does not use RuneScape 3 Nex tables, Pernix or Virtus armour, or the RuneScape 3 Zaryte bow.

Unlike other bosses on this site, **Nex uses only the number of nihil shards received from Nex** as input. There is **no kill-count or team-size input**. Her loot and rare-item odds depend on your damage contribution, which varies with team size and performance.

## Why shard-based odds are approximate

The OSRS Wiki lists two nihil shard drops from Nex: **80–85 shards at 5/82** and **85–95 shards at 8/209** per full kill. Their expected amount is

\[
E[\text{shards per whole-team kill}]
=\frac{5}{82}\cdot82.5+\frac{8}{209}\cdot90
\approx 8.4755.
\]

The estimate of personal *contribution-equivalent full kills* is:

\[
E_{\rm share}=\frac{\text{nihil shards received from Nex}}{8.4755}.
\]

This is **not your actual KC**, and it is not a reconstruction of actual contributions. In particular, a shard bundle may be large and infrequent, shard quantities are divided among participants, MVP gets extra common quantity and unique chance, and players can get shards from **Blood Reavers and spiritual creatures** in the Ancient Prison. Enter only shards that came from **Nex drops**, not loot from minions, trades or purchases. Shard-based exposure is noisy, especially for small totals. It should **never be represented as exact personal drop-rate odds**.

## Unique drop model

The Wiki reports an effective **1/43 base unique rate per kill**, allocated through individual player rolls based on contribution. Multiple players can receive unique rewards in the same kill. The MVP receives a 10% bonus to their unique chance; shard-only input cannot reconstruct that bonus. The six reward weights total 12:

| Unique | Weight | Whole-team equivalent rate |
| --- | ---: | ---: |
| Ancient hilt | 1 | 1/516 |
| Nihil horn | 2 | 1/258 |
| Torva full helm (damaged) | 2 | 1/258 |
| Torva platebody (damaged) | 2 | 1/258 |
| Torva platelegs (damaged) | 2 | 1/258 |
| Zaryte vambraces | 3 | 1/172 |

The **Nexling** is also simulated separately as a tertiary at **1/500**; shard-only exposure cannot reconstruct precise per-player pet eligibility or MVP effects.

Using exposure instead of actual integer kills means the simulator uses a **Poisson approximation** for event counts:

\[
\lambda_{\mathrm{item}}=E_{\rm share}\cdot p_{\mathrm{item}}
\qquad\text{and}\qquad
P(X=k)\approx e^{-\lambda}\frac{\lambda^k}{k!}.
\]

The **Any unique** dry card combines only the **six unique-table rewards**, not the pet. It uses \(\lambda=E_{\rm share}/43\). The calculator shows expected copies, at least one, fewer / exactly / more copies than entered. All probabilities are approximations, not exact binomial odds, conditional on the shard-based exposure estimate.

## Loot simulation

The simulator displays the provided **nihil shards unchanged**, never rerolls their total. It separately simulates the six rare-table rewards and Nexling from the estimated exposure.

Other documented rates used where possible: **blood essence 1/82**, **rune sword 1/209**, **elite clue 1/48**, improved to **1/45** with elite Combat Achievements.

### Illustrative common loot

The Wiki documents **two guaranteed common drops per Nex kill**, but does **not** publish exact numeric weights for many common items. We therefore display a separate **Illustrative common loot** section using approximately two rolls per contribution-equivalent full kill and manually assigned category weights. It covers runes, bolts, air orbs, coal, runite ore, gems, wine of Zamorak, sharks with prayer potions, Saradomin brews with super restores, ecumenical key shards, and coins.

**These weights and inferred common item quantities are illustrative, not actual Nex common-drop rates.** They are separate from the guaranteed input shards, the accurately documented special rates, and unique estimates. We do not simulate guaranteed MVP-only big bones or claim to infer any real number of encounters.

Local PNG sprites are from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db), and no browser-time Wiki requests are made.

Sources: [Nex on the OSRS Wiki](https://oldschool.runescape.wiki/w/Nex), [Nihil shard](https://oldschool.runescape.wiki/w/Nihil_shard), [Nex (team) contribution guide](https://oldschool.runescape.wiki/w/Money_making_guide/Killing_Nex_%28Team%29).
