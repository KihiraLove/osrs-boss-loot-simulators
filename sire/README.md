# Abyssal Sire

[Open Abyssal Sire simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/sire/) · [All simulators](../README.md)

## Mechanics and drop rates

The [Abyssal Sire simulator and dry calculator](./) model the boss's **Unsired and Font of Consumption rewards separately**, in the same two-panel format as Yama's opening results. Every completed kill gives Abyssal ashes. An independent **1/100 Unsired pre-roll** replaces the ordinary weighted main loot roll if successful. The regular loot table has **139 tickets**, including herb, seed, talisman and shared rare-drop-table branches. Elite clues roll separately at 1/180 (or 1/171 with Elite Combat Achievements); Brimstone keys appear only with the Konar-task option at 1/40. The simulator assumes all eligible clues can be received.

Each simulated Unsired is offered to the Font for exactly one reward. The 128-ticket reward pool consists of **62 bludgeon-piece, 26 abyssal dagger, 13 Jar of miasma, 12 abyssal whip, 10 abyssal head, and 5 Abyssal orphan tickets**. Bludgeon components cycle through the three distinct parts without duplicates before a full set is completed. The pet can be obtained only once; after it appears, the reward pool has 123 tickets without the pet.

The dry calculator has **two independent groups**. Enter completed kills and Unsireds received to calculate Unsired odds (1/100 per kill); then enter the number of each Font reward received to calculate the corresponding odds from the **number of Unsireds**, not from kills. Bludgeon-piece dry probabilities account for no duplicates within each set, and the pet-restricted rewards account for the once-only pet. There is deliberately **no "any item" chance** for Font rewards, because every Unsired awards one item. Fewer-than, exactly, and more-than probabilities appear for each observation. The probabilities are marginals, not a combined probability of receiving the entire entered reward distribution.

All item icons are local PNGs sourced from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db), including the Abyssal orphan on the boss picker. Sources: [OSRS Wiki — Abyssal Sire](https://oldschool.runescape.wiki/w/Abyssal_Sire) and [Unsired](https://oldschool.runescape.wiki/w/Unsired).
