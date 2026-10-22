# Giant Mole

[Open Giant Mole simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/giant-mole/) · [All simulators](../README.md)

## Loot simulator

Each completed **Giant Mole** kill grants **one big bones, one mole claw, and one to three mole skins**, plus **one roll on a weighted 131-ticket ordinary drop table**. The amount of mole skin is chosen uniformly from 1, 2, or 3. Mole parts become *noted* after the Hard Falador Diary, but the number of parts does **not** change; therefore no diary toggle is needed to calculate quantities. The model counts collected items, not the time required to pick them up.

The main table uses the published weights for weapons, armour, runes, arrows, seeds, supplies, and other drops. It includes the **rare-drop branch (4/131)** and **gem branch (6/131)**. These branch into the appropriate shared tables: rare drop (128 weighted tickets), gem (128), mega-rare (128), and talisman (70). A branch may return nothing; one kill never takes two ordinary-table outcomes. The normal roll and the tertiary rolls are independent.

The independent tertiary drops are:

| Item | Chance per kill |
| --- | --- |
| Immaculate mole skin | **1/50** |
| Long bone | 1/400 |
| Baby Mole (pet) | **1/3,000** |
| Curved bone | 1/5,012.5 |
| Elite clue scroll | 1/500; **1/475** with elite Combat Achievements |
| Brimstone key | **1/74** only when assigned a Konar Slayer task |

The elite Combat Achievements and Konar task options apply only to their corresponding tertiary rates. Immaculate mole skin, introduced in May 2026, can be used to create the gem sack; it is a **separate** tertiary roll, not a replacement for normal mole skins.

## Dry calculator

Enter Giant Mole kills and the number of **Immaculate mole skins** and **Baby Mole pets** received. For each, the calculator reports the expected count and probabilities of getting *fewer*, *exactly*, or *more* than your actual count, plus the chance of receiving at least one.

Each is an independent binomial calculation using **1/50** for Immaculate mole skin and **1/3,000** for Baby Mole. Always-dropped mole claws and skins do not have useful dry odds and are excluded.

## Data, scope, and assumptions

- The simulation assumes each entered kill is complete and the player receives the eligible drops.
- The simulation uses default unboosted rare-drop and gem tables, without Ring of Wealth modifications; it does not track clue-scroll inventory restrictions.
- Item icons are stored in [`../assets/items/`](../assets/items/) as local PNG files. No remote API is needed to run the simulator.
- Source: [OSRS Wiki — Giant Mole](https://oldschool.runescape.wiki/w/Giant_Mole), including the [Immaculate mole skin](https://oldschool.runescape.wiki/w/Immaculate_mole_skin) update; [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db) for icon data.
