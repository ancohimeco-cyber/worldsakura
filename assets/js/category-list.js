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
    <a class="country-card" href="country.html?id=${country.id}">
      <img class="flag" src="assets/flags/${country.code}.svg" alt="${country.nameEn}の国旗" loading="lazy" />
      <h3>${country.name}</h3>
      <p>${categorySnippet(country, fields)}</p>
    </a>`;
}

function primaryCard(country, primaryField) {
  const primary = firstItem(country[primaryField]) || "準備中";
  return `
    <a class="country-card" href="country.html?id=${country.id}">
      <img class="flag" src="assets/flags/${country.code}.svg" alt="${country.nameEn}の国旗" loading="lazy" />
      <h3>${primary}</h3>
      <p>${country.name}(${country.nameEn})</p>
    </a>`;
}

async function renderCategoryList(config) {
  const countries = await fetchCountries();
  const nav = document.getElementById("alpha-nav");
  const container = document.getElementById("country-list");
  if (!container) return;

  if (config.primaryField) {
    // 代表項目(例: 代表料理・代表言語)の五十音順で、国ではなくその項目を主役に表示
    const sorted = [...countries]
      .filter((c) => firstItem(c[config.primaryField]))
      .sort((a, b) => firstItem(a[config.primaryField]).localeCompare(firstItem(b[config.primaryField]), "ja"));
    container.innerHTML = `<div class="country-grid">${sorted.map((c) => primaryCard(c, config.primaryField)).join("")}</div>`;
    const countEl = document.getElementById("category-count");
    if (countEl) countEl.textContent = `${sorted.length}か国を表示中`;
    return;
  }

  if (nav) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    nav.innerHTML = letters.map((l) => `<a href="#letter-${l}">${l}</a>`).join("");
  }

  const sorted = [...countries].sort((a, b) => a.id - b.id);
  const groups = {};
  sorted.forEach((c) => {
    const letter = c.nameEn[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(c);
  });

  container.innerHTML = Object.keys(groups)
    .sort()
    .map((letter) => {
      const cards = groups[letter].map((c) => categoryCard(c, config.fields)).join("");
      return `
        <div id="letter-${letter}">
          <div class="letter-group-title">${letter}</div>
          <div class="country-grid">${cards}</div>
        </div>`;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderCategoryList(window.CATEGORY_CONFIG || { fields: [] });
});
