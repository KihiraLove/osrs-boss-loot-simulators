const supportUrl = "https://ko-fi.com/KihiraLove";
const supportIconUrl = "https://storage.ko-fi.com/cdn/cup-border.png";

export function renderHeader(header, { title, icon, subtitle = "Loot Simulator" }) {
  const document = header.ownerDocument;
  const navigation = document.createElement("nav");
  navigation.className = "simulator-navigation";
  navigation.setAttribute("aria-label", "Simulator navigation");
  const back = document.createElement("a");
  back.className = "back-link";
  back.href = new URL("../", import.meta.url).href;
  back.textContent = "← All simulators";
  navigation.append(back);

  const skip = document.createElement("a");
  skip.className = "skip-link";
  skip.href = "#main";
  skip.textContent = "Skip to simulator";

  const branding = document.createElement("div");
  branding.className = "site-header";
  const mark = document.createElement("div");
  mark.className = "brand-mark";
  const bossImage = document.createElement("img");
  bossImage.src = new URL("../assets/items/" + icon + ".png", import.meta.url).href;
  bossImage.alt = "";
  bossImage.width = 42;
  bossImage.height = 42;
  mark.append(bossImage);
  const heading = document.createElement("h1");
  const description = document.createElement("span");
  description.textContent = subtitle;
  heading.append(title + " ", description);

  const support = document.createElement("a");
  support.className = "kofi-banner";
  support.href = supportUrl;
  support.target = "_blank";
  support.rel = "noopener noreferrer";
  support.setAttribute("aria-label", "Support KihiraLove on Ko-fi");
  const cup = document.createElement("img");
  cup.src = supportIconUrl;
  cup.alt = "";
  cup.setAttribute("aria-hidden", "true");
  cup.width = 24;
  cup.height = 24;
  const label = document.createElement("span");
  label.className = "kofi-banner-label";
  label.textContent = "Support me on Ko-fi";
  support.append(cup, label);
  branding.append(mark, heading, support);
  header.replaceChildren(navigation, skip, branding);
}

if (typeof document !== "undefined") {
  for (const header of document.querySelectorAll("header[data-simulator-header]")) {
    renderHeader(header, header.dataset);
  }
}
