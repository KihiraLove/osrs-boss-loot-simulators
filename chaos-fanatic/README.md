# Chaos Fanatic

[Open Chaos Fanatic simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/chaos-fanatic/) · [All simulators](../README.md)

## Mechanics and drop rates

The [Chaos Fanatic simulator](./) has a completed-kills input, a loot simulator, and a dry calculator matching the site's existing layout. The **Odium shard 1** and **Malediction shard 1** are mutually exclusive pre-roll drops at **1/256 each** (any shard **1/128**); if a shard drops, it replaces the ordinary main drop. **Pet chaos elemental** is rolled independently at **1/1,000**, so a shard and pet can appear together. Every kill guarantees one bones.

The remaining kills use a **128-ticket main drop table** with genuine quantities and mutually exclusive ordinary rewards. Zamorak monk top/bottom and the noted uncut emerald/sapphire stacks are dropped together. Rare and gem branches each have **4/128** of the table, and use the OSRS Wiki's published unboosted overall rare/gem rates. Its rounded rare/gem chances are normalized; quest-dependent modifiers and ring-of-wealth effects on the rare/gem table are not simulated. The simulator also rolls a looting bag **1/3**, hard clue scroll **1/128** (**1/121** with Hard Combat Achievements, **1/64** with imbued ring of wealth, **1/60** with both), and optional Slayer loot: Konar brimstone key **1/80** or Krystilia Larran's key **1/76** plus Slayer's enchantment **1/30**. Slayer task types are mutually exclusive. The simulator does not track an already held clue scroll.

The **dry calculator** accepts obtained shard and pet counts and reports fewer/exactly/more outcomes, expected counts, individual at-least-one chances, and combined any-rare odds. It uses a **1/128 exclusive shard** roll per kill and an **independent 1/1,000 pet** roll, correctly permitting up to two rare drops on one kill. All item inventory sprites are bundled as local PNGs.

Source: [OSRS Wiki — Chaos Fanatic](https://oldschool.runescape.wiki/w/Chaos_Fanatic).
