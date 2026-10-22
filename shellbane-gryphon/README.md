# Shellbane Gryphon

[Open Shellbane Gryphon simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/shellbane-gryphon/) · [All bosses](../README.md)

## Loot simulator

Enter 0–1,000,000 **eligible Shellbane gryphon kills** to simulate the boss's full drop sequence. This is a solo boss. Each kill gives:

- **1 big bones** and **7–10 gryphon feathers**, always.
- An independent **1/75 pre-roll** for **Belle's folly (tarnished)**. This uses the increased rate from the **22 July 2026 update**, not the old 1/256 or 1/400.
- **Two separate ordinary loot rolls** from a 128-ticket table, including weighted seed, herb, combat-herb and gem subtables. The same item can appear twice.
- Independently: **Jar of Feathers (1/2,000)**, **Gull (pet, 1/3,000)**, long bone (1/400), curved bone (approximately 1/5,012.5), and an elite clue scroll (1/200).
- Optional **Elite Combat Achievements** improves the normal elite clue rate to **1/190**.
- Optional **Konar Slayer task** independently adds a **1/58** brimstone key roll.

**Eligible elite clue step** is an alternative to the Konar task. When selected, each kill also awards the guaranteed elite clue scroll and elite reward casket associated with *the elite clue step that asks you to defeat this boss*. These guaranteed rewards do **not** apply to ordinary Slayer kills. The simulator requires a qualifying quest or Slayer task/clue for its modeled kills; kills without the required clue or task may award no loot. The two task modes cannot be combined.

### Ordinary drop table

Each of the **two** ordinary rolls selects one of exactly **128 weighted tickets**:

| Group | Tickets |
| --- | ---: |
| Weapons and food, including rune claws, rune scimitar, cannonballs, swordfish, sweetcorn, watermelon, raw sea turtle | 70 |
| Elkhorn frag and Pillar frag | 2 |
| Gryphon feathers (35–50), shark lure (3–5), basket | 24 |
| Allotment seeds | 15 |
| Restricted allotment seeds (excluding potato/onion/cabbage) | 5 |
| Herbs | 6 |
| Combat herbs | 5 |
| Gem table | 1 |
| **Total** | **128** |

The seed tables preserve the listed approximate per-roll rates, such as potato seed **2 × 1/17.1** per boss kill and tomato seed **2 × 1/37.2**. A standard herb roll uses the 128-weight common herb subtable, while a combat herb roll uses the 16-weight combat herb subtable. The shared gem table includes gems, talismans and key halves. One *extremely rare* nested mega-rare gem outcome is treated as no modeled loot; that is the only deliberately omitted ordinary subtable.

Amounts such as 35–50 gryphon feathers, 35–50 adamant cannonballs, or 20–30 rune cannonballs are rolled per entry. All sprites are local PNG files.

## Dry calculator

Enter the numbers of **Belle's folly (tarnished)**, **Jar of Feathers** and **Gull** obtained at your selected KC.

Each is an independent binomial distribution using **1/75**, **1/2,000** or **1/3,000** per kill, respectively. The calculator displays expected drops, the chance of **fewer than**, **exactly**, and **more than** the received count, and the chance of **at least one**. It also gives the chance that *at least one of the three uniques* appears anywhere in the simulated kills. Because the three unique checks are independent and can occur together, that final probability uses

```
1 - ((1 - 1/75) × (1 - 1/2000) × (1 - 1/3000)) ^ kills
```

### Sources

- [Shellbane gryphon — OSRS Wiki](https://oldschool.runescape.wiki/w/Shellbane_gryphon) (drop table and July 2026 Belle's folly rate update).
- [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db) (item sprites and shared drop subtables).

All calculations happen locally. No account or internet connection is required while running the simulator.
