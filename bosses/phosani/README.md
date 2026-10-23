# Phosani's Nightmare

[Open Phosani's Nightmare simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/phosani/) · [All simulators](../../README.md)

## Mechanics and drop rates

The Phosani-only [simulator and dry calculator](./) use the solo boss's own drop table, not the regular Nightmare's. Each kill awards Big bones and one common-loot roll. The staff/armour/mace table rolls at **1/140** and the separate orb table at **3/1,600**; both can award a signature drop on the same kill. Staff/armour/mace selection uses the April 2026 Mod Ash confirmation, including the 8% staff-to-mace swap.

Common loot uses Phosani-specific quantity ranges. The Wiki's displayed common-table weights are **rounded** and add to 101%, so they are normalized as relative weights. Each simulated session starts at zero kill count. The Slepey tablet receives its random 1/25 roll, with a first tablet guaranteed by kill 25 if none previously dropped. Optional Elite Combat Achievements change the elite clue rate from 1/35 to 1/33. Elite clue ownership, prices, and previous account history are not tracked.

The dry calculator supports the eight signature drops plus the Little nightmare pet, Parasitic egg and Jar of dreams. The **Any signature unique** result is the total count across the eight signature items, calculated by convolving the two independent table-roll distributions; a single kill can produce two such items. The pet, egg and jar have independent odds. Tablet guarantee and clues are not part of the dry calculator. All calculations and item image loading run locally. The item inventory sprites are stored under `../../assets/items` (sourced from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db)), including the Little nightmare pet icon used in the boss selector. No Wiki image or rate requests are made at runtime.
