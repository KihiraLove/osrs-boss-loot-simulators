# Vet'ion and Calvar'ion

[Open Vet'ion and Calvar'ion simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/vetion-calvarion/) · [All simulators](../../README.md)

## Mechanics and drop rates

The [Vet'ion and Calvar'ion simulator](./) uses two separate boss KC inputs and shows **one combined loot inventory** with six rare rewards. Each kill independently rolls the corresponding boss's common table (**126 weighted tickets for Vet'ion; 128 for Calvar'ion**). This model assumes **solo Vet'ion** and counts one guaranteed big bone per kill. In multi-player Vet'ion fights, eligibility and quantity differ.

Shared exclusive primary unique rewards, with their **Vet'ion / Calvar'ion drop rates**, are Skull of Vet'ion **1/196 / 1/618**, Dragon 2h sword **1/256 / 1/358**, Dragon pickaxe **1/256 / 1/358**, Voidwaker blade **1/360 / 1/912**, and Ring of the gods **1/512 / 1/716**. Vet'ion Jr. **1/1,500 / 1/2,800** is an independent pet roll, so it may be dropped alongside a primary unique. The simulator also models a separate 1/3 supply-package roll, looting bag, elite clue, long/curved bone and skeleton champion scroll tertiary rolls.

The **dry calculator** asks for both kill counts and how many of each rare item the user received. Each reward's probability distribution is the convolution of `Binomial(Vet'ion KC, Vet'ion drop rate)` and `Binomial(Calvar'ion KC, Calvar'ion drop rate)`. The calculator shows expected quantity, odds of fewer/exactly/more than the user-entered number, and the probability of receiving at least one. The any-unique result allows the independently rolled pet alongside a primary unique.

Not modelled: group damage-contribution scaling, clue-scroll ownership, ring-of-wealth imbue and Combat Achievements, and Slayer-gated rewards such as brimstone or Larran's keys or Slayer's enchantments. All images are bundled locally; no runtime Wiki API requests.

Sources: [OSRS Wiki Vet'ion](https://oldschool.runescape.wiki/w/Vet%27ion), [Calvar'ion](https://oldschool.runescape.wiki/w/Calvar%27ion), and the [Vet'ion](https://reldo.org/a/vetion/) and [Calvar'ion](https://reldo.org/a/calvarion/) drop-table references.
