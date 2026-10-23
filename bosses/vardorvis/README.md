# Vardorvis

[Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/bosses/vardorvis/) · [All simulators](../../README.md) · [OSRS Wiki](https://oldschool.runescape.wiki/w/Vardorvis)

Enter normal Vardorvis kills. Perfect improves ordinary quantities without changing unique or pet chances.

- Ultor vestige arrives on every third vestige-table hit, starting at zero progress. Dry odds use floor(Binomial(kills, 3/1,088) / 3), not a flat 1/1,088 chance.
- Tablet pity uses the published base rate; first-quartz scaling is approximated linearly. Those items are excluded from dry inputs. The 22 unspecified ordinary-table tickets remain empty.
