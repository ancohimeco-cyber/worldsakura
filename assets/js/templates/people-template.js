// Pure helpers duplicated from shared.js/peoples.js (no DOM) so this also works under Node for build_entities.js.
function countryUrl(c) {
  return `country-${c.id}-${(c.nameEn || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}.html`;
}

function peopleMediaStatic(p, cssClass) {
  const icon = "🧑‍🤝‍🧑";
  if (p.img) {
    return `<img class="${cssClass}" src="${p.img}" alt="${p.name}" loading="lazy" />`;
  }
  return `<div class="${cssClass}-fallback">${icon}</div>`;
}

function fieldBlockStatic(icon, label, value) {
  return `
    <div class="info-card">
      <h3>${icon} ${label}</h3>
      <p>${value || "準備中です。"}</p>
    </div>`;
}

function renderPeopleBody(p, countryMap) {
  if (!p) {
    return `<p class="empty-state">データが見つかりませんでした。</p><a class="back-link" href="peoples.html">← 一覧に戻る</a>`;
  }

  const countryCards = (p.countries || [])
    .map((code) => {
      const c = countryMap.get(code);
      if (!c) return "";
      return `
        <a class="country-card" href="${countryUrl(c)}">
          <img class="flag" src="assets/flags/${c.code}.svg" alt="${c.nameEn}の国旗" loading="lazy" />
          <h3>${c.name}</h3>
          <p>${c.nameEn}</p>
        </a>`;
    })
    .join("");

  const sourcesHtml = (p.sources || [])
    .map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.url}</a>(${s.checked}時点)`)
    .join(" / ");

  return `
    <section class="country-hero">
      ${peopleMediaStatic(p, "animal-photo-big")}
      <h1>${p.name}</h1>
      <div class="name-en">${p.nameEn}${p.nameLocal ? " / " + p.nameLocal : ""}</div>
      <div class="id-badge">${(p.region || []).join("・")}</div>
    </section>
    <a class="back-link" href="peoples.html">← 一覧に戻る</a>
    <div class="info-grid">
      ${fieldBlockStatic("🗣", "使用言語", (p.languages || []).join("、"))}
      ${fieldBlockStatic("👥", "人口の目安", p.population)}
      ${fieldBlockStatic("👘", "伝統衣装", p.clothing)}
      ${fieldBlockStatic("🏠", "住居", p.housing)}
      ${fieldBlockStatic("🍲", "食文化", p.food)}
      ${fieldBlockStatic("🎵", "音楽・踊り", p.music)}
      ${fieldBlockStatic("🎉", "行事・祭り", p.festivals)}
      ${fieldBlockStatic("🙏", "信仰・価値観", p.beliefs)}
      ${fieldBlockStatic("📜", "歴史", p.history)}
      ${fieldBlockStatic("🏙 ", "現代の暮らし", p.modernLife)}
      ${fieldBlockStatic("🇯🇵", "日本との関係", p.japanConnection)}
    </div>
    <section class="section">
      <h2>🌍 関連する国</h2>
      <div class="country-grid">${countryCards}</div>
    </section>
    <p class="source-note">出典: ${sourcesHtml}</p>
  `;
}

if (typeof module !== "undefined") {
  module.exports = { renderPeopleBody };
}
