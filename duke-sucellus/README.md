# Duke Sucellus

[Open Duke Sucellus simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/duke-sucellus/) · [All simulators](../README.md)

## Loot simulator

The simulator supports **normal** and **awakened** Duke Sucellus encounters, optional **perfect kills** for the improved ordinary-loot quantities, and an optional **Konar Slayer task** for the **1/50 brimstone key** tertiary roll. Standard kills and awakened kills are separate modes; the entered kill count applies entirely to the selected mode. All item icons are local PNG files.

Rewards are tried **in sequence** and stop at the first successful primary drop: **tradeable unique table (1/90 normally, 1/30 awakened)**; then **Awakener's orb (1/48)**; then **frozen tablet (base 1/25, first only)**; then **ice quartz (base 1/200)**; then **the supply bundle (1/5)**; finally the **ordinary 100-ticket table**. These probabilities are sequential, so published effective rates (such as the orb's roughly 1/48.5) are lower than raw odds after earlier attempts. All three supply items arrive together: 3–4 pineapple pizzas, one prayer potion(3), and one super combat potion(2).

The unique table contains **3/8 Magus vestige progress, 3/8 chromium ingot, 1/8 Eye of the Duke, and 1/8 Virtus robes**, the last branch split equally among the mask, robe top and robe bottom. Each vestige progress roll is **1/240 normally** (or **1/80 awakened**). The **first** such roll gives one gold ring, the **second** gives two gold rings, and the **third** gives one Magus vestige and resets progress. The simulator displays the final hidden progress, from 0 to 2. The nominal long-run rate is 1/720 (or 1/240 awakened) but **it is not an independent 1/720 roll per kill**. Chromium ingot is **3/720** normally, the Eye **1/720**, each Virtus piece **1/2,160**, and **Baron 1/2,500** independently of primary loot. Clue scrolls are another independent **1/40 roll**, with equal chances for easy, medium, hard and elite. The simulator does not enforce clue-scroll inventory restrictions.

The 24 publicly enumerated standard rewards are drawn at their published ticket rates out of 100. Their weights sum to **78**; the remaining **22 tickets are modeled as unspecified/no listed loot**, rather than incorrectly normalizing 78 tickets to 100. Normal/perfect quantity pairs (for example, 216/325 coal) are **not random ranges**: perfect selects the boosted quantity. The perfect-kill bonus applies to ordinary loot, not the supply bundle or uniques.

### First-drop scaling

The OSRS Wiki states that the frozen tablet's drop chance improves at an **unpublished rate** until the first tablet, and that no more tablets drop after that. The simulator uses the **base 1/25 attempt until the first** and stops subsequent tablet rolls. Ice quartz's first-drop attempt improves from **1/200 to 1/50 by 300 KC**; because the exact intermediate scaling formula is not public, the simulator **linearly interpolates the denominator** over 300 kills, then returns to the base 1/200 rate after the first quartz. These mechanics are explicitly approximated and may differ from the game between the published endpoints.

## Dry calculator

Supply the number of Magus vestiges, chromium ingots, Eyes of the Duke, the three Virtus pieces, Baron, and Awakener's orbs received. Each shows expected drops, the probability of receiving **fewer**, **exactly**, or **more** than that count, and the probability of **at least one**.

The Magus vestige calculator evaluates **floor(Binomial(kills, 1/240) / 3)** for normal mode or **floor(Binomial(kills, 1/80) / 3)** for awakened mode, starting with zero hidden progress. A regular binomial model based on 1/720 would misrepresent the vestige dry odds. All other included dry-calculator items use their effective per-kill rates. Frozen tablet and ice quartz are deliberately excluded from dry inputs because their first-drop chances are stateful and incompletely documented.

Sources: [OSRS Wiki — Duke Sucellus](https://oldschool.runescape.wiki/w/Duke_Sucellus), [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db).
