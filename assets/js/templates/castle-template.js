// Pure helpers duplicated from shared.js/castles.js (no DOM) so this also works under Node for build_entities.js.
function countryUrl(c) {
  return `country-${c.id}-${(c.nameEn || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}.html`;
}

function castleMediaStatic(c, cssClass) {
  const icon = "🏰";
  if (c.img) {
    return `<img class="${cssClass}" src="${c.img}" alt="${c.name}" loading="lazy" />`;
  }
  return `<div class="${cssClass}-fallback">${icon}</div>`;
}

function fieldBlockStaticCastle(icon, label, value) {
  return `
    <div class="info-card">
      <h3>${icon} ${label}</h3>
      <p>${value || "準備中です。"}</p>
    </div>`;
}

function renderCastleBody(c, countryMap) {
  if (!c) {
    return `<p class="empty-state">データが見つかりませんでした。</p><a class="back-link" href="castles.html">← 一覧に戻る</a>`;
  }

  const country = countryMap.get(c.country);
  const sourcesHtml = (c.sources || [])
    .map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.url}</a>(${s.checked}時点)`)
    .join(" / ");

  return `
    <section class="country-hero">
      ${castleMediaStatic(c, "animal-photo-big")}
      ${c.imageCredit ? `<p class="photo-credit">${c.imageCredit}</p>` : ""}
      <h1>${c.name}</h1>
      <div class="name-en">${c.nameEn}${c.nameLocal ? " / " + c.nameLocal : ""}</div>
      <div class="id-badge">${country ? country.name : ""}${c.city ? " ・ " + c.city : ""}</div>
    </section>
    <a class="back-link" href="castles.html">← 一覧に戻る</a>
    <div class="info-grid">
      ${fieldBlockStaticCastle("📅", "建設時期", c.era)}
      ${fieldBlockStaticCastle("🏯", "様式", c.style)}
      ${fieldBlockStaticCastle("🏆", "世界遺産など", c.unesco)}
      ${fieldBlockStaticCastle("📜", "歴史", c.history)}
      ${fieldBlockStaticCastle("✨", "見どころ", c.highlights)}
      ${fieldBlockStaticCastle("🎫", "現在の姿", c.currentUse)}
    </div>
    ${
      country
        ? `<section class="section">
            <h2>🌍 この国について</h2>
            <div class="country-grid">
              <a class="country-card" href="${countryUrl(country)}">
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

if (typeof module !== "undefined") {
  module.exports = { renderCastleBody };
}
