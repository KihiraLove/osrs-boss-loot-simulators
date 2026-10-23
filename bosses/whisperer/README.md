# The Whisperer

[Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/bosses/whisperer/) · [All simulators](../../README.md) · [OSRS Wiki](https://oldschool.runescape.wiki/w/The_Whisperer)

Enter normal Whisperer kills. Perfect improves ordinary quantities without changing unique or pet chances.

- Bellator vestige arrives on every third vestige-table hit. Dry odds use floor(Binomial(kills, 3/512) / 3), starting with zero progress.
- Tablet pity uses the published base rate; first-quartz scaling is approximated linearly. Both are excluded from dry inputs. The 22 unspecified ordinary-table tickets remain empty.
