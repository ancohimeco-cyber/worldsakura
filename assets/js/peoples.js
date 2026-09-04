let ALL_PEOPLES = [];
let COUNTRY_MAP = new Map();
let activeRegionFilter = "all";

function isoToFlagEmoji(iso2) {
  return iso2
    .toUpperCase()
    .replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));
}

async function fetchPeoples() {
  const res = await fetch("data/peoples.json");
  return res.json();
}

function peopleMedia(p, cssClass) {
  const icon = "🧑‍🤝‍🧑";
  if (p.img) {
    return `<img class="${cssClass}" src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'${cssClass}-fallback',textContent:'${icon}'}))" />`;
  }
  return `<div class="${cssClass}-fallback">${icon}</div>`;
}

function peopleCard(p) {
  const flags = (p.countries || []).slice(0, 6).map(isoToFlagEmoji).join(" ");
  return `
    <a class="country-card" href="${peopleUrl(p)}">
      ${peopleMedia(p, "animal-photo")}
      <h3>${p.name}</h3>
      <p>${(p.region || []).join("・")} ・ ${flags}</p>
    </a>`;
}

function renderList() {
  const container = document.getElementById("peoples-list");
  if (!container) return;
  const filtered =
    activeRegionFilter === "all"
      ? ALL_PEOPLES
      : ALL_PEOPLES.filter((p) => (p.region || []).includes(activeRegionFilter));

  container.innerHTML = `<div class="country-grid">${filtered.map(peopleCard).join("")}</div>`;
  const countEl = document.getElementById("peoples-count");
  if (countEl) countEl.textContent = `${filtered.length}件を表示中(全${ALL_PEOPLES.length}件)`;
}

function setupRegionTabs() {
  const tabs = document.getElementById("region-tabs");
  if (!tabs) return;
  const regions = Array.from(new Set(ALL_PEOPLES.flatMap((p) => p.region || []))).filter(Boolean);
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
  const p = ALL_PEOPLES.find((x) => x.key === key);
  const root = document.getElementById("peoples-detail");
  const listSection = document.getElementById("peoples-list-section");
  if (listSection) listSection.hidden = true;
  if (!root) return;
  root.hidden = false;

  if (p) {
    updatePageMeta(
      `${p.name} | 世界の図鑑`,
      (p.history || `${p.name}(${p.nameEn})の暮らし・言語・文化を紹介します。`).slice(0, 140),
      peopleUrl(p)
    );
  }

  root.innerHTML = renderPeopleBody(p, COUNTRY_MAP);
}

async function initPeoplesPage() {
  const [peoples, countries] = await Promise.all([fetchPeoples(), fetchCountries()]);
  ALL_PEOPLES = peoples;
  COUNTRY_MAP = new Map(countries.map((c) => [c.code, c]));

  const key = resolveKeyFromPath("people");

  if (key) {
    renderDetail(key);
  } else {
    setupRegionTabs();
    renderList();
  }
}

document.addEventListener("DOMContentLoaded", initPeoplesPage);
