const ANIMAL_TYPE_ICONS = {
  "哺乳類": "🐾",
  "鳥類": "🐦",
  "爬虫類": "🦎",
  "両生類": "🐸",
  "魚類": "🐟",
  "甲殻類": "🦀",
  "軟体動物": "🐌",
};

const IUCN_LABELS = {
  "絶滅": "EX・絶滅",
  "野生絶滅": "EW・野生絶滅",
  "深刻な危機": "CR・深刻な危機",
  "危機": "EN・危機",
  "危急": "VU・危急",
  "準絶滅危惧": "NT・準絶滅危惧",
  "軽度懸念": "LC・軽度懸念",
  "データ不足": "DD・データ不足",
  "未評価": "NE・未評価",
};

function isoToFlagEmoji(iso2) {
  return iso2
    .toUpperCase()
    .replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));
}

async function fetchAnimals() {
  const res = await fetch("data/animals.json");
  return res.json();
}

let ALL_ANIMALS = [];
let COUNTRY_MAP = new Map();
let activeTypeFilter = "all";
let activeContinentFilter = "all";

function animalContinents(a) {
  const conts = new Set();
  a.countries.forEach((code) => {
    const c = COUNTRY_MAP.get(code);
    if (c && c.continent) conts.add(c.continent.split("(")[0]);
  });
  return Array.from(conts);
}

function animalMedia(a, cssClass) {
  const icon = ANIMAL_TYPE_ICONS[a.type] || "🐾";
  if (a.img) {
    return `<img class="${cssClass}" src="${a.img}" alt="${a.name}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'${cssClass}-fallback',textContent:'${icon}'}))" />`;
  }
  return `<div class="${cssClass}-fallback">${icon}</div>`;
}

function animalCard(a) {
  const shown = a.countries.slice(0, 6).map(isoToFlagEmoji).join(" ");
  const more = a.countries.length > 6 ? ` 他${a.countries.length - 6}` : "";
  return `
    <a class="country-card animal-card" href="animals.html?key=${a.key}">
      ${animalMedia(a, "animal-photo")}
      <h3>${a.name}</h3>
      <p>生息: ${shown}${more}</p>
      <span class="rarity-badge">${IUCN_LABELS[a.iucn] || a.iucn}</span>
    </a>`;
}

function renderList() {
  const container = document.getElementById("animal-list");
  if (!container) return;

  let filtered = ALL_ANIMALS;
  if (activeTypeFilter !== "all") {
    filtered = filtered.filter((a) => a.type === activeTypeFilter);
  }
  if (activeContinentFilter !== "all") {
    filtered = filtered.filter((a) => animalContinents(a).includes(activeContinentFilter));
  }

  container.innerHTML = `<div class="country-grid">${filtered.map(animalCard).join("")}</div>`;

  const countEl = document.getElementById("animal-count");
  if (countEl) {
    countEl.textContent = `${filtered.length}種を表示中(全${ALL_ANIMALS.length}種)`;
  }
}

function setupTabs() {
  const typeTabs = document.getElementById("type-tabs");
  const continentTabs = document.getElementById("continent-tabs");

  const types = Array.from(new Set(ALL_ANIMALS.map((a) => a.type))).filter(Boolean);
  if (typeTabs) {
    typeTabs.innerHTML =
      `<button class="active" data-type="all">すべて</button>` +
      types.map((t) => `<button data-type="${t}">${ANIMAL_TYPE_ICONS[t] || ""} ${t}</button>`).join("");
    typeTabs.querySelectorAll("button").forEach((btn, i) => {
      const type = i === 0 ? "all" : types[i - 1];
      btn.addEventListener("click", () => {
        typeTabs.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeTypeFilter = type;
        renderList();
      });
    });
  }

  const continents = Array.from(new Set(ALL_ANIMALS.flatMap((a) => animalContinents(a)))).filter(Boolean);
  if (continentTabs) {
    continentTabs.innerHTML =
      `<button class="active" data-continent="all">すべて</button>` +
      continents.map((c) => `<button data-continent="${c}">${c}</button>`).join("");
    continentTabs.querySelectorAll("button").forEach((btn, i) => {
      const cont = i === 0 ? "all" : continents[i - 1];
      btn.addEventListener("click", () => {
        continentTabs.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeContinentFilter = cont;
        renderList();
      });
    });
  }
}

function renderDetail(key) {
  const a = ALL_ANIMALS.find((x) => x.key === key);
  const root = document.getElementById("animal-detail");
  const listSection = document.getElementById("animal-list-section");
  if (listSection) listSection.hidden = true;
  if (!root) return;
  root.hidden = false;

  if (!a) {
    root.innerHTML = `<p class="empty-state">動物データが見つかりませんでした。</p><a class="back-link" href="animals.html">← 一覧に戻る</a>`;
    return;
  }

  updatePageMeta(
    `${a.name} | 世界の図鑑`,
    (a.blurb || `${a.name}(${a.nameEn})について紹介します。`).slice(0, 140),
    `animals.html?key=${a.key}`
  );

  const countryCards = a.countries
    .map((code) => {
      const c = COUNTRY_MAP.get(code);
      if (!c) return "";
      const badge = a.isNationalAnimalOf.includes(code) ? "🏅国獣" : c.nameEn;
      return `
        <a class="country-card" href="country.html?id=${c.id}">
          <img class="flag" src="assets/flags/${c.code}.svg" alt="${c.nameEn}の国旗" loading="lazy" />
          <h3>${c.name}</h3>
          <p>${badge}</p>
        </a>`;
    })
    .join("");

  const sourcesHtml = (a.sources || [])
    .map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.url}</a>(${s.checked}時点)`)
    .join(" / ");

  root.innerHTML = `
    <section class="country-hero">
      ${animalMedia(a, "animal-photo-big")}
      <h1>${a.name}</h1>
      <div class="name-en">${a.nameEn} / ${a.type}</div>
      <div class="id-badge">${IUCN_LABELS[a.iucn] || a.iucn}</div>
    </section>
    <a class="back-link" href="animals.html">← 一覧に戻る</a>
    <div class="info-grid">
      <div class="info-card">
        <h3>📖 説明</h3>
        <p>${a.blurb}</p>
      </div>
    </div>
    <section class="section">
      <h2>🌍 生息国(${a.countries.length}か国)</h2>
      <div class="country-grid">${countryCards}</div>
    </section>
    <p class="source-note">出典: ${sourcesHtml}</p>
  `;
}

async function initAnimalsPage() {
  const [animals, countries] = await Promise.all([fetchAnimals(), fetchCountries()]);
  ALL_ANIMALS = animals;
  COUNTRY_MAP = new Map(countries.map((c) => [c.code, c]));

  const params = new URLSearchParams(window.location.search);
  const key = params.get("key");

  if (key) {
    renderDetail(key);
  } else {
    setupTabs();
    renderList();
  }
}

document.addEventListener("DOMContentLoaded", initAnimalsPage);
