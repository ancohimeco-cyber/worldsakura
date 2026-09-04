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
    <a class="country-card" href="peoples.html?key=${p.key}">
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

function fieldBlock(icon, label, value) {
  return `
    <div class="info-card">
      <h3>${icon} ${label}</h3>
      <p>${value || "準備中です。"}</p>
    </div>`;
}

function renderDetail(key) {
  const p = ALL_PEOPLES.find((x) => x.key === key);
  const root = document.getElementById("peoples-detail");
  const listSection = document.getElementById("peoples-list-section");
  if (listSection) listSection.hidden = true;
  if (!root) return;
  root.hidden = false;

  if (!p) {
    root.innerHTML = `<p class="empty-state">データが見つかりませんでした。</p><a class="back-link" href="peoples.html">← 一覧に戻る</a>`;
    return;
  }

  updatePageMeta(
    `${p.name} | 世界の図鑑`,
    (p.history || `${p.name}(${p.nameEn})の暮らし・言語・文化を紹介します。`).slice(0, 140),
    `peoples.html?key=${p.key}`
  );

  const countryCards = (p.countries || [])
    .map((code) => {
      const c = COUNTRY_MAP.get(code);
      if (!c) return "";
      return `
        <a class="country-card" href="country.html?id=${c.id}">
          <img class="flag" src="assets/flags/${c.code}.svg" alt="${c.nameEn}の国旗" loading="lazy" />
          <h3>${c.name}</h3>
          <p>${c.nameEn}</p>
        </a>`;
    })
    .join("");

  const sourcesHtml = (p.sources || [])
    .map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.url}</a>(${s.checked}時点)`)
    .join(" / ");

  root.innerHTML = `
    <section class="country-hero">
      ${peopleMedia(p, "animal-photo-big")}
      <h1>${p.name}</h1>
      <div class="name-en">${p.nameEn}${p.nameLocal ? " / " + p.nameLocal : ""}</div>
      <div class="id-badge">${(p.region || []).join("・")}</div>
    </section>
    <a class="back-link" href="peoples.html">← 一覧に戻る</a>
    <div class="info-grid">
      ${fieldBlock("🗣", "使用言語", (p.languages || []).join("、"))}
      ${fieldBlock("👥", "人口の目安", p.population)}
      ${fieldBlock("👘", "伝統衣装", p.clothing)}
      ${fieldBlock("🏠", "住居", p.housing)}
      ${fieldBlock("🍲", "食文化", p.food)}
      ${fieldBlock("🎵", "音楽・踊り", p.music)}
      ${fieldBlock("🎉", "行事・祭り", p.festivals)}
      ${fieldBlock("🙏", "信仰・価値観", p.beliefs)}
      ${fieldBlock("📜", "歴史", p.history)}
      ${fieldBlock("🏙 ", "現代の暮らし", p.modernLife)}
      ${fieldBlock("🇯🇵", "日本との関係", p.japanConnection)}
    </div>
    <section class="section">
      <h2>🌍 関連する国</h2>
      <div class="country-grid">${countryCards}</div>
    </section>
    <p class="source-note">出典: ${sourcesHtml}</p>
  `;
}

async function initPeoplesPage() {
  const [peoples, countries] = await Promise.all([fetchPeoples(), fetchCountries()]);
  ALL_PEOPLES = peoples;
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

document.addEventListener("DOMContentLoaded", initPeoplesPage);
