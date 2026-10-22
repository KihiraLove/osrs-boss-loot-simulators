# Commander Zilyana

[Open Commander Zilyana simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/commander-zilyana/) · [All simulators](../README.md)

## Loot simulator

Each entered **Zilyana KC** simulates one **Commander Zilyana**, **Starlight (melee)**, **Growler (magic)** and **Bree (ranged)** kill. Results appear in **four separate loot windows**, with an aggregated total kept for calculations.

Each monster rolls one independent, mutually exclusive **127-ticket main table**. Zilyana's two-ticket unique branch awards Saradomin sword with probability 4/8, Saradomin's light with 2/8, and Armadyl crossbow or Saradomin hilt with 1/8 each. The one-ticket shard branch awards one of three Godsword shards with a probability of 1/6 each, otherwise coins.

Each bodyguard has a one-ticket Saradomin sword branch (3/127 chance of the sword), and a one-ticket Godsword shard branch (1/12 for each shard); otherwise, coins. Their other drops include arrows, darts, runes, monkfish, summer pies, ranarr weed, snape grass, unicorn horns and coins.

Zilyana's ordinary table includes rune equipment, potions, seeds, resources and a God Wars variant of the rare/gem tables. **Saradomin brew(3) and super restore(4) drop together**, as do **super defence(3) and magic potion(3)**. The rare/gem subtable uses the existing repository weights and God Wars substitutions, so it is an approximation for its rarer outcomes.

### Collection-log drop rates

| Item | Zilyana | Each bodyguard |
| --- | --- | --- |
| Saradomin sword | 1/127 | 3/16,129 |
| Saradomin's light | 1/254 | — |
| Armadyl crossbow | 1/508 | — |
| Saradomin hilt | 1/508 | — |
| Godsword shard 1 | 1/762 | 1/1,524 |
| Godsword shard 2 | 1/762 | 1/1,524 |
| Godsword shard 3 | 1/762 | 1/1,524 |
| Pet Zilyana | 1/5,000 | — |

The pet is a separate tertiary roll. Zilyana gets elite clues at **1/250** (or **1/237** with elite Combat Achievements) and Konar Slayer task brimstone keys at **1/50**, when enabled. Each bodyguard gets hard clues at **1/128** (or **1/121** with hard Combat Achievements).

The Frozen Door option enables a guaranteed Saradomin frozen-key piece from Zilyana and a separate **1/20** chance per bodyguard. Clue inventory restrictions are not modeled.

## Combined dry calculator

Rare drops entered are **the total obtained from Zilyana and all three bodyguards**. For a particular rare item:

\[
X \sim \operatorname{Binomial}(KC,p_{\mathrm{Zilyana}}) + \operatorname{Binomial}(3KC,p_{\mathrm{guard}})
\]

This combines the sources without averaging their rates. The calculator shows expected copies, at least one, and probabilities for fewer / exactly / more copies than obtained. Only the Saradomin sword and Godsword shards can drop from bodyguards; the other rare items remain Zilyana-only.

All PNG item icons are stored locally. No runtime Wiki API requests are needed.

Sources: [Commander Zilyana](https://oldschool.runescape.wiki/w/Commander_Zilyana), [Starlight](https://oldschool.runescape.wiki/w/Starlight), [Growler](https://oldschool.runescape.wiki/w/Growler), [Bree](https://oldschool.runescape.wiki/w/Bree); [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db).
