# Grotesque Guardians

[Open Grotesque Guardians simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/grotesque-guardians/) · [All bosses](../README.md)

## Loot simulator

Each completed Grotesque Guardians kill awards **50–100 granite dust**, followed by **two independent main loot rolls**. Every main roll can award at most one rare or one ordinary-table result. The simulator combines the quantities from both rolls and from all kills into one inventory. A kill can award two uniques, including duplicate uniques.

### Main-table uniques

| Item | Per main roll | Expected drops per kill |
| --- | ---: | ---: |
| Granite maul | 1/250 | 2/250 |
| Granite gloves | 1/500 | 2/500 |
| Granite ring | 1/500 | 2/500 |
| Granite hammer | 1/750 | 2/750 |
| Black tourmaline core | 1/1,000 | 2/1,000 |

The five mutually exclusive unique probabilities are checked first on each roll. When none occurs, the simulator picks one of the **142 ordinary-table tickets**. This preserves the main-table composition and avoids allowing a unique and ordinary item from the same main roll. Consequently individual common-item probabilities are multiplied by **(1 minus the per-roll unique probability)**, a small difference from the wiki's independently presented main-table weights.

Main-table rewards include weapons, armour, resources, two possible coin-stack quantities, and supplies. The **six-ticket potion outcome** provides *all three* items together: magic potion(2), ranging potion(2), and super combat potion(2). **Four tickets** lead to the shark subtable, split 1.5/1.5/1 between 20 raw sharks, 40 shark lures, and 20 raw sea turtles.

### Tertiary drops

These rolls are made **once per kill**, separately from the two main-table rolls:

- **Noon** (the pet, which can transform into Midnight): 1/3,000.
- **Jar of stone**: 1/5,000.
- **Elite clue scroll**: 1/230, or 1/218 with elite Combat Achievements unlocked.
- **Brimstone key**: 1/44, only when the **Konar Slayer task** option is enabled.

The simulator does not attempt to enforce clue-scroll inventory restrictions.

## Dry calculator

Enter received counts for the five signature uniques, **Adamant boots**, **Noon**, and **Jar of stone**. The calculator shows the expected number and probabilities of finding fewer, exactly, or more than each count. It also provides an **Any primary unique** calculation across the five signature uniques.

For the five signature items, the distribution is **Binomial(2 × kills, per-roll rate)**, not Binomial(kills, per-roll rate). The Adamant boots ordinary-table outcome likewise uses two trials per kill, adjusted for the preceding unique check. Noon and Jar of stone instead use **Binomial(kills, per-kill rate)**. Any primary unique uses the sum of the five mutually exclusive per-roll unique probabilities. A stable binomial evaluator covers up to one million kills (two million main rolls).

Granite dust is guaranteed and therefore omitted from the dry calculator.

**Sources:** [OSRS Wiki — Grotesque Guardians](https://oldschool.runescape.wiki/w/Grotesque_Guardians), [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db).
