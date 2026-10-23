# General Graardor

[Open General Graardor simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/general-graardor/) · [All simulators](../../README.md)

## Full-room loot simulator

Each entered **General Graardor kill** simulates a complete Bandos boss-room clear: **one General Graardor, one Sergeant Strongstack (melee), one Sergeant Steelwill (magic), and one Sergeant Grimspike (ranged)**. Each has an independent loot roll. The simulator shows their loot in **four separate windows** and also keeps an aggregated drop total internally.

Graardor and the bodyguards have distinct, mutually exclusive main-table rolls. Graardor's **127-ticket** main table contains Bandos armour (1 ticket, divided among three pieces), hilt (1 ticket, 1/4 hilt), and Godsword shards (1 ticket, 1/6 per shard). The remaining rolls include equipment, seeds, runes, skilling supplies, and the God Wars rare/gem drop tables. Each sergeant's **127-ticket** table contains separate armour (1 ticket, divided among 128 subrolls with 1 ticket each for three armour pieces), shard (1 ticket, 1/12 per shard) and the 125-ticket common loot.

The God Wars rare/gem table uses the repository's shared rare-drop weights with key modifications: rune swords replace runite bars, empty outcomes become 19,500–20,000 coins, and underground talisman rolls produce chaos talismans. As with other rare-drop-table approximations in this repository, this is a model rather than a bit-for-bit reproduction of every God Wars subtable.

### Unique rates by source

| Drop | Graardor per kill | Each sergeant per kill |
| --- | --- | --- |
| Bandos chestplate | 1/381 | 1/16,256 |
| Bandos tassets | 1/381 | 1/16,256 |
| Bandos boots | 1/381 | 1/16,256 |
| Bandos hilt | 1/508 | Not dropped |
| Godsword shard 1 | 1/762 | 1/1,524 |
| Godsword shard 2 | 1/762 | 1/1,524 |
| Godsword shard 3 | 1/762 | 1/1,524 |
| Pet General Graardor | 1/5,000 | Not dropped |

Tertiary drops occur independently. Graardor has a 1/250 elite clue (1/237 after elite Combat Achievements), 1/400 long bone, 1/5,012.5 curved bone, and 1/50 brimstone key on a Konar task. Each sergeant can independently drop a hard clue at 1/128 (1/121 after hard Combat Achievements) and a goblin champion scroll at 1/5,000. Strongstack can drop a kebab, Steelwill a beer, and Grimspike a right eye patch, each at 1/6.

Frozen key pieces are simulated **only when the Frozen Door miniquest option is selected**: one guaranteed from Graardor and an independent 1/20 chance per bodyguard. Clue inventory restrictions are not modeled.

## Combined dry calculator

Enter **Graardor KC** and the total number received for each of the eight collection-log rares across Graardor and his three guards. The calculator always includes all four loot sources per room. For a particular item, the full-room drop count follows the exact independent sum:

\[
X \sim \operatorname{Binomial}(KC, p_{\mathrm{Graardor}}) + \operatorname{Binomial}(3KC, p_{\mathrm{sergeant}})
\]

For Bandos hilt and the pet, the sergeant probability is zero. For the three Bandos armour pieces and three Godsword shards, the sergeant rolls are included. The odds displayed are fewer / exactly / more copies than the reported total, expected copies and probability of at least one. Each source's rare loot is kept visually separate in the simulator, even when the same item drops from multiple monsters.

Local OSRS item PNG icons need no browser-time API requests.

Sources: [General Graardor](https://oldschool.runescape.wiki/w/General_Graardor), [Sergeant Strongstack](https://oldschool.runescape.wiki/w/Sergeant_Strongstack), [Sergeant Steelwill](https://oldschool.runescape.wiki/w/Sergeant_Steelwill), [Sergeant Grimspike](https://oldschool.runescape.wiki/w/Sergeant_Grimspike).
