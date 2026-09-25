// Duplicated from shared.js (kept tiny/pure) so this template also works under Node for build_entities.js.
function animalUrl(a) {
  return `animal-${a.key}.html`;
}

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function countryUrl(c) {
  return `country-${c.id}-${slugify(c.nameEn)}.html`;
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

function renderCountryBody(country, countryAnimals, motif, neighborCountries, prevCountry, nextCountry) {
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

  const neighborsBlock =
    !neighborCountries || neighborCountries.length === 0
      ? `<p>海に囲まれている(または隣国データなし)ため、陸・海の隣接国は登録されていません。</p>`
      : `<ul>${neighborCountries.map((n) => `<li><a href="${countryUrl(n)}">${n.name}</a></li>`).join("")}</ul>`;

  const pagerRow =
    prevCountry && nextCountry
      ? `<div class="pager-row">
          <a class="back-link" href="${countryUrl(prevCountry)}">← ${prevCountry.name}</a>
          <a class="back-link" href="${countryUrl(nextCountry)}">${nextCountry.name} →</a>
        </div>`
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

  const japanBlock =
    country.code === "jp"
      ? `<h2 class="info-heading">日本をもっと楽しむ</h2>
    <div class="info-grid">
      ${[
        ["japan.html", "🗾 日本を旅する", "日本の特集ページの入口。"],
        ["foodjapan.html", "🍣 日本グルメ100", "寿司・ラーメンから郷土料理まで、日本の食べ物100。"],
        ["spotjapan.html", "🏯 日本の観光地100", "お城・神社・絶景など、日本の観光地100。"],
        ["matsurijapan.html", "🎆 日本の祭り100選", "全国の有名なお祭り100。"],
        ["souvenirs100.html", "🎁 お土産100選", "外国人が日本で買いたいお土産100。"],
        ["events.html", "📅 年中行事・今日は何の日", "日本の季節の行事と、366日の記念日。"],
      ]
        .map(([href, label, text]) => `<div class="info-card"><h3><a href="${href}">${label}</a></h3><p>${text}</p></div>`)
        .join("")}
    </div>`
      : "";

  return `
    <section class="country-hero">
      <img class="flag-big" src="assets/flags/${country.code}.svg" alt="${country.name}（${country.nameEn}）の国旗" />
      <h1>${country.name}</h1>
      <div class="name-en">${country.nameEn} / ${country.continent || "大陸情報準備中"}</div>
      <div class="id-badge">No.${country.id}</div>
    </section>
    <a class="back-link" href="countries.html">← 一覧に戻る</a>
    ${pagerRow}
    ${notice}
    <div class="country-sections">
    <h2 class="info-heading">${country.name}の基本データ</h2>
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
    </div>
    <h2 class="info-heading">${country.name}の歴史と成り立ち</h2>
    <div class="info-grid">
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
    </div>
    <h2 class="info-heading">${country.name}の言葉・人びと・食べ物</h2>
    <div class="info-grid">
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
    </div>
    <h2 class="info-heading">${country.name}の自然と生きもの</h2>
    <div class="info-grid">
      <div class="info-card">
        <h3>🏔 自然・地形</h3>
        ${textOrPlaceholder(country.nature, "準備中です。")}
      </div>
      <div class="info-card">
        <h3>🗺 隣接する国</h3>
        ${neighborsBlock}
      </div>
      <div class="info-card">
        <h3>🦁 生息動物</h3>
        ${animalsBlock}
      </div>
    </div>
    <h2 class="info-heading">${country.name}の国旗</h2>
    <div class="info-grid">
      <div class="info-card">
        <h3>🏳 国旗の由来</h3>
        ${textOrPlaceholder(country.flagOrigin, "準備中です。")}
        ${motifLink}
      </div>
    </div>
    <h2 class="info-heading">${country.name}をもっと知る</h2>
    <div class="info-grid">
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
    ${japanBlock}
    </div>
  `;
}

// タイトルと説明文（静的ページ生成と country.js の両方で使う。ずれないように1か所で決める）
function countryMeta(c) {
  const title = `${c.name}の国旗・首都・文化｜WORLD SAKURA 世界の図鑑`;
  const langs = (c.languages || []).slice(0, 2).join("・");
  const facts = [
    c.capital ? `首都は${c.capital}` : "",
    langs ? `言葉は${langs}` : "",
    c.food ? `有名な食べ物は${String(c.food).split(/[、,]/)[0].trim()}など` : "",
  ].filter(Boolean).join("、");
  const leadIn = facts ? `${c.name}(${c.nameEn})の${facts}。` : `${c.name}(${c.nameEn})の位置・首都・人口・文化を紹介。`;
  const description = `${leadIn}国旗の由来・動物・観光名所まで、子供にもわかりやすく紹介する世界の図鑑です。`;
  return { title, description };
}

if (typeof module !== "undefined") {
  module.exports = { renderCountryBody, listOrPlaceholder, textOrPlaceholder, countryUrl, countryMeta };
}
