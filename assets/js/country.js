function listOrPlaceholder(values, placeholder) {
  if (!values || values.length === 0) {
    return `<p>${placeholder}</p>`;
  }
  return `<ul>${values.map((v) => `<li>${v}</li>`).join("")}</ul>`;
}

function textOrPlaceholder(value, placeholder) {
  return `<p>${value || placeholder}</p>`;
}

async function loadCountry() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  const res = await fetch("data/countries.json");
  const countries = await res.json();
  const country = countries.find((c) => c.id === id);

  const root = document.getElementById("country-root");
  if (!country) {
    root.innerHTML = `<p class="empty-state">国のデータが見つかりませんでした。</p>`;
    return;
  }

  document.title = `${country.name}(${country.nameEn}) | 世界の図鑑`;

  const notice = country.detailReady
    ? ""
    : `<div class="notice-banner">この国の詳細情報は準備中です。順次追加していきます。</div>`;

  const videoBlock = country.videoUrl
    ? `<p><a href="${country.videoUrl}" target="_blank" rel="noopener">関連動画を見る →</a></p>`
    : `<p>準備中です。</p>`;

  root.innerHTML = `
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
        <h3>💰 通貨</h3>
        ${textOrPlaceholder(country.currency, "準備中です。")}
      </div>
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
        ${listOrPlaceholder(country.animals, "準備中です。")}
      </div>
      <div class="info-card">
        <h3>🏳 国旗の由来</h3>
        ${textOrPlaceholder(country.flagOrigin, "準備中です。")}
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

document.addEventListener("DOMContentLoaded", loadCountry);
