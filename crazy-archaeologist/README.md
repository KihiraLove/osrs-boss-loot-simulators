# Crazy Archaeologist

[Open Crazy Archaeologist simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/crazy-archaeologist/) · [All simulators](../README.md)

## Mechanics and drop rates

The simulator accepts completed kills and offers the same loot and dry-calculator modes as the other bosses. Each kill always drops **one bones**. The **Odium shard 2** and **Malediction shard 2** are mutually exclusive **1/256** pre-rolls, for **1/128** chance of either shard; receiving one replaces the regular table reward. **Fedora** is a separate **1/128** tertiary roll, so it can appear alongside a shard. The Crazy Archaeologist has no pet.

Normal drops follow the Wiki's weighted **128-ticket** table, including the paired 6 noted uncut emeralds and 4 noted uncut sapphires, variable 499–3,998 coins, and rare and gem table branches (4/128 each). The published weights for the ordinary rewards plus those branches add to 127/128; the model preserves all explicitly published rates, with the remaining **1/128** ticket giving no ordinary reward rather than silently increasing other items' probabilities. Rare/gem rewards use the Wiki's rounded unboosted overall chances, normalized within the two branches. Ring-of-wealth modifications to the rare/gem table and quest modifiers are not simulated.

Each kill independently rolls a **looting bag** (1/3), **Fedora** (1/128), and hard clue scroll (**1/128**, **1/121** with Hard Combat Achievements, **1/64** with imbued ring of wealth, **1/60** with both). Optional Slayer tasks produce **brimstone keys** (1/80, Konar) or **Larran's keys** (1/76) and **Slayer's enchantments** (1/30, Krystilia). These two task types cannot be combined. Existing looting bags and held clue scrolls are not tracked.

The **dry calculator** accepts the received counts of the three collection-log uniques. It reports expected counts, probabilities of fewer / exactly / more drops, individual at-least-one odds, and the combined odds. The two shards share a mutually exclusive pre-roll, while Fedora is an independent tertiary roll, allowing up to two uniques from one kill. All icons are bundled locally.

Source: [OSRS Wiki — Crazy archaeologist](https://oldschool.runescape.wiki/w/Crazy_archaeologist).
