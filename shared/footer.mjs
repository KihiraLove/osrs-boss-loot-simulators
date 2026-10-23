const githubUrl = "https://github.com/KihiraLove/osrs-boss-loot-simulators";

export function renderFooter(footer, wikiLinks) {
  const meta = document.createElement("div");
  meta.className = "footer-meta";
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
  const privacy = document.createElement("p");
  privacy.textContent = "No data is stored, collected, or sold by this site.";
  meta.append(sources, privacy);
  const actions = document.createElement("div");
  actions.className = "footer-actions";
  const github = document.createElement("a");
  github.className = "text-button";
  github.href = githubUrl;
  github.target = "_blank";
  github.rel = "noopener noreferrer";
  github.textContent = "GitHub";
  actions.append(github);
  footer.replaceChildren(meta, actions);
}

if (typeof document !== "undefined") {
  for (const footer of document.querySelectorAll("footer[data-wiki-links]")) {
    renderFooter(footer, footer.dataset.wikiLinks.trim().split(/\s+/));
  }
}
