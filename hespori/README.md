# Hespori

[Open Hespori simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/hespori/) · [All simulators](../README.md)

## Loot simulator

Enter completed **Hespori kills** and your **Farming level (65–99)**. Optionally enable the **full farmer's outfit** for the boosted Farming experience. The loot simulator combines all kills into a single inventory, and displays the total **Farming XP** gained while harvesting the Hespori after each fight.

Each kill produces three distinct reward mechanics:

1. **One anima-seed roll:** Attas, Iasor or Kronos, each equally likely (**1/3**) and awarding **1–2 seeds**. This is guaranteed even when the Bottomless compost bucket drops.
2. **One normal-seed-table reward:** first a **Bottomless compost bucket pre-roll (1/35)**. If successful, it replaces the standard seed roll. Otherwise, one of **32 seed types** is chosen using the published **80-ticket weighted seed table**, each at a quantity sampled uniformly within its listed inclusive minimum and maximum. For example, White lily seeds have **5/80** of the standard roll, in batches of **8–18**. Because the bucket precedes the standard table, the effective chance per kill of White lily seeds is **(34/35) × (5/80)**.
3. **Independent Tangleroot pet roll:** probability **1 / (7,000 − Farming level × 25)**, from **1/5,375** at level 65 to **1/4,525** at level 99.

The normal seed table contains allotment, flower, hop, bush, herb, tree, fruit-tree and special seeds. The simulator uses item PNG icons stored inside the repository; no runtime API call is needed.

Each harvest grants **12,600 Farming XP**, or **12,915 XP with the full farmer's outfit**. The outfit affects experience, not loot probabilities. Growth time (32 hours), planting experience, available Hespori seeds and boss-fight success are not simulated.

## Dry calculator

Enter your Hespori kills, Farming level, and the actual **number of Bottomless compost buckets and Tangleroot pets** received. For each, the calculator displays the expected number, probability of receiving fewer, exactly, or more than that amount, and the probability of receiving at least one.

A combined **Bucket or Tangleroot** card evaluates the total received across both items. Because the bucket and pet rolls are independent, both can appear on a single kill: the combined distribution is the convolution of their two binomial distributions, rather than a single binomial with their probabilities added.

Anima seeds are guaranteed each kill but have quantities of 1–2, while main-table seed drops arrive in variable stack sizes. They are therefore displayed in the loot simulator but **not treated as binary drop counts in the dry calculator**.

## Sources

- [OSRS Wiki — Hespori](https://oldschool.runescape.wiki/w/Hespori)
- [OSRS Wiki — Tangleroot](https://oldschool.runescape.wiki/w/Tangleroot)
- [OSRS Reboxed item icons](https://github.com/RSPSApp/osrsreboxed-db)

The Wiki's weighted seed table and pre-roll probabilities are based partly on the crowdsourced Drop Rate Project.
