# The Fractured Archive

[Open the loot simulator and dry calculator](https://kihiralove.github.io/osrs-boss-loot-simulators/bosses/fractured-archive/).

Use one or more segments in the form `<completions>kc<group size>g<personal deaths>d`. Each segment uses the same group size and personal deaths for every completion. For example, `12kc5g2d11kc2g0d` represents 12 five-player completions with two personal deaths apiece and 11 deathless duo completions.

The calculator estimates personal purple chances from equal contribution before deaths. The team chance starts at 1 in 14 and gains 4% of that base per player above two. Each personal death costs 10% of the player's expected contribution. The model uses cabbage at zero contribution. The game also applies unpublished cabbage and team-death penalties.

Standard chests roll the standard table three times with the per-roll quantity multiplier. The simulation starts with no Archivist's folio or elemental fragments, keeps the first folio, and rolls each fragment at most once. The dry calculator combines the different per-completion chances and uses the same collection rules.

[Jagex's published loot mechanics](https://secure.runescape.com/m=news/quest-month-kick-off-tfa-tweaks--more?oldschool=1) · [OSRS Wiki reward chest](https://oldschool.runescape.wiki/w/Chest_%28The_Fractured_Archive%29)
