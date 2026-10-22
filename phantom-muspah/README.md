# Phantom Muspah

[Open Phantom Muspah simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/phantom-muspah/) · [All simulators](../README.md)

## Loot simulator

Each completed Phantom Muspah kill independently rolls the boss's 100-ticket primary unique table. **Ancient essence** is the standard reward: **540–599 (60/100)**, **885–995 in steps of 5 (23/100)**, or **1,970–2,060 in steps of 10 (10/100)**. Otherwise the kill awards a **frozen cache (4/100)**, **ancient icon (2/100)**, or **Venator shard (1/100)**. These six outcomes are mutually exclusive; the ancient-essence variants combine to **93/100**. **A Venator shard prevents all accompanying regular loot for that kill**, so the simulator stops further rolls for that kill when it appears.

Non-shard kills normally receive **two independent rolls on the 235-ticket ordinary-drop table**. Each kill has a **2/9 chance of receiving a three-item supplies bundle instead of one ordinary roll**, leaving one standard roll. The bundle contains either **4–6 sharks or 4–6 summer pies**, either **1–2 ancient brews(3) or 1–3 ranging potions(3)**, and either **2–3 super restores(3) or 2–3 prayer potions(3)**. Different reward groups are independently randomized; each pair is equally likely.

The ordinary-drop table includes weapons, runes, ores, planks, seeds, herbs, shark drops, and a rare-drop-table branch. The 235 tickets include a combat-herb subtable (5 tickets), rare seed subtable (5 tickets), and the normal rare-drop-table (5 tickets). The shark drop branch is **10 tickets**, split **3.75/3.75/2.5** among raw shark, shark lure, and manta ray. Seed probabilities are derived from the Wiki's rounded effective chances and may vary slightly due to published rounding. The shared rare-drop-table implementation follows the existing Cerberus simulator and does not model ring-of-wealth changes.

**Muphin** has a 1/2,500 tertiary roll per non-shard kill in the simulator. Hard clues roll at **1/30** (or **1/28** with hard Combat Achievements); elite clues at **1/45** (or **1/42** with elite Combat Achievements). Enabling a **Konar Slayer task** adds a **1/50 brimstone key** roll. The simulator does not enforce clue-scroll inventory limits. The pet and tertiary draws are skipped on shard kills to honour the published no-other-loot rule.

**Charged ice** is a *conditional, one-time* tertiary reward rather than a random drop. Enable its option only if **at least one of your simulated kills is under 3:00 and you have not already obtained/used it on Muphin**. The simulator adds **one** eligible Charged ice for a nonzero kill count. It does not infer kill times automatically.

## Dry calculator

Supply your number of **frozen caches, ancient icons, Venator shards, and Muphin pets**, and the calculator returns expected counts and the chances of fewer, exactly, or more than the specified amount, plus the probability of at least one. Each rare item uses a binomial distribution over completed kills. The fixed per-kill rates used are **4/100** (cache), **2/100** (icon), **1/100** (shard), and **0.99 × 1/2,500** (Muphin, conditional on not rolling the shard). Ancient essence and Charged ice are shown in the loot simulator but are not dry-calculator inputs.

## Sources

- [OSRS Wiki — Phantom Muspah](https://oldschool.runescape.wiki/w/Phantom_Muspah)
- [RSPSApp osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db) for item IDs and the local PNG sprites

The model reflects the documented full boss kill loot rather than opening frozen caches; rewards inside caches are not simulated or automatically opened.
