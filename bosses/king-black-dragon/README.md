# King Black Dragon

[Open King Black Dragon simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/king-black-dragon/) · [All simulators](../../README.md)

## Loot simulator

The King Black Dragon simulator rolls one boss kill at a time. Every kill produces **one dragon bones** and **two black dragonhides**, and then a **dragon pickaxe pre-roll at 1/1,000**. If the pickaxe hits, it takes the place of the ordinary loot roll; otherwise, the game chooses from the **128-ticket main drop table**. The independent tertiary rolls are still attempted.

The main table contains armour, runes, ammunition, resources, and the **8/128 rare drop table** and **2/128 gem drop table** branches. These shared drop tables include exact weighted nested gem, talisman, and mega-rare subtables. Normal variable quantities, such as **10–20 runite bolts** and **5–14 dragon arrowtips or dragon dart tips**, are chosen uniformly inside the stated range.

**Monkey Madness II completed** is checked by default. Before the quest is completed, the **5/128 dragon javelin tips** slot is replaced by an additional **5/128 fire rune (300)** slot, increasing fire rune chances from **5/128** to **10/128**. Once completed, those five tickets give 15 dragon javelin tips instead.

The following tertiary rolls are independent of each other and of the ordinary or dragon pickaxe drop:

| Reward | Chance per kill |
| --- | --- |
| Kbd heads | 1/128 |
| Prince Black Dragon (pet) | 1/3,000 |
| Draconic visage | 1/5,000 |
| Clue scroll (elite) | 1/450, or 1/427 with Elite Combat Achievements |
| Brimstone key | 1/65, only when the Konar Slayer task option is on |

The one-off **Key (elite)** for an elite clue step requiring a KBD kill is not automatically added; this reward requires a specific clue step and an appropriate key inventory state.

The simulator does not model item-price fluctuations, holding multiple clue scrolls, or Ring of Wealth modifiers to the rare table. It uses local PNG item sprites and performs every roll in the browser.

## Dry calculator

Enter completed kill count and the numbers of **dragon pickaxes, Kbd heads, draconic visages, and Prince Black Dragons** received. For each reward the calculator reports expected drops, probability of fewer, exactly, and more, and chance of at least one.

The **Any rare reward** panel combines all four independent drop rolls. Multiple of these rare items can occur on a single kill; the combined count distribution is therefore a convolution of four binomial distributions, rather than a single binomial with their rates added. Because quest completion, clue boosts and Konar keys do not alter these four chase-item rates, their optional loot-simulator toggles are hidden in dry mode.

Sources: [OSRS Wiki — King Black Dragon](https://oldschool.runescape.wiki/w/King_Black_Dragon), [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db).
