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

function categoryCard(country, fields) {
  return `
    <a class="country-card" href="country.html?id=${country.id}">
      <img class="flag" src="assets/flags/${country.code}.svg" alt="${country.nameEn}の国旗" loading="lazy" />
      <h3>${country.name}</h3>
      <p>${categorySnippet(country, fields)}</p>
    </a>`;
}

async function renderCategoryList(config) {
  const countries = await fetchCountries();
  const nav = document.getElementById("alpha-nav");
  const container = document.getElementById("country-list");

  if (nav) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    nav.innerHTML = letters.map((l) => `<a href="#letter-${l}">${l}</a>`).join("");
  }
  if (!container) return;

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
