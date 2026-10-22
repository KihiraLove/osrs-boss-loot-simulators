# The Leviathan

[Open The Leviathan simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/leviathan/) · [All simulators](../README.md)

## Loot simulator

Enter your kill count and choose **normal** or **awakened** Leviathan encounters. Optional **perfect kills** use the improved quantities of the ordinary loot table (for example, 195 or 292 coal), without modifying the unique, supply or pet rates. **Konar Slayer task** adds an independent **1/50 brimstone key** chance for normal encounters only; the toggle is disabled in awakened mode.

The primary loot is resolved as a **sequential, exclusive** selection:

1. **Tradeable unique table:** **1/96** for normal kills; **1/32** for awakened kills. If selected, **3/8** advances hidden Venator vestige progress, **3/8** gives a chromium ingot, **1/8** gives Leviathan's lure and **1/8** gives one of three equally probable Virtus pieces.
2. **Awakener's orb:** 1/53 attempt if the first check fails, an effective chance of about 1/54 normally.
3. **Scarred tablet:** base 1/25 attempt until the first tablet, if earlier rolls fail.
4. **Smoke quartz:** base 1/200 attempt with scaling before the first quartz, if earlier rolls fail.
5. **Supplies:** a 1/5 attempt giving 3–4 sea turtles, one prayer potion(3), and one ranging potion(2) together.
6. **Ordinary loot:** a 100-ticket table, using the OSRS Wiki's normal and perfect quantities.

The **Venator vestige** uses a hidden **three-hit** mechanism. A vestige hit has **1/256** probability per normal kill, or **3/256** per awakened kill. The **first hit drops one gold ring**, the **second two gold rings**, and the **third awards a Venator vestige** and resets the counter. The long-run nominal vestige rate is 1/768 for normal kills and 1/256 for awakened kills, but this is *not* an independent 1/768 drop on every kill. The simulator shows remaining hidden progress from 0 to 2.

**Lil'viathan** is independently rolled at **1/2,500**. Clue scrolls are separately rolled at **1/40 total**, split equally among easy, medium, hard and elite (**1/160 each**), without the optional Combat Achievement clue boosts. Clue inventory restrictions are not modeled. The conditional Ancient blood ornament kit is excluded.

The 25 publicly itemized ordinary drops occupy **78 of 100** table tickets. To avoid overstating listed item chances, the remaining **22 tickets are represented as unspecified/no modeled loot** instead of redistributing them. The simulator includes Aether catalyst, raw manta rays, Anglerfish, ores, runes and ranged ammunition; all displayed item icons are committed as local PNGs.

### First-drop limitations

The **Scarred tablet** improves at an unpublished rate until it first drops, and it cannot drop again afterwards. The simulator models the published base **1/25 chance until the first tablet** because the precise pity formula is unknown.

For **Smoke quartz**, the first-drop attempt improves from **1/200 to 1/50** by 300 kill count, returning to **1/200** for subsequent quartz. The exact intermediate formula is unpublished, so the simulator **linearly interpolates the drop denominator** up to 300 KC. Actual intermediate rates could differ.

## Dry calculator

Enter the received number of **Venator vestiges, chromium ingots, Leviathan's lures, all three Virtus robe pieces, Lil'viathan and Awakener's orbs**. The calculator displays the expected number, the chance of fewer / exactly / more received, and the chance of at least one.

**Venator vestige** chances use **floor(Binomial(kills, 1/256) / 3)** normally or **floor(Binomial(kills, 3/256) / 3)** awakened, assuming zero initial hidden progress. Other dry rewards use binomial distributions at their effective per-kill probabilities. Scarred tablet and Smoke quartz are excluded from dry inputs because their first-drop mechanics are stateful and incompletely specified.

Sources: [OSRS Wiki — The Leviathan](https://oldschool.runescape.wiki/w/The_Leviathan), [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db).
