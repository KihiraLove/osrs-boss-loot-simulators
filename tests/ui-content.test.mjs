import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { ITEMS, SPECIAL_ITEMS } from "../bosses/doom/simulator.mjs";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf-8");

test("requested presentation text is absent from both static and dynamic UI", () => {
  const visibleSources = read("bosses/doom/index.html") + "\n" + read("bosses/doom/app.mjs");
  const removedPhrases = [
    "Planned delves",
    "drop rolls",
    "Each count is one completed delve at that level.",
    "Quantities are combined across simulated delves.",
    "item types",
    "How many of each unique did you receive across these runs?",
    "Chance of at least one unique drop",
    "Compared against",
    "total drops entered across cloth, Eye, treads and Dom.",
    "Odds across the configured delves, including the total of all four unique rewards.",
    "Eligible drop rolls",
    "The “Any unique drop” result combines all four drop counts",
    "Images stored locally",
    "Unofficial fan project. Not affiliated with Jagex."
  ];
  for (const phrase of removedPhrases) {
    assert.ok(!visibleSources.toLowerCase().includes(phrase.toLowerCase()), "Still visible: " + phrase);
  }
  assert.doesNotMatch(visibleSources, /\bid=["']item-count["']/);
  assert.doesNotMatch(visibleSources, /\bid=["']planned-runs["']/);
  assert.ok(visibleSources.includes('caption.textContent = "At least one"'));
});

test("shortened item names still retain the correct IDs and drop rates", () => {
  assert.equal(SPECIAL_ITEMS.find(item => item.id === "eye-of-ayak").name, "Eye of ayak");
  assert.equal(ITEMS.find(item => item.id === "tooth-half-of-key").name, "Tooth half of key");
  assert.ok(!read("bosses/doom/simulator.mjs").includes("(uncharged)"));
  assert.ok(!read("bosses/doom/simulator.mjs").includes("(moon key)"));
});

test("Ko-fi uses the BingoPlayerStats blue pill banner and bounded cup icon", () => {
  const header = read("shared/header.mjs");
  const css = read("styles.css");
  assert.match(header, /className = "kofi-banner"/);
  assert.match(header, /https:\/\/ko-fi.com\/KihiraLove/);
  assert.match(header, /storage\.ko-fi\.com\/cdn\/cup-border\.png/);
  assert.match(header, /Support me on Ko-fi/);
  assert.match(css, /\.site-header \.kofi-banner\s*\{/);
  assert.match(css, /background:\s*#29abe0/i);
  assert.match(css, /border-radius:\s*999px/);
  assert.match(css, /\.site-header \.kofi-banner img/);
  assert.match(css, /max-width:\s*24px/);
  assert.match(css, /max-height:\s*24px/);
});

test("every calculator configures the shared header with a title and local icon", () => {
  assert.match(read("shared/ui.mjs"), /import "\.\/header\.mjs"/);
  for (const category of ["bosses", "chests", "treasure-trails"]) for (const boss of readdirSync(new URL(`../${category}/`, import.meta.url), { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name)) {
    const html = read(`${category}/${boss}/index.html`);
    assert.equal((html.match(/<header\b/g) ?? []).length, 1, boss);
    assert.match(html, /<header data-simulator-header data-title="[^"]+" data-icon="[a-z0-9-]+"/, boss);
    assert.doesNotMatch(html, /kofi-banner|ko-fi\.com|class="brand-mark"|<h1>|<nav\b/, boss);
    const icon = html.match(/data-icon="([^"]+)"/)[1];
    const png = readFileSync(new URL(`../assets/items/${icon}.png`, import.meta.url));
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], boss);
  }
  assert.match(read("bosses/wintertodt/index.html"), /data-subtitle="Reward Cart Simulator"/);
});

test("footer uses the BingoPlayerStats structure and privacy statement", () => {
  const html = read("bosses/doom/index.html");
  const footer = read("shared/footer.mjs");
  const css = read("styles.css");
  assert.match(html, /<footer data-wiki-links="https:\/\/oldschool\.runescape\.wiki\/w\/Doom_of_Mokhaiotl"><\/footer>/);
  assert.match(footer, /className = "footer-meta"/);
  assert.match(footer, /className = "footer-actions"/);
  assert.match(footer, /className = "text-button"/);
  assert.match(footer, /No data is stored, collected, or sold by this site\./);
  assert.match(css, /\.footer-meta\s*\{/);
  assert.match(css, /\.footer-actions\s*\{/);
  assert.match(css, /\.text-button\s*\{/);
  assert.match(footer, /https:\/\/github.com\/KihiraLove\/osrs-boss-loot-simulators/);
});

test("README uses matching GitHub Pages CI status and Ko-fi badges", () => {
  const markdown = read("README.md");
  assert.match(markdown, /KihiraLove\/osrs-boss-loot-simulators\/actions\/workflows\/pages\.yml\/badge\.svg/);
  assert.match(markdown, /img\.shields\.io\/badge\/Ko--fi-Support%20me-29ABE0\?logo=ko-fi&logoColor=white/);
  assert.match(markdown, /https:\/\/ko-fi\.com\/KihiraLove/);
});

test("home page includes a centered, accessible Doom boss tile", () => {
  const homepage = read("index.html");
  const css = read("styles.css");
  assert.match(homepage, /class="boss-selection-page"/);
  assert.match(homepage, /class="boss-picker"/);
  assert.match(homepage, /class="boss-tile" href="bosses\/doom\/"/);
  assert.match(homepage, /aria-label="Open Doom of Mokhaiotl loot simulator"/);
  assert.match(homepage, /src="\.\/assets\/items\/dom\.png"/);
  assert.doesNotMatch(homepage, /id="simulator-form"|id="mode-loot"|src="\.\/app\.mjs"/);
  assert.match(css, /body\.boss-selection-page\s*\{[^}]*place-items:\s*center/s);
});

test("Doom simulator is on a separate, repository-rename-safe path", () => {
  const html = read("bosses/doom/index.html");
  const app = read("bosses/doom/app.mjs");
  assert.match(html, /data-simulator-header data-title="Doom of Mokhaiotl" data-icon="dom"/);
  assert.match(html, /href="\.\.\/\.\.\/styles\.css"/);
  assert.match(html, /src="app\.mjs"/);
  assert.match(html, /id="simulator-form"/);
  assert.match(app, /createItemImage as makeSprite/);
});
