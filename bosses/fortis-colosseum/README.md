# Fortis Colosseum

[Open Fortis Colosseum simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/fortis-colosseum/) · [All simulators](../../README.md)

The Colosseum has **12 waves**, each with a separate reward roll. This simulator accepts **completed runs** and **highest wave cleared** (1–12) and assumes the player **successfully cashes out** at that wave. It does not simulate failed waves, forfeited loot, personal glory, deaths, supplies, or changing the wave reached between runs.

## Per-wave loot and unique rolls

- **Wave 1:** 80 sunfire splinters, guaranteed.
- **Waves 2–3:** One normal reward roll per wave.
- **Waves 4–12:** Exactly one reward roll per wave: a **unique drop replaces** the normal-table item for that wave; otherwise a normal item is rolled. Glory does not modify the unique probability.

| Wave | Unique table chance | Eligible unique pool |
| ---: | ---: | --- |
| 1–3 | None | Normal loot only |
| 4 | 1/124 | Echo crystal, Sunfire fanatic armour |
| 5 | 1/110 | Echo crystal, Sunfire fanatic armour |
| 6 | 1/96 | Echo crystal, Sunfire fanatic armour |
| 7 | 1/82 | Echo crystal, Sunfire fanatic armour, Tonalztics of Ralos |
| 8 | 1/68 | Same |
| 9 | 1/54 | Same |
| 10 | 1/40 | Same |
| 11 | 1/26 | Same |
| 12 | 1/12 | Same, plus guaranteed quiver and independent pet chance |

On a successful unique roll in waves **4–6**, Echo crystal weighs **4/10**, and Sunfire fanatic armour **6/10**. For waves **7–12**: Echo crystal **6/16**, armour **9/16**, and uncharged Tonalztics of Ralos **1/16**.

**Echo crystals:** an echo-crystal reward gives 1 crystal 90% of the time, and **2 or 3 crystals** with equal probability during the other 10%. The simulator aggregates the *actual number of crystals* in your loot, while recording **echo crystal reward rolls** separately. The dry calculator asks for **reward rolls** rather than number of crystals, so that the calculation uses the exact Bernoulli rate for each wave.

**Sunfire fanatic armour:** The three pieces (helm, cuirass and chausses) use **duplicate protection until a full set is received**. Each three armour rolls produce a complete set, after which the cycle begins again. This is maintained across the simulated runs. The dry calculator also accounts for this by conditioning each piece's count on the total number of armour rolls.

**Normal rewards:** The simulator uses the Wiki's wave-specific normal reward pools and conditional weights, including runes, bolts, cannonballs, seeds, gold, high-level ammunition and splinters. Waves 2–12 are not treated as identical loot rolls.

## Sol Heredit (wave 12) and Dizana's quiver

Every completed **wave 12** awards a **Dizana's quiver** and separately rolls **Smol Heredit at 1/200**, regardless of the ordinary or unique reward. Quiver handling in the loot simulator can be set to:

- **Keep** the quiver.
- **Exchange** each quiver for 4,000 sunfire splinters.
- **Gamble** a quiver for another 1/200 Smol Heredit chance if you do not already own the pet. If you have gained the pet during these simulated runs, subsequent quivers are kept rather than gambled. An existing pet from outside the simulation is not modeled.

Pet gambles are deliberately **excluded from the dry calculator**, which measures only the 1/200 wave-12 chest drop; the quiver itself is guaranteed and is excluded from dry item entry.

## Dry calculator

For a chosen highest cleared wave and number of runs, **each wave is treated as an independent event** with its own unique rate. For most items, the total number of item reward rolls follows a **Poisson-binomial** distribution: the sum of binomial outcomes for each wave, repeated over your runs. The tool calculates exact probability distributions for echo-crystal **reward events** (not crystals), Tonalztics, and the chest pet, and exact set-protection distributions for **individual Sunfire fanatic armour pieces**, with numerically negligible tail truncation in large binomial calculations.

**Any rare reward** combines the once-per-wave unique-table outcomes, plus the independent pet roll upon wave-12 completion. Since these are disjoint categories within a single wave, the results do not double count the three different armour pieces.

The results show **expected drops**, **chance of at least one**, and **fewer/exact/more** outcomes for the counts you entered.

### Sources

[OSRS Wiki: Rewards Chest (Fortis Colosseum)](https://oldschool.runescape.wiki/w/Rewards_Chest_%28Fortis_Colosseum%29) · [Fortis Colosseum](https://oldschool.runescape.wiki/w/Fortis_Colosseum) · [Sol Heredit](https://oldschool.runescape.wiki/w/Sol_Heredit). Item sprites are local PNG files from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db).
