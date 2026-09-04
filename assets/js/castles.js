let ALL_CASTLES = [];
let COUNTRY_MAP = new Map();
let activeRegionFilter = "all";

async function fetchCastles() {
  const res = await fetch("data/castles.json");
  return res.json();
}

function castleMedia(c, cssClass) {
  const icon = "🏰";
  if (c.img) {
    return `<img class="${cssClass}" src="${c.img}" alt="${c.name}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'${cssClass}-fallback',textContent:'${icon}'}))" />`;
  }
  return `<div class="${cssClass}-fallback">${icon}</div>`;
}

function castleCountry(c) {
  return COUNTRY_MAP.get(c.country);
}

function castleContinent(c) {
  const country = castleCountry(c);
  return country && country.continent ? country.continent.split("(")[0] : "";
}

function castleCard(c) {
  const country = castleCountry(c);
  return `
    <a class="country-card" href="${castleUrl(c)}">
      ${castleMedia(c, "animal-photo")}
      <h3>${c.name}</h3>
      <p>${country ? country.name : ""} ・ ${c.era || ""}</p>
    </a>`;
}

function renderList() {
  const container = document.getElementById("castles-list");
  if (!container) return;
  const filtered =
    activeRegionFilter === "all"
      ? ALL_CASTLES
      : ALL_CASTLES.filter((c) => castleContinent(c) === activeRegionFilter);

  container.innerHTML = `<div class="country-grid">${filtered.map(castleCard).join("")}</div>`;
  const countEl = document.getElementById("castles-count");
  if (countEl) countEl.textContent = `${filtered.length}件を表示中(全${ALL_CASTLES.length}件)`;
}

function setupRegionTabs() {
  const tabs = document.getElementById("region-tabs");
  if (!tabs) return;
  const regions = Array.from(new Set(ALL_CASTLES.map(castleContinent))).filter(Boolean);
  tabs.innerHTML =
    `<button class="active" data-region="all">すべて</button>` +
    regions.map((r) => `<button data-region="${r}">${r}</button>`).join("");
  tabs.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeRegionFilter = btn.dataset.region;
      renderList();
    });
  });
}

function renderDetail(key) {
  const c = ALL_CASTLES.find((x) => x.key === key);
  const root = document.getElementById("castles-detail");
  const listSection = document.getElementById("castles-list-section");
  if (listSection) listSection.hidden = true;
  if (!root) return;
  root.hidden = false;

  if (c) {
    updatePageMeta(
      `${c.name} | 世界の図鑑`,
      (c.history || `${c.name}(${c.nameEn})の歴史・様式・見どころを紹介します。`).slice(0, 140),
      castleUrl(c)
    );
  }

  root.innerHTML = renderCastleBody(c, COUNTRY_MAP);
}

async function initCastlesPage() {
  const [castles, countries] = await Promise.all([fetchCastles(), fetchCountries()]);
  ALL_CASTLES = castles;
  COUNTRY_MAP = new Map(countries.map((c) => [c.code, c]));

  const key = resolveKeyFromPath("castle");

  if (key) {
    renderDetail(key);
  } else {
    setupRegionTabs();
    renderList();
  }
}

document.addEventListener("DOMContentLoaded", initCastlesPage);
