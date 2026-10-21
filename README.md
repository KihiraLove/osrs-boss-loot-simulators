# OSRS Boss Loot Simulators

[![Deploy GitHub Pages](https://github.com/KihiraLove/osrs-boss-loot-simulators/actions/workflows/pages.yml/badge.svg)](https://github.com/KihiraLove/osrs-boss-loot-simulators/actions/workflows/pages.yml)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20me-29ABE0?logo=ko-fi&logoColor=white)](https://ko-fi.com/KihiraLove)

An unofficial, **frontend-only** collection of [Old School RuneScape](https://oldschool.runescape.wiki/) boss loot simulators. Includes [Doom of Mokhaiotl](https://oldschool.runescape.wiki/w/Doom_of_Mokhaiotl), [Phosani's Nightmare](https://oldschool.runescape.wiki/w/Phosani%27s_Nightmare), [Yama](https://oldschool.runescape.wiki/w/Yama), [Alchemical Hydra](https://oldschool.runescape.wiki/w/Alchemical_Hydra), [Cerberus](https://oldschool.runescape.wiki/w/Cerberus), [Mad Angel](https://oldschool.runescape.wiki/w/Mad_Angel), [Abyssal Sire](https://oldschool.runescape.wiki/w/Abyssal_Sire), [Amoxliatl](https://oldschool.runescape.wiki/w/Amoxliatl), [Araxxor](https://oldschool.runescape.wiki/w/Araxxor), [Barrows](https://oldschool.runescape.wiki/w/Barrows), [Brutus](https://oldschool.runescape.wiki/w/Brutus), [Bryophyta](https://oldschool.runescape.wiki/w/Bryophyta), and [Obor](https://oldschool.runescape.wiki/w/Obor). Hosted with GitHub Pages. No backend, build dependencies or runtime Wiki API calls.

## Boss selection

The home page (`/`) is a boss picker with an icon for each supported boss. Select Doom at [`/doom/`](./doom/), Phosani's Nightmare at [`/phosani/`](./phosani/), Yama at [`/yama/`](./yama/), Alchemical Hydra at [`/hydra/`](./hydra/), Cerberus at [`/cerberus/`](./cerberus/), Mad Angel at [`/mad-angel/`](./mad-angel/), Abyssal Sire at [`/sire/`](./sire/), Amoxliatl at [`/amoxliatl/`](./amoxliatl/), Araxxor at [`/araxxor/`](./araxxor/), Barrows at [`/barrows/`](./barrows/), Brutus at [`/brutus/`](./brutus/), Bryophyta at [`/bryophyta/`](./bryophyta/), or Obor at [`/obor/`](./obor/). Each simulator links back to the boss picker. New boss simulators can be added as separate subdirectories and linked from the home page without modifying Doom's calculations.

All navigation and asset URLs are relative so the site also works under a renamed GitHub Pages project path. Renaming the repository **will change its GitHub Pages URL**, however, and old Pages URLs do not redirect automatically.

## Obor — separate boss and giant-key chest rewards

[Obor's simulator and dry calculator](./obor/) use the **June–July 2025** loot system. Obor's boss-kill loot is separate from the giant-key chest's loot. The boss rolls the **135-ticket** common drop table and has an independent **1/16 giant-key roll** on Members and F2P worlds, with guaranteed giant bones or big bones respectively. The original high-value rewards moved into the chest, which has a **118-ticket** primary table, yielding the **Hill giant club at 1/118 per chest**, plus a separate independent **1/16 giant-key chance**. The chest also always yields a beginner clue scroll and an ensouled giant head.

The simulator has the same two key modes as Bryophyta: **Pre-obtained keys** simulates N boss kills and exactly N chest openings; **Key obtained form boss** simulates N boss kills, spends boss keys on chests and then spends any giant keys found inside those chests on additional chest openings. Every extra chest's loot goes into the same chest loot list. Boss kills and chest openings remain separate counters internally; the UI displays **Keys from boss** and **Keys found in chests** above the highlighted Hill giant club unique. The recursive chest-key loop has a 1,000,000-opening safeguard for pathological random sequences. Other giant keys found in pre-obtained mode are shown in loot but do not increase openings.

The chest-only **dry calculator** takes a number of chest openings and calculates the expected number of Hill giant clubs and chest-dropped giant keys and the probabilities of zero, exactly one, or at least one of each. It does not use boss kills or key mode. Both Members and free-to-play main tables are modelled; the boss's herb/seed subtables use published rounded rates and the eight unlisted weight units in the 135-ticket ordinary table are treated as an empty reward. The in-game first-time gate unlock (requiring a giant key which is not consumed) is assumed to be completed. Obor does **not** gain a higher key-drop chance while on Slayer task, unlike Bryophyta. In-game HiScores killcount increases when the chest is opened; simulator inputs represent actual boss kills independently of HiScores chest count.

Drops: [OSRS Wiki — Obor](https://oldschool.runescape.wiki/w/Obor), [Obor reference snapshot](https://danielpgleason.com/osrs/reference/obor-2c2dffe9/), and [Obor's chest rates](https://reldo.org/a/obor-chest/). All reward sprites are local PNG assets; no runtime Wiki requests are required.

## Bryophyta — separate boss and chest rewards

The [Bryophyta loot simulator and dry calculator](./bryophyta/) use the post-**25 June 2025** reward system. Defeating Bryophyta rolls the **boss's own 128-ticket table** and independent tertiary rewards, including a **mossy key at 1/16** (**1/8** with a moss giant Slayer task). The chest is separate: it requires one completed kill and one mossy key, and has its own **118-ticket loot table**, with **Bryophyta's essence at 1/118**, a guaranteed beginner clue scroll, and an independent **1/16 mossy-key tertiary roll**. Essence is never awarded directly from the boss. Both Members and Free-to-play tables are supported.

In **Pre-obtained keys** mode, entering N kills simulates exactly N kills **and N chest openings**, regardless of mossy keys dropped from the boss or the chest; additional keys are retained as rewards, not used. In **Key obtained form boss** mode, N kills are simulated, and keys dropped by the boss are used to open chests. **Mossy keys dropped from those chests are also spent on additional chest openings**, repeating the process until no key remains. Chest-generated openings contribute their loot to the same chest loot result, including additional essence drops. A maximum of **1,000,000 simulated chest openings** protects against pathological infinite key chains; if this limit is reached, the results show how many keys remain unused.

The **Kc on slayer task out of total** numeric input determines exactly how many boss kills use the **1/8** mossy-key rate, while the remainder use **1/16**. Only the first entered number of simulated boss kills are counted as on task; the field must not exceed the total kill count. The key and opening summary includes boss kills, on-task kills, boss-obtained keys, chest openings, chest-dropped keys and extra openings funded by those chest keys. Boss loot and chest loot remain in separate grids. **Bryophyta's essence** appears as a highlighted 1/118 unique reward above both loot grids, rather than also appearing among common chest loot.

The **dry calculator** asks **only for the number of chest openings**. It shows expected quantities and the probabilities of zero, exactly one, or at least one **Bryophyta's essence** and **mossy key from the chest**, using their chest rates alone. It never counts boss kills or keys dropped by the boss, and does not ask for obtained-item counts. The applicable formula for at least one reward is `1 − (1 − p)^chests`.

Boss and chest loot use distinct Members/F2P weighted drop tables. Seed, herb and gem branch probabilities are simulated as weighted subtables; some relative subtable weights are derived from rounded published effective rates. Guaranteed giant bones on Members worlds are shown for completeness although they are buried directly from the ground in-game. Clue-scroll ownership, ring-of-wealth effects and other account-specific exclusions are not tracked. All item icons are bundled locally.

Sources: [OSRS Wiki — Bryophyta](https://oldschool.runescape.wiki/w/Bryophyta), [Chest (Bryophyta's lair)](https://oldschool.runescape.wiki/w/Chest_(Bryophyta%27s_lair)), and [the July 2025 mossy key updates](https://osrsindex.com/wiki/mossy-key?site=osrs_wiki).

## Brutus

The [Brutus loot simulator and dry calculator](./brutus/) model the **repeatable post-quest Brutus encounter**, not Demonic Brutus. Choose **Members** (default) or **Free-to-play** worlds before entering your kill count. Each kill always drops **one bull bones and one raw t-bone steak**. Bull bones cannot normally be picked up in-game; the simulator records their guaranteed appearances for completeness.

The **150-ticket pre-roll** awards exactly one reward when successful: **Mooleta (5/150)** on either world type, **Bottomless milk bucket (empty) (4/150)** on Members worlds, or **Cow slippers (1/150)** on Members worlds. A successful unique pre-roll replaces the ordinary main-table drop. When the pre-roll fails, there is one **81-ticket** ordinary loot roll. The Members table contains iron armour, runes, iron arrows, seeds, cowhide, logs, and three additional noted raw t-bone steaks. On F2P worlds the **25 combined tickets** for potato seeds (10), acorns (5), and noted steaks (10) are replaced by coins in three respective weighted quantity ranges (**60–80 at 15/81**, **80–100 at 5/81**, and **100–120 at 5/81**); the remaining 56 ordinary-loot tickets are shared.

Independent tertiary drops are beginner clue scrolls **1/15** on either world type; easy clue scrolls **1/40** on Members worlds (**1/38** with Easy Combat Achievements); and the **Beef pet 1/1,000** on Members worlds. The simulator assumes the player is eligible for clues on every kill, without tracking currently held scrolls or boxes.

In the dry calculator, enter the number obtained of each of the three pre-roll uniques and Beef. The displayed **fewer / exactly / more** probabilities use individual binomial distributions at the applicable world rates. **Any rare reward** combines the mutually exclusive main pre-roll (10/150 on Members worlds, 5/150 on F2P) with the independent Beef chance, allowing a Members kill to produce both a main unique and the pet. Items that cannot drop on F2P worlds are hidden and excluded from the calculation. Individual probability cards are marginals, not the joint probability of receiving the entire entered inventory.

All reward icons and the homepage Beef icon are local PNGs sourced from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db). Source: [OSRS Wiki — Brutus](https://oldschool.runescape.wiki/w/Brutus), [September 2026 saved wiki reference](https://danielpgleason.com/osrs/reference/brutus-ad606f08/), and [Reldo Brutus drop rates](https://reldo.org/a/brutus/).

## Barrows (all six brothers)

The [Barrows loot simulator and dry calculator](./barrows/) assume **all six original Barrows brothers** are slain before every chest. There are no brother selection controls. Each chest has **seven reward rolls**, with a **1/102 equipment chance per roll**. A successful equipment roll awards one of the **24 Barrows pieces** uniformly; the same named piece **cannot appear twice in one chest**, though several different pieces may drop at once. Across chests, duplicates remain possible. Because a later roll for the same piece is discarded instead of replaced, a specific piece has chance **1 − (1 − 1/2,448)^7 per chest**, approximately **1/350.14** (matching the Wiki). The chance of at least one equipment piece in a chest is `1 - (101/102)^7`, approximately **6.66%**.

The simulator offers two **reward potential settings** while keeping all six brothers fixed: **880 (86.8% in-game, recommended for rune loot)**, which excludes bolt racks, key halves and the dragon med helm, and **1,012 (maximum potential)**, which includes them. For each non-equipment roll, a uniformly drawn reward-potential point selects coins, mind/chaos/death/blood runes, bolt racks, key halves or dragon med helm according to the Wiki's published reward-point bands. Intermediate common-loot quantities are linearly interpolated between the published minimum and maximum quantities for each band, so these stack quantities are an **approximation**; equipment chances and the common item category probabilities do not depend on this approximation. The optional **Hard Morytania Diary** checkbox increases awarded rune quantities by 50%, rounded down.

Elite clues are separate **1/200 rolls on each of the seven attempts**, or **1/190** with Elite Combat Achievements, capped at **one elite clue per chest**. This simulator assumes clue eligibility rather than tracking currently owned clues, and does not model one-time miniquest items or other nonstandard account-specific effects.

The dry calculator accepts an observed count for **every one of the 24 equipment pieces** and displays fewer-than, exactly, and more-than probabilities for each. The **Any Barrows equipment** summary counts the total **distinct awarded pieces per chest**, including possible multiple different pieces. It uses an exact chest-level distribution for up to 1,000 chests and a mean-matched binomial approximation for larger samples. The chance of at least one piece is always calculated exactly from all seven rolls. Individual named pieces are modelled as a maximum of one per chest because duplicate rolls are blocked; the calculator rejects impossible counts. Probabilities are marginal for each piece, not the joint probability of obtaining the entire recorded inventory. All item icons are local PNGs sourced from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db), with Dharok's helm on the homepage.

Sources: [OSRS Wiki — Chest (Barrows)](https://oldschool.runescape.wiki/w/Chest_(Barrows)), [Barrows strategies](https://oldschool.runescape.wiki/w/Barrows/Strategies), and the [2026 Wiki snapshot](https://osrsindex.com/wiki/chest-barrows?site=osrs_wiki).

## Araxxor

The [Araxxor simulator and dry calculator](./araxxor/) model the Old School RuneScape solo Slayer boss, with a **Harvest / Destroy** corpse decision above the kill count. **Harvest** rolls loot normally and has a **1/3,000 Nid** pet chance. **Destroy** forfeits all normal loot, including noxious pieces, fang, jar, head and supplies, but retains the elite clue scroll roll and increases **Nid to 1/1,500**. The dry calculator uses the selected mode, hides unobtainable Destroy rewards, and displays the mode-specific Nid odds.

On Harvest, the primary unique pre-roll is **1/150**, selecting a noxious halberd piece or the araxyte fang with equal weight (any halberd piece **1/200**, fang **1/600**). The three named halberd pieces are **duplicate-protected until a complete trio**: each group of three successful piece rolls gives one blade, one point and one pommel in a random order. When the unique roll fails, one reward is chosen from the normal **115-ticket weighted table**, including a 15-ticket bundled supply outcome, tree-herb seed subtable and shared rare-drop-table branch. Supply outcomes grant an araxyte venom sac or super combat potion, a prayer potion and sharks or wild pies. The relative seed and rare table weights are normalized from published rates; item quantities and unmodified rare-drop-table conditions follow the OSRS Wiki. The normal main table is replaced by a successful unique pre-roll.

Other Harvest drops roll independently: Araxyte head (**1/250**), Jar of venom (**1/1,500**), elite clue scroll (**1/50**, or **1/47** with Elite Combat Achievements), and Nid (**1/3,000**). A **Konar boss task** setting enables Brimstone keys at **1/40** when Harvesting. The optional **coagulated venom** checkbox adds one only when the player is eligible for the guaranteed *sub-1:15, not-yet-owned* reward; it is not given unconditionally per kill.

The dry calculator displays fewer-than, exactly, and more-than probabilities for each signature reward, araxyte head, jar and Nid. Each halberd piece is calculated from the **1/200 shared piece-roll distribution**, accounting for nonrepeating pieces within each trio, rather than independently treating named pieces as ordinary 1/600 rolls. **Any signature unique** uses the mutually exclusive **1/150** table for the four main signature rewards; head, jar and pet are reported individually. The combined summary disappears in Destroy mode. All sprites are local PNGs from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db), including the Nid homepage icon.

Sources: [OSRS Wiki — Araxxor](https://oldschool.runescape.wiki/w/Araxxor), [OSRS Index Araxxor reference](https://osrsindex.com/wiki/araxxor?site=osrs_wiki), and [RuneTools drop table](https://runetools.com/bestiary/araxxor).

## Amoxliatl

The [Amoxliatl loot simulator and dry calculator](./amoxliatl/) model the **repeatable post-quest boss**, rather than quest-only encounters. Every completed kill produces **two independent primary-table rolls (58 tickets per roll)** and **one guaranteed frozen-tear roll**: 2–4 tears at 6/10, 5–10 at 3/10, or 10–20 at 1/10. The primary table includes rune equipment, runes, ores, blessed bone shards, supplies, Huasca seeds, and a 2/58 gem-table branch. The gem table preserves its "Nothing" possibility; ring-of-wealth modifications are not modelled. Noted items are aggregated as their ordinary item icons.

The independently rolled tertiary rewards are **Pendant of ates (inert), 1/25**; **Glacial temotli, 1/100**; **Moxi, 1/3,000**; and **Tooth half of key (moon key), 1/125**. The separate elite clue scroll chance is 1/200, increasing to 1/190 with the optional Elite Combat Achievements setting. A Konar task checkbox enables Brimstone keys at 1/54. The special guaranteed elite-clue-task drops are not represented, and the model assumes an eligible clue can always drop. The moon-key-half rate follows current post-quest drop listings at 1/125 rather than an older approximate 1/500 value.

The dry calculator takes kills and observed counts for the four tertiary rewards and displays the probability of **fewer than, exactly, or more than** the observations. The **Any signature reward** card combines Pendant, Glacial temotli and Moxi using three independent binomial distributions; a single kill can grant several of these rewards. The moon-key half is shown individually but excluded from that summary. Each individual card is a *marginal* probability, not the joint probability of the full observed set.

All icons are local OSRS PNGs from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db), including Moxi on the boss picker. Sources: [OSRS Wiki — Amoxliatl](https://oldschool.runescape.wiki/w/Amoxliatl), [KURU Amoxliatl drop table](https://kuru.co.kr/en/verticals/osrs/monster/amoxliatl/), and [Moon key half drop references](https://osrsindex.com/wiki/tooth-half-of-key-moon-key?site=osrs_wiki).

## Abyssal Sire

The [Abyssal Sire simulator and dry calculator](./sire/) model the boss's **Unsired and Font of Consumption rewards separately**, in the same two-panel format as Yama's opening results. Every completed kill gives Abyssal ashes. An independent **1/100 Unsired pre-roll** replaces the ordinary weighted main loot roll if successful. The regular loot table has **139 tickets**, including herb, seed, talisman and shared rare-drop-table branches. Elite clues roll separately at 1/180 (or 1/171 with Elite Combat Achievements); Brimstone keys appear only with the Konar-task option at 1/40. The simulator assumes all eligible clues can be received.

Each simulated Unsired is offered to the Font for exactly one reward. The 128-ticket reward pool consists of **62 bludgeon-piece, 26 abyssal dagger, 13 Jar of miasma, 12 abyssal whip, 10 abyssal head, and 5 Abyssal orphan tickets**. Bludgeon components cycle through the three distinct parts without duplicates before a full set is completed. The pet can be obtained only once; after it appears, the reward pool has 123 tickets without the pet.

The dry calculator has **two independent groups**. Enter completed kills and Unsireds received to calculate Unsired odds (1/100 per kill); then enter the number of each Font reward received to calculate the corresponding odds from the **number of Unsireds**, not from kills. Bludgeon-piece dry probabilities account for no duplicates within each set, and the pet-restricted rewards account for the once-only pet. There is deliberately **no "any item" chance** for Font rewards, because every Unsired awards one item. Fewer-than, exactly, and more-than probabilities appear for each observation. The probabilities are marginals, not a combined probability of receiving the entire entered reward distribution.

All item icons are local PNGs sourced from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db), including the Abyssal orphan on the boss picker. Sources: [OSRS Wiki — Abyssal Sire](https://oldschool.runescape.wiki/w/Abyssal_Sire) and [Unsired](https://oldschool.runescape.wiki/w/Unsired).

## Mad Angel

The [Mad Angel simulator and dry calculator](./mad-angel/) model the **repeatable post-quest fight**, not the quest-only variant. Source rates checked October 2026. Every kill yields **25–35 granite dust**. A checkbox allows one **Sunstone crystal** on the first simulated kill if the player's bank chest has not been built and they do not already own the crystal. Without this checkbox the simulator does not invent repeated crystal drops.

The loot simulator models the officially published pre-roll rates as **mutually exclusive** rewards: Ardeaglais teleports **2 at 1/25**, Hallowfell **1/127**, and Jar of Light **1/1,000**. These published *marginal probabilities* are preserved exactly, with a pre-roll success replacing the ordinary-loot result. If all pre-rolls fail, the main table consists of **148 standard-loot tickets** and **2 shared rare-drop-table tickets** out of 150, with one ordinary result per eligible kill. The shared RDT uses the same relative outcomes as the Alchemical Hydra module (default without ring of wealth or quest-specific modifiers).

The standard table includes **supply batches**: when selected, two sharks *or* yellowfins come bundled with Prayer potion(2) and Super combat potion(1). Other normal loot uses published quantities, including coins, noted raw monkfish, gems and potions. An independent tertiary roll awards **Aggy at 1/2,000** and medium clues at **1/25**, improving to **1/23** with the optional Medium Combat Achievements checkbox. Already-owned clues are not tracked.

The dry calculator accepts counts for **Ardeaglais teleports (total quantity, multiples of two), Hallowfell, Jar of Light, and Aggy**. It shows fewer/exact/more drop probabilities for each. The combined **Any rare reward** excludes teleports, and combines the mutually exclusive Hallowfell/Jar pre-rolls with Aggy's independent pet roll (which can occur on the same kill as a pre-roll). It does not count the conditional sunstone crystal.

All sprites, including Aggy on the homepage, are local PNGs sourced from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db). The pre-roll main-replacement model is an explicit interpretation of the drop-table "pre-roll" heading; exact simultaneous-drop behavior is not specified in the available source data. Published rates are maintained for each rare individually, but correlations between rare and standard rewards could differ in-game.

Sources: [OSRS Wiki — Mad Angel](https://oldschool.runescape.wiki/w/Mad_Angel), [Reldo drop table](https://reldo.org/a/mad-angel/), and the [August 2026 rate announcement](https://www.osrsdpscalc.com/en/blog/osrs-mad-angel-drop-rates-wyrmscraig-2026).

## Cerberus

The [Cerberus loot simulator and dry calculator](./cerberus/) model Cerberus's current table (not Echo Cerberus). Every completed kill yields one **Infernal ashes**. One main table roll has 130 equally weighted tickets: four mutually exclusive crystal/stone outcomes (one ticket each, **1/520** for Primordial crystal, Pegasian crystal, Eternal crystal and Smouldering stone) and 126 tickets for the listed common items, including the current batch of **seven Key master teleports** when selected.

The source also lists a **3/130 rare-drop-table access**, although its 130-ticket main table is already complete. This implementation treats the rare table as an *additional independent roll*, using the listed approximate item-rate proportions conditional on entry, including a possible nothing result. This is an explicit modelling choice for otherwise conflicting table totals. No ring of wealth or Legends' Quest adjustments are modelled. Tertiary rolls are separate: Ensouled hellhound head (1/15), elite clue (1/100 or 1/95 with **Elite Combat Achievements**), Jar of souls (1/2,000), and **Hellpuppy** (1/3,000). The optional **Konar task** toggle enables Brimstone keys (1/45); they are absent otherwise. Normal elite clue ownership and the special guaranteed elite-clue-task drops are not modelled.

The dry calculator shows **fewer than, exactly, and more than** the observed counts for each crystal, Smouldering stone, Jar of souls and Hellpuppy. Its **Any crystal or stone** summary uses the one-in-130 *mutually exclusive unique table*, rather than pretending the four crystals/stones roll independently. Jar and pet probabilities are calculated separately. All item graphics are local sprites from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db), and the Hellpuppy pet sprite is the boss selector icon.

Sources: [Cerberus (OSRS Wiki)](https://oldschool.runescape.wiki/w/Cerberus) and [Cerberus drop table (Reldo)](https://reldo.org/a/cerberus/).

## Alchemical Hydra

The [Alchemical Hydra simulator and dry calculator](./hydra/) use the boss's own drop mechanics, not those of ordinary hydras. Every kill yields **2 Hydra bones** and up to two ordinary drops; the first standard roll can be replaced by one success from a **sequential** special-drop chain: dragon thrownaxe, dragon knife, Hydra's claw, Hydra tail, Hydra leather, or one brimstone ring piece. The second roll is always standard. Conditional success rates yield effective rates of approximately 1/2,000 thrownaxes, 1/2,001 knives, 1/1,001 claw, 1/513 tail, 1/514 leather and 1/181.1 for *the next* brimstone piece. Pieces are distributed in fixed **eye → fang → heart → eye ...** order, not independently. Independent tertiary rolls include brimstone keys, both clue scroll tiers, Alchemical hydra heads, Jar of chemicals, and the Ikkle hydra pet. Hard and Elite Combat Achievement checkboxes apply the corresponding clue-rate boosts.

The drop-table source lists two regular loot rolls with a nominal denominator of 101, but summing the displayed category weights (including herb, seed and rare-drop table branches) yields **120 rather than 101**. To avoid invalid probabilities, this implementation normalizes the published weights as **relative weights**; standard-loot frequencies are therefore approximate rather than an exact 1/101 implementation. Herb and seed subtables use their listed relative rates, and the shared rare drop table is represented using its published relative rates, including Nothing. Normal-loot quantities are those of the published table. The simulator assumes elite and hard clue slots are free (does not model already-held clues), and rolls independent tertiary items each kill.

The dry calculator accepts counts for the claw, tail, leather, each brimstone-ring piece, Hydra heads, jar, and pet. Ring-piece odds correctly derive from the *number of sequential ring successes*: zero hearts on the first or second successful ring-piece roll, for instance. The **Any signature unique** summary counts the claw, tail, leather and ring-piece outcomes (not thrownaxe/knife or tertiary rolls), at most one per kill. Like the other simulators, it runs entirely in the browser. All reward sprites, including the Ikkle hydra home icon, are local PNGs from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db).

Drop mechanics and quantities: [Alchemical Hydra on the OSRS Wiki](https://oldschool.runescape.wiki/w/Alchemical_Hydra), corroborated with [Reldo](https://reldo.org/a/alchemical-hydra/) and [KURU](https://kuru.co.kr/en/verticals/osrs/monster/alchemical-hydra/).

## Yama

The [Yama simulator and dry calculator](./yama/) have **separate inputs for Solo (100% contribution) and Duo (50% contribution) kill counts**, and combine their results in a single loot summary. These model ordinary (non-contract) Yama encounters. Each player receives their own sequential roll: equipment at contribution/120, dossier at contribution/12 if the equipment roll fails, forgotten lockbox at 1/30 if preceding rolls fail, and oathplate shards at 1/15 if preceding rolls fail. A standard drop follows when no earlier reward succeeds. Normal loot quantities and the 12-shard quantity scale with contribution; Yami (1/2,500) and elite clues (1/30) roll independently. The supply table can produce several different supplies on one roll.

The loot simulator processes **solo kills first, then duo kills**, and combines all ordinary loot, unique rewards, forgotten lockboxes and dossiers into one result. Containers are opened immediately on their corresponding simulated kills, with their contents shown separately from Yama's main loot. The Rite of vile transference is guaranteed on the first dossier opened at or after **100 combined kills** unless already obtained; this assumes both kill inputs describe the same character's continuous kill-count progression. Later rite rolls become 15–18 chasm teleport scrolls because this model assumes the first rite was already learned. All reward icons are local OSRS item sprites from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db).

The Yama dry calculator **does not include any lockbox or dossier-opening rewards** or contracted Yama fights. Each observed item count is compared with the *combined distribution* of solo-rate and duo-rate drops, rather than treating all kills as having the same drop chance. **Oathplate shards** are counted by actual quantity, correctly combining **12 per solo shard drop** with **6 per duo shard drop**. "Any equipment drop or Yami" combines contribution-specific equipment-roll chances with the independent Yami pet roll across all kills. Forgotten lockboxes remain excluded from dry-input/output results. Total solo plus duo kills are capped at 1,000,000, and one combined set of drop counts is entered. The results are marginal probabilities, not the chance of receiving every observed reward simultaneously.

Sources: [Yama](https://oldschool.runescape.wiki/w/Yama), [Dossier](https://oldschool.runescape.wiki/w/Dossier), and [Forgotten lockbox](https://oldschool.runescape.wiki/w/Forgotten_lockbox). Numbers match Wiki tables retrieved October 2026.

## Phosani's Nightmare

The Phosani-only [simulator and dry calculator](./phosani/) use the solo boss's own drop table, not the regular Nightmare's. Each kill awards Big bones and one common-loot roll. The staff/armour/mace table rolls at **1/140** and the separate orb table at **3/1,600**; both can award a signature drop on the same kill. Staff/armour/mace selection uses the April 2026 Mod Ash confirmation, including the 8% staff-to-mace swap.

Common loot uses Phosani-specific quantity ranges. The Wiki's displayed common-table weights are **rounded** and add to 101%, so they are normalized as relative weights. Each simulated session starts at zero kill count. The Slepey tablet receives its random 1/25 roll, with a first tablet guaranteed by kill 25 if none previously dropped. Optional Elite Combat Achievements change the elite clue rate from 1/35 to 1/33. Elite clue ownership, prices, and previous account history are not tracked.

The dry calculator supports the eight signature drops plus the Little nightmare pet, Parasitic egg and Jar of dreams. The **Any signature unique** result is the total count across the eight signature items, calculated by convolving the two independent table-roll distributions; a single kill can produce two such items. The pet, egg and jar have independent odds. Tablet guarantee and clues are not part of the dry calculator. All calculations and item image loading run locally. The item inventory sprites are stored under `assets/items/` (sourced from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db)), including the Little nightmare pet icon used in the boss selector. No Wiki image or rate requests are made at runtime.

## Doom of Mokhaiotl features

- Choose how many **individual delves were completed at each level** 1–8 and 9+.
- Switch between **Loot simulator** and **Dry calculator** without re-entering delve counts.
- Each entered delve yields one regular loot roll, its own guaranteed demon tears and its own eligible unique rolls. A complete run ending at level 8 is entered as one delve at **each level 1 through 8**, not as a single entry of 1 at level 8.
- The **9+** field combines all individual delves at level 9 or deeper, each of which gets **one independent roll** at the level-9 rates and a +20% common-loot quantity multiplier.
- Enter delve counts directly and repeat a simulation to reroll.
- Weighted common loot, guaranteed demon tears, independent clue and pet chances, and depth-gated equipment drops.
- Aggregated loot and four unique rewards displayed using local OSRS inventory sprites; no CSV export.
- The dry calculator accepts obtained **Mokhaiotl cloth**, **Eye of ayak**, **Avernic treads**, and **Dom pet** counts, and reports the probability of **fewer than**, **exactly**, or **more than** the observed count for each item.
- The **Any unique drop** summary shows the chance to receive at least one of these four drops, plus fewer/exactly/more chances for the sum of their observed counts.
- Matching dark brown/charcoal and muted gold colour palette from [BingoPlayerStats](https://github.com/KihiraLove/BingoPlayerStats).

## Dry calculator math

The dry calculator follows the probability approach of the [OSRS Wiki dry calculator](https://oldschool.runescape.wiki/w/Calculator:Dry_calc), extended for the different unique drop rates at each floor. For each selected completed delve, that specific level contributes one chance of obtaining a particular item. For each item separately, these Bernoulli trials form a Poisson-binomial count distribution. The implementation groups equal-rate trials as binomial distributions and convolves them for numerical accuracy.

For an item with observed count `k`, **fewer** = `P(X < k)`, **exactly** = `P(X = k)`, and **more** = `P(X > k)`. The three probabilities sum to 100% (subject to normal rounding). Each item also shows its expected drop count. Unlike a single-drop dry formula, this supports varying floor probabilities.

**Important:** the four individual probabilities are **per item**, not the joint probability of obtaining all four entered counts together. The **Any unique drop** result instead models the **total** unique-item count: each floor has one mutually exclusive equipment roll (with its chance equal to the sum of eligible equipment-item probabilities) and an independent Dom pet roll. Those two rolls can both succeed on a floor. Its at-least-one chance is calculated as one minus the probability of no eligible unique reward from any entered delve. Cloth, Eye of ayak, and treads are mutually exclusive within an equipment roll; Dom uses an independent pet roll. The algorithm omits only numerically negligible distribution tails at the maximum supported simulation size. Extremely small outcomes may be rendered as approximately 0%.

No extra data, requests, cookies, tracking, or backend are needed. The `9+` input represents individual delves at 9 or deeper, with unchanged rates.

## Local development

Serve the repository root using any static HTTP server:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000/ for the boss picker, http://localhost:8000/doom/ for Doom, http://localhost:8000/phosani/ for Phosani's Nightmare, http://localhost:8000/yama/ for Yama, http://localhost:8000/hydra/ for Alchemical Hydra, http://localhost:8000/cerberus/ for Cerberus, http://localhost:8000/mad-angel/ for Mad Angel, http://localhost:8000/sire/ for Abyssal Sire, http://localhost:8000/amoxliatl/ for Amoxliatl, http://localhost:8000/araxxor/ for Araxxor, http://localhost:8000/barrows/ for Barrows, http://localhost:8000/brutus/ for Brutus, http://localhost:8000/bryophyta/ for Bryophyta, or http://localhost:8000/obor/ for Obor. JavaScript modules may not work from a `file://` URL.

## Tests

Requires Node.js 20+, no installation step:

```sh
node --test tests/*.test.mjs
node --check app.mjs
node --check simulator.mjs
node --check phosani/simulator.mjs
node --check phosani/dry-calc.mjs
node --check phosani/app.mjs
node --check yama/simulator.mjs
node --check yama/dry-calc.mjs
node --check yama/app.mjs
node --check hydra/simulator.mjs
node --check hydra/dry-calc.mjs
node --check hydra/app.mjs
node --check cerberus/simulator.mjs
node --check cerberus/dry-calc.mjs
node --check cerberus/app.mjs
node --check mad-angel/simulator.mjs
node --check mad-angel/dry-calc.mjs
node --check mad-angel/app.mjs
node --check sire/simulator.mjs
node --check sire/dry-calc.mjs
node --check sire/app.mjs
node --check amoxliatl/simulator.mjs
node --check amoxliatl/dry-calc.mjs
node --check amoxliatl/app.mjs
node --check araxxor/simulator.mjs
node --check araxxor/dry-calc.mjs
node --check araxxor/app.mjs
node --check barrows/simulator.mjs
node --check barrows/dry-calc.mjs
node --check barrows/app.mjs
node --check brutus/simulator.mjs
node --check brutus/dry-calc.mjs
node --check brutus/app.mjs
node --check bryophyta/simulator.mjs
node --check bryophyta/dry-calc.mjs
node --check bryophyta/app.mjs
node --check obor/simulator.mjs
node --check obor/dry-calc.mjs
node --check obor/app.mjs
```

## GitHub Pages

A workflow in `.github/workflows/pages.yml` deploys on pushes to `main` after validation. If needed, select **GitHub Actions** as the Pages source in repository settings.

Site: https://kihiralove.github.io/osrs-boss-loot-simulators/ (boss picker)

Doom simulator: https://kihiralove.github.io/osrs-boss-loot-simulators/doom/

Phosani simulator: https://kihiralove.github.io/osrs-boss-loot-simulators/phosani/

Yama simulator: https://kihiralove.github.io/osrs-boss-loot-simulators/yama/

Alchemical Hydra simulator: https://kihiralove.github.io/osrs-boss-loot-simulators/hydra/

Cerberus simulator: https://kihiralove.github.io/osrs-boss-loot-simulators/cerberus/

Mad Angel simulator: https://kihiralove.github.io/osrs-boss-loot-simulators/mad-angel/

Abyssal Sire simulator: https://kihiralove.github.io/osrs-boss-loot-simulators/sire/

Amoxliatl simulator: https://kihiralove.github.io/osrs-boss-loot-simulators/amoxliatl/

Araxxor simulator: https://kihiralove.github.io/osrs-boss-loot-simulators/araxxor/

Barrows simulator: https://kihiralove.github.io/osrs-boss-loot-simulators/barrows/

Brutus simulator: https://kihiralove.github.io/osrs-boss-loot-simulators/brutus/

Bryophyta simulator: https://kihiralove.github.io/osrs-boss-loot-simulators/bryophyta/

Obor simulator: https://kihiralove.github.io/osrs-boss-loot-simulators/obor/

## Deployment

GitHub Pages is deployed by [Deploy GitHub Pages](./.github/workflows/pages.yml).
The workflow validates the JavaScript and tests, then publishes the static site when
a commit is pushed to `main`. It also supports manual deployment from
**Actions → Deploy GitHub Pages → Run workflow → main**.

Some API-authenticated commits may not generate a workflow-triggering push event.
As a fallback, the workflow checks the current published revision every 15 minutes
and deploys if it differs from the latest `main` commit. GitHub may delay scheduled
workflow runs, so the fallback is not an immediate deployment guarantee.
Successful deployments publish `deployment-revision.txt` to let future scheduled
checks skip redundant deployments. Always confirm the deployed revision before
considering the site up to date.

## Loot model

The common loot table is one 312-ticket weighted roll per completed delve. Stack sizes scale by that delve level with truncation: `quantity = base + trunc(base * level_multiplier)`. Every counted delve separately adds the guaranteed demon tears from its row and rolls for its eligible equipment, Dom pet, and elite clue scroll. Neither guaranteed demon tears nor unique rewards use the common-loot quantity multiplier.

Entered delves are treated as completed and claimed. The simulator does not model deaths, lost rewards, level-specific rate changes above 9, existing elite clues, Eye charges, or market prices. Simulated loot is random and is not persisted.

Rates are maintained locally in [`simulator.mjs`](./simulator.mjs); PNG sprites are in [`assets/items/`](./assets/items/), sourced from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db). Check the [OSRS Wiki](https://oldschool.runescape.wiki/w/Doom_of_Mokhaiotl) when updating rate data. Old School RuneScape and game artwork belong to Jagex; the original MIT license applies to the project's own code, not game assets.
