# Thermonuclear Smoke Devil

[Open Thermonuclear Smoke Devil simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/thermonuclear-smoke-devil/) · [All simulators](../../README.md)

## Loot simulator

Enter completed **Thermonuclear Smoke Devil** kills (0–1,000,000). This is the **boss**, not the ordinary, superior, or bloodthirsty smoke devil. The boss requires a smoke-devil Slayer task in the game; the simulator assumes all entered kills are valid.

Every kill gives **ashes** and one main reward. **Occult necklace (1/350)**, **smoke battlestaff (1/512)** and **dragon chainbody (1/2,000)** use a **pre-roll** that replaces the ordinary loot when it succeeds. The simulator models these three published marginal rates in a mutually exclusive pre-roll, not as three independently stackable rewards. If none succeeds, it draws from the published **107-ticket ordinary table**, with 2/107 tickets going to the shared gem subtable (including its nested rolls). Coins are uniformly rolled between **10,000 and 19,999**.

One otherwise-unlisted ordinary-table ticket represents the **5/856 chance of 30 noted raw sharks** or the **3/856 chance of 60 shark lures**. These two outcomes split a single **1/107 main-table branch** (5/8 versus 3/8). They are not independent extra drops.

### Tertiary rewards

These checks are independent of the pre-roll/ordinary drop and can coexist with it and with one another:

| Reward | Chance per kill |
| --- | --- |
| Jar of Smoke | 1/2,000 |
| Pet Smoke Devil | 1/3,000 |
| Hard clue scroll | 1/96, or 1/91 with Hard Combat Achievements |
| Elite clue scroll | 1/500, or 1/475 with Elite Combat Achievements |
| Brimstone key | 1/48, **only on a Konar Slayer task** |

You can enable **Hard Combat Achievements**, **Elite Combat Achievements**, and **Konar Slayer task** independently for the loot simulator. The simulator does not enforce whether you already hold a clue scroll and does not implement optional Ring of Wealth modifications to shared drop tables.

## Dry calculator

Enter the number received of each of the five chase drops: **occult necklace, smoke battlestaff, dragon chainbody, Jar of Smoke, and Pet Smoke Devil**. The calculator returns expected drops, the odds of fewer/exactly/more than that count, and the chance of at least one.

The three pre-roll uniques compete for the same main-reward slot, but the jar and pet are independently rolled tertiary items. The **Any rare reward** combined count distribution is therefore a convolution of a **Binomial(kills, 1/350 + 1/512 + 1/2,000)** variable with independent **Binomial(kills, 1/2,000)** jar and **Binomial(kills, 1/3,000)** pet variables. Up to three chase rewards may appear from one kill.

All loot simulation and calculations run locally with bundled PNG item sprites.

Sources: [OSRS Wiki — Thermonuclear smoke devil](https://oldschool.runescape.wiki/w/Thermonuclear_smoke_devil), [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db).
