# Chests

Eight loot simulators and dry calculators. Enter completed openings and the individual item quantities received.

- [Larran's Chest](larrans-chest/README.md)
- [Zombie Pirate Chest](zombie-pirate-chest/README.md)
- [Brimstone Chest](brimstone-chest/README.md)
- [Muddy Chest](muddy-chest/README.md)
- [Elven Crystal Chest](elven-crystal-chest/README.md)
- [Grubby Chest](grubby-chest/README.md)
- [Dark Chest](dark-chest/README.md)
- [Chest (moon key)](moon-key-chest/README.md)

## Calculations

Tables were checked against the OSRS Wiki on 23 October 2026. Published rare rates are preserved; ordinary weights are conditional on reaching their table. Rates estimated from player observations may differ slightly from game internals. Each chest guide records its specific assumptions.

The same reward trees drive simulation and dry odds. A bundle of q items with probability p uses q × Binomial(openings, p). Intermediate quantities have zero exact probability. Inputs accept 0–1,000,000 openings and reject impossible counts or mutually exclusive totals. Key costs and experience are excluded.

## Fishing rewards

Larran's and Brimstone use the estimates in [Slayer chest fish chart](https://oldschool.runescape.wiki/w/Module:Slayer_chest_fish_chart) and the rounding formula in [Skilling success chart](https://oldschool.runescape.wiki/w/Module:Skilling_success_chart). Fish are checked sequentially: manta ray, turtle, shark, monkfish, swordfish, tuna, then fallback lobster. Successful manta/turtle/shark rolls choose their fish, shark or shark lure with weights 2:3:3.

Larran's quantities are floor(1.5 × base quantity). Lures use floor(2 × chest multiplier × base shark quantity), preserving integer steps. Fishing estimates do not affect tracked rare-drop dry odds.

## Code and images

Shared [tables](../shared/chest-data.mjs), [calculations](../shared/chest-calculator.mjs) and [UI](../shared/chest-app.mjs) power every chest. Wiki images are stored in `assets/items/`; [asset sources](../assets/chest-sources.json) record download URLs. Game artwork belongs to Jagex. No Wiki requests are made while using the calculators.
