# Callisto and Artio

[Open Callisto and Artio simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/callisto-artio/) · [All simulators](../README.md)

## Mechanics and drop rates

[Callisto and Artio](./) share one page with **separate Callisto KC and Artio KC inputs**, a **combined loot inventory**, and a combined dry calculator. Every kill is simulated with the respective boss's loot quantities and rates, not a shared blended drop rate. The unique section displays all six collection-log rewards. The homepage uses the local **Callisto cub** icon.

The five primary uniques are mutually exclusive within each kill, but the **Callisto cub** pet is rolled separately and may appear alongside a unique. Primary rates (Callisto / Artio) are **Claws of Callisto: 1/196 / 1/618; dragon 2h sword: 1/256 / 1/358; dragon pickaxe: 1/256 / 1/358; Voidwaker hilt: 1/360 / 1/912; tyrannical ring: 1/512 / 1/716**. The cub rates are **1/1,500 / 1/2,800**. A solo Callisto kill uses the **126-ticket** ordinary table; Artio uses **128 tickets**. An independent 1/3 supply-package roll selects one of six equally weighted options, and other independent tertiary rolls award looting bags, elite clues and long/curved bones. Big bones are guaranteed per kill.

The dry calculator asks for both boss KC values and how many of each shared rare reward were received. For each item it combines **Binomial(Callisto KC, Callisto rate) + Binomial(Artio KC, Artio rate)**, then reports expected drops and probabilities of fewer, exactly, and more than the input count. “Any rare reward” also includes the independent cub roll, correctly allowing up to two rare rewards per kill. “At least one” probabilities are calculated from the combined number of kills at their **different** drop rates.

This first version models **solo Callisto loot and full eligibility per kill**. Callisto group damage-contribution scaling, MvP effects, elite clue ownership, ring-of-wealth imbue, Combat Achievement boosts, and Slayer-task-specific keys/enchantments are not included. All icons are bundled as PNGs and the site does not require an external API.

Sources: [Callisto Wiki](https://oldschool.runescape.wiki/w/Callisto), [Artio Wiki](https://oldschool.runescape.wiki/w/Artio), [Callisto loot table](https://reldo.org/a/callisto/), [Artio loot table](https://reldo.org/a/artio/).
