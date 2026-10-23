# Zalcano

[Open Zalcano simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/zalcano/) · [All simulators](../README.md)

Zalcano is a **group skilling boss**. Her resource quantities and rare-drop allocation depend on your own contribution, so one ordinary kill count cannot uniquely determine your rewards. The simulator takes **completed personal kills**, **team size**, **relative contribution versus the average teammate**, **average shield damage**, and **average HP damage**. It has optional **MVP on every kill** and **XP-focused rewards** toggles.

## Eligibility and guaranteed drops

- You must deal **at least 5 shield damage** to receive loot. A combined **31 shield + HP damage** is needed for uniques and the pet, provided the shield requirement is met.
- Eligible participants receive **one crystal shard**; rare-eligible participants receive **two crystal shards**. MVPs receive **three crystal shards** and **one infernal ashes**.
- MVPs receive a **10% increase, rounded up, on non-unique resource loot**, not an extra resource roll.
- The XP-focused reward option removes ordinary resource loot while still permitting guaranteed shards and rare-drop rolls. XP amounts are not simulated.

## Ordinary resource loot

One independent **36-ticket** table produces a single resource drop when not in XP-focused mode:

| Items | Tickets each | Wiki quantity range |
| --- | ---: | --- |
| Blood rune | 1 | 64–480 |
| Cosmic rune | 1 | 295–926 |
| Death rune | 1 | 201–1,046 |
| Law rune | 1 | 166–790 |
| Soul rune | 1 | 47–392 |
| Nature rune | 1 | 1–937 |
| Silver ore | 3 | 86–800 |
| Coal | 1 | 169–1,052 |
| Mithril ore | 2 | 56–469 |
| Adamantite ore | 2 | 51–343 |
| Runite ore | 2 | 3–31 |
| Gold ore | 3 | 86–756 |
| Steel bar | 3 | 16–699 |
| Mithril bar | 3 | 53–501 |
| Adamantite bar | 2 | 13–111 |
| Runite bar | 2 | 3–27 |
| Uncut diamond | 2 | 2–21 |
| Uncut dragonstone | 2 | 1–12 |
| Onyx bolt tips | 2 | 1–45 |
| Pure essence | 1 | 784–5,500 |

Most ore, bar, gem and essence rewards are noted. Exact quantity scaling from player participation is not published in a usable formula. The simulator **samples uniformly within the Wiki's observed ranges** rather than pretending to reconstruct those hidden quantities. The quantities are therefore illustrative, while the 36-ticket weights are preserved.

## Collection log / rare rewards

| Reward | Mechanics |
| --- | --- |
| **Crystal tool seed** | **39/40** of the team's successful **1/200** special roll, then allocated to an eligible player weighted by contribution |
| **Uncut onyx** | **1/40** of that same **1/200** team roll, allocated to an eligible player |
| **Zalcano shard** | Independent per-player roll, between **1/1,500** and **1/750**, based on capped contribution points |
| **Smolcano** | Independent per-player **1/2,250** roll, not increased by contribution |

For the shared tool seed / onyx roll, the simulator estimates your share as:

\[
w=\frac{r}{(\mathrm{teamSize}-1)+r},\quad r=\frac{\mathrm{relativeContribution}}{100}
\]

The model assumes each **other** teammate is an average-weight participant. It uses \(p_{\mathrm{seed}}=(1/200)(39/40)w\) and \(p_{\mathrm{onyx}}=(1/200)(1/40)w\). They are **mutually exclusive on each kill**. Actual selection weights require knowing all players' contributions, so these **are estimated personal rates**, not static 1/205 and 1/8,000 rates for everyone.

The wiki specifies capped tertiary points:

\[
P_T=\min(H,400)+2\min(S,300)
\]

where \(H\) is HP damage and \(S\) is shield damage. The shard's published rate has **endpoint values only**, not a verified direct numerical mapping for intermediate contribution. The simulator **linearly interpolates drop probability** from **1/1,500 at the minimum qualifying 5 shield / 31 total damage** to **1/750 at 1,000 tertiary points**. This interpolation is **an approximation**, and actual odds could differ.

## Dry calculator

Enter the total copies of **each of four collection-log rewards** received across your completed kills. Each item uses a binomial distribution with its estimated personal rate, reporting **fewer, exactly, more, at least one, and expected copies**. The **any collection-log reward** result combines the mutually exclusive team tool/onyx event with the independent Zalcano shard and pet rolls; it permits up to three different rewards on one kill.

Settings represent typical conditions **for each kill**: they do not model a changing group size or fluctuating contribution. Clues and miscellaneous shard sources from mining tephra are not included.

Sources: [OSRS Wiki: Zalcano](https://oldschool.runescape.wiki/w/Zalcano), [Zalcano shard](https://oldschool.runescape.wiki/w/Zalcano_shard), [Zalcano strategies](https://oldschool.runescape.wiki/w/Zalcano/Strategies). Local item sprites from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db).
