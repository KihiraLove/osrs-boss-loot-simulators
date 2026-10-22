# OSRS Boss Loot Simulators

[![Deploy GitHub Pages](https://github.com/KihiraLove/osrs-boss-loot-simulators/actions/workflows/pages.yml/badge.svg)](https://github.com/KihiraLove/osrs-boss-loot-simulators/actions/workflows/pages.yml)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20me-29ABE0?logo=ko-fi&logoColor=white)](https://ko-fi.com/KihiraLove)

An unofficial, **frontend-only** collection of Old School RuneScape boss loot simulators and dry calculators, hosted on GitHub Pages. All calculations run locally in the browser. There is no backend, build system, or runtime OSRS Wiki API dependency.
## Boss simulators

Choose a boss from the [simulator home page](https://kihiralove.github.io/osrs-boss-loot-simulators/), or use the documentation and direct links below. Drop rates, boss-specific options, dry calculator mathematics, and modeling assumptions are documented in each boss's own README.

| Boss documentation | Live simulator |
| --- | --- |
| [Doom of Mokhaiotl](./doom/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/doom/) |
| [Phosani's Nightmare](./phosani/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/phosani/) |
| [Yama](./yama/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/yama/) |
| [Alchemical Hydra](./hydra/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/hydra/) |
| [Cerberus](./cerberus/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/cerberus/) |
| [Mad Angel](./mad-angel/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/mad-angel/) |
| [Abyssal Sire](./sire/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/sire/) |
| [Amoxliatl](./amoxliatl/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/amoxliatl/) |
| [Araxxor](./araxxor/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/araxxor/) |
| [Barrows](./barrows/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/barrows/) |
| [Brutus](./brutus/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/brutus/) |
| [Bryophyta](./bryophyta/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/bryophyta/) |
| [Obor](./obor/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/obor/) |
| [Callisto and Artio](./callisto-artio/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/callisto-artio/) |
| [Venenatis and Spindel](./venenatis-spindel/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/venenatis-spindel/) |
| [Vet'ion and Calvar'ion](./vetion-calvarion/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/vetion-calvarion/) |
| [Kalphite Queen](./kalphite-queen/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/kalphite-queen/) |
| [Scurrius](./scurrius/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/scurrius/) |
| [Chaos Elemental](./chaos-elemental/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/chaos-elemental/) |
| [Corporeal Beast](./corporeal-beast/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/corporeal-beast/) |
| [Chaos Fanatic](./chaos-fanatic/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/chaos-fanatic/) |
| [Crazy Archaeologist](./crazy-archaeologist/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/crazy-archaeologist/) |
| [Dagannoth Kings](./dagannoth-kings/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/dagannoth-kings/) |
| [Deranged Archaeologist](./deranged-archaeologist/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/deranged-archaeologist/) |
| [Duke Sucellus](./duke-sucellus/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/duke-sucellus/) |
| [Vardorvis](./vardorvis/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/vardorvis/) |
| [The Leviathan](./leviathan/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/leviathan/) |
| [The Whisperer](./whisperer/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/whisperer/) |
| [The Gauntlet](./gauntlet/README.md) | [Open simulator](https://kihiralove.github.io/osrs-boss-loot-simulators/gauntlet/) |

All navigation and asset URLs on the site are relative so the site also works under a renamed GitHub Pages project path. Renaming the repository changes its Pages URL; old URLs do not redirect automatically.

## Local development

Serve the repository root with any static HTTP server (no package installation or build required):

```sh
python3 -m http.server 8000
```

For Dagannoth Kings, run `node dagannoth-kings/sync-sprites.mjs` once before serving locally to download the extra OSRS item sprites. The Pages workflow also downloads these images automatically and attempts to commit them to the repository.

Visit http://localhost:8000/ to choose a boss, or http://localhost:8000/chaos-fanatic/ to open a simulator directly. Modules do not work reliably from a `file://` URL.

## Tests

Requires Node.js 20+ and no installation:

```sh
node --test tests/*.test.mjs
for module in *.mjs */*.mjs; do node --check "$module" || exit 1; done
```

GitHub Actions runs the test suite and validates the simulator modules before deployment.

## Deployment

GitHub Pages is deployed by [Deploy GitHub Pages](./.github/workflows/pages.yml).
The workflow validates the JavaScript and tests, then publishes the static site when
a commit is pushed to `main`. It also supports manual deployment from
**Actions → Deploy GitHub Pages → Run workflow → main**.

Some API-authenticated commits may not generate a workflow-triggering push event.
As a fallback, the workflow checks the current published revision every 15 minutes
and deploys if it differs from the latest `main` commit. GitHub may delay scheduled
workflow runs, so the fallback is not an immediate deployment guarantee.
Successful deployments publish `deployment-revision.txt` to let future scheduled
checks skip redundant deployments. Always confirm the deployed revision before
considering the site up to date.

## Sources and assets

Boss-specific mechanics are documented and linked to the [OSRS Wiki](https://oldschool.runescape.wiki/) from the relevant [boss README](#boss-simulators). Local item PNG sprites come from [osrsreboxed-db](https://github.com/RSPSApp/osrsreboxed-db). Old School RuneScape and game artwork belong to Jagex; this project's MIT license applies to its own code, not the game assets.
