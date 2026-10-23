# Chest calculators

The nine calculators use OSRS Wiki reward tables checked on 23 October 2026. All images and calculations are local; opening a calculator makes no Wiki API requests.

| Calculator / source | Rewards and tracked dry probabilities per opening |
| --- | --- |
| [Larran's Chest](https://oldschool.runescape.wiki/w/Larran%27s_big_chest) | Big chest only. Each Dagon'hai piece: 1/256, mutually exclusive. Otherwise one 60-ticket main roll, including three fish tickets. |
| [Zombie Pirate Chest](https://oldschool.runescape.wiki/w/Zombie_Pirate%27s_Locker) | Zombie Pirate's Locker. Teleport anchoring scroll: 1/275. Otherwise one 173-ticket main roll. Ordinary quantities are twice an integer base roll; scrolls remain single. |
| [Brimstone Chest](https://oldschool.runescape.wiki/w/Brimstone_chest) | Broken dragon hasta: 1/200; each of five dusk mystic pieces: 1/1,000. These mutually exclusive pre-roll rewards replace the 60-ticket main roll, which includes three fish tickets. |
| [Muddy Chest](https://oldschool.runescape.wiki/w/Muddy_chest) | Always one uncut ruby, two mithril bars, five law runes, five death runes and 15 chaos runes. On members worlds, each of five blighted supply bundles: 3/280; Larran's key: 6/280. At most one bonus bundle. Free-to-play worlds have only the guaranteed rewards. |
| [Elven Crystal Chest](https://oldschool.runescape.wiki/w/Elven_Crystal_Chest) | Uncut onyx: 1/10,000; each dragonstone armour piece: 1/2,500. Otherwise one 256-ticket reward bundle, always including an uncut dragonstone. Shield left half is 1/256 conditional on the ordinary table, or 0.9979/256 per opening. |
| [Grubby Chest](https://oldschool.runescape.wiki/w/Grubby_Chest) | Two independent food rolls, one potion roll, one main roll. Foods/potions that arrive together are bundled. Crystal key: 6/100. Separate mutually exclusive orange and blue egg sac outcomes: 1/25 each. |
| [Dark Chest](https://oldschool.runescape.wiki/w/Dark_Chest) | Shield left half, dragon plateskirt and dragon platelegs: 1/600 each, mutually exclusive pre-rolls. Otherwise one 600-ticket ordinary roll. |
| [Chest (moon key)](https://oldschool.runescape.wiki/w/Chest_%28moon_key%29) | Always 250 sunfire splinters. First onyx at 1/5,000, then helmet at 1/500 if the onyx fails, otherwise the 107-ticket main table. Helmet probability per opening is (4,999/5,000)/500. |

The Wiki often estimates drop rates from player observations. Tables here preserve the published rare probabilities and treat ordinary table weights as conditional where their weights already sum to a complete table. The Zombie Pirate scroll is modeled as replacing the ordinary roll; the Wiki gives its standalone rate without explicitly specifying roll order. Elven onyx and armour are mutually exclusive at the published individual rates. Grubby's egg sacs use one mutually exclusive bonus roll, consistent with its [reward transcript](https://oldschool.runescape.wiki/w/Transcript:Grubby_Chest). Individual dry odds do not depend on correlations with other items.

## Fish

Larran's and Brimstone use the Fishing-level estimates from [Module:Slayer chest fish chart](https://oldschool.runescape.wiki/w/Module:Slayer_chest_fish_chart) and the rounding/clamping formula in [Module:Skilling success chart](https://oldschool.runescape.wiki/w/Module:Skilling_success_chart). Rolls proceed through manta ray, turtle, shark, monkfish, swordfish and tuna, falling back to lobster. Each successful manta/turtle/shark roll chooses its fish with weight 2, raw shark with weight 3, or shark lure with weight 3.

Larran's quantities are floor(1.5 × base quantity). Lures are floor(2 × chest multiplier × base shark quantity), retaining the appropriate integer steps. The raw fish estimates do not affect the tracked rare-drop dry odds.

## Calculations and validation

Each dry field counts individual items received, including supply quantities. A fixed bundle of size q and probability p gives q × Binomial(openings, p). This handles Muddy's bundles and Sinister's guaranteed herbs without treating their contents as independent drops. Impossible intermediate quantities have zero exact probability. The interface reports fewer, exactly, more and at least one, with expected item quantities.

The same reward trees supply the simulator and dry probabilities. The calculators accept 0–1,000,000 completed openings, reject invalid counts and mutually exclusive totals greater than available rolls, and use the existing numerically stable binomial calculation for large counts. They do not subtract key costs or award experience.

All chest scenery images and missing item sprites were downloaded from the Wiki and stored in `assets/items/`. The download URLs and source pages are recorded in [assets/chest-sources.json](../assets/chest-sources.json). Game artwork belongs to Jagex.
