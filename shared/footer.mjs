import { mountToolkitFooter } from "../toolkit-common/toolkit.mjs";

const githubUrl = "https://github.com/KihiraLove/osrs-boss-loot-simulators";

export function renderFooter(footer, wikiLinks) {
  const meta = document.createElement("div");
  meta.className = "toolkit-footer-info";
  if (wikiLinks.length) {
    const sources = document.createElement("p");
    const title = document.createElement("strong");
    title.textContent = "Drop data: ";
    sources.append(title);
    wikiLinks.forEach((href, index) => {
      if (index) sources.append(" · ");
      const link = document.createElement("a");
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const article = decodeURIComponent(new URL(href).pathname.split("/w/")[1] ?? "").replaceAll("_", " ");
      link.textContent = wikiLinks.length === 1 ? "OSRS Wiki" : article;
      sources.append(link);
    });
    meta.append(sources);
  }
  const privacy = document.createElement("p");
  privacy.textContent = "No data is stored, collected, or sold by this site.";
  meta.append(privacy);
  footer.replaceChildren(meta);
  mountToolkitFooter(footer, { githubUrl });
}

if (typeof document !== "undefined") {
  for (const footer of document.querySelectorAll("footer[data-wiki-links]")) {
    renderFooter(footer, footer.dataset.wikiLinks.trim().split(/\s+/).filter(Boolean));
  }
}
