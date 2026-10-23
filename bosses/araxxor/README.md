# Araxxor

[Open Araxxor simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/araxxor/) · [All simulators](../../README.md)

## Mechanics and drop rates

The [Araxxor simulator and dry calculator](./) model the Old School RuneScape solo Slayer boss, with a **Harvest / Destroy** corpse decision above the kill count. **Harvest** rolls loot normally and has a **1/3,000 Nid** pet chance. **Destroy** forfeits all normal loot, including noxious pieces, fang, jar, head and supplies, but retains the elite clue scroll roll and increases **Nid to 1/1,500**. The dry calculator uses the selected mode, hides unobtainable Destroy rewards, and displays the mode-specific Nid odds.

On Harvest, the primary unique pre-roll is **1/150**, selecting a noxious halberd piece or the araxyte fang with equal weight (any halberd piece **1/200**, fang **1/600**). The three named halberd pieces are **duplicate-protected until a complete trio**: each group of three successful piece rolls gives one blade, one point and one pommel in a random order. When the unique roll fails, one reward is chosen from the normal **115-ticket weighted table**, including a 15-ticket bundled supply outcome, tree-herb seed subtable and shared rare-drop-table branch. Supply outcomes grant an araxyte venom sac or super combat potion, a prayer potion and sharks or wild pies. The relative seed and rare table weights are normalized from published rates; item quantities and unmodified rare-drop-table conditions follow the OSRS Wiki. The normal main table is replaced by a successful unique pre-roll.

Other Harvest drops roll independently: Araxyte head (**1/250**), Jar of venom (**1/1,500**), elite clue scroll (**1/50**, or **1/47** with Elite Combat Achievements), and Nid (**1/3,000**). A **Konar boss task** setting enables Brimstone keys at **1/40** when Harvesting. The optional **coagulated venom** checkbox adds one only when the player is eligible for the guaranteed *sub-1:15, not-yet-owned* reward; it is not given unconditionally per kill.

The dry calculator displays fewer-than, exactly, and more-than probabilities for each signature reward, araxyte head, jar and Nid. Each halberd piece is calculated from the **1/200 shared piece-roll distribution**, accounting for nonrepeating pieces within each trio, rather than independently treating named pieces as ordinary 1/600 rolls. **Any signature unique** uses the mutually exclusive **1/150** table for the four main signature rewards; head, jar and pet are reported individually. The combined summary disappears in Destroy mode. All sprites are local PNGs from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db), including the Nid homepage icon.

Sources: [OSRS Wiki — Araxxor](https://oldschool.runescape.wiki/w/Araxxor), [OSRS Index Araxxor reference](https://osrsindex.com/wiki/araxxor?site=osrs_wiki), and [RuneTools drop table](https://runetools.com/bestiary/araxxor).
