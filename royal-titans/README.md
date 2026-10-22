# Royal Titans

[Open Royal Titans simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/royal-titans/) · [All simulators](../README.md)

## Combined loot simulator

Enter **solo (100% contribution)** and **duo (50% contribution)** kill counts. The results combine the loot from both modes into a **single inventory** and a single set of unique-reward cards. The contribution percentage is the player's own damage to both Titans, not team size alone.

After defeating both Royal Titans, players can choose whether to loot **Branda the Fire Queen** or **Eldric the Ice King**. Their unique and ordinary tables differ, so there is an independent **solo loot target** and **duo loot target** selector. Each selection applies to every kill entered for that mode. To simulate several different loot targets *within* a single mode, run separate simulations.

Each kill also has a **reward choice**, shared across the two modes:

- **Loot:** Roll for one of three mutually exclusive pre-roll rewards: the chosen Titan's staff crown (**1/75 solo**, **1/150 duo**), its prayer scroll (**1/75 solo**, **1/150 duo**), or a Giantsoul amulet (**1/16 solo**, **1/32 duo**). If none is awarded, make **two independent ordinary item rolls** on Branda's 55-ticket table or Eldric's 56-ticket table. Both roll counts are preserved for duo kills, with each stack scaled to half quantity. The simulator uses the published marginal unique chances as exclusive weighted pre-roll outcomes; their exact internal roll order is not independently documented.
- **Sacrifice:** Forfeit all primary loot to double the pet chance to **1/1,500**, rather than the ordinary **1/3,000**. Clue scrolls still roll.
- **Take pages:** Award **10–19 desiccated pages** per solo kill (halved for 50% contribution, rounded to whole items). No primary unique or ordinary loot rolls. Clues and pet still roll at the regular rate.

Prayer scrolls no longer drop after being **read**. The optional **Mystic vigour already read** and **Deadeye already read** switches disable their corresponding drops and probability calculations. By default, each is considered unread; simply receiving a scroll does not mark it as read.

The **Bran** pet drop and **hard/elite clue scroll** rolls are independent of contribution, Titan selection, and ordinary loot. Clue rates are **1/25 hard** and **1/100 elite** by default, improved to **1/23 hard** or **1/95 elite** with the respective Combat Achievement options. Clan inventory restrictions on clue scrolls are not modeled.

All regular loot names, weights, and quantities use the published tables. Quantity ranges are rolled uniformly between the displayed endpoints, then multiplied by **100%** or **50%**, rounded to the nearest whole item (minimum one). The game's exact rounding at half a unit is not fully specified; this is a documented implementation choice.

## Dry calculator

Enter combined counts of the four Titan-specific uniques (two crowns and two prayer scrolls), the **Giantsoul amulet**, and **Bran**. The dry calculator combines **solo and duo probabilities**, taking the chosen Titan for each mode into account. An item unavailable from the selected Titans has a zero probability.

Each item displays the likelihood of **fewer**, **exactly**, or **more** than the received quantity, expected drops, and the probability of at least one. **Any primary unique** combines crown, scroll and amulet outcomes using an exclusive-per-kill model. A pet roll is independent of a main-table unique. Sacrifice and pages mode disable primary unique odds while retaining the relevant pet odds. Unread/read prayer scroll settings apply to the dry calculator as well.

The simulator and dry calculator assume independent kills and the selected 100%/50% contribution shares; they do **not** claim that duo partners must each contribute exactly 50%.

Sources: [OSRS Wiki — Royal Titans](https://oldschool.runescape.wiki/w/Royal_Titans), [Jagex Royal Titans drop rates](https://patchtracker.gg/old-school-runescape/royal-titans-cas-birthday-rewards), [osrsreboxed-db local PNGs](https://github.com/RSPSApp/osrsreboxed-db).
