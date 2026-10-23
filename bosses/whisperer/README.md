# The Whisperer

[Open The Whisperer simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/whisperer/) · [All simulators](../../README.md)

## Loot simulator

Enter your completed Whisperer kills and select **normal** or **awakened** encounters. Optional **perfect kills** use the increased ordinary-drop quantities (50% more, subject to the game's rounding) without boosting uniques, tertiary loot or supplies. An optional **Konar Slayer task** rolls a **1/50 brimstone key** on normal encounters only; Slayer tasks do not apply to awakened kills.

The primary loot is resolved as **successive exclusive rolls**, in this order:

1. **Tradeable uniques:** **1/64** per normal kill or **3/64** awakened. On success, **3/8** advances the hidden Bellator vestige, **3/8** gives a chromium ingot, **1/8** gives **Siren's staff**, and **1/8** gives one random Virtus robe piece (each piece 1/3).
2. **Awakener's orb:** 1/34 attempt, only if the unique roll fails (effective normal rate about 1/34.5).
3. **Sirenic tablet:** first-only base 1/25 attempt, with unknown pity scaling.
4. **Shadow quartz:** base 1/200 attempt, with a first-drop improvement over the first 300 KC.
5. **Supplies:** 1/5 attempt awarding **3–4 manta rays, one prayer potion(3), and one ancient brew(2)** together.
6. **Ordinary loot:** a 100-ticket table with separate normal and perfect-quantity outcomes.

The hidden Bellator vestige roll is **3/512** on normal kills or **9/512** on awakened kills. The **first** vestige hit produces **one gold ring**, the **second** two gold rings, and the **third** awards one **Bellator vestige** and resets progress. Its nominal long-run drop rate is **1/512** normally or **3/512** awakened, but vestige drops **are not independent per-kill 1/512 events**. The simulator shows the remaining hidden progress, 0–2 hits.

**Wisp (1/2,000)** and a **clue scroll (1/40)** are rolled separately from the primary drop. Easy, medium, hard, and elite clues have equal chances (1/160 each without Combat Achievement rewards). No clue-scroll inventory limitation or the conditional last-awakened-boss Ancient blood ornament kit is modeled.

The ordinary table contains 25 published items with ticket weights adding to **78 out of 100**. We preserve their stated probabilities, with **22/100 tickets remaining unspecified/no modeled standard loot** rather than rescaling 78 tickets to 100. Examples include battlestaves (70 or 105), coal (303 or 455), and soul runes (933 or 1,400) for normal/perfect kills respectively.

### First-drop limitations

The Sirenic tablet chance improves at an unpublished rate until the first tablet; none can drop subsequently. The simulator uses the base **1/25** attempt up to the first drop, without inventing the unknown pity formula.

Before the first Shadow quartz, its drop rate improves from **1/200** to **1/50** by kill count 300. The exact intermediate formula is not published; the simulator uses a **linear interpolation of the denominator** over the first 300 kills. After the first quartz, the roll resets to **1/200**. The resulting intermediate rates are approximations, not confirmed game internals.

## Dry calculator

Enter counts for the **Bellator vestige, chromium ingot, Siren's staff, the three Virtus pieces, Wisp, and Awakener's orb**. For each, the calculator shows expected drops and probabilities for fewer, exactly, or more than the entered count and at least one.

The Bellator vestige uses **floor(Binomial(kills, 3/512) / 3)** for normal kills or **floor(Binomial(kills, 9/512) / 3)** awakened, assuming no prior hidden progress. Modeling independent 1/512 vestige drops would significantly misstate dry odds. Other included items use their individual effective binomial drop rates. First-only Sirenic tablets and first-drop-scaling Shadow quartz are deliberately excluded from dry inputs.

Sources: [OSRS Wiki — The Whisperer](https://oldschool.runescape.wiki/w/The_Whisperer) and [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db). 
