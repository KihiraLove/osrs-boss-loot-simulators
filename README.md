# OSRS Boss Loot Simulators

[![Deploy GitHub Pages](https://github.com/KihiraLove/osrs-boss-loot-simulators/actions/workflows/pages.yml/badge.svg)](https://github.com/KihiraLove/osrs-boss-loot-simulators/actions/workflows/pages.yml)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20me-29ABE0?logo=ko-fi&logoColor=white)](https://ko-fi.com/KihiraLove)

[Open all simulators](https://kihiralove.github.io/osrs-boss-loot-simulators/) to simulate OSRS loot or compare received drops with their expected odds. Calculations run in your browser; there is no backend or saved account data.

## Guides

- **Godwars:** [General Graardor](bosses/general-graardor/README.md), [Commander Zilyana](bosses/commander-zilyana/README.md), [Kree'arra](bosses/kree-arra/README.md), [K'ril Tsutsaroth](bosses/kril-tsutsaroth/README.md), [Nex](bosses/nex/README.md).
- **Desert Treasure 2:** [Vardorvis](bosses/vardorvis/README.md), [Duke Sucellus](bosses/duke-sucellus/README.md), [The Leviathan](bosses/leviathan/README.md), [The Whisperer](bosses/whisperer/README.md).
- **Wilderness:** [Crazy Archaeologist](bosses/crazy-archaeologist/README.md), [Chaos Fanatic](bosses/chaos-fanatic/README.md), [Scorpia](bosses/scorpia/README.md), [Chaos Elemental](bosses/chaos-elemental/README.md), [Callisto &amp; Artio](bosses/callisto-artio/README.md), [Venenatis &amp; Spindel](bosses/venenatis-spindel/README.md), [Vet'ion &amp; Calvar'ion](bosses/vetion-calvarion/README.md).
- **Slayer:** [Shellbane Gryphon](bosses/shellbane-gryphon/README.md), [Grotesque Guardians](bosses/grotesque-guardians/README.md), [Abyssal Sire](bosses/sire/README.md), [Kraken](bosses/kraken/README.md), [Cerberus](bosses/cerberus/README.md), [Araxxor](bosses/araxxor/README.md), [Thermonuclear Smoke Devil](bosses/thermonuclear-smoke-devil/README.md), [Alchemical Hydra](bosses/hydra/README.md).
- **Semi-slayer:** [Kalphite Queen](bosses/kalphite-queen/README.md), [Dagannoth Kings](bosses/dagannoth-kings/README.md), [King Black Dragon](bosses/king-black-dragon/README.md), [Sarachnis](bosses/sarachnis/README.md), [Skotizo](bosses/skotizo/README.md), [Vorkath](bosses/vorkath/README.md).
- **Skilling:** [Wintertodt](bosses/wintertodt/README.md), [Tempoross](bosses/tempoross/README.md), [Zalcano](bosses/zalcano/README.md).
- **Other bosses:** [Brutus](bosses/brutus/README.md), [Scurrius](bosses/scurrius/README.md), [Obor](bosses/obor/README.md), [Bryophyta](bosses/bryophyta/README.md), [Deranged Archaeologist](bosses/deranged-archaeologist/README.md), [Barrows](bosses/barrows/README.md), [Moons of Peril](bosses/moons-of-peril/README.md), [Giant Mole](bosses/giant-mole/README.md), [Amoxliatl](bosses/amoxliatl/README.md), [The Hueycoatl](bosses/hueycoatl/README.md), [Hespori](bosses/hespori/README.md), [Mad Angel](bosses/mad-angel/README.md), [Royal Titans](bosses/royal-titans/README.md), [Zulrah](bosses/zulrah/README.md), [Phantom Muspah](bosses/phantom-muspah/README.md), [The Gauntlet](bosses/gauntlet/README.md), [Corporeal Beast](bosses/corporeal-beast/README.md), [Doom of Mokhaiotl](bosses/doom/README.md), [Phosani's Nightmare](bosses/phosani/README.md), [Yama](bosses/yama/README.md), [Maggot King](bosses/maggot-king/README.md), [Fortis Colosseum](bosses/fortis-colosseum/README.md).
- **Chests:** [Eight chest calculators and shared reward notes](chests/README.md).

Each guide explains its inputs, important mechanics and modeling assumptions. Dry results are per-item probabilities, not the joint chance of receiving every entered reward. Starting ownership or progress is modeled only where the page provides an input.

## Run and test

Serve the repository root with a static server:

```sh
python -m http.server 8000
```

Validate all modules and run the tests with Node.js 20 or newer:

```sh
node scripts/validate.mjs
```

No build or package installation is required. GitHub Actions validates and publishes pushes to `main` through [GitHub Pages](.github/workflows/pages.yml).

## Shared code

- `styles.css`: all calculator and main-page styles.
- `shared/ui.mjs`, `shared/header.mjs`, `shared/footer.mjs`: fields, cards, navigation, Ko-fi and source links.
- `shared/distributions.mjs`: stable binomial probabilities, convolution, count validation and dry-result statistics.
- `shared/rare-tables.mjs`: rare/gem tables and Ring of wealth effects.
- `shared/chest-*.mjs`: chest reward tables, calculations and UI.

Boss and chest folders contain their own tables or configuration and page setup. Navigation and asset paths work under a renamed hosting directory.

## Sources

Each calculator links its OSRS Wiki sources. Most local sprites come from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db); [chest image sources](assets/chest-sources.json) list the Wiki downloads. Game artwork belongs to Jagex. The project license covers its own code, not game assets.
