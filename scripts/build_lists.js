// Prerenders the default (no-JS) view of each list/category page's link grid into static HTML,
// so search engines and non-JS crawlers can discover and follow links to every entity page.
// The client-side JS still re-renders identically on load (progressive enhancement, no visual seam).
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const countries = require(path.join(root, "data/countries.json"));
const animals = require(path.join(root, "data/animals.json"));
const peoples = require(path.join(root, "data/peoples.json"));
const castles = require(path.join(root, "data/castles.json"));
const motifs = require(path.join(root, "data/flag_motifs.json"));

function slugify(text) {
  return (text || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function countryUrl(c) {
  return `country-${c.id}-${slugify(c.nameEn)}.html`;
}
function animalUrl(a) {
  return `animal-${a.key}.html`;
}
function peopleUrl(p) {
  return `people-${p.key}.html`;
}
function castleUrl(c) {
  return `castle-${c.key}.html`;
}

// Finds <div id="ID" ...> ... its matching </div> ... (correctly handling nested <div>s
// from a previous build) and replaces the whole span with a freshly rebuilt container.
// Regex alone can't do this reliably once the container holds nested divs, so we
// locate the opening tag, then walk forward counting div depth to find the true close.
function replaceContainer(html, id, innerHtml) {
  const openTagRe = new RegExp(`<div id="${id}"[^>]*>`);
  const openMatch = openTagRe.exec(html);
  if (!openMatch) throw new Error(`container #${id} not found`);

  const openTag = openMatch[0];
  const contentStart = openMatch.index + openTag.length;

  let depth = 1;
  let i = contentStart;
  const tagRe = /<div\b[^>]*>|<\/div>/g;
  tagRe.lastIndex = contentStart;
  let m;
  while ((m = tagRe.exec(html))) {
    if (m[0] === "</div>") {
      depth--;
      if (depth === 0) {
        i = m.index;
        break;
      }
    } else {
      depth++;
    }
  }
  if (depth !== 0) throw new Error(`unbalanced <div> while locating #${id}'s closing tag`);

  return html.slice(0, contentStart) + innerHtml + html.slice(i);
}

let filesWritten = 0;
function write(fileName, html) {
  fs.writeFileSync(path.join(root, fileName), html);
  filesWritten++;
}

// ---- countries.html: letter-grouped, plain country card ----
{
  const countryCard = (c) => `
    <a class="country-card" href="${countryUrl(c)}">
      <img class="flag" src="assets/flags/${c.code}.svg" alt="${c.nameEn}の国旗" loading="lazy" />
      <h3>${c.name}</h3>
      <p>${c.nameEn} ・ ${c.capital || "詳細準備中"}</p>
    </a>`;

  const sorted = [...countries].sort((a, b) => a.id - b.id);
  const groups = {};
  sorted.forEach((c) => {
    const letter = c.nameEn[0].toUpperCase();
    (groups[letter] = groups[letter] || []).push(c);
  });
  const inner = Object.keys(groups)
    .sort()
    .map(
      (letter) => `
        <div id="letter-${letter}">
          <div class="letter-group-title">${letter}</div>
          <div class="country-grid">${groups[letter].map(countryCard).join("")}</div>
        </div>`
    )
    .join("");

  let html = fs.readFileSync(path.join(root, "countries.html"), "utf8");
  html = replaceContainer(html, "country-list", inner);
  write("countries.html", html);
}

// ---- capitals.html: sorted by capital name (ja) ----
{
  const capitalCard = (c) => `
    <a class="country-card" href="${countryUrl(c)}">
      <img class="flag" src="assets/flags/${c.code}.svg" alt="${c.nameEn}の国旗" loading="lazy" />
      <h3>${c.capital}</h3>
      <p>${c.name}(${c.nameEn})</p>
    </a>`;
  const sorted = [...countries].sort((a, b) => a.capital.localeCompare(b.capital, "ja"));
  const inner = `<div class="country-grid">${sorted.map(capitalCard).join("")}</div>`;

  let html = fs.readFileSync(path.join(root, "capitals.html"), "utf8");
  html = replaceContainer(html, "capital-list", inner);
  write("capitals.html", html);
}

// ---- flags.html: motif-grouped, all colors ----
{
  const countryMap = new Map(countries.map((c) => [c.code, c]));
  const flagCard = (code) => {
    const c = countryMap.get(code);
    if (!c) return "";
    return `
      <a class="country-card" href="${countryUrl(c)}">
        <img class="flag" src="assets/flags/${code}.svg" alt="${c.nameEn}の国旗" loading="lazy" />
        <h3>${c.name}</h3>
        <p>${c.nameEn}</p>
      </a>`;
  };
  const inner = motifs
    .map((m) => {
      if (m.countries.length === 0) return "";
      return `
      <div id="motif-${m.key}" class="motif-block">
        <div class="letter-group-title">${m.label}(${m.countries.length}か国)</div>
        <p class="section-intro">${m.meaning}</p>
        <div class="country-grid">${m.countries.map(flagCard).join("")}</div>
      </div>`;
    })
    .join("");

  let html = fs.readFileSync(path.join(root, "flags.html"), "utf8");
  html = replaceContainer(html, "motif-list", inner);
  write("flags.html", html);
}

// ---- culture.html / food.html / words.html (category-list.js patterns) ----
function categorySnippet(country, fields) {
  const parts = fields
    .map((f) => {
      const v = country[f];
      if (Array.isArray(v)) return v.slice(0, 3).join("、");
      return v;
    })
    .filter(Boolean);
  return parts.length ? parts.join(" ／ ") : "準備中";
}
function firstItem(value) {
  if (Array.isArray(value)) return value[0] || "";
  if (typeof value === "string") return value.split(/[、,]/)[0].trim();
  return "";
}
function categoryCard(country, fields) {
  return `
    <a class="country-card" href="${countryUrl(country)}">
      <img class="flag" src="assets/flags/${country.code}.svg" alt="${country.nameEn}の国旗" loading="lazy" />
      <h3>${country.name}</h3>
      <p>${categorySnippet(country, fields)}</p>
    </a>`;
}
function primaryCard(country, primaryField) {
  const primary = firstItem(country[primaryField]) || "準備中";
  return `
    <a class="country-card" href="${countryUrl(country)}">
      <img class="flag" src="assets/flags/${country.code}.svg" alt="${country.nameEn}の国旗" loading="lazy" />
      <h3>${primary}</h3>
      <p>${country.name}(${country.nameEn})</p>
    </a>`;
}
function buildCategoryListInner(config) {
  if (config.primaryField) {
    const sorted = [...countries]
      .filter((c) => firstItem(c[config.primaryField]))
      .sort((a, b) => firstItem(a[config.primaryField]).localeCompare(firstItem(b[config.primaryField]), "ja"));
    return `<div class="country-grid">${sorted.map((c) => primaryCard(c, config.primaryField)).join("")}</div>`;
  }
  const sorted = [...countries].sort((a, b) => a.id - b.id);
  const groups = {};
  sorted.forEach((c) => {
    const letter = c.nameEn[0].toUpperCase();
    (groups[letter] = groups[letter] || []).push(c);
  });
  return Object.keys(groups)
    .sort()
    .map(
      (letter) => `
        <div id="letter-${letter}">
          <div class="letter-group-title">${letter}</div>
          <div class="country-grid">${groups[letter].map((c) => categoryCard(c, config.fields)).join("")}</div>
        </div>`
    )
    .join("");
}
{
  let html = fs.readFileSync(path.join(root, "culture.html"), "utf8");
  html = replaceContainer(html, "country-list", buildCategoryListInner({ fields: ["ethnicGroups", "proverb"] }));
  write("culture.html", html);
}
{
  let html = fs.readFileSync(path.join(root, "food.html"), "utf8");
  html = replaceContainer(html, "country-list", buildCategoryListInner({ primaryField: "food" }));
  write("food.html", html);
}
{
  let html = fs.readFileSync(path.join(root, "words.html"), "utf8");
  html = replaceContainer(html, "country-list", buildCategoryListInner({ primaryField: "languages" }));
  write("words.html", html);
}

// ---- animals.html: continent-grouped ("all") ----
{
  const countryMap = new Map(countries.map((c) => [c.code, c]));
  const ANIMAL_TYPE_ICONS = {
    "哺乳類": "🐾", "鳥類": "🐦", "爬虫類": "🦎", "両生類": "🐸", "魚類": "🐟", "甲殻類": "🦀", "軟体動物": "🐌",
  };
  const IUCN_LABELS = {
    "絶滅": "EX・絶滅", "野生絶滅": "EW・野生絶滅", "深刻な危機": "CR・深刻な危機", "危機": "EN・危機",
    "危急": "VU・危急", "準絶滅危惧": "NT・準絶滅危惧", "軽度懸念": "LC・軽度懸念", "データ不足": "DD・データ不足", "未評価": "NE・未評価",
  };
  function isoToFlagEmoji(iso2) {
    return iso2.toUpperCase().replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));
  }
  function animalMedia(a) {
    const icon = ANIMAL_TYPE_ICONS[a.type] || "🐾";
    return a.img
      ? `<img class="animal-photo" src="${a.img}" alt="${a.name}" loading="lazy" />`
      : `<div class="animal-photo-fallback">${icon}</div>`;
  }
  const animalCard = (a) => {
    const shown = a.countries.slice(0, 6).map(isoToFlagEmoji).join(" ");
    const more = a.countries.length > 6 ? ` 他${a.countries.length - 6}` : "";
    return `
    <a class="country-card animal-card" href="${animalUrl(a)}">
      ${animalMedia(a)}
      <h3>${a.name}</h3>
      <p>生息: ${shown}${more}</p>
      <span class="rarity-badge">${IUCN_LABELS[a.iucn] || a.iucn}</span>
    </a>`;
  };
  const inner = `<div class="country-grid">${animals.map(animalCard).join("")}</div>`;
  let html = fs.readFileSync(path.join(root, "animals.html"), "utf8");
  html = replaceContainer(html, "animal-list", inner);
  write("animals.html", html);
}

// ---- peoples.html: region-grouped ("all") ----
{
  function isoToFlagEmoji(iso2) {
    return iso2.toUpperCase().replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));
  }
  const peopleCard = (p) => {
    const flags = (p.countries || []).slice(0, 6).map(isoToFlagEmoji).join(" ");
    const media = p.img
      ? `<img class="animal-photo" src="${p.img}" alt="${p.name}" loading="lazy" />`
      : `<div class="animal-photo-fallback">🧑‍🤝‍🧑</div>`;
    return `
    <a class="country-card" href="${peopleUrl(p)}">
      ${media}
      <h3>${p.name}</h3>
      <p>${(p.region || []).join("・")} ・ ${flags}</p>
    </a>`;
  };
  const inner = `<div class="country-grid">${peoples.map(peopleCard).join("")}</div>`;
  let html = fs.readFileSync(path.join(root, "peoples.html"), "utf8");
  html = replaceContainer(html, "peoples-list", inner);
  write("peoples.html", html);
}

// ---- castles.html: continent-grouped ("all") ----
{
  const countryMap = new Map(countries.map((c) => [c.code, c]));
  const castleCard = (c) => {
    const country = countryMap.get(c.country);
    const media = c.img
      ? `<img class="animal-photo" src="${c.img}" alt="${c.name}" loading="lazy" />`
      : `<div class="animal-photo-fallback">🏰</div>`;
    return `
    <a class="country-card" href="${castleUrl(c)}">
      ${media}
      <h3>${c.name}</h3>
      <p>${country ? country.name : ""} ・ ${c.era || ""}</p>
    </a>`;
  };
  const inner = `<div class="country-grid">${castles.map(castleCard).join("")}</div>`;
  let html = fs.readFileSync(path.join(root, "castles.html"), "utf8");
  html = replaceContainer(html, "castles-list", inner);
  write("castles.html", html);
}

// ---- foodjapan.html: genre 1 (ちゃんとした食事・名物料理) as the default static view ----
{
  const dishes = require(path.join(root, "data/japan_food100.json"));
  const genreClass = { "ちゃんとした食事・名物料理": "g1", "B級グルメ・ご当地グルメ": "g2", "スイーツ・和菓子": "g3", "コンビニ・スーパーグルメ": "g4", "飲み物・お酒": "g5" };
  const firstGenre = "ちゃんとした食事・名物料理";
  const items = dishes.filter((d) => d.genre === firstGenre).sort((a, b) => a.rank - b.rank);

  const dishCard = (item) => {
    const cls = genreClass[item.genre];
    const sourcesHtml = (item.sources || [])
      .map((s) => `<a href="${s.url}" target="_blank" rel="noopener">出典</a>`)
      .join(" ");
    return `
    <div class="dish-rank ${cls}">
      <div class="dish-plate">${item.rank}</div>
      <div class="dish-body">
        <h3>${item.name}</h3>
        <div class="dish-en">${item.nameEn}</div>
        <p class="dish-desc">${item.description}</p>
        <div class="dish-evidence">
          <span class="dish-evidence-label">根拠:</span>${item.evidence}
          <div class="dish-src">${sourcesHtml}</div>
        </div>
      </div>
    </div>`;
  };
  const inner = `<div class="dish-list">${items.map(dishCard).join("")}</div>`;

  let html = fs.readFileSync(path.join(root, "foodjapan.html"), "utf8");
  html = replaceContainer(html, "foodjapan-list", inner);
  write("foodjapan.html", html);
}

// ---- spotjapan.html: genre 1 (定番観光名所・寺社仏閣) as the default static view ----
{
  const spots = require(path.join(root, "data/japan_spot100.json"));
  const genreClass = {
    "定番観光名所・寺社仏閣": "g1",
    "自然・絶景スポット": "g2",
    "テーマパーク・エンタメ施設": "g3",
    "体験・癒し施設": "g4",
    "ショッピング・街歩きエリア": "g5",
  };
  const firstGenre = "定番観光名所・寺社仏閣";
  const items = spots.filter((d) => d.genre === firstGenre).sort((a, b) => a.rank - b.rank);

  const spotCard = (item) => {
    const cls = genreClass[item.genre];
    const sourcesHtml = (item.sources || [])
      .map((s) => `<a href="${s.url}" target="_blank" rel="noopener">出典</a>`)
      .join(" ");
    return `
    <div class="spot-rank ${cls}">
      <div class="spot-plate">${item.rank}</div>
      <div class="spot-body">
        <h3>${item.name}</h3>
        <div class="spot-en">${item.nameEn} ・ ${item.location || ""}</div>
        <p class="spot-desc">${item.description}</p>
        <div class="spot-evidence">
          <span class="spot-evidence-label">根拠:</span>${item.evidence}
          <div class="spot-src">${sourcesHtml}</div>
        </div>
      </div>
    </div>`;
  };
  const inner = `<div class="dish-list">${items.map(spotCard).join("")}</div>`;

  let html = fs.readFileSync(path.join(root, "spotjapan.html"), "utf8");
  html = replaceContainer(html, "spotjapan-list", inner);
  write("spotjapan.html", html);
}

console.log("list pages updated:", filesWritten);
