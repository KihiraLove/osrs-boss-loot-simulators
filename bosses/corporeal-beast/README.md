# Corporeal Beast

[Open the solo Corporeal Beast simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/corporeal-beast/) · [All simulators](../../README.md)

## Scope

This simulator and dry calculator count **solo kills only**. Each entered kill is a completed Corporeal Beast defeat credited entirely to one player, who receives all that kill's rolls. No damage contribution, team size, split loot, shared instance, or group distribution is modeled. This is a loot-only simulator: consumables and kill times are not subtracted.

## Drop mechanics

- **Sigils:** an independent 1/585 sigil-table roll per kill, awarding at most one: Elysian (1/4,095), Spectral (1/1,365), or Arcane (1/1,365). These are separate from the ordinary loot roll.
- **Main loot:** one 512-ticket weighted roll for every solo kill. Includes Spirit shield **8/512**, Holy elixir **3/512**, full runes/ammunition, resources, equipment, and other drops with their OSRS Wiki quantities (including noted stacks).
- **Gem table:** 12/512 main-table tickets lead to **10 independent gem rolls**, with the original 128-ticket subtables and mega-rare roll. A ring-of-wealth option removes the gem table's empty tickets. With Legends' Quest unchecked, mega-rare outcomes are replaced by a nature talisman.
- **Tertiaries:** independently roll Jar of spirits **1/1,000**, Pet dark core **1/5,000**, and elite clues **1/200** (or **1/190** after Elite Combat Achievements). Clue ownership and scroll-box conversion are not tracked.
- All inventory item sprites are stored locally under [assets/items](../assets/items/). Nothing is requested from the Wiki at runtime.

## Dry calculator

Enter solo kill count and numbers already received for each of the seven collection-log rewards. Each item reports expected quantity, chance of obtaining at least one, and probabilities of **fewer**, **exactly**, or **more** than your observed count.

The **Any rare reward** line uses the convolution of four independent per-kill groups: mutually exclusive sigils (**1/585** total), mutually exclusive spirit shield or holy elixir (**11/512** total), and independent jar (**1/1,000**) and pet (**1/5,000**) rolls. Different groups may occur together on one kill. It validates that no kill produces multiple sigils or both a shield and elixir. Individual item rates are unaffected by the gem-table and clue options.

**Source:** [OSRS Wiki – Corporeal Beast](https://oldschool.runescape.wiki/w/Corporeal_Beast). This is Old School RuneScape, not RuneScape 3.
