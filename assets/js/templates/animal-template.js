// Pure helpers duplicated from shared.js/animals.js (no DOM) so this also works under Node for build_entities.js.
function countryUrl(c) {
  return `country-${c.id}-${(c.nameEn || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}.html`;
}

const IUCN_LABELS_T = {
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

const ANIMAL_TYPE_ICONS_T = {
  "哺乳類": "🐾",
  "鳥類": "🐦",
  "爬虫類": "🦎",
  "両生類": "🐸",
  "魚類": "🐟",
  "甲殻類": "🦀",
  "軟体動物": "🐌",
};

function animalMediaStatic(a, cssClass) {
  const icon = ANIMAL_TYPE_ICONS_T[a.type] || "🐾";
  if (a.img) {
    return `<img class="${cssClass}" src="${a.img}" alt="${a.name}" loading="lazy" />`;
  }
  return `<div class="${cssClass}-fallback">${icon}</div>`;
}

function renderAnimalBody(a, countryMap) {
  if (!a) {
    return `<p class="empty-state">動物データが見つかりませんでした。</p><a class="back-link" href="animals.html">← 一覧に戻る</a>`;
  }

  const countryCards = a.countries
    .map((code) => {
      const c = countryMap.get(code);
      if (!c) return "";
      const badge = a.isNationalAnimalOf.includes(code) ? "🏅国獣" : c.nameEn;
      return `
        <a class="country-card" href="${countryUrl(c)}">
          <img class="flag" src="assets/flags/${c.code}.svg" alt="${c.nameEn}の国旗" loading="lazy" />
          <h3>${c.name}</h3>
          <p>${badge}</p>
        </a>`;
    })
    .join("");

  const sourcesHtml = (a.sources || [])
    .map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.url}</a>(${s.checked}時点)`)
    .join(" / ");

  return `
    <section class="country-hero">
      ${animalMediaStatic(a, "animal-photo-big")}
      <h1>${a.name}</h1>
      <div class="name-en">${a.nameEn} / ${a.type}</div>
      <div class="id-badge">${IUCN_LABELS_T[a.iucn] || a.iucn}</div>
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

if (typeof module !== "undefined") {
  module.exports = { renderAnimalBody };
}
