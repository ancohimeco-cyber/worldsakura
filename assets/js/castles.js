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
    <a class="country-card" href="castles.html?key=${c.key}">
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

function fieldBlock(icon, label, value) {
  return `
    <div class="info-card">
      <h3>${icon} ${label}</h3>
      <p>${value || "準備中です。"}</p>
    </div>`;
}

function renderDetail(key) {
  const c = ALL_CASTLES.find((x) => x.key === key);
  const root = document.getElementById("castles-detail");
  const listSection = document.getElementById("castles-list-section");
  if (listSection) listSection.hidden = true;
  if (!root) return;
  root.hidden = false;

  if (!c) {
    root.innerHTML = `<p class="empty-state">データが見つかりませんでした。</p><a class="back-link" href="castles.html">← 一覧に戻る</a>`;
    return;
  }

  document.title = `${c.name} | 世界の図鑑`;
  const country = castleCountry(c);

  const sourcesHtml = (c.sources || [])
    .map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.url}</a>(${s.checked}時点)`)
    .join(" / ");

  root.innerHTML = `
    <section class="country-hero">
      ${castleMedia(c, "animal-photo-big")}
      ${c.imageCredit ? `<p class="photo-credit">${c.imageCredit}</p>` : ""}
      <h1>${c.name}</h1>
      <div class="name-en">${c.nameEn}${c.nameLocal ? " / " + c.nameLocal : ""}</div>
      <div class="id-badge">${country ? country.name : ""}${c.city ? " ・ " + c.city : ""}</div>
    </section>
    <a class="back-link" href="castles.html">← 一覧に戻る</a>
    <div class="info-grid">
      ${fieldBlock("📅", "建設時期", c.era)}
      ${fieldBlock("🏯", "様式", c.style)}
      ${fieldBlock("🏆", "世界遺産など", c.unesco)}
      ${fieldBlock("📜", "歴史", c.history)}
      ${fieldBlock("✨", "見どころ", c.highlights)}
      ${fieldBlock("🎫", "現在の姿", c.currentUse)}
    </div>
    ${
      country
        ? `<section class="section">
            <h2>🌍 この国について</h2>
            <div class="country-grid">
              <a class="country-card" href="country.html?id=${country.id}">
                <img class="flag" src="assets/flags/${country.code}.svg" alt="${country.nameEn}の国旗" loading="lazy" />
                <h3>${country.name}</h3>
                <p>${country.nameEn}</p>
              </a>
            </div>
          </section>`
        : ""
    }
    <p class="source-note">出典: ${sourcesHtml}</p>
  `;
}

async function initCastlesPage() {
  const [castles, countries] = await Promise.all([fetchCastles(), fetchCountries()]);
  ALL_CASTLES = castles;
  COUNTRY_MAP = new Map(countries.map((c) => [c.code, c]));

  const params = new URLSearchParams(window.location.search);
  const key = params.get("key");

  if (key) {
    renderDetail(key);
  } else {
    setupRegionTabs();
    renderList();
  }
}

document.addEventListener("DOMContentLoaded", initCastlesPage);
