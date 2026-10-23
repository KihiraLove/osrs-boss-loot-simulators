# Vardorvis

[Open Vardorvis simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/vardorvis/) · [All simulators](../../README.md)

## Loot simulator

Enter completed Vardorvis kills and select **normal or awakened** combat and optionally **perfect kills**. Perfect kills select the improved standard-table amounts (50% more, subject to in-game rounding); they do not increase unique, supply, or pet rates. Normal kills can optionally enable a **Konar Slayer task** for independently rolled **brimstone keys at 1/50**. Slayer tasks do not apply to awakened encounters, so that option is disabled for awakened kills.

Vardorvis tries the following **mutually exclusive primary reward branches in order**:

1. **Tradeable unique table:** **1/136** normally, **3/136** awakened. Once it succeeds, **3/8** progresses the Ultor vestige, **3/8** gives a chromium ingot, **1/8** gives the Executioner's axe head, or **1/8** selects a random Virtus robe piece.
2. **Awakener's orb:** 1/80 *only if no earlier roll succeeds*.
3. **Strangled tablet:** base 1/25 attempt, with first-drop protection (see limitations).
4. **Blood quartz:** base 1/200 attempt, with first-drop scaling (see limitations).
5. **Supplies:** 1/5 attempt, awarding **3–4 tuna potatoes, a prayer potion(3), and a super combat potion(2)** together.
6. **Standard loot:** a 100-ticket table using the Wiki's listed normal/perfect quantities.

A vestige-table hit happens with probability **3/1,088** per normal kill, or **9/1,088** awakened. The **first** hit gives one gold ring, the **second** gives two gold rings, and the **third** gives the **Ultor vestige**, then resets the hidden progress. Consequently the nominal long-run rate is **1/1,088** normally, but a vestige is *not* simply an independent 1/1,088 event on each kill. The simulator tracks the hidden counter and displays remaining progress (0–2).

Independently of the primary loot, each kill rolls **Butch at 1/3,000** and **a clue scroll at 1/40**, with equal probabilities for easy, medium, hard and elite (**1/160 each**, without Combat Achievement clue boosts). The simulator does not track clue-scroll inventory restrictions. Quest-variant-only Temple keys and the conditional ancient blood ornament kit are excluded.

The standard loot's **25 published item tickets total 78/100**. The remaining **22/100** tickets are retained as unspecified/no modeled loot rather than rescaling known rates. For example, coal drops in stacks of **130 normally** or **195 for a perfect kill**, at **8/100 of standard-table rolls**. Item sprites are bundled as local PNGs.

### First-drop limitations

The **Strangled tablet** improves in rarity at an unpublished rate until the first drop; afterwards it cannot drop again. This simulator uses its published base **1/25 attempt until the first tablet**, without inventing an exact pity curve.

The **Blood quartz** improves from **1/200 to 1/50** before the first drop as kill count increases, reaching the best rate at 300 KC; afterwards it returns to 1/200. The exact intermediate formula is not published, so the simulator approximates it with a linearly decreasing denominator over 300 kills.

## Dry calculator

The dry calculator accepts obtained counts for **Ultor vestige, chromium ingot, Executioner's axe head, Virtus mask/top/bottom, Butch, and Awakener's orb**. It reports expected drops, fewer/exact/more probabilities, and the chance of at least one.

For Ultor vestiges, it evaluates **floor(Binomial(kills, 3/1,088)/3)** normally or **floor(Binomial(kills, 9/1,088)/3)** awakened, starting from zero vestige progress. Other dry rewards use effective per-kill binomial rates. Stateful Strangled tablet and Blood quartz are omitted from dry inputs, because their full pity behavior is not public.

Source: [OSRS Wiki — Vardorvis](https://oldschool.runescape.wiki/w/Vardorvis), [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db).
