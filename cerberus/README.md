# Cerberus

[Open Cerberus simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/cerberus/) · [All simulators](../README.md)

## Mechanics and drop rates

The [Cerberus loot simulator and dry calculator](./) model Cerberus's current table (not Echo Cerberus). Every completed kill yields one **Infernal ashes**. One main table roll has 130 equally weighted tickets: four mutually exclusive crystal/stone outcomes (one ticket each, **1/520** for Primordial crystal, Pegasian crystal, Eternal crystal and Smouldering stone) and 126 tickets for the listed common items, including the current batch of **seven Key master teleports** when selected.

The source also lists a **3/130 rare-drop-table access**, although its 130-ticket main table is already complete. This implementation treats the rare table as an *additional independent roll*, using the listed approximate item-rate proportions conditional on entry, including a possible nothing result. This is an explicit modelling choice for otherwise conflicting table totals. No ring of wealth or Legends' Quest adjustments are modelled. Tertiary rolls are separate: Ensouled hellhound head (1/15), elite clue (1/100 or 1/95 with **Elite Combat Achievements**), Jar of souls (1/2,000), and **Hellpuppy** (1/3,000). The optional **Konar task** toggle enables Brimstone keys (1/45); they are absent otherwise. Normal elite clue ownership and the special guaranteed elite-clue-task drops are not modelled.

The dry calculator shows **fewer than, exactly, and more than** the observed counts for each crystal, Smouldering stone, Jar of souls and Hellpuppy. Its **Any crystal or stone** summary uses the one-in-130 *mutually exclusive unique table*, rather than pretending the four crystals/stones roll independently. Jar and pet probabilities are calculated separately. All item graphics are local sprites from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db), and the Hellpuppy pet sprite is the boss selector icon.

Sources: [Cerberus (OSRS Wiki)](https://oldschool.runescape.wiki/w/Cerberus) and [Cerberus drop table (Reldo)](https://reldo.org/a/cerberus/).
