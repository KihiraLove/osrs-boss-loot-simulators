# Amoxliatl

[Open Amoxliatl simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/amoxliatl/) · [All simulators](../../README.md)

## Mechanics and drop rates

The [Amoxliatl loot simulator and dry calculator](./) model the **repeatable post-quest boss**, rather than quest-only encounters. Every completed kill produces **two independent primary-table rolls (58 tickets per roll)** and **one guaranteed frozen-tear roll**: 2–4 tears at 6/10, 5–10 at 3/10, or 10–20 at 1/10. The primary table includes rune equipment, runes, ores, blessed bone shards, supplies, Huasca seeds, and a 2/58 gem-table branch. The gem table preserves its "Nothing" possibility; ring-of-wealth modifications are not modelled. Noted items are aggregated as their ordinary item icons.

The independently rolled tertiary rewards are **Pendant of ates (inert), 1/25**; **Glacial temotli, 1/100**; **Moxi, 1/3,000**; and **Tooth half of key (moon key), 1/125**. The separate elite clue scroll chance is 1/200, increasing to 1/190 with the optional Elite Combat Achievements setting. A Konar task checkbox enables Brimstone keys at 1/54. The special guaranteed elite-clue-task drops are not represented, and the model assumes an eligible clue can always drop. The moon-key-half rate follows current post-quest drop listings at 1/125 rather than an older approximate 1/500 value.

The dry calculator takes kills and observed counts for the four tertiary rewards and displays the probability of **fewer than, exactly, or more than** the observations. The **Any signature reward** card combines Pendant, Glacial temotli and Moxi using three independent binomial distributions; a single kill can grant several of these rewards. The moon-key half is shown individually but excluded from that summary. Each individual card is a *marginal* probability, not the joint probability of the full observed set.

All icons are local OSRS PNGs from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db), including Moxi on the boss picker. Sources: [OSRS Wiki — Amoxliatl](https://oldschool.runescape.wiki/w/Amoxliatl), [KURU Amoxliatl drop table](https://kuru.co.kr/en/verticals/osrs/monster/amoxliatl/), and [Moon key half drop references](https://osrsindex.com/wiki/tooth-half-of-key-moon-key?site=osrs_wiki).
