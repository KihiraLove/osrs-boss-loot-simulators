import { mountToolkitHeader } from "../toolkit-common/toolkit.mjs";

export function renderHeader(header, { title, icon, subtitle = "Loot Simulator" }) {
  const document = header.ownerDocument;
  const branding = document.createElement("div");
  branding.className = "site-header toolkit-container";
  if (icon) {
    const mark = document.createElement("div");
    mark.className = "brand-mark";
    const bossImage = document.createElement("img");
    bossImage.src = new URL("../assets/items/" + icon + ".png", import.meta.url).href;
    bossImage.alt = "";
    bossImage.width = 42;
    bossImage.height = 42;
    mark.append(bossImage);
    branding.append(mark);
  }
  const heading = document.createElement("h1");
  heading.textContent = title;
  if (subtitle) {
    const description = document.createElement("span");
    description.textContent = subtitle;
    heading.append(" ", description);
  }
  branding.append(heading);
  header.replaceChildren(branding);

  if (!header.hasAttribute("data-simulator-home")) {
    const navigation = document.createElement("nav");
    navigation.className = "simulator-navigation";
    navigation.setAttribute("aria-label", "Simulator navigation");
    const back = document.createElement("a");
    back.className = "back-link";
    back.href = new URL("../", import.meta.url).href;
    back.textContent = "← All simulators";
    navigation.append(back);
    header.append(navigation);
  }
  mountToolkitHeader(header);
}

if (typeof document !== "undefined") {
  for (const header of document.querySelectorAll("header[data-simulator-header]")) {
    renderHeader(header, header.dataset);
  }
}
