# Scorpia

[Open Scorpia simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/scorpia/) · [All bosses](../README.md)

## Simulator

Input the number of **completed Scorpia kills** to simulate loot. All rewards use local PNG sprites. The simulator uses the modern [OSRS Wiki Scorpia drop table](https://oldschool.runescape.wiki/w/Scorpia), including the **128-ticket ordinary drop table** with its listed item stacks and weights.

### Collection-log rewards

| Reward | Rate per kill | How it works |
| --- | --- | --- |
| Odium shard 3 | 1/256 | Exclusive pre-roll |
| Malediction shard 3 | 1/256 | Exclusive pre-roll |
| Dragon 2h sword | (127/128) × (1/128), about 1/129 | Ordinary table, only rolled without a shard |
| Scorpia's offspring | (127/128) × (1/2,000), about 1/2,015.75 | Separate pet roll, only without a shard |

Scorpia first chooses **one of two shards**, together a **1/128** chance, split equally between odium and malediction. When the shard pre-roll succeeds, no standard loot or pet is rolled. Otherwise, Scorpia awards one entry from the 128-ticket ordinary table, with variable quantities such as 5–8 battlestaves or 100–150 death runes. The **pet is independent of ordinary loot** after a failed shard pre-roll, so a Dragon 2h sword and Scorpia's offspring can arrive in the same kill. The resulting pet rate is slightly below its intended 1/2,000.

Independent tertiary drops include a **looting bag (1/3)**, **ensouled scorpion head (1/18)** and **hard clue scroll (1/100 by default)**. The simulator does not model inventory restrictions on clue scrolls.

### Optional Slayer and clue modifiers

Only one task type can be selected:

- **None:** no extra task rewards.
- **Konar:** **brimstone key (1/75)** each kill.
- **Krystilia:** **Larran's key (1/72)** and **Slayer's enchantment (1/30)** each kill, rolled independently.

For hard clue scrolls, the **Hard Combat Achievements** option improves the rate from **1/100 to 1/95**; the **imbued ring of wealth** option improves it to **1/50**, or **1/47** with Hard Combat Achievements also enabled. Hard clues are independent of the ward-shard pre-roll.

## Dry calculator

Enter the counts received for **Odium shard 3**, **Malediction shard 3**, **Dragon 2h sword** and **Scorpia's offspring**. The calculator shows, per reward, the expected number, probability of fewer, exactly or more than the entered count, and probability of at least one.

**Either ward shard** uses a binomial distribution with a combined **1/128** chance per kill. **Any collection-log reward** uses a per-kill distribution with 0, 1 or 2 rewards, allowing a simultaneous Dragon 2h sword and Scorpia's offspring drop. That combined model respects the shard pre-roll; it does not incorrectly treat all four drops as independent.

Maximum input is **1,000,000 kills**. All simulation and dry-calculator computation runs locally in the browser.

Sources: [Scorpia — OSRS Wiki](https://oldschool.runescape.wiki/w/Scorpia), [osrsreboxed-db sprite/cache data](https://github.com/RSPSApp/osrsreboxed-db).
