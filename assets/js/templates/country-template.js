// Duplicated from shared.js (kept tiny/pure) so this template also works under Node for build_entities.js.
function animalUrl(a) {
  return `animal-${a.key}.html`;
}

function listOrPlaceholder(values, placeholder) {
  if (!values || values.length === 0) {
    return `<p>${placeholder}</p>`;
  }
  return `<ul>${values.map((v) => `<li>${v}</li>`).join("")}</ul>`;
}

function textOrPlaceholder(value, placeholder) {
  return `<p>${value || placeholder}</p>`;
}

function renderCountryBody(country, countryAnimals, motif) {
  if (!country) {
    return `<p class="empty-state">国のデータが見つかりませんでした。</p>`;
  }

  const notice = country.detailReady
    ? ""
    : `<div class="notice-banner">この国の詳細情報は準備中です。順次追加していきます。</div>`;

  const videoBlock = country.videoUrl
    ? `<p><a href="${country.videoUrl}" target="_blank" rel="noopener">関連動画を見る →</a></p>`
    : `<p>準備中です。</p>`;

  const motifLink = motif
    ? `<p><a href="flags.html#motif-${motif.key}">同じモチーフ「${motif.label}」の国を見る →</a></p>`
    : "";

  const animalsBlock =
    !countryAnimals || countryAnimals.length === 0
      ? `<p>準備中です。</p>`
      : `<ul>${countryAnimals
          .map((a) => {
            const badge = a.isNationalAnimalOf.includes(country.code) ? "(🏅国獣)" : "";
            return `<li><a href="${animalUrl(a)}">${a.name}</a>${badge}</li>`;
          })
          .join("")}</ul>`;

  return `
    <section class="country-hero">
      <img class="flag-big" src="assets/flags/${country.code}.svg" alt="${country.nameEn}の国旗" />
      <h1>${country.name}</h1>
      <div class="name-en">${country.nameEn} / ${country.continent || "大陸情報準備中"}</div>
      <div class="id-badge">No.${country.id}</div>
    </section>
    <a class="back-link" href="countries.html">← 一覧に戻る</a>
    ${notice}
    <div class="info-grid">
      <div class="info-card">
        <h3>📍 位置</h3>
        ${textOrPlaceholder(country.location, "準備中です。")}
      </div>
      <div class="info-card">
        <h3>🏙 首都</h3>
        ${textOrPlaceholder(country.capital, "準備中です。")}
      </div>
      <div class="info-card">
        <h3>👥 人口</h3>
        ${textOrPlaceholder(country.population, "準備中です。")}
      </div>
      <div class="info-card">
        <h3>${country.government === "君主制" ? "👑" : "🏛"} 政治体制</h3>
        ${textOrPlaceholder(country.government, "準備中です。")}
      </div>
      <div class="info-card">
        <h3>💰 通貨</h3>
        ${textOrPlaceholder(country.currency, "準備中です。")}
      </div>
      <div class="info-card">
        <h3>🏗 建国年</h3>
        ${textOrPlaceholder(country.founded, "準備中です。")}
      </div>
      <div class="info-card">
        <h3>📖 成り立ち</h3>
        ${textOrPlaceholder(country.formation, "準備中です。")}
      </div>
      ${
        country.government === "君主制"
          ? `<div class="info-card">
              <h3>👑 王の決め方</h3>
              ${textOrPlaceholder(country.succession, "準備中です。")}
            </div>`
          : ""
      }
      <div class="info-card">
        <h3>🗣 言語</h3>
        ${listOrPlaceholder(country.languages, "準備中です。")}
      </div>
      <div class="info-card">
        <h3>🎎 民族</h3>
        ${listOrPlaceholder(country.ethnicGroups, "準備中です。")}
      </div>
      <div class="info-card">
        <h3>🍜 有名な食べ物</h3>
        ${textOrPlaceholder(country.food, "準備中です。")}
      </div>
      <div class="info-card">
        <h3>🏔 自然・地形</h3>
        ${textOrPlaceholder(country.nature, "準備中です。")}
      </div>
      <div class="info-card">
        <h3>🦁 生息動物</h3>
        ${animalsBlock}
      </div>
      <div class="info-card">
        <h3>🏳 国旗の由来</h3>
        ${textOrPlaceholder(country.flagOrigin, "準備中です。")}
        ${motifLink}
      </div>
      <div class="info-card">
        <h3>💡 トリビア</h3>
        ${textOrPlaceholder(country.trivia, "準備中です。")}
      </div>
      <div class="info-card">
        <h3>📜 ことわざ・名言</h3>
        ${textOrPlaceholder(country.proverb, "準備中です。")}
      </div>
      <div class="info-card">
        <h3>🇯🇵 日本とのつながり</h3>
        ${textOrPlaceholder(country.japanConnection, "準備中です。")}
      </div>
      <div class="info-card">
        <h3>🗺 観光名所</h3>
        ${listOrPlaceholder(country.landmarks, "準備中です。")}
      </div>
      <div class="info-card">
        <h3>🎬 関連動画</h3>
        ${videoBlock}
      </div>
    </div>
  `;
}

if (typeof module !== "undefined") {
  module.exports = { renderCountryBody, listOrPlaceholder, textOrPlaceholder };
}
